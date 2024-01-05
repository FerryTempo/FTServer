/**
 * Converts time value from WSDOT format to seconds from the current time.
 * Returns number of seconds either positive (future) or negative (past).
 * @param {string} dateString WSDOT format date in the format "/Date({epoch}-{timezone offset})/"
 * @return {number} seconds from now
 */
export const getSecondsFromNow = function(dateString) {
  if (!dateString) return 0;

  // Extract dateString as epoch integer
  const epoch = getEpochSecondsFromWSDOT(dateString);

  // Subtract the dateString date from the current date/time.
  const secondsFromNow = Math.round((new Date(epoch) - (new Date() / 1000)));

  return secondsFromNow;
};

/**
 * Converts the WSDOT-provided "/Date({epoch}-{timezone offset})/" string to an epoch seconds value.
 * @param {string} WSDOTDate
 * @return {number} Epoch value of WSDOTDate value in seconds
 */
export const getEpochSecondsFromWSDOT = function(WSDOTDate) {
  if (!WSDOTDate) return 0;

  // TODO: Check format of string to ensure compatibility https://github.com/FerryTempo/FTServer/issues/19
  return parseInt(WSDOTDate.substring(WSDOTDate.lastIndexOf('(') + 1, WSDOTDate.lastIndexOf('-'))) / 1000;
};

export const getRouteSide = function(routeMap, routeAbbreviation, DepartingTerminalID) {
  // Determine route side (ES vs WN).
  // Uses DepartingTerminal for determination since it is non-nullable.
  let routeSide;
  if (routeMap[routeAbbreviation]['portData']['portES']['TerminalID'] == DepartingTerminalID) {
    routeSide = 'portES';
  } else if (routeMap[routeAbbreviation]['portData']['portWN']['TerminalID'] == DepartingTerminalID) {
    routeSide = 'portWN';
  } else {
    throw new Error(`Unexpected mapping detected when determining route side for routeAbbreviation 
            "${routeAbbreviation}", DepartingTerminalID "${DepartingTerminalID}"`);
  }
  return routeSide;
};

export const getCurrentEpochSeconds = function() {
  return Math.floor(Date.now() / 1000);
};

/**
 * Calculates the percentage of progress along a route for a given location.
 *
 * @param {Array} routeData - Array of GPS coordinates representing the route.
 * @param {Array} currentLocation - GPS coordinate representing the current location.
 * @return {number} - The percentage of progress along the route for the current location.
 * @throws {Error} - Throws an error if the route has fewer than two coordinates.
 */
export const getProgress = (routeData, currentLocation) => {
  if (routeData.length < 2) {
    throw new Error('Route should have at least two coordinates');
  }

  const totalDistance = calculateTotalDistance(routeData);
  const currentDistance = calculateDistance(routeData[0], currentLocation);

  // Calculate the percentage of progress
  const progressPercentage = (currentDistance / totalDistance) * 100;

  return progressPercentage;
};

/**
 * Calculates the total distance along a route by summing the distances between consecutive coordinates.
 *
 * @param {Array} route - Array of GPS coordinates representing the route.
 * @return {number} - The total distance along the route in kilometers.
 */
export const calculateTotalDistance = (route) => {
  let totalDistance = 0;

  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(route[i], route[i + 1]);
  }

  return totalDistance;
};

/**
 * Calculates the distance between two GPS coordinates using the Haversine formula.
 *
 * @param {Array} coord1 - The first GPS coordinate.
 * @param {Array} coord2 - The second GPS coordinate.
 * @return {number} - The distance between the two coordinates in kilometers.
 */
export const calculateDistance = (coord1, coord2) => {
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
};

/**
 * Converts degrees to radians.
 *
 * @param {number} degrees - The angle in degrees.
 * @return {number} - The equivalent angle in radians.
 */
export const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};
