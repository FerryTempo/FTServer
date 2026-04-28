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
        Eta: wsdotDate(1710100600),
        TimeStamp: wsdotDate(1710100130),
        ScheduledDeparture: wsdotDate(1710100120),
      }),
    ]);

    expect(departureCycle['ed-king']['boatData']['boat1']['StopTimerAverage']).toBe(120);
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
        TimeStamp: wsdotDate(1710100600),
        ScheduledDeparture: wsdotDate(1710100900),
      }),
    ]);

    expect(arrivalCycle['ed-king']['boatData']['boat1']['CrossingTimeAverage']).toBe(480);
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

    expect(ferryTempoData['ed-king']['boatData']['boat1']['BoatETA']).toBe(1710602000);
    expect(ferryTempoData['ed-king']['boatData']['boat1']['ArrivalTimeMinus']).toBe(2000);
    expect(ferryTempoData['ed-king']['portData']['portWN']['PortETA']).toBe(1710602100);
    expect(ferryTempoData['ed-king']['portData']['portWN']['PortArrivalTimeMinus']).toBe(2000);
  });

  test('records each observed departure once in the port sailing log', () => {
    const eastPoint = routePositionData['ed-king'][routePositionData['ed-king'].length - 1];
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

    FerryTempo.processFerryData([vessel]);
    const repeatedCycle = FerryTempo.processFerryData([vessel]);

    expect(repeatedCycle['ed-king']['portData']['portES']['PortSailingLog']).toEqual([
      {
        ScheduledDeparture: 1710700000,
        LeftDock: 1710700060,
        DepartureDelay: 60,
        VesselID: 11,
        VesselName: 'Sailing Log Boat',
      },
    ]);
  });

  test('adds port schedule lists and next scheduled sailing from schedule data', () => {
    const scheduleData = {
      'ed-king': {
        TerminalCombos: [
          {
            DepartingTerminalID: 8,
            ArrivingTerminalID: 12,
            Times: [
              { DepartingTime: wsdotDate(1710200000) },
              { DepartingTime: wsdotDate(1710200600) },
            ],
          },
          {
            DepartingTerminalID: 12,
            ArrivingTerminalID: 8,
            Times: [
              { DepartingTime: wsdotDate(1710200300) },
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

    expect(ferryTempoData['ed-king']['portData']['portES']['PortScheduleList']).toEqual([
      1710200000,
      1710200600,
    ]);
    expect(ferryTempoData['ed-king']['portData']['portES']['NextScheduledDeparture']).toBe(1710200600);
    expect(ferryTempoData['ed-king']['portData']['portWN']['PortScheduleList']).toEqual([1710200300]);
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

    const ferryTempoData = FerryTempo.processFerryData([
      buildVessel({
        VesselID: 9,
        VesselName: 'Terminal Data Boat',
        Mmsi: 999999999,
        TimeStamp: wsdotDate(1710500100),
        ScheduledDeparture: wsdotDate(1710500600),
      }),
    ], scheduleData, terminalBulletinData, terminalSailingSpaceData);

    expect(ferryTempoData['ed-king']['portData']['portES']['TerminalAlerts']).toEqual([
      {
        Title: 'Dock alert',
        Text: 'Use lane & booth 2.',
        Html: '<p>Use lane &amp; booth 2.</p>',
        SortSeq: 1,
        LastUpdated: 1710500000,
      },
    ]);
    expect(ferryTempoData['ed-king']['portData']['portES']['VehicleSpacesRemaining']).toBe(42);
    expect(ferryTempoData['ed-king']['portData']['portES']['VehicleSpaces']).toMatchObject({
      Departure: 1710500600,
      VesselID: 1,
      VesselName: 'Test Boat',
      ArrivingTerminalID: 12,
      DriveUpSpaceCount: 42,
      MaxSpaceCount: 144,
    });
  });
});
