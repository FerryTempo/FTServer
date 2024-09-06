import Logger from './Logger.js';
import routePositionData from '../data/RoutePositionData.js'; // use the same route segment data as the main app

const logger = new Logger();

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

/**
 * Maximum speed a vessel can have and still be considered docked.
 */
const DOCKED_SPEED = 0.5;

/**
 * Maximum distance, in nautical miles, that a vessel can be from
 * a route terminus and still be considered docked.
 */
const DOCK_DISTANCE = 0.25; // Not docked if distance > 1/4 nm from terminal

/**
 * Maximum distance, in nautical miles, that a vessel can be from
 * a route and remain associated with that route.
 */
const MAX_DISTANCE_FROM_ROUTE = 1;

/**
 * The fraction along the route of each point in 'routeSegments'.
 *
 * The fraction at the western end (index [0]) is 0; the fraction
 * at the eastern end is 1.0.
 *
 * Array[route index][waypoint index]
 */
const routeSegmentFractions = [];

/**
 * The maximum number of vessels that we will associate with
 * a ferry route.
 */
const numSlots = 2; // Maximum number of ships to track per route

/**
 * File that holds the latest associations that we have made between
 * ships and routes.
 */
const routeFileName = process.cwd() + '/ais_route_assignments.json'; // Save ship-to-route assignments

/**
 * Structure that describes our association of ships to routes
 * and each associated ship's status.
 *
 * routeAssignments:
 *     Array[route index][slot index] {
 *         isAssigned:       true if this slot has a ship assigned
 *         weakAssignment:   true if the assignment is uncertain
 *         MMSI:             ID number of the assigned ship
 *         shipName:         Ship name (without the leading 'WSF ')
 *         latestUpdate:     time of the latest position report received for this ship
 *         latestMovement:   the latest time this ship was seen moving
 *         isEastbound:      true if heading east or docked at its western terminal
 *         isDocked:         true if this ship is at a terminal
 *         progressFraction: 0.0 if at west terminal ... 1.0 if at east terminal; as of 'latestMovement'
 *         progressRate:     progressFraction change per minute (+/-)
 *     }
 */
let routeAssignments = [];

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//
//  Initialization
import { writeFile } from 'fs';

//  Read 'routeAssignments' from disk
export function readRouteAssignments() {

    // Regardless of what the error is, init routeAssignments
    logger.debug('Clearing route assignments');
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
    //writeRouteAssignmentsToDisk();
    // Schedule 'scrubAssignments' to run every minute
    //setInterval(scrubAssignments, 60 * 1000);
    return routeAssignments;
}


/**
 * Conditionally dissociates a ship from a route
 *
 *  Removes a ship from being assigned to a route if
 *  we have not recently received an update on the ship's
 *  position.
 *
 *  Marks an association as "weak" if the ship hasn't moved
 *  in over an hour.
 *
 *  This method is intended to be invoked periodically.
 */
export function scrubAssignments() {
    let didSomething = false;
    const now = new Date();
    for (const routeAbbreviation in routePositionData) {
        for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
            if (!routeAssignments[routeAbbreviation][slotIdx].isAssigned) {
                continue;
            }
            if (!routeAssignments[routeAbbreviation][slotIdx].weakAssignment &&
                  ( (now - routeAssignments[routeAbbreviation][slotIdx].latestUpdate   > (10 * 60 * 1000)) ||
                    (now - routeAssignments[routeAbbreviation][slotIdx].latestMovement > (60 * 60 * 1000))   ))
            {
                // The assignment is strong, but we have either not received any data
                // in 10+ minutes or the ship hasn't moved in 1+ hours. Mark the assignment weak.
                logger.debug(`  No update or no movement: weakening association to route ` + // ??
                            `${routeAbbreviation}, slot ${slotIdx}`); // ??
                routeAssignments[routeAbbreviation][slotIdx].weakAssignment = true;
                didSomething = true;
            }
        }
    }
    if (didSomething) {
       // writeRouteAssignmentsToDisk();
    }
    printCurrentProgress(); // ??
}

/**
 * Outputs a ship's current status
 *
 * For debug only.
 */
function printCurrentProgress() {
    logger.debug(`\n${hhmmss()} Route:  0                 1                 ` +
                `2                 3                 4`);
    const now = new Date();
    for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
        let logString = '         Ship:   ';
        for (const routeAbbreviation in routePositionData) {
            const assignment = routeAssignments[routeAbbreviation][slotIdx];
            if (!assignment.isAssigned) {
                logString += '----------        ';
            } else {
                logString += (assignment.shipName + '                  ')
                    .substring(0, 16) + '  ';
            }
        }
        logger.debug(logString);
        logString = '                 ';
        for (const routeAbbreviation in routePositionData) {
            const assignment = routeAssignments[routeAbbreviation][slotIdx];
            if (!assignment.isAssigned) {
                logString += '                  ';
            } else {
                const minutes = (now - assignment.latestUpdate) / (60 * 1000);
                let newFraction = assignment.progressFraction +
                      assignment.progressRate * minutes;
                if (newFraction < 0) newFraction = 0;
                if (newFraction > 1) newFraction = 1;
                let progressStr = Math.round(newFraction * 100) +
                    '%  ' + Number(assignment.progressRate * 100).toFixed(1) +
                    '%/min          ';
                logString += progressStr.substring(0, 16) + '  ';
            }
        }
        logger.debug(logString);
    }
}

/**
 * Returns a string with the current
 * time in the form ' 7:02:05'.
 *
 * For debug only.
 */
function hhmmss() {
    const now = new Date();
    let   hh = now.getHours();
    const mm = now.getMinutes();
    const ss = now.getSeconds();

    if (hh == 0) hh = 12;  // Convert from 24 hour to 12 hour format
    if (hh > 12) hh -= 12;

    let returnString = '';
    if (hh < 10) returnString += ' ';
    returnString += hh + ':';
    if (mm < 10) returnString += '0';
    returnString += mm + ':';
    if (ss < 10) returnString += '0';
    returnString += ss;

    return returnString;
}

/**
 * Writes a file with the latest associations of ships
 * to routes.
 *
 * This allows fast restart without waiting for the code
 * to deduce the associations from scratch.
 *
 * Only four fields are persistent enough to save:
 *   @isAssigned, @weakAssignment, @MMSI, @shipName
 */
function writeRouteAssignmentsToDisk() {
    const jsonString = JSON.stringify(
        routeAssignments, ['isAssigned', 'weakAssignment', 'MMSI', 'shipName' ], 2);

    writeFile(routeFileName, jsonString, (error) => {
        if (error) {
            logger.debug('Error writing route assignments to disk: ', error);
        }
    });
}

/**
 * For each route, creates an array that gives the
 * fraction that each point is along the way.
 *
 * Writes @routeSegmentFractions
 *
 * If there are n points,
 *   fraction [0] = 0.0 and fraction [n-1] = 1.0
 */
function makeRouteFractions() {
    routeSegmentFractions.length = 0; // Start empty
    for (const routeAbbreviation in routePositionData) {
        const route = routePositionData[routeAbbreviation];
        const fractions = [];
        let routeLength = 0;
        // Get the length of each segment in this route
        fractions[0] = 0;
        for (let idx = 1; idx < route.length; idx++) {
            // Get the length from point[idx] to point[idx+1]
            const deltaLat = (route[idx - 1][0] - route[idx][0]);
            const deltaLon = (route[idx - 1][1] - route[idx][1]) * LON_SCALE;
            let segmentDistance = Math.sqrt(deltaLat ** 2 + deltaLon ** 2);
            fractions[idx] = segmentDistance;
            routeLength += segmentDistance;
        }
        // Divide each segment length by the total length  and sum
        // to get the fraction accumulation
        for (let idx = 1; idx < route.length; idx++) {
            fractions[idx] = fractions[idx - 1] + (fractions[idx] / routeLength);
        }
        routeSegmentFractions.push(fractions);
    }
}

export { DOCK_DISTANCE, DOCKED_SPEED, LON_SCALE, MAX_DISTANCE_FROM_ROUTE,
                   numSlots, routeAssignments,
                   routeSegmentFractions,
                   writeRouteAssignmentsToDisk };
