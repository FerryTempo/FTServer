import crypto from 'crypto';
import FcmClient from '../src/notifications/FcmClient.js';
import PushClients from '../src/notifications/PushClients.js';

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const serviceAccount = {
  project_id: 'ferrytempo-test',
  client_email: 'push@ferrytempo-test.iam.gserviceaccount.com',
  private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
  token_uri: 'https://oauth2.example.test/token',
};

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function buildFetch(sendResponse) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (url === serviceAccount.token_uri) {
      return jsonResponse(200, { access_token: 'access-1', expires_in: 3600 });
    }
    return sendResponse;
  };
  return { calls, fetchImpl };
}

const payload = {
  routeId: 'sea-bi',
  direction: 'ES',
  scheduledDeparture: 1791500000,
  triggerKey: 'eta_10',
  vesselName: 'Wenatchee',
};

describe('FcmClient', () => {
  const savedEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.FCM_SERVICE_ACCOUNT_PATH;
    process.env.FCM_SERVICE_ACCOUNT_JSON = JSON.stringify(serviceAccount);
  });

  afterEach(() => {
    process.env = { ...savedEnv };
  });

  test('skips sending when no service account is configured', async () => {
    delete process.env.FCM_SERVICE_ACCOUNT_JSON;
    const { calls, fetchImpl } = buildFetch(jsonResponse(200, {}));
    const client = new FcmClient(null, fetchImpl);

    await expect(client.sendNotification('token', payload)).resolves.toEqual({ sent: false, disabled: true });
    expect(calls).toHaveLength(0);
  });

  test('authorizes with a signed service account JWT and sends to the project', async () => {
    const { calls, fetchImpl } = buildFetch(jsonResponse(200, { name: 'projects/x/messages/1' }));
    const client = new FcmClient(null, fetchImpl);

    await expect(client.sendNotification('device-token', payload)).resolves.toEqual({ sent: true });

    const assertion = new URLSearchParams(calls[0].options.body).get('assertion');
    const [header, claims, signature] = assertion.split('.');
    const verified = crypto.verify(
        'sha256',
        Buffer.from(`${header}.${claims}`),
        publicKey,
        Buffer.from(signature, 'base64url'),
    );
    expect(verified).toBe(true);
    const decodedClaims = JSON.parse(Buffer.from(claims, 'base64url').toString());
    expect(decodedClaims.iss).toBe(serviceAccount.client_email);
    expect(decodedClaims.aud).toBe(serviceAccount.token_uri);
    expect(decodedClaims.scope).toBe('https://www.googleapis.com/auth/firebase.messaging');

    expect(calls[1].url).toBe('https://fcm.googleapis.com/v1/projects/ferrytempo-test/messages:send');
    expect(calls[1].options.headers.authorization).toBe('Bearer access-1');
    const { message } = JSON.parse(calls[1].options.body);
    expect(message.token).toBe('device-token');
    expect(message.notification).toEqual({
      title: 'FerryTempo',
      body: 'Wenatchee is about 10 minutes from dock.',
    });
    expect(message.data).toEqual({
      routeId: 'sea-bi',
      direction: 'ES',
      scheduledDeparture: '1791500000',
      triggerKey: 'eta_10',
    });
    expect(message.android.notification.channel_id).toBe('sailing_pings');
  });

  test('reuses the access token across sends', async () => {
    const { calls, fetchImpl } = buildFetch(jsonResponse(200, {}));
    const client = new FcmClient(null, fetchImpl);

    await client.sendNotification('a', payload);
    await client.sendNotification('b', payload);

    expect(calls.filter((call) => call.url === serviceAccount.token_uri)).toHaveLength(1);
  });

  test('reports an unregistered token as invalid', async () => {
    const { fetchImpl } = buildFetch(jsonResponse(404, {
      error: {
        status: 'NOT_FOUND',
        details: [{ '@type': 'type.googleapis.com/google.firebase.fcm.v1.FcmError', 'errorCode': 'UNREGISTERED' }],
      },
    }));
    const client = new FcmClient(null, fetchImpl);

    await expect(client.sendNotification('stale', payload)).resolves.toEqual({
      sent: false,
      invalidToken: true,
      reason: 'UNREGISTERED',
    });
  });

  test('throws on other delivery failures so the notification is retried', async () => {
    const { fetchImpl } = buildFetch(jsonResponse(503, { error: { status: 'UNAVAILABLE' } }));
    const client = new FcmClient(null, fetchImpl);

    await expect(client.sendNotification('token', payload)).rejects.toThrow('FCM delivery failed: UNAVAILABLE');
  });
});

describe('PushClients', () => {
  test('routes each notification to its platform client', async () => {
    const sent = [];
    const clients = new PushClients({
      ios: { sendNotification: async (token) => sent.push(['ios', token]) },
      android: { sendNotification: async (token) => sent.push(['android', token]) },
    });

    await clients.sendNotification('apns-token', payload, { platform: 'ios' });
    await clients.sendNotification('fcm-token', payload, { platform: 'android' });
    await clients.sendNotification('legacy-token', payload, {});

    expect(sent).toEqual([['ios', 'apns-token'], ['android', 'fcm-token'], ['ios', 'legacy-token']]);
  });
});
