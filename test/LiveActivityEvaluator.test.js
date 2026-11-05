import NotificationStore from '../src/notifications/NotificationStore.js';
import LiveActivityStore from '../src/notifications/LiveActivityStore.js';
import LiveActivityEvaluator, { leadSeconds } from '../src/notifications/LiveActivityEvaluator.js';

const departure = 1_800_000_000;

function snapshot(boatOverrides) {
  if (!boatOverrides) {
    return { 'sea-bi': { boatData: {} } };
  }
  return {
    'sea-bi': {
      boatData: {
        boat1: {
          Direction: 'ES',
          ScheduledDeparture: departure,
          VesselName: 'Wenatchee',
          AtDock: true,
          LeftDock: null,
          ETA: null,
          EstimatedETA: null,
          DepartureDelay: 0,
          ...boatOverrides,
        },
      },
    },
  };
}

describe('LiveActivityEvaluator', () => {
  let notificationStore;
  let store;
  let pushes;
  let evaluator;

  beforeEach(() => {
    notificationStore = new NotificationStore(':memory:');
    store = new LiveActivityStore(notificationStore.db);
    pushes = [];
    evaluator = new LiveActivityEvaluator(store, {
      sendLiveActivity: async (token, aps, options) => {
        pushes.push({ token, aps, priority: options.priority });
        return { sent: true };
      },
    });
    store.upsertStartToken({ deviceId: 'd1', token: 'start-token', environment: 'sandbox' });
  });

  afterEach(() => notificationStore.close());

  function track(status = 'pending') {
    return store.create({
      deviceId: 'd1',
      environment: 'sandbox',
      routeId: 'sea-bi',
      direction: 'ES',
      departingTerminalAbbrev: 'BI',
      departingName: 'Bainbridge',
      arrivingName: 'Seattle',
      scheduledDeparture: departure,
      status,
    });
  }

  test('starts with push-to-start at the lead time, not before', async () => {
    const id = track();
    await evaluator.process(snapshot(), departure - leadSeconds - 60);
    expect(pushes).toHaveLength(0);

    await evaluator.process(snapshot(), departure - leadSeconds);
    expect(pushes).toHaveLength(1);
    expect(pushes[0].token).toBe('start-token');
    expect(pushes[0].aps.event).toBe('start');
    expect(pushes[0].aps.attributes).toMatchObject({ trackingId: Number(id), scheduledDeparture: departure });
    expect(pushes[0].aps['content-state'].phase).toBe('waiting');

    await evaluator.process(snapshot(), departure - leadSeconds + 10);
    expect(pushes).toHaveLength(1);
  });

  test('updates through the crossing and ends on arrival', async () => {
    const id = track('started');
    store.setUpdateToken(id, 'd1', 'update-token');

    await evaluator.process(snapshot({}), departure - 600);
    expect(pushes.at(-1).aps['content-state']).toMatchObject({ phase: 'atDock', vesselName: 'Wenatchee' });
    expect(pushes.at(-1).priority).toBe(5);

    expect(pushes.at(-1).aps['content-state'].minutes).toBe(-10);
    await evaluator.process(snapshot({}), departure - 590);
    expect(pushes).toHaveLength(1); // unchanged within the minute

    const underway = { AtDock: false, LeftDock: departure + 120, ETA: departure + 2220 };
    await evaluator.process(snapshot(underway), departure + 130);
    expect(pushes.at(-1).aps['content-state']).toMatchObject({ phase: 'underway', eta: departure + 2220 });
    expect(pushes.at(-1).aps.alert.title).toBe('Wenatchee left Bainbridge');
    expect(pushes.at(-1).priority).toBe(10);

    await evaluator.process(snapshot({ ...underway, ETA: departure + 2230 }), departure + 140);
    expect(pushes).toHaveLength(2); // rounds to the same minute

    await evaluator.process(snapshot({ ...underway, ETA: departure + 2230 }), departure + 1930);
    expect(pushes.at(-1).aps.alert.title).toBe('Wenatchee is 5 minutes from Seattle');
    expect(pushes.at(-1).priority).toBe(10);

    await evaluator.process(snapshot({ ...underway, ETA: departure + 2230 }), departure + 1990);
    expect(pushes.at(-1).aps.alert).toBeUndefined(); // the 5-minute alert fires once

    await evaluator.process(snapshot(), departure + 2300);
    expect(pushes.at(-1).aps.event).toBe('end');
    expect(pushes.at(-1).aps['content-state'].phase).toBe('arrived');
    expect(pushes.at(-1).aps.alert.title).toBe('Wenatchee arrived in Seattle');
    expect(store.getOpen()).toHaveLength(0);
  });

  test('an activity started mid-crossing updates without a departure alert', async () => {
    const id = track('started');
    store.setUpdateToken(id, 'd1', 'update-token');
    await evaluator.process(snapshot({ AtDock: false, LeftDock: departure + 60, ETA: departure + 2100 }), departure + 900);
    expect(pushes.at(-1).aps['content-state'].phase).toBe('underway');
    expect(pushes.at(-1).aps.alert).toBeUndefined();
    expect(pushes.at(-1).priority).toBe(5);
  });

  test('waiting names the inbound boat the schedule assigns, with its lateness', async () => {
    const id = track('started');
    store.setUpdateToken(id, 'd1', 'update-token');
    const data = {
      'sea-bi': {
        portData: { portWN: { PortSailingStates: [{ ScheduledDeparture: departure, VesselPosition: 2 }] } },
        boatData: {
          boat2: {
            Direction: 'WN', ScheduledDeparture: departure - 2400, VesselName: 'Puyallup',
            AtDock: false, ArrivalDelay: 310,
          },
        },
      },
    };
    await evaluator.process(data, departure - 900);
    expect(pushes.at(-1).aps['content-state']).toMatchObject({
      phase: 'waiting', vesselName: 'Puyallup', inbound: 'underway', inboundTo: 'BI', arrivalDelay: 300,
    });

    data['sea-bi'].boatData.boat2 = { ...data['sea-bi'].boatData.boat2, AtDock: true };
    await evaluator.process(data, departure - 840);
    expect(pushes.at(-1).aps['content-state']).toMatchObject({ inbound: 'docked', arrivalDelay: null });
  });

  test('a stopped sailing is no longer pushed', async () => {
    track();
    store.endForSailing('d1', 'sea-bi', departure);
    await evaluator.process(snapshot(), departure - leadSeconds);
    expect(pushes).toHaveLength(0);
  });
});
