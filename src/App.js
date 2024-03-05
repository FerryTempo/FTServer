/**
 * App.js
 * =========
 * Handles requests, provides data, catches errors.
 */
import 'dotenv/config';
import http from 'http';
import WSDOT from './WSDOT.js';
import FerryTempo from './FerryTempo.js';

const hostname = '127.0.0.1';
const port = process.env.PORT || 8080;

// Start the WSDOT vessel data fetching loop.
WSDOT.startFetchInterval();

// HTTP request routing
const requestListener = (req, res) => {
  console.log(`Request received at ${req.url}`);

  if (req.url.includes('vesselData')) {
    // Debugging endpoint for retrieving the current WSDOT vessel data
    res.setHeader('Content-Type', 'text/json');
    res.writeHead(200);
    res.end(JSON.stringify(WSDOT.getVesselData()));
  } else if (req.url.includes('FTData')) {
    // Endpoint for fetching Ferry Tempo data
    res.setHeader('Content-Type', 'text/json');
    res.writeHead(200);
    // TODO: Check req.url for matches with known routes, otherwise return 400
    const routeAbbrev = req.url.substring(req.url.lastIndexOf('/') + 1);
    res.end(JSON.stringify(FerryTempo.getRouteData(routeAbbrev)));
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.writeHead(200);
    res.end('You have reached an invalid FerryTempo route.  Please try "/vesselData" or "/FerryTempo".');
  }
};

// Set up localhost service to expose the fetched vessel data.
const server = http.createServer(requestListener);

// Kick off localhost service.
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
