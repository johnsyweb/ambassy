import {
  populateMap,
  resetVoronoiTerritoryCacheForTests,
  isEventMarkerVisibleOnMap,
  applyAmbassadorNameFilterToMap,
  getMarkerMap,
  getUnallocatedMarkerMap,
  getLiveMarkersLayer,
  getProspectMarkersLayer,
  getUnallocatedMarkersLayer,
  getPolygonsLayer,
  getMap,
  getHighlightLayer,
  refreshViewportUnallocatedMarkersForTests,
  setMarkerClickHandler,
  setSelectionHighlightRefreshHandler,
  syncMapMarkerSizesForTests,
  EVENT_MARKER_MAP_OPTIONS,
} from "./populateMap";
import { highlightEventsOnMap } from "@utils/mapNavigation";
import { allocatedLiveMarkerRadius } from "@utils/mapMarkerZoomScale";
import {
  LIVE_EVENTS_OVERLAY_LABEL,
  PROSPECTIVE_EVENTS_OVERLAY_LABEL,
  UNALLOCATED_PARKRUNS_OVERLAY_LABEL,
  REGIONAL_EVENT_AMBASSADOR_OVERLAY_LABEL,
} from "@utils/territoryMapOverlays";
import {
  getTerritoryMapOverlayVisibility,
  setTerritoryMapOverlayVisibility,
} from "@utils/territoryMapOverlayVisibility";
import L from "leaflet";

jest.mock("d3-geo-voronoi", () => ({
  geoVoronoi: jest.fn(() => ({
    polygons: jest.fn(() => ({ features: [] })),
  })),
}));

describe("populateMap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div id="mapContainer"></div>';
    resetVoronoiTerritoryCacheForTests();
  });

  afterEach(() => {
    resetVoronoiTerritoryCacheForTests();
    document.body.innerHTML = "";
    sessionStorage.clear();
  });

  describe("Event Directors in tooltips", () => {
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

  describe("Canvas marker rendering", () => {
    it("enables preferCanvas so circle markers use the canvas renderer", () => {
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

      expect(EVENT_MARKER_MAP_OPTIONS.preferCanvas).toBe(true);
      expect(getMap()?.options.preferCanvas).toBe(true);
    });

    it("still routes allocated marker clicks to the map click handler", () => {
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

      const onMarkerClick = jest.fn();
      setMarkerClickHandler(onMarkerClick);

      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
      );

      getMarkerMap().get("event1")?.fire("click");
      expect(onMarkerClick).toHaveBeenCalledWith("event1");
    });
  });

  describe("Map population fingerprint", () => {
    it("does not rebuild markers when map inputs are unchanged", () => {
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

      const mapInputs = [
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
      ] as const;

      populateMap(...mapInputs);
      const markerAfterFirstPopulate = getMarkerMap().get("event1");

      populateMap(...mapInputs);

      expect(getMarkerMap().size).toBe(1);
      expect(getMarkerMap().get("event1")).toBe(markerAfterFirstPopulate);
    });

    it("rebuilds markers when allocation changes", () => {
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
      eventDetails.set("event2", {
        id: "2",
        type: "Feature",
        geometry: { type: "Point", coordinates: [145.1, -37.9] },
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

      const eventAmbassadors = new Map();
      eventAmbassadors.set("EA1", { name: "EA1", events: ["event1"] });
      eventAmbassadors.set("EA2", { name: "EA2", events: ["event2"] });

      const regionalAmbassadors = new Map();
      regionalAmbassadors.set("REA1", {
        name: "REA1",
        state: "VIC",
        supportsEAs: ["EA1", "EA2"],
      });

      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
      );
      expect(getMarkerMap().size).toBe(1);

      eventTeamsTableData.set("event2", {
        eventShortName: "event2",
        eventDirectors: "Director2",
        eventAmbassador: "EA2",
        regionalAmbassador: "REA1",
        eventCoordinates: "37.90000° S 145.10000° E",
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: "Australia",
      });

      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
      );

      expect(getMarkerMap().size).toBe(2);
    });
  });

  describe("Prospective event map markers", () => {
    it("renders readiness segments on geocoded prospect markers and shows the map legend", () => {
      const eventTeamsTableData = new Map();
      const eventDetails = new Map();
      const eventAmbassadors = new Map([
        [
          "EA1",
          {
            name: "EA1",
            events: [],
            prospectiveEvents: ["p1"],
          },
        ],
      ]);
      const regionalAmbassadors = new Map([
        [
          "REA1",
          {
            name: "REA1",
            state: "VIC",
            supportsEAs: ["EA1"],
          },
        ],
      ]);
      const prospectiveEvents = [
        {
          id: "p1",
          prospectEvent: "Future parkrun",
          country: "Australia",
          state: "VIC",
          prospectEDs: "Pat",
          eventAmbassador: "EA1",
          courseFound: true,
          landownerPermission: false,
          fundingConfirmed: true,
          dateMadeContact: null,
          coordinates: {
            latitude: -37.8136,
            longitude: 144.9631,
            source: "manual" as const,
          },
          geocodingStatus: "success" as const,
          ambassadorMatchStatus: "matched" as const,
          importTimestamp: 0,
          sourceRow: 1,
        },
      ];

      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
        prospectiveEvents,
      );

      const markerIcon = document.querySelector(
        ".prospective-event-marker",
      )?.innerHTML;
      expect(markerIcon).toContain('data-readiness="course-found"');
      expect(markerIcon).toContain('data-readiness="funding-confirmed"');
      expect(document.querySelector(".prospect-map-legend")).not.toBeNull();
    });
  });

  describe("Territory map marker overlays", () => {
    const eventTeamsTableData = new Map([
      [
        "event1",
        {
          eventShortName: "event1",
          eventDirectors: "Director1",
          eventAmbassador: "EA1",
          regionalAmbassador: "REA1",
          eventCoordinates: "37.80000° S 144.90000° E",
          eventSeries: 1,
          eventCountryCode: 3,
          eventCountry: "Australia",
        },
      ],
    ]);
    const eventDetails = new Map([
      [
        "event1",
        {
          id: "1",
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [144.9631, -37.8136] as [number, number],
          },
          properties: {
            eventname: "Event 1",
            EventLongName: "Event 1 Long Name",
            EventShortName: "event1",
            LocalisedEventLongName: null,
            countrycode: 0,
            seriesid: 1,
            EventLocation: "Location 1",
          },
        },
      ],
      [
        "nearby-unallocated",
        {
          id: "2",
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [145.0, -37.9] as [number, number],
          },
          properties: {
            eventname: "Nearby Unallocated",
            EventLongName: "Nearby Unallocated",
            EventShortName: "nearby-unallocated",
            LocalisedEventLongName: null,
            countrycode: 0,
            seriesid: 1,
            EventLocation: "Location 2",
          },
        },
      ],
    ]);
    const eventAmbassadors = new Map([
      [
        "EA1",
        {
          name: "EA1",
          events: ["event1"],
          prospectiveEvents: ["p1"],
        },
      ],
    ]);
    const regionalAmbassadors = new Map([
      ["REA1", { name: "REA1", state: "VIC", supportsEAs: ["EA1"] }],
    ]);
    const prospectiveEvents = [
      {
        id: "p1",
        prospectEvent: "Future parkrun",
        country: "Australia",
        state: "VIC",
        prospectEDs: "Pat",
        eventAmbassador: "EA1",
        courseFound: true,
        landownerPermission: false,
        fundingConfirmed: true,
        dateMadeContact: null,
        coordinates: {
          latitude: -37.8136,
          longitude: 144.9631,
          source: "manual" as const,
        },
        geocodingStatus: "success" as const,
        ambassadorMatchStatus: "matched" as const,
        importTimestamp: 0,
        sourceRow: 1,
      },
    ];

    function populateMixedMarkerMap(): void {
      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
        prospectiveEvents,
      );
      refreshViewportUnallocatedMarkersForTests({
        minLongitude: 144.5,
        maxLongitude: 145.5,
        minLatitude: -38.5,
        maxLatitude: -37.5,
      });
    }

    it("registers separate marker overlays in the layer control", () => {
      populateMixedMarkerMap();

      const labels = [
        ...document.querySelectorAll(".leaflet-control-layers-overlays label"),
      ].map((element) => element.textContent?.trim());

      expect(labels).toEqual([
        LIVE_EVENTS_OVERLAY_LABEL,
        PROSPECTIVE_EVENTS_OVERLAY_LABEL,
        UNALLOCATED_PARKRUNS_OVERLAY_LABEL,
        REGIONAL_EVENT_AMBASSADOR_OVERLAY_LABEL,
      ]);
    });

    it("places allocated live, prospect, and unallocated markers in separate layers", () => {
      populateMixedMarkerMap();

      const liveMarker = getMarkerMap().get("event1")!;
      const unallocatedMarker =
        getUnallocatedMarkerMap().get("nearby-unallocated")!;
      const prospectMarker = getProspectMarkersLayer().getLayers()[0];

      expect(getLiveMarkersLayer().hasLayer(liveMarker)).toBe(true);
      expect(getUnallocatedMarkersLayer().hasLayer(unallocatedMarker)).toBe(
        true,
      );
      expect(getProspectMarkersLayer().hasLayer(prospectMarker)).toBe(true);
      expect(getLiveMarkersLayer().hasLayer(unallocatedMarker)).toBe(false);
      expect(getProspectMarkersLayer().hasLayer(liveMarker)).toBe(false);
    });

    it("shows all three marker overlays on the map by default", () => {
      populateMixedMarkerMap();
      const map = getMap()!;

      expect(map.hasLayer(getLiveMarkersLayer())).toBe(true);
      expect(map.hasLayer(getProspectMarkersLayer())).toBe(true);
      expect(map.hasLayer(getUnallocatedMarkersLayer())).toBe(true);
    });

    it("hides the prospect legend when the prospective events overlay is off", () => {
      populateMixedMarkerMap();
      const map = getMap()!;

      expect(document.querySelector(".prospect-map-legend")).not.toBeNull();

      map.removeLayer(getProspectMarkersLayer());
      map.fire("overlayremove");

      expect(document.querySelector(".prospect-map-legend")).toBeNull();
    });

    it("clears selection highlight when the live events overlay is off", () => {
      populateMixedMarkerMap();
      const map = getMap()!;
      const highlightLayer = getHighlightLayer()!;

      setSelectionHighlightRefreshHandler(() => {
        highlightEventsOnMap(["event1"], getMarkerMap(), highlightLayer);
      });
      highlightEventsOnMap(["event1"], getMarkerMap(), highlightLayer);
      expect(highlightLayer.getLayers().length).toBe(1);

      map.removeLayer(getLiveMarkersLayer());
      map.fire("overlayremove");

      expect(highlightLayer.getLayers().length).toBe(0);
    });

    it("restores overlay visibility from session storage after reload", () => {
      setTerritoryMapOverlayVisibility({
        liveEvents: false,
        prospectiveEvents: true,
        unallocatedParkruns: false,
        regionalEventAmbassador: false,
      });

      populateMixedMarkerMap();
      const map = getMap()!;

      expect(map.hasLayer(getLiveMarkersLayer())).toBe(false);
      expect(map.hasLayer(getProspectMarkersLayer())).toBe(true);
      expect(map.hasLayer(getUnallocatedMarkersLayer())).toBe(false);
      expect(map.hasLayer(getPolygonsLayer())).toBe(false);
    });

    it("persists overlay toggles to session storage", () => {
      populateMixedMarkerMap();
      const map = getMap()!;

      map.removeLayer(getLiveMarkersLayer());
      map.removeLayer(getPolygonsLayer());
      map.fire("overlayremove");

      expect(getTerritoryMapOverlayVisibility()).toEqual({
        liveEvents: false,
        prospectiveEvents: true,
        unallocatedParkruns: true,
        regionalEventAmbassador: false,
      });

      resetVoronoiTerritoryCacheForTests();
      document.body.innerHTML = '<div id="mapContainer"></div>';

      populateMixedMarkerMap();

      expect(getMap()!.hasLayer(getLiveMarkersLayer())).toBe(false);
      expect(getMap()!.hasLayer(getPolygonsLayer())).toBe(false);
    });
  });

  describe("Territory map marker zoom scale", () => {
    function populateSingleAllocatedEventMap(): void {
      const eventTeamsTableData = new Map([
        [
          "event1",
          {
            eventShortName: "event1",
            eventDirectors: "Director1",
            eventAmbassador: "EA1",
            regionalAmbassador: "REA1",
            eventCoordinates: "37.80000° S 144.90000° E",
            eventSeries: 1,
            eventCountryCode: 3,
            eventCountry: "Australia",
          },
        ],
      ]);
      const eventDetails = new Map([
        [
          "event1",
          {
            id: "1",
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [144.9631, -37.8136] as [number, number],
            },
            properties: {
              eventname: "Event 1",
              EventLongName: "Event 1 Long Name",
              EventShortName: "event1",
              LocalisedEventLongName: null,
              countrycode: 0,
              seriesid: 1,
              EventLocation: "Location 1",
            },
          },
        ],
      ]);
      const eventAmbassadors = new Map([
        ["EA1", { name: "EA1", events: ["event1"] }],
      ]);
      const regionalAmbassadors = new Map([
        ["REA1", { name: "REA1", state: "VIC", supportsEAs: ["EA1"] }],
      ]);

      populateMap(
        eventTeamsTableData,
        eventDetails,
        eventAmbassadors,
        regionalAmbassadors,
      );
    }

    it("scales allocated live markers on zoomend", () => {
      populateSingleAllocatedEventMap();
      const map = getMap()!;
      const marker = getMarkerMap().get("event1")!;

      map.setView([-37.8136, 144.9631], 11);
      syncMapMarkerSizesForTests(map);
      expect(marker.getRadius()).toBe(5);

      map.setView([-37.8136, 144.9631], 13);
      map.fire("zoomend");
      expect(marker.getRadius()).toBeCloseTo(allocatedLiveMarkerRadius(13), 5);
    });

    it("creates viewport unallocated markers at the current zoom scale", () => {
      const eventTeamsTableData = new Map([
        [
          "event1",
          {
            eventShortName: "event1",
            eventDirectors: "Director1",
            eventAmbassador: "EA1",
            regionalAmbassador: "REA1",
            eventCoordinates: "37.80000° S 144.90000° E",
            eventSeries: 1,
            eventCountryCode: 3,
            eventCountry: "Australia",
          },
        ],
      ]);
      const eventDetails = new Map([
        [
          "event1",
          {
            id: "1",
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [144.9631, -37.8136] as [number, number],
            },
            properties: {
              eventname: "Event 1",
              EventLongName: "Event 1 Long Name",
              EventShortName: "event1",
              LocalisedEventLongName: null,
              countrycode: 0,
              seriesid: 1,
              EventLocation: "Location 1",
            },
          },
        ],
        [
          "nearby-unallocated",
          {
            id: "2",
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [145.0, -37.9] as [number, number],
            },
            properties: {
              eventname: "Nearby Unallocated",
              EventLongName: "Nearby Unallocated",
              EventShortName: "nearby-unallocated",
              LocalisedEventLongName: null,
              countrycode: 0,
              seriesid: 1,
              EventLocation: "Location 2",
            },
          },
        ],
      ]);

      populateMap(
        eventTeamsTableData,
        eventDetails,
        new Map([["EA1", { name: "EA1", events: ["event1"] }]]),
        new Map([
          ["REA1", { name: "REA1", state: "VIC", supportsEAs: ["EA1"] }],
        ]),
      );

      const map = getMap()!;
      map.setView([-37.875, 144.975], 18);

      refreshViewportUnallocatedMarkersForTests({
        minLongitude: 144.5,
        maxLongitude: 145.5,
        minLatitude: -38.5,
        maxLatitude: -37.5,
      });

      const unallocatedMarker =
        getUnallocatedMarkerMap().get("nearby-unallocated");

      expect(unallocatedMarker).toBeDefined();
      expect(unallocatedMarker!.getRadius()).toBe(8);
    });

    it("refreshes selection highlight radius on zoomend", () => {
      populateSingleAllocatedEventMap();
      const map = getMap()!;
      const highlightLayer = getHighlightLayer()!;

      setSelectionHighlightRefreshHandler(() => {
        highlightEventsOnMap(["event1"], getMarkerMap(), highlightLayer);
      });

      highlightEventsOnMap(["event1"], getMarkerMap(), highlightLayer);

      map.setView([-37.8136, 144.9631], 18);
      map.fire("zoomend");

      const highlightMarker = highlightLayer.getLayers()[0] as L.CircleMarker;
      expect(highlightMarker.getRadius()).toBeCloseTo(15, 5);
    });
  });
});
