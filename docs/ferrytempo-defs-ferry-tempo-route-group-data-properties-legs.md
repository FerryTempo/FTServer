# Untitled object in Ferry Tempo Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/legs
```

Two-terminal leg routes that make up this route group.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## legs Type

`object` ([Details](ferrytempo-defs-ferry-tempo-route-group-data-properties-legs.md))

# legs Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                                                                                                                     |
| :-------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Additional Properties | `object` | Optional | cannot be null | [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/legs/additionalProperties") |

## Additional Properties

Additional properties are allowed, as long as they follow this schema:

Data schema for any single two-terminal route from the Ferry Tempo API.

* is optional

* Type: `object` ([Ferry Tempo Route Data](ferrytempo-defs-ferry-tempo-route-data.md))

* cannot be null

* defined in: [Ferry Tempo Data](ferrytempo-defs-ferry-tempo-route-data.md "https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/ferryTempoRouteGroupData/properties/legs/additionalProperties")

### additionalProperties Type

`object` ([Ferry Tempo Route Data](ferrytempo-defs-ferry-tempo-route-data.md))
