/**
 * app.js
 * =========
 * Handles requests, provides data, catches errors.
 */

import fetch from 'node-fetch';
import http from 'http';
import cluster from 'cluster';
import os from 'os';

import VesselData from './src/VesselData.js';
import FTData from './src/FTData.js';

// Code to run if we're in the master process
if (cluster.isPrimary) {
  // Count the machine's CPUs
  const cpuCount = os.cpus().length;

  // Create a worker for each CPU
  for (let i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }

  // Listen for terminating workers
  cluster.on('exit', function(worker) {
    // Replace the terminated workers
    console.log('Worker ' + worker.id + ' died :(');
    cluster.fork();
  });

// Code to run if we're in a worker process
} else {
  const hostname = '127.0.0.1';
  const port = process.env.port || 8080;
  const fetchInterval = 60000; // How often to fetch WSDOT data, in ms.

  // HTTP request routing
  const requestListener = (req, res) => {
    console.log(`Request received at ${req.url}`);

    if (req.url.includes('vesselData')) {
      // Debugging endpoint for retreiving the current WSDOT vessel data
      res.setHeader('Content-Type', 'text/json');
      res.writeHead(200);
      res.end(JSON.stringify(VesselData.getVesselData()));
    } else if (req.url.includes('FTData')) {
      // Endpoint for fetching Ferry Tempo data
      res.setHeader('Content-Type', 'text/json');
      res.writeHead(200);
      // TODO: Check req.url for matches with known routes, otherwise return 400
      const routeAbbrev = req.url.substring(req.url.lastIndexOf('/') + 1);
      res.end(JSON.stringify(FTData.getRouteData(routeAbbrev)));
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.writeHead(200);
      res.end('You have reached an invalid FerryTempo route.  Please try "/vesselData" or "/FTData". Hello!');
    }
  };

  // Set up localhost service to expose the fetched vessel data.
  const server = http.createServer(requestListener);

  const fetchAndProcess = () => {
    fetch('https://www.wsdot.wa.gov/ferries/api/vessels/rest/vessellocations?apiaccesscode=7c3d72ee-5a64-477f-be59-c5a4fc547a37')
      .then((res) => res.json())
      .then((json) => {
        // Store the received WSDOT vessel data
        VesselData.setVesselData(json);

        // Process the WSDOT vessel data into FTData
        FTData.processFerryData(VesselData.getVesselData());
      });
  }

  // Kick off an interval fetch and subsequent storage of vessel data.
  console.log(`Fetching vessel data from WSDOT every ${fetchInterval / 1000} seconds.`);
  fetchAndProcess();
  setInterval(fetchAndProcess, fetchInterval);

  // Kick off localhost service.
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}
