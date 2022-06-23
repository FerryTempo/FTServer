/**
 * FTData.js
 * ============
 * Handles Ferry Tempo data, including conversion from WSDOT vessel data.
 * Manages and updates data object seen in "./InitialRouteData.json".
 */

import { readFileSync } from 'fs';
import { getEpochFromWSDOT } from './Utils.js';

const routeMapText = readFileSync('src/RouteMap.json');
// Store fixed route map for reference
const routeMap = JSON.parse(routeMapText);
// Initialize the FerryTempoData object with route data object
let ferryTempoData = JSON.parse(routeMapText);

export default {
  /**
   * Determines the progress of a given boat along its route.
   * @param {boolean} AtDock - Indicates if an in-service vessel is in port.
   * @param {string | null} epochEta - Estimated time of arrival for a given vessel in WSDOT date format.
   * @param {string | null} epochLeftDock - The date and time that the vessel last left the dock.
   *  This value is not present when docked.
   * @return {number} - Progress of the vessel along its route, 0 - 1.
   */
  getProgress: function(AtDock, epochEta, epochLeftDock) {
    if (AtDock || !epochLeftDock || !epochEta) return 0;

    const currentRunDuration = epochEta - epochLeftDock;

    return (Date.now() - epochLeftDock) / currentRunDuration;
  },

  /**
   * Crunches the ferry data into the proper Ferry Tempo format.
   * @param {object} newFerryData - VesselData object containing updated WSDOT ferry data
   */
  processFerryData: function(newFerryData) {
    // Create a fresh ferryTempoData object to fill
    const updatedFerryTempoData = JSON.parse(routeMapText);

    // Loop through all ferry data looking for matching routes
    for (const vessel of newFerryData) {
      // TODO: Remove unused values from spread
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
        TimeStamp,
      } = vessel;

      // TODO: Add error handling for OpRouteAbbrev as it is supposedly optional.
      const routeAbbreviation = OpRouteAbbrev[0];

      // Check if this is a vessel we want to process.
      if (InService && routeAbbreviation && routeMap[routeAbbreviation]) {
        // Convert relevant times to epoch integers.
        const epochScheduledDeparture = getEpochFromWSDOT( ScheduledDeparture );
        const epochEta = getEpochFromWSDOT( Eta );
        const epochLeftDock = getEpochFromWSDOT( LeftDock );
        const epochTimeStamp = getEpochFromWSDOT( TimeStamp );

        // Determine route side (ES vs WN).
        // Uses DepartingTerminal for determination since it is non-nullable.
        let routeSide;
        if (routeMap[routeAbbreviation]['portData']['portES']['TerminalID'] == DepartingTerminalID) {
          routeSide = 'portES';
        } else if (routeMap[routeAbbreviation]['portData']['portWN']['TerminalID'] == DepartingTerminalID) {
          routeSide = 'portWN';
        } else {
          console.log(`Unexpected mapping detected when determining route side for routeAbbreviation 
            "${routeAbbreviation}", DepartingTerminalID "${DepartingTerminalID}"`);
          continue;
        }

        // Determine vessel direction.
        const direction = routeSide === 'portES' ? 'ES' : 'WN';

        // Determine BoatDepartureDelay.
        const boatDelay = (epochScheduledDeparture && epochLeftDock) ?
          (epochLeftDock - epochScheduledDeparture) / 1000 :
          0;

        // Set boatData.
        updatedFerryTempoData[routeAbbreviation]['boatData'][`boat${VesselPositionNum}`] = {
          'ArrivingTerminalAbbrev': ArrivingTerminalAbbrev,
          'ArrivingTerminalName': ArrivingTerminalName,
          'AtDock': AtDock,
          'BoatDepartureDelay': boatDelay,
          'BoatETA': epochEta,
          'DepartingTerminalName': DepartingTerminalName,
          'DepartingTermnialAbbrev': DepartingTerminalAbbrev,
          'Direction': direction,
          'Heading': Heading,
          'InService': InService,
          'LeftDock': epochLeftDock,
          'OnDuty': !!(InService && ArrivingTerminalAbbrev),
          'PositionUpdated': epochTimeStamp,
          'Progress': this.getProgress( AtDock, epochEta, epochLeftDock ),
          'ScheduledDeparture': epochScheduledDeparture,
          'Speed': Speed,
          'VesselName': VesselName,
          'VesselPosition': VesselPositionNum,
        };

        // Set portData.
        updatedFerryTempoData[routeAbbreviation]['portData'][routeSide] = {
          'BoatAtDock': DepartingTerminalAbbrev && AtDock && InService,
          'NextScheduledSailing': epochScheduledDeparture,
          'PortDepartureDelay': 0, // TODO: Implement departure delay tracking for average
          'PortETA': epochEta,
          ...routeMap[routeAbbreviation]['portData'][routeSide],
        };

        // Set update time.
        updatedFerryTempoData[routeAbbreviation]['lastUpdate'] = Date.now();
      }

      ferryTempoData = updatedFerryTempoData;
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
