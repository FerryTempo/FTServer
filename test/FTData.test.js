import { describe } from 'mocha';
import { expect, use } from 'chai';
import chaiJSONSchema from 'chai-json-schema';
import { readFileSync } from 'fs';
import FTData from '../src/FTData.js';

// Get the JSON Schema for Ferry Tempo data
const FerryTempoSchema = JSON.parse(readFileSync('schemas/FerryTempo.schema.json'));

// Get the mock vessel data
const MockVesselData = JSON.parse(readFileSync('test/mockVesselData.json'));

// Set up Chai JSON Schema plugin
use(chaiJSONSchema);

describe('FTData.getProgress', () => {
  it('should return 0 if AtDock is true', () => {
    expect(FTData.getProgress(true, 1, 1)).to.equal(0);
  });

  it('should return 0 if epochEta is missing', () => {
    expect(FTData.getProgress(false, null, 1)).to.equal(0);
  });

  it('should return 0 if epochLeftDock is missing', () => {
    expect(FTData.getProgress(false, 1, null)).to.equal(0);
  });

  it('should return 0.5 when halfway between start and ETA times', () => {
    const epochEta = (Date.now() / 1000) + 1000;
    const epochLeftDock = (Date.now() / 1000) - 1000;
    expect(FTData.getProgress(false, epochEta, epochLeftDock)).to.equal(0.5);
  });

  it('should return ~0.9 when nearly arrived', () => {
    const epochEta = (Date.now() / 1000) + 100;
    const epochLeftDock = (Date.now() / 1000) - 1000;
    expect(FTData.getProgress(false, epochEta, epochLeftDock)).to.be.greaterThanOrEqual(0.9);
  });

  it('should return ~0.1 when just left', () => {
    const epochEta = (Date.now() / 1000) + 1000;
    const epochLeftDock = (Date.now() / 1000) - 100;
    expect(FTData.getProgress(false, epochEta, epochLeftDock)).to.be.lessThanOrEqual(0.1 );
  });
});

describe('FTData.processFerryData & FTData.getRouteData', () => {
  it('should create and return an object in the FTData schema format', () => {
    /**
     * In order to test our time-based processing, Date.now must be
     * set to a time when the mockVesselData was generated.
     * @return {number} The epoch timestamp of the mock date
     */
    function mockDateNow() {
      return 1654144493000;
    }
    const originalDateNow = Date.now;
    Date.now = mockDateNow;

    FTData.processFerryData(MockVesselData);
    const routeData = FTData.getRouteData('sea-bi');
    expect(routeData).to.be.jsonSchema(FerryTempoSchema);

    // Restore normal Date.now
    Date.now = originalDateNow;
  });
});
