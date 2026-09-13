/*
   Copyright (c) 2017, 2018 Declan Freeman-Gleason.

   This file is part of Ferries Over Winslow.

   Ferries Over Winslow is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   Ferries Over Winslow is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this Ferries Over Winslow.  If not, see <http://www.gnu.org/licenses/>.
*/

// Temporary Gen 1 compatibility adapter. See README.md in this directory.
// Path and progress calculation adapted from pietroglyph/fow, commit
// 53356190504c4ad55c43ea7bf6b8a561b2fd750d (GPL-3.0-or-later).

const FALLBACK = '0,0,0,DEPARTING:1,1,0,ARRIVING:-1';
const HORIZON_MS = 15000;
const STALE_MS = 60000;
const path = [
  [47.622453, -122.509274],
  [47.620197, -122.498288],
  [47.620009, -122.497602],
  [47.619546, -122.496700],
  [47.619170, -122.496078],
  [47.618331, -122.495220],
  [47.617825, -122.494855],
  [47.617116, -122.494469],
  [47.608176, -122.491014],
  [47.607757, -122.490735],
  [47.607163, -122.490134],
  [47.606643, -122.489362],
  [47.606353, -122.488804],
  [47.605934, -122.487774],
  [47.605688, -122.486615],
  [47.605471, -122.484770],
  [47.605326, -122.482388],
  [47.604169, -122.352440],
  [47.603069, -122.343750],
  [47.602869, -122.342291],
  [47.602824, -122.339544],
];

// Retain the legacy degree-based subdivision and one-sample offset so the
// physical display's calibration does not change with Gen 2 route algorithms.
const samples = [];
let pathLength = 0;
let cumulative = 0;
for (let i = 1; i < path.length; i++) {
  const start = path[i - 1];
  const delta = path[i].map((value, axis) => value - start[axis]);
  const length = Math.hypot(...delta);
  for (let step = 0; step < Math.ceil(length / 0.00001); step++) {
    const fraction = step * 0.00001 / length;
    const point = start.map((value, axis) => value + delta[axis] * fraction);
    const previous = samples[samples.length - 1];
    const distance = cumulative;
    if (previous) {
      cumulative += Math.hypot(point[0] - previous.point[0], point[1] - previous.point[1]);
    }
    samples.push({point, distance});
  }
  pathLength += length;
}

function progress(vessel, secondsAhead) {
  const radians = Math.PI / 180;
  const latitude = vessel.Latitude * radians;
  const longitude = vessel.Longitude * radians;
  const bearing = vessel.Heading * radians;
  const angularDistance = (secondsAhead / 3600 * vessel.Speed * 1.852001) / 6371;
  const predictedLatitude = Math.asin(Math.sin(latitude) * Math.cos(angularDistance) +
      Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearing));
  const predictedLongitude = longitude + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude),
      Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(predictedLatitude),
  );
  const lat = predictedLatitude / radians;
  const lon = predictedLongitude / radians;
  let closest = samples[0];
  let minimum = Infinity;
  for (const sample of samples) {
    const distance = (sample.point[0] - lat) ** 2 + (sample.point[1] - lon) ** 2;
    if (distance < minimum) {
      closest = sample;
      minimum = distance;
    }
  }
  return Math.min(closest.distance / pathLength, 1);
}

function timestampMs(value) {
  const match = typeof value === 'string' && /^\/Date\((\d+)(?:[+-]\d{4})?\)\/$/.exec(value);
  return match ? Number(match[1]) : NaN;
}

function formatVessels(vessels, now) {
  const records = [];
  for (const vessel of vessels) {
    const departing = vessel.DepartingTerminalID === 3 || vessel.ArrivingTerminalID === 7;
    if (vessel.AtDock) {
      const atSeattle = vessel.ArrivingTerminalID === 3 || vessel.DepartingTerminalID === 7;
      records.push(atSeattle ? '1,1,0,ARRIVING' : '0,0,0,DEPARTING');
      continue;
    }
    const observedAt = timestampMs(vessel.TimeStamp);
    const coordinatesValid = Number.isFinite(vessel.Latitude) && Math.abs(vessel.Latitude) <= 90 &&
        Number.isFinite(vessel.Longitude) && Math.abs(vessel.Longitude) <= 180;
    if (!coordinatesValid || !Number.isFinite(vessel.Speed) || vessel.Speed < 0 ||
        !Number.isFinite(vessel.Heading) || !Number.isFinite(observedAt) || now - observedAt > STALE_MS) {
      return FALLBACK;
    }
    records.push([
      progress(vessel, 0), progress(vessel, HORIZON_MS / 1000),
      Math.max(0, now - observedAt), departing ? 'DEPARTING' : 'ARRIVING',
    ].join(','));
  }
  while (records.length < 2) {
    records.push(records.length === 0 ? '0,0,0,DEPARTING' : '1,1,0,ARRIVING');
  }
  return records.join(':') + ':' + HORIZON_MS;
}

// No timers, database, additional WSDOT requests, or Gen 2 schema dependencies.
export function createGen1Progress({now = Date.now} = {}) {
  let vessels = null;
  let receivedAt = 0;
  return {
    update(locations) {
      if (!Array.isArray(locations)) return;
      vessels = locations.filter((vessel) => vessel && vessel.InService &&
          Array.isArray(vessel.OpRouteAbbrev) && vessel.OpRouteAbbrev.includes('sea-bi'))
          .map((vessel) => ({...vessel}))
          .sort((a, b) => a.VesselID - b.VesselID);
      receivedAt = now();
    },
    handler(request, response) {
      const currentTime = now();
      const body = vessels === null || currentTime - receivedAt > STALE_MS ?
        FALLBACK : formatVessels(vessels, currentTime);
      response.set('Cache-Control', 'no-store');
      response.type('text/plain').send(body);
    },
  };
}
