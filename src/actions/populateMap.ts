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

  let processedEvents = 0;
  let eventsWithData = 0;
  let eventsWithoutData = 0;

  // Calculate bounds of events with ambassador data to filter out outliers
  const ambassadorEventCoords: [number, number][] = [];
  const ambassadorEventNames: string[] = [];
  eventDetails.forEach((event, eventName) => {
    const data = eventTeamsTableData.get(eventName);
    if (data) {
      const lng = event.geometry.coordinates[0];
      const lat = event.geometry.coordinates[1];
      ambassadorEventCoords.push([lng, lat]);
      ambassadorEventNames.push(eventName);
      console.log(`Ambassador event: ${eventName} at [${lng}, ${lat}]`);
    }
  });

  console.log(`Found ${ambassadorEventCoords.length} events with ambassador data and coordinates`);

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
    console.log(`Ambassador events bounds: [${minLng}, ${minLat}] to [${maxLng}, ${maxLat}]`);
    console.log(`Bounds check enabled: ${useBoundsFilter}`);
  } else {
    console.log(`No valid bounds calculated - disabling bounds filter`);
  }

  eventDetails.forEach((event, eventName) => {
    const latitude = event.geometry.coordinates[1];
    const longitude = event.geometry.coordinates[0];
    const data = eventTeamsTableData.get(eventName);
    processedEvents++;

    // console.log(`Processing event ${eventName}: coords [${longitude}, ${latitude}], hasData: ${!!data}, country: ${event.properties.countrycode}`);

    if (data) {
      eventsWithData++;
      const raColor = raColorMap.get(data.regionalAmbassador) ?? DEFAULT_POLYGON_COLOUR;
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

      // Check if coordinates are within reasonable bounds (if we have bounds to check)
      const isWithinBounds = !useBoundsFilter || (longitude >= minLng && longitude <= maxLng && latitude >= minLat && latitude <= maxLat);

      console.log(`Event ${eventName}: coords [${longitude}, ${latitude}], bounds check: ${useBoundsFilter ? 'enabled' : 'disabled'}, within bounds: ${isWithinBounds}`);

      if (isWithinBounds) {
        // d3-geo-voronoi expects [longitude, latitude] for spherical coordinates
        voronoiPoints.push([longitude, latitude, JSON.stringify({ raColor, tooltip })]);
        console.log(`✓ Added ${eventName} to voronoiPoints at [${longitude}, ${latitude}]`);
      } else {
        console.warn(`✗ Skipping ${eventName} from Voronoi calculation due to out-of-bounds coordinates [${longitude}, ${latitude}]`);
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

  console.log(`Map population summary: ${processedEvents} total events processed, ${eventsWithData} with ambassador data, ${eventsWithoutData} without data, ${voronoiPoints.length} voronoi points created`);

  // Add markersLayer to map
  markersLayer.addTo(map!);

  const voronoi = d3GeoVoronoi.geoVoronoi(voronoiPoints.map((p) => [p[0], p[1]]));
  const polygons = voronoi.polygons();

  polygons.features.forEach((feature, index) => {
    const { raColor, tooltip } = JSON.parse(voronoiPoints[index][2]);
    const coordinates = (
      feature.geometry.coordinates[0] as [number, number][]
    ).map((coord) => [coord[1], coord[0]] as L.LatLngTuple);

    // Clip polygons to bounds to prevent them from extending to infinity
    const clippedCoordinates = coordinates.filter(coord => {
      const [lat, lng] = coord;
      return lng >= minLng - 10 && lng <= maxLng + 10 &&
             lat >= minLat - 10 && lat <= maxLat + 10;
    });

    if (clippedCoordinates.length >= 3) { // Need at least 3 points for a polygon
      const poly = L.polygon(clippedCoordinates, {
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
    "Ambassador Polygons": polygonsLayer,
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
  const bounds = countries[countryCode].bounds;
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
