/**
 * StorageManage.js
 * ============
 * Handles the persistence of data for the service relying on an in memory structure for now, but
 * abstracted so we can move to a database in the future.
 */
import Logger from './Logger.js';
const logger = new Logger();

class StorageManager {
    /**
     * Initialize the storeage.
     */
    constructor() {
      this.delayStorage = {};
      this.lastCacheReset = Date.now();
    }

    /**
     * Internal method to check whether or not the internal data store needs to be reset. 
     * This happens at the start of each day (3am for ferry time) for the boat and port averages. 
     * We also check to see when we last reset the cache so we don't execute this multiple times
     * during the 3am hour.
     */
    checkCacheReset() {
        let now = new Date();
        if (now.getHours() == 3 && (now - this.lastCacheReset) > 3600000) {
            for (var prop in delayStorage) { 
                if (delayStorage.hasOwnProperty(prop)) { 
                    delete delayStorage[prop]; 
                } 
            }
            delayStorage = {};
            this.lastCacheReset = now.getTime();
            logger.debug("RESETTING departure delay cache.");
        }
    }

    /**
     * Get delay data, which consists of the number of departures (count) and the current average
     * departure delay.
     * @param key used to capture information about the boat
     * @return boat data
     */
    getDelay(key) { 
        if (this.delayStorage[key]) {
            return this.delayStorage[key];
        } else {
            return null;
        }
    }

    /**
     * Store the delay data for later retrieval
     * @param key Identifier for the boat we are persisting
     * @param delayData to be stored
     */
    setDelay(key, delayData) {
        this.checkCacheReset();
        this.delayStorage[key] = delayData;
    }
}
export default StorageManager;