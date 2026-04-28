import routeFTData from '../data/RouteFTData.js';

const WSF_TIME_ZONE = 'America/Los_Angeles';

function getWSDOTMilliseconds(dateString) {
  if (!dateString) {
    return null;
  }

  const match = dateString.match(/^\/Date\((-?\d+)([-+]\d{4})\)\//);
  return match ? Number(match[1]) : null;
}

export function getEpochSecondsFromReferenceDate(dateString) {
  const milliseconds = getWSDOTMilliseconds(dateString);
  return milliseconds === null ? null : milliseconds / 1000;
}

export function getReferenceTimeDisplay(dateString) {
  const milliseconds = getWSDOTMilliseconds(dateString);
  if (milliseconds === null) {
    return null;
  }

  return new Intl.DateTimeFormat('en-US', {
    timeZone: WSF_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(milliseconds));
}

function normalizeActiveDateRange(activeDateRange) {
  return {
    DateFrom: getEpochSecondsFromReferenceDate(activeDateRange.DateFrom),
    DateThru: getEpochSecondsFromReferenceDate(activeDateRange.DateThru),
    EventID: activeDateRange.EventID,
    EventDescription: activeDateRange.EventDescription,
  };
}

function normalizeTerminalTime(terminalTime) {
  return {
    JourneyTerminalID: terminalTime.JourneyTerminalID,
    TerminalID: terminalTime.TerminalID,
    TerminalDescription: terminalTime.TerminalDescription,
    TerminalBriefDescription: terminalTime.TerminalBriefDescription,
    Time: terminalTime.Time,
    TimeDisplay: getReferenceTimeDisplay(terminalTime.Time),
    DepArrIndicator: terminalTime.DepArrIndicator,
    IsNA: terminalTime.IsNA,
    Annotations: terminalTime.Annotations || [],
  };
}

function normalizeJourney(journey) {
  return {
    JourneyID: journey.JourneyID,
    ReservationInd: journey.ReservationInd,
    InternationalInd: journey.InternationalInd,
    InterislandInd: journey.InterislandInd,
    VesselID: journey.VesselID,
    VesselName: journey.VesselName,
    VesselHandicapAccessible: journey.VesselHandicapAccessible,
    VesselPositionNum: journey.VesselPositionNum,
    TerminalTimes: (journey.TerminalTimes || []).map(normalizeTerminalTime),
  };
}

function normalizeSailing(sailing) {
  return {
    ScheduleID: sailing.ScheduleID,
    SchedRouteID: sailing.SchedRouteID,
    RouteID: sailing.RouteID,
    SailingID: sailing.SailingID,
    SailingDescription: sailing.SailingDescription,
    SailingNotes: sailing.SailingNotes,
    DisplayColNum: sailing.DisplayColNum,
    SailingDir: sailing.SailingDir,
    DayOpDescription: sailing.DayOpDescription,
    DayOpUseForHoliday: sailing.DayOpUseForHoliday,
    ActiveDateRanges: (sailing.ActiveDateRanges || []).map(normalizeActiveDateRange),
    Journs: (sailing.Journs || []).map(normalizeJourney),
  };
}

export function getActiveSchedRouteId(schedRoute, referenceEpochSeconds) {
  const activeContingency = (schedRoute.ContingencyAdj || []).find((contingency) => {
    if (!contingency.ReplacedBySchedRouteID) {
      return false;
    }

    const dateFrom = getEpochSecondsFromReferenceDate(contingency.DateFrom);
    const dateThru = getEpochSecondsFromReferenceDate(contingency.DateThru);
    return dateFrom !== null && dateThru !== null &&
      referenceEpochSeconds >= dateFrom &&
      referenceEpochSeconds <= dateThru;
  });

  return activeContingency?.ReplacedBySchedRouteID || schedRoute.SchedRouteID;
}

export function buildReferenceSchedules(schedRoutes, sailingsBySchedRouteId, cacheFlushDate, fetchedAt) {
  const schedulesByRoute = {};

  for (const [routeAbbreviation, routeData] of Object.entries(routeFTData)) {
    const schedRoute = schedRoutes.find((candidate) => {
      return String(candidate.RouteID) === String(routeData.routeID) && !candidate.ContingencyOnly;
    });
    if (!schedRoute) {
      continue;
    }

    const activeSchedRouteId = getActiveSchedRouteId(schedRoute, fetchedAt);
    const sailings = sailingsBySchedRouteId[activeSchedRouteId] || [];
    schedulesByRoute[routeAbbreviation] = {
      routeId: routeAbbreviation,
      RouteID: schedRoute.RouteID,
      RouteAbbrev: schedRoute.RouteAbbrev,
      Description: schedRoute.Description,
      ScheduleID: schedRoute.ScheduleID,
      SchedRouteID: activeSchedRouteId,
      BaseSchedRouteID: schedRoute.SchedRouteID,
      SeasonalRouteNotes: schedRoute.SeasonalRouteNotes,
      ServiceDisruptions: schedRoute.ServiceDisruptions || [],
      ContingencyAdj: schedRoute.ContingencyAdj || [],
      CacheFlushDate: cacheFlushDate,
      CacheFlushDateEpoch: getEpochSecondsFromReferenceDate(cacheFlushDate),
      fetchedAt,
      SailingGroups: sailings
          .map(normalizeSailing)
          .sort((first, second) => first.DisplayColNum - second.DisplayColNum),
    };
  }

  return schedulesByRoute;
}
