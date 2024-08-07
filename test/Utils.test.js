import {
  getSecondsFromNow,
  getEpochSecondsFromWSDOT,
  getCurrentEpochSeconds,
  getProgress,
  calculateDistance,
  getHumanDateFromEpochSeconds,
  updateAverage,
  getAverage,
  getRouteFromTerminals
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
  test('should return the actual epoch', () => {
    expect(getHumanDateFromEpochSeconds(0)).toBe('1969-12-31 16:00:00');
  });
  // this test not only checks a certain date/time but also verifies pad() works
  test('should return the date May 7, 2024 at 10:51:00', () => {
    expect(getHumanDateFromEpochSeconds(1715104260)).toBe('2024-05-07 10:51:00');
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