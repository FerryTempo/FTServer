import express from 'express';
import validator from 'validator';
import routeFTData from '../../data/RouteFTData.js';
import {
  allowedEtaMinutes,
  notificationRecurrences,
  notificationTriggerTypes,
} from './NotificationTypes.js';
import { getScheduledDepartureTimeKey } from './NotificationEvaluator.js';

function cleanString(value) {
  return validator.escape(`${value ?? ''}`.trim());
}

function parsePositiveInteger(value) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return null;
  }
  return numberValue;
}

function validateSubscription(body) {
  const routeId = cleanString(body.routeId);
  const direction = cleanString(body.direction);
  const triggerType = cleanString(body.triggerType);
  const recurrence = cleanString(body.recurrence || notificationRecurrences.once);
  const scheduledDeparture = parsePositiveInteger(body.scheduledDeparture);
  const triggerMinutes = triggerType === notificationTriggerTypes.eta ?
    parsePositiveInteger(body.triggerMinutes) :
    null;

  if (!routeFTData.hasOwnProperty(routeId)) {
    return { error: 'Unknown routeId.' };
  }
  if (!['ES', 'WN'].includes(direction)) {
    return { error: 'direction must be ES or WN.' };
  }
  if (!Object.values(notificationTriggerTypes).includes(triggerType)) {
    return { error: 'Unsupported triggerType.' };
  }
  if (triggerType === notificationTriggerTypes.eta && !allowedEtaMinutes.includes(triggerMinutes)) {
    return { error: 'triggerMinutes must be one of the supported ETA buckets.' };
  }
  if (!Object.values(notificationRecurrences).includes(recurrence)) {
    return { error: 'recurrence must be once or daily.' };
  }
  if (!scheduledDeparture) {
    return { error: 'scheduledDeparture must be an epoch timestamp in seconds.' };
  }

  return {
    subscription: {
      deviceId: cleanString(body.deviceId),
      routeId,
      direction,
      departingTerminalAbbrev: cleanString(body.departingTerminalAbbrev),
      arrivingTerminalAbbrev: cleanString(body.arrivingTerminalAbbrev),
      scheduledDeparture,
      scheduledDepartureTimeKey: getScheduledDepartureTimeKey(scheduledDeparture),
      triggerType,
      triggerMinutes,
      recurrence,
    },
  };
}

export function createNotificationRouter(store, liveActivityStore) {
  const router = express.Router();

  router.post('/register-token', (req, res) => {
    const deviceId = cleanString(req.body.deviceId);
    const token = cleanString(req.body.token);
    const platform = cleanString(req.body.platform || 'ios');
    const environment = cleanString(req.body.environment || 'production');

    if (!deviceId || !token) {
      res.status(400).json({ error: 'deviceId and token are required.' });
      return;
    }
    if (!['ios', 'android'].includes(platform)) {
      res.status(400).json({ error: 'platform must be ios or android.' });
      return;
    }
    if (!['sandbox', 'production'].includes(environment)) {
      res.status(400).json({ error: 'environment must be sandbox or production.' });
      return;
    }

    store.upsertPushToken({
      deviceId,
      token,
      platform,
      environment,
      appVersion: cleanString(req.body.appVersion),
    });
    res.status(204).end();
  });

  router.post('/subscriptions', (req, res) => {
    const { subscription, error } = validateSubscription(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }
    if (!subscription.deviceId) {
      res.status(400).json({ error: 'deviceId is required.' });
      return;
    }

    // One or the other: a one-time ping ends the sailing's Live Activity.
    if (subscription.recurrence === notificationRecurrences.once) {
      liveActivityStore?.endForSailing(subscription.deviceId, subscription.routeId, subscription.scheduledDeparture);
    }
    res.status(201).json(store.createSubscription(subscription));
  });

  router.get('/subscriptions/:deviceId', (req, res) => {
    res.json(store.getSubscriptionsForDevice(cleanString(req.params.deviceId)));
  });

  router.delete('/subscriptions/:subscriptionId', (req, res) => {
    const subscriptionId = parsePositiveInteger(req.params.subscriptionId);
    const deviceId = cleanString(req.query.deviceId);
    if (!subscriptionId || !deviceId) {
      res.status(400).json({ error: 'subscriptionId and deviceId are required.' });
      return;
    }

    if (!store.deactivateSubscription(subscriptionId, deviceId)) {
      res.status(404).json({ error: 'Subscription not found.' });
      return;
    }
    res.status(204).end();
  });

  router.post('/live-activities/start-token', (req, res) => {
    const deviceId = cleanString(req.body.deviceId);
    const token = cleanString(req.body.token);
    const environment = cleanString(req.body.environment || 'production');
    if (!deviceId || !token || !['sandbox', 'production'].includes(environment)) {
      res.status(400).json({ error: 'deviceId, token and a sandbox or production environment are required.' });
      return;
    }

    liveActivityStore.upsertStartToken({ deviceId, token, environment });
    res.status(204).end();
  });

  // A tracked sailing. startedOnDevice: the app already started the activity (it sends its token next);
  // otherwise the server starts it with push-to-start before departure.
  router.post('/live-activities', (req, res) => {
    const deviceId = cleanString(req.body.deviceId);
    const routeId = cleanString(req.body.routeId);
    const direction = cleanString(req.body.direction);
    const environment = cleanString(req.body.environment || 'production');
    const scheduledDeparture = parsePositiveInteger(req.body.scheduledDeparture);
    if (!deviceId || !routeFTData.hasOwnProperty(routeId) || !['ES', 'WN'].includes(direction) ||
        !scheduledDeparture || !['sandbox', 'production'].includes(environment)) {
      res.status(400).json({ error: 'deviceId, routeId, direction, scheduledDeparture and environment are required.' });
      return;
    }

    // One or the other: Live replaces the sailing's one-time pings (daily ones stay, and
    // are skipped while Live runs).
    store.deactivateOnceSubscriptionsForSailing(deviceId, routeId, scheduledDeparture);
    const id = liveActivityStore.create({
      deviceId,
      environment,
      routeId,
      direction,
      departingTerminalAbbrev: cleanString(req.body.departingTerminalAbbrev),
      departingName: cleanString(req.body.departingName),
      arrivingName: cleanString(req.body.arrivingName),
      scheduledDeparture,
      status: req.body.startedOnDevice === true ? 'started' : 'pending',
    });
    res.status(201).json({ id: Number(id) });
  });

  router.post('/live-activities/:id/token', (req, res) => {
    const id = parsePositiveInteger(req.params.id);
    const deviceId = cleanString(req.body.deviceId);
    const token = cleanString(req.body.token);
    if (!id || !deviceId || !token) {
      res.status(400).json({ error: 'id, deviceId and token are required.' });
      return;
    }
    if (!liveActivityStore.setUpdateToken(id, deviceId, token)) {
      res.status(404).json({ error: 'Live Activity not found.' });
      return;
    }
    res.status(204).end();
  });

  router.delete('/live-activities', (req, res) => {
    const deviceId = cleanString(req.query.deviceId);
    const routeId = cleanString(req.query.routeId);
    const scheduledDeparture = parsePositiveInteger(req.query.scheduledDeparture);
    if (!deviceId || !routeId || !scheduledDeparture) {
      res.status(400).json({ error: 'deviceId, routeId and scheduledDeparture are required.' });
      return;
    }
    liveActivityStore.endForSailing(deviceId, routeId, scheduledDeparture);
    res.status(204).end();
  });

  return router;
}

