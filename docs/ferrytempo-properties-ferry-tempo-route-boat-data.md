# Ferry Tempo Route Boat Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/boatData
```

An object representing all boats for a given route.

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## boatData Type

`object` ([Ferry Tempo Route Boat Data](ferrytempo-properties-ferry-tempo-route-boat-data.md))

# boatData Properties

| Property        | Type     | Required | Nullable       | Defined by                                                                                                                                                            |
| :-------------- | :------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [boat1](#boat1) | `object` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/boatData/properties/boat1") |
| [boat2](#boat2) | `object` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/boatData/properties/boat2") |

## boat1

Data schema for any given boat from the Ferry Tempo API

`boat1`

*   is required

*   Type: `object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/boatData/properties/boat1")

### boat1 Type

`object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))

## boat2

Data schema for any given boat from the Ferry Tempo API

`boat2`

*   is required

*   Type: `object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-boat-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/boatData/properties/boat2")

### boat2 Type

`object` ([Ferry Tempo Single Boat Data](ferrytempo-defs-ferry-tempo-single-boat-data.md))
