# Ferry Tempo Route Boat(s) Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData
```

An object representing all currently observed boats for a given route. Keys preserve WSF vessel position numbers, so a route may contain boat3 without boat1 or boat2.

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Forbidden             | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## boatData Type

`object` ([Ferry Tempo Route Boat(s) Data](ferrytempo-defs-ferry-tempo-route-data-properties-ferry-tempo-route-boats-data.md))

# boatData Properties

| Property            | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                           |
| :------------------ | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [boat1](#boat1)     | `object` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData/properties/boat1")                      |
| [boat2](#boat2)     | `object` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData/properties/boat2")                      |
| [boat3](#boat3)     | `object` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData/properties/boat3")                      |
| `^boat[1-9][0-9]*$` | `object` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData/patternProperties/^boat\[1-9]\[0-9]*$") |

## boat1

Data schema for any given boat from the Ferry Tempo API

`boat1`

* is optional

* Type: `object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData/properties/boat1")

### boat1 Type

`object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))

## boat2

Data schema for any given boat from the Ferry Tempo API

`boat2`

* is optional

* Type: `object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData/properties/boat2")

### boat2 Type

`object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))

## boat3

Data schema for any given boat from the Ferry Tempo API

`boat3`

* is optional

* Type: `object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData/properties/boat3")

### boat3 Type

`object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))

## Pattern: `^boat[1-9][0-9]*$`

Data schema for any given boat from the Ferry Tempo API

`^boat[1-9][0-9]*$`

* is optional

* Type: `object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteData/properties/boatData/patternProperties/^boat\[1-9]\[0-9]*$")

### ^boat\[1-9]\[0-9]\*$ Type

`object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))
