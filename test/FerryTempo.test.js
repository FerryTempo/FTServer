import {
    getCurrentEpochSeconds,
    getEpochSecondsFromWSDOT,
    getHumanDateFromEpochSeconds,
    getProgress,
    updateAverage,
    getAverage,
    getRouteFromTerminals
  } from './Utils.js';
  import routeFTData from '../data/RouteFTData.js';
  import routePositionData from '../data/RoutePositionData.js';
  import Logger from './Logger.js';
  import processFerryData from './path_to_your_code.js';
  
  jest.mock('./Utils.js');
  jest.mock('../data/RouteFTData.js');
  jest.mock('../data/RoutePositionData.js');
  jest.mock('./Logger.js');
  
  describe('processFerryData', () => {
    let logger;
    let vesselData;
  
    beforeEach(() => {
      logger = new Logger();
      jest.clearAllMocks();
      vesselData = [
        {
          VesselID: 1,
          VesselName: 'Vessel 1',
          DepartingTerminalID: 1,
          DepartingTerminalName: 'Terminal A',
          DepartingTerminalAbbrev: 'TA',
          ArrivingTerminalName: 'Terminal B',
          ArrivingTerminalAbbrev: 'TB',
          Latitude: 47.6062,
          Longitude: -122.3321,
          Speed: 15,
          Heading: 90,
          InService: true,
          AtDock: false,
          LeftDock: '2021-12-01T12:00:00Z',
          Eta: '2021-12-01T12:30:00Z',
          ScheduledDeparture: '2021-12-01T12:00:00Z',
          OpRouteAbbrev: ['AB'],
          VesselPositionNum: 1,
          TimeStamp: '2021-12-01T12:05:00Z',
          VesselWatchShutID: null,
          VesselWatchShutMsg: '',
          VesselWatchShutFlag: 0,
        }
      ];
    });
  
    it('should process vessel data correctly', () => {
      getEpochSecondsFromWSDOT.mockReturnValueOnce(1638360000) // LeftDock
        .mockReturnValueOnce(1638361800) // Eta
        .mockReturnValueOnce(1638360300) // TimeStamp
        .mockReturnValueOnce(1638360000) // ScheduledDeparture
        .mockReturnValueOnce(1638360300); // TimeStamp
  
      getCurrentEpochSeconds.mockReturnValue(1638360300);
      getProgress.mockReturnValue(0.5);
      getAverage.mockReturnValue(10);
      updateAverage.mockReturnValue(15);
      getRouteFromTerminals.mockReturnValue('AB');
  
      const result = processFerryData(vesselData);
  
      expect(result).toEqual(expect.any(Object));
      expect(getEpochSecondsFromWSDOT).toHaveBeenCalledTimes(5);
      expect(getCurrentEpochSeconds).toHaveBeenCalledTimes(1);
      expect(getProgress).toHaveBeenCalledTimes(1);
      expect(getAverage).toHaveBeenCalledTimes(2);
      expect(updateAverage).toHaveBeenCalledTimes(1);
      expect(getRouteFromTerminals).toHaveBeenCalledTimes(1);
    });
  
    it('should handle vessels not in service', () => {
      vesselData[0].InService = false;
  
      const result = processFerryData(vesselData);
  
      expect(result).toEqual(expect.any(Object));
      expect(result['AB'].boatData.boat1.InService).toBe(false);
    });
  
    it('should compute route if OpRouteAbbrev is null', () => {
      vesselData[0].OpRouteAbbrev = null;
  
      getRouteFromTerminals.mockReturnValue('AB');
      const result = processFerryData(vesselData);
  
      expect(getRouteFromTerminals).toHaveBeenCalledWith('Terminal A', 'Terminal B');
      expect(result).toEqual(expect.any(Object));
    });
  
    it('should log debug messages when VesselWatchShutFlag is non-zero', () => {
      vesselData[0].VesselWatchShutFlag = 1;
      vesselData[0].VesselWatchShutMsg = 'Test Message';
  
      processFerryData(vesselData);
  
      expect(logger.debug).toHaveBeenCalledWith('Vessel 1 has message: Test Message');
    });
  
    it('should handle vessels at dock', () => {
      vesselData[0].AtDock = true;
  
      getCurrentEpochSeconds.mockReturnValue(1638360300);
      const result = processFerryData(vesselData);
  
      expect(result).toEqual(expect.any(Object));
      expect(result['AB'].boatData.boat1.AtDock).toBe(true);
    });
  });
  