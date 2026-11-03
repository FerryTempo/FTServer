import FerryTempo, {isRepositionDeparture} from '../src/FerryTempo.js';
import StorageManager from '../src/StorageManager.js';
import routePositionData from '../data/RoutePositionData.js';

// PortRepositionLog: empty moves between a route's terminals with no scheduled sailing.

function wsdotDate(epochSeconds) {
  return `/Date(${epochSeconds * 1000}-0800)/`;
}

const seaBiPoints = routePositionData['sea-bi'];
const BAINBRIDGE = {
  DepartingTerminalID: 3, DepartingTerminalName: 'Bainbridge Island', DepartingTerminalAbbrev: 'BBI',
  ArrivingTerminalID: 7, ArrivingTerminalName: 'Seattle', ArrivingTerminalAbbrev: 'P52',
};
const SEATTLE = {
  DepartingTerminalID: 7, DepartingTerminalName: 'Seattle', DepartingTerminalAbbrev: 'P52',
  ArrivingTerminalID: 3, ArrivingTerminalName: 'Bainbridge Island', ArrivingTerminalAbbrev: 'BBI',
};

function seaBiVessel(overrides = {}) {
  return {
    VesselID: 30,
    VesselName: 'Puyallup',
    Mmsi: 366772760,
    ...BAINBRIDGE,
    Latitude: seaBiPoints[0][0],
    Longitude: seaBiPoints[0][1],
    Speed: 0,
    Heading: 0,
    InService: true,
    AtDock: true,
    LeftDock: null,
    Eta: null,
    ScheduledDeparture: null,
    OpRouteAbbrev: ['sea-bi'],
    VesselPositionNum: 2,
    TimeStamp: null,
    VesselWatchShutMsg: '',
    VesselWatchShutFlag: 0,
    ...overrides,
  };
}

const midway = seaBiPoints[Math.floor(seaBiPoints.length / 2)];
const seattleDock = seaBiPoints[seaBiPoints.length - 1];

// Sunday 2026-11-01: Puyallup tied up at Bainbridge from 23:15 Saturday with no sailing; its first sailing
// leaves Seattle at 08:55, so it crosses empty in the morning (here 07:20, docking at Seattle 07:55).
const tiedUp = 1793513700; // 2026-10-31 23:15 PDT
const leftBainbridge = 1793546400; // 2026-11-01 07:20 PST
const arrivedSeattle = leftBainbridge + 35 * 60;
const seattleSailing = 1793552100; // 2026-11-01 08:55 PST

describe('PortRepositionLog', () => {
  test('logs an empty crossing from a snapshot sequence: docked with no sailing, underway, docked across', () => {
    const snapshots = [
      seaBiVessel({TimeStamp: wsdotDate(tiedUp), ScheduledDeparture: wsdotDate(0)}),
      seaBiVessel({TimeStamp: wsdotDate(leftBainbridge - 60)}),
      // Underway before WSF reports LeftDock, then with it.
      seaBiVessel({AtDock: false, Speed: 14, TimeStamp: wsdotDate(leftBainbridge + 30),
        Latitude: seaBiPoints[1][0], Longitude: seaBiPoints[1][1]}),
      seaBiVessel({AtDock: false, Speed: 15, LeftDock: wsdotDate(leftBainbridge),
        TimeStamp: wsdotDate(leftBainbridge + 900), Latitude: midway[0], Longitude: midway[1]}),
      // Docked at Seattle, now showing its 08:55 sailing.
      seaBiVessel({...SEATTLE, TimeStamp: wsdotDate(arrivedSeattle), ScheduledDeparture: wsdotDate(seattleSailing),
        Latitude: seattleDock[0], Longitude: seattleDock[1]}),
    ];
    const results = snapshots.map((snapshot) => FerryTempo.processFerryData([snapshot]));

    // Nothing is logged until the boat docks across.
    for (const result of results.slice(0, -1)) {
      expect(result['sea-bi'].portData.portWN.PortRepositionLog).toEqual([]);
    }
    const route = results[results.length - 1]['sea-bi'];
    expect(route.portData.portWN.PortRepositionLog).toEqual([{
      VesselID: 30,
      VesselPosition: 2,
      FromTerminalID: 3,
      ToTerminalID: 7,
      LeftDock: leftBainbridge,
      Arrived: arrivedSeattle,
    }]);
    expect(route.portData.portES.PortRepositionLog).toEqual([]);
    // Existing fields are untouched: the move is no sailing row.
    expect(route.portData.portWN.PortSailingLog).toEqual([]);
    // PortSailingLog stays last in the port data.
    expect(Object.keys(route.portData.portWN).slice(-1)).toEqual(['PortSailingLog']);
  });

  test('does not log a scheduled sailing', () => {
    const base = 1793600000;
    const boat = {VesselID: 31, VesselName: 'Scheduled Boat', VesselPositionNum: 1};
    FerryTempo.processFerryData([seaBiVessel({...boat, TimeStamp: wsdotDate(base),
      ScheduledDeparture: wsdotDate(base + 300)})]);
    FerryTempo.processFerryData([seaBiVessel({...boat, AtDock: false, LeftDock: wsdotDate(base + 360),
      TimeStamp: wsdotDate(base + 400), Latitude: midway[0], Longitude: midway[1]})]);
    const arrived = FerryTempo.processFerryData([seaBiVessel({...boat, ...SEATTLE, TimeStamp: wsdotDate(base + 2400),
      Latitude: seattleDock[0], Longitude: seattleDock[1]})]);
    expect(arrived['sea-bi'].portData.portWN.PortRepositionLog.filter((move) => move.VesselID === 31)).toEqual([]);
    expect(arrived['sea-bi'].portData.portWN.PortSailingLog).toContainEqual([base + 300, 60, 2040, 1]);
  });

  test('logs a departure hours before the sailing WSF shows as a move', () => {
    const base = 1793610000;
    const boat = {VesselID: 32, VesselName: 'Early Boat', VesselPositionNum: 1};
    FerryTempo.processFerryData([seaBiVessel({...boat, TimeStamp: wsdotDate(base),
      ScheduledDeparture: wsdotDate(base + 4 * 3600)})]);
    FerryTempo.processFerryData([seaBiVessel({...boat, AtDock: false, TimeStamp: wsdotDate(base + 60),
      ScheduledDeparture: wsdotDate(base + 4 * 3600), Latitude: midway[0], Longitude: midway[1]})]);
    const arrived = FerryTempo.processFerryData([seaBiVessel({...boat, ...SEATTLE, TimeStamp: wsdotDate(base + 2100),
      Latitude: seattleDock[0], Longitude: seattleDock[1]})]);
    expect(arrived['sea-bi'].portData.portWN.PortRepositionLog).toContainEqual(expect.objectContaining({
      VesselID: 32, FromTerminalID: 3, ToTerminalID: 7, LeftDock: base + 60, Arrived: base + 2100,
    }));
  });

  test('drops a move that docks back where it started', () => {
    const base = 1793620000;
    const boat = {VesselID: 33, VesselName: 'Shifting Boat', VesselPositionNum: 1};
    FerryTempo.processFerryData([seaBiVessel({...boat, TimeStamp: wsdotDate(base)})]);
    FerryTempo.processFerryData([seaBiVessel({...boat, AtDock: false, TimeStamp: wsdotDate(base + 60)})]);
    FerryTempo.processFerryData([seaBiVessel({...boat, TimeStamp: wsdotDate(base + 600)})]);
    const later = FerryTempo.processFerryData([seaBiVessel({...boat, ...SEATTLE, TimeStamp: wsdotDate(base + 900),
      Latitude: seattleDock[0], Longitude: seattleDock[1]})]);
    expect(later['sea-bi'].portData.portWN.PortRepositionLog.filter((move) => move.VesselID === 33)).toEqual([]);
  });
});

describe('isRepositionDeparture', () => {
  test('no sailing, or a sailing far from the departure, is a move', () => {
    expect(isRepositionDeparture(0, 1000)).toBe(true);
    expect(isRepositionDeparture(null, 1000)).toBe(true);
    expect(isRepositionDeparture(10000, 10000 - 31 * 60)).toBe(true);
    expect(isRepositionDeparture(10000, 10000 + 4 * 3600)).toBe(true);
    expect(isRepositionDeparture(10000, 10000 - 5 * 60)).toBe(false);
    expect(isRepositionDeparture(10000, 10000 + 45 * 60)).toBe(false);
  });
});

describe('StorageManager reposition log', () => {
  test('keeps one move per departure and scopes it to the sailing day', () => {
    const storage = new StorageManager();
    const key = 'sea-bi:portWN';
    const move = {boat: 30, vesselPosition: 2, from: 3, to: 7, left: arrivedSeattle - 2100, arrived: arrivedSeattle};
    storage.recordRepositionMove(key, move, arrivedSeattle);
    storage.recordRepositionMove(key, {...move, arrived: arrivedSeattle + 60}, arrivedSeattle + 60);
    expect(storage.getRepositionLog(key, arrivedSeattle + 120)).toEqual([{
      VesselID: 30, VesselPosition: 2, FromTerminalID: 3, ToTerminalID: 7,
      LeftDock: arrivedSeattle - 2100, Arrived: arrivedSeattle + 60,
    }]);
    // Persisted with the sailing logs.
    const restored = new StorageManager();
    restored.importState(JSON.parse(JSON.stringify(storage.exportState())));
    expect(restored.getRepositionLog(key, arrivedSeattle + 120)).toHaveLength(1);
    expect(storage.getRepositionLog(key, arrivedSeattle + 86400)).toEqual([]);
  });
});
