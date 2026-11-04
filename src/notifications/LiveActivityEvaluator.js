// Drives Live Activities for tracked sailings from each processed snapshot: a push-to-start
// leadSeconds before departure, updates when the boat's state changes, and an end on arrival.

export const leadSeconds = 30 * 60;
const dismissSeconds = 10 * 60;
const startWindowSeconds = 60 * 60; // a sailing this late without a start is dropped
const maxLifeSeconds = 4 * 60 * 60; // safety end for a cancelled or untracked sailing

function roundToMinute(epochSeconds) {
  return Number.isFinite(epochSeconds) ? Math.round(epochSeconds / 60) * 60 : null;
}

function clockText(epochSeconds) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(epochSeconds * 1000));
}

function findBoat(ferryTempoData, activity) {
  const boats = Object.values(ferryTempoData?.[activity.routeId]?.boatData || {});
  return boats.find((boat) =>
    boat.ScheduledDeparture === activity.scheduledDeparture && boat.Direction === activity.direction,
  ) || null;
}

/**
 * The activity's content state (FerryActivityAttributes.ContentState on iOS). Times are minute-rounded
 * so second-level ETA drift doesn't push.
 */
export function buildContentState(boat, previous) {
  const wasUnderway = previous?.phase === 'underway' || previous?.phase === 'arrived';
  if (!boat || (boat.AtDock && wasUnderway)) {
    return wasUnderway ?
      { ...previous, phase: 'arrived' } :
      { phase: 'waiting', vesselName: null, leftDock: null, eta: null, departureDelay: null };
  }

  if (boat.AtDock) {
    return {
      phase: 'atDock',
      vesselName: boat.VesselName || null,
      leftDock: null,
      eta: null,
      departureDelay: Math.max(0, roundToMinute(boat.DepartureDelay) ?? 0),
    };
  }

  return {
    phase: 'underway',
    vesselName: boat.VesselName || null,
    leftDock: boat.LeftDock ?? boat.ObservedLeftDock ?? null,
    eta: roundToMinute(boat.ETA ?? boat.EstimatedETA),
    departureDelay: Math.max(0, roundToMinute(boat.DepartureDelay) ?? 0),
  };
}

class LiveActivityEvaluator {
  constructor(store, apnsClient, logger) {
    this.store = store;
    this.apnsClient = apnsClient;
    this.logger = logger;
    this.inFlight = false;
  }

  async process(ferryTempoData, now = Math.floor(Date.now() / 1000)) {
    if (this.inFlight || !ferryTempoData) {
      return;
    }
    this.inFlight = true;
    try {
      for (const activity of this.store.getOpen()) {
        await this.processActivity(activity, ferryTempoData, now);
      }
    } finally {
      this.inFlight = false;
    }
  }

  async processActivity(activity, ferryTempoData, now) {
    const previous = activity.contentState ? JSON.parse(activity.contentState) : null;
    const state = buildContentState(findBoat(ferryTempoData, activity), previous);

    if (activity.status === 'pending') {
      if (now < activity.scheduledDeparture - leadSeconds) {
        return;
      }
      if (!activity.startToken || now > activity.scheduledDeparture + startWindowSeconds) {
        this.store.update(activity.id, { status: 'ended' });
        return;
      }
      const result = await this.send(activity.startToken, this.startPayload(activity, state, now), activity, 10);
      if (result?.invalidToken) {
        this.store.removeStartToken(activity.deviceId);
        this.store.update(activity.id, { status: 'ended' });
      } else if (result?.sent) {
        this.store.update(activity.id, { status: 'started', contentState: JSON.stringify(state) });
      }
      return;
    }

    // Started: the phone sends the update token after the activity begins.
    if (!activity.updateToken) {
      return;
    }

    const expired = now > activity.scheduledDeparture + maxLifeSeconds;
    if (state.phase === 'arrived' || expired) {
      const result = await this.send(activity.updateToken, {
        'timestamp': now,
        'event': 'end',
        'content-state': state,
        'dismissal-date': now + dismissSeconds,
      }, activity, 10);
      if (result?.sent || result?.invalidToken) {
        this.store.update(activity.id, { status: 'ended', contentState: JSON.stringify(state) });
      }
      return;
    }

    if (JSON.stringify(state) === activity.contentState) {
      return;
    }

    // Only departure alerts; other changes update silently at low priority. An activity started
    // mid-crossing (no previous state) doesn't alert.
    const departed = state.phase === 'underway' && previous != null && previous.phase !== 'underway';
    const aps = { 'timestamp': now, 'event': 'update', 'content-state': state };
    if (departed) {
      aps.alert = {
        title: `${state.vesselName || 'Your boat'} left ${activity.departingName}`,
        body: state.eta ? `Arrives ${activity.arrivingName} ${clockText(state.eta)}` : `Bound for ${activity.arrivingName}`,
      };
    }
    const result = await this.send(activity.updateToken, aps, activity, departed ? 10 : 5);
    if (result?.invalidToken) {
      this.store.update(activity.id, { status: 'ended' });
    } else if (result?.sent) {
      this.store.update(activity.id, { contentState: JSON.stringify(state) });
    }
  }

  startPayload(activity, state, now) {
    return {
      'timestamp': now,
      'event': 'start',
      'content-state': state,
      'attributes-type': 'FerryActivityAttributes',
      'attributes': {
        trackingId: activity.id,
        routeId: activity.routeId,
        departingName: activity.departingName,
        arrivingName: activity.arrivingName,
        scheduledDeparture: activity.scheduledDeparture,
      },
      'alert': {
        title: `${activity.departingName} → ${activity.arrivingName}`,
        body: `Tracking the ${clockText(activity.scheduledDeparture)} sailing.`,
      },
    };
  }

  async send(token, aps, activity, priority) {
    try {
      return await this.apnsClient.sendLiveActivity(token, aps, { environment: activity.environment, priority });
    } catch (error) {
      this.logger?.error(`Live Activity ${activity.id} push failed: ${error.message}`);
      return null;
    }
  }
}

export default LiveActivityEvaluator;
