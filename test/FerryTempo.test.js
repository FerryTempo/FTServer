import routeFTData from '../data/RouteFTData.js';
import {
  getCurrentEpochSeconds,
  getEpochSecondsFromWSDOT,
  getHumanDateFromEpochSeconds,
  getProgress,
  updateAverage,
  getAverage,
  getRouteFromTerminals
} from '../src/Utils.js';
import routePositionData from '../data/RoutePositionData.js';
import Logger from '../src/Logger.js';
import FerryTempo from '../src/FerryTempo.js';
import { jest } from '@jest/globals'

//jest.mock('../src/Utils.js', () => {
  //getCurrentEpochSeconds: jest.fn( () => {return 172141680});
//});

// jest.mock('../data/RoutePositionData.js');
// jest.mock('../src/Logger.js');
jest.mock('../data/RouteFTData.js', () => ({
  'sea-bi': {
    'boatData': {},
    'routeID': '5',
    'portData': {
      'portES': {
        'TerminalName': 'Seattle',
        'TerminalAbbrev': 'P52',
        'TerminalID': 7,
        'BoatAtDock': false,
        'NextScheduledSailing': null,
        'PortDepartureDelay': null,
        'PortETA': null,
      },
      'portWN': {
        'TerminalName': 'Bainbridge Island',
        'TerminalAbbrev': 'BBI',
        'TerminalID': 3,
        'BoatAtDock': false,
        'NextScheduledSailing': null,
        'PortDepartureDelay': null,
        'PortETA': null,
      },
    },
  }
}));

describe('processFerryData', () => {
  let logger;
  let vesselData;
  let routeData;

  beforeAll(()=> {
    jest.mock('../src/Utils.js', () => {
      getCurrentEpochSeconds: jest.fn( () => {return 172141680});
    });
  });

  beforeEach(() => {
    logger = new Logger();
    jest.clearAllMocks();
    vesselData = [
      {
        "VesselID": 74,
        "VesselName": "Chimacum",
        "Mmsi": 367712660,
        "DepartingTerminalID": 7,
        "DepartingTerminalName": "Seattle",
        "DepartingTerminalAbbrev": "P52",
        "ArrivingTerminalID": 3,
        "ArrivingTerminalName": "Bainbridge Island",
        "ArrivingTerminalAbbrev": "BBI",
        "Latitude": 47.602505,
        "Longitude": -122.34021,
        "Speed": 0,
        "Heading": 85,
        "InService": true,
        "AtDock": true,
        "LeftDock": null,
        "Eta": null,
        "EtaBasis": null,
        "ScheduledDeparture": "/Date(1721417100000-0700)/",
        "OpRouteAbbrev": [
          "sea-bi"
        ],
        "VesselPositionNum": 1,
        "SortSeq": 60,
        "ManagedBy": 1,
        "TimeStamp": "/Date(1721417003000-0700)/",
        "VesselWatchShutID": 11,
        "VesselWatchShutMsg": "Vessel information unavailable. ",
        "VesselWatchShutFlag": "0",
        "VesselWatchStatus": "0",
        "VesselWatchMsg": "WSF's VesselWatch page is currently not responding and is out of service. Thank you for your patience while we work to restore this page. "
      },
      {
        "VesselID": 32,
        "VesselName": "Tacoma",
        "Mmsi": 366772760,
        "DepartingTerminalID": 3,
        "DepartingTerminalName": "Bainbridge Island",
        "DepartingTerminalAbbrev": "BBI",
        "ArrivingTerminalID": 7,
        "ArrivingTerminalName": "Seattle",
        "ArrivingTerminalAbbrev": "P52",
        "Latitude": 47.62246,
        "Longitude": -122.509092,
        "Speed": 0,
        "Heading": 282,
        "InService": true,
        "AtDock": true,
        "LeftDock": null,
        "Eta": null,
        "EtaBasis": null,
        "ScheduledDeparture": "/Date(1721416800000-0700)/",
        "OpRouteAbbrev": [
          "sea-bi"
        ],
        "VesselPositionNum": 2,
        "SortSeq": 60,
        "ManagedBy": 1,
        "TimeStamp": "/Date(1721417004000-0700)/",
        "VesselWatchShutID": 20,
        "VesselWatchShutMsg": "Vessel information unavailable",
        "VesselWatchShutFlag": "0",
        "VesselWatchStatus": "0",
        "VesselWatchMsg": "WSF's VesselWatch page is currently not responding and is out of service. Thank you for your patience while we work to restore this page. "
      }
    ];
    routeData = {
      "sea-bi": {
        "boatData": {
          "boat1": {
            "ArrivalTimeMinus": 0,
            "ArrivingTerminalAbbrev": "BBI",
            "ArrivingTerminalName": "Bainbridge Island",
            "AtDock": true,
            "BoatDepartureDelay": 0,
            "BoatETA": 0,
            "DepartingTerminalName": "Seattle",
            "DepartingTerminalAbbrev": "P52",
            "DepartureDelayAverage": 0,
            "Direction": "WN",
            "Heading": 85,
            "InService": true,
            "LeftDock": 0,
            "OnDuty": true,
            "PositionUpdated": 1721417003,
            "Progress": 0,
            "ScheduledDeparture": 1721417100,
            "Speed": 0,
            "StopTimer": 0,
            "VesselName": "Chimacum",
            "VesselPosition": 1
          },
          "boat2": {
            "ArrivalTimeMinus": 0,
            "ArrivingTerminalAbbrev": "P52",
            "ArrivingTerminalName": "Seattle",
            "AtDock": true,
            "BoatDepartureDelay": 204,
            "BoatETA": 0,
            "DepartingTerminalName": "Bainbridge Island",
            "DepartingTerminalAbbrev": "BBI",
            "DepartureDelayAverage": 0,
            "Direction": "ES",
            "Heading": 282,
            "InService": true,
            "LeftDock": 0,
            "OnDuty": true,
            "PositionUpdated": 1721417004,
            "Progress": 0,
            "ScheduledDeparture": 1721416800,
            "Speed": 0,
            "StopTimer": 0,
            "VesselName": "Tacoma",
            "VesselPosition": 2
          }
        },
        "routeID": "5",
        "portData": {
          "portES": {
            "TerminalName": "Seattle",
            "TerminalAbbrev": "P52",
            "TerminalID": 7,
            "BoatAtDock": true,
            "NextScheduledSailing": null,
            "PortDepartureDelay": 0,
            "PortETA": 0,
            "PortStopTimer": 0,
            "PortDepartureDelayAverage": 0,
            "PortArrivalTimeMinus": 0
          },
          "portWN": {
            "TerminalName": "Bainbridge Island",
            "TerminalAbbrev": "BBI",
            "TerminalID": 3,
            "BoatAtDock": true,
            "NextScheduledSailing": null,
            "PortDepartureDelay": 0,
            "PortETA": 0,
            "PortArrivalTimeMinus": 0,
            "PortStopTimer": 0,
            "PortDepartureDelayAverage": 0
          }
        }
      }
    }
  });

  it('should process vessel data correctly', () => {
    const result = FerryTempo.processFerryData(vesselData);

    // static test taken from recent server data
    expect(result['sea-bi']).toEqual(routeData['sea-bi']);
  });
  it('should return mocked current epoch seconds', () => {

    const currentEpoch = getCurrentEpochSeconds();
    expect(currentEpoch).toBe(1625097600);
  });
});
