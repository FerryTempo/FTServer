# Untitled undefined type in Ferry Tempo Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/LeftDock
```

Date/time in epoch format of when the vessel last left the dock. This value is not present when docked.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## LeftDock Type

`integer`

## LeftDock Constraints

**maximum**: the value of this number must smaller than or equal to: `2147483647`

**minimum**: the value of this number must greater than or equal to: `0`
