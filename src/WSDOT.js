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

async function fetchWSDOTJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response.json();
}

export const fetchVesselData = async function() {
  return fetchWSDOTJson(`https://www.wsdot.wa.gov/ferries/api/vessels/rest/vessellocations?apiaccesscode=${process.env.WSDOT_API_KEY}`);
};

export const fetchScheduleData = async function(tripDate) {
  const routeScheduleRequests = Object.entries(routeFTData).map(([routeAbbreviation, routeData]) => {
    const routeId = routeData.routeID;
    const scheduleUrl = `https://www.wsdot.wa.gov/ferries/api/schedule/rest/schedule/${tripDate}/${routeId}?apiaccesscode=${process.env.WSDOT_API_KEY}`;

    return fetchWSDOTJson(scheduleUrl)
        .then((scheduleData) => [routeAbbreviation, scheduleData]);
  });

  const routeSchedules = await Promise.all(routeScheduleRequests);
  return Object.fromEntries(routeSchedules);
};

export const fetchReferenceScheduleRoutes = async function() {
  return fetchWSDOTJson(`https://www.wsdot.wa.gov/ferries/api/schedule/rest/schedroutes?apiaccesscode=${process.env.WSDOT_API_KEY}`);
};

export const fetchReferenceSailings = async function(schedRouteId) {
  return fetchWSDOTJson(`https://www.wsdot.wa.gov/ferries/api/schedule/rest/sailings/${schedRouteId}?apiaccesscode=${process.env.WSDOT_API_KEY}`);
};

export const fetchScheduleCacheFlushDate = async function() {
  return fetchWSDOTJson(`https://www.wsdot.wa.gov/ferries/api/schedule/rest/cacheflushdate?apiaccesscode=${process.env.WSDOT_API_KEY}`);
};

export const fetchTerminalBulletinData = async function() {
  return fetchWSDOTJson(`https://www.wsdot.wa.gov/ferries/api/terminals/rest/terminalbulletins?apiaccesscode=${process.env.WSDOT_API_KEY}`);
};

export const fetchTerminalSailingSpaceData = async function() {
  return fetchWSDOTJson(`https://www.wsdot.wa.gov/ferries/api/terminals/rest/terminalsailingspace?apiaccesscode=${process.env.WSDOT_API_KEY}`);
};
