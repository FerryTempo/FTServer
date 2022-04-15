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

    switch (req.url) {
      case '/pt-cou':
        res.writeHead(200);
        res.end(JSON.stringify(FerryData.getRouteData('pt-cou')));
        break;
      case '/muk-cl':
        res.writeHead(200);
        res.end(JSON.stringify(FerryData.getRouteData('muk-cl')));
        break;
      case '/ed-king':
        res.writeHead(200);
        res.end(JSON.stringify(FerryData.getRouteData('ed-king')));
        break;
      case '/sea-bi':
        res.writeHead(200);
        res.end(JSON.stringify(FerryData.getRouteData('sea-bi')));
        break;
      case '/sea-br':
        res.writeHead(200);
        res.end(JSON.stringify(FerryData.getRouteData('sea-br')));
        break;
      default:
        res.writeHead(404);
        res.end(JSON.stringify({error: 'Route not found - specify a known route endpoint.'}));
    }
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
