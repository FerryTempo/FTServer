/**
 * FerryData.js
 * ============
 * Taking in WSDOT data and providing FerryTempo data.
 *
 * WSDOT JSON data specification is located here:
 * https://www.wsdot.wa.gov/ferries/api/vessels/rest/help/operations/GetAllVesselLocations#response-json
 */

// TODO: Type WSDOT object for newFerryData
// TODO: Type route abbreviations for routeAbbreviation
// TODO: Type Ferry Tempo data object for ferryTempoData

let ferryData = {};
let ferryTempoData = {};

export default {
  /**
   * Takes in a new ferry data object, stores it in memory.
   * @param {object} newFerryData - WSDOT ferry data object
   */
  setFerryData: function(newFerryData) {
    ferryData = newFerryData;
    this._processFerryData();
  },

  /**
   * Provides Ferry Tempo route data depending on the provided routeAbbreviation string.
   * @param {string} routeAbbreviation - Route abbreviations as established by WSDOT standard
   * @return {object} ferryTempoData - Ferry Tempo object containing schema format data
   */
  getRouteData: function(routeAbbreviation) {
    // return ferryTempoData[routeAbbreviation];
    return ferryTempoData;
  },

  /**
   * Crunches the ferry data into the proper Ferry Tempo format.
   */
  _processFerryData: function() {
    // const newFerryTempoData = {boatData: {}, portData: {}};

    ferryTempoData = ferryData;
  },
};
