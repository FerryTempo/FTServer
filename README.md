# FerryTempo Server

This is the [NodeJS](https://nodejs.org/) server providing data for the FerryTempo.  It fetches data from the WSDOT Traveler Information API, specifically the [ferry vessel location endpoint](https://www.wsdot.wa.gov/ferries/api/vessels/rest/help/operations/GetAllVesselLocations).  Then, it processes that ferry data into the FerryTempo data object format.  Finally, it provides HTTP endpoints for fetching ferry data on a per-route basis.

## Getting Started
If you'd like to run FTServer locally, follow these instructions:

1. Clone this repo (see [clone instructions](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)).
2. Install NodeJS (see [install instructions](https://nodejs.org)).
3. Run `npm i` to install the dependencies.

## Running the Service
To run the FTServer locally, follow these instructions:
1. Complete the steps in Getting Started.
2. Run `node app.js` to start the server.


## Running Tests
To run the unit tests for FTServer locally, follow these instructions:
1. Complete the steps in Getting Started.
2. Run `npm run test` to run the mocha tests located in `/test`.

_Note: `npm run test` will first run the ESLint linter, confirming code quality.  Any issues with code quality will block the unit tests from running._