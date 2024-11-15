import routePositionData from '../data/RoutePositionData.js';
import boatData from '../data/BoatData.js';
import Logger from './Logger.js';
import { getProgress } from './Utils.js';
import routeFTData from '../data/RouteFTData.js';
import { getCurrentEpochSeconds } from './Utils.js';

const logger = new Logger();

// Maximum amount of time a boat can be idle before we consider it to be off duty
const MAX_IDLE_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

//* Maximum speed a vessel can have and still be considered docked.
const DOCKED_SPEED = 0.5;

// distance from a route end at which point the boat is considered docked
const DOCK_DISTANCE = 0.25; // Not docked if distance > 1/4 nm from terminal

// maximum distance from a route to consider a boat to be on the route
const MAX_DISTANCE_FROM_ROUTE = 1;

/**
 * Adustment factor for converging longitude away from the equator.
 *
 * Lines of latitude are equidistant, but lines of longitude
 * come closer together farther from the equator. Thus longitude
 * values overstate their relative distance. Because we're in
 * a limited region, we can compensate pretty well by scaling
 * down longitude values by the cosine of our latitude.
 */
const LON_SCALE = 0.67; // ~cos(47.8 degrees = our general latitude)

//The maximum number of vessels that we will associate with
//NOTE: This should be an attribute of the route
const numBoats = 2; // Maximum number of ships to track per route

// initialize the structure to hold the route assignments
const routeAssignments = initializeRouteAssignements();

// variable used to lock access to the boat and assingment data to avoid concurent access
let lockedForUpdate = false;

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
    logger.debug(`Handling ship progress for ${rawInfo.MetaData.ShipName}`);

    // Check if we have the necessary data
    let shipName = rawInfo.MetaData.ShipName.trim();
    if (shipName.startsWith('WSF ')) {
        shipName = shipName.slice(4); // Remove the leading 'WSF '
    }

    const positionReport = rawInfo.Message.PositionReport;
    if (positionReport == null) {
        logger.error(`${shipName}: Null AIS Position Report!`);
        return;
    }

    const MMSI = rawInfo.MetaData.MMSI;
    const speed = rawInfo.Message.PositionReport.Sog;

    if (MMSI == null || speed == null) {
        logger.error(`${shipName}: Missing MMSI or speed in AIS record!`);
        return;
    }

    // get the boat that we are dealing with
    const boat = boatData[MMSI];
    if (boat == null) {
        logger.error(`${shipName}: No boat data for MMSI ${MMSI}`);
        return;
    }

    // if we are locked for update, ignore this update to avoid concurent access
    if (lockedForUpdate) {
        logger.info(`AIS: Locked for update: Ignoring update for ${shipName}`);
        return;
    }

    const shipLatitude = rawInfo.Message.PositionReport.Latitude;
    const shipLongitude = rawInfo.Message.PositionReport.Longitude;
    const heading = rawInfo.Message.PositionReport.Cog;
    const [closestRoute, closestDistance] = estimateRoute([shipLatitude, shipLongitude]);
    const [isDocked, atEastEnd] = dockedStatus(closestRoute, speed, [shipLatitude, shipLongitude]);

    
    // see if the boat moved since last update
    if (boat['Location'] == [shipLatitude, shipLongitude]) {
        if (boat['LastMoveTime'] !== null && (getCurrentEpochSeconds() - boat['LastMoveTime']) > MAX_IDLE_TIME) {
            logger.info(`AIS: ${boat['VesselName']}: No movement in the past hour, skipping assignment`);
            return;
        }
    } else {
        boat['LastMoveTime'] = getCurrentEpochSeconds();
    }

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
            if (closestRoute === 'sea-bi' || closestRoute === 'sea-br' && boatIsNearSeattle(shipLatitude, shipLongitude)) {
                logger.debug(`Near Seattle:: Skipping assignment of ${boat['VesselName']} to route ${closestRoute}`);
                return;
            }
            logger.debug(`Using unconfirmed estimate:: Assigning ${boat['VesselName']} to route ${closestRoute}`);
            positionFound = assignToRoute(boat, closestRoute, false);
        }

        if (positionFound === false) {
            logger.info(`AIS: No route assignment for ${boat['VesselName']}`);
            logger.debug(`Assignments: ${JSON.stringify(routeAssignments)}`);
            return;
        }
    } else {
        // see if the ship is still on the same route we have already assigned it to
        let [segmentIdx, fraction, distance] = closestToRoute(boat['AssignedRoute'], shipLatitude, shipLongitude);
        if (distance > MAX_DISTANCE_FROM_ROUTE) {
            logger.info(`AIS: ${boat['VesselName']}: Too far from route ${routeIdx}, distance is ${Number(distance).toFixed(2)} nm`);
            // The ship is too far from the route. Dissociate it.
            routeAssignments[boat['AssignedRoute']][boat['AssignedPosition']-1].isAssigned = false;
            boat['AssignedRoute'] = '';
            boat['AssignedPosition'] = '';
            boat['RouteConfirmed'] = false;
            return;
        }
    }
    const route = boat['AssignedRoute'];

    // if the boat hasn't moved in more than max idle time, then it is off duty
    boat['OnDuty'] = (getCurrentEpochSeconds() - boat['LastMoveTime']) < MAX_IDLE_TIME;
    

    // determine the direction of the ship. If docked, the direciton is the opposite of the side it is docked on
    // otherwise it is based on the ship heading.
    let direction = '';
    if (isDocked) {
        direction = atEastEnd ? 'WN' : 'ES';
    } else {
        direction = heading > 0 && heading < 180 ? 'ES' : 'WN';
        if (boat['Direction'] !== '' && boat['Direction'] !== direction) {
            logger.info(`AIS: ${boat['VesselName']}: Direction changed from ${boat['Direction']} to ${direction} while enroute`);
        }
    }

    // if we are not docked and we were before, then update the last left dock time
    if (!isDocked && boat['IsDocked']) {
        boat['LastLeftDock'] = getCurrentEpochSeconds();
    }

    // if we are docked and we weren't before, then update the last docked time
    if (isDocked && !boat['IsDocked']) {
        boat['LastDocked'] = getCurrentEpochSeconds();
    }

    // segment data is stored from west to east, so we need to reverse if the ship is going the other way.
    const routeSegments = direction ==='WN' ? routePositionData[route].toReversed() : routePositionData[route];

    let progress = 0.0;
    if (!isDocked) {
        // assuming the route is correct, lets get the progress
        progress = getProgress(routeSegments, [shipLatitude, shipLongitude]);
    }

    // load ship data from the rawInfo
    boat['Location'] = [shipLatitude, shipLongitude];
    boat['Speed'] = speed;
    boat['Heading'] = heading;
    boat['LastUpdate'] = getCurrentEpochSeconds();
    boat['IsDocked'] = isDocked;
    boat['Direction'] = direction;
    boat['Progress'] = progress;
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
    let possiblePos = null;
    let availablePos = null;
    const assignment = routeAssignments[routeAbbreviation];

    // see if the boat is already assigned to this route from an earlier assignment
    const currPosIdx = boat['AssignedSlot'];
    if (boat['AssignedRoute'] === routeAbbreviation && assignment[currPosIdx].IsAssigned && assignment[currPosIdx].MMSI === boat['MMSI']) {
        logger.debug(`${boat['VesselName']}: Already assigned to this route ${routeAbbreviation}... nothing to do`);
        return true;
    }

    // Look for an available slot.
    for (let posIdx = 0; posIdx < numBoats; posIdx++) {
        if (!assignment[posIdx].IsAssigned) {
            availablePos = posIdx;
            break;
        } else if (assignment[posIdx].WeakAssignment) {
            possiblePos = posIdx;
        }
    }

    // if we don't have an available sl
    if (availablePos == null && possiblePos != null) {
        availablePos = possiblePos;
    } 

    // if we are still null, we don't have a slot for the ship
    if (availablePos == null) {
        return false;
    }

    // if the boat is already assigned to another route, we need to update that route
    if (boat['AssignedRoute'] !== '') {
        logger.debug(`${boat['VesselName']}: Reassigning from ${boat['AssignedRoute']} to ${routeAbbreviation}`);
        const oldRoute = boat['AssignedRoute'];
        const oldPos = boat['AssignedSlot'];
        routeAssignments[oldRoute][oldPos].MMSI = 0;
        routeAssignments[oldRoute][oldPos].LatestUpdate = 0;
        routeAssignments[oldRoute][oldPos].WeakAssignment = true;
        routeAssignments[oldRoute][oldPos].IsAssigned = false;
    }

    // if we used the "possible slot" we need to update the old boat data
    if (possiblePos != null) {
        const oldBoat = boatData[assignment[possiblePos].MMSI];
        oldBoat['AssignedRoute'] = '';
        oldBoat['AssignedPosition'] = '';
        oldBoat['AssignedSlot'] = -1;
        oldBoat['RouteConfirmed'] = false;
    }    
    
    // update the slot data
    assignment[availablePos].MMSI = boat['MMSI'];
    assignment[availablePos].LatestUpdate = getCurrentEpochSeconds();
    assignment[availablePos].WeakAssignment = !isConfirmed;
    assignment[availablePos].IsAssigned = true;

    // update the boat data, by default we assign the boatid as the current slot +1
    boat['AssignedRoute'] = routeAbbreviation;
    boat['AssignedPosition'] = availablePos+1;
    boat['AssignedSlot'] = availablePos;
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
 * Initialize the route assignments for the ferry system. This structure
 * will hold the MMSI of the boats assigned to each route along with a flag
 * to indicate if the assignment is confirmed or not. Each route in WSF has
 * a number of boat positions, typically 2 (e.g. boat1, boat2). Since this is 
 * how WSDOT refers to the boats, we are unifying on that format and using
 * the following format:
 * { routeAbbreviation: {
 *      boat1: {
 *          IsAssigned: false,
 *          WeakAssignment: true,
 *          LatestUpdate: 0,
 *          MMSI: 0
 *      },
 *      boat2: {...}
*/
export function initializeRouteAssignements() {
    let routeAssignments = {};
    logger.debug('Initializing route assignments');
    for (const routeAbbreviation in routePositionData) {
        const positions = [];
        for (let posIdx = 0; posIdx < numBoats; posIdx++) {
            positions.push({
                IsAssigned: false, 
                LatestUpdate: 0,
                WeakAssignment: true,
                MMSI: 0
             });
        }
        routeAssignments[routeAbbreviation] = positions;
    }
    return routeAssignments;
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
    for (const MMSI in boatData) {
        // only include boats that have a default route
        if (boatData[MMSI]['DefaultRoute']) {
            boatMMSIData.push(MMSI);
        }
    }
    return boatMMSIData;
}

/**
 * Get the route data for the fleet of vessels in WSDOT's system.
 * @return array of route data for the boats in the fleet.
 */
export function getFTData() {
    // Create a fresh ferryTempoData object to fill
    const updatedFerryTempoData = JSON.parse(JSON.stringify(routeFTData));
    for (const route in updatedFerryTempoData) {
        const positions = routeAssignments[route];
        for (let i = 0; i < positions.length; i++) {
            if (positions[i].IsAssigned) {
                const boat = boatData[positions[i].MMSI];
                const boatId = 'boat' + boat['AssignedPosition'];
                updatedFerryTempoData[route]['boatData'][boatId] = {
                    'AtDock': boat['IsDocked'],
                    'ArrivingTerminalAbbrev': boat['Direction'] === 'ES' ? routeFTData[route]['portData']['portES']['TerminalAbbrev'] : routeFTData[route]['portData']['portWN']['TerminalAbbrev'],
                    'ArrivingTerminalName': boat['Direction'] === 'ES' ? routeFTData[route]['portData']['portES']['TerminalName'] : routeFTData[route]['portData']['portWN']['TerminalName'],
                    'DepartingTerminalAbbrev': boat['Direction'] === 'ES' ? routeFTData[route]['portData']['portWN']['TerminalAbbrev'] : routeFTData[route]['portData']['portES']['TerminalAbbrev'],
                    'DepartingTerminalName': boat['Direction'] === 'ES' ? routeFTData[route]['portData']['portWN']['TerminalName'] : routeFTData[route]['portData']['portES']['TerminalName'],
                    'Direction': boat['Direction'],
                    'Heading': boat['Heading'],
                    'InService': true,
                    'LeftDock': boat['LastLeftDock'],
                    'MMSI': boat['MMSI'],
                    'OnDuty': (getCurrentEpochSeconds() - boat['LastMoveTime']) < MAX_IDLE_TIME,
                    'PositionUpdated': boat['LastMoveTime'],
                    'Progress': boat['Progress'],
                    'Speed': boat['Speed'],
                    'VesselName': boat['VesselName'],
                    'VesselPosition': boat['AssignedPosition']
                };
                // if the boat is docked, update the port data for the port it is at
                const portId = 'port' + (boat['Direction'] === 'ES' ? 'WN' : 'ES');
                updatedFerryTempoData[route]['portData'][portId]['BoatAtDock'] = boat['IsDocked'];
                updatedFerryTempoData[route]['portData'][portId]['PortStopTimer'] = boat['IsDocked'] ? getCurrentEpochSeconds() - boat['LastDocked'] : 0;
            }
        }
    }
    return updatedFerryTempoData;
}

/**
 * Check if a ship is near Seattle. Near is defined as within 5 nm of the Seattle ferry terminal.
 * We pull the terminus point from the sea-bi route.
 */
export function boatIsNearSeattle(shipLat, shipLon) {
    const len = routePositionData['sea-bi'].length;
    const seattleLat = routePositionData['sea-bi'][len-1][0];
    const seattleLon = routePositionData['sea-bi'][len-1][1];
    const distance = 60* Math.acos(Math.sin(shipLat)*Math.sin(seattleLat) + Math.cos(shipLat)*Math.cos(seattleLat)*Math.cos(shipLon - seattleLon));
    return distance < 4;
}

/**
 * Update the AIS boat assignment data using information from the WSDOT data
 * source. This is treated as the ground truth for the boat assignments. Note,
 * since we are going to be messing with both boat data and assignment data, we 
 * want to avoid conflicts and therefore use a lock to prevent that. Also, worth
 * noting that we confirm all assignments in the AIS data at this time because if 
 * they were incorrect, we would receive an update.
 * @param {Object} wsdotData - the WSDOT data source
 */
export function updateAISData(wsdotData) {
    lockedForUpdate = true;
    try {
        for (const route in wsdotData) {
            logger.debug(`Updating AIS data for route ${route}`);
            const positions = wsdotData[route];
            const assignments = routeAssignments[route];
            for (let idx=0; idx < positions.length; idx++) {
                // if the assignments array is smaller than the positions array, add a new assignment
                if (idx >= assignments.length) {
                    logger.debug(`Adding boat assignment for route ${route} at position ${idx+1} for boat ${boatData[positions[idx].MMSI]['VesselName']}`);
                    assignments.push({
                        IsAssigned: true, 
                        LatestUpdate: getCurrentEpochSeconds(),
                        WeakAssignment: false,
                        MMSI: positions[idx].MMSI
                    });
                    // update the boat data
                    boatData[positions[idx].MMSI]['AssignedRoute'] = route;
                    boatData[positions[idx].MMSI]['AssignedPosition'] = positions[idx]['Position'];
                    boatData[positions[idx].MMSI]['AssignedSlot'] = idx;
                    boatData[positions[idx].MMSI]['RouteConfirmed'] = true;
                } 
                // if the assignment is different from the position, update the assignment
                if (assignments[idx].MMSI !== positions[idx].MMSI) {
                    logger.debug(`Updating boat assignment for route ${route} at position ${idx+1} for boat ${boatData[positions[idx].MMSI]['VesselName']}`);
                    // need to update the boat to remove old assignment, but only if the boat is assigned to this slot (it could have been updated already)
                    if (assignments[idx].MMSI !== 0 && boatData[assignments[idx].MMSI]['AssignedSlot'] === idx) {
                        logger.debug(`Removing old boat assignment for route ${route} at slot ${idx} for boat ${boatData[assignments[idx].MMSI]['VesselName']}`);
                        boatData[assignments[idx].MMSI]['AssignedRoute'] = '';
                        boatData[assignments[idx].MMSI]['AssignedPosition'] = '';
                        boatData[assignments[idx].MMSI]['AssignedSlot'] = -1;
                        boatData[assignments[idx].MMSI]['RouteConfirmed'] = false;
                    }
                    assignments[idx].MMSI = positions[idx].MMSI;
                    assignments[idx].LatestUpdate = getCurrentEpochSeconds();
                    assignments[idx].WeakAssignment = false;
                    assignments[idx].IsAssigned = true;
                    // update the boat data
                    boatData[positions[idx].MMSI]['AssignedRoute'] = route;
                    boatData[positions[idx].MMSI]['AssignedPosition'] = positions[idx]['Position'];
                    boatData[positions[idx].MMSI]['AssignedSlot'] = idx;
                    boatData[positions[idx].MMSI]['RouteConfirmed'] = true;
                } else {
                    if (assignments[idx]['WeakAssignment']) {
                        logger.debug(`Updating weak boat assignment for route ${route} at position ${idx+1} for boat ${boatData[positions[idx].MMSI]['VesselName']}`);
                        assignments[idx].LatestUpdate = getCurrentEpochSeconds();
                        assignments[idx].WeakAssignment = false;
                        // update the boat data
                        boatData[positions[idx].MMSI]['RouteConfirmed'] = true;
                    } else if (assignments[idx]['Position'] !== boatData[positions[idx].MMSI]['AssignedPosition']) {
                        logger.debug(`Updating boat position for route ${route} at position ${positions[idx]['Position']} for boat ${boatData[positions[idx].MMSI]['VesselName']}`);
                        boatData[positions[idx].MMSI]['AssignedPosition'] = positions[idx]['Position'];
                    } else {
                        logger.debug(`No change in boat assignment for route ${route} at position ${idx+1} for boat ${boatData[positions[idx].MMSI]['VesselName']}`);
                    }
                }
            }

            // if the assignments array is larger than the positions array, remove the extra assignments and update the boat data
            if (assignments.length > positions.length) {
                for (let idx = positions.length; idx < assignments.length; idx++) {
                    if (assignments[idx].MMSI !== 0) {
                        logger.debug(`Removing boat assignment for route ${route} at position ${idx+1} for boat ${boatData[assignments[idx].MMSI]['VesselName']}`);
                        assignments[idx].MMSI = 0;
                        assignments[idx].LatestUpdate = 0;
                        assignments[idx].WeakAssignment = true;
                        assignments[idx].IsAssigned = false;
                        // update the boat data
                        boatData[assignments[idx].MMSI]['AssignedRoute'] = '';
                        boatData[assignments[idx].MMSI]['AssignedPosition'] = '';
                        boatData[assignments[idx].MMSI]['AssignedSlot'] = -1;
                        boatData[assignments[idx].MMSI]['RouteConfirmed'] = false;
                    }
                }
            }
        }
        // confirm all assignments in the AIS data
        for (const MMSI in boatData) {
            if(boatData[MMSI]['AssignedRoute'] !== '' && boatData[MMSI]['RouteConfirmed'] !== true) {
                logger.debug(`Confirming boat assignment for route ${boatData[MMSI]['AssignedRoute']} at position ${boatData[MMSI]['AssignedPosition']} for boat ${boatData[MMSI]['VesselName']}`);
                boatData[MMSI]['RouteConfirmed'] = true;
            }
        }
    } catch(error) {
        logger.error(`Error updating AIS data: ${error}`);
        logger.error(error.stack);
        // make sure we remove the lock befor exiting
        lockedForUpdate = false;
    }
    lockedForUpdate = false;
}

