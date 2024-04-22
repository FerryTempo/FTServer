import {
    getSecondsFromNow,
    getEpochSecondsFromWSDOT,
    getCurrentEpochSeconds,
    getProgress,
    calculateDistance,
  } from '../src/Utils.js';
  import jest from 'jest-mock';

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
  
      // Add more test cases for edge cases if needed
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
  
    // Add more test cases for edge cases if needed
  });
  
  describe('getProgress function', () => {
    test('should throw an error if route has fewer than two coordinates', () => {
      const routeData = [[0, 0]]; // Route with only one coordinate
      const currentLocation = [1, 1]; // Arbitrary current location
      expect(() => {
        getProgress(routeData, currentLocation);
      }).toThrow('Route must consist of at least two coordinates.');
    });
  
    // Add more test cases for valid input and edge cases if needed
  });
  
  describe('calculateDistance function', () => {
    test('should calculate distance between two coordinates accurately', () => {
      const coord1 = [37.7749, -122.4194]; // San Francisco, CA
      const coord2 = [34.0522, -118.2437]; // Los Angeles, CA
      // Calculated distance between San Francisco and Los Angeles is approximately 559.7 km
      expect(calculateDistance(coord1, coord2)).toBeCloseTo(559.1, 1);
    });
  
    // Add more test cases for valid input and edge cases if needed
  });
  