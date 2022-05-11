/**
 * FTData.js
 * ============
 * Handles Ferry Tempo data, including conversion from WSDOT vessel data.
 * Manages and updates data object seen in "./InitialRouteData.json".
 */

import { readFileSync } from 'fs';

// Initialize the FerryTempoData object with fixed data object
const ferryTempoData = JSON.parse(readFileSync('src/RouteMap.json'));

export default {
  /**
   * Crunches the ferry data into the proper Ferry Tempo format.
   * @param {object} newFerryData - VesselData object containing updated WSDOT ferry data
   */
  processFerryData: function(newFerryData) {
    // Loop through all ferry data looking for matching routes
    for (const vessel of newFerryData) {
      const {
        VesselID,
        VesselName,
        Mmsi,
        DepartingTerminalID,
        DepartingTerminalName,
        DepartingTerminalAbbrev,
        ArrivingTerminalID,
        ArrivingTerminalName,
        ArrivingTerminalAbbrev,
        Latitude,
        Longitude,
        Speed,
        Heading,
        InService,
        AtDock,
        LeftDock,
        Eta,
        EtaBasis,
        ScheduledDeparture,
        OpRouteAbbrev,
        VesselPositionNum,
        SortSeq,
        ManagedBy,
        TimeStamp
      } = vessel;

      // TODO: Add error handling for OpRouteAbbrev as it is supposedly optional
      const routeAbbrev = OpRouteAbbrev[0];

      // Check if this is a vessel we want to process
      if (routeAbbrev && ferryTempoData[routeAbbrev]) {
        
        // Set boatData
        ferryTempoData[routeAbbrev]['boatData'][`boat${VesselPositionNum}`] = {
          "VesselPosition": VesselPositionNum,
          "VesselName": VesselName,
          "InService": InService,
          "OnDuty": !!(InService && ArrivingTerminalAbbrev),
          "AtDock": AtDock,
          "ScheduledDeparture": ScheduledDeparture, // TODO: Convert to seconds
          "LeftDock": LeftDock, // TODO: Convert to seconds
          "BoatDepartureDelay": 0, // TODO: Implement departure delay tracking for average
          "Direction": null, // TODO: Determine direction
          "Progress": null, // TODO: Implement progress algorithm
          "DepartingTerminalName": DepartingTerminalName,
          "DepartingTermnialAbbrev": DepartingTerminalAbbrev,
          "ArrivingTerminalName": ArrivingTerminalName,
          "ArrivingTerminalAbbrev": ArrivingTerminalAbbrev,
          "Speed": Speed,
          "Heading": Heading,
          "BoatETA": Eta // TODO: Convert to seconds
        };

        // Set port data
        // if (ferryTempoData[routeAbbrev]["portES"]["TerminalID"] ==)
        // ferryTempoData[routeAbbrev][ROUTE_SIDE] = {
        //   "BoatAtDock": null,
        //   "NextScheduledSailing": null, 
        //   "PortDepartureDelay": null,
        //   "PortETA": null,
        //   "PortScheduleList": null
        // };
      }
    }
  },

  /**
   * Provides Ferry Tempo route data. Providing a routeAbbreviation string will filter to just one route.
   * Without a routeAbbrevation, the full ferryTempoData object is returned.
   * @param {string} routeAbbreviation - Route abbreviations as established by WSDOT standard
   * @return {object} ferryTempoData - Ferry Tempo object containing schema format data
   */
  getRouteData: function(routeAbbreviation) {
    if (!ferryTempoData[routeAbbreviation]) {
      console.log(`Unknown route requested: "${routeAbbreviation}"  Returning all vesselData.`);
      return ferryTempoData;
    }

    return ferryTempoData[routeAbbreviation];
  },
};
