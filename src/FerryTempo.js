/**
 * FTData.js
 * ============
 * Handles Ferry Tempo domain data, including conversion from WSDOT vessel data.
 */
import { getCurrentEpochSeconds, getEpochSecondsFromWSDOT, getHumanDateFromEpochSeconds, getProgress } from './Utils.js';
import routeFTData from '../data/RouteFTData.js';
import routePositionData from '../data/RoutePositionData.js';
import Logger from './Logger.js';

const logger = new Logger();

export default {
  /**
   * Crunches the ferry data into the proper Ferry Tempo format.
   * @param {object} vesselData - VesselData object containing updated WSDOT ferry data
   * @return {object} updated Ferry Tempo data object.
   */
  processFerryData: (vesselData) => {
    // Create a fresh ferryTempoData object to fill
    const updatedFerryTempoData = {...routeFTData};

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
        const currentLocation = [Latitude, Longitude];

        let targetRoute;
        let departingPort;
        let arrivingPort;
        let routeData;
        let direction;
        // Determine departing port (portES vs portWN), route data, and direction.
        // RoutePositionData is stored in "West to East" order.
        if (routeFTData[routeAbbreviation]['portData']['portES']['TerminalID'] == DepartingTerminalID) {
          targetRoute = updatedFerryTempoData[routeAbbreviation];
          departingPort = 'portES';
          arrivingPort = 'portWN';
          direction = 'WN';
          // Reverse the route data to match "East to West" direction.
          routeData = routePositionData[routeAbbreviation].toReversed();
        } else if (routeFTData[routeAbbreviation]['portData']['portWN']['TerminalID'] == DepartingTerminalID) {
          targetRoute = updatedFerryTempoData[routeAbbreviation];
          departingPort = 'portWN';
          arrivingPort = 'portES';
          direction = 'ES';
          routeData = routePositionData[routeAbbreviation];
        } else {
          logger.error(`Unexpected mapping detected when determining departing port for routeAbbreviation 
              "${routeAbbreviation}", DepartingTerminalID "${DepartingTerminalID}"`);
          continue;
        }

        // Determine BoatDepartureDelay.
        let boatDelay = 0;
        if (epochScheduledDeparture && epochTimeStamp && (epochTimeStamp > epochScheduledDeparture)) {
          boatDelay = epochTimeStamp - epochScheduledDeparture;
        }

        // Calculate BoatETA as the diference (in seconds) between the ETA provied and now
        let arrivalTimeEta = 0;
        if (epochEta != 0 && epochEta > getCurrentEpochSeconds()) {
          arrivalTimeEta = epochEta - getCurrentEpochSeconds();
        } else if (epochEta != 0) {
          // ETA is negative typically when the boat is late arriving since the ETA doesn't get recalculated by WSDOT.
          // When we see this, we will return 0 but log it for debugging purposes. 
          logger.debug('BoatEta (' + epochEta + ') is in the past (' + VesselName + ') at (' + getCurrentEpochSeconds() + '): ' + getHumanDateFromEpochSeconds(epochEta));
        }

        // Calculate the BoatETA as a function of the progress we have made on the journey
        let calcEta = 0;
        if (InService && !AtDock && epochEta != 0 && arrivalTimeEta != 0) {
          calcEta = Math.trunc((epochEta - getEpochSecondsFromWSDOT(LeftDock)) * (1.0 - getProgress(routeData, currentLocation)) );
          //logger.debug('Route [' + DepartingTerminalAbbrev + '-' + ArrivingTerminalAbbrev + '] Delta between reported ETA (' + arrivalTimeEta + ') and boat ETA (' + calcEta + ') is: ' + (arrivalTimeEta - calcEta));
        }

        // Logging ETA as a function of route and boat
        if (InService && !AtDock && epochEta != 0) {
          logger.debug('[' + DepartingTerminalAbbrev + '-' + ArrivingTerminalAbbrev + ']; ' + VesselName + ' ETA: ' + (epochEta - getEpochSecondsFromWSDOT(LeftDock)));
        }

        // Set boatData.
        targetRoute['boatData'][`boat${VesselPositionNum}`] = {
          'ArrivingTerminalAbbrev': ArrivingTerminalAbbrev,
          'ArrivingTerminalName': ArrivingTerminalName,
          'AtDock': AtDock,
          'BoatDepartureDelay': boatDelay,
          'BoatETA': arrivalTimeEta,
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
        targetRoute['portData'][departingPort].BoatAtDock = DepartingTerminalAbbrev && AtDock && InService;
        targetRoute['portData'][arrivingPort].PortETA = arrivalTimeEta;
      }
    }

    return updatedFerryTempoData;
  },
};

/**
 * Debugs the progress calculation along a route based on the provided direction and position.
 * This function selects the appropriate route points based on the given direction, calculates
 * the progress of the given position along the route, and returns debugging information including
 * the used route points, calculated progress, and the direction.
 *
 * @param {string} routeId - The identifier of the route within the `routePositionData` object.
 * @param {'WN' | string} direction - The direction of travel along the route. 'WN' indicates reverse direction.
 * @param {Array<number>} position - The current position for which progress needs to be calculated,
 *  as an array [latitude, longitude].
 * @return {Object} An object containing the stringified route points used for the calculation,
 *  the calculated progress percentage, and the direction.
 *  The structure is: { routePoints: string, progress: number, direction: string }.
 */
export function debugProgress(routeId, direction, position) {
  const routePoints = direction === 'WN' ? routePositionData[routeId].toReversed() : routePositionData[routeId];

  const progress = getProgress(routePoints, position);

  return {routePoints, progress};
}
