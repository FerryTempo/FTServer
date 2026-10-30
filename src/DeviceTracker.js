/**
 * DeviceTracker.js
 * =========
 * Counts the FerryTempo devices polling route data. A device identifies itself with the `cid`
 * query parameter on /api/v1/route/:routeId. Kept in memory only: it refills within one polling
 * interval after a restart.
 */
import { getCurrentEpochSeconds, getSailingDayId } from './Utils.js';

export const ACTIVE_WINDOW_SECONDS = 5 * 60;
const HOUR_SECONDS = 60 * 60;
// Long enough to cover a whole sailing day, which may be 25 hours across a DST change.
const RETENTION_SECONDS = 26 * HOUR_SECONDS;
const PRUNE_INTERVAL_SECONDS = 60;
const MAX_TRACKED_DEVICES = 10000;
const MAX_CID_LENGTH = 64;

export default class DeviceTracker {
  /**
   * @param {object} options
   * @param {Function} options.sailingDayId - Maps epoch seconds to a sailing day id.
   */
  constructor({ sailingDayId = getSailingDayId } = {}) {
    this.sailingDayId = sailingDayId;
    this.devices = new Map();
    this.lastPrune = 0;
  }

  /**
   * Note a route request from a device.
   * @param {string} cid - The device's id.
   * @param {string} routeId - The route the device asked for.
   * @param {string} ip - The address the request came from.
   * @param {number} now - Epoch seconds.
   */
  record(cid, routeId, ip, now = getCurrentEpochSeconds()) {
    if (!cid || cid.length > MAX_CID_LENGTH) {
      return;
    }

    if (now - this.lastPrune >= PRUNE_INTERVAL_SECONDS) {
      this.prune(now);
    }

    const device = this.devices.get(cid);
    if (device) {
      device.routeId = routeId;
      device.ip = ip;
      device.lastSeen = now;
      device.requestCount += 1;
      return;
    }

    if (this.devices.size >= MAX_TRACKED_DEVICES) {
      return;
    }

    this.devices.set(cid, {
      cid,
      routeId,
      ip,
      firstSeen: now,
      lastSeen: now,
      requestCount: 1,
    });
  }

  /**
   * Forget devices not seen within the retention window.
   * @param {number} now - Epoch seconds.
   */
  prune(now = getCurrentEpochSeconds()) {
    this.lastPrune = now;
    this.devices.forEach((device, cid) => {
      if (now - device.lastSeen > RETENTION_SECONDS) {
        this.devices.delete(cid);
      }
    });
  }

  /**
   * Device counts and the devices seen this sailing day, most recently seen first.
   * @param {number} now - Epoch seconds.
   * @return {object} activeNow, lastHour, today, activeByRoute and devices.
   */
  getSummary(now = getCurrentEpochSeconds()) {
    this.prune(now);

    const todayId = this.sailingDayId(now);
    const devices = [];
    const activeByRoute = {};
    let activeNow = 0;
    let lastHour = 0;

    this.devices.forEach((device) => {
      const secondsSinceSeen = now - device.lastSeen;
      const active = secondsSinceSeen <= ACTIVE_WINDOW_SECONDS;
      if (active) {
        activeNow += 1;
        activeByRoute[device.routeId] = (activeByRoute[device.routeId] || 0) + 1;
      }
      if (secondsSinceSeen <= HOUR_SECONDS) {
        lastHour += 1;
      }
      // Active devices are listed even when their last request was just before the 3am rollover.
      if (active || this.sailingDayId(device.lastSeen) === todayId) {
        devices.push({ ...device, active });
      }
    });

    devices.sort((a, b) => b.lastSeen - a.lastSeen);

    return {
      activeNow,
      lastHour,
      today: devices.filter((device) => this.sailingDayId(device.lastSeen) === todayId).length,
      activeByRoute,
      devices,
    };
  }
}
