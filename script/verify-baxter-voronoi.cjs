/* eslint-disable @typescript-eslint/no-require-imports */
require("ts-node/register/transpile-only");
require("tsconfig-paths/register");

const path = require("path");
const { createRequire } = require("module");
const axios = require("axios");
const {
  buildVoronoiSites,
  computeVisibleTerritoryRings,
  pointInTerritoryRing,
} = require("../src/utils/voronoiTerritories");

const requireD3 = createRequire(path.join(__dirname, "../package.json"));
const { geoVoronoi } = requireD3("d3-geo-voronoi");

const BAXTER = "Baxter";
const SUNRISE_BEACH = "Sunrise Beach";
const JAKES_POINT = "Jakes Point";
const ALLOCATED = [BAXTER, SUNRISE_BEACH, JAKES_POINT];

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

  const eventTeamsTableData = new Map(
    ALLOCATED.map((name) => [
      name,
      {
        eventShortName: name,
        eventDirectors: "Director",
        eventAmbassador: "EA",
        regionalAmbassador: "REA",
        eventCoordinates: "",
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: "au",
      },
    ]),
  );

  const sites = buildVoronoiSites({
    eventDetails,
    eventTeamsTableData,
    styleForAllocatedEvent: () => ({
      raColor: "#ff0066",
      tooltip: BAXTER,
    }),
  });

  const rings = computeVisibleTerritoryRings(sites, geoVoronoi);
  assert(rings.length >= 2, "expected at least Jakes Point and Sunrise Beach territory rings");

  const baxterRing = rings.find((ring) => ring.id === BAXTER);
  const jakesRing = rings.find((ring) => ring.id === JAKES_POINT);
  const sunriseRing = rings.find((ring) => ring.id === SUNRISE_BEACH);

  assert(jakesRing, "expected Jakes Point REA territory ring");
  assert(sunriseRing, "expected Sunrise Beach REA territory ring");
  assert(baxterRing, "expected Baxter REA territory ring");

  const [baxterLng, baxterLat] = eventDetails.get(BAXTER).geometry.coordinates;
  const [sunriseLng, sunriseLat] =
    eventDetails.get(SUNRISE_BEACH).geometry.coordinates;
  const [jakesLng, jakesLat] =
    eventDetails.get(JAKES_POINT).geometry.coordinates;

  assert(
    pointInTerritoryRing(jakesLng, jakesLat, jakesRing.ring),
    "expected Jakes Point territory to envelope its event site",
  );
  assert(
    pointInTerritoryRing(sunriseLng, sunriseLat, sunriseRing.ring),
    "expected Sunrise Beach territory to envelope its event site",
  );
  assert(
    !pointInTerritoryRing(sunriseLng, sunriseLat, jakesRing.ring),
    "expected Sunrise Beach to lie outside Jakes Point territory",
  );
  assert(
    !pointInTerritoryRing(jakesLng, jakesLat, sunriseRing.ring),
    "expected Jakes Point to lie outside Sunrise Beach territory",
  );

  assert(
    pointInTerritoryRing(baxterLng, baxterLat, baxterRing.ring),
    "expected Baxter territory to envelope its event site",
  );
  assert(
    !pointInTerritoryRing(sunriseLng, sunriseLat, baxterRing.ring),
    "expected Sunrise Beach to lie outside Baxter territory",
  );
  assert(
    !pointInTerritoryRing(jakesLng, jakesLat, baxterRing.ring),
    "expected Jakes Point to lie outside Baxter territory",
  );

  let dualOccupancyPoints = 0;
  const gridStepDegrees = 0.25;
  for (
    let longitude = 112;
    longitude <= 122;
    longitude += gridStepDegrees
  ) {
    for (
      let latitude = -28;
      latitude <= -20;
      latitude += gridStepDegrees
    ) {
      const containing = rings.filter((territory) =>
        pointInTerritoryRing(longitude, latitude, territory.ring),
      );
      if (containing.length > 1) {
        dualOccupancyPoints += 1;
      }
    }
  }

  assert(
    dualOccupancyPoints === 0,
    `expected no interior overlap between Baxter, Sunrise Beach, and Jakes Point (${dualOccupancyPoints} dual-occupancy points)`,
  );

  console.log("PASS: Baxter global Voronoi regression");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
