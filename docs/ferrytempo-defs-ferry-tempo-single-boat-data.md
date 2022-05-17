# Ferry Tempo Single Boat Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData
```

Data schema for any given boat from the Ferry Tempo API

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## singleBoatData Type

`object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))

# singleBoatData Properties

| Property                                            | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                                  |
| :-------------------------------------------------- | :-------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ArrivingTerminalAbbrev](#arrivingterminalabbrev)   | `string`  | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalAbbrev")   |
| [ArrivingTerminalName](#arrivingterminalname)       | `string`  | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalName")       |
| [AtDock](#atdock)                                   | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-atdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/AtDock")                                   |
| [BoatDepartureDelay](#boatdeparturedelay)           | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-boatdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/BoatDepartureDelay")           |
| [BoatETA](#boateta)                                 | `integer` | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-boateta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/BoatETA")                                 |
| [DepartingTerminalName](#departingterminalname)     | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalName")     |
| [DepartingTermnialAbbrev](#departingtermnialabbrev) | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingtermnialabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTermnialAbbrev") |
| [Direction](#direction)                             | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-direction.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Direction")                             |
| [Heading](#heading)                                 | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-heading.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Heading")                                 |
| [InService](#inservice)                             | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-inservice.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/InService")                             |
| [LeftDock](#leftdock)                               | `integer` | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-leftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/LeftDock")                               |
| [OnDuty](#onduty)                                   | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-onduty.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/OnDuty")                                   |
| [PositionUpdated](#positionupdated)                 | `integer` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-positionupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/PositionUpdated")                 |
| [Progress](#progress)                               | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-progress.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Progress")                               |
| [ScheduledDeparture](#scheduleddeparture)           | `integer` | Required | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-scheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ScheduledDeparture")           |
| [Speed](#speed)                                     | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-speed.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Speed")                                     |
| [VesselName](#vesselname)                           | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselName")                           |
| [VesselPositionNum](#vesselpositionnum)             | `integer` | Optional | can be null    | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselpositionnum.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselPositionNum")             |

## ArrivingTerminalAbbrev

The abbreviated terminal name that represents the vessel's next destination. Might not be present if the next scheduled destination is still being determined.

`ArrivingTerminalAbbrev`

*   is required

*   Type: `string`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalAbbrev")

### ArrivingTerminalAbbrev Type

`string`

## ArrivingTerminalName

Unique identifier pertaining to the terminal that represents the vessel's next destination. Might not be present if the next scheduled destination is still being determined.

`ArrivingTerminalName`

*   is required

*   Type: `string`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-arrivingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ArrivingTerminalName")

### ArrivingTerminalName Type

`string`

## AtDock

Indicates whether or not the vessel is docked.

`AtDock`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-atdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/AtDock")

### AtDock Type

`boolean`

## BoatDepartureDelay

Seconds delayed.  Tallies how late a boat is to depart. Resets when boat reaches destination.

`BoatDepartureDelay`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-boatdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/BoatDepartureDelay")

### BoatDepartureDelay Type

`integer`

### BoatDepartureDelay Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

## BoatETA

Date/time in epoch format of the boat's expected arrival at the terminal.  Returns null if the boat is currently docked.

`BoatETA`

*   is required

*   Type: `integer`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-boateta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/BoatETA")

### BoatETA Type

`integer`

### BoatETA Constraints

**maximum**: the value of this number must smaller than or equal to: `2147483647`

**minimum**: the value of this number must greater than or equal to: `0`

## DepartingTerminalName

The name of the terminal where this vessel is docked or was last docked.

`DepartingTerminalName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTerminalName")

### DepartingTerminalName Type

`string`

## DepartingTermnialAbbrev

The abbreviated terminal name where this vessel is docked or was last docked.

`DepartingTermnialAbbrev`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-departingtermnialabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/DepartingTermnialAbbrev")

### DepartingTermnialAbbrev Type

`string`

## Direction

Conveys travel towards one port or the other.  Naming convention allows for product growth where routes are less overtly E-W.

`Direction`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-direction.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Direction")

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

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-heading.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Heading")

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

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-inservice.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/InService")

### InService Type

`boolean`

## LeftDock

Date/time in epoch format of when the vessel last left the dock. This value is not present when docked.

`LeftDock`

*   is required

*   Type: `integer`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-leftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/LeftDock")

### LeftDock Type

`integer`

### LeftDock Constraints

**maximum**: the value of this number must smaller than or equal to: `2147483647`

**minimum**: the value of this number must greater than or equal to: `0`

## OnDuty

Conveys if a boat is truly in service.

`OnDuty`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-onduty.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/OnDuty")

### OnDuty Type

`boolean`

## PositionUpdated

Date/time in epoch format of when boat position was last updated by WSDOT.

`PositionUpdated`

*   is optional

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-positionupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/PositionUpdated")

### PositionUpdated Type

`integer`

### PositionUpdated Constraints

**maximum**: the value of this number must smaller than or equal to: `2147483647`

**minimum**: the value of this number must greater than or equal to: `0`

## Progress

Vessel crossing progress percentage.

`Progress`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-progress.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Progress")

### Progress Type

`number`

### Progress Constraints

**maximum**: the value of this number must smaller than or equal to: `1`

**minimum**: the value of this number must greater than or equal to: `0`

## ScheduledDeparture

Date/time in epoch format of when boat is next scheduled to depart a port.  Not present if scheduled departure is still being determined.

`ScheduledDeparture`

*   is required

*   Type: `integer`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-scheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ScheduledDeparture")

### ScheduledDeparture Type

`integer`

### ScheduledDeparture Constraints

**maximum**: the value of this number must smaller than or equal to: `2147483647`

**minimum**: the value of this number must greater than or equal to: `0`

## Speed

The speed of the vessel (in Knots).

`Speed`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-speed.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/Speed")

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

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselName")

### VesselName Type

`string`

## VesselPositionNum

For a given route, the number used to identify the scheduled departures being serviced by this vessel. Not present if vessel is not in service.

`VesselPositionNum`

*   is optional

*   Type: `integer`

*   can be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data-properties-vesselpositionnum.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/VesselPositionNum")

### VesselPositionNum Type

`integer`

### VesselPositionNum Constraints

**maximum**: the value of this number must smaller than or equal to: `2`

**minimum**: the value of this number must greater than or equal to: `1`
