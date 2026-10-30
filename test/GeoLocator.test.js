import GeoLocator, { databaseUrl, formatLocation } from '../src/GeoLocator.js';

describe('databaseUrl', () => {
  test('names the month DB-IP published', () => {
    expect(databaseUrl(new Date(Date.UTC(2026, 0, 15)))).toBe(
        'https://download.db-ip.com/free/dbip-city-lite-2026-01.mmdb.gz',
    );
  });
});

describe('formatLocation', () => {
  test('joins city, region and country', () => {
    expect(formatLocation({
      city: { names: { en: 'Bainbridge Island' } },
      subdivisions: [{ names: { en: 'Washington' } }],
      country: { iso_code: 'US' },
    })).toBe('Bainbridge Island, Washington, US');
  });

  test('drops a city that repeats the region and missing parts', () => {
    expect(formatLocation({
      city: { names: { en: 'Washington' } },
      subdivisions: [{ names: { en: 'Washington' } }],
      country: { iso_code: 'US' },
    })).toBe('Washington, US');
    expect(formatLocation({ country: { iso_code: 'CA' } })).toBe('CA');
    expect(formatLocation(null)).toBe('');
  });
});

describe('GeoLocator', () => {
  test('returns no location when disabled or given an invalid address', () => {
    const geoLocator = new GeoLocator({ enabled: false, directory: 'unused' });
    expect(geoLocator.lookup('203.0.113.1')).toBe('');
    expect(geoLocator.lookup('not-an-ip')).toBe('');
  });
});
