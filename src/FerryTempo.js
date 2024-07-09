/**
 * FTData.js
 * ============
 * Handles Ferry Tempo domain data, including conversion from WSDOT vessel data.
 */
import { getCurrentEpochSeconds, getEpochSecondsFromWSDOT, getHumanDateFromEpochSeconds, getProgress, updateAverage, getAverage } from './Utils.js';
import routeFTData from '../data/RouteFTData.js';
import routePositionData from '../data/RoutePositionData.js';
import Logger from './Logger.js';
import { fetchVesselDetail } from './WSDOT.js';

const logger = new Logger();
const boatArrivalCache = {};

export default {
  /**
   * Crunches the ferry data into the proper Ferry Tempo format.
   * @param {object} vesselData - VesselData object containing updated WSDOT ferry data
   * @return {object} updated Ferry Tempo data object.
   */
  processFerryData: (vesselData) => {
    // Create a fresh ferryTempoData object to fill
    const updatedFerryTempoData = {...routeFTData};

    // Cache to see if we updated a route + direction yet in this loop
    const routeDirCache = {};

    // Loop through all ferry data looking for matching routes
    for (const vessel of vesselData) {
      // TODO: Remove unused values from spread
      const {
        VesselID,
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
        // Undocumented fields that show up in responses
        // VesselWatchShutID,
        VesselWatchShutMsg,
        VesselWatchShutFlag,
        // VesselWatchMsg,
        // VesselWatchStatus
      } = vessel;

      const routeAbbreviation = OpRouteAbbrev[0];
      // Calculating if a boat is on duty by looking at ArrivingTerminalAbbrev. However, sometimes when in dock it takes awhile to show up
      const onDuty = AtDock ? InService : (InService && (ArrivingTerminalAbbrev !== null));

      if (ArrivingTerminalAbbrev === null && InService && !AtDock) {
        logger.debug(VesselName + " has a null ArrivingTerminalAbbrev and is still InService");
      }

      // Check if this is a vessel we want to process, which has to be in service and has to be assigned to a route we care about.
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
        /** Determine departing port (portES vs portWN), route data, and direction.
          * RoutePositionData is stored in "West to East" order.
          * */
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

        // Determine BoatDepartureDelay, which is either (epochLeftDock - epochScheduledDeparture) or (now - epochScheduledDeparture) when in dock
        let boatDelay = 0;
        if (epochLeftDock && epochScheduledDeparture) {
          boatDelay = epochLeftDock - epochScheduledDeparture;
        } else {
          if (epochScheduledDeparture && epochTimeStamp && (epochTimeStamp > epochScheduledDeparture)) {
            boatDelay = epochTimeStamp - epochScheduledDeparture;
          }
        }

        /** Calculate the BoatETA as a function of the progress we have made on the journey. We use this value unless we do not get
        *   a departureTime value from WSDOT for the boat, in wich case we will use the arrivalTimeEta computed from the Eta field and now().
        **/
        let arrivalTimeEta = 0;
        if (!AtDock && epochEta != 0 ) {
          let departureTime = getEpochSecondsFromWSDOT(LeftDock);
          if (departureTime != 0) {
            arrivalTimeEta = Math.trunc((epochEta - departureTime) * (1.0 - getProgress(routeData, currentLocation)));
          } else {
            if (epochEta > getCurrentEpochSeconds()) {
              arrivalTimeEta = epochEta - getCurrentEpochSeconds();
            } else if (epochEta != 0) {
              /** ETA is negative typically when the boat is late arriving since the ETA doesn't get recalculated by WSDOT.
                * When we see this, we will use the value 0 but log it for debugging purposes. 
                */
              logger.debug('BoatEta (' + epochEta + ') is in the past (' + VesselName + ') at (' + getCurrentEpochSeconds() + '): ' + getHumanDateFromEpochSeconds(epochEta));
            }
          }
        }

        // update the boatArrivalCache with the timestamp of the last position update for the vessel. Unset when not at dock.
        let timeAtDock = 0;
        // use a combination of route and terminal since Seattle service multiple routes
        let portKey = routeAbbreviation + DepartingTerminalAbbrev;
        let boatDelayAvg = getAverage(VesselName);
        let portDelayAvg = getAverage(portKey);
        if (AtDock) {
          if (boatArrivalCache[VesselName]) {
            timeAtDock = getCurrentEpochSeconds() - boatArrivalCache[VesselName]
          } else {
            boatArrivalCache[VesselName] = epochTimeStamp;
          }
        } else {
          // if not at the dock, see if there is a value in the cache, which indicates the boat just left.
          if (boatArrivalCache[VesselName]) {
            // boat just left the dock, update the average departure delay for the boat and the port
            boatDelayAvg = updateAverage(VesselName, boatDelay);
            portDelayAvg = updateAverage(portKey, boatDelay);
          }
          boatArrivalCache[VesselName] = null;
        }

        // Set boatData.
        targetRoute['boatData'][`boat${VesselPositionNum}`] = {
          'ArrivalTimeMinus' : arrivalTimeEta,
          'ArrivingTerminalAbbrev': ArrivingTerminalAbbrev,
          'ArrivingTerminalName': ArrivingTerminalName,
          'AtDock': AtDock,
          'BoatDepartureDelay': boatDelay,
          'BoatETA': epochEta,
          'DepartingTerminalName': DepartingTerminalName,
          'DepartingTerminalAbbrev': DepartingTerminalAbbrev,
          'DepartureDelayAverage': boatDelayAvg,
          'Direction': direction,
          'Heading': Heading,
          'InService': InService,
          'LeftDock': epochLeftDock,
          'OnDuty': onDuty,
          'PositionUpdated': epochTimeStamp,
          'Progress': AtDock ? 0 : getProgress(routeData, currentLocation),
          'ScheduledDeparture': epochScheduledDeparture,
          'Speed': Speed,
          'StopTimer': timeAtDock,
          'VesselName': VesselName,
          'VesselPosition': VesselPositionNum,
        };

        // if the VesselWatchShutFlag is non-zero then print out the associated message for the boat
        if (VesselWatchShutFlag != 0) {
          logger.debug(VesselName + ' has message: ' + VesselWatchShutMsg);
        }

        // get boat specific data and compare it to what we have here
        fetchVesselDetail(VesselID)
          .then((vesselDetailData) => {
            const {
              Status
            } = vesselDetailData;
            // status values are documented to be 1 - In Service; 2 - Maintenance; 3 - Out of Service
            if (Status > 2) {
              logger.info('Got vessel status of: ' + Status + ' for vessel: ' + VesselName + '. InService: ' + InService + ', OnDuty: ' + onDuty);
            }
          })
          .catch((error) => logger.error(error));

        // if a boat is not on duty, we do not want to update the port data from that boat's data
        if( !onDuty ) {
          logger.debug(VesselName + 'is out of service, skipping port updates.');
          return;
        }

        /**
         * Sometimes two boats on the same route will have the same departingPort and arrivingPort. In this case, we need to be careful setting
         * the port data. For the departing port, we keep the data if we haven't updated that port already or if the current boat is at dock 
         * (assuming only one boat can be at dock). For the arrival port, we keep the smaller of the two ETA's provided the current is not zero 
         * (which means we do not have an ETA set).
         */
        let routeDirKey = routeAbbreviation + direction;
        if (!routeDirCache[routeDirKey]) {
          targetRoute['portData'][departingPort].BoatAtDock =  AtDock;
          targetRoute['portData'][departingPort].PortDepartureDelay = boatDelay;
          targetRoute['portData'][departingPort].PortStopTimer = timeAtDock;
          targetRoute['portData'][arrivingPort].PortArrivalTimeMinus = arrivalTimeEta;
          targetRoute['portData'][arrivingPort].PortETA = epochEta;
          routeDirCache[routeDirKey] = true;
        } else {
          if (AtDock) {
            targetRoute['portData'][departingPort].BoatAtDock =  AtDock;
            targetRoute['portData'][departingPort].PortDepartureDelay = boatDelay;
            targetRoute['portData'][departingPort].PortStopTimer = timeAtDock;
          }
          if ((arrivalTimeEta > 0) && (arrivalTimeEta < targetRoute['portData'][arrivingPort].PortArrivalTimeMinus)) {
            targetRoute['portData'][arrivingPort].PortArrivalTimeMinus = arrivalTimeEta;
            targetRoute['portData'][arrivingPort].PortETA = epochEta;
          }
        }
        // it is oaky to update the average since this is kept unchanged until a boat leaves the port.
        targetRoute['portData'][departingPort].PortDepartureDelayAverage = portDelayAvg;
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
