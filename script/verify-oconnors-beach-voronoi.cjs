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

const EVENTS_JSON_NAME = "O\u2019Connors Beach";
const CSV_NAME = "O'Connors Beach";

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
      CSV_NAME,
      {
        eventShortName: CSV_NAME,
        eventDirectors: "Director",
        eventAmbassador: "EA1",
        regionalAmbassador: "REA1",
        eventCoordinates: "41.33857° S 148.27408° E",
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
      tooltip: EVENTS_JSON_NAME,
    }),
  });

  const visible = sites.filter((site) => site.role === "visible");
  assert(
    visible.some((site) => site.id === EVENTS_JSON_NAME),
    "expected CSV allocation to match events.json event as a visible Voronoi site",
  );

  const rings = computeVisibleTerritoryRings(sites, geoVoronoi);
  assert(rings.length === 1, "expected one visible REA territory ring");

  const ring = rings[0].ring;
  const latitudes = ring.map(([, latitude]) => latitude);
  const longitudes = ring.map(([longitude]) => longitude);

  assert(
    Math.max(...latitudes) < 0,
    "expected O'Connors Beach territory to remain in the southern hemisphere",
  );
  assert(
    Math.max(...longitudes) - Math.min(...longitudes) < 20,
    "expected O'Connors Beach territory to stay local to Tasmania",
  );

  const clipped = clipRingToViewport(ring, {
    minLongitude: 146,
    maxLongitude: 149,
    minLatitude: -42.5,
    maxLatitude: -40.5,
  });
  assert(
    clipped !== null,
    "expected viewport clip to produce a drawable polygon",
  );
  assert(clipped.length >= 3, "expected at least three clipped vertices");

  console.log("PASS: O'Connors Beach global Voronoi regression");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
