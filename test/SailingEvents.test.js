import StorageManager from '../src/StorageManager';

// PortSailingStates and PortVesselEvents (the sailing-events contract).
describe('Sailing states and vessel events', () => {
    const day = 1710000000;
    const key = 'sea-bi:portWN';
    let storage;

    beforeEach(() => {
        storage = new StorageManager();
    });

    test('a cancellation outranks every other state', () => {
        storage.setSailingCancelled(key, day + 600, day);
        storage.setSailingState(key, day + 600, 'departed', day + 700, 3, day);
        const states = storage.getSailingStates(key, [[day + 600, 1]], day);
        expect(states[0].State).toBe('cancelled');
    });

    test('a departed sailing carries its actual departure and vessel', () => {
        storage.setSailingState(key, day + 600, 'departed', day + 780, 3, day + 780);
        const [state] = storage.getSailingStates(key, [[day + 600, 1]], day + 800);
        expect(state).toMatchObject({State: 'departed', ActualDeparture: day + 780, VesselID: 3});
    });

    test('schedule statuses (boarding, upcoming) come through', () => {
        const states = storage.getSailingStates(key, [[day + 600, 1, 'boarding'], [day + 1800, 2]], day);
        expect(states.map((state) => state.State)).toEqual(['boarding', 'upcoming']);
    });

    test('a repeat departure within 15 minutes updates the first event', () => {
        const event = {boat: 3, kind: 'departure', terminal: 7, route: 'sea-bi', vesselPosition: 1};
        storage.recordVesselEvent(key, {...event, time: day + 600}, day + 600);
        storage.recordVesselEvent(key, {...event, time: day + 640}, day + 640);
        const events = storage.getVesselEvents(key, day + 700);
        expect(events).toHaveLength(1);
        expect(events[0]).toMatchObject({Kind: 'departure', Time: day + 640, VesselID: 3, ScheduledDeparture: null});
    });

    test('departures more than 15 minutes apart are separate events', () => {
        const event = {boat: 3, kind: 'departure', terminal: 7, route: 'sea-bi'};
        storage.recordVesselEvent(key, {...event, time: day + 600}, day + 600);
        storage.recordVesselEvent(key, {...event, time: day + 600 + 16 * 60}, day + 600 + 16 * 60);
        expect(storage.getVesselEvents(key, day + 2000)).toHaveLength(2);
    });

    test('a log without the new fields (restored, or from a cancellation) accepts events', () => {
        storage.setSailingCancelled(key, day + 600, day);
        delete storage.sailingLogStorage[key].events;
        delete storage.sailingLogStorage[key].statuses;
        expect(() => {
            storage.recordVesselEvent(key, {boat: 3, kind: 'arrival', terminal: 7, time: day + 900}, day + 900);
            storage.setSailingState(key, day + 1200, 'departed', day + 1260, 3, day + 1260);
        }).not.toThrow();
        expect(storage.getVesselEvents(key, day + 1300)).toHaveLength(1);
    });
});
