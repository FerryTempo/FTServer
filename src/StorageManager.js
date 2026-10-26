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
                statuses: {},
                actualDepartures: {},
                vesselIds: {},
                events: [],
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
                statuses: {},
                actualDepartures: {},
                vesselIds: {},
                events: [],
            };
        }

        this.sailingLogStorage[key].crossingTimes[scheduledDeparture] = crossingTime;
    }

    /**
     * A day's log with the sailing-state and event fields, added if missing: logs created by other writers
     * (delays, cancellations) or restored from a state file saved before these fields existed lack them.
     * @param {object} log - A sailing day's log.
     * @return {object} The same log.
     */
    withEventFields(log) {
        log.statuses = log.statuses || {};
        log.actualDepartures = log.actualDepartures || {};
        log.vesselIds = log.vesselIds || {};
        log.events = log.events || [];
        return log;
    }

    setSailingState(key, scheduledDeparture, state, actualDeparture, vesselId, epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        this.clearStaleDelayData(sailingDayId);
        if (!this.sailingLogStorage[key] || this.sailingLogStorage[key].sailingDayId !== sailingDayId) {
            this.sailingLogStorage[key] = {
                sailingDayId, departureDelays: {}, crossingTimes: {}, vesselPositions: {},
                statuses: {}, actualDepartures: {}, vesselIds: {}, events: [],
            };
        }
        const log = this.withEventFields(this.sailingLogStorage[key]);
        log.statuses[scheduledDeparture] = state;
        if (actualDeparture) log.actualDepartures[scheduledDeparture] = actualDeparture;
        if (vesselId) log.vesselIds[scheduledDeparture] = vesselId;
    }

    recordVesselEvent(key, event, epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        this.clearStaleDelayData(sailingDayId);
        if (!this.sailingLogStorage[key] || this.sailingLogStorage[key].sailingDayId !== sailingDayId) {
            this.sailingLogStorage[key] = {
                sailingDayId, departureDelays: {}, crossingTimes: {}, vesselPositions: {},
                statuses: {}, actualDepartures: {}, vesselIds: {}, events: [],
            };
        }
        // One event per boat movement: a repeat within 15 minutes (a departure first seen from the
        // boat, then reported by WSF's LeftDock) updates the existing event rather than adding another.
        const events = this.withEventFields(this.sailingLogStorage[key]).events;
        const existing = events.findIndex((item) => item.boat === event.boat && item.kind === event.kind &&
            item.terminal === event.terminal && Math.abs(item.time - event.time) <= 15 * 60);
        if (existing >= 0) {
            events[existing] = {...events[existing], ...event};
        } else {
            events.push(event);
        }
    }

    getScheduledDeparture(scheduleEntry) {
        return Array.isArray(scheduleEntry) ? scheduleEntry[0] : scheduleEntry;
    }

    getScheduledVesselPosition(scheduleEntry) {
        return Array.isArray(scheduleEntry) ? scheduleEntry[1] : null;
    }

    getScheduledStatus(scheduleEntry) {
        return Array.isArray(scheduleEntry) && scheduleEntry[2] ? scheduleEntry[2] : 'upcoming';
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
        const log = this.sailingLogStorage[key]?.sailingDayId === sailingDayId ? this.sailingLogStorage[key] : {};
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
            ...Object.keys(log.statuses || {}),
            ...Object.keys(log.actualDepartures || {}),
            ...Object.keys(log.vesselIds || {}),
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

    /**
     * The stored day state (averages and sailing logs), as plain JSON-safe data.
     * @return {object} Serializable state.
     */
    exportState() {
        return {
            delayStorage: this.delayStorage,
            sailingLogStorage: this.sailingLogStorage,
        };
    }

    /**
     * Restore state saved by exportState (after a restart). Entries from an earlier sailing day are
     * dropped on the next access, as usual.
     * @param {object} state - State from exportState.
     */
    importState(state) {
        if (!state || typeof state !== 'object') return;
        if (state.delayStorage && typeof state.delayStorage === 'object') {
            this.delayStorage = state.delayStorage;
        }
        if (state.sailingLogStorage && typeof state.sailingLogStorage === 'object') {
            this.sailingLogStorage = state.sailingLogStorage;
        }
    }

    getSailingStates(key, scheduleList = [], epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        const log = this.sailingLogStorage[key]?.sailingDayId === sailingDayId ? this.sailingLogStorage[key] : {};
        const scheduleEntries = new Map(scheduleList.map((entry) => [this.getScheduledDeparture(entry), entry]));
        return this.getSailingLog(key, scheduleList, epochSeconds).map((row) => {
            const [scheduledDeparture, departureDelay, crossingTime, vesselPosition, rowStatus] = row;
            const scheduleEntry = scheduleEntries.get(scheduledDeparture);
            // A cancellation (the log's fifth element) outranks any other state;
            // a skipped sailing (never departed, the boat moved on) reads as
            // 'skipped'.
            return {
                ScheduledDeparture: scheduledDeparture,
                State: rowStatus === 'cancelled' ? 'cancelled' :
                    log.statuses?.[scheduledDeparture] ||
                    (departureDelay !== null ? 'departed' : rowStatus || this.getScheduledStatus(scheduleEntry)),
                ActualDeparture: log.actualDepartures?.[scheduledDeparture] ?? null,
                DepartureDelay: departureDelay,
                CrossingTime: crossingTime,
                VesselPosition: vesselPosition,
                VesselID: log.vesselIds?.[scheduledDeparture] ?? null,
            };
        });
    }

    getVesselEvents(key, epochSeconds) {
        const sailingDayId = this.getSailingDayId(epochSeconds);
        this.clearStaleDelayData(sailingDayId);
        return this.sailingLogStorage[key]?.sailingDayId === sailingDayId ?
            [...(this.sailingLogStorage[key].events || [])]
                .sort((a, b) => a.time - b.time)
                .map((event) => ({
                    VesselID: event.boat,
                    Kind: event.kind,
                    TerminalID: event.terminal,
                    Time: event.time,
                    Route: event.route,
                    VesselPosition: event.vesselPosition ?? null,
                    ScheduledDeparture: event.scheduledDeparture ?? null,
                })) : [];
    }
}
export default StorageManager;
