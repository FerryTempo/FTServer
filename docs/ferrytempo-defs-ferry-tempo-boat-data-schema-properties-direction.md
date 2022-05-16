# Untitled string in Ferry Tempo Data Schema

```txt
https://www.ferrytempo.com/schemas/FerryTempo.schema.json#/$defs/BoatData/properties/Direction
```

Conveys travel towards one port or the other.  Naming convention allows for product growth where routes are less overtly E-W.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [FerryTempo.schema.json\*](../schemas/FerryTempo.schema.json "open original schema") |

## Direction Type

`string`

## Direction Constraints

**pattern**: the string must match the following regular expression:&#x20;

```regexp
^WN$|^ES$
```

[try pattern](https://regexr.com/?expression=%5EWN%24%7C%5EES%24 "try regular expression with regexr.com")
