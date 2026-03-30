import FerryTempo from '../src/FerryTempo.js';
import routePositionData from '../data/RoutePositionData.js';

function wsdotDate(epochSeconds) {
  return `/Date(${epochSeconds * 1000}-0700)/`;
}

function buildVessel(overrides = {}) {
  return {
    VesselID: 1,
    VesselName: 'Test Boat',
    Mmsi: 111111111,
    DepartingTerminalID: 8,
    DepartingTerminalName: 'Edmonds',
    DepartingTerminalAbbrev: 'EDM',
    ArrivingTerminalName: 'Kingston',
    ArrivingTerminalAbbrev: 'KIN',
    Latitude: routePositionData['ed-king'][routePositionData['ed-king'].length - 1][0],
    Longitude: routePositionData['ed-king'][routePositionData['ed-king'].length - 1][1],
    Speed: 0,
    Heading: 0,
    InService: true,
    AtDock: true,
    LeftDock: null,
    Eta: null,
    ScheduledDeparture: wsdotDate(1710000600),
    OpRouteAbbrev: ['ed-king'],
    VesselPositionNum: 1,
    TimeStamp: wsdotDate(1710000200),
    VesselWatchShutMsg: '',
    VesselWatchShutFlag: 0,
    ...overrides,
  };
}

describe('FerryTempo.processFerryData', () => {
  test('persists the last port departure delay until the next boat at that port takes over', () => {
    const westPoint = routePositionData['ed-king'][0];
    const eastPoint = routePositionData['ed-king'][routePositionData['ed-king'].length - 1];

    const firstCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 2,
        VesselName: 'Kingston Departure',
        Mmsi: 222222222,
        DepartingTerminalID: 12,
        DepartingTerminalName: 'Kingston',
        DepartingTerminalAbbrev: 'KIN',
        ArrivingTerminalName: 'Edmonds',
        ArrivingTerminalAbbrev: 'EDM',
        Latitude: westPoint[0],
        Longitude: westPoint[1],
        Speed: 12,
        Heading: 90,
        AtDock: false,
        LeftDock: wsdotDate(1710000043),
        Eta: wsdotDate(1710000600),
        ScheduledDeparture: wsdotDate(1710000000),
        TimeStamp: wsdotDate(1710000100),
      }),
    ]);

    expect(firstCycle['ed-king']['portData']['portWN']['PortDepartureDelay']).toBe(43);

    const secondCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 3,
        VesselName: 'Edmonds At Dock',
        Mmsi: 333333333,
        Latitude: eastPoint[0],
        Longitude: eastPoint[1],
        AtDock: true,
        Speed: 0,
        Heading: 0,
        LeftDock: null,
        Eta: null,
        ScheduledDeparture: wsdotDate(1710000600),
        TimeStamp: wsdotDate(1710000200),
      }),
      buildVessel({
        VesselID: 4,
        VesselName: 'Recent Edmonds Departure',
        Mmsi: 444444444,
        VesselPositionNum: 2,
        Latitude: eastPoint[0],
        Longitude: eastPoint[1],
        AtDock: false,
        Speed: 10,
        Heading: 270,
        LeftDock: wsdotDate(1710000124),
        Eta: wsdotDate(1710000500),
        ScheduledDeparture: wsdotDate(1710000000),
        TimeStamp: wsdotDate(1710000210),
      }),
    ]);

    expect(secondCycle['ed-king']['portData']['portES']['PortDepartureDelay']).toBe(0);
    expect(secondCycle['ed-king']['portData']['portWN']['PortDepartureDelay']).toBe(43);
  });
});
