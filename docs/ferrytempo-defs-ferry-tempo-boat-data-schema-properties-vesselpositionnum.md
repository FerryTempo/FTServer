# Untitled integer in Ferry Tempo Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/VesselPositionNum
```

For a given route, the number used to identify the scheduled departures being serviced by this vessel. Not present if vessel is not in service.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                       |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../out/FerryTempo.schema.json "open original schema") |

## VesselPositionNum Type

`integer`

## VesselPositionNum Constraints

**maximum**: the value of this number must smaller than or equal to: `2`

**minimum**: the value of this number must greater than or equal to: `1`
