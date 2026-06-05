import {
    getBoundingBoxes,
    getBoatMMSIList,
    dockedStatus,
    boatIsNearSeattle,
    initializeRouteAssignements,
    estimateRoute,
    getFTData,
    updateAISData,
} from '../src/RouteUtilities';
import boatData from '../data/BoatData';
import routePositionData from '../data/RoutePositionData';
import routeFTData from '../data/RouteFTData';

function getExpectedBoundingBoxes() {
    return Object.values(routePositionData).map((route) => {
        const lats = route.map((point) => point[0]);
        const lons = route.map((point) => point[1]);
        return [
            [Math.min(...lats) - 0.01, Math.min(...lons) - 0.01],
            [Math.max(...lats) + 0.01, Math.max(...lons) + 0.01],
        ];
    });
}

function getEmptyAssignment(slotCount) {
    return Array.from({length: slotCount}, () => ({
        IsAssigned: false,
        LatestUpdate: 0,
        WeakAssignment: true,
        MMSI: 0
    }));
}

describe('getBoundingBoxes function', () => {
    test('should return the set of bounding boxes for the ferry routes', () => {
      expect(getBoundingBoxes()).toEqual(getExpectedBoundingBoxes());
    });
});
   
describe('getBoatMMSIList function', () => {
    test('should return the set of MMSI values for all boats in the fleet', () => {
        const mmsiList = ["366709770","366709780","366710820","366759130","366772750","366772760","366772780",
            "366772960","366772980","366773040","366773070","366773090","367463060","367479990","367649320",
            "367712660","368027230"];
        expect(getBoatMMSIList()).toEqual(mmsiList);
    });
});

describe('initializeRouteAssignements function', () => {
    test('should return an empty structure of route assignments', () => {
        const routes = Object.fromEntries(Object.keys(routePositionData).map((routeAbbreviation) => {
            return [
                routeAbbreviation,
                getEmptyAssignment(routeFTData[routeAbbreviation]?.maxBoatSlots || 2),
            ];
        }));
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
    test('should return pd-tal since this is Tahlequah)', () => {
        expect(estimateRoute([47.331590, -122.508002])).toEqual(['pd-tal',0]);
    });
    test('should return f-v since this is Fauntleroy)', () => {
        const [route, distance] = estimateRoute([47.523200, -122.396700]);
        expect(route).toEqual('f-v');
        expect(distance).toBeCloseTo(0);
    });
    test('should return s-v since this is Southworth)', () => {
        const [route, distance] = estimateRoute([47.513064, -122.495742]);
        expect(route).toEqual('s-v');
        expect(distance).toBeCloseTo(0);
    });
});

describe('updateAISData function', () => {
    test('clears boat assignment state when WSDOT removes an extra route slot', () => {
        updateAISData({
            'sea-bi': [
                {MMSI: 366772760, Position: 1},
                {MMSI: 366749710, Position: 2},
            ],
        });

        expect(boatData['366749710']['AssignedRoute']).toBe('sea-bi');
        expect(boatData['366749710']['AssignedPosition']).toBe(2);
        expect(boatData['366749710']['AssignedSlot']).toBe(1);
        expect(boatData['366749710']['RouteConfirmed']).toBe(true);

        updateAISData({
            'sea-bi': [
                {MMSI: 366772760, Position: 1},
            ],
        });

        expect(boatData['366749710']['AssignedRoute']).toBe('');
        expect(boatData['366749710']['AssignedPosition']).toBe('');
        expect(boatData['366749710']['AssignedSlot']).toBe(-1);
        expect(boatData['366749710']['RouteConfirmed']).toBe(false);
    });

    test('marks AIS boats off duty after one idle hour in epoch seconds', () => {
        updateAISData({
            'sea-bi': [
                {MMSI: 366772760, Position: 1},
            ],
        });

        boatData['366772760']['LastMoveTime'] = Math.floor(Date.now() / 1000) - (60 * 60) - 1;

        expect(getFTData()['sea-bi']['boatData']['boat1']['OnDuty']).toBe(false);
    });
});
