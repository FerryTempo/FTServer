import routeFTData from '../data/RouteFTData.js';
import routeGroupData from '../data/RouteGroupData.js';
import routePositionData from '../data/RoutePositionData.js';

export function filterDeviceRouteData(routeData) {
  const filteredRouteData = JSON.parse(JSON.stringify(routeData));
  delete filteredRouteData.RouteAlerts;
  for (const boatKey in filteredRouteData.boatData) {
    delete filteredRouteData.boatData[boatKey].Latitude;
    delete filteredRouteData.boatData[boatKey].Longitude;
    delete filteredRouteData.boatData[boatKey].CrossingTimeAverage;
    delete filteredRouteData.boatData[boatKey].StopTimerAverage;
    delete filteredRouteData.boatData[boatKey].LastDepartureDelay;
  }
  for (const portKey in filteredRouteData.portData) {
    delete filteredRouteData.portData[portKey].TerminalLatitude;
    delete filteredRouteData.portData[portKey].TerminalLongitude;
    delete filteredRouteData.portData[portKey].PortSailingLog;
    delete filteredRouteData.portData[portKey].PortStopTimerAverage;
    delete filteredRouteData.portData[portKey].TerminalAlerts;
    delete filteredRouteData.portData[portKey].VehicleSpacesRemaining;
    delete filteredRouteData.portData[portKey].VehicleSpaces;
  }
  return filteredRouteData;
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
      filterDeviceRouteData(ferryTempoData[legId]) :
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

  const routeLinks = Object.keys(routeFTData).map(getRouteLink);

  return [
    ...Object.values(routeGroupData).map((routeGroup) => ({
      routeId: routeGroup.routeGroupID,
      label: `${routeGroup.routeGroupID} data`,
      dataHref: `/api/v1/route/${routeGroup.routeGroupID}`,
      legs: routeGroup.legs.map((legId) => getRouteLink(legId, '/debug/route')),
    })),
    ...routeLinks,
  ];
}
