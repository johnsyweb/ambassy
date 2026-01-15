import L from "leaflet";
import {
  highlightEventsOnMap,
  centerMapOnEvents,
  clearMapHighlights,
} from "./mapNavigation";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventDetails } from "@models/EventDetails";

describe("mapNavigation", () => {
  let map: L.Map;
  let markerMap: Map<string, L.CircleMarker>;
  let highlightLayer: L.LayerGroup;
  let eventDetails: EventDetailsMap;

  beforeEach(() => {
    document.body.innerHTML = '<div id="mapContainer"></div>';

    map = L.map("mapContainer").setView([0, 0], 2);
    markerMap = new Map();
    highlightLayer = L.layerGroup();
    eventDetails = new Map();

    const marker1 = L.circleMarker([-37.8, 144.9], { radius: 5 });
    const marker2 = L.circleMarker([-33.9, 151.2], { radius: 5 });

    markerMap.set("event1", marker1);
    markerMap.set("event2", marker2);

    eventDetails.set("event1", {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [144.9, -37.8],
      },
      properties: {
        seriesid: 1,
        countrycode: 1,
      },
    } as EventDetails);

    eventDetails.set("event2", {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [151.2, -33.9],
      },
      properties: {
        seriesid: 2,
        countrycode: 1,
      },
    } as EventDetails);
  });

  afterEach(() => {
    map.remove();
    document.body.innerHTML = "";
  });

  describe("highlightEventsOnMap", () => {
    it("should highlight single event", () => {
      const clearLayersSpy = jest.spyOn(highlightLayer, "clearLayers");
      const addLayerSpy = jest.spyOn(highlightLayer, "addLayer");

      highlightEventsOnMap(["event1"], markerMap, highlightLayer);

      expect(clearLayersSpy).toHaveBeenCalled();
      expect(addLayerSpy).toHaveBeenCalledTimes(1);
    });

    it("should clear previous highlights", () => {
      const clearLayersSpy = jest.spyOn(highlightLayer, "clearLayers");

      highlightEventsOnMap(["event1"], markerMap, highlightLayer);
      highlightEventsOnMap(["event2"], markerMap, highlightLayer);

      expect(clearLayersSpy).toHaveBeenCalledTimes(2);
    });

    it("should handle multiple events", () => {
      const addLayerSpy = jest.spyOn(highlightLayer, "addLayer");

      highlightEventsOnMap(["event1", "event2"], markerMap, highlightLayer);

      expect(addLayerSpy).toHaveBeenCalledTimes(2);
    });

    it("should ignore events that do not exist in markerMap", () => {
      const addLayerSpy = jest.spyOn(highlightLayer, "addLayer");

      highlightEventsOnMap(["nonexistent"], markerMap, highlightLayer);

      expect(addLayerSpy).not.toHaveBeenCalled();
    });
  });

  describe("centerMapOnEvents", () => {
    it("should use setView for single event", () => {
      const setViewSpy = jest.spyOn(map, "setView");

      centerMapOnEvents(["event1"], eventDetails, map);

      expect(setViewSpy).toHaveBeenCalled();
      expect(setViewSpy.mock.calls[0][0]).toEqual([-37.8, 144.9]);
      expect(setViewSpy.mock.calls[0][1]).toBe(13);
      expect(setViewSpy.mock.calls[0][2]).toMatchObject({ animate: true });
    });

    it("should use fitBounds for multiple events", () => {
      const fitBoundsSpy = jest.spyOn(map, "fitBounds");

      centerMapOnEvents(["event1", "event2"], eventDetails, map);

      expect(fitBoundsSpy).toHaveBeenCalled();
      const bounds = fitBoundsSpy.mock.calls[0][0];
      expect(Array.isArray(bounds)).toBe(true);
      expect((bounds as L.LatLngTuple[]).length).toBe(2);
    });

    it("should do nothing for empty array", () => {
      const setViewSpy = jest.spyOn(map, "setView");
      const fitBoundsSpy = jest.spyOn(map, "fitBounds");

      centerMapOnEvents([], eventDetails, map);

      expect(setViewSpy).not.toHaveBeenCalled();
      expect(fitBoundsSpy).not.toHaveBeenCalled();
    });

    it("should ignore events that do not exist", () => {
      const setViewSpy = jest.spyOn(map, "setView");

      centerMapOnEvents(["nonexistent"], eventDetails, map);

      expect(setViewSpy).not.toHaveBeenCalled();
    });
  });

  describe("clearMapHighlights", () => {
    it("should clear all highlights", () => {
      const clearLayersSpy = jest.spyOn(highlightLayer, "clearLayers");

      clearMapHighlights(highlightLayer);

      expect(clearLayersSpy).toHaveBeenCalled();
    });
  });
});

