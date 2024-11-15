/**
 * App.js
 * =========
 * Essentially the "controller" of the MVC framework.
 * Handles requests, stores data, catches errors.
 */
import 'dotenv/config';
import express from 'express';
import Database from 'better-sqlite3';
import { fetchVesselData } from './WSDOT.js';
import FerryTempo, { debugProgress } from './FerryTempo.js';
import Logger from './Logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Worker } from 'worker_threads';
import { join } from 'path';
import { compareAISData } from './Utils.js';
import { getOpenWeatherData, processOpenWeatherData } from './OpenWeather.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 8080;
const app = express();
const fetchInterval = 5000;
const appVersion = process.env.npm_package_version;
const logger = new Logger();
let latestAisData = null;

// array used to track the existing versions and the update files
const spiffsUpdates = {
};
const firmwareUpdates = {
  "1.0.4": "PointsOfSail2.ino.bin"
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

// Set up the Express app.
app.use(express.json());
app.set('view engine', 'pug');

app.get('/', (request, response) => {
  response.render('index', { version: appVersion });
});

// Debug route for debugging and user-friendly routing.
app.get('/debug', (request, response) => {
  const select = db.prepare(`
    SELECT 
      saveDate,
      vesselData,
      ferryTempoData 
    FROM AppData
    ORDER BY id DESC`);
  const events = select.all();
  response.render('debug', { events, version: appVersion });
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
  response.render('owdebug', { events, version: appVersion });
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
  // Generate the CSV file by splitting the events into their values, separated by commas and newlines.
  const eventsCSV = events.map((event) => Object.values(event).join()).join('\n');
  response.setHeader('Content-disposition', `attachment; filename=ferry-tempo-events-${events[0].saveDate}.csv`);
  response.set('Content-Type', 'text/csv');
  response.status(200).send(eventsCSV);
});

// Endpoint for fetching route data.
app.get('/api/v1/route/:routeId', (request, response) => {
  const routeId = request.params.routeId;
  const select = db.prepare(`
    SELECT 
      saveDate,
      ferryTempoData
    FROM AppData
    ORDER BY rowid DESC LIMIT 1`);
  const result = select.get();

  // there is a slight chance that a call from a client could come in before we make the first calls to WSDOT, protect from that.
  if (result === undefined) {
    response.setHeader('Content-Type', 'text');
    response.writeHead(400);
    response.end(`No data available for route: ${routeId}`);
    return;
  }

  const ferryTempoData = JSON.parse(result.ferryTempoData);

  if (ferryTempoData !== null && ferryTempoData.hasOwnProperty(routeId)) {
    response.setHeader('Content-Type', 'text/json');
    response.writeHead(200);
    response.end(JSON.stringify({
      ...ferryTempoData[routeId],
      lastUpdate: result.saveDate,
      serverVersion: appVersion,
    }));
  } else {
    response.setHeader('Content-Type', 'text');
    response.writeHead(400);
    response.end(`Unknown route requested: ${routeId}`);
  }
});

// Endpoint for fetching route data.
app.get('/debug/ais', (request, response) => {
  if (latestAisData !== null) {
    response.setHeader('Content-Type', 'text/json');
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
  const {
    routeId,
    lat,
    long,
    direction,
  } = request.query;
  if (!routeId || !lat || !long || !direction) {
    response.setHeader('Content-Type', 'text');
    response.writeHead(400);
    response.end(`routeId, direction (WN or ES), lat (position) and long (position) are required.`);
    return;
  }

  const {
    routePoints,
    progress,
  } = debugProgress(routeId, direction, [lat, long]);
  response.render('progress', { routeId, routePoints: JSON.stringify(routePoints), progress, direction });
});

// handle requests for software updates
app.get('/api/v1/check-update', (req, res) => {
  const clientVersion = req.query.version;
  const type = req.query.type;
  logger.debug(`check-update request coming from client version: ${clientVersion}, type: ${type}, IP:  ${req.ip}`);

  if (!clientVersion) {
    return res.status(400).send('Version parameter is required.');
  }

  const spiffsUpdateFile = spiffsUpdates[clientVersion];
  const firmwareUpdateFile = firmwareUpdates[clientVersion];
  var updateAvailable = false;

  if (spiffsUpdateFile && type === 'spiffs') {
    const filePath = path.join(__dirname, 'updates', spiffsUpdateFile);
    logger.debug(`Checking path: ${filePath}`);

    if (fs.existsSync(filePath)) {
      updateAvailable = true;
    } 
  } 

  if (firmwareUpdateFile && type === 'flash') {
    logger.info(`Flash update available for version ${clientVersion}: ${firmwareUpdateFile}`);
    const filePath = path.join(__dirname, 'updates', firmwareUpdateFile);
    logger.debug(`Checking path: ${filePath}`);

    if (fs.existsSync(filePath)) {
      updateAvailable = true;
    } 
  }

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
  const clientVersion = req.query.version;

  if (!clientVersion) {
    return res.status(400).send('Version parameter is required.');
  }

  var updateFile = '';
  
  if (updateType === 'flash') {
    updateFile = firmwareUpdates[clientVersion];
  } else if (updateType === 'spiffs') {
    updateFile = spiffsUpdates[clientVersion];
  } else {
    return res.status(400).send('Type parameter is missing or incorrect.');
  }

  if (updateFile) {
    logger.info(`Update available for version ${clientVersion}: ${updateFile}`);
    const filePath = path.join(__dirname, 'updates', updateFile);
    logger.debug(`Checking path: ${filePath}`);

    if (fs.existsSync(filePath)) {
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
  const city = req.params.city;
  logger.debug(`Weather request for city: ${city}`);
  const select = db.prepare(`
    SELECT 
      saveDate,
      weatherData
    FROM WeatherData
    ORDER BY rowid DESC LIMIT 1`);
  const result = select.get();
  const weatherData = JSON.parse(result.weatherData);

  if (weatherData !== null && weatherData.hasOwnProperty(city)) {
    res.setHeader('Content-Type', 'text/json');
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

// Start the data processing loop.
const fetchAndProcessData = () => {
  fetchVesselData()
      .then((vesselData) => {
        const ferryTempoData = FerryTempo.processFerryData(vesselData);

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
//          logger.debug(`Open Weather data: ${JSON.stringify(openWeather)}`);
//          logger.debug(`Weather data: ${JSON.stringify(weatherData)}`);
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