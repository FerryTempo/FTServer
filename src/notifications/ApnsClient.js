class ApnsClient {
  constructor(logger) {
    this.logger = logger;
  }

  async sendNotification(deviceToken, payload) {
    if (!process.env.APNS_ENABLED || process.env.APNS_ENABLED === 'false') {
      this.logger?.debug(`APNs disabled; would send notification ${JSON.stringify(payload)}`);
      return { sent: false, disabled: true };
    }

    throw new Error('APNs delivery is not implemented yet.');
  }
}

export default ApnsClient;

