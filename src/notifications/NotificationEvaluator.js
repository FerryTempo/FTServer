import {
  getTriggerKey,
  notificationRecurrences,
  notificationTriggerTypes,
} from './NotificationTypes.js';

export function getScheduledDepartureTimeKey(epochSeconds) {
  const dateParts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(epochSeconds * 1000)).map((datePart) => [datePart.type, datePart.value]));

  return `${dateParts.hour}:${dateParts.minute}`;
}

function getSailingKey(sailing) {
  return [
    sailing.routeId,
    sailing.direction,
    sailing.scheduledDeparture,
  ].join(':');
}

function getTriggeredKeys(boat) {
  const triggeredKeys = [];
  if (boat.LeftDock && boat.AtDock === false) {
    triggeredKeys.push(getTriggerKey(notificationTriggerTypes.departed));
  }

  if (Number.isFinite(boat.ArrivalTimeMinus) && boat.ArrivalTimeMinus > 0) {
    for (const minutes of [30, 25, 20, 15, 10, 5]) {
      if (boat.ArrivalTimeMinus <= minutes * 60) {
        triggeredKeys.push(getTriggerKey(notificationTriggerTypes.eta, minutes));
      }
    }
  }

  return triggeredKeys;
}

class NotificationEvaluator {
  constructor(store, apnsClient, logger) {
    this.store = store;
    this.apnsClient = apnsClient;
    this.logger = logger;
  }

  async process(ferryTempoData, observedAt = Math.floor(Date.now() / 1000)) {
    if (!ferryTempoData || typeof ferryTempoData !== 'object') {
      return;
    }

    for (const routeId in ferryTempoData) {
      const routeData = ferryTempoData[routeId];
      const boatData = routeData?.boatData || {};
      for (const boatId in boatData) {
        await this.processBoat(routeId, boatData[boatId], observedAt);
      }
    }
  }

  async processBoat(routeId, boat, observedAt) {
    if (!boat?.ScheduledDeparture || !boat.Direction) {
      return;
    }

    const sailing = {
      routeId,
      direction: boat.Direction,
      departingTerminalAbbrev: boat.DepartingTerminalAbbrev || '',
      arrivingTerminalAbbrev: boat.ArrivingTerminalAbbrev || '',
      scheduledDeparture: boat.ScheduledDeparture,
      scheduledDepartureTimeKey: getScheduledDepartureTimeKey(boat.ScheduledDeparture),
    };
    const triggeredKeys = new Set(getTriggeredKeys(boat));
    if (triggeredKeys.size === 0) {
      return;
    }

    const subscriptions = this.store.getActiveSubscriptionsForSailing(sailing);
    for (const subscription of subscriptions) {
      const triggerKey = getTriggerKey(subscription.triggerType, subscription.triggerMinutes);
      if (!triggeredKeys.has(triggerKey)) {
        continue;
      }

      const dedupeKey = [
        subscription.id,
        getSailingKey(sailing),
        triggerKey,
      ].join(':');
      const shouldSend = this.store.recordFiredNotification({
        dedupeKey,
        subscriptionId: subscription.id,
        deviceId: subscription.deviceId,
        routeId,
        direction: boat.Direction,
        scheduledDeparture: boat.ScheduledDeparture,
        triggerKey,
        firedAt: observedAt,
      });

      if (!shouldSend) {
        continue;
      }

      const delivered = await this.sendSubscriptionNotification(subscription, sailing, boat, triggerKey);
      if (!delivered) {
        this.store.removeFiredNotification(dedupeKey);
      }
    }
  }

  async sendSubscriptionNotification(subscription, sailing, boat, triggerKey) {
    try {
      const result = await this.apnsClient.sendNotification(subscription.token, {
        deviceId: subscription.deviceId,
        routeId: sailing.routeId,
        direction: sailing.direction,
        scheduledDeparture: sailing.scheduledDeparture,
        recurrence: subscription.recurrence || notificationRecurrences.once,
        triggerKey,
        vesselName: boat.VesselName || '',
      }, {
        environment: subscription.environment,
      });

      if (result?.invalidToken) {
        this.store.markTokenDisabled(subscription.deviceId);
        this.logger?.warn(
            `Disabled APNs token for device ${subscription.deviceId}: ${result.reason}`,
        );
        return true;
      }

      return result?.sent === true;
    } catch (error) {
      this.logger?.error(`Notification delivery failed: ${error.message}`);
      return false;
    }
  }
}

export default NotificationEvaluator;
