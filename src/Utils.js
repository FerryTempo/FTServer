/**
 * Utils.js
 * ============
 * Collection of utilities used by the FTServer application
 */
import Logger from './Logger.js';
import StorageManager from './StorageManager.js';
import routeFTData from '../data/RouteFTData.js';
import routePositionData from '../data/RoutePositionData.js';
import boatData from '../data/BoatData.js';
import solstice from '../data/SolsticeLookup.js';

const logger = new Logger();
const storage = new StorageManager();

/**
 * Converts time value from WSDOT format to seconds from the current time.
 * Returns number of seconds either positive (future) or negative (past).
 * @param {string} dateString WSDOT format date in the format "/Date({epoch}-{timezone offset})/"
 * @return {number} seconds from now
 */
export function getSecondsFromNow(dateString) {
  if (!dateString) return 0;

  // Extract dateString as epoch integer
  const epoch = getEpochSecondsFromWSDOT(dateString);

  // Subtract the dateString date from the current date/time.
  const secondsFromNow = Math.round((new Date(epoch) - (new Date() / 1000)));

  return secondsFromNow;
}

/**
 * Converts the WSDOT-provided "/Date({epoch}-{timezone offset})/" string to an epoch seconds value.
 * @param {string} WSDOTDate
 * @return {number} Epoch value of WSDOTDate value in seconds
 */
export function getEpochSecondsFromWSDOT(WSDOTDate) {
  if (!WSDOTDate) return 0;

  // Use a regular expression to test if the format matches what we expect "/Date(1713305248000-0700)/"
  if (!/^\/Date\(\d+[-+]\d{4}\)\//.test(WSDOTDate)) {
    logger.error('Invalid WSDOTDate format received: ' + WSDOTDate);
    return 0;
  }

  // TODO: Check format of string to ensure compatibility https://github.com/FerryTempo/FTServer/issues/19
  return parseInt(WSDOTDate.substring(WSDOTDate.lastIndexOf('(') + 1, WSDOTDate.lastIndexOf('-'))) / 1000;
}

/**
 * Gets the current epoch time in seconds.
 * @return {number} The current epoch time in seconds.
 */
export function getCurrentEpochSeconds() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Internal function to pad a single integer with a leading zero if it is less than 10
 * @param {} n 
 * @returns 
 */
function pad(n) {return n<10 ? '0'+n : n}

/** 
 * Return the provided epoch time value into a string for use in logging and debugging
 * @return {string} The input epoch time converted to human readable format
 */
export function getHumanDateFromEpochSeconds(epochSec) {
  let epochTime = epochSec * 1000;
  let d = new Date(epochTime);
  let dash = '-';
  let colon = ':';
  return d.getFullYear() + dash +
  pad(d.getMonth()+1) + dash +
  pad(d.getDate()) + ' ' +
  pad(d.getHours()) + colon +
  pad(d.getMinutes()) + colon +
  pad(d.getSeconds());
}

/**
 * Return the time from the input epoch time value in the format HH:MM
 * @param {number} epochSec - The epoch time in seconds
 * @return {string} - The time in HH:MM format
 */
export function getTimeFromEpochSeconds(epochSec, timezoneOffset) {
  let epochTime = epochSec * 1000;

  // Create a Date object from the epoch time (assumed to be in UTC)
  let d = new Date(epochTime);

  // Get the UTC time components
  let utcHours = d.getUTCHours();
  let utcMinutes = d.getUTCMinutes();

  // Calculate the local time by adding the timezone offset
  let localHours = utcHours + timezoneOffset;
  
  // Handle overflow if localHours is outside 0-23 range
  if (localHours >= 24) {
    localHours -= 24;  // Roll over the hours (e.g., 25 -> 1 AM)
  } else if (localHours < 0) {
    localHours += 24;  // Roll back the hours (e.g., -1 -> 23 PM)
  }

  // Format the time as HH:MM, and apply padding to single digits
  return pad(localHours) + ':' + pad(utcMinutes);
}


/** 
 * Determine if the input epoch time is a solstice
 * @param {number} epochSec - The epoch time in seconds
 * @return {boolean} - True if the epoch time is a solstice, false otherwise
 */
export function isSolstice(epochSec) {
  const epochTime = epochSec * 1000;
  let d = new Date(epochTime);
  let year = d.getFullYear();
  let mdy = pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '-' + year;
  return (mdy == solstice[year]['summerSolstice'] || mdy == solstice[year]['winterSolstice']);
}

/**
 * Determine if the input epoch time is an equinox
 * @param {*} epochSec 
 * @return {boolean} - True if the epoch time is a equinox, false otherwise
 */
export function isEquinox(epochSec) {
  const epochTime = epochSec * 1000;
  let d = new Date(epochTime);
  let year = d.getFullYear();
  let mdy = pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '-' + year;
  return (mdy == solstice[year]['vernalEquinox'] || mdy == solstice[year]['autumnalEquinox']);
}

/**
 * Calculates the percentage of progress along a route for a given location.
 *
 * @param {Array} routeData - Array of GPS coordinates representing the route.
 * @param {Array} currentLocation - GPS coordinate representing the current location.
 * @return {number} - The percentage of progress along the route for the current location.
 * @throws {Error} - Throws an error if the route has fewer than two coordinates.
 */
export function getProgress(routeData, currentLocation) {
  if (routeData.length < 2) throw new Error('Route must consist of at least two coordinates.');

  // Calculate the total distance of the route
  let totalDistance = 0;
  routeData.reduce((prev, curr) => {
    totalDistance += calculateDistance(prev, curr);
    return curr;
  });

  let minDistanceToRoute = Infinity;
  let accumulatedDistance = 0;
  let progressDistance = 0;

  // Find the closest route point to the current position, and distance to that segment
  for (let i = 1; i < routeData.length; i++) {
    const segmentStart = routeData[i - 1];
    const segmentEnd = routeData[i];
    const segmentDistance = calculateDistance(segmentStart, segmentEnd);
    const closestPoint = findNearestPointOnSegmentToLocation(segmentStart, segmentEnd, currentLocation);
    const distanceToSegment = calculateDistance(closestPoint, currentLocation);

    if (distanceToSegment < minDistanceToRoute) {
      minDistanceToRoute = distanceToSegment;
      progressDistance = accumulatedDistance + calculateDistance(segmentStart, closestPoint);
    }

    accumulatedDistance += segmentDistance;
  }

  // Calculate progress as a percentage of the total route distance
  return (progressDistance / totalDistance);
}

/**
 * Finds the nearest point on a given line segment to a specified location.
 * This function calculates the projection of the point onto the line segment,
 * clamping it to the segment's endpoints if it falls outside the segment.
 *
 * @param {Array<number>} segmentStart - The start point of the segment as an array [x, y].
 * @param {Array<number>} segmentEnd - The end point of the segment as an array [x, y].
 * @param {Array<number>} location - The point for which the nearest point on the segment is sought, as an array [x, y].
 * @return {Array<number>} The nearest point on the segment to the given location, as an array [x, y].
 */
function findNearestPointOnSegmentToLocation(segmentStart, segmentEnd, location) {
  const atob = { x: segmentEnd[0] - segmentStart[0], y: segmentEnd[1] - segmentStart[1] };
  const atop = { x: location[0] - segmentStart[0], y: location[1] - segmentStart[1] };
  const len = atob.x * atob.x + atob.y * atob.y;
  const dot = atop.x * atob.x + atop.y * atob.y;
  const t = Math.min(1, Math.max(0, dot / len));
  return [segmentStart[0] + atob.x * t, segmentStart[1] + atob.y * t];
}

/**
 * Calculates the distance between two GPS coordinates using the Haversine formula.
 *
 * @param {Array} coord1 - The first GPS coordinate.
 * @param {Array} coord2 - The second GPS coordinate.
 * @return {number} - The distance between the two coordinates in kilometers.
 */
export function calculateDistance(coord1, coord2) {
  // Convert latitude and longitude degrees to radians
  const toRadians = (deg) => deg * (Math.PI / 180);

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(coord2[0] - coord1[0]);
  const dLon = toRadians(coord2[1] - coord1[1]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1[0])) *
    Math.cos(toRadians(coord2[0])) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in kilometers

  return distance;
}

/**
 * Updates the average calculation for the input key which can be a boat or a port on a route. 
 * Leverages the StorageManager to persist the average data from one restart to the next.
 * @param key Boat or port that is being updated.
 * @param value Current value of the departure delay to use for updating average.
 * @return the updated average delay time.
 */
export function updateAverage(key, value) {
  let average = value;
  let count = 1;

  let delay = storage.getDelay(key);

  if (delay) {
    count = delay['count'];
    average = Math.trunc((delay['average'] * count + average) / ++count);
  } else {
    delay = {};
  }

  delay['average'] = average;
  delay['count'] = count;
  storage.setDelay(key, delay);
  logger.debug("Updated average departure delay for: " + key + " to: " + JSON.stringify(delay));
  return average;
}   

/** 
 * Get the average value from storage for the input key
 */
export function getAverage(key) {
  const delay = storage.getDelay(key);
  if (delay) {
    return delay['average'];
  } else {
    return 0;
  }
}

/**
 * Compute the route from the arrival and destination port data.
 * @param DepartingTerminalName
 * @param ArrivingTerminalName
 * @return route abbreviation or null if a route cannot be determined.
 */
export function getRouteFromTerminals(DepartingTerminalName, ArrivingTerminalName) {
  let route = null;

  if (DepartingTerminalName && ArrivingTerminalName) {
    for (const routeAbbreviation in routeFTData) {
      if ((routeFTData[routeAbbreviation]['portData']['portES']['TerminalName'] == DepartingTerminalName &&
        routeFTData[routeAbbreviation]['portData']['portWN']['TerminalName'] == ArrivingTerminalName) ||
        (routeFTData[routeAbbreviation]['portData']['portWN']['TerminalName'] == DepartingTerminalName &&
          routeFTData[routeAbbreviation]['portData']['portES']['TerminalName'] == ArrivingTerminalName)) {
        route = routeAbbreviation;
        break;
      }
    }
  }
  return route;
}

/**
 * Compare the Ferry Tempo data retrived from WSDOT with the data we recieved
 * from the AIS server. Print out the deltas. As part of this process, we look 
 * at the route assignments and the boat position assignments and, if they do 
 * not match with the FTServer data, then we return true to let the caller
 * know that we need to update AIS data.
 * @param {object} ferryTempoData - The data from WSDOT
 * @param {object} aisData - The data from the AIS server
 * @return true if the AIS shipp assignments need to be updated
 */
export function compareAISData(ferryTempoData, aisData) {
  let updateNeeded = false;
  let updatedBoatAssignments = {};
  for (const routeId in ferryTempoData) {
    const ferryTempBoatData = ferryTempoData[routeId]['boatData'];
    const aisBoatData = aisData[routeId]['boatData'];
    logger.debug(`Comparing route: ${routeId}`);

    const boatIds = ['boat1', 'boat2'];
    let ftCount = 0;
    let aisCount = 0;
    for (const boatId of boatIds) {
      if (ferryTempBoatData.hasOwnProperty(boatId)) {
        ftCount++;
      }
      if (aisData[routeId]['boatData'].hasOwnProperty(boatId)) {
        aisCount++;
      }
    }
    if (ftCount != aisCount) {
      updateNeeded = true; // because we have a boat misassignment
      logger.info(`Boat count mismatch for route: ${routeId}. FT: ${ftCount}, AIS: ${aisCount}`);
    }
    if (aisCount == 0) {
      updatedBoatAssignments[routeId] = getBoatsOnRoute(ferryTempBoatData);
      logger.info(`No AIS boat data for route: ${routeId}`);
      continue;
    }
    try {
      if (ferryTempBoatData.hasOwnProperty('boat1')) {
        // compare the boats by mmsi
        if (aisBoatData.hasOwnProperty['boat1'] && ferryTempBoatData['boat1']['MMSI'] === aisBoatData['boat1']['MMSI']) {
          compareBoats(ferryTempBoatData['boat1'], aisBoatData['boat1']);
        } else if (aisBoatData.hasOwnProperty['boat2'] && ferryTempBoatData['boat1']['MMSI'] === aisBoatData['boat2']['MMSI']) {
          updateNeeded = true; // because boats are assigned to different positions.
          compareBoats(ferryTempBoatData['boat1'], aisBoatData['boat2']);
        }
      }
      // compare the boats by mmsi
      if (ferryTempBoatData.hasOwnProperty('boat2')) {
        if (aisBoatData.hasOwnProperty['boat1'] && ferryTempBoatData['boat2']['MMSI'] === aisBoatData['boat1']['MMSI']) {
          updateNeeded = true; // because boats are assigned to different positions.
          compareBoats(ferryTempBoatData['boat2'], aisBoatData['boat1']);
        } else if (aisBoatData.hasOwnProperty['boat2'] && ferryTempBoatData['boat2']['MMSI'] === aisBoatData['boat2']['MMSI']) {
          compareBoats(ferryTempBoatData['boat2'], aisBoatData['boat2']);
        }
      }
      if (updateNeeded) {
        updatedBoatAssignments[routeId] = getBoatsOnRoute(ferryTempBoatData);
      }
    } catch (error) {
      logger.error(`Error comparing boats for route: ${routeId}.`);
      logger.debug(`FT Data: ${JSON.stringify(ferryTempBoatData)}`);
      logger.debug(`AIS Data: ${JSON.stringify(aisBoatData)}`);
      logger.error(error);
      logger.debug(error.stack);
    }
  }
  return updatedBoatAssignments;
}

/**
 * Compare the data for two different boats.
 * @param {object} boat1 - The data for the first boat
 * @param {object} boat2 - The data for the second boat
 */
function compareBoats(boat1, boat2) {
  const ignoreKeys = ['ArrivalTimeMinus', 'BoatDepartureDelay', 'DepartureDelayAverage', 'BoatETA', 'ScheduledDeparture'];
  const differences = {};
  
  for (let key in boat1) {
      if (ignoreKeys.includes(key)) {
          continue;
      }
      if (boat1.hasOwnProperty(key) && boat2.hasOwnProperty(key)) {
          if (boat1[key] !== boat2[key]) {
              differences[key] = {
                  'FT': boat1[key],
                  'AIS': boat2[key]
              };
          }
      } else {
          differences[key] = {
              'FT': boat1[key],
              'AIs': boat2[key] || "Key missing in AIS data"
          };
      }
  }
  
  for (let key in boat2) {
      if (!boat1.hasOwnProperty(key)) {
          differences[key] = {
              'FT': "Key missing in FerryTempo data",
              'AIS': boat2[key]
          };
      }
  }
  
  logger.debug("Differences between boats: " + JSON.stringify(differences));
  return;
}

/**
 * Get the boat assignment information out of the Ferry Tempo structure. This includes
 * the routes and positions for the specific boats. In order to keep the dataset small,
 * we just send a structure like the following:
 * {
 * "pt-cou": [{ "MMSI": 0,"Position": 1 }, { "MMSI": 0,"Position": 2 }],
 * "sea-br": [{ "MMSI": 0,"Position": 2 }],
 * 
 * @param {object} ferryTempoData - The data from WSDOT
 * @returns {object} - The boat assignment data
 */
export function getBoatAssignments(ferryTempoData) {
  const boatAssignments = {};
  for (const routeId in ferryTempoData) {
    boatAssignments[routeId] = getBoatsOnRoute(ferryTempoData[routeId]['boatData']);
  }
  return boatAssignments;
}

/**
 * Method to pull the boats on a given route and return them in a format
 * similar to the AIS assignment data to be used to update the AIS data.
 * @param {object} FTData - The data from WSDOT
 * @param {string} routeId - The route to get the boats for
 * @return {object} - The boat assignment data
 */
export function getBoatsOnRoute(boatData) {
  const boats = []

  for (const boatId in boatData) {
    boats.push({
      'MMSI': boatData[boatId]['MMSI'],
      'Position': boatData[boatId]['VesselPosition']
    });
  }
  return boats;
}
