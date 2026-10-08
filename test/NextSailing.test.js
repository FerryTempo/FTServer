import FerryTempo from '../src/FerryTempo.js';
import routePositionData from '../data/RoutePositionData.js';
import {recordSailingDepartureDelay, getSailingLog} from '../src/Utils.js';

function wsdotDate(epochSeconds) {
  return `/Date(${epochSeconds * 1000}-0700)/`;
}

const edmonds = routePositionData['ed-king'][routePositionData['ed-king'].length - 1];
const midRoute = routePositionData['ed-king'][Math.floor(routePositionData['ed-king'].length / 2)];

function vessel(overrides) {
  return {
    VesselID: 1, VesselName: 'Boat', Mmsi: 1,
    DepartingTerminalID: 8, DepartingTerminalName: 'Edmonds', DepartingTerminalAbbrev: 'EDM',
    ArrivingTerminalName: 'Kingston', ArrivingTerminalAbbrev: 'KIN',
    Latitude: edmonds[0], Longitude: edmonds[1], Speed: 0, Heading: 0,
    InService: true, AtDock: true, LeftDock: null, Eta: null,
    OpRouteAbbrev: ['ed-king'], VesselPositionNum: 1,
    VesselWatchShutMsg: '', VesselWatchShutFlag: 0,
    ...overrides,
  };
}

// Edmonds (8) departures alternate boats 1 and 2; Kingston (12) the same.
function schedule(base) {
  const times = (offsets) => offsets.map(([minutes, position]) => ({
    DepartingTime: wsdotDate(base + minutes * 60), VesselPositionNum: position,
  }));
  return {
    'ed-king': {
      TerminalCombos: [
        {DepartingTerminalID: 8, ArrivingTerminalID: 12, Times: times([[0, 1], [40, 2], [80, 1], [120, 2]])},
        {DepartingTerminalID: 12, ArrivingTerminalID: 8, Times: times([[20, 2], [60, 1], [100, 2], [140, 1]])},
      ],
    },
  };
}

describe('NextScheduledDeparture from the boats', () => {
  test("a late docked boat stays the next sailing past the other boat's slot", () => {
    const base = 1713000000;
    // Boat 1 docked at Edmonds for its 0:00 sailing, still there at 0:50 (past boat 2's 0:40 slot).
    const data = FerryTempo.processFerryData([vessel({
      VesselID: 51, VesselName: 'Late Docked', Mmsi: 51,
      ScheduledDeparture: wsdotDate(base), TimeStamp: wsdotDate(base + 50 * 60),
    })], schedule(base));
    expect(data['ed-king'].portData.portES.NextScheduledDeparture).toBe(base);
  });

  test("a docked boat's sailing expires once its own next sailing has passed", () => {
    const base = 1713100000;
    const data = FerryTempo.processFerryData([vessel({
      VesselID: 52, VesselName: 'Stale Docked', Mmsi: 52,
      ScheduledDeparture: wsdotDate(base), TimeStamp: wsdotDate(base + 85 * 60),
    })], schedule(base));
    expect(data['ed-king'].portData.portES.NextScheduledDeparture).toBe(base + 120 * 60);
  });

  test('a boat crossing to a terminal claims its next sailing there, however late', () => {
    const base = 1713200000;
    // Boat 1 left Kingston on its 1:00 sailing, still crossing to Edmonds at 1:30: its next Edmonds
    // sailing is 1:20 (the schedule alone would say 2:00).
    const data = FerryTempo.processFerryData([vessel({
      VesselID: 53, VesselName: 'Crossing Boat', Mmsi: 53,
      DepartingTerminalID: 12, DepartingTerminalName: 'Kingston', DepartingTerminalAbbrev: 'KIN',
      ArrivingTerminalName: 'Edmonds', ArrivingTerminalAbbrev: 'EDM',
      Latitude: midRoute[0], Longitude: midRoute[1], AtDock: false,
      LeftDock: wsdotDate(base + 70 * 60), ScheduledDeparture: wsdotDate(base + 60 * 60),
      TimeStamp: wsdotDate(base + 90 * 60),
    })], schedule(base));
    expect(data['ed-king'].portData.portES.NextScheduledDeparture).toBe(base + 80 * 60);
  });

  test('a cancelled sailing is marked in the log and is never the next sailing', () => {
    const base = 1713300000;
    const sailingSpace = [{
      TerminalID: 8,
      DepartingSpaces: [{
        Departure: wsdotDate(base + 40 * 60), IsCancelled: true,
        SpaceForArrivalTerminals: [{TerminalID: 12, DisplayDriveUpSpace: false}],
      }],
    }];
    const data = FerryTempo.processFerryData([vessel({
      VesselID: 54, VesselName: 'Idle Boat', Mmsi: 54, VesselPositionNum: 3,
      DepartingTerminalID: 12, DepartingTerminalName: 'Kingston', DepartingTerminalAbbrev: 'KIN',
      ScheduledDeparture: null, TimeStamp: wsdotDate(base + 30 * 60),
    })], schedule(base), null, null, sailingSpace);
    const edmondsPort = data['ed-king'].portData.portES;
    expect(edmondsPort.PortSailingLog).toContainEqual([base + 40 * 60, null, null, 2, 'cancelled']);
    expect(edmondsPort.NextScheduledDeparture).toBe(base + 80 * 60);
  });
});

describe('PortSailingLog skipped status', () => {
  const base = 1713400000;
  const scheduleList = [[base, 1], [base + 2400, 2], [base + 4800, 1], [base + 7200, 2], [base + 9600, 1]];

  test('marks a sailing skipped when the same boat departed before and after it', () => {
    recordSailingDepartureDelay('skip-port-a', base, 300, 1, base + 300);
    recordSailingDepartureDelay('skip-port-a', base + 9600, 120, 1, base + 9720);
    const log = getSailingLog('skip-port-a', scheduleList, base + 9800);
    expect(log[2]).toEqual([base + 4800, null, null, 1, 'skipped']);
    expect(log[0]).toEqual([base, 300, null, 1]);
    // Boat 2 never departed here: its sailings aren't bracketed, so not skipped.
    expect(log[1]).toEqual([base + 2400, null, null, 2]);
  });

  test('does not mark gaps before the first logged departure (server downtime)', () => {
    recordSailingDepartureDelay('skip-port-b', base + 9600, 120, 1, base + 9720);
    const log = getSailingLog('skip-port-b', scheduleList, base + 9800);
    expect(log[0]).toEqual([base, null, null, 1]);
    expect(log[2]).toEqual([base + 4800, null, null, 1]);
  });
});
