/**
 * StorageManage.js
 * ============
 * Handles the persistence of data for the service relying on an in memory structure for now, but
 * abstracted so we can move to a database in the future.
 */
class StorageManager {
    /**
     * Initialize the storeage.
     */
    constructor() {
      this.delayStorage = {};
      this.sailingLogStorage = {};
    }

    /**
     * WSF sailing days roll past midnight. Treat departures before 3am as part of
     * the previous service day.
     * @param {number} epochSeconds - Event time in epoch seconds.
     * @return {string} Sailing day key in YYYY-MM-DD format.
     */
    getSailingDayId(epochSeconds = Math.floor(Date.now() / 1000)) {
        const sailingDayStartHour = 3;
        const eventDate = new Date(epochSeconds * 1000);
        eventDate.setHours(eventDate.getHours() - sailingDayStartHour);
        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const day = String(eventDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Remove cached averages that are not part of the active sailing day.
     * @param {string} sailingDayId - Sailing day key in YYYY-MM-DD format.
     */
    clearStaleDelayData(sailingDayId) {
        for (const key in this.delayStorage) {
            if (this.delayStorage.hasOwnProperty(key) && this.delayStorage[key].sailingDayId !== sailingDayId) {
                delete this.delayStorage[key];
            }
        }
        for (const key in this.sailingLogStorage) {
            if (this.sailingLogStorage.hasOwnProperty(key) &&
                this.sailingLogStorage[key].sailingDayId !== sailingDayId) {
                delete this.sailingLogStorage[key];
            }
        }
    }

    /**
     * Get delay data, which consists of the number of departures (count) and the current average
     * departure delay.
     * @param key used to capture information about the boat
     * @param epochSeconds used to scope data to a WSF sailing day
     * @return boat data
     */
    getDelay(key, epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        this.clearStaleDelayData(sailingDayId);
        if (this.delayStorage[key] && this.delayStorage[key].sailingDayId === sailingDayId) {
            return this.delayStorage[key];
        } else {
            return null;
        }
    }

    /**
     * Store the delay data for later retrieval
     * @param key Identifier for the boat we are persisting
     * @param delayData to be stored
     * @param epochSeconds used to scope data to a WSF sailing day
     */
    setDelay(key, delayData, epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        this.clearStaleDelayData(sailingDayId);
        delayData.sailingDayId = sailingDayId;
        this.delayStorage[key] = delayData;
    }

    /**
     * Add a single observed sailing departure to the current sailing-day log.
     * @param key Identifier for the port log.
     * @param entry Sailing log entry.
     * @param epochSeconds Event time used to scope data to a WSF sailing day.
     * @return {Array} Current sailing log entries for the key.
     */
    addSailingLogEntry(key, entry, epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        this.clearStaleDelayData(sailingDayId);
        if (!this.sailingLogStorage[key] || this.sailingLogStorage[key].sailingDayId !== sailingDayId) {
            this.sailingLogStorage[key] = {
                sailingDayId,
                entries: [],
                entryIds: {},
            };
        }

        const entryId = `${entry.ScheduledDeparture}`;
        if (!this.sailingLogStorage[key].entryIds[entryId]) {
            this.sailingLogStorage[key].entries.push(entry);
            this.sailingLogStorage[key].entries.sort((first, second) => first.ScheduledDeparture - second.ScheduledDeparture);
            this.sailingLogStorage[key].entryIds[entryId] = true;
        }

        return this.sailingLogStorage[key].entries;
    }

    /**
     * Get the current sailing-day departure log for a port.
     * @param key Identifier for the port log.
     * @param epochSeconds Event time used to scope data to a WSF sailing day.
     * @return {Array} Sailing log entries.
     */
    getSailingLog(key, epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        this.clearStaleDelayData(sailingDayId);
        if (this.sailingLogStorage[key] && this.sailingLogStorage[key].sailingDayId === sailingDayId) {
            return this.sailingLogStorage[key].entries;
        }

        return [];
    }
}
export default StorageManager;
