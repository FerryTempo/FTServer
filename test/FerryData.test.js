import { describe } from 'mocha';
import { expect, use } from 'chai';
import chaiJSONSchema from 'chai-json-schema';
import { readFileSync } from 'fs';

// Get the JSON Schema for Ferry Tempo data from reference
const FerryTempoSchema = JSON.parse(readFileSync('reference/FerryTempoSchema.json'));

// Set up Chai JSON Schema plugin
use(chaiJSONSchema);

import FerryData from '../src/FerryData.js';

describe('FerryData:', () => {
  const testData = {
    'testAttribute': 'testvalue',
    'testParent': {
      'childTestAttribute': 'testvalue',
    },
  };

  describe('setFerryData/getFerryData', () => {
    it('should store and return stored arbitrary data objects', () => {
      FerryData.setFerryData(testData);

      expect(FerryData.getFerryData()).to.eql(testData);
    });
  }),

  describe('getRouteData', () => {
    it('should return a FerryTempoData object', () => {
      const obj = {};

      expect(obj).to.be.jsonSchema(FerryTempoSchema);
    });
  });
});
