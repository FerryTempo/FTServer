import { describe } from 'mocha';
import { expect, use } from 'chai';
import chaiJSONSchema from 'chai-json-schema';
import { readFileSync } from 'fs';

const FerryTempoSchema = JSON.parse(readFileSync('reference/FerryTempoSchema.json'));

use(chaiJSONSchema);

// import FerryData from '../src/FerryData.js'

describe('FerryData:', () => {
  describe('getRouteData', () => {
    it('should return a FerryTempoData object', () => {
      const obj = {};

      expect(obj).to.be.jsonSchema(FerryTempoSchema);
    });
  });
});
