import FerryTempo, {buildTriangleItineraries, resolveTriangleSailing} from '../src/FerryTempo.js';
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

// A WSF daily schedule for one triangle leg: [from, to, departure offset, VesselID, VesselName, position,
// annotation].
function legSchedule(rows) {
  const combos = {};
  for (const [from, to, offset, vesselID, vesselName, position, annotation] of rows) {
    const key = `${from}-${to}`;
    combos[key] ??= {
      DepartingTerminalID: terminals[from].id,
      DepartingTerminalName: terminals[from].name,
      ArrivingTerminalID: terminals[to].id,
      ArrivingTerminalName: terminals[to].name,
      Annotations: [],
      Times: [],
    };
    const annotationIndexes = [];
    if (annotation) {
      combos[key].Annotations.push(annotation);
      annotationIndexes.push(combos[key].Annotations.length - 1);
    }
    combos[key].Times.push({
      DepartingTime: wsdotDate(base + offset),
      ArrivingTime: null,
      VesselID: vesselID,
      VesselName: vesselName,
      VesselPositionNum: position,
      AnnotationIndexes: annotationIndexes,
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

  test('stops first where WSF notes the other stop is via it', () => {
    const itineraries = buildTriangleItineraries({
      'f-s': legSchedule([['FAU', 'SOU', 0, 19, 'Kittitas', 1, 'Direct route - does not stop at Vashon.']]),
      'f-v': legSchedule([['FAU', 'VAI', 0, 19, 'Kittitas', 1, 'Via Southworth, crossing time 45 minutes.']]),
    });

    expect(itineraries.get(19)[0].arrivingTerminalIDs).toEqual([20, 22]);
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

describe('resolveTriangleSailing', () => {
  // The Kittitas, 2026-11-04 (offsets from 5:05): Fauntleroy 5:05 via Vashon to Southworth (Vashon 5:25),
  // Southworth 5:50 via Vashon (Vashon 6:15) to Fauntleroy, Fauntleroy 6:45 to Vashon.
  // Each test's boat has its own ID, so its sailing state starts fresh.
  const kittitasDay = (id) => ({
    'f-s': legSchedule([['FAU', 'SOU', 0, id, 'Kittitas', 1], ['SOU', 'FAU', 2700, id, 'Kittitas', 1]]),
    'f-v': legSchedule([
      ['FAU', 'VAI', 0, id, 'Kittitas', 1],
      ['VAI', 'FAU', 4200, id, 'Kittitas', 1],
      ['FAU', 'VAI', 6000, id, 'Kittitas', 1],
      ['VAI', 'FAU', 7800, id, 'Kittitas', 1],
    ]),
    's-v': legSchedule([['VAI', 'SOU', 1200, id, 'Kittitas', 1], ['SOU', 'VAI', 2700, id, 'Kittitas', 1]]),
  });
  const itineraries = buildTriangleItineraries(Object.fromEntries(['f-s', 'f-v', 's-v'].map((leg) => [
    leg,
    {TerminalCombos: [19, 119, 219, 319].flatMap((id) => kittitasDay(id)[leg].TerminalCombos)},
  ])));
  const at = (vesselID, terminal, offset, atDock, reported = 0) => resolveTriangleSailing(itineraries, vesselID, {
    terminalID: terminals[terminal].id,
    atDock,
    reportedDeparture: reported ? base + reported : 0,
    referenceTime: base + offset,
  });
  const itinerary = itineraries.get(19);

  test('keeps a boat on its sailing when WSF skips ahead to its next one', () => {
    const vesselID = 19;
    // Off Fauntleroy on the 5:05, then at Vashon with WSF reporting the 6:15 to Fauntleroy.
    at(vesselID, 'FAU', -120, true, 0);
    at(vesselID, 'FAU', 60, false);
    expect(at(vesselID, 'VAI', 1500, true, 4200).sailing).toBe(itinerary.find((s) => s.departingTime === base + 1200));
    expect(at(vesselID, 'VAI', 1740, false).sailing.arrivingTerminalIDs).toEqual([20]);
  });

  test('takes the next sailing after the one the boat left on, however late', () => {
    const vesselID = 119;
    // Off Southworth 12 minutes late on the 5:50, then at Vashon 23 minutes past its 6:15 stop-over leg.
    at(vesselID, 'SOU', 3300, true);
    at(vesselID, 'SOU', 3420, false);
    expect(at(vesselID, 'VAI', 5580, true, 7800).sailing.departingTime).toBe(base + 4200);
  });

  test('keeps WSF\'s sailing when it holds the boat on an earlier one', () => {
    expect(at(219, 'VAI', 4000, true, 1200).sailing.departingTime).toBe(base + 1200);
  });

  test('doesn\'t bind an empty move that leaves well before the sailing', () => {
    expect(at(319, 'FAU', 3600, true).sailing.departingTime).toBe(base + 6000);
    expect(at(319, 'FAU', 3700, false)).toBeNull();
  });

  test('says a boat with no sailings left is unscheduled', () => {
    expect(at(19, 'VAI', 7800 + 3600, true)).toEqual({unscheduled: true});
    expect(at(66, 'VAI', 0, true)).toEqual({unscheduled: true});
  });
});

describe('triangle boats WSF reports on a later sailing', () => {
  test('are shown on their scheduled sailing and leg', () => {
    const scheduleData = {
      'f-v': legSchedule([['VAI', 'FAU', 4200, 619, 'Kittitas', 1]]),
      's-v': legSchedule([['VAI', 'SOU', 1200, 619, 'Kittitas', 1]]),
    };
    const kittitas = salishAtVashon({
      VesselID: 619,
      VesselName: 'Kittitas',
      VesselPositionNum: 1,
      ArrivingTerminalID: 9,
      ArrivingTerminalName: 'Fauntleroy',
      ArrivingTerminalAbbrev: 'FAU',
      ScheduledDeparture: wsdotDate(base + 4200),
      TimeStamp: wsdotDate(base + 1500),
      VesselWatchShutMsg: '',
    });
    const data = FerryTempo.processFerryData([kittitas], scheduleData);

    expect(data['s-v'].boatData.boat1).toMatchObject({
      VesselName: 'Kittitas',
      ArrivingTerminalAbbrev: 'SOU',
      ScheduledDeparture: base + 1200,
    });
    expect(data['f-v'].boatData.boat1).toBeUndefined();
  });
});
