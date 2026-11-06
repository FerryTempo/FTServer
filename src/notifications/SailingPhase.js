// Where a sailing stands, from the current snapshot: 'upcoming' (not yet left, however
// late), 'underway' (its boat is crossing), 'done' (departed and over, or cancelled) or
// 'unknown' (no data for it).

const unknownGraceSeconds = 10 * 60;

export function departingPortKey(direction) {
  return direction === 'ES' ? 'portWN' : 'portES';
}

export function sailingPhase(ferryTempoData, routeId, direction, scheduledDeparture, now = Math.floor(Date.now() / 1000)) {
  const route = ferryTempoData?.[routeId];
  if (!route) {
    return 'unknown';
  }
  const boat = Object.values(route.boatData || {}).find((candidate) =>
    candidate.ScheduledDeparture === scheduledDeparture && candidate.Direction === direction,
  );
  if (boat) {
    return boat.AtDock ? 'upcoming' : 'underway';
  }
  const row = (route.portData?.[departingPortKey(direction)]?.PortSailingStates || [])
      .find((candidate) => candidate.ScheduledDeparture === scheduledDeparture);
  if (row) {
    return row.State === 'upcoming' || row.State === 'boarding' ? 'upcoming' : 'done';
  }
  return 'unknown';
}

// Live tracking and one-time pings need a sailing that hasn't finished: with no data,
// one that isn't more than a few minutes past.
export function sailingIsOver(ferryTempoData, routeId, direction, scheduledDeparture, now = Math.floor(Date.now() / 1000)) {
  const phase = sailingPhase(ferryTempoData, routeId, direction, scheduledDeparture, now);
  return phase === 'done' || (phase === 'unknown' && scheduledDeparture < now - unknownGraceSeconds);
}
