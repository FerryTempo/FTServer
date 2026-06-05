# Triangle Route Implementation Plan

## Scope

Add a seventh FerryTempo route group for the Fauntleroy / Vashon / Southworth
triangle without weakening the existing two-terminal route behavior.

The triangle group has three physical legs:

- Leg A: Fauntleroy <-> Vashon
- Leg B: Vashon <-> Southworth
- Leg C: Southworth <-> Fauntleroy

## Source Findings

WSDOT presents the triangle as a named service area, but its current public
schedule UI lists the three sailing relationships separately:

- Fauntleroy / Vashon
- Fauntleroy / Southworth
- Southworth / Vashon

The Schedule API documentation also models schedules by `RouteID` or by
departing and arriving terminal IDs, not by a three-terminal route group.

Verified on 2026-06-04 with
`/ferries/api/schedule/rest/routes/2026-06-04`:

- Fauntleroy / Southworth: route ID `13`, route abbreviation `f-s`
- Fauntleroy / Vashon: route ID `14`, route abbreviation `f-v-s`
- Southworth / Vashon: route ID `15`, route abbreviation `s-v`

Verified terminal IDs and terminal abbreviations:

- Fauntleroy: terminal ID `9`, terminal abbreviation `FAU`
- Vashon Island: terminal ID `22`, terminal abbreviation `VAI`
- Southworth: terminal ID `20`, terminal abbreviation `SOU`

Verified terminal coordinates from
`/ferries/api/terminals/rest/terminallocations`:

- Fauntleroy: `47.5232, -122.3967`
- Vashon Island: `47.51095, -122.463639`
- Southworth: `47.513064, -122.495742`

Live vessel data on 2026-06-04 showed active triangle vessels all reporting
`OpRouteAbbrev: ["f-v-s"]`, even when the physical leg was Fauntleroy ->
Southworth or Vashon Island -> Southworth. Server processing therefore needs to
use the departing and arriving terminal names to remap triangle vessels to the
physical leg route (`f-v-s`, `s-v`, or `f-s`).

## Recommended Model

Do not store the triangle as one three-terminal `RouteFTData` entry. The current
server code assumes every route has exactly `portWN` and `portES`, and that
`RoutePositionData[route]` is one ordered west-to-east polyline. Forcing three
ports into that shape would create ambiguous departure ports, arrival ports,
schedule lookups, dock detection, progress, and alert assignment.

Instead, introduce a route-group layer:

```js
{
  "triangle": {
    "routeGroupName": "Fauntleroy / Vashon / Southworth",
    "legs": {
      "f-v-s": { ...two-terminal route data... },
      "s-v": { ...two-terminal route data... },
      "f-s": { ...two-terminal route data... }
    }
  }
}
```

Each leg should internally use the same two-terminal machinery as the six
existing routes. The public seventh route endpoint can expose the grouped shape:

- `GET /api/v1/route/triangle`
- `GET /api/v1/route/triangle/reference-schedule`

Diagnostic endpoints expose single-leg data for server debugging:

- `GET /debug/route/:legId`
- `GET /debug/route/:legId/reference-schedule`

Direct triangle leg route IDs are intentionally not client-facing API routes.
Requests such as `/api/v1/route/f-v-s` should use `/api/v1/route/triangle`
instead.

## Route Keys And Direction

Use WSDOT's stable leg abbreviations as internal route keys:

- `f-v-s`: Fauntleroy <-> Vashon
- `s-v`: Southworth <-> Vashon
- `f-s`: Fauntleroy <-> Southworth

For each leg, keep `RoutePositionData` in west-to-east order when possible:

- `f-v-s`: Vashon (`portWN`) -> Fauntleroy (`portES`)
- `s-v`: Southworth (`portWN`) -> Vashon (`portES`)
- `f-s`: Southworth (`portWN`) -> Fauntleroy (`portES`)

This keeps the existing `WN` / `ES` progress code meaningful enough without a
larger direction enum migration.

The WSDOT `f-v-s` abbreviation is unusual for the two-terminal Fauntleroy /
Vashon schedule route. Keep it because it is the value WSDOT emits and it
reduces translation in vessel and schedule processing.

## Required Files

Data:

- Add the three leg definitions to `data/RouteFTData.js`.
- Add the three GPS reference paths to `data/RoutePositionData.js`.
- Add `data/RouteGroupData.js` to map `triangle` to its three legs.

Server processing:

- Let `src/WSDOT.js` fetch triangle leg schedules through the existing
  `RouteFTData.js` iteration.
- Update `src/FerryTempo.js` to accept WSDOT vessel `OpRouteAbbrev` values
  `f-s`, `f-v-s`, and `s-v` as triangle legs, and to map terminal pairs to the
  correct triangle leg because live WSDOT vessel data reports `f-v-s` for all
  three triangle physical legs.
- Update `src/RouteUtilities.js` AIS estimation to include triangle legs in
  distance matching, but return route-group aware assignments for output.
- Update `src/App.js` to serve `triangle` as a grouped route response while
  preserving existing direct route responses.
- Serve grouped reference schedules from `src/App.js` using the per-leg
  reference schedules built by `src/ReferenceSchedules.js`.
- Update `src/Utils.js` `getRouteFromTerminals` to return a triangle leg route
  for terminal pairs.

First-pass tests:

- Add `getRouteFromTerminals` tests for all six triangle directions.
- Add route estimation tests near Fauntleroy, Vashon, and Southworth.
- Add FerryTempo processing tests with representative WSDOT vessel records for
  each triangle leg.
- Add assignment-slot tests proving the triangle can track `boat1`, `boat2`,
  and `boat3`.
- Add route-group response tests for `/api/v1/route/triangle`.
- Add grouped reference schedule response tests for
  `/api/v1/route/triangle/reference-schedule`.
- Add public-leg and debug-link policy tests proving client-facing route-group
  behavior.

Remaining tests:

- Add schedule merge tests ensuring each leg keeps independent departures.

## GPS Reference Path Preparation

The first pass can use terminal-to-terminal polylines with a few midpoint
control points, matching the density of short existing routes such as `pd-tal`.
Before production, replace those with AIS-derived observed tracks or manually
validated WSF path points.

Verified terminal endpoints:

- Fauntleroy: `47.5232, -122.3967`
- Vashon Island: `47.51095, -122.463639`
- Southworth: `47.513064, -122.495742`

These coordinates are adequate for scaffolding only. The final paths should be
generated from recent vessel tracks so `getProgress`, `dockedStatus`, and
`estimateRoute` behave consistently near the three close terminals.

## Vessel Assignment Logic

Use this precedence:

1. If the WSDOT `OpRouteAbbrev` is a triangle abbreviation, use departing and
   arriving terminals to choose the physical leg.
2. Trust WSDOT `OpRouteAbbrev` for non-triangle routes.
3. If `OpRouteAbbrev` is absent, use departing and arriving terminal IDs.
4. If terminal data is incomplete, use AIS closest-leg matching.
5. Keep the last known leg for an in-service boat only when the current data is
   incomplete and the vessel is still near the triangle group.

Docked vessels should be considered docked against the current leg endpoint
matching their WSDOT departing terminal. This avoids the biggest triangle
ambiguity: Vashon is both an arrival and departure terminal depending on the
boat's next sailing.

## Schedule And Port Logic

Each leg gets its own schedule fetch. The grouped public endpoint should expose
three independent `portData` objects rather than merging same terminals across
legs. For example, Vashon appears in both `f-v-s` and `s-v`, but its next
scheduled departure is leg-specific and should not be collapsed.

The verified 2026-06-04 schedule payloads for route IDs `13`, `14`, and `15`
each have two `TerminalCombos`, one per direction. Their `Times` entries include
`VesselPositionNum` values `1`, `2`, and `3`, so the triangle route group must
support at least three active boat slots. The current `RouteUtilities.js`
constant `numBoats = 2` is not sufficient for the triangle.

Recommended grouped response shape:

```json
{
  "routeGroupID": "triangle",
  "routeGroupName": "Fauntleroy / Vashon / Southworth",
  "legs": {
    "f-v-s": { "boatData": {}, "portData": {} },
    "s-v": { "boatData": {}, "portData": {} },
    "f-s": { "boatData": {}, "portData": {} }
  },
  "lastUpdate": 0,
  "serverVersion": "0.0.0"
}
```

## Verified WSDOT Calls

These calls were made on 2026-06-04 using a development API key:

```sh
curl "https://www.wsdot.wa.gov/ferries/api/schedule/rest/routes/2026-06-04?apiaccesscode=$WSDOT_API_KEY"
curl "https://www.wsdot.wa.gov/ferries/api/schedule/rest/schedule/2026-06-04/13?apiaccesscode=$WSDOT_API_KEY"
curl "https://www.wsdot.wa.gov/ferries/api/schedule/rest/schedule/2026-06-04/14?apiaccesscode=$WSDOT_API_KEY"
curl "https://www.wsdot.wa.gov/ferries/api/schedule/rest/schedule/2026-06-04/15?apiaccesscode=$WSDOT_API_KEY"
curl "https://www.wsdot.wa.gov/ferries/api/terminals/rest/terminallocations?apiaccesscode=$WSDOT_API_KEY"
```
