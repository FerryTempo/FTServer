/**
 * Converts time value from WSDOT format to seconds from the current time.
 * Returns number of seconds either positive (future) or negative (past).
 * @param {string} dateString WSDOT format date in the format "/Date({epoch}-{timezone offset})/"
 * @return {number} seconds from now
 */
export const getSecondsFromNow = function(dateString) {
    // TODO: Check format of string to ensure compatibility
    if (!dateString) return;

    // Extract dateString as epoch integer
    const epoch = parseInt(dateString.substring(dateString.lastIndexOf('(') + 1, dateString.lastIndexOf('-')));

    // Subtract the dateString date from the current date/time and convert to seconds
    const seconds = Math.round( (new Date(epoch) - new Date()) / 1000 );

    return seconds;
};