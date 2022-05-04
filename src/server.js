/**
 * server.js
 * =========
 * Handles requests, provides data, catches errors.
 */

import fetch from 'node-fetch';
import http from 'http';
import FerryData from './FerryData.js';

const hostname = '127.0.0.1';
const port = 3000;
const fetchInterval = 1000; // How often to fetch WSDOT data, in ms.

export default () => {
  // HTTP request routing map.
  const requestListener = (req, res) => {
    res.setHeader('Content-Type', 'text/json');

    console.log(`Request received at ${req.url}`);

    res.writeHead(200);
    // TODO: Test this string manipulation of url for errors
    // Remove leading "/" from req.url and use to get route data
    res.end(JSON.stringify(FerryData.getRouteData(req.url.substring(1))));
  };

  // Set up localhost service to expose the fetched ferry data.
  const server = http.createServer(requestListener);

  // Kick off an interval fetch and subsequent storage of ferry data.
  console.log(`Fetching ferry data from WSDOT every ${fetchInterval / 1000} seconds.`);
  setInterval(() => {
    fetch('https://www.wsdot.wa.gov/ferries/api/vessels/rest/vessellocations?apiaccesscode=7c3d72ee-5a64-477f-be59-c5a4fc547a37')
        .then((res) => res.json())
        .then((json) => {
          FerryData.setFerryData(json);
        });
  }, fetchInterval);

  // Kick off localhost service.
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
};
