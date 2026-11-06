import { sailingPhase, sailingIsOver } from '../src/notifications/SailingPhase.js';

const departure = 1_800_000_000;

function data({ boat, state } = {}) {
  return {
    'sea-bi': {
      boatData: boat ? { boat1: { Direction: 'ES', ScheduledDeparture: departure, ...boat } } : {},
      portData: { portWN: { PortSailingStates: state ? [{ ScheduledDeparture: departure, State: state }] : [] } },
    },
  };
}

describe('sailingPhase', () => {
  test('a docked boat on the sailing is upcoming; crossing, underway', () => {
    expect(sailingPhase(data({ boat: { AtDock: true } }), 'sea-bi', 'ES', departure)).toBe('upcoming');
    expect(sailingPhase(data({ boat: { AtDock: false } }), 'sea-bi', 'ES', departure)).toBe('underway');
  });

  test('the port states decide without a boat', () => {
    expect(sailingPhase(data({ state: 'boarding' }), 'sea-bi', 'ES', departure)).toBe('upcoming');
    expect(sailingPhase(data({ state: 'departed' }), 'sea-bi', 'ES', departure)).toBe('done');
    expect(sailingPhase(data({ state: 'cancelled' }), 'sea-bi', 'ES', departure)).toBe('done');
  });

  test('over: done, or unknown and well past', () => {
    expect(sailingIsOver(data({ state: 'departed' }), 'sea-bi', 'ES', departure, departure - 60)).toBe(true);
    expect(sailingIsOver(data({ boat: { AtDock: false } }), 'sea-bi', 'ES', departure, departure + 900)).toBe(false);
    expect(sailingIsOver(null, 'sea-bi', 'ES', departure, departure + 300)).toBe(false);
    expect(sailingIsOver(null, 'sea-bi', 'ES', departure, departure + 3600)).toBe(true);
  });
});
