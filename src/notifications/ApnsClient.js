import fs from 'fs';
import http2 from 'http2';
import crypto from 'crypto';

function base64UrlEncode(value) {
  return Buffer.from(value)
      .toString('base64')
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '');
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for APNs delivery.`);
  }
  return value;
}

class ApnsClient {
  constructor(logger) {
    this.logger = logger;
    this.cachedJwt = null;
    this.cachedJwtIssuedAt = 0;
  }

  async sendNotification(deviceToken, payload, options = {}) {
    if (!process.env.APNS_ENABLED || process.env.APNS_ENABLED === 'false') {
      this.logger?.debug(`APNs disabled; would send notification ${JSON.stringify(payload)}`);
      return { sent: false, disabled: true };
    }

    const response = await this.sendApnsRequest(
        deviceToken,
        this.buildNotificationPayload(payload),
        options.environment,
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return { sent: true };
    }

    const reason = response.body?.reason || `APNs status ${response.statusCode}`;
    if (['BadDeviceToken', 'DeviceTokenNotForTopic', 'Unregistered'].includes(reason)) {
      return { sent: false, invalidToken: true, reason };
    }

    throw new Error(`APNs delivery failed: ${reason}`);
  }

  buildNotificationPayload(payload) {
    const title = payload.title || 'FerryTempo';
    const body = payload.body || this.defaultBody(payload);

    return {
      aps: {
        alert: {
          title,
          body,
        },
        sound: 'default',
      },
      routeId: payload.routeId,
      direction: payload.direction,
      scheduledDeparture: payload.scheduledDeparture,
      triggerKey: payload.triggerKey,
    };
  }

  defaultBody(payload) {
    if (payload.triggerKey === 'departed') {
      return `${payload.vesselName || 'Your ferry'} has departed.`;
    }

    if (payload.triggerKey?.startsWith('eta_')) {
      const minutes = payload.triggerKey.replace('eta_', '');
      return `${payload.vesselName || 'Your ferry'} is about ${minutes} minutes from dock.`;
    }

    return 'Your ferry notification is ready.';
  }

  sendApnsRequest(deviceToken, notificationPayload, environment) {
    return new Promise((resolve, reject) => {
      const production = environment ?
        environment === 'production' :
        process.env.APNS_PRODUCTION === 'true';
      const host = production ? 'api.push.apple.com' : 'api.sandbox.push.apple.com';
      const client = http2.connect(`https://${host}`);
      const body = JSON.stringify(notificationPayload);

      client.on('error', reject);

      const request = client.request({
        ':method': 'POST',
        ':path': `/3/device/${deviceToken}`,
        'authorization': `bearer ${this.getProviderToken()}`,
        'apns-topic': getRequiredEnv('APNS_BUNDLE_ID'),
        'apns-push-type': 'alert',
        'apns-priority': '10',
        'content-type': 'application/json',
      });

      let responseData = '';
      let statusCode = 0;

      request.setEncoding('utf8');
      request.on('response', (headers) => {
        statusCode = headers[':status'];
      });
      request.on('data', (chunk) => {
        responseData += chunk;
      });
      request.on('end', () => {
        client.close();
        let responseBody = null;
        if (responseData) {
          try {
            responseBody = JSON.parse(responseData);
          } catch (error) {
            responseBody = { reason: responseData };
          }
        }
        resolve({ statusCode, body: responseBody });
      });
      request.on('error', (error) => {
        client.close();
        reject(error);
      });

      request.end(body);
    });
  }

  getProviderToken() {
    const now = Math.floor(Date.now() / 1000);
    if (this.cachedJwt && now - this.cachedJwtIssuedAt < 50 * 60) {
      return this.cachedJwt;
    }

    const header = {
      alg: 'ES256',
      kid: getRequiredEnv('APNS_KEY_ID'),
    };
    const claims = {
      iss: getRequiredEnv('APNS_TEAM_ID'),
      iat: now,
    };
    const signingInput = [
      base64UrlEncode(JSON.stringify(header)),
      base64UrlEncode(JSON.stringify(claims)),
    ].join('.');
    const signature = crypto.sign('sha256', Buffer.from(signingInput), {
      key: this.getPrivateKey(),
      dsaEncoding: 'ieee-p1363',
    });

    this.cachedJwt = `${signingInput}.${base64UrlEncode(signature)}`;
    this.cachedJwtIssuedAt = now;
    return this.cachedJwt;
  }

  getPrivateKey() {
    if (process.env.APNS_KEY_CONTENT) {
      return process.env.APNS_KEY_CONTENT.replaceAll('\\n', '\n');
    }

    return fs.readFileSync(getRequiredEnv('APNS_KEY_PATH'), 'utf8');
  }
}

export default ApnsClient;
