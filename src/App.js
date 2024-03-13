/**
 * App.js
 * =========
 * Handles requests, provides data, catches errors.
 */
import 'dotenv/config';
import http from 'http';
import WSDOT from './WSDOT.js';
import FerryTempo from './FerryTempo.js';

const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = process.env.PORT || 8080;

// verify that the API Key is defined before starting up
const key = `${process.env.WSDOT_API_KEY}`;
if ((key == undefined) || (key == 'undefined') || (key == null)) {
  console.error('API key is not defined. Make sure you have WSDOT_API_KEY defined in your .env file.');
  process.exit(-1);
}
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
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(`
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Ferry Tempo Server</title>
        <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css">
      </head>
      
      <body>
        <h1>Welcome to the <a href="https://github.com/FerryTempo/FTServer"/>FerryTempo FTServer</a>!</h1>
      
        <p>Here are the available routes:</p>
        <ul>
          <li><a href="/FTData/pt-cou">pt-cou</a>
          <li><a href="/FTData/muk-cl">muk-cl</a>
          <li><a href="/FTData/ed-king">ed-king</a>
          <li><a href="/FTData/sea-bi">sea-bi</a>
          <li><a href="/FTData/sea-br">sea-br</a>
        </ul>      
      </body>
    </html>`);
  }
};

// Set up localhost service to expose the fetched vessel data.
const server = http.createServer(requestListener);

// Kick off localhost service.
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
