# Untitled undefined type in Ferry Tempo Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/LeftDock
```

The number of seconds since the vessel last left the dock. This value is not present when docked.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## LeftDock Type

`integer`

## LeftDock Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`
