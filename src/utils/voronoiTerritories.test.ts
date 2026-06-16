import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { execFileSync } from "child_process";
import path from "path";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import {
  buildVoronoiSites,
  clipRingToViewport,
  clipTerritoryRingsToViewport,
  computeVisibleTerritoryRings,
  deduplicateVoronoiSites,
  expandViewportBounds,
  extractLocalTerritoryRing,
  filterTerritoryRingsForViewport,
  fingerprintVoronoiSites,
  GeoVoronoiFn,
  isDrawableTerritoryRing,
  pointInTerritoryRing,
  TerritoryRing,
  territoryRingBoundingBoxIntersectsViewport,
  VoronoiSite,
  VoronoiTerritoryCache,
} from "./voronoiTerritories";

function createEvent(
  shortName: string,
  coordinates: [number, number],
): EventDetails {
  return {
    id: shortName,
    type: "Feature",
    geometry: { type: "Point", coordinates },
    properties: {
      eventname: shortName.toLowerCase().replace(/\s+/g, ""),
      EventLongName: shortName,
      EventShortName: shortName,
      LocalisedEventLongName: null,
      countrycode: 3,
      seriesid: 1,
      EventLocation: "",
    },
  };
}

describe("buildVoronoiSites", () => {
  it("includes an allocated live event as a visible Voronoi site", () => {
    const eventDetails: EventDetailsMap = new Map([
      ["Mt Clarence", createEvent("Mt Clarence", [117.916528, -35.025659])],
    ]);
    const eventTeamsTableData: EventTeamsTableDataMap = new Map([
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

    const mtClarence = sites.find((site) => site.id === "Mt Clarence");
    expect(mtClarence).toEqual({
      id: "Mt Clarence",
      longitude: 117.916528,
      latitude: -35.025659,
      role: "visible",
      raColor: "#ff0066",
      tooltip: "Mt Clarence",
    });
  });

  it("treats an allocated event as visible when apostrophes differ from events.json", () => {
    const eventsJsonName = "O\u2019Connors Beach";
    const csvName = "O'Connors Beach";
    const eventDetails: EventDetailsMap = new Map([
      [eventsJsonName, createEvent(eventsJsonName, [148.274083, -41.338567])],
      ["Albany", createEvent("Albany", [117.883, -35.027])],
    ]);
    const eventTeamsTableData: EventTeamsTableDataMap = new Map([
      [
        csvName,
        {
          eventShortName: csvName,
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
        tooltip: eventsJsonName,
      }),
    });

    expect(sites.find((site) => site.id === eventsJsonName)).toEqual({
      id: eventsJsonName,
      longitude: 148.274083,
      latitude: -41.338567,
      role: "visible",
      raColor: "#ff0066",
      tooltip: eventsJsonName,
    });
  });

  it("includes an unallocated parkrun as a constraining Voronoi site", () => {
    const eventDetails: EventDetailsMap = new Map([
      ["Mt Clarence", createEvent("Mt Clarence", [117.916528, -35.025659])],
      ["Albany", createEvent("Albany", [117.883, -35.027])],
    ]);
    const eventTeamsTableData: EventTeamsTableDataMap = new Map([
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

    const albany = sites.find((site) => site.id === "Albany");
    expect(albany).toEqual({
      id: "Albany",
      longitude: 117.883,
      latitude: -35.027,
      role: "constraining",
    });
  });

  it("includes an EA-assigned prospective event as a visible Voronoi site", () => {
    const eventDetails: EventDetailsMap = new Map();
    const eventTeamsTableData: EventTeamsTableDataMap = new Map();
    const prospectiveEvents: ProspectiveEvent[] = [
      {
        id: "prospect-1",
        prospectEvent: "Bay East Garden",
        country: "Singapore",
        state: "SG",
        prospectEDs: "",
        eventAmbassador: "EA1",
        courseFound: false,
        landownerPermission: false,
        fundingConfirmed: false,
        dateMadeContact: null,
        coordinates: { latitude: 1.294155, longitude: 103.866771 },
        geocodingStatus: "success",
        ambassadorMatchStatus: "matched",
        importTimestamp: 0,
        sourceRow: 1,
      },
    ];

    const sites = buildVoronoiSites({
      eventDetails,
      eventTeamsTableData,
      prospectiveEvents,
      styleForAllocatedEvent: () => ({
        raColor: "unused",
        tooltip: "unused",
      }),
      styleForProspect: () => ({
        raColor: "#00ff00",
        tooltip: "Bay East Garden",
      }),
    });

    expect(sites).toEqual([
      {
        id: "prospect:prospect-1",
        longitude: 103.866771,
        latitude: 1.294155,
        role: "visible",
        raColor: "#00ff00",
        tooltip: "Bay East Garden",
      },
    ]);
  });
});

describe("isDrawableTerritoryRing", () => {
  it("rejects a ring whose bounding box contains the site but the site lies outside the polygon", () => {
    const ring: [number, number][] = [
      [100, -20],
      [120, -20],
      [120, -25],
      [115, -25],
      [115, -30],
      [100, -30],
      [100, -20],
    ];

    expect(isDrawableTerritoryRing(ring, 118, -27)).toBe(false);
  });

  it("accepts a ring that contains the site", () => {
    const ring: [number, number][] = [
      [117.5, -35.5],
      [118.5, -35.5],
      [118.5, -34.5],
      [117.5, -34.5],
      [117.5, -35.5],
    ];

    expect(isDrawableTerritoryRing(ring, 118, -35)).toBe(true);
  });
});

describe("pointInTerritoryRing", () => {
  it("returns true when the site lies inside the polygon", () => {
    const ring: [number, number][] = [
      [117.5, -35.5],
      [118.5, -35.5],
      [118.5, -34.5],
      [117.5, -34.5],
      [117.5, -35.5],
    ];

    expect(pointInTerritoryRing(118, -35, ring)).toBe(true);
  });

  it("returns false when the site lies outside the polygon", () => {
    const ring: [number, number][] = [
      [100, -20],
      [120, -20],
      [120, -25],
      [115, -25],
      [115, -30],
      [100, -30],
      [100, -20],
    ];

    expect(pointInTerritoryRing(118, -27, ring)).toBe(false);
  });
});

describe("extractLocalTerritoryRing", () => {
  const hamiltonIslandSite = [148.95513, -20.345551] as [number, number];
  const wrappingRing: [number, number][] = [
    [179.26127847511003, 0.5682388699175069],
    [158.75107162994405, -16.41684752568569],
    [154.2026627971397, -19.22962114121061],
    [148.65267865887563, -20.798622152811774],
    [149.34544067661713, -18.89053790773871],
    [151.49050921190144, -15.067820620089904],
    [157.41979354698594, -9.633392314261878],
    [178.7849480012309, 10.872081038890277],
    [-174.0415745101038, 11.083409052182981],
    [-179.82249810622864, 1.381146179161851],
  ];

  it("removes antimeridian wrap vertices from a spherical Voronoi ring", () => {
    const localRing = extractLocalTerritoryRing(
      wrappingRing,
      hamiltonIslandSite[0],
      hamiltonIslandSite[1],
    );

    expect(localRing).not.toBeNull();
    expect(localRing!.length).toBeGreaterThanOrEqual(3);
    localRing!.forEach(([longitude, latitude]) => {
      expect(longitude).toBeGreaterThan(140);
      expect(longitude).toBeLessThan(165);
      expect(latitude).toBeLessThan(0);
    });
    expect(
      isDrawableTerritoryRing(
        localRing!,
        hamiltonIslandSite[0],
        hamiltonIslandSite[1],
      ),
    ).toBe(true);
  });

  it("does not treat a wrapped Baxter cell as drawable after extraction", () => {
    const baxterSite: [number, number] = [113.65484, -24.89145];
    const wrappedBaxterRing: [number, number][] = [
      [73.231, -26.064],
      [73.014, -21.708],
      [85.808, -18.568],
      [97.162, -15.539],
      [118.137, -24.62],
      [118.981, -25.127],
      [119.342, -25.44],
    ];

    const localRing = extractLocalTerritoryRing(
      wrappedBaxterRing,
      baxterSite[0],
      baxterSite[1],
    );

    expect(localRing).not.toBeNull();
    expect(
      isDrawableTerritoryRing(localRing!, baxterSite[0], baxterSite[1]),
    ).toBe(false);
    expect(pointInTerritoryRing(baxterSite[0], baxterSite[1], localRing!)).toBe(
      false,
    );
  });
});

describe("computeVisibleTerritoryRings", () => {
  const localRing: [number, number][] = [
    [117.5, -35.5],
    [118.5, -35.5],
    [118.5, -34.5],
    [117.5, -34.5],
    [117.5, -35.5],
  ];

  const mockGeoVoronoi: GeoVoronoiFn = () => ({
    polygons: () => ({
      features: [
        {
          type: "Feature",
          properties: { sitecoordinates: [117.916528, -35.025659] },
          geometry: { type: "Polygon", coordinates: [localRing] },
        },
        {
          type: "Feature",
          properties: { sitecoordinates: [117.883, -35.027] },
          geometry: { type: "Polygon", coordinates: [localRing] },
        },
      ],
    }),
  });

  it("returns REA territory rings for visible sites only", () => {
    const sites: VoronoiSite[] = [
      {
        id: "Mt Clarence",
        longitude: 117.916528,
        latitude: -35.025659,
        role: "visible",
        raColor: "#ff0066",
        tooltip: "Mt Clarence",
      },
      {
        id: "Albany",
        longitude: 117.883,
        latitude: -35.027,
        role: "constraining",
      },
    ];

    const rings = computeVisibleTerritoryRings(sites, mockGeoVoronoi);

    expect(rings).toEqual([
      {
        id: "Mt Clarence",
        ring: localRing,
        raColor: "#ff0066",
        tooltip: "Mt Clarence",
      },
    ]);
  });

  it("does not replace a local ring that is already drawable", () => {
    const sites: VoronoiSite[] = [
      {
        id: "Mt Clarence",
        longitude: 117.916528,
        latitude: -35.025659,
        role: "visible",
        raColor: "#ff0066",
        tooltip: "Mt Clarence",
      },
      {
        id: "Albany",
        longitude: 117.883,
        latitude: -35.027,
        role: "constraining",
      },
    ];

    const rings = computeVisibleTerritoryRings(sites, mockGeoVoronoi);

    expect(rings[0].ring).toEqual(localRing);
  });

  it("falls back to the raw global cell when local extraction misses the site", () => {
    const baxterSite: [number, number] = [113.65484, -24.89145];
    const wrappedBaxterRing: [number, number][] = [
      [73.231, -26.064],
      [73.014, -21.708],
      [85.808, -18.568],
      [97.162, -15.539],
      [118.137, -24.62],
      [118.981, -25.127],
      [119.342, -25.44],
    ];

    const mockWrappedGeoVoronoi: GeoVoronoiFn = () => ({
      polygons: () => ({
        features: [
          {
            type: "Feature",
            properties: { sitecoordinates: baxterSite },
            geometry: {
              type: "Polygon",
              coordinates: [wrappedBaxterRing],
            },
          },
        ],
      }),
    });

    const rings = computeVisibleTerritoryRings(
      [
        {
          id: "Baxter",
          longitude: baxterSite[0],
          latitude: baxterSite[1],
          role: "visible",
          raColor: "#ff0066",
          tooltip: "Baxter",
        },
      ],
      mockWrappedGeoVoronoi,
    );

    expect(rings).toHaveLength(1);
    expect(rings[0].ring).toEqual(wrappedBaxterRing);
    expect(
      pointInTerritoryRing(baxterSite[0], baxterSite[1], rings[0].ring),
    ).toBe(true);
  });
});

describe("clipRingToViewport", () => {
  it("returns the visible portion of a territory ring inside the viewport", () => {
    const ring: [number, number][] = [
      [117, -36],
      [119, -36],
      [119, -34],
      [117, -34],
      [117, -36],
    ];

    const clipped = clipRingToViewport(ring, {
      minLongitude: 117.5,
      maxLongitude: 118.5,
      minLatitude: -35.5,
      maxLatitude: -34.5,
    });

    expect(clipped).not.toBeNull();
    expect(clipped!.length).toBeGreaterThanOrEqual(3);
    clipped!.forEach(([longitude, latitude]) => {
      expect(longitude).toBeGreaterThanOrEqual(117.5);
      expect(longitude).toBeLessThanOrEqual(118.5);
      expect(latitude).toBeGreaterThanOrEqual(-35.5);
      expect(latitude).toBeLessThanOrEqual(-34.5);
    });
  });

  it("returns null when the ring is entirely outside the viewport", () => {
    const ring: [number, number][] = [
      [100, -10],
      [101, -10],
      [101, -9],
      [100, -9],
      [100, -10],
    ];

    expect(
      clipRingToViewport(ring, {
        minLongitude: 117,
        maxLongitude: 118,
        minLatitude: -36,
        maxLatitude: -35,
      }),
    ).toBeNull();
  });
});

describe("filterTerritoryRingsForViewport", () => {
  const melbourneViewport = {
    minLongitude: 144.5,
    maxLongitude: 145.5,
    minLatitude: -38.5,
    maxLatitude: -37.5,
  };

  const melbourneRing: TerritoryRing = {
    id: "melbourne",
    ring: [
      [144.6, -38.2],
      [145.2, -38.2],
      [145.2, -37.6],
      [144.6, -37.6],
      [144.6, -38.2],
    ],
    raColor: "#ff0066",
    tooltip: "Melbourne",
  };

  const londonRing: TerritoryRing = {
    id: "london",
    ring: [
      [-0.5, 51.2],
      [0.5, 51.2],
      [0.5, 51.8],
      [-0.5, 51.8],
      [-0.5, 51.2],
    ],
    raColor: "#0066ff",
    tooltip: "London",
  };

  it("keeps only rings whose bounding box intersects the viewport", () => {
    const filtered = filterTerritoryRingsForViewport(
      [melbourneRing, londonRing],
      melbourneViewport,
    );

    expect(filtered.map((ring) => ring.id)).toEqual(["melbourne"]);
  });

  it("reports bounding-box intersection for territory rings", () => {
    expect(
      territoryRingBoundingBoxIntersectsViewport(
        melbourneRing.ring,
        expandViewportBounds(melbourneViewport),
      ),
    ).toBe(true);
    expect(
      territoryRingBoundingBoxIntersectsViewport(
        londonRing.ring,
        expandViewportBounds(melbourneViewport),
      ),
    ).toBe(false);
  });
});

describe("clipTerritoryRingsToViewport", () => {
  it("clips only rings intersecting the viewport", () => {
    const melbourneViewport = {
      minLongitude: 144.8,
      maxLongitude: 145.1,
      minLatitude: -38.1,
      maxLatitude: -37.7,
    };

    const clipped = clipTerritoryRingsToViewport(
      [
        {
          id: "melbourne",
          ring: [
            [144.6, -38.2],
            [145.2, -38.2],
            [145.2, -37.6],
            [144.6, -37.6],
            [144.6, -38.2],
          ],
          raColor: "#ff0066",
          tooltip: "Melbourne",
        },
        {
          id: "london",
          ring: [
            [-0.5, 51.2],
            [0.5, 51.2],
            [0.5, 51.8],
            [-0.5, 51.8],
            [-0.5, 51.2],
          ],
          raColor: "#0066ff",
          tooltip: "London",
        },
      ],
      melbourneViewport,
    );

    expect(clipped.map((polygon) => polygon.id)).toEqual(["melbourne"]);
  });
});

describe("VoronoiTerritoryCache", () => {
  it("recomputes territory rings only when Voronoi sites change", () => {
    const sites: VoronoiSite[] = [
      {
        id: "Mt Clarence",
        longitude: 117.916528,
        latitude: -35.025659,
        role: "visible",
        raColor: "#ff0066",
        tooltip: "Mt Clarence",
      },
    ];
    const ring: TerritoryRing = {
      id: "Mt Clarence",
      ring: [
        [117.5, -35.5],
        [118.5, -35.5],
        [118.5, -34.5],
        [117.5, -34.5],
        [117.5, -35.5],
      ],
      raColor: "#ff0066",
      tooltip: "Mt Clarence",
    };
    const geoVoronoiFn = jest.fn<
      ReturnType<GeoVoronoiFn>,
      Parameters<GeoVoronoiFn>
    >(() => ({
      polygons: () => ({
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [ring.ring],
            },
          },
        ],
      }),
    }));

    const cache = new VoronoiTerritoryCache();
    expect(cache.getRings(sites, geoVoronoiFn)).toEqual([ring]);
    expect(cache.getRings(sites, geoVoronoiFn)).toEqual([ring]);
    expect(geoVoronoiFn).toHaveBeenCalledTimes(1);

    const changedSites = [
      ...sites,
      {
        id: "Albany",
        longitude: 117.883,
        latitude: -35.027,
        role: "constraining" as const,
      },
    ];
    expect(fingerprintVoronoiSites(changedSites)).not.toBe(
      fingerprintVoronoiSites(sites),
    );
    cache.getRings(changedSites, geoVoronoiFn);
    expect(geoVoronoiFn).toHaveBeenCalledTimes(2);
  });
});

describe("deduplicateVoronoiSites", () => {
  it("removes duplicate coordinates from the global site set", () => {
    const sites: VoronoiSite[] = [
      {
        id: "event-a",
        longitude: 117.916528,
        latitude: -35.025659,
        role: "visible",
        raColor: "red",
        tooltip: "A",
      },
      {
        id: "event-b",
        longitude: 117.916528,
        latitude: -35.025659,
        role: "constraining",
      },
    ];

    expect(deduplicateVoronoiSites(sites)).toHaveLength(1);
  });
});

describe("d3-geo-voronoi integration", () => {
  it("draws a local Mt Clarence REA territory with global parkrun sites", () => {
    const scriptPath = path.join(
      __dirname,
      "../../script/verify-mt-clarence-voronoi.cjs",
    );

    execFileSync("node", [scriptPath], {
      stdio: "pipe",
      cwd: path.join(__dirname, "../.."),
    });
  });

  it("draws a local Hamilton Island REA territory with global parkrun sites", () => {
    const scriptPath = path.join(
      __dirname,
      "../../script/verify-hamilton-island-voronoi.cjs",
    );

    execFileSync("node", [scriptPath], {
      stdio: "pipe",
      cwd: path.join(__dirname, "../.."),
    });
  });

  it("draws a local O'Connors Beach REA territory when CSV apostrophe differs", () => {
    const scriptPath = path.join(
      __dirname,
      "../../script/verify-oconnors-beach-voronoi.cjs",
    );

    execFileSync("node", [scriptPath], {
      stdio: "pipe",
      cwd: path.join(__dirname, "../.."),
    });
  });

  it("draws Baxter REA territory via raw global cell fallback", () => {
    const scriptPath = path.join(
      __dirname,
      "../../script/verify-baxter-voronoi.cjs",
    );

    execFileSync("node", [scriptPath], {
      stdio: "pipe",
      cwd: path.join(__dirname, "../.."),
    });
  });
});
