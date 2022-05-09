// import { describe } from 'mocha';
// import { expect, use } from 'chai';
// import chaiJSONSchema from 'chai-json-schema';
// import { readFileSync } from 'fs';

// // Get the JSON Schema for Ferry Tempo data
// const FerryTempoSchema = JSON.parse(readFileSync('schemas/FerryTempo.json'));

// // Set up Chai JSON Schema plugin
// use(chaiJSONSchema);

// import VesselData from '../src/VesselData.js';
// TODO: Enable with updated architecture

// describe('VesselData:', () => {
//   const testData = {
//     'testAttribute': 'testvalue',
//     'testParent': {
//       'childTestAttribute': 'testvalue',
//     },
//   };

//   describe('setVesselData/getVesselData', () => {
//     it('should store and return stored arbitrary data objects', () => {
//       VesselData.setVesselData(testData);

//       expect(VesselData.getVesselData()).to.eql(testData);
//     });
//   }),

//   describe('getRouteData', () => {
//     it('should return a FerryTempoData object', () => {
//       expect(VesselData.getRouteData('sea-bi')).to.be.jsonSchema(FerryTempoSchema);
//     });
//   });
// });
