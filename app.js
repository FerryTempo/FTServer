import fetch from 'node-fetch';
import http from 'http';

const hostname = '127.0.0.1';
const port = 3000;

var ferryData = {};

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/json');
  res.end(JSON.stringify(ferryData));
});

const interval = setInterval(() => {
  fetch('https://www.wsdot.wa.gov/ferries/api/vessels/rest/vessellocations?apiaccesscode=7c3d72ee-5a64-477f-be59-c5a4fc547a37')
      .then(res => res.json())
      .then(json => {
        console.log("Updated ferry data");
        ferryData = json;
  });
}, 1000);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
