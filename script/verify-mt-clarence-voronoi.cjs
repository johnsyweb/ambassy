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
      "Mt Clarence",
      {
        eventShortName: "Mt Clarence",
        eventDirectors: "Director",
        eventAmbassador: "EA1",
        regionalAmbassador: "REA1",
        eventCoordinates: "35.02566° S 117.91653° E",
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
      tooltip: "Mt Clarence",
    }),
  });

  assert(
    sites.length === features.length,
    "expected every parkrun event to become a Voronoi site",
  );

  const rings = computeVisibleTerritoryRings(sites, geoVoronoi);
  assert(rings.length === 1, "expected one visible REA territory ring");

  const latitudes = rings[0].ring.map(([, latitude]) => latitude);
  assert(
    Math.max(...latitudes) < 0,
    "expected Mt Clarence territory to remain in the southern hemisphere",
  );

  const clipped = clipRingToViewport(rings[0].ring, {
    minLongitude: 110,
    maxLongitude: 125,
    minLatitude: -42,
    maxLatitude: -28,
  });
  assert(
    clipped !== null,
    "expected viewport clip to produce a drawable polygon",
  );
  assert(clipped.length >= 3, "expected at least three clipped vertices");

  console.log("PASS: Mt Clarence global Voronoi regression");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
