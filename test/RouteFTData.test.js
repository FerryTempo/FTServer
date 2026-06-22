import routeFTData from '../data/RouteFTData.js';

describe('RouteFTData', () => {
  test('defines default crossing seconds for every route', () => {
    for (const [routeId, routeData] of Object.entries(routeFTData)) {
      expect(routeData.defaultCrossingSeconds).toEqual(expect.any(Number));
      expect(routeData.defaultCrossingSeconds).toBeGreaterThan(0);
    }
  });
});
