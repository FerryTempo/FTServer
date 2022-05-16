# Ferry Tempo Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json
```

Data schema for any given route from the Ferry Tempo API

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FerryTempo.schema.json](../out/FerryTempo.schema.json "open original schema") |

## Ferry Tempo Data Type

`object` ([Ferry Tempo Data](ferrytempo.md))

# Ferry Tempo Data Properties

| Property                  | Type          | Required | Nullable       | Defined by                                                                                                                                 |
| :------------------------ | :------------ | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| [boatData](#boatdata)     | Not specified | Required | cannot be null | [Ferry Tempo Data](ferrytempo-properties-boatdata.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/boatData")     |
| [portData](#portdata)     | Not specified | Required | cannot be null | [Ferry Tempo Data](ferrytempo-properties-portdata.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/portData")     |
| [lastUpdate](#lastupdate) | `number`      | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-properties-lastupdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/lastUpdate") |

## boatData



`boatData`

*   is required

*   Type: unknown

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-properties-boatdata.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/boatData")

### boatData Type

unknown

## portData



`portData`

*   is required

*   Type: unknown

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-properties-portdata.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/portData")

### portData Type

unknown

## lastUpdate

Date/time in epoch format of the last Ferry Tempo data update.

`lastUpdate`

*   is optional

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-properties-lastupdate.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/lastUpdate")

### lastUpdate Type

`number`

### lastUpdate Constraints

**maximum**: the value of this number must smaller than or equal to: `2147483647`

**minimum**: the value of this number must greater than or equal to: `0`

# Ferry Tempo Data Definitions

## Definitions group BoatData

Reference this group by using

```json
{"$ref":"https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData"}
```

| Property                                            | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                            |
| :-------------------------------------------------- | :-------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ArrivingTerminalAbbrev](#arrivingterminalabbrev)   | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-arrivingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/ArrivingTerminalAbbrev")   |
| [ArrivingTerminalName](#arrivingterminalname)       | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-arrivingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/ArrivingTerminalName")       |
| [AtDock](#atdock)                                   | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-atdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/AtDock")                                   |
| [BoatDepartureDelay](#boatdeparturedelay)           | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-boatdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/BoatDepartureDelay")           |
| [BoatETA](#boateta)                                 | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-boateta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/BoatETA")                                 |
| [DepartingTerminalName](#departingterminalname)     | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-departingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/DepartingTerminalName")     |
| [DepartingTermnialAbbrev](#departingtermnialabbrev) | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-departingtermnialabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/DepartingTermnialAbbrev") |
| [Direction](#direction)                             | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-direction.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Direction")                             |
| [Heading](#heading)                                 | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-heading.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Heading")                                 |
| [InService](#inservice)                             | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-inservice.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/InService")                             |
| [LeftDock](#leftdock)                               | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-leftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/LeftDock")                               |
| [OnDuty](#onduty)                                   | `boolean` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-onduty.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/OnDuty")                                   |
| [PositionUpdated](#positionupdated)                 | `number`  | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-positionupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/PositionUpdated")                 |
| [Progress](#progress)                               | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-progress.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Progress")                               |
| [ScheduledDeparture](#scheduleddeparture)           | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-scheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/ScheduledDeparture")           |
| [Speed](#speed)                                     | `number`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-speed.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Speed")                                     |
| [VesselName](#vesselname)                           | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-vesselname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/VesselName")                           |
| [VesselPositionNum](#vesselpositionnum)             | `integer` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-vesselpositionnum.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/VesselPositionNum")             |

### ArrivingTerminalAbbrev

The abbreviated terminal name that represents the vessel's next destination. Might not be present if the next scheduled destination is still being determined.

`ArrivingTerminalAbbrev`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-arrivingterminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/ArrivingTerminalAbbrev")

#### ArrivingTerminalAbbrev Type

`string`

### ArrivingTerminalName

Unique identifier pertaining to the terminal that represents the vessel's next destination. Might not be present if the next scheduled destination is still being determined.

`ArrivingTerminalName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-arrivingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/ArrivingTerminalName")

#### ArrivingTerminalName Type

`string`

### AtDock

Indicates whether or not the vessel is docked.

`AtDock`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-atdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/AtDock")

#### AtDock Type

`boolean`

### BoatDepartureDelay

Seconds delayed.  Tallies how late a boat is to depart. Resets when boat reaches destination.

`BoatDepartureDelay`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-boatdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/BoatDepartureDelay")

#### BoatDepartureDelay Type

`integer`

#### BoatDepartureDelay Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

### BoatETA

Countdown in seconds until arriving at terminal.

`BoatETA`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-boateta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/BoatETA")

#### BoatETA Type

`integer`

#### BoatETA Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

### DepartingTerminalName

The name of the terminal where this vessel is docked or was last docked.

`DepartingTerminalName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-departingterminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/DepartingTerminalName")

#### DepartingTerminalName Type

`string`

### DepartingTermnialAbbrev

The abbreviated terminal name where this vessel is docked or was last docked.

`DepartingTermnialAbbrev`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-departingtermnialabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/DepartingTermnialAbbrev")

#### DepartingTermnialAbbrev Type

`string`

### Direction

Conveys travel towards one port or the other.  Naming convention allows for product growth where routes are less overtly E-W.

`Direction`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-direction.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Direction")

#### Direction Type

`string`

#### Direction Constraints

**pattern**: the string must match the following regular expression:&#x20;

```regexp
^WN$|^ES$
```

[try pattern](https://regexr.com/?expression=%5EWN%24%7C%5EES%24 "try regular expression with regexr.com")

### Heading

The heading of the vessel (in degrees).

`Heading`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-heading.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Heading")

#### Heading Type

`integer`

#### Heading Constraints

**maximum**: the value of this number must smaller than or equal to: `359`

**minimum**: the value of this number must greater than or equal to: `0`

### InService

Indicates whether or not the vessel is in service.

`InService`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-inservice.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/InService")

#### InService Type

`boolean`

### LeftDock

The number of seconds since the vessel last left the dock. This value is not present when docked.

`LeftDock`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-leftdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/LeftDock")

#### LeftDock Type

`integer`

#### LeftDock Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

### OnDuty

Conveys if a boat is truly in service.

`OnDuty`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-onduty.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/OnDuty")

#### OnDuty Type

`boolean`

### PositionUpdated

Seconds since boat position was last updated by WSDOT.

`PositionUpdated`

*   is optional

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-positionupdated.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/PositionUpdated")

#### PositionUpdated Type

`number`

#### PositionUpdated Constraints

**maximum**: the value of this number must smaller than or equal to: `2147483647`

**minimum**: the value of this number must greater than or equal to: `0`

### Progress

Vessel crossing progress percentage.

`Progress`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-progress.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Progress")

#### Progress Type

`number`

#### Progress Constraints

**maximum**: the value of this number must smaller than or equal to: `1`

**minimum**: the value of this number must greater than or equal to: `0`

### ScheduledDeparture

Seconds until boat is next scheduled to depart a port.

`ScheduledDeparture`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-scheduleddeparture.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/ScheduledDeparture")

#### ScheduledDeparture Type

`integer`

#### ScheduledDeparture Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

### Speed

The speed of the vessel (in Knots).

`Speed`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-speed.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Speed")

#### Speed Type

`number`

#### Speed Constraints

**maximum**: the value of this number must smaller than or equal to: `300`

**minimum**: the value of this number must greater than or equal to: `0`

### VesselName

The name of the vessel.

`VesselName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-vesselname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/VesselName")

#### VesselName Type

`string`

### VesselPositionNum

For a given route, the number used to identify the scheduled departures being serviced by this vessel. Not present if vessel is not in service.

`VesselPositionNum`

*   is optional

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-boat-data-schema-properties-vesselpositionnum.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/VesselPositionNum")

#### VesselPositionNum Type

`integer`

#### VesselPositionNum Constraints

**maximum**: the value of this number must smaller than or equal to: `2`

**minimum**: the value of this number must greater than or equal to: `1`

## Definitions group PortData

Reference this group by using

```json
{"$ref":"https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData"}
```

| Property                                      | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                      |
| :-------------------------------------------- | :-------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [TerminalName](#terminalname)                 | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-port-data-schema-properties-terminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/TerminalName")                 |
| [TerrminalAbbrev](#terrminalabbrev)           | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-port-data-schema-properties-terrminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/TerrminalAbbrev")           |
| [BoatAtDock](#boatatdock)                     | `string`  | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-port-data-schema-properties-boatatdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/BoatAtDock")                     |
| [NextScheduledSailing](#nextscheduledsailing) | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-port-data-schema-properties-nextscheduledsailing.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/NextScheduledSailing") |
| [PortDepartureDelay](#portdeparturedelay)     | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-port-data-schema-properties-portdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/PortDepartureDelay")     |
| [PortETA](#porteta)                           | `integer` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-port-data-schema-properties-porteta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/PortETA")                           |

### TerminalName

The name of the port/terminal.

`TerminalName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-port-data-schema-properties-terminalname.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/TerminalName")

#### TerminalName Type

`string`

### TerrminalAbbrev

The abbreviated port/terminal name.

`TerrminalAbbrev`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-port-data-schema-properties-terrminalabbrev.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/TerrminalAbbrev")

#### TerrminalAbbrev Type

`string`

### BoatAtDock

Indicates if an in-service vessel is in port.

`BoatAtDock`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-port-data-schema-properties-boatatdock.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/BoatAtDock")

#### BoatAtDock Type

`string`

### NextScheduledSailing

Seconds until next scheduled departure from the port.

`NextScheduledSailing`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-port-data-schema-properties-nextscheduledsailing.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/NextScheduledSailing")

#### NextScheduledSailing Type

`integer`

#### NextScheduledSailing Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

### PortDepartureDelay

Average delay in seconds of boats departing port for current sailing day.  Resets at 00:00 each day.

`PortDepartureDelay`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-port-data-schema-properties-portdeparturedelay.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/PortDepartureDelay")

#### PortDepartureDelay Type

`integer`

#### PortDepartureDelay Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

### PortETA

Seconds until arrival of the next boat.

`PortETA`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-port-data-schema-properties-porteta.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/PortETA")

#### PortETA Type

`integer`

#### PortETA Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`

## Definitions group EpochTime

Reference this group by using

```json
{"$ref":"https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/EpochTime"}
```

| Property | Type | Required | Nullable | Defined by |
| :------- | :--- | :------- | :------- | :--------- |
