import FerryTempo from '../src/FerryTempo.js';
import routePositionData from '../data/RoutePositionData.js';

// A docking boat can flicker AtDock false for one report. Without WSF's LeftDock that read as leaving
// on its next sailing: Walla Walla's 10:20 from Edmonds logged as departed at 09:58 (2026-11-03).

function wsdotDate(epochSeconds) {
  return `/Date(${epochSeconds * 1000}-0800)/`;
}

const seaBiPoints = routePositionData['sea-bi'];
const bainbridgeDock = seaBiPoints[0];
const offshore = seaBiPoints[Math.floor(seaBiPoints.length * 0.1)];
const midway = seaBiPoints[Math.floor(seaBiPoints.length / 2)];

const sailing = 1793724300; // 2026-11-03 08:45 PST

function vessel(overrides = {}) {
  return {
    VesselID: 30,
    VesselName: 'Puyallup',
    Mmsi: 366772760,
    DepartingTerminalID: 3, DepartingTerminalName: 'Bainbridge Island', DepartingTerminalAbbrev: 'BBI',
    ArrivingTerminalID: 7, ArrivingTerminalName: 'Seattle', ArrivingTerminalAbbrev: 'P52',
    Latitude: bainbridgeDock[0],
    Longitude: bainbridgeDock[1],
    Speed: 0,
    Heading: 0,
    InService: true,
    AtDock: true,
    LeftDock: null,
    Eta: null,
    ScheduledDeparture: wsdotDate(sailing),
    OpRouteAbbrev: ['sea-bi'],
    VesselPositionNum: 2,
    TimeStamp: null,
    VesselWatchShutMsg: '',
    VesselWatchShutFlag: 0,
    ...overrides,
  };
}

function sailingState(result) {
  return result['sea-bi'].portData.portWN.PortSailingStates.find((state) => state.ScheduledDeparture === sailing);
}

describe('Dock flicker', () => {
  test('a boat reported off the dock without moving stays docked, then leaves once it moves', () => {
    const at = (offset, overrides) => FerryTempo.processFerryData([
      vessel({TimeStamp: wsdotDate(sailing + offset), ...overrides}),
    ]);

    at(-25 * 60);
    const flicker = at(-21 * 60, {AtDock: false});
    expect(flicker['sea-bi'].boatData.boat2.AtDock).toBe(true);
    expect(sailingState(flicker)?.State).not.toBe('departed');

    at(-21 * 60 + 9);
    // Off the dock at +60 (first report), well clear by +120.
    at(60, {AtDock: false, Speed: 5});
    const away = at(120, {AtDock: false, Speed: 14, Latitude: offshore[0], Longitude: offshore[1]});
    expect(away['sea-bi'].boatData.boat2.AtDock).toBe(false);
    expect(sailingState(away)).toMatchObject({State: 'departed', DepartureDelay: 60});

    const underway = at(900, {AtDock: false, Speed: 15, Latitude: midway[0], Longitude: midway[1]});
    expect(sailingState(underway)).toMatchObject({State: 'departed', DepartureDelay: 60});
  });
});
