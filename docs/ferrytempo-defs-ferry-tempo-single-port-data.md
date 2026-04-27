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
| [TerminalName](#terminalname)                           | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalName")                           |
| [TerminalAbbrev](#terminalabbrev)                       | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalAbbrev")                       |
| [TerminalID](#terminalid)                               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalid.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalID")                               |
| [BoatAtDock](#boatatdock)                               | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-boatatdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/BoatAtDock")                               |
| [PortStopTimer](#portstoptimer)                         | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portstoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortStopTimer")                         |
| [PortStopTimerAverage](#portstoptimeraverage)           | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portstoptimeraverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortStopTimerAverage")           |
| [NextScheduledDeparture](#nextscheduleddeparture)       | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-nextscheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/NextScheduledDeparture")       |
| [PortScheduleList](#portschedulelist)                   | `array`   | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portschedulelist.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortScheduleList")                   |
| [PortDepartureDelay](#portdeparturedelay)               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelay")               |
| [PortDepartureDelayAverage](#portdeparturedelayaverage) | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelayAverage") |
| [PortETA](#porteta)                                     | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-porteta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortETA")                                     |
| [PortArrivalTimeMinus](#portarrivaltimeminus)           | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portarrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortArrivalTimeMinus")           |

## TerminalName

WSF Vessel API pass-through: The name of the terminal where this vessel is docked or was last docked.

`TerminalName`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalName")

### TerminalName Type

`string`

## TerminalAbbrev

WSF Vessel API pass-through: The abbreviated terminal name where this vessel is docked or was last docked.

`TerminalAbbrev`

* is required

* Type: `string`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalAbbrev")

### TerminalAbbrev Type

`string`

## TerminalID

WSF Vessel API pass-through: The terminal identifier.

`TerminalID`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalid.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalID")

### TerminalID Type

`integer`

## BoatAtDock

Indicates if an in-service vessel is in port.

`BoatAtDock`

* is required

* Type: `boolean`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-boatatdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/BoatAtDock")

### BoatAtDock Type

`boolean`

## PortStopTimer

Seconds in port since last boat arrival.

`PortStopTimer`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portstoptimer.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortStopTimer")

### PortStopTimer Type

`integer`

## PortStopTimerAverage

Average in-port stop time in seconds for boats departing this port during the sailing day.

`PortStopTimerAverage`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portstoptimeraverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortStopTimerAverage")

### PortStopTimerAverage Type

`integer`

## NextScheduledDeparture

The next departure scheduled.

`NextScheduledDeparture`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-nextscheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/NextScheduledDeparture")

### NextScheduledDeparture Type

`integer`

## PortScheduleList

List of scheduled departures for the sailing day.

`PortScheduleList`

* is required

* Type: `integer[]`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portschedulelist.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortScheduleList")

### PortScheduleList Type

`integer[]`

## PortDepartureDelay

Seconds delayed beyond scheduled departure of latest vessel.

`PortDepartureDelay`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelay")

### PortDepartureDelay Type

`integer`

## PortDepartureDelayAverage

Average delay in seconds of boats departing port.

`PortDepartureDelayAverage`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelayaverage.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelayAverage")

### PortDepartureDelayAverage Type

`integer`

## PortETA

Date + time of next inbound boat.

`PortETA`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-porteta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortETA")

### PortETA Type

`integer`

## PortArrivalTimeMinus

Seconds until arrival of next inbound boat.

`PortArrivalTimeMinus`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portarrivaltimeminus.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortArrivalTimeMinus")

### PortArrivalTimeMinus Type

`integer`
