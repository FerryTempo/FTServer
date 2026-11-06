# AGENTS.md

Notes for AI coding agents (and people) changing FTServer.

## Commands

- `npm test` runs lint, then the Jest suite. Run it before committing.
- `npm run dev` starts the server locally with reloading. It needs `WSDOT_API_KEY` in `.env`.

## Clients

`/api/v1/route/:routeId` serves two kinds of clients from the same data:

- **The app and ferrytempo.com** get the full response (no `view`, or `view=full`).
- **FerryClock devices** (ESP32-S2, firmware in the FTClient repo) get the device view: `view=device`, or any request with `cid` and no `view`.

## Rule: don't grow what FerryClocks download

Clocks without PSRAM have roughly 60 KB of RAM for an HTTPS request. A larger response makes their requests fail.

- The device view is an **allowlist**: `DEVICE_BOAT_FIELDS` and `DEVICE_PORT_FIELDS` in `src/RouteEndpointHelpers.js`. Fields added to route data for the app do **not** reach clocks, and that's intended.
- Add a field to those lists only when FTClient firmware that reads it is shipping. Update the pinned list in `test/RouteEndpointHelpers.test.js` in the same change.
- Never change device responses back to removing fields from the full data (a denylist). That is how `PortSailingStates` and `PortVesselEvents` grew every clock request from about 2 KB to 18 KB.
- The device view of a route should stay under about 1 KB.
