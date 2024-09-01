import { routeAssignments, 
    MAX_DISTANCE_FROM_ROUTE, 
    numSlots, 
    writeRouteAssignmentsToDisk, 
    routeSegmentFractions, 
    LON_SCALE, 
    DOCKED_SPEED, 
    DOCK_DISTANCE } from './RouteData.js';
import routePositionData from '../data/RoutePositionData.js';
import boatData from '../data/BoatData.js';
import Logger from './Logger.js';
import { getProgress } from './Utils.js';

const logger = new Logger();

/**
 * Accepts AIS progress reports from aisstream.io
 *  This method
 *      o  checks if the ship is on one of our routes
 *      o  determines how far along the route it is
 *      o  determines how quickly it's progressing along the route
 */
export function handleShipProgress(rawInfo) {
    let shipName = rawInfo.MetaData.ShipName.trim();
    if (!shipName.startsWith('WSF ')) {
        return;
    }
    shipName = shipName.slice(4); // Remove the leading 'WSF '

    const positionReport = rawInfo.Message.PositionReport;
    if (positionReport == null) {
        logger.debug(`${shipName}: Null Position Report!`);
        return;
    }

    const MMSI = rawInfo.MetaData.MMSI;
    const speed = rawInfo.Message.PositionReport.Sog;

    if (MMSI == null || speed == null) {
        logger.debug(`${shipName}: Missing MMSI or speed!`);
        return;
    }

    let [routeIdx, slotIdx] = indicateUpdate(MMSI, speed);

    // Determine the point on the route that is closest to the ship's current position.
    const shipLatitude = rawInfo.Message.PositionReport.Latitude;
    const shipLongitude = rawInfo.Message.PositionReport.Longitude;

    // estimate the route if we don't know it
    const [closestRoute, closestDistance] = estimateRoute([shipLatitude, shipLongitude]);
    logger.debug(`${shipName}: Closest route is ${closestRoute}, distance is ${Number(closestDistance).toFixed(2)} nm`);

    // assuming the route is correct, lets get the progress
    const progress = getProgress(routePositionData[closestRoute], [shipLatitude, shipLongitude]);
    logger.debug(`${shipName}: Progress is ${Number(progress).toFixed(2)}`);

    const isDocked = dockedStatus(closestRoute, speed, [shipLatitude, shipLongitude])[0];
    const heading = rawInfo.Message.PositionReport.Cog;

    // log the ship data to the console
    const boatdata = {
        'VesselName': shipName,
        'AtDock': isDocked,
        'Progress': progress,
        'Speed' : speed,
        'Heading': heading,
        'Route': closestRoute,
    };
    logger.debug('Computed boat data from AIS: ' + JSON.stringify(boatdata));
    /*
    if (routeIdx == null) {
        // Not on a route (yet). Check if it should be assigned to a route.
        [routeIdx, slotIdx] = assignToRoute(shipName, MMSI, speed, [shipLatitude, shipLongitude]);
    }

    if (routeIdx == null) {
        logger.debug(shipName + ': Not assigned to a route');
        // Still not on a route. We're done.
        return;
    }

    // This ship is assigned to a route

    const [isDocked, atEastEnd] = dockedStatus(rawInfo, routeIdx);
    if (isDocked) {
        routeAssignments[routeIdx][slotIdx].isDocked = true;
        routeAssignments[routeIdx][slotIdx].progressRate = 0;
        if (atEastEnd) {
//            logger.debug('         Docked at 100%'); // ??
            routeAssignments[routeIdx][slotIdx].isEastbound = true;
            routeAssignments[routeIdx][slotIdx].progressFraction = 1;
        } else {
//            logger.debug('         Docked at 0%'); // ??
            routeAssignments[routeIdx][slotIdx].isEastbound = false;
            routeAssignments[routeIdx][slotIdx].progressFraction = 0;
        }
        return;
    }

    // The ship is assigned to a route and is not docked
    routeAssignments[routeIdx][slotIdx].isDocked = false;

    // compute the progress on the route using the lat/long data
    const progress = getProgress(routePositionData[routeIdx], [shipLatitude, shipLongitude]);

    let [segmentIdx, fraction, distance] = closestToRoute(routeIdx,
                                                          shipLatitude,
                                                          shipLongitude);

    if (distance > MAX_DISTANCE_FROM_ROUTE) {
        // The ship is too far from the route.
        // Dissociate the ship from the route.
        for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
            if (routeAssignments[routeIdx][slotIdx].MMSI === MMSI) {
                logger.debug(`      ===== Dissociating from route ${routeIdx}, slot ${slotIdx}` +
                            `, distance is ${Number(distance).toFixed(2)} nm`);
                routeAssignments[routeIdx][slotIdx].isAssigned = false;
            }
        }
        writeRouteAssignmentsToDisk();
        return;
    }

    // Get the fraction along the route corresponding to this closest point
    const totalFraction =
          routeSegmentFractions[routeIdx][segmentIdx]     * (1 - fraction) +
          routeSegmentFractions[routeIdx][segmentIdx + 1] *  fraction;

    routeAssignments[routeIdx][slotIdx].progressFraction = totalFraction;

    ////////////////////
    //
    // Now let's look 2.5 minutes into the future:
    // Distance (in units of degrees of latitude) covered in 2.5 minutes =
    //     (speed nm/hour) * (2.5 min) * (1 hour / 60 min) * (1 degree of lat/60 nm)
    const projectionTime = 2.5;
    const movement = speed * (projectionTime / 60 / 60);
    const deltaLat = movement * Math.cos(heading);
    const deltaLon = movement * Math.sin(heading) / LON_SCALE;

    const futureLat = shipLatitude + deltaLat;
    const futureLon = shipLongitude + deltaLon;

    const [futureSegmentIdx, futureFraction] = closestToRoute(routeIdx,
                                                              futureLat,
                                                              futureLon);

    const futureTotalFraction =
          routeSegmentFractions[routeIdx][futureSegmentIdx] *
              (1 - futureFraction) +
          routeSegmentFractions[routeIdx][futureSegmentIdx + 1] *
              futureFraction;

    const rateOfProgress = (futureTotalFraction - totalFraction) / projectionTime;

    routeAssignments[routeIdx][slotIdx].progressRate = rateOfProgress;
    if (rateOfProgress > 0.01) {
        routeAssignments[routeIdx][slotIdx].isEastbound = true;
    } else if (rateOfProgress < -0.01) {
        routeAssignments[routeIdx][slotIdx].isEastbound = false;
    }

    // log the ship data to the console
    const boatdata = {
        'VesselName': shipName,
        'AtDock': isDocked,
        'Progress': progress,
        'Speed' : speed,
        'Heading': heading,
        'Route': routeIdx,
        'ComputedProgress': totalFraction,
    };
    logger.debug('Computed boat data from AIS: ' + boatdata);
    */
}

/**
 * Find a route based on which position the ship is closest to.
 */
export function estimateRoute(shipPosition) {
    let closestRoute = null;
    let closestDistance = 1.0e9;

    for (const routeAbbreviation in routePositionData) {
        let [segmentIdx, fraction, distance] = closestToRoute(routeAbbreviation,
                                                              shipPosition[0],
                                                              shipPosition[1]);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestRoute = routeAbbreviation;
        }
    }
    return [closestRoute, closestDistance];
}

/**
 * Print out the boat data for debugging purposes. 
 */

/**
 * If the ship is assigned to a route, updates its
 *  'latestUpdate'.
 *  If the ship is underway, also updates 'latestMovement' and
 *  clears 'weakAssignment'.
 */
function indicateUpdate(MMSI, speed) {
    let now = new Date();

    // Find this ship's route assignment
    for (const routeAbbreviation in routePositionData) {
        for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
            if (routeAssignments[routeAbbreviation][slotIdx].isAssigned &&
                routeAssignments[routeAbbreviation][slotIdx].MMSI == MMSI)
            {
                // It is assigned
                routeAssignments[routeAbbreviation][slotIdx].latestUpdate = now;
                if (speed > DOCKED_SPEED) {
                    routeAssignments[routeAbbreviation][slotIdx].latestMovement = now;
                    if (routeAssignments[routeAbbreviation][slotIdx].weakAssignment) {
                        // The ship is underway; this assignment seems OK now
                        routeAssignments[routeAbbreviation][slotIdx].weakAssignment = false;
                        writeRouteAssignmentsToDisk();
                    }
                }
                return [routeAbbreviation, slotIdx];
            }
        }
    }
    return [null, null]; // Not assigned
}

/**
 * If this ship is not moving and is at the western terminus
 * of a route, assigns the ship to that route.
 *
 * Updates routeData.routeAssignments[].
 *
 * Returns
 *      [route index, slot index] if the ship was assigned
 *      [null, null] if the ship was not assigned
 */
export function assignToRoute(shipName, MMSI, speed, shipPosition) {

    // Check each route
    for (const routeAbbreviation in routePositionData) {
        const [isDocked, atEastEnd] = dockedStatus(routeAbbreviation, speed, shipPosition);

        if (!isDocked || atEastEnd) {
            continue;
        }

        // The ship is docked at the western terminal of this route.
        // Assign this ship to the route.

        // Look for an available slot.
        for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
            const assignment = routeAssignments[routeAbbreviation];
            if (!assignment[slotIdx].isAssigned) {
                logger.debug(`      ===== Assigning to route ${routeAbbreviation}, slot ${slotIdx} (available)`);
                assignment[slotIdx].MMSI = MMSI;
                assignment[slotIdx].shipName = shipName;
                assignment[slotIdx].latestUpdate = new Date();
                assignment[slotIdx].latestMovement = new Date()
                assignment[slotIdx].weakAssignment = false;
                assignment[slotIdx].isAssigned = true;

                //writeRouteAssignmentsToDisk();
                return [routeAbbreviation, slotIdx];
            }
        }

        // All slots are in use. See if there is a slot with a "weak" assignment.
        for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
            const assignment = routeAssignments[routeAbbreviation];
            if (assignment[slotIdx].weakAssignment) {
                logger.debug(`      ===== Assigning to route ${routeAbbreviation}, slot ${slotIdx} (was weak)`);
                assignment[slotIdx].MMSI = MMSI;
                assignment[slotIdx].shipName = shipName;
                assignment[slotIdx].latestUpdate = new Date();
                assignment[slotIdx].latestMovement = new Date();
                assignment[slotIdx].weakAssignment = false;
                assignment[slotIdx].isAssigned = true;

                //writeRouteAssignmentsToDisk();
                return [routeAbbreviation, slotIdx];
            }
        }

        // All slots are in use with strong assignments. Skip this assignment.
        logger.debug(`      ----- All slots are in use for route ${routeAbbreviation}`);
        return [null, null];
    }
    // No match with any terminus
    return [null, null];
}

/**
 * Checks if a ship is docked at either teminus of its assigned route
 *
 *  Returns [isDocked, isEast]:
 *    isDocked   true if the ship is unmoving at a terminal of the route
 *    isEast     if 'isDocked', true if the ship is at the eastern terminal
 */
export function dockedStatus(routeIdx, speed, shipPosition) {

    if (speed == null) {
        return [false, false];
    }

    if (speed > DOCKED_SPEED) {
        // It is moving, so it's not docked.
        return [false, false];
    }

    if (routeIdx == null || routePositionData[routeIdx] == null) {
        return [false, false];
    }

    const shipLat = shipPosition[0];
    const shipLon = shipPosition[1];

    const DOCK_TOLERANCE = DOCK_DISTANCE / 60; // Convert nm to degrees of latitude

    // Check the western end

    const routeWestLat = routePositionData[routeIdx][0][0]; // Western terminus
    const routeWestLon = routePositionData[routeIdx][0][1];

    let dLat =  shipLat - routeWestLat;
    let dLon = (shipLon - routeWestLon) * LON_SCALE;

    let dist2 = dLat ** 2 + dLon ** 2;

    if (dist2 < (DOCK_TOLERANCE ** 2)) {
        // At the western terminal
        return [true, false];
    }

    // Check the eastern end

    const lastSegIdx = routePositionData[routeIdx].length - 1;
    const routeEastLat = routePositionData[routeIdx][lastSegIdx][0]; // Eastern terminus
    const routeEastLon = routePositionData[routeIdx][lastSegIdx][1];

    dLat =  shipLat - routeEastLat;
    dLon = (shipLon - routeEastLon) * LON_SCALE;

    dist2 = dLat ** 2 + dLon ** 2;

    if (dist2 < (DOCK_TOLERANCE ** 2)) {
        // At the eastern terminal
        return [true, true];
    }

    // Not at either terminal
    return [false, false];
}

/**
 * Finds the point on a ferry path that is closest
 * to a ship's position.
 *
 * Inputs
 *    @routeIdx   index of the route of interest
 *    @shipLat    the ship's latitude
 *    @shipLon    the ship's longitude
 *
 * Returns [segmentId, fraction, distance]:
 *    @closestSegmentIdx  which segment of the path the closest point is on
 *    @fractionInSegment  the fraction of the way along that segment (0 .. 1)
 *    @distance           the distance from the ship to the closest point (in nautical miles)
 */
function closestToRoute(routeIdx, shipLat, shipLon) {
    const route = routePositionData[routeIdx];

    let closestSegmentIdx = -1;
    let fractionInSegment = 0.0;
    let smallestDistance2 = 1.0e9; // Distance squared, units of (1 deg latitude)**2

    for (let segmentIdx = 0; segmentIdx < route.length - 1; segmentIdx++) {
        // How close is our point to this path segment?
        let [closeLat, closeLon, fraction] = closestPoint(route[segmentIdx][0],
                                                          route[segmentIdx][1],
                                                          route[segmentIdx + 1][0],
                                                          route[segmentIdx + 1][1],
                                                          shipLat,
                                                          shipLon);

        const thisDistance2 = (closeLat - shipLat) ** 2 +
              ((closeLon - shipLon) * LON_SCALE) ** 2;

        if (thisDistance2 < smallestDistance2) {
            smallestDistance2 = thisDistance2;
            closestSegmentIdx = segmentIdx;
            fractionInSegment = fraction;
        }
    }

    // Get the distance in nautical miles (60 nm = 1 degree of latitude)
    const distance = Math.sqrt(smallestDistance2) * 60;

    return [closestSegmentIdx, fractionInSegment, distance];
}

/**
 * Determines the point on a line segment that is closest to another point.
 * Also determines the location of this closeset point on the segment
 * as a fraction of its distance from the start to the end of the
 * segment (0.0 .. 1.0).
 *
 * Returns [latitude, longitude, fraction]:
 *    @latitude   Latitude of the closest point
 *    @longitude  Longitude of the closest point
 *    @fraction   How far along the segment the closest point is
 */

// https://stackoverflow.com/questions/3120357/get-closest-point-to-a-line
// Answer by comingstorm, Jun 25, 2010
//
//   Given a line defined by points A and B, and another point P,
//   the closest point on line AB is a linear combination of A and B:
//
//   X = (1 - k) A + k B
//
//      k = ((P - A) dot (B - A)) / ((B - A) dot (B - A))
//
//   If 0 <= k <= 1 then the point is on segment AB.
//   If k < 0 then A is the closest point; if k > 1 then B is the closest point.

function closestPoint(segmentStartLat, segmentStartLon,
                      segmentEndLat, segmentEndLon,
                      pointLat, pointLon)
{
    // See the comment for 'LON_SCALE' in route_data.js for an explanation of these scalings
    segmentStartLon *= LON_SCALE;
    segmentEndLon *= LON_SCALE;
    pointLon *= LON_SCALE;

    // denom  = (end - start) . (end - start)
    const dSegmentLat = segmentEndLat - segmentStartLat;
    const dSegmentLon = segmentEndLon - segmentStartLon;
    const denominator = dSegmentLat ** 2 + dSegmentLon ** 2;

    if (denominator == 0.0) {
        // start == end, degenerate case
        return [segmentStartLat, segmentStartLon, 0];
    }

    // numerator = (p - start) . (end - start)
    const dPointLat = pointLat - segmentStartLat;
    const dPointLon = pointLon - segmentStartLon;
    const numerator = (dPointLat * dSegmentLat) + (dPointLon * dSegmentLon);

    const k = numerator / denominator

    if (k < 0.0) {
        // 'start' is closest (unscale it)
        return [segmentStartLat, segmentStartLon / LON_SCALE, 0.0];
    }
    if (k > 1.0) {
        // 'end' is closest (unscale it)
        return [segmentEndLat, segmentEndLon / LON_SCALE, 1.0];
    }

    // Convert the longitude values back to conventional units
    return [(segmentStartLat * (1 - k) + segmentEndLat * k),
            (segmentStartLon * (1 - k) + segmentEndLon * k) / LON_SCALE,
             k];
}


/**
 * Return an array of bounding boxes, each enclosing
 * one of the routes that we deal with.
 *
 * aisstream.io accepts a set of bounding boxes to
 * restrict which ship positions it reports.
 * @return array of bounding boxes for WSF routes.
 */
export function getBoundingBoxes() {
    const boxArray = [];
  
    for (const routeAbbreviation in routePositionData) {
        // Find the min and max values of latitude and longitude
        // for this route
        let minLat =   90;
        let maxLat =  -90;
        let minLon =  180;
        let maxLon = -180;
  
        for (let nodeIdx = 0; nodeIdx < routePositionData[routeAbbreviation].length; nodeIdx++) {
            let nodeLat = routePositionData[routeAbbreviation][nodeIdx][0];
            let nodeLon = routePositionData[routeAbbreviation][nodeIdx][1];
  
            if (nodeLat < minLat) minLat = nodeLat;
            if (nodeLat > maxLat) maxLat = nodeLat;
  
            if (nodeLon < minLon) minLon = nodeLon;
            if (nodeLon > maxLon) maxLon = nodeLon;
        }
        // 1 minute of latitude = 1 nautical mile = 0.01667 degrees
        // Make the box 0.01 degrees beyond the route's extent (~ 0.6 nm)
        let extension = 0.01;
        let box = [[minLat - extension, minLon - extension],
                   [maxLat + extension, maxLon + extension]];
  
        logger.debug("Adding box: " + JSON.stringify(box));
        boxArray.push(box);
    }
    return boxArray;
  }
  
  /**
   * Get boat mmsi data for the fleet of vessels in WSDOT's system.
   * @return array of MMSI values for the boats in the fleet.
   */
  export function getBoatMMSIList() {
    let boatMMSIData = [];
    for (const boatName in boatData) {
      // only include boats that have a default route
      if (boatData[boatName]['DefaultRoute']) {
        boatMMSIData.push(boatData[boatName]['Mmsi']);
      }
    }
    return boatMMSIData;
  }
