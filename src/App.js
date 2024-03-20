/**
 * App.js
 * =========
 * Essentially the "controller" of the MVC framework. 
 * Handles requests, stores data, catches errors.
 */
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import Database from 'better-sqlite3';
import { fetchVesselData } from './WSDOT.js';
import FerryTempo from './FerryTempo.js';
import appInfo from '../package.json' assert { type: "json" };

const PORT = process.env.PORT || 8080;
const app = express();
const fetchInterval = 5000;

// Verify that the API Key is defined before starting up.
const key = `${process.env.WSDOT_API_KEY}`;
if ((key == undefined) || (key == 'undefined') || (key == null)) {
  console.error('API key is not defined. Make sure you have WSDOT_API_KEY defined in your .env file.');
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
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.set('view engine', 'pug');

// Index route for debugging and user-friendly routing.
app.get('/', (request, response) => {
  // Select all DB rows and render.
  const select = db.prepare(`
    SELECT 
      saveDate, datetime(saveDate, 'localtime') as "saveDate",
      vesselData,
      ferryTempoData 
    FROM AppData
    ORDER BY id DESC`);
  const events = select.all();
  response.render('index', {events, version:appInfo.version});
});

// Endpoint for fetching route data.
app.get('/FTData/:routeId', (request, response) => {
  const routeId = request.params.routeId;
  const select = db.prepare(`
    SELECT 
      saveDate,
      ferryTempoData
    FROM AppData
    ORDER BY rowid DESC LIMIT 1`);
  const result = select.get();
  const ferryTempoData = JSON.parse(result.ferryTempoData);

  if (ferryTempoData[routeId] !== undefined) {
    response.setHeader('Content-Type', 'text/json');
    response.writeHead(200);
    response.end(JSON.stringify({
      ...ferryTempoData[routeId],
      lastUpdate: result.saveDate,
      serverVersion: appInfo.version
    }));
  } else {
    response.setHeader('Content-Type', 'text');
    response.writeHead(400);
    response.end(`Unknown route requested: ${routeId}`);
  }
});

// Start Express service.
app.listen(PORT, () => {
  console.log(`======= FTServer v${appInfo.version} listening on port ${PORT} =======`);
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
            datetime('now'),
            json(?),
            json(?)
          )
        `);
        insert.run(JSON.stringify(vesselData), JSON.stringify(ferryTempoData));

        // Purge any data beyond the expiration limit.
        db.exec(`
            DELETE from AppData
            WHERE saveDate <= datetime('now', '-20 minutes')
        `);
      })
      .catch((error) => console.error(error));
};

console.log(`Fetching vessel data every ${fetchInterval / 1000} seconds.`);
fetchAndProcessData();
setInterval(fetchAndProcessData, fetchInterval);
