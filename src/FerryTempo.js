/**
 * FTData.js
 * ============
 * Handles Ferry Tempo data, including conversion from WSDOT vessel data.
 * Manages and updates data object seen in "./InitialRouteData.json".
 */
import { fileURLToPath } from 'url';
import path from 'path';
import { readFileSync } from 'fs';
import { getEpochSecondsFromWSDOT, getProgress } from './Utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routeFTText = readFileSync(path.resolve(__dirname, '../data/RouteFTData.json'));
// Store fixed route map for reference
const routeFTData = JSON.parse(routeFTText);
// Initialize the FerryTempoData object with route data object
let ferryTempoData = JSON.parse(routeFTText);
// Fetch route position data - NOTE: RoutePositionData is stored in "East to West" order.
const routePositionText = readFileSync(path.resolve(__dirname, '../data/RoutePositionData.json'));
const routePositionData = JSON.parse(routePositionText);

export default {
  getRouteData: () => ferryTempoData,
  /**
   * Crunches the ferry data into the proper Ferry Tempo format.
   * @param {object} newFerryData - VesselData object containing updated WSDOT ferry data
   */
  processFerryData: (newFerryData) => {
    // Create a fresh ferryTempoData object to fill
    const updatedFerryTempoData = JSON.parse(routeFTText);

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
        Latitude,
        Longitude,
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
      if (InService && routeAbbreviation && routeFTData[routeAbbreviation] && routePositionData[routeAbbreviation]) {
        // Convert relevant times to epoch integers.
        const epochScheduledDeparture = getEpochSecondsFromWSDOT(ScheduledDeparture);
        const epochEta = getEpochSecondsFromWSDOT(Eta);
        const epochLeftDock = getEpochSecondsFromWSDOT(LeftDock);
        const epochTimeStamp = getEpochSecondsFromWSDOT(TimeStamp);

        let departingPort;
        let routeData;
        let direction;
        // Determine departing port (portES vs portWN), route data, and direction.
        // RoutePositionData is stored in "East to West" order.
        if (routeFTData[routeAbbreviation]['portData']['portES']['TerminalID'] == DepartingTerminalID) {
          departingPort = 'portES';
          direction = 'WN';
          routeData = routePositionData[routeAbbreviation];
        } else if (routeFTData[routeAbbreviation]['portData']['portWN']['TerminalID'] == DepartingTerminalID) {
          departingPort = 'portWN';
          direction = 'ES';
          // Reverse the route data to match "West to East" direction.
          routeData = routePositionData[routeAbbreviation].toReversed();
        } else {
          console.log(`Unexpected mapping detected when determining departing port for routeAbbreviation 
              "${routeAbbreviation}", DepartingTerminalID "${DepartingTerminalID}"`);
          continue;
        }

        // Determine BoatDepartureDelay.
        const boatDelay = (epochScheduledDeparture && epochLeftDock) ?
          (epochLeftDock - epochScheduledDeparture) / 1000 :
          0;

        const currentLocation = [Latitude, Longitude];

        // Set boatData.
        updatedFerryTempoData[routeAbbreviation]['boatData'][`boat${VesselPositionNum}`] = {
          'ArrivingTerminalAbbrev': ArrivingTerminalAbbrev,
          'ArrivingTerminalName': ArrivingTerminalName,
          'AtDock': AtDock,
          'BoatDepartureDelay': boatDelay,
          'BoatETA': epochEta,
          'DepartingTerminalName': DepartingTerminalName,
          'DepartingTerminalAbbrev': DepartingTerminalAbbrev,
          'Direction': direction,
          'Heading': Heading,
          'InService': InService,
          'LeftDock': epochLeftDock,
          'OnDuty': !!(InService && ArrivingTerminalAbbrev),
          'PositionUpdated': epochTimeStamp,
          'Progress': AtDock ? 0 : getProgress(routeData, currentLocation),
          'ScheduledDeparture': epochScheduledDeparture,
          'Speed': Speed,
          'VesselName': VesselName,
          'VesselPosition': VesselPositionNum,
        };

        // Set portData.
        updatedFerryTempoData[routeAbbreviation]['portData'][departingPort] = {
          'BoatAtDock': DepartingTerminalAbbrev && AtDock && InService,
          'NextScheduledSailing': epochScheduledDeparture,
          'PortDepartureDelay': 0, // TODO: Implement departure delay tracking for average
          'PortETA': epochEta,
          ...routeFTData[routeAbbreviation]['portData'][departingPort],
        };

        // Set update time in seconds.
        updatedFerryTempoData[routeAbbreviation]['lastUpdate'] = Math.floor(Date.now() / 1000);
      }

      ferryTempoData = updatedFerryTempoData;
    }
  },
};
