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
  getRouteFromTerminals,
  getBoatAssignments,
  getBoatsOnRoute
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
  test('should return the same value', () => {
    const avg = 50;
    // average of a single value should be that was input
    expect(updateAverage('key1', avg)).toEqual(avg);
  });
  // testing that thea averages are properly calcualted across multiple entries
  test('should return the average of several values', () => {
    updateAverage('key2', 40);
    updateAverage('key2', 100);
    expect(updateAverage('key2', 100)).toEqual(80);
  });
  // testing that thea averages are properly calcualted across multiple entries with truncation
  test('should return the average of several values', () => {
    updateAverage('key3', 11);
    // should truncate to 55
    expect(updateAverage('key3', 100)).toEqual(55);
  });
});

describe('getAverage function', () => {
  test('should return 0 when we do not have an average', () => {
    expect(getAverage('undefinedKey')).toEqual(0);
  });
  test('should return the value of precomputed average', () => {
    expect(getAverage('key2')).toEqual(80);
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
            "BoatDepartureDelay": 679,
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
            "BoatDepartureDelay": 139,
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
            "NextScheduledSailing": null,
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
            "NextScheduledSailing": null,
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
        "BoatDepartureDelay": 679,
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
        "BoatDepartureDelay": 139,
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
