import routeFTData from '../data/RouteFTData.js';
import routeGroupData from '../data/RouteGroupData.js';
import routePositionData from '../data/RoutePositionData.js';

/**
 * The device view of route data: only the fields FerryClock firmware reads.
 *
 * This is an allowlist on purpose. Clocks without PSRAM have roughly 60 KB of
 * RAM left for an HTTPS request, and a denylist let every field added for the
 * app reach them too (PortSailingStates and PortVesselEvents grew device
 * responses to ~18 KB). A field reaches devices only when it is added here,
 * and a client firmware release that reads it ships alongside.
 *
 * Firmware reads these in FTClient FerryTempoClient.ino (buildDisplayState,
 * effectiveBoatEta, hasDisplayData). `lastUpdate` and `serverVersion` are
 * added by the route endpoint.
 */
export const DEVICE_BOAT_FIELDS = Object.freeze([
  'OnDuty',
  'AtDock',
  'Direction',
  'DepartureDelay',
  'DepartureDelayAverage',
  'ETA',
  'EstimatedETA',
  'Progress',
  'Speed',
  'Heading',
]);

export const DEVICE_PORT_FIELDS = Object.freeze([
  'BoatAtDock',
  'PortDepartureDelay',
  'PortETA',
  'PortStopTimer',
]);

export const ROUTE_VIEWS = Object.freeze(['full', 'device']);

function pickFields(source, fields) {
  const picked = {};
  for (const field of fields) {
    if (Object.hasOwn(source ?? {}, field)) {
      picked[field] = source[field];
    }
  }
  return picked;
}

function pickEach(entries, fields) {
  const picked = {};
  for (const key in entries ?? {}) {
    picked[key] = pickFields(entries[key], fields);
  }
  return picked;
}

export function buildDeviceRouteData(routeData) {
  return {
    boatData: pickEach(routeData.boatData, DEVICE_BOAT_FIELDS),
    portData: pickEach(routeData.portData, DEVICE_PORT_FIELDS),
  };
}

/**
 * Picks the route response view for a request.
 *
 * Clients ask with `view=device` or `view=full`. Without `view`, a request
 * carrying `cid` (only FerryClocks send it) gets the device view, so clocks
 * already in the field get the small response without a firmware update.
 * Returns null for an unknown view.
 */
export function resolveRouteView(query = {}) {
  if (query.view !== undefined) {
    // Repeated parameters (?view=a&view=b) arrive as arrays; treat them as unknown.
    const requestedView = typeof query.view === 'string' ? query.view.toLowerCase() : '';
    return ROUTE_VIEWS.includes(requestedView) ? requestedView : null;
  }
  return query.cid ? 'device' : 'full';
}

export function buildRouteGroupResponse(routeGroupId, ferryTempoData, filterForDevice = false) {
  const routeGroup = routeGroupData[routeGroupId];
  if (!routeGroup) {
    return null;
  }

  const legs = {};
  for (const legId of routeGroup.legs) {
    if (!ferryTempoData?.[legId]) {
      return null;
    }
    legs[legId] = filterForDevice ?
      buildDeviceRouteData(ferryTempoData[legId]) :
      ferryTempoData[legId];
  }

  return {
    routeGroupID: routeGroup.routeGroupID,
    routeGroupName: routeGroup.routeGroupName,
    legs,
  };
}

export function buildReferenceScheduleGroupResponse(routeGroupId, referenceSchedules) {
  const routeGroup = routeGroupData[routeGroupId];
  if (!routeGroup) {
    return null;
  }

  const legs = {};
  for (const legId of routeGroup.legs) {
    if (!referenceSchedules?.[legId]) {
      return null;
    }
    legs[legId] = referenceSchedules[legId];
  }

  return {
    routeGroupID: routeGroup.routeGroupID,
    routeGroupName: routeGroup.routeGroupName,
    legs,
  };
}

export function isKnownRouteOrRouteGroup(routeId) {
  return routeFTData.hasOwnProperty(routeId) || routeGroupData.hasOwnProperty(routeId);
}

export function isRouteGroupLeg(routeId) {
  return Object.values(routeGroupData).some((routeGroup) => routeGroup.legs.includes(routeId));
}

export function getDebugRouteLinks() {
  const getRouteLink = (routeId, dataHrefPrefix = '/api/v1/route') => {
    const progressPoint = routePositionData[routeId][routePositionData[routeId].length - 1];
    return {
      routeId,
      label: `${routeId} data`,
      dataHref: `${dataHrefPrefix}/${routeId}`,
      progressHref: `/progress?routeId=${routeId}&direction=WN&lat=${progressPoint[0]}&long=${progressPoint[1]}`,
    };
  };

  const routeLinks = Object.keys(routeFTData)
      .filter((routeId) => !isRouteGroupLeg(routeId))
      .map((routeId) => getRouteLink(routeId));
  const routeGroupLinks = Object.values(routeGroupData).map((routeGroup) => ({
    routeId: routeGroup.routeGroupID,
    label: `${routeGroup.routeGroupID} data`,
    dataHref: `/api/v1/route/${routeGroup.routeGroupID}`,
    legs: routeGroup.legs.map((legId) => getRouteLink(legId, '/debug/route')),
  }));

  const triangleGroupLink = routeGroupLinks.find((routeLink) => routeLink.routeId === 'triangle');
  const otherRouteGroupLinks = routeGroupLinks.filter((routeLink) => routeLink.routeId !== 'triangle');
  const triangleInsertionIndex = routeLinks.findIndex((routeLink) => routeLink.routeId === 'sea-br') + 1;
  const routeLinksWithTriangle = triangleGroupLink && triangleInsertionIndex > 0 ?
    [
      ...routeLinks.slice(0, triangleInsertionIndex),
      triangleGroupLink,
      ...routeLinks.slice(triangleInsertionIndex),
    ] :
    routeLinks;

  return [
    ...routeLinksWithTriangle,
    ...otherRouteGroupLinks,
  ];
}
