import 'dotenv/config';
import ApnsClient from '../src/notifications/ApnsClient.js';

const deviceToken = process.argv[2];
if (!deviceToken) {
  console.error('Usage: node scripts/send-apns-test.js <apns-device-token>');
  process.exit(1);
}

const logger = {
  debug: console.log,
  error: console.error,
};
const client = new ApnsClient(logger);

async function main() {
  try {
    const result = await client.sendNotification(deviceToken, {
      title: 'FerryTempo Test',
      body: 'Sandbox APNs delivery is working.',
      routeId: 'sea-bi',
      direction: 'ES',
      scheduledDeparture: Math.floor(Date.now() / 1000),
      triggerKey: 'departed',
      vesselName: 'Test Ferry',
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
