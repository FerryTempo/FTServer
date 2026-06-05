# Ferry Tempo Route Group Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/oneOf/1
```

Data schema for a route group endpoint, such as the Fauntleroy / Vashon / Southworth triangle route.

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## 1 Type

`object` ([Ferry Tempo Route Group Data](ferrytempo-defs-ferry-tempo-route-group-data.md))

# 1 Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                          |
| :-------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [routeGroupID](#routegroupid)     | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-routegroupid.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/routeGroupID")     |
| [routeGroupName](#routegroupname) | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-routegroupname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/routeGroupName") |
| [legs](#legs)                     | `object`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-legs.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/legs")                     |
| [lastUpdate](#lastupdate)         | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-lastupdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/lastUpdate")         |
| [serverVersion](#serverversion)   | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-serverversion.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/serverVersion")   |

## routeGroupID

Stable route group identifier.

`routeGroupID`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-routegroupid.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/routeGroupID")

### routeGroupID Type

`string`

## routeGroupName

Human-readable route group name.

`routeGroupName`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-routegroupname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/routeGroupName")

### routeGroupName Type

`string`

## legs

Two-terminal leg routes that make up this route group.

`legs`

* is required

* Type: `object` ([Details](ferrytempo-defs-ferry-tempo-route-group-data-properties-legs.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-legs.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/legs")

### legs Type

`object` ([Details](ferrytempo-defs-ferry-tempo-route-group-data-properties-legs.md))

## lastUpdate

Date/time in epoch seconds of the last Ferry Tempo data update.

`lastUpdate`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-lastupdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/lastUpdate")

### lastUpdate Type

`integer`

## serverVersion

The semver version of the FTServer which generated this Ferry Tempo data.

`serverVersion`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-serverversion.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/serverVersion")

### serverVersion Type

`string`
