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
        // VesselID,
        VesselName,
        // Mmsi,
        DepartingTerminalID,
        DepartingTerminalName,
        DepartingTerminalAbbrev,
        // ArrivingTerminalID,
        ArrivingTerminalName,
        ArrivingTerminalAbbrev,
        // Latitude,
        // Longitude,
        Speed,
        Heading,
        InService,
        AtDock,
        LeftDock,
        Eta,
        // EtaBasis,
        ScheduledDeparture,
        OpRouteAbbrev,
        VesselPositionNum,
        // SortSeq,
        // ManagedBy,
        // TimeStamp
      } = vessel;


      /**
       * Converts time value from WSDOT format to seconds from the current time.
       * Returns number of seconds either positive (future) or negative (past).
       * @param {string} dateString WSDOT format date in the format "/Date({epoch}-{timezone offset})/"
       * @return {number} seconds from now
       */
      const getSecondsFromNow = function(dateString) {
        if (!dateString) return;

        // Extract dateString as epoch integer
        const epoch = parseInt(dateString.substring(dateString.lastIndexOf('(') + 1, dateString.lastIndexOf('-')));

        // Subtract the dateString date from the current date/time
        const seconds = (new Date(epoch) - new Date());

        return seconds;
      };

      // TODO: Add error handling for OpRouteAbbrev as it is supposedly optional
      const routeAbbreviation = OpRouteAbbrev[0];

      // Check if this is a vessel we want to process
      if (routeAbbreviation && ferryTempoData[routeAbbreviation]) {
        // Determine route side (ES vs WN)
        // TODO: Confirm DepartingTerminal is basis for routeSide
        let routeSide;
        if (ferryTempoData[routeAbbreviation]['portES']['TerminalID'] == DepartingTerminalID) {
          routeSide = 'portES';
        } else if (ferryTempoData[routeAbbreviation]['portWN']['TerminalID'] == DepartingTerminalID) {
          routeSide = 'portWN';
        } else {
          console.log('Weird mapping detected when determining route side for ' + routeAbbreviation,
              DepartingTerminalID, ferryTempoData[routeAbbreviation]['portES']['TerminalID'],
              ferryTempoData[routeAbbreviation]['portWN']['TerminalID']);
          throw new Error();
        }

        // Set boatData
        ferryTempoData[routeAbbreviation]['boatData'][`boat${VesselPositionNum}`] = {
          'VesselPosition': VesselPositionNum,
          'VesselName': VesselName,
          'InService': InService,
          'OnDuty': !!(InService && ArrivingTerminalAbbrev),
          'AtDock': AtDock,
          'ScheduledDeparture': getSecondsFromNow( ScheduledDeparture ),
          'LeftDock': getSecondsFromNow( LeftDock ),
          'BoatDepartureDelay': 0, // TODO: Implement departure delay tracking for average
          'Direction': null, // TODO: Determine direction
          'Progress': null, // TODO: Implement progress algorithm
          'DepartingTerminalName': DepartingTerminalName,
          'DepartingTermnialAbbrev': DepartingTerminalAbbrev,
          'ArrivingTerminalName': ArrivingTerminalName,
          'ArrivingTerminalAbbrev': ArrivingTerminalAbbrev,
          'Speed': Speed,
          'Heading': Heading,
          'BoatETA': getSecondsFromNow( Eta ),
        };

        // Set port data
        ferryTempoData[routeAbbreviation][routeSide] = {
          'BoatAtDock': null, // TODO: determine BoatAtDock
          'NextScheduledSailing': null, // TODO: determine NextScheduledSailing
          'PortDepartureDelay': null, // TODO: determine PortDepartureDelay
          'PortETA': null, // TODO: determine PortETA
          'PortScheduleList': null, // TODO: determine PortScheduleList
          ...ferryTempoData[routeAbbreviation][routeSide],
        };
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
