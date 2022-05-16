# Ferry Tempo Route Ports Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/portData
```

An object representing the ports for a given route.

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## portData Type

`object` ([Ferry Tempo Route Ports Data](ferrytempo-properties-ferry-tempo-route-ports-data.md))

# portData Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                                                                                                             |
| :---------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [portWN](#portwn) | `object` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/portData/properties/portWN") |
| [portES](#portes) | `object` | Required | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/portData/properties/portES") |

## portWN

Data schema for any given port from the Ferry Tempo API

`portWN`

*   is required

*   Type: `object` ([Ferry Tempo Single Port Data](ferrytempo-defs-ferry-tempo-single-port-data.md))

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/portData/properties/portWN")

### portWN Type

`object` ([Ferry Tempo Single Port Data](ferrytempo-defs-ferry-tempo-single-port-data.md))

## portES

Data schema for any given port from the Ferry Tempo API

`portES`

*   is required

*   Type: `object` ([Ferry Tempo Single Port Data](ferrytempo-defs-ferry-tempo-single-port-data.md))

*   cannot be null

*   defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-single-port-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/properties/portData/properties/portES")

### portES Type

`object` ([Ferry Tempo Single Port Data](ferrytempo-defs-ferry-tempo-single-port-data.md))
