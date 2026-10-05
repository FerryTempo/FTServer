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
### Completed stop and departure metrics

The route API keeps its `boatData` and `portData` dictionaries. `LastStop` beside
`StopTimerAverage` is the vessel's latest completed stop. `PortLastStop` beside
`PortStopTimerAverage` is the latest completed stop at that route terminal, across
vessels. Both measure seconds from the first observed docked timestamp to WSF
`LeftDock`, or the first observed underway timestamp when `LeftDock` is missing.
An unobserved arrival, incomplete stop, terminal mismatch, or negative duration
cannot produce a stop value.

`PortLastDepartureDelay` is the latest completed terminal departure's `LeftDock`
minus `ScheduledDeparture` in seconds; both WSF timestamps and an underway vessel
are required. Zero and negative (early) delays are valid. It remains distinct from
vessel-specific `LastDepartureDelay`. `PortDepartureDelay` still prefers a docked
vessel's current delay, otherwise the latest departed vessel; its cached value and
`PortDepartureDelayAverage` retain their existing behavior.

New completed metrics are ordered by actual departure time, use the existing WSF
sailing-day boundary (3am Pacific), and are `null` until a qualifying event is
observed that day. They use in-memory observation history, which resets on server
restart. Port metrics do not require a vessel position assignment and exclude
vessels off duty. Provisional or incomplete `PortSailingLog` rows do not supply
completed metrics. New fields also pass through the device-filtered route response
and triangle leg dictionaries. This repository does not own client decoders.
