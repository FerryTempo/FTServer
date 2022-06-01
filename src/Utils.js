/**
 * Converts time value from WSDOT format to seconds from the current time.
 * Returns number of seconds either positive (future) or negative (past).
 * @param {string} dateString WSDOT format date in the format "/Date({epoch}-{timezone offset})/"
 * @return {number} seconds from now
 */
export const getSecondsFromNow = function(dateString) {
  if (!dateString) return;

  // Extract dateString as epoch integer
  const epoch = getEpochFromWSDOT(dateString);

  // Subtract the dateString date from the current date/time and convert to seconds
  const seconds = Math.round( (new Date(epoch) - new Date()) / 1000 );

  return seconds;
};

/**
 * Converts the WSDOT-provided "/Date({epoch}-{timezone offset})/" string to an epoch integer value.
 * @param {string} WSDOTDate
 * @return {number} Epoch value of WSDOTEDate value
 */
export const getEpochFromWSDOT = function(WSDOTDate) {
  if (!WSDOTDate) return null;

  // TODO: Check format of string to ensure compatibility
  return parseInt(WSDOTDate.substring(WSDOTDate.lastIndexOf('(') + 1, WSDOTDate.lastIndexOf('-')));
};
