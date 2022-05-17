# Untitled undefined type in Ferry Tempo Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/singleBoatData/properties/ScheduledDeparture
```

Date/time in epoch format of when boat is next scheduled to depart a port.  Not present if scheduled departure is still being determined.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## ScheduledDeparture Type

`integer`

## ScheduledDeparture Constraints

**maximum**: the value of this number must smaller than or equal to: `2147483647`

**minimum**: the value of this number must greater than or equal to: `0`
