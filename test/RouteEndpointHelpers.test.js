import {
  buildReferenceScheduleGroupResponse,
  buildRouteGroupResponse,
  buildDeviceRouteData,
  DEVICE_BOAT_FIELDS,
  DEVICE_PORT_FIELDS,
  getDebugRouteLinks,
  isKnownRouteOrRouteGroup,
  isRouteGroupLeg,
  resolveRouteView,
} from '../src/RouteEndpointHelpers.js';

// Fields FerryClock firmware reads (FTClient FerryTempoClient.ino). Changing
// these lists changes what every clock receives, so this test pins them.
const EXPECTED_DEVICE_BOAT_FIELDS = [
  'AtDock', 'DepartureDelay', 'DepartureDelayAverage', 'Direction', 'ETA',
  'EstimatedETA', 'Heading', 'OnDuty', 'Progress', 'Speed',
];
const EXPECTED_DEVICE_PORT_FIELDS = ['BoatAtDock', 'PortDepartureDelay', 'PortETA', 'PortStopTimer'];

function deviceBoatValues(seed) {
  return {
    OnDuty: true,
    AtDock: false,
    Direction: 'WN',
    DepartureDelay: seed,
    DepartureDelayAverage: seed + 1,
    ETA: null,
    EstimatedETA: 1793930820 + seed,
    Progress: 0.5,
    Speed: 10.3,
    Heading: 111,
  };
}

function devicePortValues(seed) {
  return {
    BoatAtDock: true,
    PortDepartureDelay: seed,
    PortETA: 1793930820 + seed,
    PortStopTimer: seed * 10,
  };
}

function buildRouteData(routeId) {
  return {
    routeID: routeId,
    defaultCrossingSeconds: 2100,
    RouteAlerts: [{Title: 'Alert'}],
    boatData: {
      boat1: {
        ...deviceBoatValues(1),
        MMSI: 111,
        Latitude: 47,
        Longitude: -122,
        CrossingTimeAverage: 120,
        StopTimerAverage: 30,
        LastDepartureDelay: 10,
        VesselPosition: 1,
      },
      boat3: {
        ...deviceBoatValues(3),
        MMSI: 333,
        Latitude: 48,
        Longitude: -123,
        CrossingTimeAverage: 180,
        StopTimerAverage: 40,
        LastDepartureDelay: 20,
        LastStop: 40,
        VesselPosition: 3,
      },
    },
    portData: {
      portWN: {
        ...devicePortValues(2),
        PortSailingStates: [{state: 'large app-only history'}],
        PortVesselEvents: [{event: 'large app-only history'}],
        TerminalLatitude: 47,
        TerminalLongitude: -122,
        PortSailingLog: [],
        PortRepositionLog: [],
        PortStopTimerAverage: 10,
        PortLastStop: 30,
        PortLastDepartureDelay: 0,
        TerminalAlerts: [],
        VehicleSpacesRemaining: 20,
        VehicleSpaces: {},
      },
      portES: {
        ...devicePortValues(4),
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

  test('pins the device field allowlist', () => {
    expect([...DEVICE_BOAT_FIELDS].sort()).toEqual(EXPECTED_DEVICE_BOAT_FIELDS);
    expect([...DEVICE_PORT_FIELDS].sort()).toEqual(EXPECTED_DEVICE_PORT_FIELDS);
  });

  test('device view keeps exactly the allowlisted fields for every boat and port', () => {
    const routeData = buildRouteData('14');
    const deviceData = buildDeviceRouteData(routeData);

    expect(Object.keys(deviceData).sort()).toEqual(['boatData', 'portData']);
    expect(Object.keys(deviceData.boatData).sort()).toEqual(['boat1', 'boat3']);
    expect(Object.keys(deviceData.portData).sort()).toEqual(['portES', 'portWN']);
    expect(deviceData.boatData.boat1).toEqual(deviceBoatValues(1));
    expect(deviceData.boatData.boat3).toEqual(deviceBoatValues(3));
    expect(deviceData.portData.portWN).toEqual(devicePortValues(2));
    expect(deviceData.portData.portES).toEqual(devicePortValues(4));
  });

  test('device view drops new fields by default', () => {
    const routeData = buildRouteData('14');
    routeData.boatData.boat1.SomeNewAppField = 'x'.repeat(10000);
    routeData.portData.portWN.AnotherNewAppField = ['x'.repeat(10000)];

    const deviceData = buildDeviceRouteData(routeData);

    expect(deviceData.boatData.boat1.SomeNewAppField).toBeUndefined();
    expect(deviceData.portData.portWN.AnotherNewAppField).toBeUndefined();
    expect(JSON.stringify(deviceData).length).toBeLessThan(1000);
  });

  test('device view omits allowlisted fields the source lacks and keeps nulls', () => {
    const deviceData = buildDeviceRouteData({
      boatData: {boat1: {OnDuty: false, ETA: null}},
      portData: {portWN: {}},
    });

    expect(deviceData.boatData.boat1).toEqual({OnDuty: false, ETA: null});
    expect(deviceData.portData.portWN).toEqual({});
  });

  test('device view does not modify the source data', () => {
    const routeData = buildRouteData('14');
    const before = JSON.stringify(routeData);

    buildDeviceRouteData(routeData);

    expect(JSON.stringify(routeData)).toBe(before);
  });

  test('grouped device route data uses the device view for every leg', () => {
    const ferryTempoData = {
      'f-v': buildRouteData('14'),
      's-v': buildRouteData('15'),
      'f-s': buildRouteData('13'),
    };

    const routeGroup = buildRouteGroupResponse('triangle', ferryTempoData, true);

    expect(routeGroup).toMatchObject({routeGroupID: 'triangle'});
    for (const legId of ['f-v', 's-v', 'f-s']) {
      expect(routeGroup.legs[legId]).toEqual(buildDeviceRouteData(ferryTempoData[legId]));
    }
    expect(routeGroup.legs['f-v'].boatData.boat3).toEqual(deviceBoatValues(3));
  });

  test('resolves the route view from the request query', () => {
    expect(resolveRouteView({})).toBe('full');
    expect(resolveRouteView()).toBe('full');
    expect(resolveRouteView({view: 'device'})).toBe('device');
    expect(resolveRouteView({view: 'DEVICE'})).toBe('device');
    expect(resolveRouteView({view: 'full'})).toBe('full');
    // Clocks already in the field send cid and no view.
    expect(resolveRouteView({cid: 'ABC123'})).toBe('device');
    // An explicit view wins over cid.
    expect(resolveRouteView({cid: 'ABC123', view: 'full'})).toBe('full');
    expect(resolveRouteView({view: 'compact'})).toBeNull();
    expect(resolveRouteView({view: ''})).toBeNull();
    expect(resolveRouteView({view: ['device', 'full']})).toBeNull();
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
