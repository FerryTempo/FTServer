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
 * @return {number} Epoch value of WSDOTEDate value in seconds
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
