import NotificationStore from '../src/notifications/NotificationStore.js';
import NotificationEvaluator, {
  getScheduledDepartureTimeKey,
} from '../src/notifications/NotificationEvaluator.js';
import {
  notificationRecurrences,
  notificationTriggerTypes,
} from '../src/notifications/NotificationTypes.js';

function buildFerryTempoData(scheduledDeparture, overrides = {}) {
  return {
    'sea-bi': {
      boatData: {
        boat1: {
          Direction: 'ES',
          DepartingTerminalAbbrev: 'Bain',
          ArrivingTerminalAbbrev: 'Sea',
          ScheduledDeparture: scheduledDeparture,
          LeftDock: scheduledDeparture + 120,
          AtDock: false,
          ArrivalTimeMinus: 600,
          VesselName: 'Test Ferry',
          ...overrides,
        },
      },
    },
  };
}

describe('NotificationEvaluator', () => {
  let store;
  let sentNotifications;
  let sendOptions;
  let evaluator;

  beforeEach(() => {
    store = new NotificationStore(':memory:');
    sentNotifications = [];
    sendOptions = [];
    evaluator = new NotificationEvaluator(store, {
      sendNotification: async (token, payload, options) => {
        sentNotifications.push({ token, payload });
        sendOptions.push(options);
        return { sent: true };
      },
    });

    store.upsertPushToken({
      deviceId: 'device-1',
      platform: 'ios',
      token: 'apns-token',
      environment: 'sandbox',
    });
  });

  afterEach(() => {
    store.close();
  });

  test('sends a once subscription only for the matching scheduled departure', async () => {
    const scheduledDeparture = 1768500000;
    store.createSubscription({
      deviceId: 'device-1',
      routeId: 'sea-bi',
      direction: 'ES',
      departingTerminalAbbrev: 'Bain',
      arrivingTerminalAbbrev: 'Sea',
      scheduledDeparture,
      scheduledDepartureTimeKey: getScheduledDepartureTimeKey(scheduledDeparture),
      triggerType: notificationTriggerTypes.departed,
      triggerMinutes: null,
      recurrence: notificationRecurrences.once,
    });

    await evaluator.process(buildFerryTempoData(scheduledDeparture + 600));
    expect(sentNotifications).toHaveLength(0);

    await evaluator.process(buildFerryTempoData(scheduledDeparture));
    expect(sentNotifications).toHaveLength(1);
    expect(sentNotifications[0].payload).toMatchObject({
      routeId: 'sea-bi',
      direction: 'ES',
      scheduledDeparture,
      triggerKey: 'departed',
    });
    expect(sendOptions[0]).toEqual({ environment: 'sandbox' });
  });

  test('daily subscriptions match the same Pacific scheduled departure time', async () => {
    const scheduledDeparture = 1768500000;
    const nextDayDeparture = scheduledDeparture + 86400;
    store.createSubscription({
      deviceId: 'device-1',
      routeId: 'sea-bi',
      direction: 'ES',
      departingTerminalAbbrev: 'Bain',
      arrivingTerminalAbbrev: 'Sea',
      scheduledDeparture,
      scheduledDepartureTimeKey: getScheduledDepartureTimeKey(scheduledDeparture),
      triggerType: notificationTriggerTypes.eta,
      triggerMinutes: 10,
      recurrence: notificationRecurrences.daily,
    });

    expect(getScheduledDepartureTimeKey(nextDayDeparture)).toBe(getScheduledDepartureTimeKey(scheduledDeparture));

    await evaluator.process(buildFerryTempoData(nextDayDeparture, {
      LeftDock: nextDayDeparture + 120,
      ArrivalTimeMinus: 600,
    }));

    expect(sentNotifications).toHaveLength(1);
    expect(sentNotifications[0].payload).toMatchObject({
      scheduledDeparture: nextDayDeparture,
      recurrence: 'daily',
      triggerKey: 'eta_10',
    });
  });

  test('does not send duplicate notifications for the same subscription and sailing', async () => {
    const scheduledDeparture = 1768500000;
    store.createSubscription({
      deviceId: 'device-1',
      routeId: 'sea-bi',
      direction: 'ES',
      departingTerminalAbbrev: 'Bain',
      arrivingTerminalAbbrev: 'Sea',
      scheduledDeparture,
      scheduledDepartureTimeKey: getScheduledDepartureTimeKey(scheduledDeparture),
      triggerType: notificationTriggerTypes.eta,
      triggerMinutes: 10,
      recurrence: notificationRecurrences.once,
    });

    await evaluator.process(buildFerryTempoData(scheduledDeparture));
    await evaluator.process(buildFerryTempoData(scheduledDeparture, {
      ArrivalTimeMinus: 540,
    }));

    expect(sentNotifications).toHaveLength(1);
  });

  test('disables tokens that APNs reports as invalid', async () => {
    evaluator = new NotificationEvaluator(store, {
      sendNotification: async () => ({ sent: false, invalidToken: true, reason: 'BadDeviceToken' }),
    });
    const scheduledDeparture = 1768500000;
    store.createSubscription({
      deviceId: 'device-1',
      routeId: 'sea-bi',
      direction: 'ES',
      departingTerminalAbbrev: 'Bain',
      arrivingTerminalAbbrev: 'Sea',
      scheduledDeparture,
      scheduledDepartureTimeKey: getScheduledDepartureTimeKey(scheduledDeparture),
      triggerType: notificationTriggerTypes.departed,
      triggerMinutes: null,
      recurrence: notificationRecurrences.once,
    });

    await evaluator.process(buildFerryTempoData(scheduledDeparture));

    const tokenRow = store.db.prepare(`
      SELECT disabled
      FROM PushTokens
      WHERE deviceId = ?
    `).get('device-1');
    expect(tokenRow.disabled).toBe(1);
  });

  test('retries a notification when APNs delivery fails temporarily', async () => {
    let attempts = 0;
    evaluator = new NotificationEvaluator(store, {
      sendNotification: async () => {
        attempts += 1;
        if (attempts === 1) {
          throw new Error('Provider token failed');
        }
        return { sent: true };
      },
    });
    const scheduledDeparture = 1768500000;
    store.createSubscription({
      deviceId: 'device-1',
      routeId: 'sea-bi',
      direction: 'ES',
      departingTerminalAbbrev: 'Bain',
      arrivingTerminalAbbrev: 'Sea',
      scheduledDeparture,
      scheduledDepartureTimeKey: getScheduledDepartureTimeKey(scheduledDeparture),
      triggerType: notificationTriggerTypes.departed,
      triggerMinutes: null,
      recurrence: notificationRecurrences.once,
    });

    await evaluator.process(buildFerryTempoData(scheduledDeparture));
    await evaluator.process(buildFerryTempoData(scheduledDeparture));

    expect(attempts).toBe(2);
  });
});
