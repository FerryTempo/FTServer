import fs from 'fs';
import crypto from 'crypto';
import { getNotificationText } from './NotificationText.js';

const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token';
const REQUEST_TIMEOUT_MS = 15000;
// The Android app's notification channel (FerryPush.CHANNEL).
const ANDROID_CHANNEL_ID = 'sailing_pings';
// FCM error codes meaning the token will never work again.
const INVALID_TOKEN_ERRORS = ['UNREGISTERED', 'SENDER_ID_MISMATCH'];

function base64UrlEncode(value) {
  return Buffer.from(value)
      .toString('base64')
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '');
}

/**
 * Sends Android notifications through Firebase Cloud Messaging (HTTP v1).
 *
 * Authenticates with a Firebase service account key, read from the JSON file at FCM_SERVICE_ACCOUNT_PATH
 * (on Render, a Secret File at /etc/secrets/...) or from FCM_SERVICE_ACCOUNT_JSON. Without either, Android
 * delivery is disabled and sends are skipped.
 */
class FcmClient {
  constructor(logger, fetchImpl = globalThis.fetch) {
    this.logger = logger;
    this.fetch = fetchImpl;
    this.serviceAccount = undefined;
    this.accessToken = null;
    this.accessTokenExpiresAt = 0;
    this.warnedDisabled = false;
  }

  async sendNotification(deviceToken, payload) {
    const serviceAccount = this.getServiceAccount();
    if (!serviceAccount) {
      if (!this.warnedDisabled) {
        this.logger?.warn('FCM disabled (no FCM_SERVICE_ACCOUNT_PATH); Android notifications are not sent.');
        this.warnedDisabled = true;
      }
      return { sent: false, disabled: true };
    }

    const response = await this.request(
        `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
        {
          method: 'POST',
          headers: {
            'authorization': `Bearer ${await this.getAccessToken(serviceAccount)}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ message: this.buildMessage(deviceToken, payload) }),
        },
    );
    if (response.ok) {
      return { sent: true };
    }

    const body = await response.json().catch(() => null);
    const errorCode = body?.error?.details?.find((detail) => detail.errorCode)?.errorCode;
    const reason = errorCode || body?.error?.status || `FCM status ${response.status}`;
    if (INVALID_TOKEN_ERRORS.includes(errorCode)) {
      return { sent: false, invalidToken: true, reason };
    }
    if (response.status === 401) {
      // A revoked or expired access token; fetch a new one next time.
      this.accessToken = null;
    }

    throw new Error(`FCM delivery failed: ${reason}`);
  }

  buildMessage(deviceToken, payload) {
    const { title, body } = getNotificationText(payload);
    // FCM data values must be strings.
    const data = {};
    for (const key of ['routeId', 'direction', 'scheduledDeparture', 'triggerKey']) {
      if (payload[key] !== undefined && payload[key] !== null) {
        data[key] = String(payload[key]);
      }
    }

    return {
      token: deviceToken,
      notification: { title, body },
      data,
      android: {
        priority: 'HIGH',
        notification: {
          channel_id: ANDROID_CHANNEL_ID,
          sound: 'default',
        },
      },
    };
  }

  getServiceAccount() {
    if (this.serviceAccount !== undefined) {
      return this.serviceAccount;
    }

    let json = process.env.FCM_SERVICE_ACCOUNT_JSON;
    if (!json && process.env.FCM_SERVICE_ACCOUNT_PATH) {
      try {
        json = fs.readFileSync(process.env.FCM_SERVICE_ACCOUNT_PATH, 'utf8');
      } catch (error) {
        this.logger?.error(`Could not read FCM_SERVICE_ACCOUNT_PATH: ${error.message}`);
      }
    }

    this.serviceAccount = null;
    if (json) {
      try {
        const account = JSON.parse(json);
        if (account.project_id && account.client_email && account.private_key) {
          this.serviceAccount = account;
        } else {
          this.logger?.error('FCM service account is missing project_id, client_email or private_key.');
        }
      } catch (error) {
        this.logger?.error(`FCM service account is not valid JSON: ${error.message}`);
      }
    }
    return this.serviceAccount;
  }

  async getAccessToken(serviceAccount) {
    const now = Math.floor(Date.now() / 1000);
    if (this.accessToken && now < this.accessTokenExpiresAt - 60) {
      return this.accessToken;
    }

    const tokenUri = serviceAccount.token_uri || DEFAULT_TOKEN_URI;
    const signingInput = [
      base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })),
      base64UrlEncode(JSON.stringify({
        iss: serviceAccount.client_email,
        scope: FCM_SCOPE,
        aud: tokenUri,
        iat: now,
        exp: now + 3600,
      })),
    ].join('.');
    const signature = crypto.sign('sha256', Buffer.from(signingInput), serviceAccount.private_key);

    const response = await this.request(tokenUri, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${signingInput}.${base64UrlEncode(signature)}`,
      }).toString(),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.access_token) {
      throw new Error(`FCM authorization failed: ${body?.error_description || body?.error || response.status}`);
    }

    this.accessToken = body.access_token;
    this.accessTokenExpiresAt = now + (body.expires_in || 3600);
    return this.accessToken;
  }

  request(url, options) {
    return this.fetch(url, { ...options, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  }
}

export default FcmClient;
