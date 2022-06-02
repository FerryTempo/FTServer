import { describe } from 'mocha';
import { expect, use } from 'chai';
import chaiJSONSchema from 'chai-json-schema';
// import { readFileSync } from 'fs';

// Get the JSON Schema for Ferry Tempo data
// const FerryTempoSchema = JSON.parse(readFileSync('schemas/FerryTempo..schemajson'));

// Set up Chai JSON Schema plugin
use(chaiJSONSchema);

import FTData from '../src/FTData.js';

describe('FTData:', () => {
  describe('getProgress', () => {
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
      const epochEta = Date.now() + 1000;
      const epochLeftDock = Date.now() - 1000;
      expect(FTData.getProgress(false, epochEta, epochLeftDock)).to.equal(0.5);
    });

    it('should return ~0.9 when nearly arrived', () => {
      const epochEta = Date.now() + 100;
      const epochLeftDock = Date.now() - 1000;
      expect(FTData.getProgress(false, epochEta, epochLeftDock)).to.be.greaterThanOrEqual(0.9);
    });

    it('should return ~0.1 when just left arrived', () => {
      const epochEta = Date.now() + 1000;
      const epochLeftDock = Date.now() - 100;
      expect(FTData.getProgress(false, epochEta, epochLeftDock)).to.be.lessThanOrEqual(0.1);
    });
  });
});
