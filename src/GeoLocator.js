/**
 * GeoLocator.js
 * =========
 * Approximate city-level location for an IP address, from the free DB-IP "IP to City Lite"
 * database (https://db-ip.com, CC BY 4.0, credited on the device dashboard). The database is kept
 * on this server and refreshed monthly, so device IPs are never sent to a third party.
 *
 * Enabled only when GEOIP_ENABLED=true: the database takes roughly 130 MB of memory. It is saved in
 * GEOIP_DIR, else STATE_DIR (a persistent disk, so a deploy doesn't download it again), else data/.
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { Reader, validate } from 'maxmind';
import Logger from './Logger.js';

const logger = new Logger();
const DATABASE_FILE_NAME = 'dbip-city-lite.mmdb';
const DAY_MS = 24 * 60 * 60 * 1000;
// DB-IP publishes on the 1st of each month; a few days' grace avoids racing the release.
const MAX_DATABASE_AGE_MS = 35 * DAY_MS;
const MAX_CACHED_LOCATIONS = 10000;

/**
 * @param {Date} date
 * @return {string} The download URL of the database DB-IP published for that month.
 */
export function databaseUrl(date) {
  const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  return `https://download.db-ip.com/free/dbip-city-lite-${month}.mmdb.gz`;
}

/**
 * A short "City, Region, CC" label from a DB-IP city record.
 * @param {object|null} record
 * @return {string} The label, or '' when the record has no location.
 */
export function formatLocation(record) {
  if (!record) {
    return '';
  }

  const parts = [
    record.city?.names?.en,
    record.subdivisions?.[0]?.names?.en,
    record.country?.iso_code,
  ].filter(Boolean);
  // DB-IP repeats the region as the city when it only knows the region.
  return parts.filter((part, index) => part !== parts[index - 1]).join(', ');
}

export default class GeoLocator {
  constructor({
    directory = process.env.GEOIP_DIR || process.env.STATE_DIR || 'data',
    enabled = process.env.GEOIP_ENABLED === 'true',
  } = {}) {
    this.enabled = enabled;
    this.filePath = path.join(directory, DATABASE_FILE_NAME);
    this.reader = null;
    this.cache = new Map();
  }

  /**
   * Load the saved database, download a newer one when it is missing or a month old, and keep
   * checking daily. Never throws: without a database, lookups return ''.
   */
  async start() {
    if (!this.enabled) {
      logger.info('GEOIP_ENABLED is not true; device locations are off.');
      return;
    }

    this.load();
    await this.refresh();
    setInterval(() => this.refresh(), DAY_MS).unref();
  }

  load() {
    if (!fs.existsSync(this.filePath)) {
      return;
    }

    try {
      this.reader = new Reader(fs.readFileSync(this.filePath));
      this.cache.clear();
      logger.info(`Loaded IP location database ${this.filePath}.`);
    } catch (error) {
      logger.error(`Loading IP location database ${this.filePath} failed: ${error.message}`);
    }
  }

  async refresh() {
    if (fs.existsSync(this.filePath) && Date.now() - fs.statSync(this.filePath).mtimeMs < MAX_DATABASE_AGE_MS) {
      return;
    }

    const now = new Date();
    const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    for (const url of [databaseUrl(now), databaseUrl(previousMonth)]) {
      const reader = await this.download(url);
      if (reader) {
        this.reader = reader;
        this.cache.clear();
        return;
      }
    }
  }

  /**
   * Download and unzip a database, replacing the saved one only once it is complete.
   * @param {string} url
   * @return {Reader|null} A reader for the new database, or null when it wasn't saved.
   */
  async download(url) {
    const temporaryPath = `${this.filePath}.tmp`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        logger.info(`IP location database ${url} not available (${response.status}).`);
        return null;
      }

      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      await pipeline(Readable.fromWeb(response.body), zlib.createGunzip(), fs.createWriteStream(temporaryPath));
      // Opening it checks it is complete before it replaces a working database.
      const reader = new Reader(fs.readFileSync(temporaryPath));
      fs.renameSync(temporaryPath, this.filePath);
      logger.info(`Downloaded IP location database ${url}.`);
      return reader;
    } catch (error) {
      logger.error(`Downloading IP location database ${url} failed: ${error.message}`);
      fs.rmSync(temporaryPath, { force: true });
      return null;
    }
  }

  /**
   * @param {string} ip
   * @return {string} "City, Region, CC", or '' when unknown, private or disabled.
   */
  lookup(ip) {
    if (!this.reader || !validate(ip)) {
      return '';
    }

    if (!this.cache.has(ip)) {
      if (this.cache.size >= MAX_CACHED_LOCATIONS) {
        this.cache.clear();
      }
      let location = '';
      try {
        location = formatLocation(this.reader.get(ip));
      } catch (error) {
        logger.debug(`IP location lookup failed: ${error.message}`);
      }
      this.cache.set(ip, location);
    }
    return this.cache.get(ip);
  }
}
