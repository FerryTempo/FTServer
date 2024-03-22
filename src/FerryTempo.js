/**
 * FTData.js
 * ============
 * Handles Ferry Tempo domain data, including conversion from WSDOT vessel data.
 */
import { getEpochSecondsFromWSDOT, getProgress } from './Utils.js';
import routeFTData from '../data/RouteFTData.json' assert { type: "json" };
import routePositionData from '../data/RoutePositionData.json' assert { type: "json" };
export default {
  /**
   * Crunches the ferry data into the proper Ferry Tempo format.
   * @param {object} vesselData - VesselData object containing updated WSDOT ferry data
   * @returns {object} updated Ferry Tempo data object.
   */
  processFerryData: (vesselData) => {
    // Create a fresh ferryTempoData object to fill
    const updatedFerryTempoData = JSON.parse(JSON.stringify(routeFTData));

    // Loop through all ferry data looking for matching routes
    for (const vessel of vesselData) {
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
        // RoutePositionData is stored in "West to East" order.
        if (routeFTData[routeAbbreviation]['portData']['portES']['TerminalID'] == DepartingTerminalID) {
          departingPort = 'portES';
          direction = 'WN';
          // Reverse the route data to match "East to West" direction.
          routeData = routePositionData[routeAbbreviation].toReversed();
        } else if (routeFTData[routeAbbreviation]['portData']['portWN']['TerminalID'] == DepartingTerminalID) {
          departingPort = 'portWN';
          direction = 'ES';
          routeData = routePositionData[routeAbbreviation];
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
          ...routeFTData[routeAbbreviation]['portData'][departingPort],
          'BoatAtDock': DepartingTerminalAbbrev && AtDock && InService,
          'NextScheduledSailing': epochScheduledDeparture,
          'PortDepartureDelay': 0, // TODO: Implement departure delay tracking for average
          'PortETA': epochEta,
        };
      }
    }
    
    return updatedFerryTempoData;
  },
};
