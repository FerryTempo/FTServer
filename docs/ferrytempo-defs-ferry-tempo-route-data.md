# Ferry Tempo Route Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/oneOf/0
```

Data schema for any single two-terminal route from the Ferry Tempo API.

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## 0 Type

`object` ([Ferry Tempo Route Data](ferrytempo-defs-ferry-tempo-route-data.md))

# 0 Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                       |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [boatData](#boatdata)           | `object`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-boats-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData") |
| [portData](#portdata)           | `object`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-ports-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/portData") |
| [RouteAlerts](#routealerts)     | `array`   | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-alerts.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/RouteAlerts")  |
| [lastUpdate](#lastupdate)       | `integer` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-lastupdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/lastUpdate")                 |
| [serverVersion](#serverversion) | `string`  | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-serverversion.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/serverVersion")           |

## boatData

An object representing all currently observed boats for a given route. Keys preserve WSF vessel position numbers, so a route may contain boat3 without boat1 or boat2.

`boatData`

* is required

* Type: `object` ([Ferry Tempo Route Boat(s) Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-boats-data.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-boats-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData")

### boatData Type

`object` ([Ferry Tempo Route Boat(s) Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-boats-data.md))

## portData

An object representing the ports for a given route.

`portData`

* is required

* Type: `object` ([Ferry Tempo Route Ports Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-ports-data.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-ports-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/portData")

### portData Type

`object` ([Ferry Tempo Route Ports Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-ports-data.md))

## RouteAlerts

Route-level alerts that apply to both terminals or to the route as a whole.

`RouteAlerts`

* is required

* Type: `object[]` ([Ferry Tempo Route Alert](ferrytempo-defs-ferry-tempo-route-alert.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-alerts.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/RouteAlerts")

### RouteAlerts Type

`object[]` ([Ferry Tempo Route Alert](ferrytempo-defs-ferry-tempo-route-alert.md))

## lastUpdate

Date/time in epoch seconds of the last Ferry Tempo data update.

`lastUpdate`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-lastupdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/lastUpdate")

### lastUpdate Type

`integer`

## serverVersion

The semver version of the FTServer which generated this Ferry Tempo data.

`serverVersion`

* is optional

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-serverversion.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/serverVersion")

### serverVersion Type

`string`
