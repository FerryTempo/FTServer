# Temporary Gen 1 bridge

Supports the single remaining Seattle–Bainbridge Gen 1 device until its planned
Gen 2 hardware retrofit in early 2027. Do not extend this into a second backend.

`Progress.js` owns the legacy route geometry, prediction, formatting, freshness
state, and Express handler. It receives successful snapshots from the existing
WSDOT fetch loop, without polling, persistence, or dependencies of its own.
Gen 2 processing and response schemas remain independent of this module.

## Interface

`GET /gen1/progress` returns HTTP 200, `text/plain`, and `Cache-Control: no-store`:

```
current,future,ageMs,DEPARTING:current,future,ageMs,ARRIVING:15000
```

Records are sorted by VesselID, filtered to in-service `sea-bi` vessels, and
padded to at least two records, matching the old server. Positions run from
Bainbridge (0) to Seattle (1); the future position uses speed and heading over
15 seconds. Docked boats have identical positions and zero age. Direction is
relative to Bainbridge. As upstream does, more than two matching vessels are
returned rather than silently changing which vessel IDs occupy the first slots.

Before the first feed update, or after 60 seconds without a successful snapshot:

```
0,0,0,DEPARTING:1,1,0,ARRIVING:-1
```

Unlike the old server, invalid or over-60-second-old underway telemetry also
produces this fallback, and future timestamps are clamped to zero age. Fresh
empty routes retain the upstream padded response ending in `15000`.
The existing feed updates every five seconds; `15000` is the prediction horizon,
not a new polling interval. No idle-on-no-requests behavior is necessary.

The Gen 2 HTML debugger remains at `/progress` with its existing `routeId`,
`direction`, `lat`, and `long` query parameters. The reflashed Gen 1 device uses
the separate `/gen1/progress` path; its response format remains compatible.

## Deployment and device

Deploy FTServer through its existing Render workflow; no additional service or
environment variable is needed. The device must be flashed to request
`https://ftserver-4fqq.onrender.com/gen1/progress` with a TLS-capable client. Changing
only the URL in the original plain-HTTP firmware is insufficient. Firmware is
outside this change; test on the physical device before considering the migration
complete. Verify fresh vessel positions and timing, not just HTTP 200, because
stale responses also return 200. No live deployment is performed by this change.

## Removal after retrofit

1. Delete the `createGen1Progress` import, `gen1Progress` initialization,
   `/gen1/progress` registration, and `gen1Progress.update(vesselData)` call in
   `src/App.js` (search for `gen1Progress` and `createGen1Progress`).
2. Delete this entire directory and `test/Gen1Progress.test.js`.
3. Run `npm test -- --runInBand`.

The Gen 2 debugger at `/progress` needs no changes during removal.
No database migration, dependency removal, environment cleanup, or Gen 2 schema
change is required.

## Provenance

The legacy geometry and prediction behavior are adapted from
https://github.com/pietroglyph/fow/blob/53356190504c4ad55c43ea7bf6b8a561b2fd750d/fow-server/progress.go
by Declan Freeman-Gleason. The upstream GPL-3.0-or-later notice is retained in
`Progress.js`, with the full license in `LICENSE`.
