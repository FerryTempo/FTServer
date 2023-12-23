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
  const secondsFromNow = Math.round( (new Date(epoch) - (new Date() / 1000)));

  return secondsFromNow;
};

/**
 * Converts the WSDOT-provided "/Date({epoch}-{timezone offset})/" string to an epoch seconds value.
 * @param {string} WSDOTDate
 * @return {number} Epoch value of WSDOTEDate value in seconds
 */
export const getEpochSecondsFromWSDOT = function(WSDOTDate) {
  if (!WSDOTDate) return 0;

  // TODO: Check format of string to ensure compatibility
  return parseInt(WSDOTDate.substring(WSDOTDate.lastIndexOf('(') + 1, WSDOTDate.lastIndexOf('-'))) / 1000;
};
