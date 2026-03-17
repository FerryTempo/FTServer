# Ferry Tempo Single Boat Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/boatData/properties/boat2
```

Data schema for any given boat from the Ferry Tempo API

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## boat2 Type

`object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))

# boat2 Properties

| Property                                            | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                                  |
| :-------------------------------------------------- | :-------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [VesselPosition](#vesselposition)                   | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselposition.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselPosition")                   |
| [VesselName](#vesselname)                           | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselName")                           |
| [InService](#inservice)                             | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-inservice.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/InService")                             |
| [OnDuty](#onduty)                                   | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-onduty.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/OnDuty")                                   |
| [Progress](#progress)                               | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-progress.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Progress")                               |
| [Direction](#direction)                             | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-direction.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Direction")                             |
| [DepartingTerminalName](#departingterminalname)     | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalName")     |
| [DepartingTerminalAbbrev](#departingterminalabbrev) | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalAbbrev") |
| [ArrivingTerminalName](#arrivingterminalname)       | `string`  | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalName")       |
| [ArrivingTerminalAbbrev](#arrivingterminalabbrev)   | `string`  | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalAbbrev")   |
| [AtDock](#atdock)                                   | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-atdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/AtDock")                                   |
| [StopTimer](#stoptimer)                             | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-stoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/StopTimer")                             |
| [ScheduledDeparture](#scheduleddeparture)           | `integer` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-scheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ScheduledDeparture")           |
| [LeftDock](#leftdock)                               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-leftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/LeftDock")                               |
| [DepartureDelay](#departuredelay)                   | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departuredelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartureDelay")                   |
| [DepartureDelayAverage](#departuredelayaverage)     | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departuredelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartureDelayAverage")     |
| [BoatETA](#boateta)                                 | `integer` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-boateta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/BoatETA")                                 |
| [ArrivalTimeMinus](#arrivaltimeminus)               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivalTimeMinus")               |
| [Speed](#speed)                                     | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-speed.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Speed")                                     |
| [Heading](#heading)                                 | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-heading.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Heading")                                 |
| [MMSI](#mmsi)                                       | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-mmsi.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/MMSI")                                       |
| [PositionUpdated](#positionupdated)                 | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-positionupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/PositionUpdated")                 |

## VesselPosition

Although WSF provides 'VesselPositionNum', it may switch between boats throughout the day. Therefore, it may make sense to assign our own via the unique vessel IDs, say whichever is a lower value.

`VesselPosition`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselposition.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselPosition")

### VesselPosition Type

`integer`

## VesselName

WSF Vessel API pass-through: The name of the vessel.

`VesselName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselName")

### VesselName Type

`string`

## InService

WSF Vessel API pass-through: Indicates whether or not the vessel is in service.

`InService`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-inservice.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/InService")

### InService Type

`boolean`

## OnDuty

Conveys if a boat is truly in service.

`OnDuty`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-onduty.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/OnDuty")

### OnDuty Type

`boolean`

## Progress

Vessel crossing progress percentage.

`Progress`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-progress.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Progress")

### Progress Type

`number`

## Direction

Conveys travel towards one port or the other.

`Direction`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-direction.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Direction")

### Direction Type

`string`

## DepartingTerminalName

WSF Vessel API pass-through: The name of the terminal where this vessel is docked or was last docked

`DepartingTerminalName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalName")

### DepartingTerminalName Type

`string`

## DepartingTerminalAbbrev

WSF Vessel API pass-through: The abbreviated terminal name where this vessel is docked or was last docked

`DepartingTerminalAbbrev`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalAbbrev")

### DepartingTerminalAbbrev Type

`string`

## ArrivingTerminalName

WSF Vessel API pass-through: The name of the terminal that represents the vessel's next destination. Might not be present if the next scheduled destination is still being determined.

`ArrivingTerminalName`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalName")

### ArrivingTerminalName Type

`string`

## ArrivingTerminalAbbrev

WSF Vessel API pass-through: The abbreviated terminal name that represent's the vessel's next destination. Might not be present if the next scheduled destination is still being determined.

`ArrivingTerminalAbbrev`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalAbbrev")

### ArrivingTerminalAbbrev Type

`string`

## AtDock

WSF Vessel API pass-through: Indicates whether or not the vessel is docked

`AtDock`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-atdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/AtDock")

### AtDock Type

`boolean`

## StopTimer

Seconds in port since docked.

`StopTimer`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-stoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/StopTimer")

### StopTimer Type

`integer`

## ScheduledDeparture

WSF Vessel API pass-through: The date and time when this vessel was or is scheduled to leave its departing terminal. Might not be present if the next scheduled destination is still being determined.

`ScheduledDeparture`

*   is optional

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-scheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ScheduledDeparture")

### ScheduledDeparture Type

`integer`

## LeftDock

WSF Vessel API pass-through: The date and time that the vessel last left the dock. This value is not present when docked.

`LeftDock`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-leftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/LeftDock")

### LeftDock Type

`integer`

## DepartureDelay

Seconds delayed beyond scheduled departure.

`DepartureDelay`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departuredelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartureDelay")

### DepartureDelay Type

`integer`

## DepartureDelayAverage

A particular boat's average delay in seconds for the day.

`DepartureDelayAverage`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departuredelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartureDelayAverage")

### DepartureDelayAverage Type

`integer`

## BoatETA

Estimated arrival time expressed in epoch seconds.

`BoatETA`

*   is optional

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-boateta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/BoatETA")

### BoatETA Type

`integer`

## ArrivalTimeMinus

Seconds until arrival at destination port.

`ArrivalTimeMinus`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivalTimeMinus")

### ArrivalTimeMinus Type

`integer`

## Speed

WSF Vessel API pass-through: The speed of the vessel (in Knots).

`Speed`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-speed.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Speed")

### Speed Type

`number`

## Heading

WSF Vessel API pass-through: The heading of the vessel (in degrees).

`Heading`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-heading.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Heading")

### Heading Type

`number`

## MMSI

WSF Vessel API pass-through: The vessel's MMSI identifier.

`MMSI`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-mmsi.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/MMSI")

### MMSI Type

`integer`

## PositionUpdated

Epoch seconds when the vessel position was last updated.

`PositionUpdated`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-positionupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/PositionUpdated")

### PositionUpdated Type

`integer`
