# Ferry Tempo Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json
```

Data schema for any given route from the Ferry Tempo API

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FerryTempo.schema.json](../schemas/FerryTempo.schema.json "open original schema") |

## Ferry Tempo Data Type

`object` ([Ferry Tempo Data](ferrytempo.md))

# Ferry Tempo Data Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                                                 |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [boatData](#boatdata)           | `object`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-properties-ferry-tempo-route-boats-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/boatData") |
| [portData](#portdata)           | `object`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-properties-ferry-tempo-route-ports-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/portData") |
| [lastUpdate](#lastupdate)       | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-properties-lastupdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/lastUpdate")                 |
| [serverVersion](#serverversion) | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-properties-serverversion.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/serverVersion")           |

## boatData

An object representing all boats for a given route.

`boatData`

*   is required

*   Type: `object` ([Ferry Tempo Route Boat(s) Data](ferrytempo-properties-ferry-tempo-route-boats-data.md))

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-properties-ferry-tempo-route-boats-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/boatData")

### boatData Type

`object` ([Ferry Tempo Route Boat(s) Data](ferrytempo-properties-ferry-tempo-route-boats-data.md))

## portData

An object representing the ports for a given route.

`portData`

*   is required

*   Type: `object` ([Ferry Tempo Route Ports Data](ferrytempo-properties-ferry-tempo-route-ports-data.md))

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-properties-ferry-tempo-route-ports-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/portData")

### portData Type

`object` ([Ferry Tempo Route Ports Data](ferrytempo-properties-ferry-tempo-route-ports-data.md))

## lastUpdate

Date/time in epoch seconds of the last Ferry Tempo data update.

`lastUpdate`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-properties-lastupdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/lastUpdate")

### lastUpdate Type

`integer`

## serverVersion

The semver version of the FTServer which generated this Ferry Tempo data.

`serverVersion`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-properties-serverversion.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/serverVersion")

### serverVersion Type

`string`

# Ferry Tempo Data Definitions

## Definitions group singleBoatData

Reference this group by using

```json
{"$ref":"https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData"}
```

| Property                                            | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                                  |
| :-------------------------------------------------- | :-------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ArrivalTimeMinus](#arrivaltimeminus)               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivalTimeMinus")               |
| [ArrivedDock](#arriveddock)                         | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arriveddock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivedDock")                         |
| [ArrivingTerminalAbbrev](#arrivingterminalabbrev)   | `string`  | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalAbbrev")   |
| [ArrivingTerminalName](#arrivingterminalname)       | `string`  | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalName")       |
| [AtDock](#atdock)                                   | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-atdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/AtDock")                                   |
| [DepartingTerminalAbbrev](#departingterminalabbrev) | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalAbbrev") |
| [DepartingTerminalName](#departingterminalname)     | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalName")     |
| [DepartureDelay](#departuredelay)                   | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departuredelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartureDelay")                   |
| [DepartureDelayAverage](#departuredelayaverage)     | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departuredelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartureDelayAverage")     |
| [Direction](#direction)                             | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-direction.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Direction")                             |
| [EstimatedArrivalTime](#estimatedarrivaltime)       | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-estimatedarrivaltime.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/EstimatedArrivalTime")       |
| [Heading](#heading)                                 | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-heading.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Heading")                                 |
| [InService](#inservice)                             | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-inservice.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/InService")                             |
| [LeftDock](#leftdock)                               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-leftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/LeftDock")                               |
| [OnDuty](#onduty)                                   | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-onduty.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/OnDuty")                                   |
| [Progress](#progress)                               | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-progress.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Progress")                               |
| [ScheduledDeparture](#scheduleddeparture)           | `integer` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-scheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ScheduledDeparture")           |
| [Speed](#speed)                                     | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-speed.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Speed")                                     |
| [StopTimer](#stoptimer)                             | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-stoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/StopTimer")                             |
| [VesselName](#vesselname)                           | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselName")                           |
| [VesselPosition](#vesselposition)                   | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselposition.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselPosition")                   |
| [VesselPositionNum](#vesselpositionnum)             | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselpositionnum.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselPositionNum")             |

### ArrivalTimeMinus

Seconds until arrival at destination port.

`ArrivalTimeMinus`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivalTimeMinus")

#### ArrivalTimeMinus Type

`integer`

### ArrivedDock

Time of boat arrival at dock.

`ArrivedDock`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arriveddock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivedDock")

#### ArrivedDock Type

`integer`

### ArrivingTerminalAbbrev

WSF Vessel API pass-through: The abbreviated terminal name that represent's the vessel's next destination. Might not be present if the next scheduled destination is still being determined.

`ArrivingTerminalAbbrev`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalAbbrev")

#### ArrivingTerminalAbbrev Type

`string`

### ArrivingTerminalName

WSF Vessel API pass-through: The name of the terminal that represents the vessel's next destination. Might not be present if the next scheduled destination is still being determined.

`ArrivingTerminalName`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalName")

#### ArrivingTerminalName Type

`string`

### AtDock

WSF Vessel API pass-through: Indicates whether or not the vessel is docked

`AtDock`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-atdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/AtDock")

#### AtDock Type

`boolean`

### DepartingTerminalAbbrev

WSF Vessel API pass-through: The abbreviated terminal name where this vessel is docked or was last docked

`DepartingTerminalAbbrev`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalAbbrev")

#### DepartingTerminalAbbrev Type

`string`

### DepartingTerminalName

WSF Vessel API pass-through: The name of the terminal where this vessel is docked or was last docked

`DepartingTerminalName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalName")

#### DepartingTerminalName Type

`string`

### DepartureDelay

Seconds delayed beyond scheduled departure.

`DepartureDelay`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departuredelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartureDelay")

#### DepartureDelay Type

`integer`

### DepartureDelayAverage

A particular boat's average delay in seconds for the day.

`DepartureDelayAverage`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departuredelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartureDelayAverage")

#### DepartureDelayAverage Type

`integer`

### Direction

Conveys travel towards one port or the other.

`Direction`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-direction.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Direction")

#### Direction Type

`string`

### EstimatedArrivalTime

WSF Vessel API pass-through: The estimated date and time that the vessel will arrive at its destination. This value is not present when docked.

`EstimatedArrivalTime`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-estimatedarrivaltime.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/EstimatedArrivalTime")

#### EstimatedArrivalTime Type

`integer`

### Heading

WSF Vessel API pass-through: The heading of the vessel (in degrees).

`Heading`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-heading.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Heading")

#### Heading Type

`number`

### InService

WSF Vessel API pass-through: Indicates whether or not the vessel is in service.

`InService`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-inservice.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/InService")

#### InService Type

`boolean`

### LeftDock

WSF Vessel API pass-through: The date and time that the vessel last left the dock. This value is not present when docked.

`LeftDock`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-leftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/LeftDock")

#### LeftDock Type

`integer`

### OnDuty

Conveys if a boat is truly in service.

`OnDuty`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-onduty.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/OnDuty")

#### OnDuty Type

`boolean`

### Progress

Vessel crossing progress percentage.

`Progress`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-progress.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Progress")

#### Progress Type

`number`

### ScheduledDeparture

WSF Vessel API pass-through: The date and time when this vessel was or is scheduled to leave its departing terminal. Might not be present if the next scheduled destination is still being determined.

`ScheduledDeparture`

*   is optional

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-scheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ScheduledDeparture")

#### ScheduledDeparture Type

`integer`

### Speed

WSF Vessel API pass-through: The speed of the vessel (in Knots).

`Speed`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-speed.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Speed")

#### Speed Type

`number`

### StopTimer

Seconds in port since docked.

`StopTimer`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-stoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/StopTimer")

#### StopTimer Type

`integer`

### VesselName

WSF Vessel API pass-through: The name of the vessel.

`VesselName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselName")

#### VesselName Type

`string`

### VesselPosition

Although WSF provides 'VesselPositionNum', it may switch between boats throughout the day. Therefore, it may make sense to assign our own via the unique vessel IDs, say whichever is a lower value.

`VesselPosition`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselposition.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselPosition")

#### VesselPosition Type

`integer`

### VesselPositionNum

WSF Vessel API pass-through: For a given route, the number used to identify the scheduled departures being serviced by this vessel. Not present if vessel is not in service.

`VesselPositionNum`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselpositionnum.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselPositionNum")

#### VesselPositionNum Type

`integer`

## Definitions group singlePortData

Reference this group by using

```json
{"$ref":"https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData"}
```

| Property                                                | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                                      |
| :------------------------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [BoatAtDock](#boatatdock)                               | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-boatatdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/BoatAtDock")                               |
| [BoatAtDockName](#boatatdockname)                       | `array`   | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-boatatdockname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/BoatAtDockName")                       |
| [NextScheduledSailing](#nextscheduledsailing)           | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-nextscheduledsailing.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/NextScheduledSailing")           |
| [PortArrivalTimeMinus](#portarrivaltimeminus)           | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portarrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortArrivalTimeMinus")           |
| [PortDepartureDelay](#portdeparturedelay)               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelay")               |
| [PortDepartureDelayAverage](#portdeparturedelayaverage) | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelayAverage") |
| [PortEstimatedArrivalTime](#portestimatedarrivaltime)   | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portestimatedarrivaltime.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortEstimatedArrivalTime")   |
| [PortLastArrived](#portlastarrived)                     | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portlastarrived.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortLastArrived")                     |
| [PortScheduleList](#portschedulelist)                   | `array`   | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portschedulelist.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortScheduleList")                   |
| [PortStopTimer](#portstoptimer)                         | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portstoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortStopTimer")                         |
| [TerminalAbbrev](#terminalabbrev)                       | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalAbbrev")                       |
| [TerminalName](#terminalname)                           | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalName")                           |

### BoatAtDock

Indicates if an in-service vessel is in port.

`BoatAtDock`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-boatatdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/BoatAtDock")

#### BoatAtDock Type

`boolean`

### BoatAtDockName

Name(s) of boat(s) in port.

`BoatAtDockName`

*   is required

*   Type: `string[]`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-boatatdockname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/BoatAtDockName")

#### BoatAtDockName Type

`string[]`

### NextScheduledSailing

The next departure scheduled.

`NextScheduledSailing`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-nextscheduledsailing.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/NextScheduledSailing")

#### NextScheduledSailing Type

`integer`

### PortArrivalTimeMinus

Seconds until arrival of next inbound boat.

`PortArrivalTimeMinus`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portarrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortArrivalTimeMinus")

#### PortArrivalTimeMinus Type

`integer`

### PortDepartureDelay

Seconds delayed beyond scheduled departure of latest vessel.

`PortDepartureDelay`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelay")

#### PortDepartureDelay Type

`integer`

### PortDepartureDelayAverage

Average delay in seconds of boats departing port.

`PortDepartureDelayAverage`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelayAverage")

#### PortDepartureDelayAverage Type

`integer`

### PortEstimatedArrivalTime

Date + time of next inbound boat.

`PortEstimatedArrivalTime`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portestimatedarrivaltime.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortEstimatedArrivalTime")

#### PortEstimatedArrivalTime Type

`integer`

### PortLastArrived

Time of last boat arrival.

`PortLastArrived`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portlastarrived.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortLastArrived")

#### PortLastArrived Type

`integer`

### PortScheduleList

List of scheduled departures for the day.

`PortScheduleList`

*   is required

*   Type: `integer[]`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portschedulelist.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortScheduleList")

#### PortScheduleList Type

`integer[]`

### PortStopTimer

Seconds in port since last boat arrival.

`PortStopTimer`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portstoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortStopTimer")

#### PortStopTimer Type

`integer`

### TerminalAbbrev

WSF Vessel API pass-through: The abbreviated terminal name where this vessel is docked or was last docked.

`TerminalAbbrev`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalAbbrev")

#### TerminalAbbrev Type

`string`

### TerminalName

WSF Vessel API pass-through: The name of the terminal where this vessel is docked or was last docked.

`TerminalName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalName")

#### TerminalName Type

`string`
