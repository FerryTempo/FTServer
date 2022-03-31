import fetch from 'node-fetch';
import http from 'http';

const hostname = '127.0.0.1';
const port = 3000;

var ferryData = {};

// HTTP request routing map.
const requestListener = (req, res) => {
  res.setHeader('Content-Type', 'text/json');

  switch (req.url) {
    case '/pt-cou':
      res.writeHead(200);
      res.end(JSON.stringify({ route: "pt-cou"}));
      break;
    case '/muk-cl':
      res.writeHead(200);
      res.end(JSON.stringify({ route: "muk-cl"}));
      break;
    case '/ed-king':
      res.writeHead(200);
      res.end(JSON.stringify({ route: "ed-king"}));
      break;
    case '/sea-bi':
      res.writeHead(200);
      res.end(JSON.stringify({ route: "sea-bi"}));
      break;
    case '/sea-br':
      res.writeHead(200);
      res.end(JSON.stringify({ route: "sea-br"}));
      break;
    default: 
      res.writeHead(404);
      res.end(JSON.stringify({error:"Resource not found"}));
  }
  // res.end(JSON.stringify(ferryData));
};

// Set up localhost service to expose the fetched ferry data.
const server = http.createServer(requestListener);

// Kick off an interval fetch and subsequent storage of ferry data.
const interval = 1000;
console.log(`Fetching ferry data from WSDOT every ${interval / 1000} seconds.`);
const intervalFetch = setInterval(() => {
  fetch('https://www.wsdot.wa.gov/ferries/api/vessels/rest/vessellocations?apiaccesscode=7c3d72ee-5a64-477f-be59-c5a4fc547a37')
      .then(res => res.json())
      .then(json => {
        ferryData = json;
  });
}, interval);

// Kick off localhost service.
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});