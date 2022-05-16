# Untitled undefined type in Ferry Tempo Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/PortData/properties/PortETA
```

Seconds until arrival of the next boat.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## PortETA Type

`integer`

## PortETA Constraints

**maximum**: the value of this number must smaller than or equal to: `32768`

**minimum**: the value of this number must greater than or equal to: `0`
