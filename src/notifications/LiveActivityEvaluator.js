// Drives Live Activities for tracked sailings from each processed snapshot: a push-to-start
// leadSeconds before departure, updates when the boat's state changes, and an end on arrival.

export const leadSeconds = 30 * 60;
const dismissSeconds = 10 * 60;
const startWindowSeconds = 60 * 60; // a sailing this late without a start is dropped
const maxLifeSeconds = 4 * 60 * 60; // safety end for a cancelled or untracked sailing
export const nearingSeconds = 5 * 60; // the "5 min from dock" alert

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

// Before its boat is on the sailing: the boat the schedule assigns (the sailing's vessel position)
// while it heads for the departing terminal, underway or still docked across.
function findInboundBoat(ferryTempoData, activity) {
  const route = ferryTempoData?.[activity.routeId];
  const portKey = activity.direction === 'ES' ? 'portWN' : 'portES';
  const sailing = (route?.portData?.[portKey]?.PortSailingStates || [])
      .find((row) => row.ScheduledDeparture === activity.scheduledDeparture);
  // Only before the sailing leaves; after, that position's boat is on a later run.
  if (!sailing || !['upcoming', 'boarding'].includes(sailing.State)) {
    return null;
  }
  const boat = sailing?.VesselPosition ? route?.boatData?.[`boat${sailing.VesselPosition}`] : null;
  return boat && boat.Direction !== activity.direction ?
    { ...boat, inboundTo: activity.departingTerminalAbbrev || null } : null;
}

/**
 * The activity's content state (FerryActivityAttributes.ContentState on iOS). Times are minute-rounded
 * so second-level ETA drift doesn't push.
 */
// Signed whole minutes from the target (negative before it), so the Lock Screen shows
// "-12 min" without a live timer; it changes each minute, so the activity updates each
// minute at high priority (the app sets NSSupportsLiveActivitiesFrequentUpdates), as
// low-priority pushes reach a sleeping phone minutes late.
function minutesFrom(target, now) {
  return Number.isFinite(target) ? Math.round((now - target) / 60) : null;
}

export function buildContentState(
    boat, previous, now = Math.floor(Date.now() / 1000), scheduledDeparture = null, inboundBoat = null,
) {
  const wasUnderway = previous?.phase === 'underway' || previous?.phase === 'arrived';
  if (!boat || (boat.AtDock && wasUnderway)) {
    if (wasUnderway) {
      return { ...previous, phase: 'arrived', minutes: null };
    }
    const waiting = {
      phase: 'waiting', vesselName: null, leftDock: null, eta: null, departureDelay: null,
      minutes: minutesFrom(scheduledDeparture, now),
    };
    if (inboundBoat) {
      // "Wenatchee Inbound to BBI • 5 min Late": underway (green) or still docked across (red).
      waiting.vesselName = inboundBoat.VesselName || null;
      waiting.inbound = inboundBoat.AtDock ? 'docked' : 'underway';
      waiting.inboundTo = inboundBoat.inboundTo;
      waiting.arrivalDelay = inboundBoat.AtDock ? null : roundToMinute(inboundBoat.ArrivalDelay);
    }
    return waiting;
  }

  if (boat.AtDock) {
    return {
      phase: 'atDock',
      vesselName: boat.VesselName || null,
      leftDock: null,
      eta: null,
      departureDelay: Math.max(0, roundToMinute(boat.DepartureDelay) ?? 0),
      minutes: minutesFrom(scheduledDeparture, now),
    };
  }

  const eta = roundToMinute(boat.ETA ?? boat.EstimatedETA);
  return {
    phase: 'underway',
    vesselName: boat.VesselName || null,
    leftDock: boat.LeftDock ?? boat.ObservedLeftDock ?? null,
    eta,
    departureDelay: Math.max(0, roundToMinute(boat.DepartureDelay) ?? 0),
    arrivalDelay: roundToMinute(boat.ArrivalDelay),
    minutes: minutesFrom(eta, now),
    // Stays true once reached, so the alert fires once.
    nearing: previous?.nearing === true || (eta != null && eta - now <= nearingSeconds),
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
    const state = buildContentState(
        findBoat(ferryTempoData, activity), previous, now, activity.scheduledDeparture,
        findInboundBoat(ferryTempoData, activity),
    );

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
      const aps = {
        'timestamp': now,
        'event': 'end',
        'content-state': state,
        'dismissal-date': now + dismissSeconds,
      };
      if (state.phase === 'arrived') {
        aps.alert = {
          title: `${state.vesselName || 'Your boat'} arrived in ${activity.arrivingName}`,
          body: `The ${clockText(activity.scheduledDeparture)} from ${activity.departingName}`,
        };
      }
      const result = await this.send(activity.updateToken, aps, activity, 10);
      if (result?.sent || result?.invalidToken) {
        this.store.update(activity.id, { status: 'ended', contentState: JSON.stringify(state) });
      }
      return;
    }

    if (JSON.stringify(state) === activity.contentState) {
      return;
    }

    // Three alerts: departure, 5 minutes from the dock, and arrival (with the end). Other changes
    // update silently: at high priority when the shown minute changes, else low. An activity started mid-crossing (no previous state)
    // doesn't alert for what already happened.
    const vessel = state.vesselName || 'Your boat';
    const departed = state.phase === 'underway' && previous != null && previous.phase !== 'underway';
    const nearing = state.nearing === true && previous != null && previous.nearing !== true;
    const aps = { 'timestamp': now, 'event': 'update', 'content-state': state };
    if (departed) {
      aps.alert = {
        title: `${vessel} left ${activity.departingName}`,
        body: state.eta ? `Arrives ${activity.arrivingName} ${clockText(state.eta)}` : `Bound for ${activity.arrivingName}`,
      };
    } else if (nearing) {
      aps.alert = {
        title: `${vessel} is 5 minutes from ${activity.arrivingName}`,
        body: `Arrives ${clockText(state.eta)}`,
      };
    }
    const ticked = previous != null && state.minutes !== previous.minutes;
    const result = await this.send(activity.updateToken, aps, activity, aps.alert || ticked ? 10 : 5);
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
