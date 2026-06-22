# Ferry Tempo Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json
```

Data schema for a Ferry Tempo route or route group API response.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                         |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [FerryTempo.schema.json](../schemas/FerryTempo.schema.json "open original schema") |

## Ferry Tempo Data Type

merged type ([Ferry Tempo Data](ferrytempo.md))

one (and only one) of

* [Ferry Tempo Route Data](ferrytempo-defs-ferry-tempo-route-data.md "check type definition")

* [Ferry Tempo Route Group Data](ferrytempo-defs-ferry-tempo-route-group-data.md "check type definition")

# Ferry Tempo Data Definitions

## Definitions group singleBoatData

Reference this group by using

```json
{"$ref":"https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData"}
```

| Property                                            | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                                  |
| :-------------------------------------------------- | :-------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [VesselPosition](#vesselposition)                   | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselposition.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselPosition")                   |
| [VesselName](#vesselname)                           | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselName")                           |
| [InService](#inservice)                             | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-inservice.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/InService")                             |
| [OnDuty](#onduty)                                   | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-onduty.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/OnDuty")                                   |
| [Progress](#progress)                               | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-progress.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Progress")                               |
| [Latitude](#latitude)                               | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-latitude.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Latitude")                               |
| [Longitude](#longitude)                             | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-longitude.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Longitude")                             |
| [CrossingTimeAverage](#crossingtimeaverage)         | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-crossingtimeaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/CrossingTimeAverage")         |
| [Direction](#direction)                             | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-direction.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Direction")                             |
| [DepartingTerminalName](#departingterminalname)     | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalName")     |
| [DepartingTerminalAbbrev](#departingterminalabbrev) | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalAbbrev") |
| [ArrivingTerminalName](#arrivingterminalname)       | `string`  | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalName")       |
| [ArrivingTerminalAbbrev](#arrivingterminalabbrev)   | `string`  | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalAbbrev")   |
| [AtDock](#atdock)                                   | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-atdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/AtDock")                                   |
| [ArrivedDock](#arriveddock)                         | `integer` | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arriveddock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivedDock")                         |
| [StopTimer](#stoptimer)                             | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-stoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/StopTimer")                             |
| [StopTimerAverage](#stoptimeraverage)               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-stoptimeraverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/StopTimerAverage")               |
| [ScheduledDeparture](#scheduleddeparture)           | `integer` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-scheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ScheduledDeparture")           |
| [LeftDock](#leftdock)                               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-leftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/LeftDock")                               |
| [ObservedLeftDock](#observedleftdock)               | `integer` | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-observedleftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ObservedLeftDock")               |
| [DepartureDelay](#departuredelay)                   | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departuredelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartureDelay")                   |
| [LastDepartureDelay](#lastdeparturedelay)           | `integer` | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-lastdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/LastDepartureDelay")           |
| [DepartureDelayAverage](#departuredelayaverage)     | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departuredelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartureDelayAverage")     |
| [ETA](#eta)                                         | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-eta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ETA")                                         |
| [EstimatedETA](#estimatedeta)                       | `integer` | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-estimatedeta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/EstimatedETA")                       |
| [ArrivalTimeMinus](#arrivaltimeminus)               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivalTimeMinus")               |
| [Speed](#speed)                                     | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-speed.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Speed")                                     |
| [Heading](#heading)                                 | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-heading.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Heading")                                 |
| [MMSI](#mmsi)                                       | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-mmsi.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/MMSI")                                       |
| [PositionUpdated](#positionupdated)                 | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-positionupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/PositionUpdated")                 |

### VesselPosition

Although WSF provides 'VesselPositionNum', it may switch between boats throughout the day. Therefore, it may make sense to assign our own via the unique vessel IDs, say whichever is a lower value.

`VesselPosition`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselposition.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselPosition")

#### VesselPosition Type

`integer`

### VesselName

WSF Vessel API pass-through: The name of the vessel.

`VesselName`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselName")

#### VesselName Type

`string`

### InService

WSF Vessel API pass-through: Indicates whether or not the vessel is in service.

`InService`

* is required

* Type: `boolean`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-inservice.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/InService")

#### InService Type

`boolean`

### OnDuty

Conveys if a boat is truly in service.

`OnDuty`

* is required

* Type: `boolean`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-onduty.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/OnDuty")

#### OnDuty Type

`boolean`

### Progress

Vessel crossing progress percentage.

`Progress`

* is required

* Type: `number`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-progress.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Progress")

#### Progress Type

`number`

### Latitude

WSF Vessel API pass-through: The vessel latitude.

`Latitude`

* is required

* Type: `number`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-latitude.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Latitude")

#### Latitude Type

`number`

### Longitude

WSF Vessel API pass-through: The vessel longitude.

`Longitude`

* is required

* Type: `number`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-longitude.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Longitude")

#### Longitude Type

`number`

### CrossingTimeAverage

A particular boat's average completed crossing time in seconds for the sailing day.

`CrossingTimeAverage`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-crossingtimeaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/CrossingTimeAverage")

#### CrossingTimeAverage Type

`integer`

### Direction

Conveys travel towards one port or the other.

`Direction`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-direction.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Direction")

#### Direction Type

`string`

### DepartingTerminalName

WSF Vessel API pass-through: The name of the terminal where this vessel is docked or was last docked

`DepartingTerminalName`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalName")

#### DepartingTerminalName Type

`string`

### DepartingTerminalAbbrev

WSF Vessel API pass-through: The abbreviated terminal name where this vessel is docked or was last docked

`DepartingTerminalAbbrev`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalAbbrev")

#### DepartingTerminalAbbrev Type

`string`

### ArrivingTerminalName

WSF Vessel API pass-through: The name of the terminal that represents the vessel's next destination. Might not be present if the next scheduled destination is still being determined.

`ArrivingTerminalName`

* is optional

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalName")

#### ArrivingTerminalName Type

`string`

### ArrivingTerminalAbbrev

WSF Vessel API pass-through: The abbreviated terminal name that represent's the vessel's next destination. Might not be present if the next scheduled destination is still being determined.

`ArrivingTerminalAbbrev`

* is optional

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalAbbrev")

#### ArrivingTerminalAbbrev Type

`string`

### AtDock

WSF Vessel API pass-through: Indicates whether or not the vessel is docked

`AtDock`

* is required

* Type: `boolean`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-atdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/AtDock")

#### AtDock Type

`boolean`

### ArrivedDock

Epoch seconds when the vessel most recently arrived at dock, or null when the vessel is underway.

`ArrivedDock`

* is required

* Type: `integer`

* can be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arriveddock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivedDock")

#### ArrivedDock Type

`integer`

### StopTimer

Seconds in port since docked.

`StopTimer`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-stoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/StopTimer")

#### StopTimer Type

`integer`

### StopTimerAverage

A particular boat's average in-port stop time in seconds for the sailing day.

`StopTimerAverage`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-stoptimeraverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/StopTimerAverage")

#### StopTimerAverage Type

`integer`

### ScheduledDeparture

WSF Vessel API pass-through: The date and time when this vessel was or is scheduled to leave its departing terminal. Might not be present if the next scheduled destination is still being determined.

`ScheduledDeparture`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-scheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ScheduledDeparture")

#### ScheduledDeparture Type

`integer`

### LeftDock

WSF Vessel API pass-through: The date and time that the vessel last left the dock. This value is not present when docked.

`LeftDock`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-leftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/LeftDock")

#### LeftDock Type

`integer`

### ObservedLeftDock

Epoch seconds when the server first observed the vessel underway after being docked, or null when WSF provided LeftDock or the transition was not observed.

`ObservedLeftDock`

* is required

* Type: `integer`

* can be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-observedleftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ObservedLeftDock")

#### ObservedLeftDock Type

`integer`

### DepartureDelay

Seconds delayed beyond scheduled departure.

`DepartureDelay`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departuredelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartureDelay")

#### DepartureDelay Type

`integer`

### LastDepartureDelay

The boat's last completed departure delay in seconds for the current sailing day. Unlike DepartureDelay, this only updates after WSF reports LeftDock.

`LastDepartureDelay`

* is required

* Type: `integer`

* can be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-lastdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/LastDepartureDelay")

#### LastDepartureDelay Type

`integer`

### DepartureDelayAverage

A particular boat's average delay in seconds for the day.

`DepartureDelayAverage`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departuredelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartureDelayAverage")

#### DepartureDelayAverage Type

`integer`

### ETA

WSF Vessel API pass-through: Estimated arrival time expressed in epoch seconds, or 0 when WSF does not provide an ETA.

`ETA`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-eta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ETA")

#### ETA Type

`integer`

### EstimatedETA

FerryTempo estimated arrival time expressed in epoch seconds when WSF does not provide ETA, or null when WSF ETA is available or no estimate can be made.

`EstimatedETA`

* is required

* Type: `integer`

* can be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-estimatedeta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/EstimatedETA")

#### EstimatedETA Type

`integer`

### ArrivalTimeMinus

Best-available seconds until arrival at destination port, using WSF ETA first and FerryTempo EstimatedETA when WSF ETA is unavailable.

`ArrivalTimeMinus`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivalTimeMinus")

#### ArrivalTimeMinus Type

`integer`

### Speed

WSF Vessel API pass-through: The speed of the vessel (in Knots).

`Speed`

* is required

* Type: `number`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-speed.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Speed")

#### Speed Type

`number`

### Heading

WSF Vessel API pass-through: The heading of the vessel (in degrees).

`Heading`

* is required

* Type: `number`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-heading.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Heading")

#### Heading Type

`number`

### MMSI

WSF Vessel API pass-through: The vessel's MMSI identifier.

`MMSI`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-mmsi.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/MMSI")

#### MMSI Type

`integer`

### PositionUpdated

Epoch seconds when the vessel position was last updated.

`PositionUpdated`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-positionupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/PositionUpdated")

#### PositionUpdated Type

`integer`

## Definitions group singlePortData

Reference this group by using

```json
{"$ref":"https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData"}
```

| Property                                                | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                                      |
| :------------------------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [TerminalName](#terminalname)                           | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalName")                           |
| [TerminalAbbrev](#terminalabbrev)                       | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalAbbrev")                       |
| [TerminalID](#terminalid)                               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalid.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalID")                               |
| [TerminalLatitude](#terminallatitude)                   | `number`  | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminallatitude.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalLatitude")                   |
| [TerminalLongitude](#terminallongitude)                 | `number`  | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminallongitude.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalLongitude")                 |
| [BoatAtDock](#boatatdock)                               | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-boatatdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/BoatAtDock")                               |
| [PortStopTimer](#portstoptimer)                         | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portstoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortStopTimer")                         |
| [PortStopTimerAverage](#portstoptimeraverage)           | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portstoptimeraverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortStopTimerAverage")           |
| [NextScheduledDeparture](#nextscheduleddeparture)       | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-nextscheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/NextScheduledDeparture")       |
| [PortDepartureDelay](#portdeparturedelay)               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelay")               |
| [PortDepartureDelayAverage](#portdeparturedelayaverage) | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelayAverage") |
| [PortETA](#porteta)                                     | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-porteta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortETA")                                     |
| [PortArrivalTimeMinus](#portarrivaltimeminus)           | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portarrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortArrivalTimeMinus")           |
| [PortSailingLog](#portsailinglog)                       | `array`   | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portsailinglog.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortSailingLog")                       |

### TerminalName

WSF Vessel API pass-through: The name of the terminal where this vessel is docked or was last docked.

`TerminalName`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalName")

#### TerminalName Type

`string`

### TerminalAbbrev

WSF Vessel API pass-through: The abbreviated terminal name where this vessel is docked or was last docked.

`TerminalAbbrev`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalAbbrev")

#### TerminalAbbrev Type

`string`

### TerminalID

WSF Vessel API pass-through: The terminal identifier.

`TerminalID`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalid.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalID")

#### TerminalID Type

`integer`

### TerminalLatitude

WSF Terminals API pass-through: The terminal latitude.

`TerminalLatitude`

* is required

* Type: `number`

* can be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminallatitude.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalLatitude")

#### TerminalLatitude Type

`number`

### TerminalLongitude

WSF Terminals API pass-through: The terminal longitude.

`TerminalLongitude`

* is required

* Type: `number`

* can be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminallongitude.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalLongitude")

#### TerminalLongitude Type

`number`

### BoatAtDock

Indicates if an in-service vessel is in port.

`BoatAtDock`

* is required

* Type: `boolean`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-boatatdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/BoatAtDock")

#### BoatAtDock Type

`boolean`

### PortStopTimer

Seconds in port since last boat arrival.

`PortStopTimer`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portstoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortStopTimer")

#### PortStopTimer Type

`integer`

### PortStopTimerAverage

Average in-port stop time in seconds for boats departing this port during the sailing day.

`PortStopTimerAverage`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portstoptimeraverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortStopTimerAverage")

#### PortStopTimerAverage Type

`integer`

### NextScheduledDeparture

The next departure scheduled.

`NextScheduledDeparture`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-nextscheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/NextScheduledDeparture")

#### NextScheduledDeparture Type

`integer`

### PortDepartureDelay

Seconds delayed beyond scheduled departure of latest vessel.

`PortDepartureDelay`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelay")

#### PortDepartureDelay Type

`integer`

### PortDepartureDelayAverage

Average delay in seconds of boats departing port.

`PortDepartureDelayAverage`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelayAverage")

#### PortDepartureDelayAverage Type

`integer`

### PortETA

Date + time of next inbound boat.

`PortETA`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-porteta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortETA")

#### PortETA Type

`integer`

### PortArrivalTimeMinus

Seconds until arrival of next inbound boat.

`PortArrivalTimeMinus`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portarrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortArrivalTimeMinus")

#### PortArrivalTimeMinus Type

`integer`

### PortSailingLog

Scheduled departures for the current sailing day paired with observed departure delay, crossing time in seconds, and vessel position.

`PortSailingLog`

* is required

* Type: `array[]`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portsailinglog.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortSailingLog")

#### PortSailingLog Type

`array[]`

## Definitions group singleRouteAlert

Reference this group by using

```json
{"$ref":"https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert"}
```

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

### Title



`Title`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-title.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/Title")

#### Title Type

`string`

### Text



`Text`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-text.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/Text")

#### Text Type

`string`

### Source



`Source`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-source.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/Source")

#### Source Type

`string`

### PublishDate



`PublishDate`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-publishdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/PublishDate")

#### PublishDate Type

`integer`

### SortSeq



`SortSeq`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-sortseq.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/SortSeq")

#### SortSeq Type

`integer`

### LastUpdated



`LastUpdated`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-lastupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/LastUpdated")

#### LastUpdated Type

`integer`

### AffectedRouteIDs



`AffectedRouteIDs`

* is optional

* Type: `integer[]`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-affectedrouteids.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/AffectedRouteIDs")

#### AffectedRouteIDs Type

`integer[]`

### TerminalIDs



`TerminalIDs`

* is optional

* Type: `integer[]`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-terminalids.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/TerminalIDs")

#### TerminalIDs Type

`integer[]`

### RouteAlertFlag



`RouteAlertFlag`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-routealertflag.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/RouteAlertFlag")

#### RouteAlertFlag Type

`boolean`

### BulletinFlag



`BulletinFlag`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-bulletinflag.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/BulletinFlag")

#### BulletinFlag Type

`boolean`

### CommunicationFlag



`CommunicationFlag`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-alert-properties-communicationflag.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleRouteAlert/properties/CommunicationFlag")

#### CommunicationFlag Type

`boolean`

## Definitions group ferryTempoRouteData

Reference this group by using

```json
{"$ref":"https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData"}
```

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                       |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [boatData](#boatdata)           | `object`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-boats-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData") |
| [portData](#portdata)           | `object`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-ports-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/portData") |
| [RouteAlerts](#routealerts)     | `array`   | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-alerts.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/RouteAlerts")  |
| [lastUpdate](#lastupdate)       | `integer` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-lastupdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/lastUpdate")                 |
| [serverVersion](#serverversion) | `string`  | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-serverversion.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/serverVersion")           |

### boatData

An object representing all currently observed boats for a given route. Keys preserve WSF vessel position numbers, so a route may contain boat3 without boat1 or boat2.

`boatData`

* is required

* Type: `object` ([Ferry Tempo Route Boat(s) Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-boats-data.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-boats-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData")

#### boatData Type

`object` ([Ferry Tempo Route Boat(s) Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-boats-data.md))

### portData

An object representing the ports for a given route.

`portData`

* is required

* Type: `object` ([Ferry Tempo Route Ports Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-ports-data.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-ports-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/portData")

#### portData Type

`object` ([Ferry Tempo Route Ports Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-ports-data.md))

### RouteAlerts

Route-level alerts that apply to both terminals or to the route as a whole.

`RouteAlerts`

* is required

* Type: `object[]` ([Ferry Tempo Route Alert](ferrytempo-defs-ferry-tempo-route-alert.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-alerts.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/RouteAlerts")

#### RouteAlerts Type

`object[]` ([Ferry Tempo Route Alert](ferrytempo-defs-ferry-tempo-route-alert.md))

### lastUpdate

Date/time in epoch seconds of the last Ferry Tempo data update.

`lastUpdate`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-lastupdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/lastUpdate")

#### lastUpdate Type

`integer`

### serverVersion

The semver version of the FTServer which generated this Ferry Tempo data.

`serverVersion`

* is optional

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data-properties-serverversion.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/serverVersion")

#### serverVersion Type

`string`

## Definitions group ferryTempoRouteGroupData

Reference this group by using

```json
{"$ref":"https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData"}
```

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                          |
| :-------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [routeGroupID](#routegroupid)     | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-routegroupid.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/routeGroupID")     |
| [routeGroupName](#routegroupname) | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-routegroupname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/routeGroupName") |
| [legs](#legs)                     | `object`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-legs.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/legs")                     |
| [lastUpdate](#lastupdate-1)       | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-lastupdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/lastUpdate")         |
| [serverVersion](#serverversion-1) | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-serverversion.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/serverVersion")   |

### routeGroupID

Stable route group identifier.

`routeGroupID`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-routegroupid.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/routeGroupID")

#### routeGroupID Type

`string`

### routeGroupName

Human-readable route group name.

`routeGroupName`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-routegroupname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/routeGroupName")

#### routeGroupName Type

`string`

### legs

Two-terminal leg routes that make up this route group.

`legs`

* is required

* Type: `object` ([Details](ferrytempo-defs-ferry-tempo-route-group-data-properties-legs.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-legs.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/legs")

#### legs Type

`object` ([Details](ferrytempo-defs-ferry-tempo-route-group-data-properties-legs.md))

### lastUpdate

Date/time in epoch seconds of the last Ferry Tempo data update.

`lastUpdate`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-lastupdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/lastUpdate")

#### lastUpdate Type

`integer`

### serverVersion

The semver version of the FTServer which generated this Ferry Tempo data.

`serverVersion`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-group-data-properties-serverversion.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/serverVersion")

#### serverVersion Type

`string`
