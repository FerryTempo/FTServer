/**
 * App.js
 * =========
 * Essentially the "controller" of the MVC framework.
 * Handles requests, stores data, catches errors.
 */
import 'dotenv/config';
import express from 'express';
import Database from 'better-sqlite3';
import {
  fetchReferenceSailings,
  fetchReferenceScheduleRoutes,
  fetchScheduleCacheFlushDate,
  fetchScheduleData,
  fetchTerminalBulletinData,
  fetchTerminalSailingSpaceData,
  fetchVesselData,
} from './WSDOT.js';
import FerryTempo, { debugProgress } from './FerryTempo.js';
import { buildReferenceSchedules, getActiveSchedRouteId } from './ReferenceSchedules.js';
import Logger from './Logger.js';
import routeFTData from '../data/RouteFTData.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Worker } from 'worker_threads';
import { join } from 'path';
import { compareAISData, getSailingDayId, getTimeFromEpochSeconds } from './Utils.js';
import { getOpenWeatherData, processOpenWeatherData } from './OpenWeather.js';
import validator from 'validator';  // for validating input

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 8080;
const app = express();
const fetchInterval = 5000;
const scheduleFetchInterval = 600000;
const referenceScheduleFetchInterval = 86400000;
const terminalBulletinFetchInterval = 600000;
const terminalSailingSpaceFetchInterval = 5000;
const appVersion = process.env.npm_package_version;
const logger = new Logger();
let latestAisData = null;
let latestScheduleData = null;
let latestScheduleTripDate = null;
let scheduleFetchInFlight = false;
let latestReferenceSchedules = null;
let latestReferenceScheduleCacheFlushDate = null;
let referenceScheduleFetchInFlight = false;
let latestTerminalBulletinData = null;
let terminalBulletinFetchInFlight = false;
let latestTerminalSailingSpaceData = null;
let terminalSailingSpaceFetchInFlight = false;

function filterDeviceRouteData(routeData, includeScheduleList = false) {
  const filteredRouteData = JSON.parse(JSON.stringify(routeData));
  for (const boatKey in filteredRouteData.boatData) {
    delete filteredRouteData.boatData[boatKey].CrossingTimeAverage;
    delete filteredRouteData.boatData[boatKey].StopTimerAverage;
  }
  for (const portKey in filteredRouteData.portData) {
    if (!includeScheduleList) {
      delete filteredRouteData.portData[portKey].PortScheduleList;
    }
    delete filteredRouteData.portData[portKey].PortSailingLog;
    delete filteredRouteData.portData[portKey].PortStopTimerAverage;
    delete filteredRouteData.portData[portKey].TerminalAlerts;
    delete filteredRouteData.portData[portKey].VehicleSpacesRemaining;
    delete filteredRouteData.portData[portKey].VehicleSpaces;
  }
  return filteredRouteData;
}

const allowedCorsOrigins = new Set([
  'https://ferrytempo.com',
  'https://www.ferrytempo.com',
]);

function allowFerryTempoRouteCors(request, response, next) {
  const origin = request.headers.origin;
  if (allowedCorsOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'GET');
  }
  next();
}

// array used to track the existing versions and the update files
const spiffsUpdates = {
  "PointsOfSail_8M" : {
  }
};

const firmwareUpdates = {
  "PointsOfSail_8M" : {
    "2.0.0": "FTC_2.0.1_2026_04_13.bin",
  }
};

// Verify that the API Key is defined before starting up.
const key = `${process.env.WSDOT_API_KEY}`;
if ((key == undefined) || (key == 'undefined') || (key == null)) {
  logger.error('API key is not defined. Make sure you have WSDOT_API_KEY defined in your .env file.');
  process.exit(-1);
}

// Set up SQLite database.
const db = new Database(':memory:');
db.pragma('journal_mode = WAL');
process.on('exit', () => db.close());
db.exec(`
  CREATE TABLE AppData (
    id INTEGER PRIMARY KEY,
    saveDate INTEGER,
    vesselData JSON,
    ferryTempoData JSON
  )
`);
db.exec(`
  CREATE TABLE WeatherData (
    id INTEGER PRIMARY KEY,
    saveDate INTEGER,
    openWeather JSON,
    weatherData JSON
  )
`);
db.exec(`
  CREATE TABLE UpdateChecks (
    id INTEGER PRIMARY KEY,
    saveDate INTEGER,
    deviceKey TEXT,
    deviceCid TEXT,
    ipAddress TEXT,
    flashVersion TEXT,
    spiffsVersion TEXT,
    clientEnv TEXT,
    hardwareModel TEXT,
    updateType TEXT,
    updateAvailable INTEGER
  )
`);

const insertUpdateCheck = db.prepare(`
  INSERT INTO UpdateChecks (
    saveDate,
    deviceKey,
    deviceCid,
    ipAddress,
    flashVersion,
    spiffsVersion,
    clientEnv,
    hardwareModel,
    updateType,
    updateAvailable
  ) VALUES (
    @saveDate,
    @deviceKey,
    @deviceCid,
    @ipAddress,
    @flashVersion,
    @spiffsVersion,
    @clientEnv,
    @hardwareModel,
    @updateType,
    @updateAvailable
  )
`);

const selectUpdateChecksForSummary = db.prepare(`
  SELECT
    saveDate,
    deviceKey,
    deviceCid,
    ipAddress,
    flashVersion,
    spiffsVersion,
    clientEnv,
    hardwareModel,
    updateType,
    updateAvailable
  FROM UpdateChecks
  ORDER BY saveDate DESC, id DESC
`);

const selectRecentUpdateChecks = db.prepare(`
  SELECT
    saveDate,
    deviceKey,
    deviceCid,
    ipAddress,
    flashVersion,
    spiffsVersion,
    clientEnv,
    hardwareModel,
    updateType,
    updateAvailable
  FROM UpdateChecks
  ORDER BY id DESC
  LIMIT 500
`);

function sanitizeQueryValue(value) {
  const normalizedValue = Array.isArray(value) ? value.join(',') : `${value ?? ''}`;
  return validator.escape(normalizedValue);
}

function normalizeIpAddress(ipAddress) {
  const sanitizedIp = sanitizeQueryValue(ipAddress);

  if (sanitizedIp.startsWith('::ffff:')) {
    return sanitizedIp.substring(7);
  }

  return sanitizedIp;
}

function getRequestIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return normalizeIpAddress(forwardedFor.split(',')[0].trim());
  }

  return normalizeIpAddress(req.ip);
}

function getTrackedUpdateRequest(req) {
  const updateType = sanitizeQueryValue(req.query.type).toLowerCase();
  const legacyVersion = sanitizeQueryValue(req.query.version);
  const flashVersion = sanitizeQueryValue(req.query.flashVersion) || legacyVersion;

  return {
    flashVersion,
    spiffsVersion: sanitizeQueryValue(req.query.spiffsVersion),
    cid: sanitizeQueryValue(req.query.cid),
    env: sanitizeQueryValue(req.query.env),
    hw: sanitizeQueryValue(req.query.hw),
    ip: getRequestIp(req),
    type: updateType,
  };
}

function buildDeviceKey(requestInfo) {
  const deviceCid = requestInfo.cid || '';
  if (deviceCid) {
    return `cid:${deviceCid}`;
  }

  const hardwareModel = requestInfo.hw || 'unknown-hw';
  const clientEnv = requestInfo.env || 'unknown-env';
  return `${hardwareModel}|${clientEnv}|ip:${requestInfo.ip}`;
}

function getRequestedVersionByType(requestInfo) {
  if (requestInfo.type === 'flash') {
    return requestInfo.flashVersion;
  }

  if (requestInfo.type === 'spiffs') {
    return requestInfo.spiffsVersion;
  }

  return '';
}

function recordUpdateCheck(req, updateAvailable) {
  const requestInfo = getTrackedUpdateRequest(req);
  const deviceKey = buildDeviceKey(requestInfo);

  insertUpdateCheck.run({
    saveDate: Math.floor(Date.now() / 1000),
    deviceKey,
    deviceCid: requestInfo.cid,
    ipAddress: requestInfo.ip,
    flashVersion: requestInfo.flashVersion,
    spiffsVersion: requestInfo.spiffsVersion,
    clientEnv: requestInfo.env,
    hardwareModel: requestInfo.hw,
    updateType: requestInfo.type,
    updateAvailable: updateAvailable ? 1 : 0,
  });
}

function summarizeUpdateChecks(updateChecks) {
  const summaryByDevice = new Map();

  updateChecks.forEach((event) => {
    const existingSummary = summaryByDevice.get(event.deviceKey);
    const updateAvailable = Boolean(event.updateAvailable);

    if (!existingSummary) {
      summaryByDevice.set(event.deviceKey, {
        deviceKey: event.deviceKey,
        deviceCid: event.deviceCid,
        ipAddress: event.ipAddress,
        hardwareModel: event.hardwareModel,
        flashVersion: event.flashVersion,
        spiffsVersion: event.spiffsVersion,
        clientEnv: event.clientEnv,
        updateType: event.updateType,
        updateAvailable,
        firstSeen: event.saveDate,
        lastSeen: event.saveDate,
        requestCount: 1,
      });
      return;
    }

    existingSummary.requestCount += 1;
    existingSummary.firstSeen = Math.min(existingSummary.firstSeen, event.saveDate);
    existingSummary.lastSeen = Math.max(existingSummary.lastSeen, event.saveDate);

    if (!existingSummary.deviceCid && event.deviceCid) {
      existingSummary.deviceCid = event.deviceCid;
    }
    if (event.ipAddress) {
      existingSummary.ipAddress = event.ipAddress;
    }
    if (event.hardwareModel) {
      existingSummary.hardwareModel = event.hardwareModel;
    }
    if (event.clientEnv) {
      existingSummary.clientEnv = event.clientEnv;
    }
    if (event.flashVersion) {
      existingSummary.flashVersion = event.flashVersion;
    }
    if (event.spiffsVersion) {
      existingSummary.spiffsVersion = event.spiffsVersion;
    }
    if (event.updateType) {
      existingSummary.updateType = event.updateType;
    }
    existingSummary.updateAvailable = updateAvailable;
  });

  return Array.from(summaryByDevice.values()).sort((a, b) => b.lastSeen - a.lastSeen);
}

// Set up the Express app.
app.use(express.json());
app.set('view engine', 'pug');

app.get('/', (request, response) => {
  const sanitizedVersion = validator.escape(appVersion);  // Escapes HTML special characters
  response.render('index', { version: sanitizedVersion });
});

// Debug route for debugging and user-friendly routing. But limit results to avoid overloading memory
app.get('/debug', (request, response) => {
  const select = db.prepare(`
    SELECT 
      saveDate,
      vesselData,
      ferryTempoData 
    FROM AppData
    ORDER BY id DESC
    LIMIT 1000`);
  const events = select.all();

  const sanitizedVersion = validator.escape(appVersion);
  response.render('debug', { events, version: sanitizedVersion });
});

// Debug route for debugging and user-friendly routing.
app.get('/debug/weather', (request, response) => {
  const select = db.prepare(`
    SELECT 
      saveDate,
      openWeather,
      weatherData 
    FROM WeatherData
    ORDER BY id DESC`);
  const events = select.all();

  const sanitizedVersion = validator.escape(appVersion);
  response.render('owdebug', { events, version: sanitizedVersion });
});

// Debug route for update-check requests and per-device summaries.
app.get('/debug/updates', (request, response) => {
  const devices = summarizeUpdateChecks(selectUpdateChecksForSummary.all());
  const recentChecks = selectRecentUpdateChecks.all().map((event) => ({
    ...event,
    updateAvailable: Boolean(event.updateAvailable),
  }));

  const sanitizedVersion = validator.escape(appVersion);
  response.render('updates', { devices, recentChecks, version: sanitizedVersion });
});

// Export route for downloading the event data as a CSV file.
app.get('/export', (request, response) => {
  const select = db.prepare(`
    SELECT
      saveDate,
      vesselData,
      ferryTempoData
    FROM AppData
    ORDER BY id DESC`);
  const events = select.all();
  if (!events || events.length === 0) {
    response.setHeader('Content-Type', 'text');
    response.status(204).send('No event data available.');
    return;
  }
  // Generate the CSV file by splitting the events into their values, separated by commas and newlines.
  const eventsCSV = events.map((event) => Object.values(event).join()).join('\n');
  response.setHeader('Content-disposition', `attachment; filename=ferry-tempo-events-${events[0].saveDate}.csv`);
  response.set('Content-Type', 'text/csv');
  response.status(200).send(eventsCSV);
});

// Endpoint for fetching route data.
app.get('/api/v1/route/:routeId/reference-schedule', allowFerryTempoRouteCors, (request, response) => {
  const routeId = validator.escape(request.params.routeId);
  if (!routeFTData.hasOwnProperty(routeId)) {
    response.setHeader('Content-Type', 'text');
    response.writeHead(400);
    response.end(`Unknown route requested: ${routeId}`);
    return;
  }

  if (!latestReferenceSchedules) {
    response.setHeader('Content-Type', 'text');
    response.writeHead(503);
    response.end(`No reference schedule available for route: ${routeId}`);
    return;
  }

  const referenceSchedule = latestReferenceSchedules[routeId];
  if (!referenceSchedule) {
    response.setHeader('Content-Type', 'text');
    response.writeHead(404);
    response.end(`No reference schedule found for route: ${routeId}`);
    return;
  }

  response.setHeader('Content-Type', 'application/json');
  response.writeHead(200);
  response.end(JSON.stringify({
    ...referenceSchedule,
    serverVersion: appVersion,
  }));
});

app.get('/api/v1/route/:routeId', allowFerryTempoRouteCors, (request, response) => {
  const routeId = validator.escape(request.params.routeId);  // Escape HTML special characters
  const select = db.prepare(`
    SELECT 
      saveDate,
      ferryTempoData
    FROM AppData
    ORDER BY rowid DESC LIMIT 1`);
  const result = select.get();

  // there is a slight chance that a call from a client could come in before we make the first calls to WSDOT, protect from that.
  if (result === undefined || result.ferryTempoData == null) {
    response.setHeader('Content-Type', 'text');
    response.writeHead(400);
    response.end(`No data available for route: ${routeId}`);
    return;
  }

  let ferryTempoData;
  try {
    ferryTempoData = JSON.parse(result.ferryTempoData);
  } catch (error) {
    response.setHeader('Content-Type', 'text');
    response.writeHead(500);
    response.end(`Malformed ferry tempo payload for route: ${routeId}`);
    return;
  }

  if (ferryTempoData && typeof ferryTempoData === 'object' && ferryTempoData.hasOwnProperty(routeId)) {
    const includeScheduleList = request.query.includeScheduleList === 'true' || request.query.includeSchedules === 'true';
    const routeData = request.query.cid ?
      filterDeviceRouteData(ferryTempoData[routeId], includeScheduleList) :
      ferryTempoData[routeId];

    response.setHeader('Content-Type', 'application/json');
    response.writeHead(200);
    response.end(JSON.stringify({
      ...routeData,
      lastUpdate: result.saveDate,
      serverVersion: appVersion,
    }));
  } else {
    response.setHeader('Content-Type', 'text');
    response.writeHead(400);
    response.end(`Unknown route requested: ${routeId}`);
  }
});

// Endpoint to provide sunrise and sunset times for a given city. For now it always returns Bainbridge times.
app.get('/api/v1/sun-times/:city', (request, response) => {
  let city = validator.escape(request.params.city).toLowerCase();  // Escape HTML special characters
  logger.debug(`Sun times request for city: ${city}`);
  const select = db.prepare(`
    SELECT 
      saveDate,
      weatherData
    FROM WeatherData
    ORDER BY rowid DESC LIMIT 1`);
  const result = select.get();
  if (result === undefined || result.weatherData == null) {
    response.setHeader('Content-Type', 'text');
    response.writeHead(400);
    response.end(`No weather data available for city: ${city}`);
    return;
  }

  let weatherData;
  try {
    weatherData = JSON.parse(result.weatherData);
  } catch (error) {
    response.setHeader('Content-Type', 'text');
    response.writeHead(500);
    response.end(`Malformed weather payload for city: ${city}`);
    return;
  }
  
  const timeZone = 'America/Los_Angeles';
  if (weatherData && typeof weatherData === 'object' && weatherData.hasOwnProperty(city)) {
    response.setHeader('Content-Type', 'application/json');
    response.writeHead(200);
    response.end(JSON.stringify({
      sunrise: getTimeFromEpochSeconds(weatherData[city]['astronomical'].sunrise, timeZone),
      sunset: getTimeFromEpochSeconds(weatherData[city]['astronomical'].sunset, timeZone), 
      lastUpdate: result.saveDate,
      serverVersion: appVersion,
    }));
  } else {
    response.setHeader('Content-Type', 'text');
    response.writeHead(400);
    response.end(`Unknown city requested: ${city}`);
  }
});

// Endpoint for fetching route data.
app.get('/debug/ais', (request, response) => {
  if (latestAisData !== null) {
    response.setHeader('Content-Type', 'application/json');
    response.writeHead(200);
    response.end(JSON.stringify(latestAisData));
  } else {
    response.setHeader('Content-Type', 'text');
    response.writeHead(400);
    response.end(`No AIS data available.`);
  }
});

// Endpoint for debugging progress algorithm
app.get('/progress', (request, response) => {
  let {
    routeId,
    lat,
    long,
    direction,
  } = request.query;

  // Escape potentially harmful characters in string parameters
  routeId = validator.escape(routeId || '');
  direction = validator.escape(direction || '');

  // Validate lat, long, direction, and routeId
  if (
    !routeId || 
    !lat || 
    !long || 
    !direction || 
    !validator.isFloat(lat, { min: -90, max: 90 }) ||  // Latitude should be a float between -90 and 90
    !validator.isFloat(long, { min: -180, max: 180 }) ||  // Longitude should be a float between -180 and 180
    !validator.matches(direction, /^(WN|ES)$/)  // Ensure direction is either "WN" or "ES"
  ) {
    response.setHeader('Content-Type', 'text');
    response.writeHead(400);
    response.end(`Invalid input. routeId, direction (WN or ES), lat (position), and long (position) are required.`);
    return;
  }

  // Convert lat and long to float since they are validated as numbers
  lat = parseFloat(lat);
  long = parseFloat(long);

  let routePoints;
  let progress;
  try {
    ({ routePoints, progress } = debugProgress(routeId, direction, [lat, long]));
  } catch (error) {
    response.setHeader('Content-Type', 'text');
    response.writeHead(400);
    response.end(`Invalid route or progress parameters.`);
    return;
  }

  // Sanitize data before rendering the template
  response.render('progress', {
    routeId: validator.escape(routeId),  // Ensure it's safe before rendering
    routePoints: JSON.stringify(routePoints),  // Ensure JSON is escaped
    progress: validator.escape(progress.toString()),  // Escape progress
    direction: validator.escape(direction),  // Escape direction
  });
});

// handle requests for software updates
app.get('/api/v1/check-update', (req, res) => {
  const trackedRequest = getTrackedUpdateRequest(req);
  const clientVersion = getRequestedVersionByType(trackedRequest);
  const model = trackedRequest.hw;
  const type = trackedRequest.type;
  const ip = trackedRequest.ip;
  const cid = trackedRequest.cid;
  logger.debug(`check-update request coming from flash: ${trackedRequest.flashVersion}, spiffs: ${trackedRequest.spiffsVersion}, cid: ${cid}, model: ${model}, type: ${type}, IP: ${ip}`);

  if (!clientVersion || !model) {
    recordUpdateCheck(req, false);
    return res.status(400).send('Version and model parameters are required.');
  }

  let updateAvailable = false;
  if (type === 'spiffs' && spiffsUpdates.hasOwnProperty(model) && spiffsUpdates[model].hasOwnProperty(clientVersion)) {
    const filePath = path.join(__dirname, 'updates', spiffsUpdates[model][clientVersion]);
    logger.debug(`Checking path: ${filePath}`);

    if (fs.existsSync(filePath)) {
      updateAvailable = true;
    }
  }

  if (type === 'flash' && firmwareUpdates.hasOwnProperty(model) && firmwareUpdates[model].hasOwnProperty(clientVersion)) {
    const firmwareUpdateFile = firmwareUpdates[model][clientVersion];
    logger.info(`Flash update available for version ${model}:${clientVersion}: ${firmwareUpdateFile}`);
    const filePath = path.join(__dirname, 'updates', firmwareUpdateFile);
    logger.debug(`Checking path: ${filePath}`);

    if (fs.existsSync(filePath)) {
      updateAvailable = true;
    } 
  }

  recordUpdateCheck(req, updateAvailable);

  if (updateAvailable) {
    res.status(200).send('Update available');
  } else {
  // No Content, meaning no update available
    res.status(204).send();
  }
});

/**
 * Route for downloading the update file. Right now it just sends the file
 * without taking into account whether or not we have a spiffs update and/or
 * a firmware update.
 */
app.get('/api/v1/update', (req, res) => {
  const trackedRequest = getTrackedUpdateRequest(req);
  const clientVersion = getRequestedVersionByType(trackedRequest);
  const model = trackedRequest.hw;
  const updateType = trackedRequest.type;

  if (!clientVersion || !model) {
    return res.status(400).send('Version and model parameters are required.');
  }

  let updateFile = '';
  
  if (updateType === 'flash') {
    updateFile = firmwareUpdates[model]?.[clientVersion] || '';
  } else if (updateType === 'spiffs') {
    updateFile = spiffsUpdates[model]?.[clientVersion] || '';
  } else {
    return res.status(400).send('Type parameter is missing or incorrect.');
  }

  if (updateFile) {
    logger.info(`Update available for model and version ${model}:${clientVersion}: ${updateFile}`);
    const filePath = path.join(__dirname, 'updates', updateFile);
    logger.debug(`Checking path: ${filePath}`);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.sendFile(filePath);
    } else {
      res.status(404).send('Update file not found.');
    }
  } else {
    res.status(204).send(); // No Content, meaning no update available
  }
});

// handle weather data requests based on the city
app.get('/api/v1/weather/:city', (req, res) => {
  let city = validator.escape(req.params.city).toLowerCase();  // Escape HTML special characters
  logger.debug(`Weather request for city: ${city}`);
  const select = db.prepare(`
    SELECT 
      saveDate,
      weatherData
    FROM WeatherData
    ORDER BY rowid DESC LIMIT 1`);
  const result = select.get();
  if (result === undefined || result.weatherData == null) {
    res.setHeader('Content-Type', 'text');
    res.writeHead(400);
    res.end(`No weather data available for city: ${city}`);
    return;
  }

  let weatherData;
  try {
    weatherData = JSON.parse(result.weatherData);
  } catch (error) {
    res.setHeader('Content-Type', 'text');
    res.writeHead(500);
    res.end(`Malformed weather payload for city: ${city}`);
    return;
  }

  if (weatherData && typeof weatherData === 'object' && weatherData.hasOwnProperty(city)) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      ...weatherData[city],
      lastUpdate: result.saveDate,
      serverVersion: appVersion,
    }));
  } else {
    res.setHeader('Content-Type', 'text');
    res.writeHead(400);
    res.end(`Unknown city requested: ${city}`);
  }
});

// Start Express service.
app.listen(PORT, () => {
  logger.info(`======= FTServer v${appVersion} listening on port ${PORT} =======`);
});

const fetchScheduleDataForCurrentSailingDay = () => {
  if (scheduleFetchInFlight) {
    return;
  }

  const tripDate = getSailingDayId();
  scheduleFetchInFlight = true;
  fetchScheduleData(tripDate)
      .then((scheduleData) => {
        latestScheduleData = scheduleData;
        latestScheduleTripDate = tripDate;
      })
      .catch((error) => logger.error(`WSDOT schedules are returning: ${error}`))
      .finally(() => {
        scheduleFetchInFlight = false;
      });
};

const fetchReferenceScheduleDataForRoutes = () => {
  if (referenceScheduleFetchInFlight) {
    return;
  }

  referenceScheduleFetchInFlight = true;
  const fetchedAt = Math.floor(Date.now() / 1000);
  Promise.all([
    fetchReferenceScheduleRoutes(),
    fetchScheduleCacheFlushDate(),
  ])
      .then(([schedRoutes, cacheFlushDate]) => {
        if (latestReferenceSchedules && latestReferenceScheduleCacheFlushDate === cacheFlushDate) {
          return null;
        }

        const schedRouteIds = new Set();
        for (const routeData of Object.values(routeFTData)) {
          const schedRoute = schedRoutes.find((candidate) => {
            return String(candidate.RouteID) === String(routeData.routeID) && !candidate.ContingencyOnly;
          });
          if (schedRoute) {
            schedRouteIds.add(getActiveSchedRouteId(schedRoute, fetchedAt));
          }
        }

        return Promise.all(Array.from(schedRouteIds).map((schedRouteId) => {
          return fetchReferenceSailings(schedRouteId)
              .then((sailings) => [schedRouteId, sailings]);
        })).then((routeSailings) => {
          latestReferenceSchedules = buildReferenceSchedules(
              schedRoutes,
              Object.fromEntries(routeSailings),
              cacheFlushDate,
              fetchedAt,
          );
          latestReferenceScheduleCacheFlushDate = cacheFlushDate;
          return latestReferenceSchedules;
        });
      })
      .catch((error) => logger.error(`WSDOT reference schedules are returning: ${error}`))
      .finally(() => {
        referenceScheduleFetchInFlight = false;
      });
};

const fetchTerminalBulletinDataForPorts = () => {
  if (terminalBulletinFetchInFlight) {
    return;
  }

  terminalBulletinFetchInFlight = true;
  fetchTerminalBulletinData()
      .then((terminalBulletinData) => {
        latestTerminalBulletinData = terminalBulletinData;
      })
      .catch((error) => logger.error(`WSDOT terminal bulletins are returning: ${error}`))
      .finally(() => {
        terminalBulletinFetchInFlight = false;
      });
};

const fetchTerminalSailingSpaceDataForPorts = () => {
  if (terminalSailingSpaceFetchInFlight) {
    return;
  }

  terminalSailingSpaceFetchInFlight = true;
  fetchTerminalSailingSpaceData()
      .then((terminalSailingSpaceData) => {
        latestTerminalSailingSpaceData = terminalSailingSpaceData;
      })
      .catch((error) => logger.error(`WSDOT terminal sailing spaces are returning: ${error}`))
      .finally(() => {
        terminalSailingSpaceFetchInFlight = false;
      });
};

// Start the data processing loop.
const fetchAndProcessData = () => {
  const currentScheduleTripDate = getSailingDayId();
  if (latestScheduleTripDate !== currentScheduleTripDate) {
    fetchScheduleDataForCurrentSailingDay();
  }

  fetchVesselData()
      .then((vesselData) => {
        const ferryTempoData = FerryTempo.processFerryData(
            vesselData,
            latestScheduleData,
            latestTerminalBulletinData,
            latestTerminalSailingSpaceData,
        );

        // Create a row for the latest data.
        const insert = db.prepare(`
          INSERT INTO AppData (
            saveDate,
            vesselData,
            ferryTempoData
          ) VALUES (
            unixepoch(),
            json(?),
            json(?)
          )
        `);
        insert.run(JSON.stringify(vesselData), JSON.stringify(ferryTempoData));

        // Purge any data beyond the expiration limit.
        db.exec(`
            DELETE from AppData
            WHERE saveDate <= unixepoch('now', '-60 minutes')
        `);
      })
      .catch((error) => logger.error(`WSDOT is returning: ${error}`));
};

logger.info(`Fetching schedule data every ${scheduleFetchInterval / 1000} seconds.`);
fetchScheduleDataForCurrentSailingDay();
setInterval(fetchScheduleDataForCurrentSailingDay, scheduleFetchInterval);

logger.info(`Fetching reference schedule data every ${referenceScheduleFetchInterval / 1000} seconds.`);
fetchReferenceScheduleDataForRoutes();
setInterval(fetchReferenceScheduleDataForRoutes, referenceScheduleFetchInterval);

logger.info(`Fetching terminal bulletin data every ${terminalBulletinFetchInterval / 1000} seconds.`);
fetchTerminalBulletinDataForPorts();
setInterval(fetchTerminalBulletinDataForPorts, terminalBulletinFetchInterval);

logger.info(`Fetching terminal sailing space data every ${terminalSailingSpaceFetchInterval / 1000} seconds.`);
fetchTerminalSailingSpaceDataForPorts();
setInterval(fetchTerminalSailingSpaceDataForPorts, terminalSailingSpaceFetchInterval);

logger.info(`Fetching vessel data every ${fetchInterval / 1000} seconds.`);
fetchAndProcessData();
setInterval(fetchAndProcessData, fetchInterval);

// setup the AIS WebWorker to handle the AIS data
const ais_key = `${process.env.AIS_API_KEY}`;

// Verify that the API Key is defined before starting up.
if ((ais_key == undefined) || (ais_key == 'undefined') || (ais_key == null)) {
    logger.error('AIS API key is not defined. Not starting the AIS stream capture.');
} else {
  // Create a new Worker instance
  const worker = new Worker(join(__dirname, 'AISWorker.js'));

  // Send the command to connect with the API key
  worker.postMessage({ command: "connect", apiKey: ais_key });

  // Handle messages from the worker
  worker.on('message', (message) => {
      if (message.type === "vesselData") {
          const aisData = message.data;
          if (latestAisData !== null) {
            latestAisData = {};
          }
          latestAisData = aisData;
          const select = db.prepare(`
            SELECT 
              saveDate,
              ferryTempoData
            FROM AppData
            ORDER BY rowid DESC LIMIT 1`);
          const result = select.get();
          if (result === undefined) {
            logger.warn('Cold start: no AppData available yet to compare AIS assignments.');
            return;
          }
          const ferryTempoData = JSON.parse(result.ferryTempoData);
          // check to see if we need to update AIS data with WSDOT assignments
          const boatAssignments = compareAISData(ferryTempoData, aisData);
          if (boatAssignments && Object.keys(boatAssignments).length > 0) {
            // update the worker with the new boat assignments
            worker.postMessage({ command: "update", boatData: boatAssignments });
          }
      }

      if (message.type === "disconnected") {
          logger.info("WebSocket connection closed");
      }

      if (message.type === "error") {
          logger.error("Error received from WebSocket:", message.error);
      }
  });
}


// Retrieve the Open Weather API key. Unlike the WSDOT key, we continue but do not pull that data.
const weatherKey = `${process.env.OPENWEATHER_KEY}`;
if ((weatherKey == undefined) || (weatherKey == 'undefined') || (weatherKey == null)) {
  logger.error('OPEN WEATHER API key is not defined. Make sure you have OPENWEATHER_KEY defined in your .env file.');
} else {
  // Start the data processing loop for weather data, which runs every 5 minutes.
  const fetchWeatherData = () => {
    getOpenWeatherData()
        .then((openWeather) => {
          const weatherData = processOpenWeatherData(openWeather);
          const insert = db.prepare(`
            INSERT INTO WeatherData (
              saveDate,
              openWeather,
              weatherData
            ) VALUES (
              unixepoch(),
              json(?),
              json(?)
            )
          `);
          insert.run(JSON.stringify(openWeather), JSON.stringify(weatherData));

          // Purge any data beyond the expiration limit.
          db.exec(`
              DELETE from WeatherData
              WHERE saveDate <= unixepoch('now', '-60 minutes')
          `);
        })
        .catch((error) => {
          logger.error(`Weather data fetch error: ${error}`)
          logger.error(`${error.stack}`)
      });
  };

  logger.info(`Fetching weather data every 10 minutes.`); // 10 min is the update frequency from OpenWeather
  fetchWeatherData();
  setInterval(fetchWeatherData, 600000);
}
