/**
 * ArrivalEstimate.js
 * ==================
 * A boat's arrival worked out from where it is on its route, when it left, how fast it's going and how
 * long its crossings usually take: nothing WSF-specific, so a backup position source (AIS) can feed it too.
 */
import {calculateDistance} from './Utils.js';

const KM_PER_NAUTICAL_MILE = 1.852;
// Speed only counts mid-crossing: boats slow to leave and to dock, so it says little near either end.
const SPEED_PROGRESS_START = 0.15;
const SPEED_PROGRESS_END = 0.85;
const MIN_SPEED_KNOTS = 5;

const routeLengthCache = new Map();

/**
 * The length of a route's line, in kilometres (cached by route).
 * @param {string} routeAbbreviation - Route.
 * @param {Array<Array<number>>} routeData - The route's [lat, lon] points.
 * @return {number} Kilometres.
 */
export function routeLengthKm(routeAbbreviation, routeData) {
  if (!routeLengthCache.has(routeAbbreviation)) {
    let length = 0;
    for (let index = 1; index < (routeData?.length || 0); index++) {
      length += calculateDistance(routeData[index - 1], routeData[index]);
    }
    routeLengthCache.set(routeAbbreviation, length);
  }
  return routeLengthCache.get(routeAbbreviation);
}

/**
 * Seconds until a boat underway arrives, the larger of: what's left of its usual crossing by how far it
 * has come (or, mid-crossing at speed, the distance left at its speed), and its usual crossing less the
 * time since it left (so a slow boat isn't due before it could be).
 * @param {object} boat - {crossingSeconds, progress (0 to 1), leftDock, now, speedKnots, routeKm}.
 * @return {number} Seconds, 0 when it can't be worked out.
 */
export function estimateRemainingSeconds({crossingSeconds, progress, leftDock, now, speedKnots, routeKm}) {
  if (!(crossingSeconds > 0) || !now) return 0;
  const fractionLeft = Math.max(0, 1 - (progress || 0));
  const usesSpeed = speedKnots >= MIN_SPEED_KNOTS && routeKm > 0 &&
    progress >= SPEED_PROGRESS_START && progress <= SPEED_PROGRESS_END;
  const byPosition = usesSpeed ?
    ((routeKm * fractionLeft) / KM_PER_NAUTICAL_MILE / speedKnots) * 3600 :
    crossingSeconds * fractionLeft;
  const byElapsed = leftDock ? crossingSeconds - Math.max(0, now - leftDock) : 0;
  return Math.trunc(Math.max(0, byPosition, byElapsed));
}

/**
 * The one ETA for a boat underway: WSF's while it's still ahead, else our estimate.
 * @param {number} wsfEta - WSF's ETA, epoch seconds (0 or null for none).
 * @param {number} now - Epoch seconds.
 * @param {number} remainingSeconds - From estimateRemainingSeconds.
 * @return {number|null} Epoch seconds, or null when there's none.
 */
export function bestArrivalEta(wsfEta, now, remainingSeconds) {
  if (wsfEta && wsfEta > now) return wsfEta;
  return remainingSeconds > 0 ? now + remainingSeconds : null;
}
