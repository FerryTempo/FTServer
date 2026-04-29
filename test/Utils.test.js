import {
  getSecondsFromNow,
  getEpochSecondsFromWSDOT,
  getCurrentEpochSeconds,
  getProgress,
  calculateDistance,
  getHumanDateFromEpochSeconds,
  isSolstice,
  isEquinox,
  updateAverage,
  getAverage,
  getSailingDayId,
  getRouteFromTerminals,
  compareAISData,
  getBoatAssignments,
  getBoatsOnRoute,
  getTimeFromEpochSeconds
} from '../src/Utils.js';

describe('getSecondsFromNow function', () => {
  test('should return 0 when input is null', () => {
    expect(getSecondsFromNow(null)).toBe(0);
  });

  test('should return negative value for dates in the past', () => {
    // Assuming the provided epoch is 1618650912000 (2021-04-17T02:15:12 GMT-07:00) in the past
    const WSDOTDate = '/Date(1618650912000-0700)/';
    expect(getSecondsFromNow(WSDOTDate)).toBeLessThan(0);
  });

  test('should return positive value for dates in the future', () => {
    // Create a time that is 60 seconds in the future
    const now = Date.now();

    const WSDOTDate = '/Date(' + now+60000 + '-0700)/';
    expect(getSecondsFromNow(WSDOTDate)).toBeGreaterThan(0);
  });
});

describe('getEpochSecondsFromWSDOT function', () => {
  test('should return 0 when input is null', () => {
    expect(getEpochSecondsFromWSDOT(null)).toBe(0);
  });

  test('should return 0 for invalid input format', () => {
    expect(getEpochSecondsFromWSDOT('/InvalidFormat/')).toBe(0);
  });

  test('should return epoch seconds for valid input', () => {
    const WSDOTDate = '/Date(1713305248000-0700)/';
    expect(getEpochSecondsFromWSDOT(WSDOTDate)).toBe(1713305248);
  });
});

describe('getCurrentEpochSeconds function', () => {
  test('should return current time', () => {
    const now = Date.now();
    expect(getCurrentEpochSeconds()).toBe(Math.trunc(now/1000));
  });
});

describe('getProgress function', () => {
  test('should throw an error if route has fewer than two coordinates', () => {
    const routeData = [[0, 0]]; // Route with only one coordinate
    const currentLocation = [1, 1]; // Arbitrary current location
    expect(() => {
      getProgress(routeData, currentLocation);
    }).toThrow('Route must consist of at least two coordinates.');
  });
});

describe('calculateDistance function', () => {
  test('should calculate distance between two coordinates accurately', () => {
    const coord1 = [37.7749, -122.4194]; // San Francisco, CA
    const coord2 = [34.0522, -118.2437]; // Los Angeles, CA
    // Calculated distance between San Francisco and Los Angeles is approximately 559.7 km
    expect(calculateDistance(coord1, coord2)).toBeCloseTo(559.1, 1);
  });
});

describe('getHumanDateFromEpochSeconds function', () => {
  test('should return Jan 11, 2020 at 16:29:55', () => {
    expect(getHumanDateFromEpochSeconds(1578788995)).toBe('2020-01-11 16:29:55');
  });
  // this test not only checks a certain date/time but also verifies pad() works
  test('should return the date May 7, 2024 at 10:51:00', () => {
    expect(getHumanDateFromEpochSeconds(1715104260)).toBe('2024-05-07 10:51:00');
  });
});

describe('isSolstice function', () => {
  test('should return true for summer solstice', () => {
    // Summer solstice is on June 20, 2024
    expect(isSolstice(1718866860)).toBe(true);
  });
  test('should return false for non-solstice date', () => {
    // Arbitrary date in 2024
    expect(isSolstice(1715104260)).toBe(false);
  });
});

describe('isEquinox function', () => {
  test('should return true for vernal equinox', () => {
    // Vernal equinox is on March 19, 2024
    expect(isEquinox(1710831660)).toBe(true);
  });
  test('should return false for non-equinox date', () => {
    // Arbitrary date in 2024
    expect(isEquinox(1715104260)).toBe(false);
  });
});

describe('updateAverage function', () => {
  const sailingDayEpoch = 1710000000;

  test('should return the same value', () => {
    const avg = 50;
    // average of a single value should be that was input
    expect(updateAverage('key1', avg, sailingDayEpoch)).toEqual(avg);
  });
  // testing that thea averages are properly calcualted across multiple entries
  test('should return the average of several values', () => {
    updateAverage('key2', 40, sailingDayEpoch);
    updateAverage('key2', 100, sailingDayEpoch);
    expect(updateAverage('key2', 100, sailingDayEpoch)).toEqual(80);
  });
  // testing that thea averages are properly calcualted across multiple entries with truncation
  test('should return the average of several values', () => {
    updateAverage('key3', 11, sailingDayEpoch);
    // should truncate to 55
    expect(updateAverage('key3', 100, sailingDayEpoch)).toEqual(55);
  });
  test('should keep total delay instead of compounding truncated averages', () => {
    updateAverage('key4', 1, sailingDayEpoch);
    updateAverage('key4', 2, sailingDayEpoch);
    updateAverage('key4', 2, sailingDayEpoch);

    expect(updateAverage('key4', 3, sailingDayEpoch)).toEqual(2);
  });
  test('should reset averages for a new sailing day', () => {
    updateAverage('key5', 100, sailingDayEpoch);

    expect(updateAverage('key5', 20, sailingDayEpoch + 86400)).toEqual(20);
  });
});

describe('getAverage function', () => {
  test('should return 0 when we do not have an average', () => {
    expect(getAverage('undefinedKey')).toEqual(0);
  });
  test('should return the value of precomputed average', () => {
    updateAverage('key6', 40, 1710000000);
    updateAverage('key6', 100, 1710000000);
    expect(updateAverage('key6', 100, 1710000000)).toEqual(80);
    expect(getAverage('key6', 1710000000)).toEqual(80);
  });
});

describe('getSailingDayId function', () => {
  test('should keep after-midnight sailings on the previous sailing day', () => {
    expect(getSailingDayId(1710063000)).toEqual('2024-03-09');
  });
});

describe('getRouteFromTerminals function', () => {
  // Terminal names that do not exist in our data should return null
  test('should return null', () => {
    expect(getRouteFromTerminals('NoWhere', 'NoWhen')).toEqual(null);
  });
  // One terminal matches but the other does not
  test('should return null', () => {
    expect(getRouteFromTerminals('Seattle', 'Coupeville')).toEqual(null);
  });
  // Testing terminals in the correct order should return sea-bi
  test('should return sea-bi route', () => {
    expect(getRouteFromTerminals('Seattle', 'Bainbridge Island')).toEqual('sea-bi');
  });
  // Testing terminals in the opposite order should return sea-bi
  test('should return sea-bi route', () => {
    expect(getRouteFromTerminals('Bainbridge Island', 'Seattle')).toEqual('sea-bi');
  });
  test('should return pd-tal route', () => {
    expect(getRouteFromTerminals('Point Defiance', 'Tahlequah')).toEqual('pd-tal');
  });
  test('should return pd-tal route in the opposite direction', () => {
    expect(getRouteFromTerminals('Tahlequah', 'Point Defiance')).toEqual('pd-tal');
  });
  // If either terminal is null, return null
  test('should return null', () => {
    expect(getRouteFromTerminals(null, 'Bainbridge Island')).toEqual(null);
  });
  // If either terminal is null, return null
  test('should return null', () => {
    expect(getRouteFromTerminals('Bainbridge Island', null)).toEqual(null);
  });
});


describe('getBoatAssignments function', () => {
  test('should return the appropriate structure', () => {
    const ftData = {
      "sea-bi": {
        "boatData": {
          "boat1": {
            "ArrivalTimeMinus": 1319,
            "ArrivingTerminalAbbrev": "P52",
            "ArrivingTerminalName": "Seattle",
            "AtDock": false,
            "DepartureDelay": 679,
            "DepartureDelayAverage": 679,
            "BoatETA": 1726094220,
            "DepartingTerminalName": "Bainbridge Island",
            "DepartingTerminalAbbrev": "BBI",
            "Direction": "ES",
            "Heading": 94,
            "InService": true,
            "LeftDock": 1726092379,
            "MMSI": 367712660,
            "OnDuty": true,
            "PositionUpdated": 1726092898,
            "Progress": 0.2832214669887444,
            "ScheduledDeparture": 1726091700,
            "Speed": 15.4,
            "StopTimer": 0,
            "VesselName": "Chimacum",
            "VesselPosition": 1
          },
          "boat2": {
            "ArrivalTimeMinus": 1065,
            "ArrivingTerminalAbbrev": "BBI",
            "ArrivingTerminalName": "Bainbridge Island",
            "AtDock": false,
            "DepartureDelay": 139,
            "DepartureDelayAverage": 139,
            "BoatETA": 1726094040,
            "DepartingTerminalName": "Seattle",
            "DepartingTerminalAbbrev": "P52",
            "Direction": "WN",
            "Heading": 261,
            "InService": true,
            "LeftDock": 1726092139,
            "MMSI": 366772760,
            "OnDuty": true,
            "PositionUpdated": 1726092898,
            "Progress": 0.43961448423834676,
            "ScheduledDeparture": 1726092000,
            "Speed": 17.2,
            "StopTimer": 0,
            "VesselName": "Tacoma",
            "VesselPosition": 2
          }
        },
        "routeID": "5",
        "portData": {
          "portES": {
            "TerminalName": "Seattle",
            "TerminalAbbrev": "P52",
            "TerminalID": 7,
            "BoatAtDock": false,
            "NextScheduledDeparture": null,
            "PortDepartureDelay": 139,
            "PortDepartureDelayAverage": 139,
            "PortETA": 1726094220,
            "PortArrivalTimeMinus": 1319,
            "PortStopTimer": 0
          },
          "portWN": {
            "TerminalName": "Bainbridge Island",
            "TerminalAbbrev": "BBI",
            "TerminalID": 3,
            "BoatAtDock": false,
            "NextScheduledDeparture": null,
            "PortDepartureDelay": 679,
            "PortDepartureDelayAverage": 679,
            "PortETA": 1726094040,
            "PortStopTimer": 0,
            "PortArrivalTimeMinus": 1065
          }
        }
      }};
    const boatData = {
      'sea-bi': [
        {
          'MMSI': 367712660,
          'Position': 1
        },
        {
          'MMSI': 366772760,
          'Position': 2
        }
      ]
    };

    expect(getBoatAssignments(ftData)).toEqual(boatData);
  });
});

describe('getBoatsOnRoute function', () => {
  test('should return the appropriate structure', () => {
    const boatData = {
      "boat1": {
        "ArrivalTimeMinus": 1319,
        "ArrivingTerminalAbbrev": "P52",
        "ArrivingTerminalName": "Seattle",
        "AtDock": false,
        "DepartureDelay": 679,
        "DepartureDelayAverage": 679,
        "BoatETA": 1726094220,
        "DepartingTerminalName": "Bainbridge Island",
        "DepartingTerminalAbbrev": "BBI",
        "Direction": "ES",
        "Heading": 94,
        "InService": true,
        "LeftDock": 1726092379,
        "MMSI": 367712660,
        "OnDuty": true,
        "PositionUpdated": 1726092898,
        "Progress": 0.2832214669887444,
        "ScheduledDeparture": 1726091700,
        "Speed": 15.4,
        "StopTimer": 0,
        "VesselName": "Chimacum",
        "VesselPosition": 1
      },
      "boat2": {
        "ArrivalTimeMinus": 1065,
        "ArrivingTerminalAbbrev": "BBI",
        "ArrivingTerminalName": "Bainbridge Island",
        "AtDock": false,
        "DepartureDelay": 139,
        "DepartureDelayAverage": 139,
        "BoatETA": 1726094040,
        "DepartingTerminalName": "Seattle",
        "DepartingTerminalAbbrev": "P52",
        "Direction": "WN",
        "Heading": 261,
        "InService": true,
        "LeftDock": 1726092139,
        "MMSI": 366772760,
        "OnDuty": true,
        "PositionUpdated": 1726092898,
        "Progress": 0.43961448423834676,
        "ScheduledDeparture": 1726092000,
        "Speed": 17.2,
        "StopTimer": 0,
        "VesselName": "Tacoma",
        "VesselPosition": 2
      }
    };
    const boatAssignments = [
        {
          'MMSI': 367712660,
          'Position': 1
        },
        {
          'MMSI': 366772760,
          'Position': 2
        }
      ];
    expect(getBoatsOnRoute(boatData)).toEqual(boatAssignments);
  });
});

describe('compareAISData function', () => {
  test('should request update when AIS boat positions are swapped', () => {
    const ferryTempoData = {
      'pt-cou': {
        boatData: {
          boat1: { MMSI: 111, VesselPosition: 1 },
          boat2: { MMSI: 222, VesselPosition: 2 }
        }
      }
    };
    const aisData = {
      'pt-cou': {
        boatData: {
          boat1: { MMSI: 222, VesselPosition: 2 },
          boat2: { MMSI: 111, VesselPosition: 1 }
        }
      }
    };

    expect(compareAISData(ferryTempoData, aisData)).toEqual({
      'pt-cou': [
        { MMSI: 111, Position: 1 },
        { MMSI: 222, Position: 2 }
      ]
    });
  });
});

describe('getTimeFromEpoch function', () => {
  test('should return 07:40', () => {
    expect(getTimeFromEpochSeconds(1733240445, -8)).toBe("07:40");
  });
  test('should return 04:19', () => {
    expect(getTimeFromEpochSeconds(1733271596, -8)).toBe("16:19");
  });
  test('should apply Pacific daylight saving time for Los Angeles timezone', () => {
    expect(getTimeFromEpochSeconds(1773537180, 'America/Los_Angeles')).toBe("18:13");
  });
});
