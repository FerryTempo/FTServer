/**
 * WSDOTData.js
 * ============
 * Handling WSDOT vessel data from the vessellocations endpoint.
 *
 * WSDOT JSON data specification is located here:
 * https://www.wsdot.wa.gov/ferries/api/vessels/rest/help/operations/GetAllVesselLocations#response-json
 */

let vesselData = {};

export default {

  /**
   * Takes in a new vessel data object and stores it in memory.
   * @param {object} newVesselData - WSDOT vessel data object
   */
  setVesselData: function(newVesselData) {
    // TODO: Validation of newVesselData with error handling
    // if (!newVesselData || !validateWSDOT(newVesselData)) {
    //   return new Error('vesselData.setvesselData called with invalid data.');
    // }

    vesselData = newVesselData;
  },

  /**
   * Returns the stored WSDOT vessel data
   * @return {object} vesselData - WSDOT vessel data stored for debugging
   */
  getVesselData: function() {
    return vesselData;
  },
};
