# Ferry Tempo Single Port Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/portData/properties/portES
```

Data schema for any given port from the Ferry Tempo API

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## portES Type

`object` ([Ferry Tempo Single Port Data](ferrytempo-defs-ferry-tempo-single-port-data.md))

# portES Properties

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

## BoatAtDock

Indicates if an in-service vessel is in port.

`BoatAtDock`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-boatatdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/BoatAtDock")

### BoatAtDock Type

`boolean`

## BoatAtDockName

Name(s) of boat(s) in port.

`BoatAtDockName`

*   is required

*   Type: `string[]`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-boatatdockname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/BoatAtDockName")

### BoatAtDockName Type

`string[]`

## NextScheduledSailing

The next departure scheduled.

`NextScheduledSailing`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-nextscheduledsailing.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/NextScheduledSailing")

### NextScheduledSailing Type

`integer`

## PortArrivalTimeMinus

Seconds until arrival of next inbound boat.

`PortArrivalTimeMinus`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portarrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortArrivalTimeMinus")

### PortArrivalTimeMinus Type

`integer`

## PortDepartureDelay

Seconds delayed beyond scheduled departure of latest vessel.

`PortDepartureDelay`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelay")

### PortDepartureDelay Type

`integer`

## PortDepartureDelayAverage

Average delay in seconds of boats departing port.

`PortDepartureDelayAverage`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelayAverage")

### PortDepartureDelayAverage Type

`integer`

## PortEstimatedArrivalTime

Date + time of next inbound boat.

`PortEstimatedArrivalTime`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portestimatedarrivaltime.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortEstimatedArrivalTime")

### PortEstimatedArrivalTime Type

`integer`

## PortLastArrived

Time of last boat arrival.

`PortLastArrived`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portlastarrived.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortLastArrived")

### PortLastArrived Type

`integer`

## PortScheduleList

List of scheduled departures for the day.

`PortScheduleList`

*   is required

*   Type: `integer[]`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portschedulelist.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortScheduleList")

### PortScheduleList Type

`integer[]`

## PortStopTimer

Seconds in port since last boat arrival.

`PortStopTimer`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portstoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortStopTimer")

### PortStopTimer Type

`integer`

## TerminalAbbrev

WSF Vessel API pass-through: The abbreviated terminal name where this vessel is docked or was last docked.

`TerminalAbbrev`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalAbbrev")

### TerminalAbbrev Type

`string`

## TerminalName

WSF Vessel API pass-through: The name of the terminal where this vessel is docked or was last docked.

`TerminalName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalName")

### TerminalName Type

`string`
