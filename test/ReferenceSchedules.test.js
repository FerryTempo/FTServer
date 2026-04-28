import {
  buildReferenceSchedules,
  getActiveSchedRouteId,
  getEpochSecondsFromReferenceDate,
  getReferenceTimeDisplay,
} from '../src/ReferenceSchedules.js';

function wsdotDate(epochSeconds) {
  return `/Date(${epochSeconds * 1000}-0700)/`;
}

describe('ReferenceSchedules', () => {
  test('formats WSDOT reference sailing time-of-day values', () => {
    expect(getReferenceTimeDisplay('/Date(-2208940200000-0800)/')).toBe('05:30');
  });

  test('parses WSDOT reference dates with positive and negative epoch values', () => {
    expect(getEpochSecondsFromReferenceDate(wsdotDate(1774162800))).toBe(1774162800);
    expect(getEpochSecondsFromReferenceDate('/Date(-2208940200000-0800)/')).toBe(-2208940200);
  });

  test('uses active contingency schedule route IDs when a date range applies', () => {
    const schedRoute = {
      SchedRouteID: 2434,
      ContingencyAdj: [
        {
          DateFrom: wsdotDate(1774162800),
          DateThru: wsdotDate(1775296740),
          ReplacedBySchedRouteID: 2441,
        },
      ],
    };

    expect(getActiveSchedRouteId(schedRoute, 1775000000)).toBe(2441);
    expect(getActiveSchedRouteId(schedRoute, 1776000000)).toBe(2434);
  });

  test('builds route-keyed reference schedule groups', () => {
    const schedules = buildReferenceSchedules(
        [
          {
            ScheduleID: 195,
            SchedRouteID: 2435,
            ContingencyOnly: false,
            RouteID: 5,
            RouteAbbrev: 'sea-bi',
            Description: 'Seattle / Bainbridge Island',
            SeasonalRouteNotes: 'Season note',
            ServiceDisruptions: [],
            ContingencyAdj: [],
          },
        ],
        {
          2435: [
            {
              ScheduleID: 195,
              SchedRouteID: 2435,
              RouteID: 5,
              SailingID: 7963,
              SailingDescription: 'Leave Seattle',
              SailingNotes: '',
              DisplayColNum: 4,
              SailingDir: 1,
              DayOpDescription: 'Monday through Friday',
              DayOpUseForHoliday: false,
              ActiveDateRanges: [
                {
                  DateFrom: wsdotDate(1774162800),
                  DateThru: wsdotDate(1781334000),
                },
              ],
              Journs: [
                {
                  JourneyID: 169540,
                  ReservationInd: false,
                  InternationalInd: false,
                  InterislandInd: false,
                  VesselID: 37,
                  VesselName: 'Wenatchee',
                  VesselHandicapAccessible: true,
                  VesselPositionNum: 1,
                  TerminalTimes: [
                    {
                      JourneyTerminalID: 241736,
                      TerminalID: 7,
                      TerminalDescription: 'Seattle',
                      TerminalBriefDescription: 'Colman P52',
                      Time: '/Date(-2208940200000-0800)/',
                      DepArrIndicator: 1,
                      IsNA: false,
                      Annotations: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        wsdotDate(1777334400),
        1777334500,
    );

    expect(schedules['sea-bi']).toMatchObject({
      routeId: 'sea-bi',
      RouteID: 5,
      Description: 'Seattle / Bainbridge Island',
      SchedRouteID: 2435,
      BaseSchedRouteID: 2435,
      CacheFlushDateEpoch: 1777334400,
      fetchedAt: 1777334500,
    });
    expect(schedules['sea-bi'].SailingGroups[0]).toMatchObject({
      SailingDescription: 'Leave Seattle',
      DayOpDescription: 'Monday through Friday',
    });
    expect(schedules['sea-bi'].SailingGroups[0].Journs[0].TerminalTimes[0]).toMatchObject({
      TerminalID: 7,
      TimeDisplay: '05:30',
    });
  });
});
