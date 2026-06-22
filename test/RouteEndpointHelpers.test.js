import {
  buildReferenceScheduleGroupResponse,
  buildRouteGroupResponse,
  filterDeviceRouteData,
  getDebugRouteLinks,
  isKnownRouteOrRouteGroup,
  isRouteGroupLeg,
} from '../src/RouteEndpointHelpers.js';

function buildRouteData(routeId) {
  return {
    routeID: routeId,
    RouteAlerts: [{Title: 'Alert'}],
    boatData: {
      boat1: {
        MMSI: 111,
        Latitude: 47,
        Longitude: -122,
        CrossingTimeAverage: 120,
        StopTimerAverage: 30,
        LastDepartureDelay: 10,
        VesselPosition: 1,
      },
      boat3: {
        MMSI: 333,
        Latitude: 48,
        Longitude: -123,
        CrossingTimeAverage: 180,
        StopTimerAverage: 40,
        LastDepartureDelay: 20,
        VesselPosition: 3,
      },
    },
    portData: {
      portWN: {
        TerminalLatitude: 47,
        TerminalLongitude: -122,
        PortSailingLog: [],
        PortStopTimerAverage: 10,
        TerminalAlerts: [],
        VehicleSpacesRemaining: 20,
        VehicleSpaces: {},
      },
      portES: {
        TerminalLatitude: 48,
        TerminalLongitude: -123,
        PortSailingLog: [],
        PortStopTimerAverage: 20,
        TerminalAlerts: [],
        VehicleSpacesRemaining: 30,
        VehicleSpaces: {},
      },
    },
  };
}

describe('Route endpoint helpers', () => {
  test('builds grouped triangle route responses from leg data', () => {
    const ferryTempoData = {
      'f-v': buildRouteData('14'),
      's-v': buildRouteData('15'),
      'f-s': buildRouteData('13'),
    };

    expect(buildRouteGroupResponse('triangle', ferryTempoData)).toMatchObject({
      routeGroupID: 'triangle',
      routeGroupName: 'Fauntleroy / Vashon / Southworth',
      legs: {
        'f-v': {routeID: '14'},
        's-v': {routeID: '15'},
        'f-s': {routeID: '13'},
      },
    });
  });

  test('returns null for incomplete grouped route responses', () => {
    const ferryTempoData = {
      'f-v': buildRouteData('14'),
      's-v': buildRouteData('15'),
    };

    expect(buildRouteGroupResponse('triangle', ferryTempoData)).toBeNull();
    expect(buildRouteGroupResponse('unknown', ferryTempoData)).toBeNull();
  });

  test('filters grouped device route data without dropping boat3', () => {
    const ferryTempoData = {
      'f-v': buildRouteData('14'),
      's-v': buildRouteData('15'),
      'f-s': buildRouteData('13'),
    };

    const routeGroup = buildRouteGroupResponse('triangle', ferryTempoData, true);

    expect(routeGroup.legs['f-v'].RouteAlerts).toBeUndefined();
    expect(routeGroup.legs['f-v'].boatData.boat3).toMatchObject({
      MMSI: 333,
      VesselPosition: 3,
    });
    expect(routeGroup.legs['f-v'].boatData.boat3.Latitude).toBeUndefined();
    expect(routeGroup.legs['f-v'].portData.portWN.PortSailingLog).toBeUndefined();
  });

  test('filters single route device data without dropping boat3', () => {
    const routeData = filterDeviceRouteData(buildRouteData('14'));

    expect(routeData.RouteAlerts).toBeUndefined();
    expect(routeData.boatData.boat3).toMatchObject({
      MMSI: 333,
      VesselPosition: 3,
    });
    expect(routeData.boatData.boat3.Latitude).toBeUndefined();
  });

  test('builds grouped reference schedule responses', () => {
    const referenceSchedules = {
      'f-v': {RouteID: 14},
      's-v': {RouteID: 15},
      'f-s': {RouteID: 13},
    };

    expect(buildReferenceScheduleGroupResponse('triangle', referenceSchedules)).toEqual({
      routeGroupID: 'triangle',
      routeGroupName: 'Fauntleroy / Vashon / Southworth',
      legs: referenceSchedules,
    });
  });

  test('identifies known route groups and route IDs', () => {
    expect(isKnownRouteOrRouteGroup('triangle')).toBe(true);
    expect(isKnownRouteOrRouteGroup('f-v')).toBe(true);
    expect(isKnownRouteOrRouteGroup('unknown')).toBe(false);
  });

  test('identifies route group legs', () => {
    expect(isRouteGroupLeg('f-v')).toBe(true);
    expect(isRouteGroupLeg('s-v')).toBe(true);
    expect(isRouteGroupLeg('f-s')).toBe(true);
    expect(isRouteGroupLeg('triangle')).toBe(false);
    expect(isRouteGroupLeg('sea-bi')).toBe(false);
  });

  test('builds debug links for the triangle group and route legs', () => {
    const debugLinks = getDebugRouteLinks();
    const triangle = debugLinks.find((link) => link.routeId === 'triangle');
    const seaBi = debugLinks.find((link) => link.routeId === 'sea-bi');
    const fv = triangle.legs.find((link) => link.routeId === 'f-v');

    expect(triangle).toMatchObject({
      dataHref: '/api/v1/route/triangle',
    });
    expect(seaBi).toMatchObject({
      label: 'sea-bi data',
      dataHref: '/api/v1/route/sea-bi',
    });
    expect(seaBi.progressHref).toContain('/progress?routeId=sea-bi');
    expect(debugLinks.map((link) => link.routeId)).toEqual([
      'pt-cou',
      'muk-cl',
      'ed-king',
      'sea-bi',
      'sea-br',
      'triangle',
      'pd-tal',
    ]);
    expect(triangle.legs.map((leg) => leg.routeId)).toEqual(['f-s', 'f-v', 's-v']);
    expect(triangle.legs[1].dataHref).toEqual('/debug/route/f-v');
    expect(triangle.legs[1].progressHref).toContain('/progress?routeId=f-v');
    expect(fv.progressHref).toContain('/progress?routeId=f-v');
    expect(debugLinks.find((link) => link.routeId === 'f-v')).toBeUndefined();
  });
});
