/**
 * FTData.js
 * ============
 * Handles Ferry Tempo data, including conversion from WSDOT vessel data.
 * Manages and updates data object seen in "./InitialRouteData.json".
 */

import { readFileSync } from 'fs';
import { getEpochSecondsFromWSDOT, getSecondsFromNow, getRouteSide } from './Utils.js';

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
    // TODO: Convert to Declan algorithm. https://github.com/FerryTempo/FTServer/issues/3
    if (AtDock || !epochLeftDock || !epochEta) return 0;

    const currentRunDuration = epochEta - epochLeftDock;

    return ((Date.now() / 1000) - epochLeftDock) / currentRunDuration;
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
      const {
        VesselName,
        DepartingTerminalID,
        DepartingTerminalName,
        DepartingTerminalAbbrev,
        ArrivingTerminalName,
        ArrivingTerminalAbbrev,
        Speed,
        Heading,
        InService,
        AtDock,
        LeftDock,
        Eta,
        ScheduledDeparture,
        OpRouteAbbrev,
        VesselPositionNum,
      } = vessel;

      // TODO: Add error handling for OpRouteAbbrev as it is supposedly optional. https://github.com/FerryTempo/FTServer/issues/18
      const routeAbbreviation = OpRouteAbbrev[0];

      // Check if this is a vessel we want to process.
      if (InService && routeAbbreviation && routeMap[routeAbbreviation]) {
        const epochScheduledDeparture = getEpochSecondsFromWSDOT( ScheduledDeparture );
        const epochEta = getEpochSecondsFromWSDOT( Eta );
        const epochLeftDock = getEpochSecondsFromWSDOT( LeftDock );

        const routeSide = getRouteSide(routeMap, routeAbbreviation, DepartingTerminalID);

        // Determine BoatDepartureDelay.
        const boatDelay = (epochScheduledDeparture && epochLeftDock) ?
          (epochLeftDock - epochScheduledDeparture) :
          0;

        // Set boatData.
        updatedFerryTempoData[routeAbbreviation]['boatData'][`boat${VesselPositionNum}`] = {
          ArrivalTimeMinus: getSecondsFromNow(Eta),
          ArrivedDock: 0, // TODO https://github.com/FerryTempo/FTServer/issues/7
          ArrivingTerminalAbbrev,
          ArrivingTerminalName,
          AtDock: AtDock,
          DepartingTerminalAbbrev,
          DepartingTerminalName,
          DepartureDelay: boatDelay,
          DepartureDelayAverage: 0, // TODO https://github.com/FerryTempo/FTServer/issues/8
          Direction: routeSide === 'portES' ? 'ES' : 'WN',
          EstimatedArrivalTime: epochEta,
          Heading,
          InService,
          LeftDock: epochLeftDock,
          OnDuty: !!(InService && ArrivingTerminalAbbrev),
          Progress: this.getProgress( AtDock, epochEta, epochLeftDock ),
          ScheduledDeparture: epochScheduledDeparture,
          Speed,
          StopTimer: 0, // TODO https://github.com/FerryTempo/FTServer/issues/9
          VesselName,
          VesselPosition: 0, // TODO https://github.com/FerryTempo/FTServer/issues/10
          VesselPositionNum,
        };

        // Set portData.
        updatedFerryTempoData[routeAbbreviation]['portData'][routeSide] = {
          BoatAtDock: DepartingTerminalAbbrev && AtDock && InService,
          BoatAtDockName: [''], // TODO https://github.com/FerryTempo/FTServer/issues/11
          NextScheduledSailing: 0, // TODO https://github.com/FerryTempo/FTServer/issues/12
          PortArrivalTimeMinus: getSecondsFromNow(Eta),
          PortDepartureDelay: 0, // TODO https://github.com/FerryTempo/FTServer/issues/13
          PortDepartureDelayAverage: 0, // TODO https://github.com/FerryTempo/FTServer/issues/14
          PortEstimatedArrivalTime: epochEta,
          PortLastArrived: 0, // TODO https://github.com/FerryTempo/FTServer/issues/15
          PortSheduleList: [0], // TOOO https://github.com/FerryTempo/FTServer/issues/16
          PortStopTimer: 0, // TODO https://github.com/FerryTempo/FTServer/issues/17
          ...routeMap[routeAbbreviation]['portData'][routeSide],
        };

        // Set update time.
        updatedFerryTempoData[routeAbbreviation]['lastUpdate'] = Date.now() / 1000;
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
