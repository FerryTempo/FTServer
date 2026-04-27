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
    }

    /**
     * WSF sailing days roll past midnight. Treat departures before 3am as part of
     * the previous service day.
     * @param {number} epochSeconds - Event time in epoch seconds.
     * @return {string} Sailing day key in YYYY-MM-DD format.
     */
    getSailingDayId(epochSeconds = Math.floor(Date.now() / 1000)) {
        const sailingDayStartHour = 3;
        const timeZone = 'America/Los_Angeles';
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            hour12: false,
        });
        const localParts = formatter.formatToParts(new Date(epochSeconds * 1000));
        const localPart = (type) => localParts.find((part) => part.type === type).value;
        const localHour = Number(localPart('hour'));
        const sailingDate = localHour < sailingDayStartHour ?
            new Date(Date.UTC(Number(localPart('year')), Number(localPart('month')) - 1, Number(localPart('day')) - 1, 12)) :
            new Date(Date.UTC(Number(localPart('year')), Number(localPart('month')) - 1, Number(localPart('day')), 12));
        const dateParts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Los_Angeles',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(sailingDate);
        const datePart = (type) => dateParts.find((part) => part.type === type).value;
        return `${datePart('year')}-${datePart('month')}-${datePart('day')}`;
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
}
export default StorageManager;
