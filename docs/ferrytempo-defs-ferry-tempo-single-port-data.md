# Ferry Tempo Single Port Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData
```

Data schema for any given port from the Ferry Tempo API

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## singlePortData Type

`object` ([Ferry Tempo Single Port Data](ferrytempo-defs-ferry-tempo-single-port-data.md))

# singlePortData Properties

| Property                                      | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                            |
| :-------------------------------------------- | :-------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [TerminalName](#terminalname)                 | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalName")                 |
| [TerrminalAbbrev](#terrminalabbrev)           | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terrminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerrminalAbbrev")           |
| [BoatAtDock](#boatatdock)                     | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-boatatdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/BoatAtDock")                     |
| [NextScheduledSailing](#nextscheduledsailing) | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-nextscheduledsailing.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/NextScheduledSailing") |
| [PortDepartureDelay](#portdeparturedelay)     | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelay")     |
| [PortETA](#porteta)                           | `integer` | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-porteta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortETA")                           |

## TerminalName

The name of the port/terminal.

`TerminalName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerminalName")

### TerminalName Type

`string`

## TerrminalAbbrev

The abbreviated port/terminal name.

`TerrminalAbbrev`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-terrminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/TerrminalAbbrev")

### TerrminalAbbrev Type

`string`

## BoatAtDock

Indicates if an in-service vessel is in port.

`BoatAtDock`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-boatatdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/BoatAtDock")

### BoatAtDock Type

`string`

## NextScheduledSailing

Seconds until next scheduled departure from the port.

`NextScheduledSailing`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-nextscheduledsailing.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/NextScheduledSailing")

### NextScheduledSailing Type

`integer`

### NextScheduledSailing Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

## PortDepartureDelay

Average delay in seconds of boats departing port for current sailing day.  Resets at 00:00 each day.

`PortDepartureDelay`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-portdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortDepartureDelay")

### PortDepartureDelay Type

`integer`

### PortDepartureDelay Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

## PortETA

Seconds until arrival of the next boat.

`PortETA`

*   is required

*   Type: `integer`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data-properties-porteta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singlePortData/properties/PortETA")

### PortETA Type

`integer`

### PortETA Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`
