/**
 * Utils.js
 * ============
 * Collection of utilities used by the FTServer application
 */
import Logger from './Logger.js';
const logger = new Logger();

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
 * Return the proived epoch time value into a string date for use in logging and debugging
 * @return {string} The input epoch time converted to human readable format
 */
export function getHumanDateFromEpochSeconds(epochSec) {
  function pad(n) {return n<10 ? '0'+n : n}
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
