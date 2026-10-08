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
        const pacificTimeZone = 'America/Los_Angeles';
        const adjustedDate = new Date((epochSeconds - (sailingDayStartHour * 60 * 60)) * 1000);

        const dateParts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
            timeZone: pacificTimeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(adjustedDate).map((datePart) => [datePart.type, datePart.value]));

        return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
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
     * @param vesselPosition Vessel position number for the sailing.
     * @param epochSeconds Event time used to scope data to a WSF sailing day.
     */
    setSailingDepartureDelay(key, scheduledDeparture, departureDelay, vesselPosition, epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        this.clearStaleDelayData(sailingDayId);
        if (!this.sailingLogStorage[key] || this.sailingLogStorage[key].sailingDayId !== sailingDayId) {
            this.sailingLogStorage[key] = {
                sailingDayId,
                departureDelays: {},
                crossingTimes: {},
                vesselPositions: {},
            };
        }

        this.sailingLogStorage[key].departureDelays[scheduledDeparture] = departureDelay;
        this.sailingLogStorage[key].vesselPositions[scheduledDeparture] = vesselPosition;
    }

    /**
     * Record the observed crossing time for a scheduled departure in the current sailing-day log.
     * @param key Identifier for the port log.
     * @param scheduledDeparture Scheduled departure epoch seconds.
     * @param crossingTime Crossing time in seconds.
     * @param epochSeconds Event time used to scope data to a WSF sailing day.
     */
    setSailingCrossingTime(key, scheduledDeparture, crossingTime, epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        this.clearStaleDelayData(sailingDayId);
        if (!this.sailingLogStorage[key] || this.sailingLogStorage[key].sailingDayId !== sailingDayId) {
            this.sailingLogStorage[key] = {
                sailingDayId,
                departureDelays: {},
                crossingTimes: {},
                vesselPositions: {},
            };
        }

        this.sailingLogStorage[key].crossingTimes[scheduledDeparture] = crossingTime;
    }

    getScheduledDeparture(scheduleEntry) {
        return Array.isArray(scheduleEntry) ? scheduleEntry[0] : scheduleEntry;
    }

    getScheduledVesselPosition(scheduleEntry) {
        return Array.isArray(scheduleEntry) ? scheduleEntry[1] : null;
    }

    /**
     * Get the current sailing-day departure log for a port as
     * [ScheduledDeparture, DepartureDelay, CrossingTime, VesselPosition] rows.
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
        const crossingTimes =
            this.sailingLogStorage[key]?.sailingDayId === sailingDayId ?
            this.sailingLogStorage[key].crossingTimes || {} :
            {};
        const vesselPositions =
            this.sailingLogStorage[key]?.sailingDayId === sailingDayId ?
            this.sailingLogStorage[key].vesselPositions || {} :
            {};
        const cancelled =
            this.sailingLogStorage[key]?.sailingDayId === sailingDayId ?
            this.sailingLogStorage[key].cancelled || {} :
            {};
        if (scheduleList.length > 0) {
            return this.withSailingStatus(scheduleList.map((scheduleEntry) => {
                const scheduledDeparture = this.getScheduledDeparture(scheduleEntry);
                const scheduledVesselPosition = this.getScheduledVesselPosition(scheduleEntry);
                return [
                    scheduledDeparture,
                    departureDelays.hasOwnProperty(scheduledDeparture) ? departureDelays[scheduledDeparture] : null,
                    crossingTimes.hasOwnProperty(scheduledDeparture) ? crossingTimes[scheduledDeparture] : null,
                    vesselPositions.hasOwnProperty(scheduledDeparture) ?
                        vesselPositions[scheduledDeparture] :
                        scheduledVesselPosition,
                ];
            }), cancelled);
        }

        const scheduledDepartures = new Set([
            ...Object.keys(departureDelays),
            ...Object.keys(crossingTimes),
            ...Object.keys(vesselPositions),
            ...Object.keys(cancelled),
        ]);

        return this.withSailingStatus(Array.from(scheduledDepartures)
            .map((scheduledDeparture) => [
                Number(scheduledDeparture),
                departureDelays.hasOwnProperty(scheduledDeparture) ? departureDelays[scheduledDeparture] : null,
                crossingTimes.hasOwnProperty(scheduledDeparture) ? crossingTimes[scheduledDeparture] : null,
                vesselPositions.hasOwnProperty(scheduledDeparture) ? vesselPositions[scheduledDeparture] : null,
            ])
            .sort((first, second) => first[0] - second[0]), cancelled);
    }

    /**
     * Append a status to log rows that have one, as a fifth element (rows without keep four, so existing
     * clients are unaffected):
     * - 'cancelled': WSF marked the departure cancelled (terminal sailing space IsCancelled).
     * - 'skipped': never departed, though the same vessel position has logged departures from this terminal
     *   both before and after it (the boat moved on past it). Requiring a departure on each side keeps gaps
     *   from server downtime or restarts from reading as skipped.
     * @param {Array} rows - [scheduledDeparture, departureDelay, crossingTime, vesselPosition] rows, by time.
     * @param {object} cancelled - Cancelled scheduled departures (keys).
     * @return {Array} Rows with statuses.
     */
    withSailingStatus(rows, cancelled = {}) {
        const sorted = [...rows].sort((first, second) => first[0] - second[0]);
        return rows.map((row) => {
            const [scheduledDeparture, departureDelay, , vesselPosition] = row;
            if (cancelled.hasOwnProperty(scheduledDeparture)) {
                return [...row, 'cancelled'];
            }
            if (departureDelay !== null || vesselPosition === null || vesselPosition === undefined) {
                return row;
            }
            const sameVessel = sorted.filter((other) => other[3] === vesselPosition && other[1] !== null);
            const departedBefore = sameVessel.some((other) => other[0] < scheduledDeparture);
            const departedAfter = sameVessel.some((other) => other[0] > scheduledDeparture);
            return departedBefore && departedAfter ? [...row, 'skipped'] : row;
        });
    }

    /**
     * Record that WSF cancelled a scheduled departure (kept for the sailing day: WSF only lists upcoming
     * departures, so a cancellation disappears from its feed once the time passes).
     * @param key Identifier for the port log.
     * @param scheduledDeparture Scheduled departure epoch seconds.
     * @param epochSeconds Event time used to scope data to a WSF sailing day.
     */
    setSailingCancelled(key, scheduledDeparture, epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        this.clearStaleDelayData(sailingDayId);
        if (!this.sailingLogStorage[key] || this.sailingLogStorage[key].sailingDayId !== sailingDayId) {
            this.sailingLogStorage[key] = {
                sailingDayId,
                departureDelays: {},
                crossingTimes: {},
                vesselPositions: {},
            };
        }
        this.sailingLogStorage[key].cancelled = this.sailingLogStorage[key].cancelled || {};
        this.sailingLogStorage[key].cancelled[scheduledDeparture] = true;
    }

    /**
     * Cancelled scheduled departures for a port's current sailing day.
     * @param key Identifier for the port log.
     * @param epochSeconds Event time used to scope data to a WSF sailing day.
     * @return {Set<number>} Cancelled scheduled departures.
     */
    getCancelledSailings(key, epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        const log = this.sailingLogStorage[key];
        if (!log || log.sailingDayId !== sailingDayId || !log.cancelled) {
            return new Set();
        }
        return new Set(Object.keys(log.cancelled).map(Number));
    }
}
export default StorageManager;
