/**
 * server.js
 * =========
 * Handles requests, provides data, catches errors.
 */

import fetch from 'node-fetch';
import http from 'http';

import VesselData from './VesselData.js';
import FTData from './FTData.js';

const hostname = '127.0.0.1'; // TODO: Modify to allow for host machine configuration.
const port = 3000;
const fetchInterval = 1000; // How often to fetch WSDOT data, in ms.

export default () => {
  // HTTP request routing
  const requestListener = (req, res) => {
    res.setHeader('Content-Type', 'text/json');

    console.log(`Request received at ${req.url}`);

    if (req.url.includes('vesselData')) {
      // Debugging endpoint for retreiving the current WSDOT vessel data
      res.writeHead(200);
      res.end(JSON.stringify(VesselData.getVesselData()));
    } else if (req.url.includes('FTData')) {
      // Endpoint for fetching Ferry Tempo data
      res.writeHead(200);
      // TODO: Check req.url for matches with known routes, otherwise return 400
      const routeAbbrev = req.url.substring(req.url.lastIndexOf('/') + 1);
      res.end(JSON.stringify(FTData.getRouteData(routeAbbrev)));
    } else {
      res.writeHead(400);
      res.end("Not found");
    }
  };

  // Set up localhost service to expose the fetched vessel data.
  const server = http.createServer(requestListener);

  // Kick off an interval fetch and subsequent storage of vessel data.
  console.log(`Fetching vessel data from WSDOT every ${fetchInterval / 1000} seconds.`);
  setInterval(() => {
    fetch('https://www.wsdot.wa.gov/ferries/api/vessels/rest/vessellocations?apiaccesscode=7c3d72ee-5a64-477f-be59-c5a4fc547a37')
        .then((res) => res.json())
        .then((json) => {
          // Store the received WSDOT vessel data
          VesselData.setVesselData(json);

          // Process the WSDOT vessel data into FTData
          FTData.processFerryData(VesselData.getVesselData());
        });
  }, fetchInterval);

  // Kick off localhost service.
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
};
