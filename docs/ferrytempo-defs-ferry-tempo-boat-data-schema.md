# Ferry Tempo Boat Data schema Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData
```

Data schema for any given boat from the Ferry Tempo API

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## BoatData Type

`object` ([Ferry Tempo Boat Data schema](ferrytempo-defs-ferry-tempo-boat-data-schema.md))

# BoatData Properties

| Property                                            | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                            |
| :-------------------------------------------------- | :-------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ArrivingTerminalAbbrev](#arrivingterminalabbrev)   | `string`  | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-arrivingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/ArrivingTerminalAbbrev")   |
| [ArrivingTerminalName](#arrivingterminalname)       | `string`  | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-arrivingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/ArrivingTerminalName")       |
| [AtDock](#atdock)                                   | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-atdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/AtDock")                                   |
| [BoatDepartureDelay](#boatdeparturedelay)           | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-boatdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/BoatDepartureDelay")           |
| [BoatETA](#boateta)                                 | `integer` | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-boateta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/BoatETA")                                 |
| [DepartingTerminalName](#departingterminalname)     | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-departingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/DepartingTerminalName")     |
| [DepartingTerminalAbbrev](#DepartingTerminalAbbrev) | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-DepartingTerminalAbbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/DepartingTerminalAbbrev") |
| [Direction](#direction)                             | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-direction.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Direction")                             |
| [Heading](#heading)                                 | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-heading.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Heading")                                 |
| [InService](#inservice)                             | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-inservice.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/InService")                             |
| [LeftDock](#leftdock)                               | `integer` | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-leftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/LeftDock")                               |
| [OnDuty](#onduty)                                   | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-onduty.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/OnDuty")                                   |
| [PositionUpdated](#positionupdated)                 | `number`  | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-positionupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/PositionUpdated")                 |
| [Progress](#progress)                               | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-progress.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Progress")                               |
| [ScheduledDeparture](#scheduleddeparture)           | `integer` | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-scheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/ScheduledDeparture")           |
| [Speed](#speed)                                     | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-speed.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Speed")                                     |
| [VesselName](#vesselname)                           | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-vesselname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/VesselName")                           |
| [VesselPositionNum](#vesselpositionnum)             | `integer` | Optional | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-vesselpositionnum.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/VesselPositionNum")             |

## ArrivingTerminalAbbrev

The abbreviated terminal name that represents the vessel's next destination. Might not be present if the next scheduled destination is still being determined.

`ArrivingTerminalAbbrev`

*   is required

*   Type: `string`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-arrivingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/ArrivingTerminalAbbrev")

### ArrivingTerminalAbbrev Type

`string`

## ArrivingTerminalName

Unique identifier pertaining to the terminal that represents the vessel's next destination. Might not be present if the next scheduled destination is still being determined.

`ArrivingTerminalName`

*   is required

*   Type: `string`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-arrivingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/ArrivingTerminalName")

### ArrivingTerminalName Type

`string`

## AtDock

Indicates whether or not the vessel is docked.

`AtDock`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-atdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/AtDock")

### AtDock Type

`boolean`

## BoatDepartureDelay

Seconds delayed.  Tallies how late a boat is to depart. Resets when boat reaches destination.

`BoatDepartureDelay`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-boatdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/BoatDepartureDelay")

### BoatDepartureDelay Type

`integer`

### BoatDepartureDelay Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

## BoatETA

Countdown in seconds until arriving at terminal.

`BoatETA`

*   is required

*   Type: `integer`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-boateta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/BoatETA")

### BoatETA Type

`integer`

### BoatETA Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

## DepartingTerminalName

The name of the terminal where this vessel is docked or was last docked.

`DepartingTerminalName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-departingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/DepartingTerminalName")

### DepartingTerminalName Type

`string`

## DepartingTerminalAbbrev

The abbreviated terminal name where this vessel is docked or was last docked.

`DepartingTerminalAbbrev`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-DepartingTerminalAbbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/DepartingTerminalAbbrev")

### DepartingTerminalAbbrev Type

`string`

## Direction

Conveys travel towards one port or the other.  Naming convention allows for product growth where routes are less overtly E-W.

`Direction`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-direction.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Direction")

### Direction Type

`string`

### Direction Constraints

**pattern**: the string must match the following regular expression:&#x20;

```regexp
^WN$|^ES$
```

[try pattern](https://regexr.com/?expression=%5EWN%24%7C%5EES%24 "try regular expression with regexr.com")

## Heading

The heading of the vessel (in degrees).

`Heading`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-heading.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Heading")

### Heading Type

`integer`

### Heading Constraints

**maximum**: the value of this number must smaller than or equal to: `359`

**minimum**: the value of this number must greater than or equal to: `0`

## InService

Indicates whether or not the vessel is in service.

`InService`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-inservice.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/InService")

### InService Type

`boolean`

## LeftDock

The number of seconds since the vessel last left the dock. This value is not present when docked.

`LeftDock`

*   is required

*   Type: `integer`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-leftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/LeftDock")

### LeftDock Type

`integer`

### LeftDock Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

## OnDuty

Conveys if a boat is truly in service.

`OnDuty`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-onduty.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/OnDuty")

### OnDuty Type

`boolean`

## PositionUpdated

Seconds since boat position was last updated by WSDOT.

`PositionUpdated`

*   is optional

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-positionupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/PositionUpdated")

### PositionUpdated Type

`number`

### PositionUpdated Constraints

**maximum**: the value of this number must smaller than or equal to: `2147483647`

**minimum**: the value of this number must greater than or equal to: `0`

## Progress

Vessel crossing progress percentage.

`Progress`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-progress.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Progress")

### Progress Type

`number`

### Progress Constraints

**maximum**: the value of this number must smaller than or equal to: `1`

**minimum**: the value of this number must greater than or equal to: `0`

## ScheduledDeparture

Seconds until boat is next scheduled to depart a port.

`ScheduledDeparture`

*   is required

*   Type: `integer`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-scheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/ScheduledDeparture")

### ScheduledDeparture Type

`integer`

### ScheduledDeparture Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

## Speed

The speed of the vessel (in Knots).

`Speed`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-speed.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Speed")

### Speed Type

`number`

### Speed Constraints

**maximum**: the value of this number must smaller than or equal to: `300`

**minimum**: the value of this number must greater than or equal to: `0`

## VesselName

The name of the vessel.

`VesselName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-vesselname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/VesselName")

### VesselName Type

`string`

## VesselPositionNum

For a given route, the number used to identify the scheduled departures being serviced by this vessel. Not present if vessel is not in service.

`VesselPositionNum`

*   is optional

*   Type: `integer`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-vesselpositionnum.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/VesselPositionNum")

### VesselPositionNum Type

`integer`

### VesselPositionNum Constraints

**maximum**: the value of this number must smaller than or equal to: `2`

**minimum**: the value of this number must greater than or equal to: `1`
