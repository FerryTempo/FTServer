import { createGen1Progress } from '../src/legacy/gen1/Progress.js';

const FALLBACK = '0,0,0,DEPARTING:1,1,0,ARRIVING:-1';
const START = 1800000000000;
let time;
let adapter;

function boat(overrides = {}) {
  return {
    VesselID: 1, InService: true, OpRouteAbbrev: ['sea-bi'], AtDock: false,
    DepartingTerminalID: 3, ArrivingTerminalID: 7,
    Latitude: 47.6048, Longitude: -122.42, Speed: 18, Heading: 90,
    TimeStamp: `/Date(${START - 5000}-0700)/`,
    ...overrides,
  };
}

function read() {
  const headers = {};
  let body;
  adapter.handler({}, {
    set(name, value) { headers[name] = value; },
    type(value) { headers.type = value; return this; },
    send(value) { body = value; },
  });
  expect(headers).toEqual({'Cache-Control': 'no-store', type: 'text/plain'});
  return body;
}

beforeEach(() => {
  time = START;
  adapter = createGen1Progress({now: () => time});
});

test('startup and expired snapshots return the exact legacy stale response', () => {
  expect(read()).toBe(FALLBACK);
  adapter.update([boat({AtDock: true})]);
  time += 60000;
  expect(read()).not.toBe(FALLBACK);
  time++;
  expect(read()).toBe(FALLBACK);
});

test('orders by vessel ID without mutating the shared feed and filters other services', () => {
  const locations = Object.freeze([
    Object.freeze(boat({VesselID: 20, AtDock: true, DepartingTerminalID: 7, ArrivingTerminalID: 3})),
    Object.freeze(boat({VesselID: 10, AtDock: true})),
    boat({VesselID: 2, InService: false}),
    boat({VesselID: 3, OpRouteAbbrev: ['ed-king']}),
  ]);
  adapter.update(locations);
  expect(read()).toBe('0,0,0,DEPARTING:1,1,0,ARRIVING:15000');
  expect(locations[0].VesselID).toBe(20);
});

test('pads empty and single-vessel fresh responses', () => {
  adapter.update([]);
  expect(read()).toBe('0,0,0,DEPARTING:1,1,0,ARRIVING:15000');
  adapter.update([boat({AtDock: true})]);
  expect(read()).toBe('0,0,0,DEPARTING:1,1,0,ARRIVING:15000');
});

test.each([
  [90, 3, 7, 'DEPARTING', 1],
  [270, 7, 3, 'ARRIVING', -1],
])('predicts motion with correct direction and millisecond timing (%s degrees)',
    (Heading, DepartingTerminalID, ArrivingTerminalID, direction, sign) => {
      adapter.update([boat({Heading, DepartingTerminalID, ArrivingTerminalID})]);
      const parts = read().split(':');
      const [start, end, age, label] = parts[0].split(',');
      expect(Number(start)).toBeGreaterThan(0);
      expect(Number(start)).toBeLessThan(1);
      expect((Number(end) - Number(start)) * sign).toBeGreaterThan(0);
      expect(age).toBe('5000');
      expect(label).toBe(direction);
      expect(parts[2]).toBe('15000');
      time += 1000;
      expect(read().split(':')[0].split(',')[2]).toBe('6000');
    });

test.each([
  {Latitude: NaN}, {Longitude: null}, {Speed: -1}, {Heading: undefined},
  {TimeStamp: 'invalid'}, {TimeStamp: `/Date(${START - 60001})/`},
])('invalid or stale underway telemetry returns the stale marker: %p', (overrides) => {
  adapter.update([boat(overrides)]);
  expect(read()).toBe(FALLBACK);
});

test('fresh data recovers after an outage; invalid updates cannot refresh the cache', () => {
  adapter.update([boat({AtDock: true})]);
  time += 60001;
  adapter.update({error: 'upstream error'});
  expect(read()).toBe(FALLBACK);
  adapter.update([boat({AtDock: true})]);
  expect(read()).not.toBe(FALLBACK);
});

test('future timestamps never produce a negative unsigned client offset', () => {
  adapter.update([boat({TimeStamp: `/Date(${START + 1000})/`})]);
  expect(read().split(':')[0].split(',')[2]).toBe('0');
});
