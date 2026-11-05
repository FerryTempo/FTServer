import FerryTempo, {buildTriangleItineraries} from '../src/FerryTempo.js';
import routePositionData from '../data/RoutePositionData.js';

function wsdotDate(epochSeconds) {
  return `/Date(${epochSeconds * 1000}-0800)/`;
}

const base = 1710000200;
const vashonPoint = routePositionData['f-v'][0];

const terminals = {
  FAU: {id: 9, name: 'Fauntleroy'},
  VAI: {id: 22, name: 'Vashon Island'},
  SOU: {id: 20, name: 'Southworth'},
};

// A WSF daily schedule for one triangle leg: [from, to, departure offset, VesselID, VesselName, position].
function legSchedule(rows) {
  const combos = {};
  for (const [from, to, offset, vesselID, vesselName, position] of rows) {
    const key = `${from}-${to}`;
    combos[key] ??= {
      DepartingTerminalID: terminals[from].id,
      DepartingTerminalName: terminals[from].name,
      ArrivingTerminalID: terminals[to].id,
      ArrivingTerminalName: terminals[to].name,
      Times: [],
    };
    combos[key].Times.push({
      DepartingTime: wsdotDate(base + offset),
      ArrivingTime: null,
      VesselID: vesselID,
      VesselName: vesselName,
      VesselPositionNum: position,
    });
  }
  return {TerminalCombos: Object.values(combos)};
}

function salishAtVashon(overrides = {}) {
  return {
    VesselID: 66,
    VesselName: 'Salish',
    Mmsi: 367480010,
    DepartingTerminalID: 22,
    DepartingTerminalName: 'Vashon Island',
    DepartingTerminalAbbrev: 'VAI',
    ArrivingTerminalID: null,
    ArrivingTerminalName: null,
    ArrivingTerminalAbbrev: null,
    Latitude: vashonPoint[0],
    Longitude: vashonPoint[1],
    Speed: 0,
    Heading: 198,
    InService: true,
    AtDock: true,
    LeftDock: null,
    Eta: null,
    ScheduledDeparture: null,
    OpRouteAbbrev: ['f-v-s'],
    VesselPositionNum: 3,
    TimeStamp: wsdotDate(base),
    VesselWatchShutMsg: 'Vessel out of service due to a shortage of crew',
    VesselWatchShutFlag: '0',
    ...overrides,
  };
}

describe('buildTriangleItineraries', () => {
  test('merges a stop-over sailing listed under both terminal pairs, Vashon first', () => {
    const itineraries = buildTriangleItineraries({
      'f-s': legSchedule([['FAU', 'SOU', 600, 66, 'Salish', 3]]),
      'f-v': legSchedule([['FAU', 'VAI', 600, 66, 'Salish', 3], ['VAI', 'FAU', 0, 66, 'Salish', 3]]),
    });

    expect(itineraries.get(66)).toEqual([
      {departingTime: base, departingTerminalID: 22, arrivingTerminalIDs: [9]},
      {departingTime: base + 600, departingTerminalID: 9, arrivingTerminalIDs: [22, 20]},
    ]);
  });

  test('is null without a triangle schedule', () => {
    expect(buildTriangleItineraries(null)).toBeNull();
    expect(buildTriangleItineraries({'ed-king': legSchedule([['FAU', 'VAI', 0, 1, 'X', 1]])})).toBeNull();
  });
});

describe('triangle boats WSF reports with no destination', () => {
  test('take the leg, destination and departure from their next scheduled sailing', () => {
    const scheduleData = {
      'f-v': legSchedule([['VAI', 'FAU', 900, 166, 'Salish', 3]]),
      's-v': legSchedule([['VAI', 'SOU', 2700, 166, 'Salish', 3]]),
    };
    const data = FerryTempo.processFerryData([salishAtVashon({VesselID: 166})], scheduleData);

    expect(data['f-v'].boatData.boat3).toMatchObject({
      VesselName: 'Salish',
      OnDuty: true,
      DepartingTerminalAbbrev: 'VAI',
      ArrivingTerminalAbbrev: 'FAU',
      ArrivingTerminalName: 'Fauntleroy',
      ScheduledDeparture: base + 900,
    });
    expect(data['s-v'].boatData.boat3).toBeUndefined();
  });

  test('are off duty when today\'s schedule has no sailings left for them', () => {
    const scheduleData = {
      'f-v': legSchedule([['VAI', 'FAU', 900, 19, 'Kittitas', 1]]),
      's-v': legSchedule([['VAI', 'SOU', 2700, 1, 'Cathlamet', 2]]),
    };
    // Seen on the Vashon leg earlier, so there's a remembered route to place it on.
    FerryTempo.processFerryData([salishAtVashon({
      VesselID: 266,
      ArrivingTerminalID: 9,
      ArrivingTerminalName: 'Fauntleroy',
      ArrivingTerminalAbbrev: 'FAU',
      TimeStamp: wsdotDate(base - 7200),
    })]);
    const data = FerryTempo.processFerryData([salishAtVashon({VesselID: 266})], scheduleData);

    expect(data['f-v'].boatData.boat3).toMatchObject({VesselName: 'Salish', OnDuty: false});
  });

  test('stay on duty after their last sailing only while it is under way', () => {
    const scheduleData = {
      'f-v': legSchedule([['VAI', 'FAU', -600, 366, 'Salish', 3]]),
    };
    const data = FerryTempo.processFerryData([salishAtVashon({VesselID: 366})], scheduleData);

    // 10 minutes late for its last sailing: still that sailing.
    expect(data['f-v'].boatData.boat3).toMatchObject({OnDuty: true, ArrivingTerminalAbbrev: 'FAU'});
  });

  test('keep the remembered leg when no schedule is loaded', () => {
    FerryTempo.processFerryData([salishAtVashon({
      VesselID: 466,
      ArrivingTerminalID: 20,
      ArrivingTerminalName: 'Southworth',
      ArrivingTerminalAbbrev: 'SOU',
      TimeStamp: wsdotDate(base - 7200),
    })]);
    const data = FerryTempo.processFerryData([salishAtVashon({VesselID: 466})]);

    expect(data['s-v'].boatData.boat3).toMatchObject({VesselName: 'Salish', OnDuty: true});
  });

  test('ignore a schedule that is not for today', () => {
    const scheduleData = {
      'f-v': legSchedule([['VAI', 'FAU', -2 * 86400, 19, 'Kittitas', 1]]),
    };
    FerryTempo.processFerryData([salishAtVashon({
      VesselID: 566,
      ArrivingTerminalID: 9,
      ArrivingTerminalName: 'Fauntleroy',
      ArrivingTerminalAbbrev: 'FAU',
      TimeStamp: wsdotDate(base - 7200),
    })]);
    const data = FerryTempo.processFerryData([salishAtVashon({VesselID: 566})], scheduleData);

    expect(data['f-v'].boatData.boat3).toMatchObject({OnDuty: true});
  });
});
