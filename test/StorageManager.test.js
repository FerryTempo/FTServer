
import StorageManager from '../src/StorageManager';

describe('StorageManager', () => {
    let storageManager;
    const sailingDayEpoch = 1710000000;
    const sailingDayId = '2024-03-09';

    beforeEach(() => {
        storageManager = new StorageManager();
    });

    test('getDelay returns delay data when present', () => {
        const key = 'boat1';
        const delayData = { count: 5, averageDelay: 10 };
        storageManager.setDelay(key, delayData, sailingDayEpoch);
        expect(storageManager.getDelay(key, sailingDayEpoch)).toEqual({...delayData, sailingDayId});
    });

    test('getDelay returns null when delay data is not present', () => {
        expect(storageManager.getDelay('nonExistentKey')).toBeNull();
    });

    test('setDelay sets delay data correctly', () => {
        const key = 'boat1';
        const delayData = { count: 5, averageDelay: 10 };
        storageManager.setDelay(key, delayData, sailingDayEpoch);
        expect(storageManager.getDelay(key, sailingDayEpoch)).toEqual({...delayData, sailingDayId});
    });

    test('setDelay updates existing delay data', () => {
        const key = 'boat1';
        const delayData = { count: 5, averageDelay: 10 };
        storageManager.setDelay(key, delayData, sailingDayEpoch);

        const newDelayData = { count: 7, averageDelay: 12 };
        storageManager.setDelay(key, newDelayData, sailingDayEpoch);

        expect(storageManager.getDelay(key, sailingDayEpoch)).toEqual({...newDelayData, sailingDayId});
    });

    test('getDelay returns null for a different sailing day', () => {
        const key = 'boat1';
        storageManager.setDelay(key, { count: 5, averageDelay: 10 }, sailingDayEpoch);

        expect(storageManager.getDelay(key, sailingDayEpoch + 86400)).toBeNull();
    });

    test('getSailingDayId uses Pacific time instead of the server local timezone', () => {
        expect(storageManager.getSailingDayId(1777431540)).toBe('2026-04-28');
        expect(storageManager.getSailingDayId(1777431600)).toBe('2026-04-28');
        expect(storageManager.getSailingDayId(1777456740)).toBe('2026-04-28');
        expect(storageManager.getSailingDayId(1777456800)).toBe('2026-04-29');
    });

    test('getSailingDayId handles Pacific standard time before the 3am sailing-day reset', () => {
        expect(storageManager.getSailingDayId(1768474740)).toBe('2026-01-14');
        expect(storageManager.getSailingDayId(1768474800)).toBe('2026-01-15');
    });

    test('sailing log annotates scheduled departures and resets by sailing day', () => {
        const key = 'ed-king:portES';
        const scheduleList = [sailingDayEpoch, sailingDayEpoch + 1800];

        storageManager.setSailingDepartureDelay(key, sailingDayEpoch, 60, sailingDayEpoch + 60);
        storageManager.setSailingDepartureDelay(key, sailingDayEpoch, 60, sailingDayEpoch + 60);

        expect(storageManager.getSailingLog(key, scheduleList, sailingDayEpoch)).toEqual([
            [sailingDayEpoch, 60],
            [sailingDayEpoch + 1800, null],
        ]);
        expect(storageManager.getSailingLog(key, scheduleList, sailingDayEpoch + 86400)).toEqual([
            [sailingDayEpoch, null],
            [sailingDayEpoch + 1800, null],
        ]);
    });
});
