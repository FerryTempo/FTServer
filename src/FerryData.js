/**
 * FerryData.js
 * ============
 * Taking in WSDOT data and providing FerryTempo data.
 */

var ferryData = {};
var ferryTempoData = {};

export default {
  /**
   * Takes in a new ferry data object, stores it in memory.
   */
  setFerryData: function (newFerryData) {
    ferryData = newFerryData;
    this._processFerryData();
  },

  /**
   * Provides Ferry Tempo route data depending on the provided routeAbbreviation string.
   */
  getRouteData: function (routeAbbreviation) {
    // return ferryTempoData[routeAbbreviation];
    return ferryTempoData;
  },

  /**
   * Crunches the ferry data into the proper Ferry Tempo format.
   */
  _processFerryData: function () {
    const newFerryTempoData = { boatData:{}, portData: {} };
    
    ferryTempoData = ferryData;
  }
};