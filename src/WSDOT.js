/**
 * WSDOTData.js
 * ============
 * Handling WSDOT vessel data from the vessellocations endpoint.
 *
 * WSDOT JSON data specification is located here:
 * https://www.wsdot.wa.gov/ferries/api/vessels/rest/help/operations/GetAllVesselLocations#response-json
 */
import fetch from 'node-fetch';
import FerryTempo from './FerryTempo.js';

let vesselData = {};
const fetchInterval = 5000; // How often to fetch WSDOT data, in ms.

export default {
  // Kick off an interval fetch and subsequent storage of vessel data.
  startFetchInterval: function() {
    console.log(`Fetching vessel data from WSDOT every ${fetchInterval / 1000} seconds.`);
    this.fetchVesselData();
    setInterval(this.fetchVesselData.bind(this), fetchInterval);
  },

  fetchVesselData: function() {
    let status;
    fetch(`https://www.wsdot.wa.gov/ferries/api/vessels/rest/vessellocations?apiaccesscode=${process.env.WSDOT_API_KEY}`)
        .then((res) => {
          status = res.status;
          return res.json();
        })
        .then((json) => {
          console.log('Retrieved WSDOT data.');

          // if the response status is not 200, we ran into an error
          if ( status != 200 ) {
            console.error('Error retrieving data from WSDOT site');
            console.error(json);
          } else {
            // Store the received WSDOT vessel data
            this.setVesselData(json);

            // Process the WSDOT vessel data into FerryTempo
            FerryTempo.processFerryData(this.getVesselData());
          }
        });
  },

  /**
   * Takes in a new vessel data object and stores it in memory.
   * @param {object} newVesselData - WSDOT vessel data object
   */
  setVesselData: function(newVesselData) {
    // TODO: Validation of newVesselData with error handling. https://github.com/FerryTempo/FTServer/issues/20
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
