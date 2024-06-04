/**
 * StorageManage.js
 * ============
 * Handles the persistence of data for the service relying on node-persist library.
 */
import storage from 'node-persist';

class StorageManager {
    /**
     * Initialize the storeage.
     */
    constructor() {
      storage.init();
    }

    /**
     * Store data into the local file system for persistence.
     * @param key key for the data being stored.
     * @param data value of the data being stored.
     */
    async setItem(key, value) {
        await storage.setItem(key, value);
    } 

    /**
     * Retrieve the data from the file system. Returns null if the data does not exist in the store or if the store doesn't exist.
     * @param key key used to retrieve data from storage.
     */
    async getItem(key) {
        return await storage.getItem(key);
    }

    /**
     * Remove an item from the data stored under a particular key from the storage
     * @param key key used to clear out the specified data
     */
    async removeItem(key) {
        await storage.removeItem(key);
    }

    /**
     * Clear local storage, used primarily for unit testing to clean up when done.
     */
    async clear() {
        await storage.clear();
    }
}
export default StorageManager;