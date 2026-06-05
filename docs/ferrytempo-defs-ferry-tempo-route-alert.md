# Ferry Tempo Route Alert Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/RouteAlerts/items
```

Route-level alert from WSF schedule alerts or duplicated terminal bulletins promoted to the route.

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## items Type

`object` ([Ferry Tempo Route Alert](ferrytempo-defs-ferry-tempo-route-alert.md))

# items Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                   |
| :-------------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Title](#title)                         | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-title.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/Title")                         |
| [Text](#text)                           | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-text.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/Text")                           |
| [Source](#source)                       | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-source.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/Source")                       |
| [PublishDate](#publishdate)             | `integer` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-publishdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/PublishDate")             |
| [SortSeq](#sortseq)                     | `integer` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-sortseq.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/SortSeq")                     |
| [LastUpdated](#lastupdated)             | `integer` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-lastupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/LastUpdated")             |
| [AffectedRouteIDs](#affectedrouteids)   | `array`   | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-affectedrouteids.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/AffectedRouteIDs")   |
| [TerminalIDs](#terminalids)             | `array`   | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-terminalids.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/TerminalIDs")             |
| [RouteAlertFlag](#routealertflag)       | `boolean` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-routealertflag.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/RouteAlertFlag")       |
| [BulletinFlag](#bulletinflag)           | `boolean` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-bulletinflag.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/BulletinFlag")           |
| [CommunicationFlag](#communicationflag) | `boolean` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-communicationflag.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/CommunicationFlag") |

## Title



`Title`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-title.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/Title")

### Title Type

`string`

## Text



`Text`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-text.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/Text")

### Text Type

`string`

## Source



`Source`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-source.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/Source")

### Source Type

`string`

## PublishDate



`PublishDate`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-publishdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/PublishDate")

### PublishDate Type

`integer`

## SortSeq



`SortSeq`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-sortseq.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/SortSeq")

### SortSeq Type

`integer`

## LastUpdated



`LastUpdated`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-lastupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/LastUpdated")

### LastUpdated Type

`integer`

## AffectedRouteIDs



`AffectedRouteIDs`

* is optional

* Type: `integer[]`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-affectedrouteids.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/AffectedRouteIDs")

### AffectedRouteIDs Type

`integer[]`

## TerminalIDs



`TerminalIDs`

* is optional

* Type: `integer[]`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-terminalids.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/TerminalIDs")

### TerminalIDs Type

`integer[]`

## RouteAlertFlag



`RouteAlertFlag`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-routealertflag.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/RouteAlertFlag")

### RouteAlertFlag Type

`boolean`

## BulletinFlag



`BulletinFlag`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-bulletinflag.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/BulletinFlag")

### BulletinFlag Type

`boolean`

## CommunicationFlag



`CommunicationFlag`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-communicationflag.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/CommunicationFlag")

### CommunicationFlag Type

`boolean`
