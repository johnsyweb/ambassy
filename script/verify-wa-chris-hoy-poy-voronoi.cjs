/* eslint-disable @typescript-eslint/no-require-imports */
require("ts-node/register/transpile-only");
require("tsconfig-paths/register");

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Papa = require("papaparse");
const { createRequire } = require("module");
const { parseRegionalAmbassadors } = require("../src/parsers/parseRegionalAmbassadors");
const { parseEventAmbassadors } = require("../src/parsers/parseEventAmbassadors");
const { parseEventTeams } = require("../src/parsers/parseEventTeams");
const { extractEventTeamsTableData } = require("../src/models/EventTeamsTable");
const {
  buildVoronoiSites,
  computeVisibleTerritoryRings,
} = require("../src/utils/voronoiTerritories");

const requireD3 = createRequire(path.join(__dirname, "../package.json"));
const { geoVoronoi } = requireD3("d3-geo-voronoi");

const RA_NAME = "Chris Hoy Poy";
const KNOWN_UNDRAWABLE_EVENTS = new Set(["Melaleuca (currently on hold)"]);
const GRID_STEP_DEGREES = 0.25;
const WESTERN_SPILL_OFFSET_DEGREES = 6;

function parseCsvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
  return parsed.data;
}

function loadChrisHoyPoyRegionData(csvPaths) {
  const regionalAmbassadors = parseRegionalAmbassadors(
    parseCsvFile(csvPaths.regionalAmbassadors),
  );
  const eventAmbassadors = parseEventAmbassadors(
    parseCsvFile(csvPaths.eventAmbassadors),
  );
  const eventTeams = parseEventTeams(parseCsvFile(csvPaths.eventTeams));

  const chrisHoyPoy = regionalAmbassadors.get(RA_NAME);
  if (!chrisHoyPoy) {
    throw new Error(`Regional ambassador "${RA_NAME}" not found in CSV`);
  }

  return { regionalAmbassadors, eventAmbassadors, eventTeams, chrisHoyPoy };
}

function regionEventNames(chrisHoyPoy, eventAmbassadors) {
  const names = new Set();

  for (const eaName of chrisHoyPoy.supportsEAs) {
    const ea = eventAmbassadors.get(eaName);
    if (!ea) {
      continue;
    }

    for (const eventName of ea.events) {
      names.add(eventName);
    }
  }

  return [...names].sort();
}

function pointInTerritoryRing(siteLongitude, siteLatitude, ring) {
  let inside = false;

  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index++
  ) {
    const [vertexLongitude, vertexLatitude] = ring[index];
    const [previousLongitude, previousLatitude] = ring[previous];
    const crossesLatitude =
      vertexLatitude > siteLatitude !== previousLatitude > siteLatitude;

    if (
      crossesLatitude &&
      siteLongitude <
        ((previousLongitude - vertexLongitude) * (siteLatitude - vertexLatitude)) /
          (previousLatitude - vertexLatitude) +
          vertexLongitude
    ) {
      inside = !inside;
    }
  }

  return inside;
}

function hasWesternSpill(ring, siteLongitude) {
  return ring.some(
    ([longitude]) => longitude < siteLongitude - WESTERN_SPILL_OFFSET_DEGREES,
  );
}

function ringSelfIntersects(ring) {
  function orient(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  }

  function onSegment(a, b, c) {
    return (
      Math.min(a[0], c[0]) <= b[0] &&
      b[0] <= Math.max(a[0], c[0]) &&
      Math.min(a[1], c[1]) <= b[1] &&
      b[1] <= Math.max(a[1], c[1])
    );
  }

  function segmentsIntersect(a1, a2, b1, b2) {
    const o1 = orient(a1, a2, b1);
    const o2 = orient(a1, a2, b2);
    const o3 = orient(b1, b2, a1);
    const o4 = orient(b1, b2, a2);

    if (o1 !== o2 && o3 !== o4) {
      return true;
    }

    if (o1 === 0 && onSegment(a1, b1, a2)) {
      return true;
    }
    if (o2 === 0 && onSegment(a1, b2, a2)) {
      return true;
    }
    if (o3 === 0 && onSegment(b1, a1, b2)) {
      return true;
    }
    if (o4 === 0 && onSegment(b1, a2, b2)) {
      return true;
    }

    return false;
  }

  for (let leftIndex = 0; leftIndex < ring.length; leftIndex += 1) {
    const leftStart = ring[leftIndex];
    const leftEnd = ring[(leftIndex + 1) % ring.length];

    for (let rightIndex = leftIndex + 1; rightIndex < ring.length; rightIndex += 1) {
      const rightStart = ring[rightIndex];
      const rightEnd = ring[(rightIndex + 1) % ring.length];

      const sharesEndpoint =
        leftStart === rightStart ||
        leftStart === rightEnd ||
        leftEnd === rightStart ||
        leftEnd === rightEnd;

      if (sharesEndpoint) {
        continue;
      }

      if (segmentsIntersect(leftStart, leftEnd, rightStart, rightEnd)) {
        return true;
      }
    }
  }

  return false;
}

function interiorDualOccupancy(rings, minLng, maxLng, minLat, maxLat) {
  const dualPoints = [];

  for (let longitude = minLng; longitude <= maxLng; longitude += GRID_STEP_DEGREES) {
    for (let latitude = minLat; latitude <= maxLat; latitude += GRID_STEP_DEGREES) {
      const containing = rings.filter((territory) =>
        pointInTerritoryRing(longitude, latitude, territory.ring),
      );

      if (containing.length > 1) {
        dualPoints.push({
          longitude,
          latitude,
          eventIds: containing.map((territory) => territory.id),
        });
      }
    }
  }

  return dualPoints;
}

function waBoundsForRings(rings) {
  const longitudes = rings.flatMap((territory) =>
    territory.ring.map(([longitude]) => longitude),
  );
  const latitudes = rings.flatMap((territory) =>
    territory.ring.map(([, latitude]) => latitude),
  );

  return {
    minLongitude: Math.min(...longitudes) - 1,
    maxLongitude: Math.max(...longitudes) + 1,
    minLatitude: Math.min(...latitudes) - 1,
    maxLatitude: Math.max(...latitudes) + 1,
  };
}

async function measureRegion(csvPaths) {
  const { regionalAmbassadors, eventAmbassadors, eventTeams, chrisHoyPoy } =
    loadChrisHoyPoyRegionData(csvPaths);
  const expectedRegionEvents = regionEventNames(chrisHoyPoy, eventAmbassadors);

  const response = await axios.get("https://images.parkrun.com/events.json");
  const features = response.data.events.features.filter(
    (feature) => feature.geometry?.coordinates,
  );
  const eventDetails = new Map(
    features.map((feature) => [feature.properties.EventShortName, feature]),
  );

  const eventTeamsTableData = extractEventTeamsTableData(
    regionalAmbassadors,
    eventAmbassadors,
    eventTeams,
    eventDetails,
  );

  const regionEntries = [...eventTeamsTableData.values()].filter(
    (entry) => entry.regionalAmbassador === RA_NAME,
  );

  const raColorMap = new Map();
  regionEntries.forEach((entry, index) => {
    raColorMap.set(entry.eventShortName, `#${(index % 12).toString(16).repeat(6).slice(0, 6)}`);
  });

  const sites = buildVoronoiSites({
    eventDetails,
    eventTeamsTableData,
    styleForAllocatedEvent: (eventShortName) => ({
      raColor: raColorMap.get(eventShortName) ?? "#ff0066",
      tooltip: eventShortName,
    }),
  });

  const rings = computeVisibleTerritoryRings(sites, geoVoronoi);
  const regionRings = rings.filter((ring) =>
    regionEntries.some((entry) => entry.eventShortName === ring.id),
  );

  const issues = {
    missingRing: [],
    siteOutsideRing: [],
    westernSpill: [],
    selfIntersecting: [],
  };

  for (const entry of regionEntries) {
    const feature = eventDetails.get(entry.eventShortName);
    if (!feature) {
      issues.missingRing.push(`${entry.eventShortName} (no coordinates in events.json)`);
      continue;
    }

    const ring = regionRings.find((candidate) => candidate.id === entry.eventShortName);
    if (!ring) {
      issues.missingRing.push(entry.eventShortName);
      continue;
    }

    const [longitude, latitude] = feature.geometry.coordinates;

    if (!pointInTerritoryRing(longitude, latitude, ring.ring)) {
      issues.siteOutsideRing.push(entry.eventShortName);
    }

    if (hasWesternSpill(ring.ring, longitude)) {
      issues.westernSpill.push(entry.eventShortName);
    }

    if (ringSelfIntersects(ring.ring)) {
      issues.selfIntersecting.push(entry.eventShortName);
    }
  }

  const bounds = waBoundsForRings(regionRings);
  const dualPoints = interiorDualOccupancy(
    regionRings,
    bounds.minLongitude,
    bounds.maxLongitude,
    bounds.minLatitude,
    bounds.maxLatitude,
  );

  return {
    expectedRegionEvents: expectedRegionEvents.length,
    allocatedRegionEvents: regionEntries.length,
    visibleRegionRings: regionRings.length,
    issues,
    dualOccupancyPoints: dualPoints.length,
    dualSamples: dualPoints.slice(0, 10),
  };
}

async function main() {
  const csvPaths = {
    regionalAmbassadors: process.argv[2],
    eventAmbassadors: process.argv[3],
    eventTeams: process.argv[4],
  };

  if (!csvPaths.regionalAmbassadors || !csvPaths.eventAmbassadors || !csvPaths.eventTeams) {
    throw new Error(
      "Usage: node script/verify-wa-chris-hoy-poy-voronoi.cjs <regional.csv> <event-ambassadors.csv> <event-teams.csv>",
    );
  }

  const metrics = await measureRegion(csvPaths);

  if (process.env.METRICS_ONLY === "1") {
    process.stdout.write(JSON.stringify(metrics));
    return;
  }

  console.log(JSON.stringify(metrics, null, 2));

  const failureMessages = [];

  if (metrics.issues.missingRing.length > 0) {
    const unexpectedMissing = metrics.issues.missingRing.filter(
      (eventName) =>
        !eventName.includes("(no coordinates in events.json)") &&
        !KNOWN_UNDRAWABLE_EVENTS.has(eventName),
    );

    if (unexpectedMissing.length > 0) {
      failureMessages.push(
        `missing rings: ${unexpectedMissing.join(", ")}`,
      );
    }
  }
  if (metrics.issues.siteOutsideRing.length > 0) {
    failureMessages.push(
      `site outside ring: ${metrics.issues.siteOutsideRing.join(", ")}`,
    );
  }
  if (metrics.dualOccupancyPoints > 0) {
    failureMessages.push(
      `${metrics.dualOccupancyPoints} interior dual-occupancy points`,
    );
  }

  if (failureMessages.length > 0) {
    throw new Error(`FAIL: ${failureMessages.join("; ")}`);
  }

  console.log(`PASS: ${RA_NAME} WA territory polygons`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message ?? error);
    process.exit(1);
  });
}

module.exports = { measureRegion };
