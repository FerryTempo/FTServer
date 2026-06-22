# README

## Top-level Schemas

* [Ferry Tempo Data](./ferrytempo.md "Data schema for a Ferry Tempo route or route group API response") – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json`

## Other Schemas

### Objects

* [Ferry Tempo Route Alert](./ferrytempo-defs-ferry-tempo-route-alert.md "Route-level alert from WSF schedule alerts or duplicated terminal bulletins promoted to the route") – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert`

* [Ferry Tempo Route Boat(s) Data](./ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-boats-data.md "An object representing all currently observed boats for a given route") – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData`

* [Ferry Tempo Route Data](./ferrytempo-defs-ferry-tempo-route-data.md "Data schema for any single two-terminal route from the Ferry Tempo API") – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData`

* [Ferry Tempo Route Group Data](./ferrytempo-defs-ferry-tempo-route-group-data.md "Data schema for a route group endpoint, such as the Fauntleroy / Vashon / Southworth triangle route") – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData`

* [Ferry Tempo Route Ports Data](./ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-ports-data.md "An object representing the ports for a given route") – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/portData`

* [Ferry Tempo Single Boat Data](./ferrytempo-defs-ferry-tempo-single-boat-data.md "Data schema for any given boat from the Ferry Tempo API") – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData`

* [Ferry Tempo Single Port Data](./ferrytempo-defs-ferry-tempo-single-port-data.md "Data schema for any given port from the Ferry Tempo API") – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData`

* [Untitled object in Ferry Tempo Data](./ferrytempo-defs-ferry-tempo-route-group-data-properties-legs.md "Two-terminal leg routes that make up this route group") – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/legs`

### Arrays

* [Ferry Tempo Route Alerts](./ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-alerts.md "Route-level alerts that apply to both terminals or to the route as a whole") – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/RouteAlerts`

* [Untitled array in Ferry Tempo Data](./ferrytempo-defs-ferry-tempo-single-port-data-properties-portsailinglog.md "Scheduled departures for the current sailing day paired with observed departure delay, crossing time in seconds, and vessel position") – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortSailingLog`

* [Untitled array in Ferry Tempo Data](./ferrytempo-defs-ferry-tempo-single-port-data-properties-portsailinglog-items.md) – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortSailingLog/items`

* [Untitled array in Ferry Tempo Data](./ferrytempo-defs-ferry-tempo-route-alert-properties-affectedrouteids.md) – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/AffectedRouteIDs`

* [Untitled array in Ferry Tempo Data](./ferrytempo-defs-ferry-tempo-route-alert-properties-terminalids.md) – `https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/TerminalIDs`

## Version Note

The schemas linked above follow the JSON Schema Spec version: `https://json-schema.org/draft/2020-12/schema`
