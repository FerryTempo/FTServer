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
  test('processes Point Defiance-Tahlequah vessel data', () => {
    const pointDefiancePoint = routePositionData['pd-tal'][0];

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 65,
        VesselName: 'Chetzemoka',
        Mmsi: 367463060,
        DepartingTerminalID: 16,
        DepartingTerminalName: 'Point Defiance',
        DepartingTerminalAbbrev: 'PTD',
        ArrivingTerminalName: 'Tahlequah',
        ArrivingTerminalAbbrev: 'TAH',
        Latitude: pointDefiancePoint[0],
        Longitude: pointDefiancePoint[1],
        OpRouteAbbrev: ['pd-tal'],
        VesselPositionNum: 1,
      }),
    ]);

    expect(ferryTempoData['pd-tal']['boatData']['boat1']).toMatchObject({
      VesselName: 'Chetzemoka',
      DepartingTerminalName: 'Point Defiance',
      ArrivingTerminalName: 'Tahlequah',
      Direction: 'ES',
      VesselPosition: 1,
    });
    expect(ferryTempoData['pd-tal']['portData']['portWN']).toMatchObject({
      TerminalName: 'Point Defiance',
      TerminalAbbrev: 'PTD',
      TerminalID: 16,
      BoatAtDock: true,
    });
  });

  test('processes triangle route vessel position 3', () => {
    const fauntleroyPoint = routePositionData['f-v'][routePositionData['f-v'].length - 1];

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 28,
        VesselName: 'Sealth',
        Mmsi: 366710820,
        DepartingTerminalID: 9,
        DepartingTerminalName: 'Fauntleroy',
        DepartingTerminalAbbrev: 'FAU',
        ArrivingTerminalName: 'Vashon Island',
        ArrivingTerminalAbbrev: 'VAI',
        Latitude: fauntleroyPoint[0],
        Longitude: fauntleroyPoint[1],
        OpRouteAbbrev: ['f-v-s'],
        VesselPositionNum: 3,
      }),
    ]);

    expect(ferryTempoData['f-v']['boatData']['boat3']).toMatchObject({
      VesselName: 'Sealth',
      DepartingTerminalName: 'Fauntleroy',
      ArrivingTerminalName: 'Vashon Island',
      Direction: 'WN',
      VesselPosition: 3,
    });
  });

  test('maps triangle route group vessel data to the Fauntleroy-Southworth leg', () => {
    const fauntleroyPoint = routePositionData['f-s'][routePositionData['f-s'].length - 1];

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 19,
        VesselName: 'Kittitas',
        Mmsi: 366772960,
        DepartingTerminalID: 9,
        DepartingTerminalName: 'Fauntleroy',
        DepartingTerminalAbbrev: 'FAU',
        ArrivingTerminalName: 'Southworth',
        ArrivingTerminalAbbrev: 'SOU',
        Latitude: fauntleroyPoint[0],
        Longitude: fauntleroyPoint[1],
        OpRouteAbbrev: ['f-v-s'],
        VesselPositionNum: 1,
      }),
    ]);

    expect(ferryTempoData['f-s']['boatData']['boat1']).toMatchObject({
      VesselName: 'Kittitas',
      DepartingTerminalName: 'Fauntleroy',
      ArrivingTerminalName: 'Southworth',
      Direction: 'WN',
      VesselPosition: 1,
    });
    expect(ferryTempoData['f-v']['boatData']['boat1']).toBeUndefined();
  });

  test('maps triangle route group vessel data to the Southworth-Vashon leg', () => {
    const vashonPoint = routePositionData['s-v'][routePositionData['s-v'].length - 1];

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 1,
        VesselName: 'Cathlamet',
        Mmsi: 366773070,
        DepartingTerminalID: 22,
        DepartingTerminalName: 'Vashon Island',
        DepartingTerminalAbbrev: 'VAI',
        ArrivingTerminalName: 'Southworth',
        ArrivingTerminalAbbrev: 'SOU',
        Latitude: vashonPoint[0],
        Longitude: vashonPoint[1],
        OpRouteAbbrev: ['f-v-s'],
        VesselPositionNum: 2,
      }),
    ]);

    expect(ferryTempoData['s-v']['boatData']['boat2']).toMatchObject({
      VesselName: 'Cathlamet',
      DepartingTerminalName: 'Vashon Island',
      ArrivingTerminalName: 'Southworth',
      Direction: 'WN',
      VesselPosition: 2,
    });
    expect(ferryTempoData['f-v']['boatData']['boat2']).toBeUndefined();
  });

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

  test('passes through vessel location and separates last departure delay from current delay', () => {
    const westPoint = routePositionData['ed-king'][0];
    const eastPoint = routePositionData['ed-king'][routePositionData['ed-king'].length - 1];

    const departureCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 20,
        VesselName: 'Last Delay Boat',
        Mmsi: 202020202,
        Latitude: westPoint[0],
        Longitude: westPoint[1],
        AtDock: false,
        Speed: 12,
        Heading: 90,
        LeftDock: wsdotDate(1710200043),
        Eta: wsdotDate(1710200600),
        ScheduledDeparture: wsdotDate(1710200000),
        TimeStamp: wsdotDate(1710200100),
      }),
    ]);

    expect(departureCycle['ed-king']['boatData']['boat1']).toMatchObject({
      Latitude: westPoint[0],
      Longitude: westPoint[1],
      DepartureDelay: 43,
      LastDepartureDelay: 43,
    });

    const lateAtDockCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 20,
        VesselName: 'Last Delay Boat',
        Mmsi: 202020202,
        Latitude: eastPoint[0],
        Longitude: eastPoint[1],
        AtDock: true,
        Speed: 0,
        Heading: 0,
        LeftDock: null,
        Eta: null,
        ScheduledDeparture: wsdotDate(1710201000),
        TimeStamp: wsdotDate(1710201300),
      }),
    ]);

    expect(lateAtDockCycle['ed-king']['boatData']['boat1']).toMatchObject({
      Latitude: eastPoint[0],
      Longitude: eastPoint[1],
      DepartureDelay: 300,
      LastDepartureDelay: 43,
    });
  });

  test('updates boat and port stop averages on departure and crossing averages on arrival', () => {
    const westPoint = routePositionData['ed-king'][0];
    const eastPoint = routePositionData['ed-king'][routePositionData['ed-king'].length - 1];

    FerryTempo.processFerryData([
      buildVessel({
        VesselID: 5,
        VesselName: 'Average Metrics Boat',
        Mmsi: 555555555,
        Latitude: eastPoint[0],
        Longitude: eastPoint[1],
        AtDock: true,
        LeftDock: null,
        TimeStamp: wsdotDate(1710100000),
        ScheduledDeparture: wsdotDate(1710100120),
      }),
    ]);

    const departureCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 5,
        VesselName: 'Average Metrics Boat',
        Mmsi: 555555555,
        Latitude: eastPoint[0],
        Longitude: eastPoint[1],
        AtDock: false,
        LeftDock: wsdotDate(1710100120),
        Eta: wsdotDate(1710101920),
        TimeStamp: wsdotDate(1710100130),
        ScheduledDeparture: wsdotDate(1710100120),
      }),
    ]);

    expect(departureCycle['ed-king']['boatData']['boat1']['StopTimerAverage']).toBe(120);
    expect(departureCycle['ed-king']['boatData']['boat1']['ArrivedDock']).toBeNull();
    expect(departureCycle['ed-king']['portData']['portES']['PortStopTimerAverage']).toBe(120);

    const arrivalCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 5,
        VesselName: 'Average Metrics Boat',
        Mmsi: 555555555,
        DepartingTerminalID: 12,
        DepartingTerminalName: 'Kingston',
        DepartingTerminalAbbrev: 'KIN',
        ArrivingTerminalName: 'Edmonds',
        ArrivingTerminalAbbrev: 'EDM',
        Latitude: westPoint[0],
        Longitude: westPoint[1],
        AtDock: true,
        LeftDock: null,
        Eta: null,
        TimeStamp: wsdotDate(1710101920),
        ScheduledDeparture: wsdotDate(1710102100),
      }),
    ]);

    expect(arrivalCycle['ed-king']['boatData']['boat1']['CrossingTimeAverage']).toBe(1800);
    expect(arrivalCycle['ed-king']['boatData']['boat1']['ArrivedDock']).toBe(1710101920);
  });

  test('observes left dock when WSF does not provide LeftDock', () => {
    const westPoint = routePositionData['ed-king'][0];
    const eastPoint = routePositionData['ed-king'][routePositionData['ed-king'].length - 1];

    FerryTempo.processFerryData([
      buildVessel({
        VesselID: 6,
        VesselName: 'Observed Left Dock Boat',
        Mmsi: 666666666,
        Latitude: eastPoint[0],
        Longitude: eastPoint[1],
        AtDock: true,
        LeftDock: null,
        TimeStamp: wsdotDate(1710120000),
        ScheduledDeparture: wsdotDate(1710120120),
      }),
    ]);

    const departureCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 6,
        VesselName: 'Observed Left Dock Boat',
        Mmsi: 666666666,
        Latitude: eastPoint[0],
        Longitude: eastPoint[1],
        AtDock: false,
        LeftDock: null,
        Eta: wsdotDate(1710122000),
        TimeStamp: wsdotDate(1710120130),
        ScheduledDeparture: wsdotDate(1710120120),
      }),
    ]);

    expect(departureCycle['ed-king']['boatData']['boat1']).toMatchObject({
      LeftDock: 0,
      ObservedLeftDock: 1710120130,
    });

    const underwayCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 6,
        VesselName: 'Observed Left Dock Boat',
        Mmsi: 666666666,
        Latitude: eastPoint[0],
        Longitude: eastPoint[1],
        AtDock: false,
        LeftDock: null,
        Eta: wsdotDate(1710122000),
        TimeStamp: wsdotDate(1710120300),
        ScheduledDeparture: wsdotDate(1710120120),
      }),
    ]);

    expect(underwayCycle['ed-king']['boatData']['boat1']).toMatchObject({
      LeftDock: 0,
      ObservedLeftDock: 1710120130,
    });

    const arrivalCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 6,
        VesselName: 'Observed Left Dock Boat',
        Mmsi: 666666666,
        DepartingTerminalID: 12,
        DepartingTerminalName: 'Kingston',
        DepartingTerminalAbbrev: 'KIN',
        ArrivingTerminalName: 'Edmonds',
        ArrivingTerminalAbbrev: 'EDM',
        Latitude: westPoint[0],
        Longitude: westPoint[1],
        AtDock: true,
        LeftDock: null,
        Eta: null,
        TimeStamp: wsdotDate(1710122000),
        ScheduledDeparture: wsdotDate(1710122100),
      }),
    ]);

    expect(arrivalCycle['ed-king']['boatData']['boat1']).toMatchObject({
      ArrivedDock: 1710122000,
      ObservedLeftDock: null,
      CrossingTimeAverage: 1870,
    });
  });

  test('ignores implausibly short crossing times', () => {
    const westPoint = routePositionData['ed-king'][0];
    const eastPoint = routePositionData['ed-king'][routePositionData['ed-king'].length - 1];

    FerryTempo.processFerryData([
      buildVessel({
        VesselID: 66,
        VesselName: 'Impossible Crossing Boat',
        Mmsi: 666000666,
        Latitude: eastPoint[0],
        Longitude: eastPoint[1],
        AtDock: false,
        LeftDock: wsdotDate(1710130000),
        Eta: null,
        TimeStamp: wsdotDate(1710130001),
        ScheduledDeparture: wsdotDate(1710130000),
      }),
    ]);

    const arrivalCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 66,
        VesselName: 'Impossible Crossing Boat',
        Mmsi: 666000666,
        DepartingTerminalID: 12,
        DepartingTerminalName: 'Kingston',
        DepartingTerminalAbbrev: 'KIN',
        ArrivingTerminalName: 'Edmonds',
        ArrivingTerminalAbbrev: 'EDM',
        Latitude: westPoint[0],
        Longitude: westPoint[1],
        AtDock: true,
        LeftDock: null,
        Eta: null,
        TimeStamp: wsdotDate(1710130016),
        ScheduledDeparture: wsdotDate(1710130900),
      }),
    ]);

    expect(arrivalCycle['ed-king']['boatData']['boat1']['CrossingTimeAverage']).toBe(0);
    expect(arrivalCycle['ed-king']['portData']['portES']['PortSailingLog']).toContainEqual(
        [1710130000, 0, null, 1],
    );
  });

  test('uses route default ETA after ignored implausible crossing observations', () => {
    const westPoint = routePositionData['ed-king'][0];
    const eastPoint = routePositionData['ed-king'][routePositionData['ed-king'].length - 1];
    const midRoutePoint = routePositionData['ed-king'][Math.floor(routePositionData['ed-king'].length / 2)];

    for (const leftDock of [1710140000, 1710141000]) {
      FerryTempo.processFerryData([
        buildVessel({
          VesselID: 67,
          VesselName: 'ETA Guard Boat',
          Mmsi: 667000667,
          Latitude: eastPoint[0],
          Longitude: eastPoint[1],
          AtDock: false,
          LeftDock: wsdotDate(leftDock),
          Eta: null,
          TimeStamp: wsdotDate(leftDock + 1),
          ScheduledDeparture: wsdotDate(leftDock),
        }),
      ]);

      FerryTempo.processFerryData([
        buildVessel({
          VesselID: 67,
          VesselName: 'ETA Guard Boat',
          Mmsi: 667000667,
          DepartingTerminalID: 12,
          DepartingTerminalName: 'Kingston',
          DepartingTerminalAbbrev: 'KIN',
          ArrivingTerminalName: 'Edmonds',
          ArrivingTerminalAbbrev: 'EDM',
          Latitude: westPoint[0],
          Longitude: westPoint[1],
          AtDock: true,
          LeftDock: null,
          Eta: null,
          TimeStamp: wsdotDate(leftDock + 16),
          ScheduledDeparture: wsdotDate(leftDock + 900),
        }),
      ]);
    }

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 67,
        VesselName: 'ETA Guard Boat',
        Mmsi: 667000667,
        Latitude: midRoutePoint[0],
        Longitude: midRoutePoint[1],
        AtDock: false,
        LeftDock: null,
        Eta: null,
        TimeStamp: wsdotDate(1710143000),
        ScheduledDeparture: wsdotDate(1710143000),
      }),
    ]);
    const boat = ferryTempoData['ed-king']['boatData']['boat1'];

    expect(boat.CrossingTimeAverage).toBe(0);
    expect(boat.EstimatedETA - boat.PositionUpdated).toBeGreaterThan(900);
    expect(boat.ArrivalTimeMinus).toBe(boat.EstimatedETA - boat.PositionUpdated);
  });

  test('keeps crossing averages scoped to route and vessel', () => {
    const edWestPoint = routePositionData['ed-king'][0];
    const edEastPoint = routePositionData['ed-king'][routePositionData['ed-king'].length - 1];
    const seaBIPoint = routePositionData['sea-bi'][routePositionData['sea-bi'].length - 1];

    FerryTempo.processFerryData([
      buildVessel({
        VesselID: 55,
        VesselName: 'Route Scoped Average Boat',
        Mmsi: 555000555,
        Latitude: edEastPoint[0],
        Longitude: edEastPoint[1],
        AtDock: true,
        LeftDock: null,
        TimeStamp: wsdotDate(1710110000),
        ScheduledDeparture: wsdotDate(1710110120),
      }),
    ]);

    FerryTempo.processFerryData([
      buildVessel({
        VesselID: 55,
        VesselName: 'Route Scoped Average Boat',
        Mmsi: 555000555,
        Latitude: edEastPoint[0],
        Longitude: edEastPoint[1],
        AtDock: false,
        LeftDock: wsdotDate(1710110120),
        Eta: wsdotDate(1710110600),
        TimeStamp: wsdotDate(1710110130),
        ScheduledDeparture: wsdotDate(1710110120),
      }),
    ]);

    FerryTempo.processFerryData([
      buildVessel({
        VesselID: 55,
        VesselName: 'Route Scoped Average Boat',
        Mmsi: 555000555,
        DepartingTerminalID: 12,
        DepartingTerminalName: 'Kingston',
        DepartingTerminalAbbrev: 'KIN',
        ArrivingTerminalName: 'Edmonds',
        ArrivingTerminalAbbrev: 'EDM',
        Latitude: edWestPoint[0],
        Longitude: edWestPoint[1],
        AtDock: true,
        LeftDock: null,
        Eta: null,
        TimeStamp: wsdotDate(1710110600),
        ScheduledDeparture: wsdotDate(1710110900),
      }),
    ]);

    const seaBICycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 55,
        VesselName: 'Route Scoped Average Boat',
        Mmsi: 555000555,
        DepartingTerminalID: 7,
        DepartingTerminalName: 'Seattle',
        DepartingTerminalAbbrev: 'P52',
        ArrivingTerminalName: 'Bainbridge Island',
        ArrivingTerminalAbbrev: 'BBI',
        Latitude: seaBIPoint[0],
        Longitude: seaBIPoint[1],
        AtDock: false,
        LeftDock: wsdotDate(1710111120),
        Eta: wsdotDate(1710113100),
        TimeStamp: wsdotDate(1710111130),
        ScheduledDeparture: wsdotDate(1710111120),
        OpRouteAbbrev: ['sea-bi'],
      }),
    ]);

    expect(seaBICycle['sea-bi']['boatData']['boat1']['CrossingTimeAverage']).toBe(0);
  });

  test('sets port ETA to the computed arrival clock time that matches ArrivalTimeMinus', () => {
    const eastPoint = routePositionData['ed-king'][routePositionData['ed-king'].length - 1];

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 10,
        VesselName: 'Computed ETA Boat',
        Mmsi: 101010101,
        Latitude: eastPoint[0],
        Longitude: eastPoint[1],
        AtDock: false,
        LeftDock: wsdotDate(1710600000),
        Eta: wsdotDate(1710602000),
        TimeStamp: wsdotDate(1710600100),
        ScheduledDeparture: wsdotDate(1710600000),
      }),
    ]);

    expect(ferryTempoData['ed-king']['boatData']['boat1']['ETA']).toBe(1710602000);
    expect(ferryTempoData['ed-king']['boatData']['boat1']['EstimatedETA']).toBeNull();
    expect(ferryTempoData['ed-king']['boatData']['boat1']['ArrivalTimeMinus']).toBe(2000);
    expect(ferryTempoData['ed-king']['portData']['portWN']['PortETA']).toBe(1710602100);
    expect(ferryTempoData['ed-king']['portData']['portWN']['PortArrivalTimeMinus']).toBe(2000);
  });

  test('estimates ETA when WSF does not provide one for an underway boat', () => {
    const routePoints = routePositionData['ed-king'];
    const midRoutePoint = routePoints[Math.floor(routePoints.length / 2)];

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 11,
        VesselName: 'Estimated ETA Boat',
        Mmsi: 111111110,
        Latitude: midRoutePoint[0],
        Longitude: midRoutePoint[1],
        AtDock: false,
        LeftDock: null,
        Eta: null,
        TimeStamp: wsdotDate(1710610000),
        ScheduledDeparture: wsdotDate(1710610000),
      }),
    ]);
    const boat = ferryTempoData['ed-king']['boatData']['boat1'];
    const port = ferryTempoData['ed-king']['portData']['portWN'];

    expect(boat.ETA).toBe(0);
    expect(boat.EstimatedETA).toBeGreaterThan(1710610000);
    expect(boat.ArrivalTimeMinus).toBe(boat.EstimatedETA - 1710610000);
    expect(port.PortETA).toBe(boat.EstimatedETA);
    expect(port.PortArrivalTimeMinus).toBe(boat.ArrivalTimeMinus);
  });

  test('annotates the port sailing log with observed departure delays and crossing times', () => {
    const westPoint = routePositionData['ed-king'][0];
    const eastPoint = routePositionData['ed-king'][routePositionData['ed-king'].length - 1];
    const scheduleData = {
      'ed-king': {
        TerminalCombos: [
          {
            DepartingTerminalID: 8,
            ArrivingTerminalID: 12,
            Times: [
              { DepartingTime: wsdotDate(1710700000) },
              { DepartingTime: wsdotDate(1710701800) },
            ],
          },
        ],
      },
    };
    const vessel = buildVessel({
      VesselID: 11,
      VesselName: 'Sailing Log Boat',
      Mmsi: 111111112,
      Latitude: eastPoint[0],
      Longitude: eastPoint[1],
      AtDock: false,
      LeftDock: wsdotDate(1710700060),
      Eta: wsdotDate(1710702000),
      TimeStamp: wsdotDate(1710700100),
      ScheduledDeparture: wsdotDate(1710700000),
    });

    FerryTempo.processFerryData([vessel], scheduleData);
    const arrivalCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 11,
        VesselName: 'Sailing Log Boat',
        Mmsi: 111111112,
        DepartingTerminalID: 12,
        DepartingTerminalName: 'Kingston',
        DepartingTerminalAbbrev: 'KIN',
        ArrivingTerminalName: 'Edmonds',
        ArrivingTerminalAbbrev: 'EDM',
        Latitude: westPoint[0],
        Longitude: westPoint[1],
        AtDock: true,
        LeftDock: null,
        Eta: null,
        TimeStamp: wsdotDate(1710702060),
        ScheduledDeparture: wsdotDate(1710703600),
      }),
    ], scheduleData);

    expect(arrivalCycle['ed-king']['portData']['portES']['PortSailingLog']).toEqual([
      [
        1710700000,
        60,
        2000,
        1,
      ],
      [1710701800, null, null, null],
    ]);
  });

  test('adds port schedule assignments and next scheduled sailing from schedule data', () => {
    const scheduleData = {
      'ed-king': {
        TerminalCombos: [
          {
            DepartingTerminalID: 8,
            ArrivingTerminalID: 12,
            Times: [
              { DepartingTime: wsdotDate(1710200000), VesselPositionNum: 1 },
              { DepartingTime: wsdotDate(1710200600), VesselPositionNum: 2 },
            ],
          },
          {
            DepartingTerminalID: 12,
            ArrivingTerminalID: 8,
            Times: [
              { DepartingTime: wsdotDate(1710200300), VesselPositionNum: null },
            ],
          },
        ],
      },
    };

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 6,
        VesselName: 'Schedule Test Boat',
        Mmsi: 666666666,
        TimeStamp: wsdotDate(1710200100),
        ScheduledDeparture: wsdotDate(1710200600),
      }),
    ], scheduleData);

    expect(ferryTempoData['ed-king']['portData']['portES']['PortScheduleList']).toBeUndefined();
    expect(ferryTempoData['ed-king']['portData']['portES']['PortScheduleAssignments']).toBeUndefined();
    expect(ferryTempoData['ed-king']['portData']['portES']['PortSailingLog']).toEqual([
      [1710200000, null, null, 1],
      [1710200600, null, null, 2],
    ]);
    expect(ferryTempoData['ed-king']['portData']['portES']['NextScheduledDeparture']).toBe(1710200600);
    expect(ferryTempoData['ed-king']['portData']['portWN']['PortScheduleList']).toBeUndefined();
    expect(ferryTempoData['ed-king']['portData']['portWN']['PortScheduleAssignments']).toBeUndefined();
    expect(ferryTempoData['ed-king']['portData']['portWN']['PortSailingLog']).toEqual([
      [1710200300, null, null, null],
    ]);
    expect(ferryTempoData['ed-king']['portData']['portWN']['NextScheduledDeparture']).toBe(1710200300);
  });

  test('keeps an overdue scheduled departure active until the boat leaves', () => {
    const scheduleData = {
      'ed-king': {
        TerminalCombos: [
          {
            DepartingTerminalID: 8,
            ArrivingTerminalID: 12,
            Times: [
              { DepartingTime: wsdotDate(1710300000) },
              { DepartingTime: wsdotDate(1710301800) },
            ],
          },
        ],
      },
    };

    const overdueAtDockCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 7,
        VesselName: 'Late Schedule Boat',
        Mmsi: 777777777,
        AtDock: true,
        LeftDock: null,
        TimeStamp: wsdotDate(1710301500),
        ScheduledDeparture: wsdotDate(1710300000),
      }),
    ], scheduleData);

    expect(overdueAtDockCycle['ed-king']['portData']['portES']['NextScheduledDeparture']).toBe(1710300000);

    const departedCycle = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 7,
        VesselName: 'Late Schedule Boat',
        Mmsi: 777777777,
        AtDock: false,
        LeftDock: wsdotDate(1710301500),
        TimeStamp: wsdotDate(1710301510),
        ScheduledDeparture: wsdotDate(1710300000),
      }),
    ], scheduleData);

    expect(departedCycle['ed-king']['portData']['portES']['NextScheduledDeparture']).toBe(1710301800);
  });

  test('expires an overdue at-dock departure when the next scheduled slot passes', () => {
    const scheduleData = {
      'ed-king': {
        TerminalCombos: [
          {
            DepartingTerminalID: 8,
            ArrivingTerminalID: 12,
            Times: [
              { DepartingTime: wsdotDate(1710400000) },
              { DepartingTime: wsdotDate(1710401800) },
              { DepartingTime: wsdotDate(1710403600) },
            ],
          },
        ],
      },
    };

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 8,
        VesselName: 'Stale Schedule Boat',
        Mmsi: 888888888,
        AtDock: true,
        LeftDock: null,
        TimeStamp: wsdotDate(1710401900),
        ScheduledDeparture: wsdotDate(1710400000),
      }),
    ], scheduleData);

    expect(ferryTempoData['ed-king']['portData']['portES']['NextScheduledDeparture']).toBe(1710403600);
  });

  test('does not use an active scheduled departure outside the port schedule list', () => {
    const scheduleData = {
      'ed-king': {
        TerminalCombos: [
          {
            DepartingTerminalID: 8,
            ArrivingTerminalID: 12,
            Times: [
              { DepartingTime: wsdotDate(1710410000) },
              { DepartingTime: wsdotDate(1710411800) },
            ],
          },
        ],
      },
    };

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 12,
        VesselName: 'Mismatched Schedule Boat',
        Mmsi: 121212121,
        AtDock: true,
        LeftDock: null,
        TimeStamp: wsdotDate(1710409000),
        ScheduledDeparture: wsdotDate(1710400000),
      }),
    ], scheduleData);

    expect(ferryTempoData['ed-king']['portData']['portES']['PortScheduleList']).toBeUndefined();
    expect(ferryTempoData['ed-king']['portData']['portES']['PortScheduleAssignments']).toBeUndefined();
    expect(ferryTempoData['ed-king']['portData']['portES']['PortSailingLog']).toEqual([
      [1710410000, null, null, null],
      [1710411800, null, null, null],
    ]);
    expect(ferryTempoData['ed-king']['portData']['portES']['NextScheduledDeparture']).toBe(1710410000);
  });

  test('adds terminal alerts and vehicle spaces to port data', () => {
    const scheduleData = {
      'ed-king': {
        TerminalCombos: [
          {
            DepartingTerminalID: 8,
            ArrivingTerminalID: 12,
            Times: [
              { DepartingTime: wsdotDate(1710500600) },
            ],
          },
        ],
      },
    };
    const terminalBulletinData = [
      {
        TerminalID: 8,
        Bulletins: [
          {
            BulletinTitle: 'Dock alert',
            BulletinText: '<p>Use lane &amp; booth 2.</p>',
            BulletinSortSeq: 1,
            BulletinLastUpdated: wsdotDate(1710500000),
          },
        ],
      },
    ];
    const terminalSailingSpaceData = [
      {
        TerminalID: 8,
        DepartingSpaces: [
          {
            Departure: wsdotDate(1710500600),
            IsCancelled: false,
            VesselID: 1,
            VesselName: 'Test Boat',
            MaxSpaceCount: 144,
            SpaceForArrivalTerminals: [
              {
                TerminalID: 12,
                TerminalName: 'Kingston',
                DisplayDriveUpSpace: true,
                DriveUpSpaceCount: 42,
                DriveUpSpaceHexColor: '#00FF00',
                DisplayReservableSpace: false,
                ReservableSpaceCount: null,
                ReservableSpaceHexColor: null,
                MaxSpaceCount: 144,
                ArrivalTerminalIDs: [12],
              },
            ],
          },
        ],
      },
    ];
    const terminalLocationData = [
      {
        TerminalID: 8,
        Latitude: 47.813313,
        Longitude: -122.384644,
      },
      {
        TerminalID: 12,
        Latitude: 47.794518,
        Longitude: -122.494526,
      },
    ];

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 9,
        VesselName: 'Terminal Data Boat',
        Mmsi: 999999999,
        TimeStamp: wsdotDate(1710500100),
        ScheduledDeparture: wsdotDate(1710500600),
      }),
    ], scheduleData, null, terminalBulletinData, terminalSailingSpaceData, terminalLocationData);

    expect(ferryTempoData['ed-king']['portData']['portES']['TerminalAlerts']).toEqual([
      {
        Title: 'Dock alert',
        Text: 'Use lane & booth 2.',
        SortSeq: 1,
        LastUpdated: 1710500000,
      },
    ]);
    expect(ferryTempoData['ed-king']['portData']['portES']).toMatchObject({
      TerminalLatitude: 47.813313,
      TerminalLongitude: -122.384644,
    });
    expect(ferryTempoData['ed-king']['portData']['portWN']).toMatchObject({
      TerminalLatitude: 47.794518,
      TerminalLongitude: -122.494526,
    });
    expect(ferryTempoData['ed-king']['portData']['portES']['VehicleSpacesRemaining']).toBe(42);
    expect(ferryTempoData['ed-king']['portData']['portES']['VehicleSpaces']).toMatchObject({
      Departure: 1710500600,
      IsCancelled: false,
      DisplayDriveUpSpace: true,
      DriveUpSpaceCount: 42,
      MaxSpaceCount: 144,
    });
    expect(ferryTempoData['ed-king']['portData']['portES']['VehicleSpaces']).not.toHaveProperty('VesselID');
    expect(ferryTempoData['ed-king']['portData']['portES']['VehicleSpaces']).not.toHaveProperty('DriveUpSpaceHexColor');
    expect(Object.keys(ferryTempoData['ed-king']['portData']['portES']).slice(-2)).toEqual([
      'TerminalAlerts',
      'PortSailingLog',
    ]);
  });

  test('adds WSF schedule alerts to route data', () => {
    const scheduleAlertData = [
      {
        AlertFullTitle: 'Fare changes begin Friday, May 1',
        RouteAlertText: 'Fare changes begin Friday, May 1',
        BulletinText: '<p>Fare changes begin Friday, May 1 for Mother\u00e2\u20ac\u2122s Day.\u00c2 </p>',
        RouteAlertFlag: true,
        BulletinFlag: true,
        CommunicationFlag: false,
        AffectedRouteIDs: [6, 7],
        PublishDate: wsdotDate(1710600000),
        SortSeq: 2,
      },
      {
        AlertFullTitle: 'Other route alert',
        RouteAlertText: 'Other route alert',
        RouteAlertFlag: true,
        BulletinFlag: true,
        CommunicationFlag: false,
        AffectedRouteIDs: [8],
        PublishDate: wsdotDate(1710600000),
      },
    ];

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 10,
        VesselName: 'Schedule Alert Boat',
        Mmsi: 101010101,
      }),
    ], null, scheduleAlertData);

    expect(ferryTempoData['ed-king'].RouteAlerts).toEqual([
      {
        Title: 'Fare changes begin Friday, May 1',
        Text: "Fare changes begin Friday, May 1 for Mother's Day.",
        Source: 'ScheduleAlert',
        PublishDate: 1710600000,
        SortSeq: 2,
        AffectedRouteIDs: [6, 7],
        RouteAlertFlag: true,
        BulletinFlag: true,
        CommunicationFlag: false,
      },
    ]);
  });

  test('promotes duplicate terminal bulletins to route alerts', () => {
    const terminalBulletinData = [
      {
        TerminalID: 8,
        Bulletins: [
          {
            BulletinTitle: 'Elevator outage',
            BulletinText: '<p>Elevator service is unavailable.</p>',
            BulletinSortSeq: 2,
            BulletinLastUpdated: wsdotDate(1710700000),
          },
          {
            BulletinTitle: 'Edmonds only',
            BulletinText: '<p>Use lane 3.</p>',
            BulletinSortSeq: 3,
            BulletinLastUpdated: wsdotDate(1710700100),
          },
        ],
      },
      {
        TerminalID: 12,
        Bulletins: [
          {
            BulletinTitle: 'Elevator outage',
            BulletinText: '<p>Elevator service is unavailable.</p>',
            BulletinSortSeq: 1,
            BulletinLastUpdated: wsdotDate(1710700000),
          },
        ],
      },
    ];

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 11,
        VesselName: 'Duplicate Alert Boat',
        Mmsi: 111111110,
      }),
    ], null, null, terminalBulletinData);

    expect(ferryTempoData['ed-king'].RouteAlerts).toEqual([
      {
        Title: 'Elevator outage',
        Text: 'Elevator service is unavailable.',
        SortSeq: 1,
        LastUpdated: 1710700000,
        Source: 'TerminalBulletin',
        TerminalIDs: [12, 8],
      },
    ]);
    expect(ferryTempoData['ed-king']['portData']['portWN']['TerminalAlerts']).toEqual([]);
    expect(ferryTempoData['ed-king']['portData']['portES']['TerminalAlerts']).toEqual([
      {
        Title: 'Edmonds only',
        Text: 'Use lane 3.',
        SortSeq: 3,
        LastUpdated: 1710700100,
      },
    ]);
  });
});
