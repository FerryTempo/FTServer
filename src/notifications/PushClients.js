/**
 * Routes each notification to the push service for its device's platform.
 */
class PushClients {
  constructor(clientsByPlatform) {
    this.clientsByPlatform = clientsByPlatform;
  }

  sendNotification(deviceToken, payload, options = {}) {
    const platform = options.platform || 'ios';
    const client = this.clientsByPlatform[platform];
    if (!client) {
      throw new Error(`No push client for platform ${platform}.`);
    }
    return client.sendNotification(deviceToken, payload, options);
  }
}

export default PushClients;
