import StorageManager from '../src/StorageManager.js';
import FerryTempo from '../src/FerryTempo.js';
import routePositionData from '../data/RoutePositionData.js';

// The estimated ETA's crossing time comes from the boat's last seven sailing days on the route, and
// ArrivalDelay measures arrivals against the route's scheduled crossing time.

const DAY = 24 * 60 * 60;
const noon = 1793736000; // 2026-11-03 12:00 PST

describe('Crossing history', () => {
  test('averages crossings over the last seven sailing days', () => {
    const storage = new StorageManager();
    storage.addCrossingSample('boat', 1800, noon - (2 * DAY));
    storage.addCrossingSample('boat', 2000, noon - DAY);
    storage.addCrossingSample('boat', 2200, noon);
    expect(storage.getCrossingHistory('boat', noon)).toEqual({average: 2000, count: 3});
  });

  test('drops days older than a week', () => {
    const storage = new StorageManager();
    storage.addCrossingSample('boat', 3000, noon - (7 * DAY));
    storage.addCrossingSample('boat', 1900, noon - (6 * DAY));
    expect(storage.getCrossingHistory('boat', noon)).toEqual({average: 1900, count: 1});
    expect(storage.getCrossingHistory('boat', noon + DAY)).toBeNull();
  });

  test('survives a restart through the saved state', () => {
    const storage = new StorageManager();
    storage.addCrossingSample('boat', 1950, noon);
    const restored = new StorageManager();
    restored.importState(JSON.parse(JSON.stringify(storage.exportState())));
    expect(restored.getCrossingHistory('boat', noon)).toEqual({average: 1950, count: 1});
  });
});

describe('ArrivalDelay', () => {
  test('a sailing arrives against its scheduled departure plus the scheduled crossing', () => {
    const storage = new StorageManager();
    storage.setSailingDepartureDelay('port', noon, 300, 1, noon + 300);
    storage.setSailingCrossingTime('port', noon, 1900, noon + 2200);
    const [state] = storage.getSailingStates('port', [], noon + 2200, 2100);
    // Left 5 min late, crossed in 31:40 against 35: arrived 1:40 late.
    expect(state.ArrivalDelay).toBe(100);
  });

  test('a sailing that has not arrived has none', () => {
    const storage = new StorageManager();
    storage.setSailingDepartureDelay('port', noon, 300, 1, noon + 300);
    const [state] = storage.getSailingStates('port', [], noon + 600, 2100);
    expect(state.ArrivalDelay).toBeNull();
  });

  test('a boat underway arrives by its ETA against the scheduled arrival', () => {
    const points = routePositionData['sea-bi'];
    const midway = points[Math.floor(points.length / 2)];
    const wsdotDate = (epochSeconds) => `/Date(${epochSeconds * 1000}-0800)/`;
    const boat = {
      VesselID: 31, VesselName: 'Arrival Test Boat', Mmsi: 366000031,
      DepartingTerminalID: 3, DepartingTerminalName: 'Bainbridge Island', DepartingTerminalAbbrev: 'BBI',
      ArrivingTerminalID: 7, ArrivingTerminalName: 'Seattle', ArrivingTerminalAbbrev: 'P52',
      Latitude: midway[0], Longitude: midway[1], Speed: 16, Heading: 90, InService: true,
      AtDock: false, LeftDock: wsdotDate(noon + 480), ScheduledDeparture: wsdotDate(noon),
      // Left 8 min late, but due 35 min after the scheduled departure: on time.
      Eta: wsdotDate(noon + 2100), OpRouteAbbrev: ['sea-bi'], VesselPositionNum: 1,
      TimeStamp: wsdotDate(noon + 1200), VesselWatchShutMsg: '', VesselWatchShutFlag: 0,
    };
    const result = FerryTempo.processFerryData([boat]);
    expect(result['sea-bi'].boatData.boat1.ArrivalDelay).toBe(0);
    const late = FerryTempo.processFerryData([{...boat, Eta: wsdotDate(noon + 2580)}]);
    expect(late['sea-bi'].boatData.boat1.ArrivalDelay).toBe(480);
  });
});

describe('CrossingTimeWeekAverage', () => {
  test('appears from the second crossing and averages them', () => {
    const points = routePositionData['sea-bi'];
    const midway = points[Math.floor(points.length / 2)];
    const wsdotDate = (epochSeconds) => `/Date(${epochSeconds * 1000}-0800)/`;
    const bainbridge = {
      DepartingTerminalID: 3, DepartingTerminalName: 'Bainbridge Island', DepartingTerminalAbbrev: 'BBI',
      ArrivingTerminalID: 7, ArrivingTerminalName: 'Seattle', ArrivingTerminalAbbrev: 'P52',
      Latitude: points[0][0], Longitude: points[0][1],
    };
    const seattle = {
      DepartingTerminalID: 7, DepartingTerminalName: 'Seattle', DepartingTerminalAbbrev: 'P52',
      ArrivingTerminalID: 3, ArrivingTerminalName: 'Bainbridge Island', ArrivingTerminalAbbrev: 'BBI',
      Latitude: points[points.length - 1][0], Longitude: points[points.length - 1][1],
    };
    const boat = (overrides) => ({
      VesselID: 32, VesselName: 'Week Average Boat', Mmsi: 366000032, Speed: 0, Heading: 0, InService: true,
      AtDock: true, LeftDock: null, Eta: null, OpRouteAbbrev: ['sea-bi'], VesselPositionNum: 1,
      VesselWatchShutMsg: '', VesselWatchShutFlag: 0, ...overrides,
    });
    const run = (overrides) => FerryTempo.processFerryData([boat(overrides)])['sea-bi'].boatData.boat1;
    // Crossings of 30 and 32 minutes.
    run({...bainbridge, ScheduledDeparture: wsdotDate(noon), TimeStamp: wsdotDate(noon - 600)});
    run({...bainbridge, AtDock: false, LeftDock: wsdotDate(noon), ScheduledDeparture: wsdotDate(noon),
      Latitude: midway[0], Longitude: midway[1], TimeStamp: wsdotDate(noon + 900)});
    const first = run({...seattle, ScheduledDeparture: wsdotDate(noon + 3000), TimeStamp: wsdotDate(noon + 1800)});
    expect(first.CrossingTimeWeekAverage).toBeNull();
    run({...seattle, AtDock: false, LeftDock: wsdotDate(noon + 3000), ScheduledDeparture: wsdotDate(noon + 3000),
      Latitude: midway[0], Longitude: midway[1], TimeStamp: wsdotDate(noon + 3900)});
    const second = run({...bainbridge, ScheduledDeparture: wsdotDate(noon + 6000),
      TimeStamp: wsdotDate(noon + 3000 + 1920)});
    expect(second.CrossingTimeWeekAverage).toBe(1860);
  });
});
