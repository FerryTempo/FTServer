import { getBoundingBoxes, getBoatMMSIList, dockedStatus, boatIsNearSeattle, initializeRouteAssignements, estimateRoute } from '../src/RouteUtilities';

describe('getBoundingBoxes function', () => {
    test('should return the set of bounding boxes for the ferry routes', () => {
      const boundingBoxes = [[[48.094851,-122.769068],[48.169062,-122.66192]],
                            [[47.940761,-122.35936000000001],[47.984795999999996,-122.287106]],
                            [[47.780941,-122.50454500000001],[47.824357,-122.375422]],
                            [[47.548588,-122.63494],[47.612718,-122.32987299999999]],
                            [[47.592824,-122.51927400000001],[47.632453,-122.329544]]];
      expect(getBoundingBoxes()).toEqual(boundingBoxes);
    });
});
   
describe('getBoatMMSIList function', () => {
    test('should return the set of MMSI values for all boats in the fleet', () => {
        const mmsiList = ["366709770","366709780","366759130","366772750","366772760","366772780","366772960",
            "366772980","366773040","366773090","367463060","367479990","367649320","367712660","368027230"];
        expect(getBoatMMSIList()).toEqual(mmsiList);
    });
});

describe('initializeRouteAssignements function', () => {
    test('should return an empty structure of route assignments', () => {
        const routes = {
            "pt-cou": [ 
                {
                    "IsAssigned": false,
                    "LatestUpdate": 0,
                    "WeakAssignment": true,
                    "MMSI": 0
                },
                {
                    "IsAssigned": false,
                    "LatestUpdate": 0,
                    "WeakAssignment": true,
                    "MMSI": 0
                }
            ],
            "ed-king": [
                {
                    "IsAssigned": false,
                    "LatestUpdate": 0,
                    "WeakAssignment": true,
                    "MMSI": 0
                },
                {
                    "IsAssigned": false,
                    "LatestUpdate": 0,
                    "WeakAssignment": true,
                    "MMSI": 0
                }
            ],
            "muk-cl": [
                {
                    "IsAssigned": false,
                    "LatestUpdate": 0,
                    "WeakAssignment": true,
                    "MMSI": 0
                },
                {
                    "IsAssigned": false,
                    "LatestUpdate": 0,
                    "WeakAssignment": true,
                    "MMSI": 0
                }
            ],
            "sea-bi": [
                {
                    "IsAssigned": false,
                    "LatestUpdate": 0,
                    "WeakAssignment": true,
                    "MMSI": 0
                },
                {
                    "IsAssigned": false,
                    "LatestUpdate": 0,
                    "WeakAssignment": true,
                    "MMSI": 0
                }
            ],
            "sea-br": [
                {
                    "IsAssigned": false,
                    "LatestUpdate": 0,
                    "WeakAssignment": true,
                    "MMSI": 0
                },
                {
                    "IsAssigned": false,
                    "LatestUpdate": 0,
                    "WeakAssignment": true,
                    "MMSI": 0
                }
            ]
        };
        expect(initializeRouteAssignements()).toEqual(routes);
    });
});

describe('dockedStatus function', () => {
    test('should return [false,false] if the route name is invalid)', () => {
        expect(dockedStatus('InvalidRoute', 0, [0.0,0.0])).toEqual([false,false]);
    });
    test('should return [false,false] if the route name is null)', () => {
        expect(dockedStatus(null, 0, [0.0,0.0])).toEqual([false,false]);
    });
    test('should return [false,false] if input speed is null', () => {
        expect(dockedStatus('pt-cou', null, [0.0,0.0])).toEqual([false,false]);
    });
    test('should return [false,false] if input speed is greater than the docking speed (0.5)', () => {
        expect(dockedStatus('pt-cou', 1, [0.0,0.0])).toEqual([false,false]);
    });
    test('should return [true,true] based on the latitude and longitude', () => {
        expect(dockedStatus('pt-cou', 0.5, [48.158882,-122.672682])).toEqual([true,true]);
    });
    test('should return [false,false] based on the latitude and longitude', () => {
        expect(dockedStatus('ed-king', 0.5, [47.810473,-122.4032522])).toEqual([false,false]);
    });
    test('should return [false,false] based on the latitude and longitude', () => {
        expect(dockedStatus('muk-cl', 0, [47.974672,-122.349108])).toEqual([true,false]);
    });
});


describe('boatIsNearSeattle function', () => {
    test('should return true since location is the P52 dock)', () => {
        expect(boatIsNearSeattle(47.602535, -122.339873)).toEqual(true);
    });
    test('should return false since this is Bainbridge)', () => {
        expect(boatIsNearSeattle(47.622453, -122.509274)).toEqual(false);
    });
    test('should return false since long and lat are not valid for our routes', () => {
        expect(boatIsNearSeattle(0,0)).toEqual(false);
    });
});

describe('estimateRoute function', () => {
    test('should return true since location is the Clinton ferry dock)', () => {
        expect(estimateRoute([47.950761, -122.297106])).toEqual(['muk-cl',5.712763595511206e-13]);
    });
    test('should return sea-bi since this is Bainbridge)', () => {
        expect(estimateRoute([47.622453, -122.509274])).toEqual(['sea-bi',0]);
    });
});
