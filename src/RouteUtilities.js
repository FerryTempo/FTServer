import {
    MAX_DISTANCE_FROM_ROUTE, 
    numSlots, 
    routeSegmentFractions, 
    LON_SCALE, 
    DOCKED_SPEED, 
    DOCK_DISTANCE } from './RouteData.js';
import routePositionData from '../data/RoutePositionData.js';
import boatData from '../data/BoatData.js';
import Logger from './Logger.js';
import { getProgress } from './Utils.js';

const logger = new Logger();
const routeAssignments = initializeRouteAssignements();

/**
 * Accepts AIS progress reports from aisstream.io and updates the
 * boat and route data. Since we now filter by MMSI, we no longer 
 * need to filter out boats from the feed. We just need to remove
 * the WSF prefix from the ship name.
 * Then we do the following:
 *  1. Check if the ship data is missing
 * 2. Check if the ship is moving
 */
export function handleShipProgress(rawInfo) {
    // Check if we have the necessary data
    let shipName = rawInfo.MetaData.ShipName.trim();
    if (shipName.startsWith('WSF ')) {
        shipName = shipName.slice(4); // Remove the leading 'WSF '
    }

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

    // get the boat that we are dealing with
    const boat = boatData[MMSI];
    if (boat == null) {
        logger.error(`${shipName}: No boat data for MMSI ${MMSI}`);
        return;
    }

    const shipLatitude = rawInfo.Message.PositionReport.Latitude;
    const shipLongitude = rawInfo.Message.PositionReport.Longitude;
    const heading = rawInfo.Message.PositionReport.Cog;
    const [closestRoute, closestDistance] = estimateRoute([shipLatitude, shipLongitude]);
    const [isDocked, atEastEnd] = dockedStatus(closestRoute, speed, [shipLatitude, shipLongitude]);

    // see if the boat has a confirmed route assignment and if not go through the process of assigning it
    if (boat['AssignedRoute'] === null || boat['AssignedRoute'] === '' || boat['RouteConfirmed'] !== true) {
        // if the boat is docked at the west end of the route, assign it to the route
        // if not, see if the estimated route is the same as the typical route and use it
        // if not, we can soft-assign the boat to the route that we estimated         
        let positionFound = false;
        if (isDocked && !atEastEnd) {
            logger.debug(`At west dock:: Assigning ${boat['VesselName']} to route ${closestRoute}`);
            positionFound = assignToRoute(boat, closestRoute, true);
        } else if (boat['DefaultRoute'] === closestRoute && closestDistance < MAX_DISTANCE_FROM_ROUTE) {
            logger.debug(`Using default route:: Assigning ${boat['VesselName']} to route ${closestRoute}`);
            positionFound = assignToRoute(boat, closestRoute, true);
        } else if (closestDistance < MAX_DISTANCE_FROM_ROUTE) {
            logger.debug(`Using unconfirmed estimate:: Assigning ${boat['VesselName']} to route ${closestRoute}`);
            positionFound = assignToRoute(boat, closestRoute, false);
        }

        if (positionFound === false) {
            logger.error(`No route assignment for ${boat['VesselName']}`);
            return;
        }
    } else {
        // see if the ship is still on the same route we have already assigned it to
        let [segmentIdx, fraction, distance] = closestToRoute(boat['AssignedRoute'], shipLatitude, shipLongitude);
        if (distance > MAX_DISTANCE_FROM_ROUTE) {
            logger.info(`${shipName}: Too far from route ${routeIdx}, distance is ${Number(distance).toFixed(2)} nm`);
            // The ship is too far from the route. Dissociate it.
            routeAssignments[boat['AssginedRoute']][boat['AssignedPosition']-1].isAssigned = false;
            boat['AssignedRoute'] = '';
            boat['AssignedPosition'] = '';
            boat['RouteConfirmed'] = false;
            return;
        }
    }
    const route = boat['AssignedRoute'];

    // see if the boat moved since last update
    if (boat['Location'] == [shipLatitude, shipLongitude]) {
        // boat hasn't moved
        logger.debug(`${shipName}: Boat hasn't moved`);
    } else {
        boat['LastMoveTime'] = new Date();
        const computedHeading = Number(calculateHeading(boat['Location'], [shipLatitude, shipLongitude]).toFixed(0));
        logger.debug('Computed heading is ' + computedHeading + ' and reported heading is ' + heading);
    }

    // determine the direction of the ship. If docked, the direciton is the opposite of the side it is docked on
    // otherwise it is based on the ship heading.
    let direction = '';
    if (isDocked) {
        direction = atEastEnd ? 'WN' : 'ES';
    } else {
        direction = heading > 0 && heading < 180 ? 'ES' : 'WN';
        if (boat['Direction'] !== '' && boat['Direction'] !== direction) {
            logger.info(`${boat['VesselName']}: Direction changed from ${boat['Direction']} to ${direction}`);
        }
    }

    // load ship data from the rawInfo
    boat['Location'] = [shipLatitude, shipLongitude];
    boat['Speed'] = speed;
    boat['Heading'] = heading;
    boat['LastUpdate'] = new Date();
    boat['IsDocked'] = isDocked;
    boat['Direction'] = direction;

    // segment data is stored from west to east, so we need to reverse if the ship is going the other way.
    let routeSegments = routePositionData[route]['Segments'];
    if (direction === 'WN') {
        routeSegments = routePositionData[route]['Segments'].toReversed();
    }

    let progress = 0.0;
    if (!isDocked) {
        // assuming the route is correct, lets get the progress
        progress = getProgress(routeSegments, [shipLatitude, shipLongitude]);
    }

    // log the ship data to the console
    const boatdata = {
        'VesselName': boat['VesselName'],
        'AtDock': isDocked,
        'Progress': progress,
        'Speed' : speed,
        'Heading': heading,
        'Route': route,
        'Direction': direction,
        'Position': boat['AssginPosition'],
    };
    //logger.debug('Computed boat data from AIS: ' + JSON.stringify(boatdata));
}

/**
 * Calculate the heading based on the prior and current location of the ship.
 */
export function calculateHeading(position1, position2) {
    // Convert latitude and longitude from degrees to radians
    const toRadians = (deg) => deg * (Math.PI / 180);

    const lat1Rad = toRadians(position1[0]);
    const lat2Rad = toRadians(position2[0]);
    const deltaLonRad = toRadians(position2[1] - position1[1]);

    // Calculate the heading using the formula
    const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);
    
    let headingRad = Math.atan2(y, x);

    // Convert the heading from radians to degrees
    let headingDeg = headingRad * (180 / Math.PI);

    // Normalize the heading to 0-360 degrees
    headingDeg = (headingDeg + 360) % 360;

    return headingDeg;
}

/**
 * Find a route based on which position the ship is closest to.
 * @param {Array} shipPosition - the lat/long of the ship
 * returns the route abbreviation and the distance from the route
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
 * This assigns a ship to one of the "slots" on a route. We look for an open
 * slot and assign the ship to it. If the ship is already assigned to a slot,
 * we look to see if the assignment is soft (unconfirmed) and if so, we replace
 * that ship with this one (updating both ship's data). If all the slots are 
 * filled with confirmed assignments, we do nothing. and we return false to inducate
 * that we couldn't find a slot for the ship.
 */
export function assignToRoute(boat, routeAbbreviation, isConfirmed) {
    let possibleSlot = null;
    let availableSlot = null;
    const assignment = routeAssignments[routeAbbreviation];

    // see if the boat is already assigned to this route from an earlier assignment
    if (boat['AssignedRoute'] === routeAbbreviation && assignment[boat['AssignedPosition']-1].isAssigned && assignment[boat['AssignedPosition']-1].MMSI === boat['MMSI']) {
        logger.debug(`${boat['VesselName']}: Already assigned to route ${routeAbbreviation}... nothing to do`);
        return true;
    }

    // Look for an available slot.
    for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
        if (!assignment[slotIdx].isAssigned) {
            availableSlot = slotIdx;
            break;
        } else if (assignment[slotIdx].weakAssignment) {
            possibleSlot = slotIdx;
        }
    }

    // if we don't have an available sl
    if (availableSlot == null && possibleSlot != null) {
        availableSlot = possibleSlot;
    } 

    // if we are still null, we don't have a slot for the ship
    if (availableSlot == null) {
        return false;
    }

    // if we used the "possible slot" we need to update the old boat data
    if (possibleSlot != null) {
        const oldBoat = boatData[assignment[possibleSlot].MMSI];
        oldBoat['AssignedRoute'] = '';
        oldBoat['AssignedPosition'] = '';
        oldBoat['RouteConfirmed'] = false;
    }    
    
    // update the slot data
    logger.debug(`      ===== Assigning to route ${routeAbbreviation}, slot ${availableSlot} (available)`);
    assignment[availableSlot].MMSI = boat['Mmsi'];
    assignment[availableSlot].latestUpdate = new Date();
    assignment[availableSlot].weakAssignment = !isConfirmed;
    assignment[availableSlot].isAssigned = true;

    // update the boat data, note position is slotIdx + 1 (e.g boat1))
    boat['AssignedRoute'] = routeAbbreviation;
    boat['AssignedPosition'] = availableSlot+1;
    boat['RouteConfirmed'] = isConfirmed;

    return true;
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

    const routeWestLat = routePositionData[routeIdx]['Segments'][0][0]; // Western terminus
    const routeWestLon = routePositionData[routeIdx]['Segments'][0][1];

    let dLat =  shipLat - routeWestLat;
    let dLon = (shipLon - routeWestLon) * LON_SCALE;

    let dist2 = dLat ** 2 + dLon ** 2;

    if (dist2 < (DOCK_TOLERANCE ** 2)) {
        // At the western terminal
        return [true, false];
    }

    // Check the eastern end

    const lastSegIdx = routePositionData[routeIdx]['Segments'].length - 1;
    const routeEastLat = routePositionData[routeIdx]['Segments'][lastSegIdx][0]; // Eastern terminus
    const routeEastLon = routePositionData[routeIdx]['Segments'][lastSegIdx][1];

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
    const route = routePositionData[routeIdx]['Segments'];

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

        for (let nodeIdx = 0; nodeIdx < routePositionData[routeAbbreviation]['Segments'].length; nodeIdx++) {
            let nodeLat = routePositionData[routeAbbreviation]['Segments'][nodeIdx][0];
            let nodeLon = routePositionData[routeAbbreviation]['Segments'][nodeIdx][1];

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
    for (const mmsi in boatData) {
        // only include boats that have a default route
        if (boatData[mmsi]['DefaultRoute']) {
            boatMMSIData.push(mmsi);
        }
    }
    return boatMMSIData;
}

export function initializeRouteAssignements() {
    let routeAssignments = {};
    routeAssignments.length = 0;
    for (const routeAbbreviation in routePositionData) {
        const slotArray = [];
        for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
            slotArray.push(
                { isAssigned: false, weakAssignment: true,
                MMSI: 0, shipName: '',
                latestUpdate: new Date(), latestMovement: new Date(),
                isEastBound: true, isDocked: true,
                progressFraction: 0, progressRate: 0 });
        }
        routeAssignments[routeAbbreviation] = slotArray;
    }
    return routeAssignments;
}

/**
 * Get the boat data for the fleet of vessels in WSDOT's system.
 */
export function getBoatData() {
    return boatData;
};