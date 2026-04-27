/**
 * WSDOTData.js
 * ============
 * Handling WSDOT vessel data from the vessellocations endpoint.
 *
 * WSDOT JSON data specification is located here:
 * https://www.wsdot.wa.gov/ferries/api/vessels/rest/help/operations/GetAllVesselLocations#response-json
 */
import fetch from 'node-fetch';
import routeFTData from '../data/RouteFTData.js';

export const fetchVesselData = async function() {
  return fetch(`https://www.wsdot.wa.gov/ferries/api/vessels/rest/vessellocations?apiaccesscode=${process.env.WSDOT_API_KEY}`)
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }

        return response.json();
      });
};

export const fetchScheduleData = async function(tripDate) {
  const routeScheduleRequests = Object.entries(routeFTData).map(([routeAbbreviation, routeData]) => {
    const routeId = routeData.routeID;
    const scheduleUrl = `https://www.wsdot.wa.gov/ferries/api/schedule/rest/schedule/${tripDate}/${routeId}?apiaccesscode=${process.env.WSDOT_API_KEY}`;

    return fetch(scheduleUrl)
        .then((response) => {
          if (!response.ok) {
            throw Error(response.statusText);
          }

          return response.json();
        })
        .then((scheduleData) => [routeAbbreviation, scheduleData]);
  });

  const routeSchedules = await Promise.all(routeScheduleRequests);
  return Object.fromEntries(routeSchedules);
};
