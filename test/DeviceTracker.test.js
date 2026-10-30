import DeviceTracker, { ACTIVE_WINDOW_SECONDS } from '../src/DeviceTracker.js';

// Sailing days of 100000 seconds keep the tests independent of the clock and time zone.
const sailingDayId = (epochSeconds) => Math.floor(epochSeconds / 100000);
const START = 1000000;

describe('DeviceTracker', () => {
  test('counts each cid once and keeps its latest route', () => {
    const tracker = new DeviceTracker({ sailingDayId });
    tracker.record('a', 'sea-bi', '203.0.113.1', START);
    tracker.record('a', 'ed-king', '203.0.113.1', START + 10);
    tracker.record('b', 'sea-bi', '203.0.113.2', START + 20);

    const summary = tracker.getSummary(START + 30);
    expect(summary.activeNow).toBe(2);
    expect(summary.activeByRoute).toEqual({ 'ed-king': 1, 'sea-bi': 1 });
    expect(summary.devices.map((device) => device.cid)).toEqual(['b', 'a']);
    expect(summary.devices[1]).toMatchObject({
      routeId: 'ed-king',
      ip: '203.0.113.1',
      firstSeen: START,
      lastSeen: START + 10,
      requestCount: 2,
      active: true,
    });
  });

  test('separates active, last hour and sailing day counts', () => {
    const tracker = new DeviceTracker({ sailingDayId });
    tracker.record('active', 'sea-bi', '203.0.113.1', START + 4000);
    tracker.record('recent', 'sea-bi', '203.0.113.1', START + 4000 - ACTIVE_WINDOW_SECONDS - 100);
    tracker.record('earlier', 'sea-bi', '203.0.113.1', START);

    const summary = tracker.getSummary(START + 4000);
    expect(summary.activeNow).toBe(1);
    expect(summary.lastHour).toBe(2);
    expect(summary.today).toBe(3);
    expect(summary.activeByRoute).toEqual({ 'sea-bi': 1 });
    expect(summary.devices.find((device) => device.cid === 'recent').active).toBe(false);
  });

  test('leaves out idle devices from an earlier sailing day', () => {
    const tracker = new DeviceTracker({ sailingDayId });
    tracker.record('yesterday', 'sea-bi', '203.0.113.1', 1099000);
    tracker.record('rollover', 'sea-bi', '203.0.113.1', 1099990);
    tracker.record('today', 'sea-bi', '203.0.113.1', 1100005);

    const summary = tracker.getSummary(1100010);
    expect(summary.devices.map((device) => device.cid)).toEqual(['today', 'rollover']);
    expect(summary.activeNow).toBe(2);
    expect(summary.today).toBe(1);
  });

  test('forgets devices after the retention window', () => {
    const tracker = new DeviceTracker({ sailingDayId });
    tracker.record('old', 'sea-bi', '203.0.113.1', START);

    tracker.getSummary(START + 27 * 60 * 60);
    expect(tracker.devices.size).toBe(0);
  });

  test('ignores missing and overlong cids', () => {
    const tracker = new DeviceTracker({ sailingDayId });
    tracker.record('', 'sea-bi', '203.0.113.1', START);
    tracker.record('x'.repeat(65), 'sea-bi', '203.0.113.1', START);

    expect(tracker.getSummary(START).today).toBe(0);
  });
});
