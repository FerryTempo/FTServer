import FerryTempo from '../src/FerryTempo.js';
import {bestArrivalEta, estimateRemainingSeconds, routeLengthKm} from '../src/ArrivalEstimate.js';
import routePositionData from '../data/RoutePositionData.js';

// One ETA for a boat underway: WSF's while it's ahead, else an estimate from where the boat is, how fast
// and when it left, which needs nothing WSF-specific (a backup AIS source can feed it).

const now = 1793736000;

describe('estimateRemainingSeconds', () => {
  test('near the docks: what is left of its usual crossing', () => {
    expect(estimateRemainingSeconds({crossingSeconds: 2100, progress: 0.1, now, speedKnots: 15, routeKm: 16}))
        .toBe(1890);
  });

  test('mid-crossing at speed: the distance left at its speed', () => {
    // Half of 16 km is 4.32 nautical miles; at 16 knots, 971.9 s.
    expect(estimateRemainingSeconds({crossingSeconds: 2100, progress: 0.5, now, speedKnots: 16, routeKm: 16}))
        .toBe(971);
  });

  test('never sooner than its usual crossing allows since it left', () => {
    expect(estimateRemainingSeconds({
      crossingSeconds: 2100, progress: 0.5, leftDock: now - 600, now, speedKnots: 16, routeKm: 16,
    })).toBe(1500);
  });

  test('slow or stopped mid-crossing: back to its usual crossing', () => {
    expect(estimateRemainingSeconds({crossingSeconds: 2100, progress: 0.5, now, speedKnots: 2, routeKm: 16}))
        .toBe(1050);
  });

  test('nothing without a crossing time', () => {
    expect(estimateRemainingSeconds({crossingSeconds: 0, progress: 0.5, now})).toBeNull();
  });

  test('late and nearly docked: arriving now, not unknown', () => {
    // Past its usual crossing (left 36 min ago on a 35 min route) and at the dock's edge.
    expect(estimateRemainingSeconds({
      crossingSeconds: 2100, progress: 0.99, leftDock: now - 2160, now, speedKnots: 0.7, routeKm: 16,
    })).toBe(60);
  });
});

describe('bestArrivalEta', () => {
  test('WSF ETA while it is ahead', () => {
    expect(bestArrivalEta(now + 900, now, 1200)).toBe(now + 900);
  });

  test('our estimate once WSF ETA has passed (a late boat), or with none', () => {
    expect(bestArrivalEta(now - 60, now, 300)).toBe(now + 300);
    expect(bestArrivalEta(null, now, 300)).toBe(now + 300);
    expect(bestArrivalEta(null, now, 0)).toBeNull();
  });
});

test('route length is the length of its line', () => {
  const length = routeLengthKm('sea-bi', routePositionData['sea-bi']);
  expect(length).toBeGreaterThan(12);
  expect(length).toBeLessThan(20);
});

test('a late boat whose WSF ETA has passed still gets an ETA', () => {
  const points = routePositionData['ed-king'];
  const late = points[Math.floor(points.length * 0.9)];
  const wsdotDate = (epochSeconds) => `/Date(${epochSeconds * 1000}-0800)/`;
  const data = FerryTempo.processFerryData([{
    VesselID: 33, VesselName: 'Stale ETA Boat', Mmsi: 366000033,
    DepartingTerminalID: 8, DepartingTerminalName: 'Edmonds', DepartingTerminalAbbrev: 'EDM',
    ArrivingTerminalName: 'Kingston', ArrivingTerminalAbbrev: 'KIN',
    Latitude: late[0], Longitude: late[1], Speed: 4, Heading: 0, InService: true,
    AtDock: false, LeftDock: wsdotDate(now - 2400), Eta: wsdotDate(now - 120),
    ScheduledDeparture: wsdotDate(now - 2400), OpRouteAbbrev: ['ed-king'], VesselPositionNum: 1,
    TimeStamp: wsdotDate(now), VesselWatchShutMsg: '', VesselWatchShutFlag: 0,
  }]);
  const boat = data['ed-king'].boatData.boat1;
  expect(boat.ETA).toBe(now - 120);
  expect(boat.EstimatedETA).toBeGreaterThan(now);
  expect(boat.ArrivalTimeMinus).toBe(boat.EstimatedETA - now);
});
