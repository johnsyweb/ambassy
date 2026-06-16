/* eslint-disable @typescript-eslint/no-require-imports */
require("ts-node/register/transpile-only");
require("tsconfig-paths/register");

const path = require("path");
const { createRequire } = require("module");
const axios = require("axios");
const {
  buildVoronoiSites,
  clipRingToViewport,
  computeVisibleTerritoryRings,
} = require("../src/utils/voronoiTerritories");

const requireD3 = createRequire(path.join(__dirname, "../package.json"));
const { geoVoronoi } = requireD3("d3-geo-voronoi");

const EVENT_SHORT_NAME = "Hamilton Island";
const EVENT_LAT = -20.345551;
const EVENT_LNG = 148.95513;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

async function main() {
  const response = await axios.get("https://images.parkrun.com/events.json");
  const features = response.data.events.features.filter(
    (feature) => feature.geometry?.coordinates,
  );

  const eventDetails = new Map(
    features.map((feature) => [feature.properties.EventShortName, feature]),
  );

  const eventTeamsTableData = new Map([
    [
      EVENT_SHORT_NAME,
      {
        eventShortName: EVENT_SHORT_NAME,
        eventDirectors: "Director",
        eventAmbassador: "EA1",
        regionalAmbassador: "REA1",
        eventCoordinates: "20.34555° S 148.95513° E",
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: "au",
      },
    ],
  ]);

  const sites = buildVoronoiSites({
    eventDetails,
    eventTeamsTableData,
    styleForAllocatedEvent: () => ({
      raColor: "#ff0066",
      tooltip: EVENT_SHORT_NAME,
    }),
  });

  const rings = computeVisibleTerritoryRings(sites, geoVoronoi);
  assert(rings.length === 1, "expected one visible REA territory ring");

  const ring = rings[0].ring;
  const latitudes = ring.map(([, latitude]) => latitude);
  const longitudes = ring.map(([longitude]) => longitude);

  assert(
    Math.max(...latitudes) < 0,
    "expected Hamilton Island territory to remain in the southern hemisphere",
  );
  assert(
    Math.max(...longitudes) - Math.min(...longitudes) < 30,
    "expected Hamilton Island territory to stay local to the Whitsundays",
  );

  const clipped = clipRingToViewport(ring, {
    minLongitude: 145,
    maxLongitude: 152,
    minLatitude: -22,
    maxLatitude: -18,
  });
  assert(
    clipped !== null,
    "expected viewport clip to produce a drawable polygon",
  );
  assert(clipped.length >= 3, "expected at least three clipped vertices");

  console.log("PASS: Hamilton Island global Voronoi regression");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
