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

## Persistent state (Render disk)

The day's sailing logs, day averages and completed-departure metrics live in memory. To keep them
across deploys and restarts, attach a persistent disk and set:

- `STATE_DIR`: the disk's mount path, for example `/var/data`. The server restores
  `ftserver-state.json` from it at startup, saves it every minute, and saves it on shutdown (SIGTERM).
  When unset, state is kept in memory only.
- `NOTIFICATION_DB_PATH`: put the notification subscriptions on the same disk, for example
  `/var/data/notifications.sqlite`. Otherwise they're stored in the app directory, which a deploy
  replaces.

## Device dashboard

`/debug/devices` counts the devices (by `cid`) requesting route data. To show each device's
approximate location (usually the city) from its IP address, set `GEOIP_ENABLED=true`. The server
then downloads the free [DB-IP](https://db-ip.com) "IP to City Lite" database (about 60 MB to
download, roughly 130 MB in memory) and refreshes it monthly. It is saved in `GEOIP_DIR`, else
`STATE_DIR`, else `data/`. IP addresses are looked up on the server and never shown on the page.

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

`StopTimerAverage` and `PortStopTimerAverage` average completed turnarounds
only when the server observes both the arrival and following departure within
the same 3am-Pacific sailing day. The initial docked interval before a vessel's
first sailing and overnight stops are excluded, so idle time does not inflate
active-service averages. The persistent daily averages still reset at the next
sailing-day boundary.

`PortLastDepartureDelay` is the latest completed terminal departure's `LeftDock`
minus `ScheduledDeparture` in seconds; both WSF timestamps and an underway vessel
are required. Zero and negative (early) delays are valid. It remains distinct from
vessel-specific `LastDepartureDelay`. `PortDepartureDelay` still prefers a docked
vessel's current delay, otherwise the latest departed vessel; its cached value and
`PortDepartureDelayAverage` retain their existing behavior.

`NextScheduledDeparture` is the terminal's next sailing however late, from the boats: a boat docked
there departs on the sailing WSF reports for it until it leaves (unless that boat's own next sailing has
already passed, a sign of stale WSF data); a boat crossing there departs on its vessel position's next
sailing there after the one it's on. The earliest of those, otherwise the next scheduled slot. Never a
cancelled sailing, nor one more than 3 hours past.

`PortSailingLog` rows are `[scheduledDeparture, departureDelay, crossingTime, vesselPosition]`, with a
fifth status element when there is one: `"cancelled"` (WSF terminal sailing space `IsCancelled`, recorded
while WSF lists it and kept for the sailing day) or `"skipped"` (never departed, though the same vessel
position departed this terminal both before and after it). Rows without a status stay four elements long.

New completed metrics are ordered by actual departure time, use the existing WSF
sailing-day boundary (3am Pacific), and are `null` until a qualifying event is
observed that day. They use in-memory observation history, which resets on server
restart. Port metrics do not require a vessel position assignment and exclude
vessels off duty. Provisional or incomplete `PortSailingLog` rows do not supply
completed metrics. New fields also pass through the device-filtered route response
and triangle leg dictionaries. This repository does not own client decoders.

## Push notifications

Sailing pings go to iOS through APNs (`APNS_*` variables) and to Android through Firebase Cloud Messaging.

For Android, create a service account key in the Firebase console (project `ferrytempo-7f0f8` → Project settings → Service accounts → Generate new private key) and give the server either:

- `FCM_SERVICE_ACCOUNT_PATH`: the path to the key file. On Render, add it as a Secret File named `firebase-service-account.json` and set `FCM_SERVICE_ACCOUNT_PATH=/etc/secrets/firebase-service-account.json`.
- `FCM_SERVICE_ACCOUNT_JSON`: the key file's contents.

Without either, Android notifications are skipped (and logged once). The key grants send access to the Firebase project, so keep it out of the repository.
