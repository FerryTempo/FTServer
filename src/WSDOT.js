/**
 * WSDOTData.js
 * ============
 * Handling WSDOT vessel data from the vessellocations endpoint.
 *
 * WSDOT JSON data specification is located here:
 * https://www.wsdot.wa.gov/ferries/api/vessels/rest/help/operations/GetAllVesselLocations#response-json
 */
import fetch from 'node-fetch';

export const fetchVesselData = async function() {
  return fetch(`https://www.wsdot.wa.gov/ferries/api/vessels/rest/vessellocations?apiaccesscode=${process.env.WSDOT_API_KEY}`)
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }

        return response.json();
      });
};

export const fetchVesselDetail = async function(vesselId) {
  return fetch(`https://www.wsdot.wa.gov/ferries/api/vessels/rest/vesselbasics/${vesselId}?apiaccesscode=${process.env.WSDOT_API_KEY}`)
  .then((response) => {
    if (!response.ok) {
      throw Error(response.statusText);
    }

    return response.json();
  });
};
