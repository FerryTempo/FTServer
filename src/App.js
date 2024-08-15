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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 8080;
const app = express();
const fetchInterval = 5000;
const appVersion = process.env.npm_package_version;
const logger = new Logger();

// array used to track the existing versions and the update files
const updates = {
  "1.0.0": "PointsOfSail2.ino.bin"
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
app.get('/check-update', (req, res) => {
  const clientVersion = req.query.version;

  if (!clientVersion) {
    return res.status(400).send('Version parameter is required.');
  }

  const updateFile = updates[clientVersion];

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
      .catch((error) => logger.error(error));
};

logger.info(`Fetching vessel data every ${fetchInterval / 1000} seconds.`);
fetchAndProcessData();
setInterval(fetchAndProcessData, fetchInterval);
