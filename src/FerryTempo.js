/**
 * FTData.js
 * ============
 * Handles Ferry Tempo domain data, including conversion from WSDOT vessel data.
 */
import { 
  getCurrentEpochSeconds, 
  getEpochSecondsFromWSDOT, 
  getHumanDateFromEpochSeconds, 
  getProgress, 
  updateAverage, 
  getAverage, 
  getSailingDayId,
  getRouteFromTerminals 
} from './Utils.js';
import routeFTData from '../data/RouteFTData.js';
import routePositionData from '../data/RoutePositionData.js';
import Logger from './Logger.js';

const logger = new Logger();
const boatArrivalCache = {};
const boatDepartureCache = {};
const portDepartureDelayCache = {};
const vesselCache = {};

const AVERAGE_METRICS = {
  crossingTime: 'CrossingTime',
  boatStopTimer: 'BoatStopTimer',
  portStopTimer: 'PortStopTimer',
};

function getAverageKey(metric, key) {
  return `${metric}:${key}`;
}

function getPortDelayCacheKey(routeAbbreviation, portKey) {
  return `${routeAbbreviation}:${portKey}`;
}

function getPortDelayCacheValue(cacheKey, eventTime) {
  const cachedDelay = portDepartureDelayCache[cacheKey];
  if (!cachedDelay) {
    return null;
  }
  return cachedDelay.sailingDayId === getSailingDayId(eventTime) ? cachedDelay.boatDelay : null;
}

function updatePortDelayCandidate(candidates, routeAbbreviation, portKey, boatDelay, atDock, epochLeftDock, epochTimeStamp) {
  const cacheKey = getPortDelayCacheKey(routeAbbreviation, portKey);
  const nextCandidate = {
    boatDelay,
    atDock,
    eventTime: atDock ? epochTimeStamp : (epochLeftDock || epochTimeStamp),
  };

  const currentCandidate = candidates[cacheKey];
  if (!currentCandidate) {
    candidates[cacheKey] = nextCandidate;
    return;
  }

  if (nextCandidate.atDock && !currentCandidate.atDock) {
    candidates[cacheKey] = nextCandidate;
    return;
  }

  if (nextCandidate.atDock === currentCandidate.atDock && nextCandidate.eventTime >= currentCandidate.eventTime) {
    candidates[cacheKey] = nextCandidate;
  }
}

function applyScheduleData(ferryTempoData, scheduleData, referenceTime, activeScheduledDepartureCandidates) {
  if (!scheduleData) {
    return;
  }

  for (const routeAbbreviation in ferryTempoData) {
    const routeSchedule = scheduleData[routeAbbreviation];
    if (!routeSchedule?.TerminalCombos) {
      continue;
    }

    for (const portKey of ['portWN', 'portES']) {
      const portData = ferryTempoData[routeAbbreviation].portData[portKey];
      const scheduleList = routeSchedule.TerminalCombos
          .filter((terminalCombo) => terminalCombo.DepartingTerminalID === portData.TerminalID)
          .flatMap((terminalCombo) => terminalCombo.Times || [])
          .map((scheduleTime) => getEpochSecondsFromWSDOT(scheduleTime.DepartingTime))
          .filter((departingTime) => departingTime > 0)
          .sort((first, second) => first - second);

      portData.PortScheduleList = scheduleList;
      const scheduleCandidate = scheduleList.find((departingTime) => departingTime >= referenceTime) ?? null;
      const activeCandidate = activeScheduledDepartureCandidates[getPortDelayCacheKey(routeAbbreviation, portKey)];
      const nextAfterActiveCandidate = scheduleList.find((departingTime) => departingTime > activeCandidate);
      const activeCandidateIsCurrent = activeCandidate &&
          (!nextAfterActiveCandidate || referenceTime < nextAfterActiveCandidate);

      portData.NextScheduledDeparture = activeCandidateIsCurrent ? activeCandidate : scheduleCandidate;
    }
  }
}

function decodeBasicHtmlEntities(value) {
  if (!value) {
    return '';
  }

  return value
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
}

function getPlainTextFromHtml(value) {
  return decodeBasicHtmlEntities(value.replace(/<[^>]*>/g, ' '))
      .replace(/\s+/g, ' ')
      .trim();
}

function applyTerminalBulletinData(ferryTempoData, terminalBulletinData) {
  if (!Array.isArray(terminalBulletinData)) {
    return;
  }

  const bulletinsByTerminalId = Object.fromEntries(
      terminalBulletinData.map((terminalBulletin) => [terminalBulletin.TerminalID, terminalBulletin]),
  );

  for (const routeAbbreviation in ferryTempoData) {
    for (const portKey of ['portWN', 'portES']) {
      const portData = ferryTempoData[routeAbbreviation].portData[portKey];
      const terminalBulletin = bulletinsByTerminalId[portData.TerminalID];
      portData.TerminalAlerts = (terminalBulletin?.Bulletins || [])
          .map((bulletin) => ({
            Title: bulletin.BulletinTitle || '',
            Text: getPlainTextFromHtml(bulletin.BulletinText || ''),
            Html: bulletin.BulletinText || '',
            SortSeq: bulletin.BulletinSortSeq ?? null,
            LastUpdated: getEpochSecondsFromWSDOT(bulletin.BulletinLastUpdated),
          }))
          .sort((first, second) => (first.SortSeq ?? 0) - (second.SortSeq ?? 0));
    }
  }
}

function getMatchingArrivalSpace(departureSpace, arrivingTerminalId) {
  return (departureSpace.SpaceForArrivalTerminals || []).find((arrivalSpace) => {
    return arrivalSpace.TerminalID === arrivingTerminalId ||
        (arrivalSpace.ArrivalTerminalIDs || []).includes(arrivingTerminalId);
  });
}

function getVehicleSpaceForPort(terminalSpaceData, arrivingTerminalId, targetDeparture, referenceTime) {
  const departures = (terminalSpaceData?.DepartingSpaces || [])
      .map((departureSpace) => ({
        departureSpace,
        arrivalSpace: getMatchingArrivalSpace(departureSpace, arrivingTerminalId),
        departureTime: getEpochSecondsFromWSDOT(departureSpace.Departure),
      }))
      .filter((space) => space.arrivalSpace && space.departureTime > 0)
      .sort((first, second) => first.departureTime - second.departureTime);

  if (departures.length === 0) {
    return null;
  }

  return departures.find((space) => targetDeparture && space.departureTime === targetDeparture) ||
      departures.find((space) => space.departureTime >= referenceTime) ||
      null;
}

function applyTerminalSailingSpaceData(ferryTempoData, terminalSailingSpaceData, referenceTime) {
  if (!Array.isArray(terminalSailingSpaceData)) {
    return;
  }

  const spacesByTerminalId = Object.fromEntries(
      terminalSailingSpaceData.map((terminalSpaceData) => [terminalSpaceData.TerminalID, terminalSpaceData]),
  );

  for (const routeAbbreviation in ferryTempoData) {
    const routeData = ferryTempoData[routeAbbreviation];
    const oppositePortKey = {
      portWN: 'portES',
      portES: 'portWN',
    };

    for (const portKey of ['portWN', 'portES']) {
      const portData = routeData.portData[portKey];
      const arrivingPortData = routeData.portData[oppositePortKey[portKey]];
      const terminalSpaceData = spacesByTerminalId[portData.TerminalID];
      const vehicleSpace = getVehicleSpaceForPort(
          terminalSpaceData,
          arrivingPortData.TerminalID,
          portData.NextScheduledDeparture,
          referenceTime,
      );

      if (!vehicleSpace) {
        portData.VehicleSpacesRemaining = null;
        portData.VehicleSpaces = null;
        continue;
      }

      portData.VehicleSpacesRemaining = vehicleSpace.arrivalSpace.DisplayDriveUpSpace ?
        vehicleSpace.arrivalSpace.DriveUpSpaceCount :
        null;
      portData.VehicleSpaces = {
        Departure: vehicleSpace.departureTime,
        IsCancelled: vehicleSpace.departureSpace.IsCancelled,
        VesselID: vehicleSpace.departureSpace.VesselID,
        VesselName: vehicleSpace.departureSpace.VesselName,
        ArrivingTerminalID: vehicleSpace.arrivalSpace.TerminalID,
        ArrivingTerminalName: vehicleSpace.arrivalSpace.TerminalName,
        DisplayDriveUpSpace: vehicleSpace.arrivalSpace.DisplayDriveUpSpace,
        DriveUpSpaceCount: vehicleSpace.arrivalSpace.DriveUpSpaceCount,
        DriveUpSpaceHexColor: vehicleSpace.arrivalSpace.DriveUpSpaceHexColor,
        DisplayReservableSpace: vehicleSpace.arrivalSpace.DisplayReservableSpace,
        ReservableSpaceCount: vehicleSpace.arrivalSpace.ReservableSpaceCount,
        ReservableSpaceHexColor: vehicleSpace.arrivalSpace.ReservableSpaceHexColor,
        MaxSpaceCount: vehicleSpace.arrivalSpace.MaxSpaceCount ?? vehicleSpace.departureSpace.MaxSpaceCount,
      };
    }
  }
}

export default {
  /**
   * Crunches the ferry data into the proper Ferry Tempo format.
   * @param {object} vesselData - VesselData object containing updated WSDOT ferry data
   * @return {object} updated Ferry Tempo data object.
   */
  processFerryData: (vesselData, scheduleData = null, terminalBulletinData = null, terminalSailingSpaceData = null) => {
    // Create a fresh ferryTempoData object to fill
    const updatedFerryTempoData = JSON.parse(JSON.stringify(routeFTData));

    // Cache to see if we updated a route + direction yet in this loop
    const routeDirCache = {};
    const portDelayCandidates = {};
    const activeScheduledDepartureCandidates = {};
    let latestEventTime = 0;

    // Loop through all ferry data looking for matching routes
    for (const vessel of vesselData) {
      // TODO: Remove unused values from spread
      const {
        VesselID,
        VesselName,
        Mmsi,
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

      let routeAbbreviation = OpRouteAbbrev[0];
      let vesselPositionNumber = VesselPositionNum;

      // if the routeAbbreviation is null, try to compute the route or fallback on cached data if the boat is InService.
      if (routeAbbreviation == null) {
        if (InService) {
          // Compute the route from the terminals, but this will return null if either terminal name is null. So fallback on the cached data.
          const computedRoute = getRouteFromTerminals(DepartingTerminalName, ArrivingTerminalName);

          // see if we have a last known route and last known position in our cache
          const lastKnownRoute = vesselCache[VesselID]?.LastKnownRoute ?? null;
          const lastKnownPosition = vesselCache[VesselID]?.LastKnownPosition ?? null;

          if (computedRoute) {
            if (lastKnownRoute && computedRoute != lastKnownRoute) {
              logger.info('Computed route: ' + computedRoute + ' differs from cached route: ' + vesselCache[VesselID]['LastKnownRoute']);
            }
            routeAbbreviation = computedRoute;
          } else {
            routeAbbreviation = lastKnownRoute;
          }
          if (routeAbbreviation) {
            logger.info('Empty route list for in service boat: ' + VesselName + ' asserting route: ' + routeAbbreviation);
          }

          if (vesselPositionNumber === null) {
            vesselPositionNumber = lastKnownPosition;
          }
        }
      } else {
        // Only ever update our cache with valid data received from WSDOT.
        vesselCache[VesselID] = {
          'LastKnownRoute'    : routeAbbreviation,
          'LastKnownPosition' : vesselPositionNumber
        }
      }

      // Calculating if a boat is on duty by looking at the system shut flag and message. If the flag is not 0 and the message is out of service, 
      // then the boat is not onDuty
      var onDuty = InService  ? !(VesselWatchShutFlag != 0 && VesselWatchShutMsg.toLowerCase().includes('vessel out of service')) : false;

      // Debug message for when a boat is going to/from the Fuel Dock, which should be considered off duty.
      if (onDuty && (ArrivingTerminalAbbrev === 'P15' || DepartingTerminalAbbrev === 'P15')) {
        logger.debug (VesselName +  ' is showing Fuel Dock while still on duty. Changing to off duty.');
        onDuty = false;
      }

      // Check if this is a vessel we want to process, which has to be in service and has to be assigned to a route we care about.
      if (InService && routeAbbreviation && routeFTData[routeAbbreviation] && routePositionData[routeAbbreviation]) {
        // Convert relevant times to epoch integers.
        const epochScheduledDeparture = getEpochSecondsFromWSDOT(ScheduledDeparture);
        const epochEta = getEpochSecondsFromWSDOT(Eta);
        const epochLeftDock = getEpochSecondsFromWSDOT(LeftDock);
        const epochTimeStamp = getEpochSecondsFromWSDOT(TimeStamp);
        const currentLocation = [Latitude, Longitude];
        if (epochTimeStamp > latestEventTime) {
          latestEventTime = epochTimeStamp;
        }

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

        // Determine DepartureDelay, which is either (epochLeftDock - epochScheduledDeparture)
        // or (now - epochScheduledDeparture) when in dock.
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
        const delayEventTime = epochLeftDock || epochTimeStamp;
        let boatDelayAvg = getAverage(VesselName, delayEventTime);
        let portDelayAvg = getAverage(portKey, delayEventTime);
        let crossingTimeAvg = getAverage(
          getAverageKey(AVERAGE_METRICS.crossingTime, VesselName),
          delayEventTime,
        );
        let boatStopTimerAvg = getAverage(
          getAverageKey(AVERAGE_METRICS.boatStopTimer, VesselName),
          delayEventTime,
        );
        let portStopTimerAvg = getAverage(
          getAverageKey(AVERAGE_METRICS.portStopTimer, portKey),
          delayEventTime,
        );
        if (AtDock) {
          const departureCandidateKey = getPortDelayCacheKey(routeAbbreviation, departingPort);
          if (epochScheduledDeparture && (
            !activeScheduledDepartureCandidates[departureCandidateKey] ||
            epochScheduledDeparture < activeScheduledDepartureCandidates[departureCandidateKey]
          )) {
            activeScheduledDepartureCandidates[departureCandidateKey] = epochScheduledDeparture;
          }

          if (boatDepartureCache[VesselName]) {
            const crossingTime = epochTimeStamp - boatDepartureCache[VesselName];
            if (crossingTime >= 0) {
              crossingTimeAvg = updateAverage(
                getAverageKey(AVERAGE_METRICS.crossingTime, VesselName),
                crossingTime,
                epochTimeStamp,
              );
            }
            boatDepartureCache[VesselName] = null;
          }
          if (boatArrivalCache[VesselName]) {
            timeAtDock = getCurrentEpochSeconds() - boatArrivalCache[VesselName]
          } else {
            boatArrivalCache[VesselName] = epochTimeStamp;
          }
        } else {
          // if not at the dock, see if there is a value in the cache, which indicates the boat just left.
          if (boatArrivalCache[VesselName]) {
            // boat just left the dock, update the average departure delay for the boat and the port
            boatDelayAvg = updateAverage(VesselName, boatDelay, delayEventTime);
            portDelayAvg = updateAverage(portKey, boatDelay, delayEventTime);
            const stopTimer = epochLeftDock ? epochLeftDock - boatArrivalCache[VesselName] : timeAtDock;
            if (stopTimer >= 0) {
              boatStopTimerAvg = updateAverage(
                getAverageKey(AVERAGE_METRICS.boatStopTimer, VesselName),
                stopTimer,
                delayEventTime,
              );
              portStopTimerAvg = updateAverage(
                getAverageKey(AVERAGE_METRICS.portStopTimer, portKey),
                stopTimer,
                delayEventTime,
              );
            }
          }
          boatArrivalCache[VesselName] = null;
          if (epochLeftDock) {
            boatDepartureCache[VesselName] = epochLeftDock;
          }
        }

        // Set boatData, but only if the position number is not null.
        if (vesselPositionNumber) {
          targetRoute['boatData'][`boat${vesselPositionNumber}`] = {
            'VesselPosition': VesselPositionNum,
            'VesselName': VesselName,
            'InService': InService,
            'OnDuty': onDuty,
            'Progress': AtDock ? 0 : getProgress(routeData, currentLocation),
            'CrossingTimeAverage': crossingTimeAvg,
            'Direction': direction,
            'DepartingTerminalName': DepartingTerminalName,
            'DepartingTerminalAbbrev': DepartingTerminalAbbrev,
            'ArrivingTerminalName': ArrivingTerminalName,
            'ArrivingTerminalAbbrev': ArrivingTerminalAbbrev,
            'AtDock': AtDock,
            'StopTimer': timeAtDock,
            'StopTimerAverage': boatStopTimerAvg,
            'ScheduledDeparture': epochScheduledDeparture,
            'LeftDock': epochLeftDock,
            'DepartureDelay': boatDelay,
            'DepartureDelayAverage': boatDelayAvg,
            'BoatETA': epochEta,
            'ArrivalTimeMinus' : arrivalTimeEta,
            'Speed': Speed,
            'Heading': Heading,
            'MMSI': Mmsi,
            'PositionUpdated': epochTimeStamp,
          };
        }
        
        // if a boat is not on duty, we do not want to update the port data from that boat's data
        if( !onDuty ) {
          // logger.debug(VesselName + 'is out of service, skipping port updates.');
          continue;
        }

        updatePortDelayCandidate(
          portDelayCandidates,
          routeAbbreviation,
          departingPort,
          boatDelay,
          AtDock,
          epochLeftDock,
          epochTimeStamp,
        );

        /**
         * Sometimes two boats on the same route will have the same departingPort and arrivingPort. In this case, we need to be careful setting
         * the port data. For the departing port, we keep the data if we haven't updated that port already or if the current boat is at dock 
         * (assuming only one boat can be at dock). For the arrival port, we keep the smaller of the two ETA's provided the current is not zero 
         * (which means we do not have an ETA set).
         */
        let routeDirKey = routeAbbreviation + direction;
        if (!routeDirCache[routeDirKey]) {
          targetRoute['portData'][departingPort].BoatAtDock =  AtDock;
          targetRoute['portData'][departingPort].PortStopTimer = timeAtDock;
          targetRoute['portData'][departingPort].PortStopTimerAverage = portStopTimerAvg;
          targetRoute['portData'][arrivingPort].PortArrivalTimeMinus = arrivalTimeEta;
          targetRoute['portData'][arrivingPort].PortETA = epochEta;
          routeDirCache[routeDirKey] = true;
        } else {
          if (AtDock) {
            targetRoute['portData'][departingPort].BoatAtDock =  AtDock;
            targetRoute['portData'][departingPort].PortStopTimer = timeAtDock;
            targetRoute['portData'][departingPort].PortStopTimerAverage = portStopTimerAvg;
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

    for (const routeAbbreviation in updatedFerryTempoData) {
      for (const portKey of ['portWN', 'portES']) {
        const cacheKey = getPortDelayCacheKey(routeAbbreviation, portKey);
        if (portDelayCandidates[cacheKey]) {
          portDepartureDelayCache[cacheKey] = {
            boatDelay: portDelayCandidates[cacheKey].boatDelay,
            sailingDayId: getSailingDayId(portDelayCandidates[cacheKey].eventTime),
          };
        }
        const cachedPortDelay = getPortDelayCacheValue(cacheKey, latestEventTime || getCurrentEpochSeconds());
        if (cachedPortDelay !== null) {
          updatedFerryTempoData[routeAbbreviation]['portData'][portKey].PortDepartureDelay = cachedPortDelay;
        }
      }
    }

    applyScheduleData(
        updatedFerryTempoData,
        scheduleData,
        latestEventTime || getCurrentEpochSeconds(),
        activeScheduledDepartureCandidates,
    );
    applyTerminalBulletinData(updatedFerryTempoData, terminalBulletinData);
    applyTerminalSailingSpaceData(
        updatedFerryTempoData,
        terminalSailingSpaceData,
        latestEventTime || getCurrentEpochSeconds(),
    );

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
