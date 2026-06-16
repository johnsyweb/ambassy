import {
  populateMap,
  resetVoronoiTerritoryCacheForTests,
  isEventMarkerVisibleOnMap,
  applyAmbassadorNameFilterToMap,
  getMarkerMap,
  getUnallocatedMarkerMap,
  getMap,
  refreshViewportUnallocatedMarkersForTests,
} from "./populateMap";

jest.mock("d3-geo-voronoi", () => ({
  geoVoronoi: jest.fn(() => ({
    polygons: jest.fn(() => ({ features: [] })),
  })),
}));

describe("populateMap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetVoronoiTerritoryCacheForTests();
  });

  describe("Event Directors in tooltips", () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="mapContainer"></div>';
    });

    afterEach(() => {
      document.body.innerHTML = "";
    });

    it("should include Event Directors in map tooltip for allocated events", () => {
      const eventTeamsTableData = new Map();
      eventTeamsTableData.set("event1", {
        eventShortName: "event1",
        eventDirectors: "Director1, Director2",
        eventAmbassador: "EA1",
        regionalAmbassador: "REA1",
        eventCoordinates: "37.80000° S 144.90000° E",
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: "Australia",
      });

      const eventDetails = new Map();
      eventDetails.set("event1", {
        id: "1",
        type: "Feature",
        geometry: { type: "Point", coordinates: [144.9631, -37.8136] },
        properties: {
          eventname: "Event 1",
          EventLongName: "Event 1 Long Name",
          EventShortName: "event1",
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location 1",
        },
      });

      const eventAmbassadors = new Map();
      eventAmbassadors.set("EA1", { name: "EA1", events: ["event1"] });

      const regionalAmbassadors = new Map();
      regionalAmbassadors.set("REA1", {
        name: "REA1",
        state: "VIC",
        supportsEAs: ["EA1"],
      });

      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
      );

      const eventData = eventTeamsTableData.get("event1");
      expect(eventData?.eventDirectors).toBe("Director1, Director2");
    });

    it("should display 'N/A' for Event Directors in tooltip when not known", () => {
      const eventTeamsTableData = new Map();
      eventTeamsTableData.set("event1", {
        eventShortName: "event1",
        eventDirectors: "N/A",
        eventAmbassador: "EA1",
        regionalAmbassador: "REA1",
        eventCoordinates: "37.80000° S 144.90000° E",
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: "Australia",
      });

      const eventDetails = new Map();
      eventDetails.set("event1", {
        id: "1",
        type: "Feature",
        geometry: { type: "Point", coordinates: [144.9631, -37.8136] },
        properties: {
          eventname: "Event 1",
          EventLongName: "Event 1 Long Name",
          EventShortName: "event1",
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location 1",
        },
      });

      const eventAmbassadors = new Map();
      eventAmbassadors.set("EA1", { name: "EA1", events: ["event1"] });

      const regionalAmbassadors = new Map();
      regionalAmbassadors.set("REA1", {
        name: "REA1",
        state: "VIC",
        supportsEAs: ["EA1"],
      });

      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
      );

      const eventData = eventTeamsTableData.get("event1");
      expect(eventData?.eventDirectors).toBe("N/A");
    });
  });

  describe("Map refresh after allocation", () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="mapContainer"></div>';
    });

    afterEach(() => {
      document.body.innerHTML = "";
    });

    it("should render newly allocated events with EA color and larger size", () => {
      const eventTeamsTableData = new Map();
      eventTeamsTableData.set("event1", {
        eventShortName: "event1",
        eventDirectors: "Director1",
        eventAmbassador: "EA1",
        regionalAmbassador: "REA1",
        eventCoordinates: "37.80000° S 144.90000° E",
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: "Australia",
      });

      const eventDetails = new Map();
      eventDetails.set("event1", {
        id: "1",
        type: "Feature",
        geometry: { type: "Point", coordinates: [144.9631, -37.8136] },
        properties: {
          eventname: "Event 1",
          EventLongName: "Event 1 Long Name",
          EventShortName: "event1",
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location 1",
        },
      });

      const eventAmbassadors = new Map();
      eventAmbassadors.set("EA1", { name: "EA1", events: ["event1"] });

      const regionalAmbassadors = new Map();
      regionalAmbassadors.set("REA1", {
        name: "REA1",
        state: "VIC",
        supportsEAs: ["EA1"],
      });

      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
      );

      const eventData = eventTeamsTableData.get("event1");
      expect(eventData).toBeDefined();
      expect(eventData?.eventAmbassador).toBe("EA1");
    });

    it("should include newly allocated events in Voronoi polygon calculations", () => {
      const eventTeamsTableData = new Map();
      eventTeamsTableData.set("event1", {
        eventShortName: "event1",
        eventDirectors: "Director1",
        eventAmbassador: "EA1",
        regionalAmbassador: "REA1",
        eventCoordinates: "37.80000° S 144.90000° E",
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: "Australia",
      });

      const eventDetails = new Map();
      eventDetails.set("event1", {
        id: "1",
        type: "Feature",
        geometry: { type: "Point", coordinates: [144.9631, -37.8136] },
        properties: {
          eventname: "Event 1",
          EventLongName: "Event 1 Long Name",
          EventShortName: "event1",
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location 1",
        },
      });

      const eventAmbassadors = new Map();
      eventAmbassadors.set("EA1", { name: "EA1", events: ["event1"] });

      const regionalAmbassadors = new Map();
      regionalAmbassadors.set("REA1", {
        name: "REA1",
        state: "VIC",
        supportsEAs: ["EA1"],
      });

      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
      );

      const eventData = eventTeamsTableData.get("event1");
      expect(eventData).toBeDefined();
      expect(eventData?.regionalAmbassador).toBe("REA1");
    });
  });

  describe("Ambassador name filter", () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="mapContainer"></div>';
      sessionStorage.clear();
    });

    afterEach(() => {
      document.body.innerHTML = "";
      sessionStorage.clear();
    });

    it("creates markers only for allocated events, not unallocated catalogue entries", () => {
      const eventTeamsTableData = new Map();
      eventTeamsTableData.set("event1", {
        eventShortName: "event1",
        eventDirectors: "Director1",
        eventAmbassador: "EA1",
        regionalAmbassador: "REA1",
        eventCoordinates: "37.80000° S 144.90000° E",
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: "Australia",
      });

      const eventDetails = new Map();
      eventDetails.set("event1", {
        id: "1",
        type: "Feature",
        geometry: { type: "Point", coordinates: [144.9631, -37.8136] },
        properties: {
          eventname: "Event 1",
          EventLongName: "Event 1 Long Name",
          EventShortName: "event1",
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location 1",
        },
      });
      eventDetails.set("unallocated", {
        id: "2",
        type: "Feature",
        geometry: { type: "Point", coordinates: [145.0, -37.9] },
        properties: {
          eventname: "Unallocated",
          EventLongName: "Unallocated",
          EventShortName: "unallocated",
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location 2",
        },
      });

      const eventAmbassadors = new Map();
      eventAmbassadors.set("EA1", { name: "EA1", events: ["event1"] });

      const regionalAmbassadors = new Map();
      regionalAmbassadors.set("REA1", {
        name: "REA1",
        state: "VIC",
        supportsEAs: ["EA1"],
      });

      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
      );

      expect(getMarkerMap().size).toBe(1);
      expect(isEventMarkerVisibleOnMap("event1")).toBe(true);
      expect(isEventMarkerVisibleOnMap("unallocated")).toBe(false);
    });

    it("hides unallocated markers and non-matching allocated markers when filter is active", () => {
      const eventTeamsTableData = new Map();
      eventTeamsTableData.set("event1", {
        eventShortName: "event1",
        eventDirectors: "Director1",
        eventAmbassador: "EA1",
        regionalAmbassador: "REA1",
        eventCoordinates: "37.80000° S 144.90000° E",
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: "Australia",
      });
      eventTeamsTableData.set("event2", {
        eventShortName: "event2",
        eventDirectors: "Director2",
        eventAmbassador: "EA2",
        regionalAmbassador: "REA2",
        eventCoordinates: "37.80000° S 144.90000° E",
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: "Australia",
      });

      const eventDetails = new Map();
      eventDetails.set("event1", {
        id: "1",
        type: "Feature",
        geometry: { type: "Point", coordinates: [144.9631, -37.8136] },
        properties: {
          eventname: "Event 1",
          EventLongName: "Event 1 Long Name",
          EventShortName: "event1",
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location 1",
        },
      });
      eventDetails.set("event2", {
        id: "2",
        type: "Feature",
        geometry: { type: "Point", coordinates: [151.2093, -33.8688] },
        properties: {
          eventname: "Event 2",
          EventLongName: "Event 2 Long Name",
          EventShortName: "event2",
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location 2",
        },
      });
      eventDetails.set("unallocated", {
        id: "3",
        type: "Feature",
        geometry: { type: "Point", coordinates: [145.0, -37.9] },
        properties: {
          eventname: "Unallocated",
          EventLongName: "Unallocated",
          EventShortName: "unallocated",
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location 3",
        },
      });

      const eventAmbassadors = new Map();
      eventAmbassadors.set("EA1", { name: "EA1", events: ["event1"] });
      eventAmbassadors.set("EA2", { name: "EA2", events: ["event2"] });

      const regionalAmbassadors = new Map();
      regionalAmbassadors.set("REA1", {
        name: "REA1",
        state: "VIC",
        supportsEAs: ["EA1"],
      });
      regionalAmbassadors.set("REA2", {
        name: "REA2",
        state: "NSW",
        supportsEAs: ["EA2"],
      });

      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
      );

      sessionStorage.setItem("ambassy:ambassadorNameFilter", "ea1");
      applyAmbassadorNameFilterToMap(eventTeamsTableData);

      expect(isEventMarkerVisibleOnMap("event1")).toBe(true);
      expect(isEventMarkerVisibleOnMap("event2")).toBe(false);
      expect(isEventMarkerVisibleOnMap("unallocated")).toBe(false);
    });
  });

  describe("Viewport unallocated markers", () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="mapContainer"></div>';
      sessionStorage.clear();
    });

    afterEach(() => {
      document.body.innerHTML = "";
      sessionStorage.clear();
    });

    it("shows unallocated markers in the viewport and updates them on pan", () => {
      const eventTeamsTableData = new Map();
      eventTeamsTableData.set("event1", {
        eventShortName: "event1",
        eventDirectors: "Director1",
        eventAmbassador: "EA1",
        regionalAmbassador: "REA1",
        eventCoordinates: "37.80000° S 144.90000° E",
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: "Australia",
      });

      const eventDetails = new Map();
      eventDetails.set("event1", {
        id: "1",
        type: "Feature",
        geometry: { type: "Point", coordinates: [144.9631, -37.8136] },
        properties: {
          eventname: "Event 1",
          EventLongName: "Event 1 Long Name",
          EventShortName: "event1",
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location 1",
        },
      });
      eventDetails.set("nearby-unallocated", {
        id: "2",
        type: "Feature",
        geometry: { type: "Point", coordinates: [145.0, -37.9] },
        properties: {
          eventname: "Nearby Unallocated",
          EventLongName: "Nearby Unallocated",
          EventShortName: "nearby-unallocated",
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location 2",
        },
      });
      eventDetails.set("distant-unallocated", {
        id: "3",
        type: "Feature",
        geometry: { type: "Point", coordinates: [0.1, 51.5] },
        properties: {
          eventname: "Distant Unallocated",
          EventLongName: "Distant Unallocated",
          EventShortName: "distant-unallocated",
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location 3",
        },
      });

      const eventAmbassadors = new Map();
      eventAmbassadors.set("EA1", { name: "EA1", events: ["event1"] });

      const regionalAmbassadors = new Map();
      regionalAmbassadors.set("REA1", {
        name: "REA1",
        state: "VIC",
        supportsEAs: ["EA1"],
      });

      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
      );

      const map = getMap();
      expect(map).not.toBeNull();

      refreshViewportUnallocatedMarkersForTests({
        minLongitude: 144.5,
        maxLongitude: 145.5,
        minLatitude: -38.5,
        maxLatitude: -37.5,
      });

      expect(getMarkerMap().size).toBe(2);
      expect(getUnallocatedMarkerMap().has("nearby-unallocated")).toBe(true);
      expect(getUnallocatedMarkerMap().has("distant-unallocated")).toBe(false);
      expect(isEventMarkerVisibleOnMap("nearby-unallocated")).toBe(true);

      refreshViewportUnallocatedMarkersForTests({
        minLongitude: -0.5,
        maxLongitude: 0.5,
        minLatitude: 51,
        maxLatitude: 52,
      });

      expect(getUnallocatedMarkerMap().has("nearby-unallocated")).toBe(false);
      expect(getUnallocatedMarkerMap().has("distant-unallocated")).toBe(true);
      expect(isEventMarkerVisibleOnMap("distant-unallocated")).toBe(true);
    });
  });
});
