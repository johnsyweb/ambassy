import { populateMap, resetVoronoiTerritoryCacheForTests } from "./populateMap";

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
      regionalAmbassadors.set("REA1", { name: "REA1", state: "VIC", supportsEAs: ["EA1"] });

      populateMap(eventTeamsTableData, eventDetails, eventAmbassadors, regionalAmbassadors);

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
      regionalAmbassadors.set("REA1", { name: "REA1", state: "VIC", supportsEAs: ["EA1"] });

      populateMap(eventTeamsTableData, eventDetails, eventAmbassadors, regionalAmbassadors);

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
      regionalAmbassadors.set("REA1", { name: "REA1", state: "VIC", supportsEAs: ["EA1"] });

      populateMap(eventTeamsTableData, eventDetails, eventAmbassadors, regionalAmbassadors);

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
      regionalAmbassadors.set("REA1", { name: "REA1", state: "VIC", supportsEAs: ["EA1"] });

      populateMap(eventTeamsTableData, eventDetails, eventAmbassadors, regionalAmbassadors);

      const eventData = eventTeamsTableData.get("event1");
      expect(eventData).toBeDefined();
      expect(eventData?.regionalAmbassador).toBe("REA1");
    });
  });
});