import { countries } from "@models/country";
import { EventDetailsMap } from "@models/EventDetailsMap";
import {
  regionalAmbassadorsFrom,
  eventAmbassadorsFrom,
  EventTeamsTableDataMap,
} from "@models/EventTeamsTableData";

import * as d3GeoVoronoi from "d3-geo-voronoi";
import L from "leaflet";
import { colorPalette } from "./colorPalette";

const DEFAULT_EVENT_COLOUR = "rebeccapurple";
const DEFAULT_POLYGON_COLOUR = "lightgrey";

export function populateMap(
  eventTeamsTableData: EventTeamsTableDataMap,
  eventDetails: EventDetailsMap
) {
  console.log("populateMap called with:", {
    eventTeamsTableDataSize: eventTeamsTableData.size,
    eventDetailsSize: eventDetails.size,
    eventTeamsTableDataKeys: Array.from(eventTeamsTableData.keys()).slice(0, 5),
    eventDetailsKeys: Array.from(eventDetails.keys()).slice(0, 5)
  });

  const raNames = regionalAmbassadorsFrom(eventTeamsTableData);
  const eaNames = eventAmbassadorsFrom(eventTeamsTableData);
  const raColorMap = assignColorsToNames(raNames);
  const eaColorMap = assignColorsToNames(eaNames);
  const countryCode = country(eventTeamsTableData);

  console.log("Map setup:", {
    raNames,
    eaNames,
    countryCode,
    raColorMap: Object.fromEntries(raColorMap),
    eaColorMap: Object.fromEntries(eaColorMap)
  });

  const {map, markersLayer, polygonsLayer} = setupMapView(countryCode);

  markersLayer.clearLayers();
  polygonsLayer.clearLayers();
  _markerMap.clear();

  const voronoiPoints: [number, number, string][] = [];
  const coordinateUsage = new Map<string, number>(); // Track coordinate usage to offset duplicates

  let processedEvents = 0;
  let eventsWithData = 0;
  const eventsWithoutData = 0;

  // Will be populated after bounds calculation
  const constrainingEvents: Array<{coords: [number, number], isConstraining: boolean, raColor?: string, tooltip?: string}> = [];

  // Build Voronoi points from constraining events
  constrainingEvents.forEach(({coords: [lng, lat], isConstraining}) => {
    if (isConstraining) {
      // Constraining points don't create polygons, just help define boundaries
      voronoiPoints.push([lng, lat, JSON.stringify({ raColor: 'transparent', tooltip: '' })]);
    }
  });

  // Calculate bounds of events with ambassador data to filter out outliers
  const ambassadorEventCoords: [number, number][] = [];
  eventDetails.forEach((event, eventName) => {
    const data = eventTeamsTableData.get(eventName);
    if (data) {
      ambassadorEventCoords.push([event.geometry.coordinates[0], event.geometry.coordinates[1]]);
    }
  });

  // Calculate bounding box with some padding
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  ambassadorEventCoords.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  // Add padding (about 5 degrees) if we have valid bounds
  let useBoundsFilter = false;
  if (ambassadorEventCoords.length > 0 && minLng !== Infinity) {
    const padding = 5;
    minLng -= padding;
    maxLng += padding;
    minLat -= padding;
    maxLat += padding;
    useBoundsFilter = true;
  } else {
  }

  // Build constraining events for Voronoi calculation

  // Add ambassador events (these create polygons)
  eventDetails.forEach((event, eventName) => {
    const data = eventTeamsTableData.get(eventName);
    if (data) {
      const raColor = raColorMap.get(data.regionalAmbassador) ?? DEFAULT_POLYGON_COLOUR;
      const tooltip = `
        <strong>Event:</strong> ${eventName}<br>
        <strong>Event Director(s):</strong> ${data.eventDirectors}<br>
        <strong>Event Ambassador(s):</strong> ${data.eventAmbassador}<br>
        <strong>Regional Ambassador(s):</strong> ${data.regionalAmbassador}<br>
      `;

      constrainingEvents.push({
        coords: [event.geometry.coordinates[0], event.geometry.coordinates[1]],
        isConstraining: false,
        raColor,
        tooltip
      });
    }
  });

  // CRITICAL: Add nearby parkrun events as constraining points
  // These prevent Voronoi polygons from extending infinitely by providing boundary points
  // Events without ambassadors create "transparent" polygons that constrain boundaries
  // DO NOT REMOVE: Essential for proper geographic territory visualization
  if (useBoundsFilter) {
    const expandedBounds = {
      minLng: minLng - 2, // Additional 2 degrees for constraining points
      maxLng: maxLng + 2,
      minLat: minLat - 2,
      maxLat: maxLat + 2
    };

    eventDetails.forEach((event, eventName) => {
      const lng = event.geometry.coordinates[0];
      const lat = event.geometry.coordinates[1];
      const hasAmbassador = eventTeamsTableData.has(eventName);

      // Include as constraining point if it's near ambassador events but doesn't have an ambassador
      // These points create boundaries without generating visible polygons
      if (!hasAmbassador &&
          lng >= expandedBounds.minLng && lng <= expandedBounds.maxLng &&
          lat >= expandedBounds.minLat && lat <= expandedBounds.maxLat) {
        constrainingEvents.push({
          coords: [lng, lat],
          isConstraining: true
        });
      }
    });

    // Build Voronoi points from constraining events
    constrainingEvents.forEach((event) => {
      let [lng, lat] = event.coords;
      const coordKey = `${lng.toFixed(6)},${lat.toFixed(6)}`;
      const usageCount = coordinateUsage.get(coordKey) || 0;
      coordinateUsage.set(coordKey, usageCount + 1);

      // Apply deterministic small offset for duplicate coordinates to avoid degenerate polygons
      // Use event index/order for consistent positioning instead of random values
      if (usageCount > 0) {
        const offset = 0.0005 * usageCount; // ~50 meters offset
        // Create consistent offset pattern based on usage count
        const angle = (usageCount * 137.5) * (Math.PI / 180); // Golden angle approximation
        lng += offset * Math.cos(angle);
        lat += offset * Math.sin(angle);
      }

      if (event.isConstraining) {
        // Constraining points don't create polygons, just help define boundaries
        voronoiPoints.push([lng, lat, JSON.stringify({ raColor: 'transparent', tooltip: '' })]);
      } else {
        // Ambassador events create polygons
        voronoiPoints.push([lng, lat, JSON.stringify({ raColor: event.raColor, tooltip: event.tooltip })]);
      }
    });
  } else {
    // No bounds filtering - just include ambassador events
    eventDetails.forEach((event, eventName) => {
      const data = eventTeamsTableData.get(eventName);
      if (data) {
        let lng = event.geometry.coordinates[0];
        let lat = event.geometry.coordinates[1];
        const coordKey = `${lng.toFixed(6)},${lat.toFixed(6)}`;
        const usageCount = coordinateUsage.get(coordKey) || 0;
        coordinateUsage.set(coordKey, usageCount + 1);

        // Apply deterministic small offset for duplicate coordinates to avoid degenerate polygons
        // Use event name hash for consistent positioning instead of random values
        if (usageCount > 0) {
          const offset = 0.0005 * usageCount; // ~50 meters offset
          // Create consistent offset pattern based on event name
          const nameHash = eventName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          const angle = (nameHash * 137.5) % 360 * (Math.PI / 180); // Golden angle with name-based variation
          lng += offset * Math.cos(angle);
          lat += offset * Math.sin(angle);
        }

        const raColor = raColorMap.get(data.regionalAmbassador) ?? DEFAULT_POLYGON_COLOUR;
        const tooltip = `
          <strong>Event:</strong> ${eventName}<br>
          <strong>Event Director(s):</strong> ${data.eventDirectors}<br>
          <strong>Event Ambassador(s):</strong> ${data.eventAmbassador}<br>
          <strong>Regional Ambassador(s):</strong> ${data.regionalAmbassador}<br>
        `;
        voronoiPoints.push([lng, lat, JSON.stringify({ raColor, tooltip })]);
      }
    });
  }

  eventDetails.forEach((event, eventName) => {
    const latitude = event.geometry.coordinates[1];
    const longitude = event.geometry.coordinates[0];
    const data = eventTeamsTableData.get(eventName);
    processedEvents++;

    // Skip events without ambassador data for processing

    if (data) {
      eventsWithData++;
      const eaColor = eaColorMap.get(data.eventAmbassador) ?? DEFAULT_EVENT_COLOUR;
      const tooltip = `
        <strong>Event:</strong> ${eventName}<br>
        <strong>Event Director(s):</strong> ${data.eventDirectors}<br>
        <strong>Event Ambassador(s):</strong> ${data.eventAmbassador}<br>
        <strong>Regional Ambassador(s):</strong> ${data.regionalAmbassador}<br>
      `;

      const marker = L.circleMarker([latitude, longitude], {
        radius: 5,
        color: eaColor,
      });
      marker.bindTooltip(tooltip);
      _markerMap.set(eventName, marker);
      markersLayer.addLayer(marker);

      if (_markerClickHandler) {
        marker.on("click", () => {
          _markerClickHandler!(eventName);
        });
      }
    } else {
      const marker = L.circleMarker([latitude, longitude], {
        radius: 1,
        color: DEFAULT_EVENT_COLOUR,
      });
      marker.bindTooltip(eventName);
      _markerMap.set(eventName, marker);
      markersLayer.addLayer(marker);
      
      if (_markerClickHandler) {
        marker.on("click", () => {
          _markerClickHandler!(eventName);
        });
      }

      // Note: Events without ambassador data are not included in Voronoi polygons
      // Polygons should only represent territories based on events with ambassador assignments
    }
  });

  // Add markersLayer to map
  markersLayer.addTo(map!);

  const voronoi = d3GeoVoronoi.geoVoronoi(voronoiPoints.map((p) => [p[0], p[1]]));
  const polygons = voronoi.polygons();

  polygons.features.forEach((feature: any, index: number) => {
    const { raColor, tooltip } = JSON.parse(voronoiPoints[index][2]);

    // Skip polygons for constraining points (they have transparent color)
    if (raColor === 'transparent') {
      return;
    }

    const coordinates = (
      feature.geometry.coordinates[0] as [number, number][]
    ).map((coord) => [coord[1], coord[0]] as L.LatLngTuple);

    // Let Leaflet handle coordinate bounds - don't pre-clip to avoid splitting polygons
    if (coordinates.length >= 3) { // Need at least 3 points for a polygon
      const poly = L.polygon(coordinates, {
        color: raColor,
        fillOpacity: 0.1,
      });
      poly.bindTooltip(tooltip);
      polygonsLayer.addLayer(poly);
    }
  });

  // Add polygonsLayer to map
  polygonsLayer.addTo(map!);

  // Add or update layer control (remove existing if present)
  if (_layersControl) {
    _layersControl.remove();
  }
  const overlayMaps = {
    "Event Markers": markersLayer,
    "Regional Event Ambassador": polygonsLayer,
  };
  _layersControl = L.control.layers(undefined, overlayMaps);
  _layersControl.addTo(map!);
}

function setupMapView(countryCode: number) {
  if (!_map) {
    _map = L.map("mapContainer").setView([0, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(_map);
    setMapCenterToCountry(_map, countryCode);
    _markersLayer = L.layerGroup();
    _polygonsLayer = L.layerGroup();
    _highlightLayer = L.layerGroup();
    _highlightLayer.addTo(_map);
  }
  return {map: _map, markersLayer: _markersLayer, polygonsLayer: _polygonsLayer};
}



function setMapCenterToCountry(map: L.Map, countryCode: number) {
  const bounds = countries[countryCode.toString()].bounds;
  map?.fitBounds([
    [bounds[1], bounds[0]],
    [bounds[3], bounds[2]],
  ]);
}

function assignColorsToNames(names: string[]): Map<string, string> {
  const nameColorMap = new Map<string, string>();
  names.forEach((name, index) => {
    nameColorMap.set(name, colorPalette[index % colorPalette.length]);
  });
  return nameColorMap;
}

function country(eventTeamsTableData: EventTeamsTableDataMap): number {
return Math.max(...Array.from(eventTeamsTableData.values())
  .map((data) => data.eventCountryCode)
) ?? 1;
}

// Global variables
let _map: L.Map | null = null;
let _markersLayer: L.LayerGroup;
let _polygonsLayer: L.LayerGroup;
let _layersControl: L.Control.Layers | null = null;
const _markerMap: Map<string, L.CircleMarker> = new Map();
let _highlightLayer: L.LayerGroup | null = null;
let _markerClickHandler: ((eventShortName: string) => void) | null = null;

export function getMarkerMap(): Map<string, L.CircleMarker> {
  return _markerMap;
}

export function getHighlightLayer(): L.LayerGroup | null {
  return _highlightLayer;
}

export function getMap(): L.Map | null {
  return _map;
}

export function setMarkerClickHandler(handler: (eventShortName: string) => void): void {
  _markerClickHandler = handler;
}
