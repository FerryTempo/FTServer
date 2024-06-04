
import StorageManager from '../src/StorageManager';

describe('StorageManager', () => {
    let storageManager;

    beforeEach(() => {
        storageManager = new StorageManager();
    });

    test('getDelay returns delay data when present', () => {
        const key = 'boat1';
        const delayData = { count: 5, averageDelay: 10 };
        storageManager.setDelay(key, delayData);
        expect(storageManager.getDelay(key)).toEqual(delayData);
    });

    test('getDelay returns null when delay data is not present', () => {
        expect(storageManager.getDelay('nonExistentKey')).toBeNull();
    });

    test('setDelay sets delay data correctly', () => {
        const key = 'boat1';
        const delayData = { count: 5, averageDelay: 10 };
        storageManager.setDelay(key, delayData);
        expect(storageManager.getDelay(key)).toEqual(delayData);
    });

    test('setDelay updates existing delay data', () => {
        const key = 'boat1';
        const delayData = { count: 5, averageDelay: 10 };
        storageManager.setDelay(key, delayData);

        const newDelayData = { count: 7, averageDelay: 12 };
        storageManager.setDelay(key, newDelayData);

        expect(storageManager.getDelay(key)).toEqual(newDelayData);
    });
});