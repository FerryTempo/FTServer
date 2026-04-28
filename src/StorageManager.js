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
     * Record the observed delay for a scheduled departure in the current sailing-day log.
     * @param key Identifier for the port log.
     * @param scheduledDeparture Scheduled departure epoch seconds.
     * @param departureDelay Departure delay in seconds.
     * @param epochSeconds Event time used to scope data to a WSF sailing day.
     */
    setSailingDepartureDelay(key, scheduledDeparture, departureDelay, epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        this.clearStaleDelayData(sailingDayId);
        if (!this.sailingLogStorage[key] || this.sailingLogStorage[key].sailingDayId !== sailingDayId) {
            this.sailingLogStorage[key] = {
                sailingDayId,
                departureDelays: {},
            };
        }

        this.sailingLogStorage[key].departureDelays[scheduledDeparture] = departureDelay;
    }

    /**
     * Get the current sailing-day departure log for a port as [ScheduledDeparture, DepartureDelay] pairs.
     * @param key Identifier for the port log.
     * @param scheduleList Scheduled departures for the port.
     * @param epochSeconds Event time used to scope data to a WSF sailing day.
     * @return {Array} Sailing log entries.
     */
    getSailingLog(key, scheduleList = [], epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        this.clearStaleDelayData(sailingDayId);
        const departureDelays =
            this.sailingLogStorage[key]?.sailingDayId === sailingDayId ?
            this.sailingLogStorage[key].departureDelays :
            {};

        if (scheduleList.length > 0) {
            return scheduleList.map((scheduledDeparture) => [
                scheduledDeparture,
                departureDelays.hasOwnProperty(scheduledDeparture) ? departureDelays[scheduledDeparture] : null,
            ]);
        }

        return Object.entries(departureDelays)
            .map(([scheduledDeparture, departureDelay]) => [Number(scheduledDeparture), departureDelay])
            .sort((first, second) => first[0] - second[0]);
    }
}
export default StorageManager;
