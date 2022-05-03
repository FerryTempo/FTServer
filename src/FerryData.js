/**
 * FerryData.js
 * ============
 * Taking in WSDOT data and providing FerryTempo data.
 *
 * WSDOT JSON data specification is located here:
 * https://www.wsdot.wa.gov/ferries/api/vessels/rest/help/operations/GetAllVesselLocations#response-json
 */

// import { readFileSync } from 'fs';
// import Ajv from 'ajv';
// Initialize JSON Schema validators
// const ajv = new Ajv();
// const validateWSDOT = ajv.compile({});
// const FerryTempoSchema = JSON.parse(readFileSync('reference/FerryTempoSchema.json'));
// const validateFerryTempo = ajv.compile(FerryTempoSchema);

let ferryData = {};
let ferryTempoData = {};

export default {
  /**
   * Takes in a new ferry data object, stores it in memory.
   * @param {object} newFerryData - WSDOT ferry data object
   */
  setFerryData: function(newFerryData) {
    // TODO: Validation of newFerryData with error handling
    // if (!newFerryData || !validateWSDOT(newFerryData)) {
    //   return new Error('FerryData.setFerryData called with invalid data.');
    // }

    ferryData = newFerryData;
    this._processFerryData();
  },

  /**
   * Returns the stored WSDOT ferry data
   * @return {object} ferryData - WSDOT ferry data stored for debugging
   */
  getFerryData: function() {
    return ferryData;
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
