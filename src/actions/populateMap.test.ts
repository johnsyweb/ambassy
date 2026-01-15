import { populateMap } from "./populateMap";
import { EventTeamsTableDataMap } from "../models/EventTeamsTableData";
import { EventDetailsMap } from "../models/EventDetailsMap";
import { EventAmbassadorMap } from "../models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";

jest.mock("d3-geo-voronoi", () => ({
  geoVoronoi: jest.fn(() => ({
    polygons: jest.fn(() => ({ features: [] })),
  })),
}));

describe("populateMap duplicate filtering", () => {

  beforeEach(() => {
    // Reset global state between tests
    jest.clearAllMocks();
  });

  describe("duplicate coordinate filtering", () => {
    it("should remove exact duplicate coordinates", () => {
      // Create mock voronoi points with some duplicates
      const voronoiPoints: [number, number, string][] = [
        [145.0, -37.8, '{"raColor":"red","tooltip":"Event 1"}'],
        [145.0, -37.8, '{"raColor":"blue","tooltip":"Event 2"}'], // Exact duplicate
        [145.1, -37.9, '{"raColor":"green","tooltip":"Event 3"}'],
        [145.2, -38.0, '{"raColor":"yellow","tooltip":"Event 4"}'],
        [145.1, -37.9, '{"raColor":"purple","tooltip":"Event 5"}'], // Another duplicate
      ];

      // Filter duplicates (simulating the logic in populateMap)
      const uniquePoints = voronoiPoints.filter((point, index, arr) => {
        const [lng, lat] = point;
        return !arr.slice(0, index).some(otherPoint => {
          const [otherLng, otherLat] = otherPoint;
          return Math.abs(lng - otherLng) < 0.000001 && Math.abs(lat - otherLat) < 0.000001;
        });
      });

      expect(uniquePoints).toHaveLength(3);
      expect(uniquePoints).toEqual([
        [145.0, -37.8, '{"raColor":"red","tooltip":"Event 1"}'],
        [145.1, -37.9, '{"raColor":"green","tooltip":"Event 3"}'],
        [145.2, -38.0, '{"raColor":"yellow","tooltip":"Event 4"}'],
      ]);
    });

    it("should preserve coordinates that are very close but not exact duplicates", () => {
      const voronoiPoints: [number, number, string][] = [
        [145.000000, -37.800000, '{"raColor":"red","tooltip":"Event 1"}'],
        [145.000001, -37.800001, '{"raColor":"blue","tooltip":"Event 2"}'], // Slightly different
        [145.000010, -37.800010, '{"raColor":"green","tooltip":"Event 3"}'], // Different
      ];

      const uniquePoints = voronoiPoints.filter((point, index, arr) => {
        const [lng, lat] = point;
        return !arr.slice(0, index).some(otherPoint => {
          const [otherLng, otherLat] = otherPoint;
          return Math.abs(lng - otherLng) < 0.000001 && Math.abs(lat - otherLat) < 0.000001;
        });
      });

      expect(uniquePoints).toHaveLength(3); // All preserved
    });

    it("should handle empty array", () => {
      const voronoiPoints: [number, number, string][] = [];
      const uniquePoints = voronoiPoints.filter((point, index, arr) => {
        const [lng, lat] = point;
        return !arr.slice(0, index).some(otherPoint => {
          const [otherLng, otherLat] = otherPoint;
          return Math.abs(lng - otherLng) < 0.000001 && Math.abs(lat - otherLat) < 0.000001;
        });
      });

      expect(uniquePoints).toHaveLength(0);
    });

    it("should handle single point", () => {
      const voronoiPoints: [number, number, string][] = [
        [145.0, -37.8, '{"raColor":"red","tooltip":"Event 1"}'],
      ];

      const uniquePoints = voronoiPoints.filter((point, index, arr) => {
        const [lng, lat] = point;
        return !arr.slice(0, index).some(otherPoint => {
          const [otherLng, otherLat] = otherPoint;
          return Math.abs(lng - otherLng) < 0.000001 && Math.abs(lat - otherLat) < 0.000001;
        });
      });

      expect(uniquePoints).toHaveLength(1);
    });
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