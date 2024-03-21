# FerryTempo Server

This is the [NodeJS](https://nodejs.org/) server providing data for the FerryTempo.  It fetches data from the WSDOT Traveler Information API, specifically the [ferry vessel location endpoint](https://www.wsdot.wa.gov/ferries/api/vessels/rest/help/operations/GetAllVesselLocations).  Then, it processes that ferry data into the FerryTempo data object format.  Finally, it provides HTTP endpoints for fetching ferry data on a per-route basis.

## Getting Started
If you'd like to run FTServer locally, follow these instructions:

1. Clone this repo (see [clone instructions](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)).
2. Install NodeJS (see [install instructions](https://nodejs.org)).
3. Run `npm i` to install the dependencies.
4. Create a `.env` file in the project root containing `WSDOT_API_KEY=<API KEY>` (ask a team member for the key).
5. Run `npm run dev` to start the server in development mode with hot reloading.
or
5. Run `npm run start` to start the server in production mode.

## Schema Documentation
We auto-generate schema documentation based on the JSON Schema. That documentation is [available in the /docs directory](https://github.com/FerryTempo/FTServer/blob/main/docs/README.md).

## Contributing
To help contribute to FTServer, please read and follow the guidelines in [Contributing.md](./docs/Contributing.md).