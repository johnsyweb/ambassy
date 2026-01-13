import { EventDetailsMap, eventDetailsToCoordinate } from "@models/EventDetailsMap";
import {
  regionalAmbassadorsFrom,
  eventAmbassadorsFrom,
  EventTeamsTableDataMap,
} from "@models/EventTeamsTableData";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { toLeafletArray, toGeoJSONArray, getLatitude, getLongitude } from "@models/Coordinate";

import d3GeoVoronoi from "d3-geo-voronoi";
import L from "leaflet";
import { colorPalette } from "./colorPalette";

const DEFAULT_EVENT_COLOUR = "rebeccapurple";
const DEFAULT_POLYGON_COLOUR = "lightgrey";

export function populateMap(
  eventTeamsTableData: EventTeamsTableDataMap,
  eventDetails: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  prospectiveEvents?: ProspectiveEvent[]
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

  console.log("Map setup:", {
    raNames,
    eaNames,
    raColorMap: Object.fromEntries(raColorMap),
    eaColorMap: Object.fromEntries(eaColorMap)
  });

  // Calculate event bounds for map centering
  const eventBounds = calculateEventBounds(eventTeamsTableData, eventDetails);
  const {map, markersLayer, polygonsLayer} = setupMapView(eventBounds);

  markersLayer.clearLayers();
  polygonsLayer.clearLayers();
  _markerMap.clear();

  const voronoiPoints: [number, number, string][] = [];


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
      const coord = eventDetailsToCoordinate(event);
      ambassadorEventCoords.push(toLeafletArray(coord));
    }
  });

  // Calculate bounding box with some padding
  // Note: toLeafletArray returns [lat, lng]
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  ambassadorEventCoords.forEach(([lat, lng]) => {
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

      const coord = eventDetailsToCoordinate(event);
      constrainingEvents.push({
        coords: toGeoJSONArray(coord), // Voronoi uses GeoJSON format [lng, lat]
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
      const coord = eventDetailsToCoordinate(event);
      const lat = getLatitude(coord);
      const lng = getLongitude(coord);
      const hasAmbassador = eventTeamsTableData.has(eventName);

      // Include as constraining point if it's near ambassador events but doesn't have an ambassador
      // These points create boundaries without generating visible polygons
      if (!hasAmbassador &&
          lng >= expandedBounds.minLng && lng <= expandedBounds.maxLng &&
          lat >= expandedBounds.minLat && lat <= expandedBounds.maxLat) {
        constrainingEvents.push({
          coords: toGeoJSONArray(coord), // Voronoi uses GeoJSON format [lng, lat]
          isConstraining: true
        });
      }
    });

    // Build Voronoi points from constraining events
    constrainingEvents.forEach((event) => {
      const [lng, lat] = event.coords;

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
        const coord = eventDetailsToCoordinate(event);
        const [lng, lat] = toGeoJSONArray(coord); // Voronoi uses GeoJSON format [lng, lat]

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
    const coord = eventDetailsToCoordinate(event);
    const latitude = getLatitude(coord);
    const longitude = getLongitude(coord);
    const data = eventTeamsTableData.get(eventName);

    // Skip events without ambassador data for processing

    if (data) {
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

  // Add markers for prospective events
  if (prospectiveEvents && prospectiveEvents.length > 0) {
    console.log(`Processing ${prospectiveEvents.length} prospective events for map markers`);
    let prospectsWithCoordinates = 0;
    let prospectsDisplayed = 0;

    prospectiveEvents.forEach((prospect) => {
      const hasCoordinates = !!(prospect.coordinates && prospect.geocodingStatus === 'success');
      const hasAmbassador = !!prospect.eventAmbassador;

      if (hasCoordinates) prospectsWithCoordinates++;
      if (hasCoordinates && hasAmbassador) prospectsDisplayed++;
    });

    console.log(`Summary: ${prospectsWithCoordinates}/${prospectiveEvents.length} have coordinates, ${prospectsDisplayed} will be displayed on map`);

    prospectiveEvents.forEach((prospect) => {
      if (prospect.coordinates && prospect.geocodingStatus === 'success') {

        // Get the EA's color for the prospective event marker
        const eaColor = prospect.eventAmbassador
          ? eaColorMap.get(prospect.eventAmbassador) ?? DEFAULT_EVENT_COLOUR
          : DEFAULT_EVENT_COLOUR; // Default color for unassigned prospects

        // Use diamond shape with EA's color
        const marker = L.marker(toLeafletArray(prospect.coordinates), {
          icon: L.divIcon({
            className: 'prospective-event-marker',
            html: `<span style="color: ${eaColor}; font-size: 16px;">◆</span>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        });

        const tooltip = `
          <strong>Prospective Event:</strong> ${prospect.prospectEvent}<br>
          <strong>Country:</strong> ${prospect.country}<br>
          <strong>State:</strong> ${prospect.state}<br>
          <strong>Event Ambassador:</strong> ${prospect.eventAmbassador || 'Unassigned'}<br>
          <strong>Status:</strong> ${prospect.ambassadorMatchStatus}
        `;

        marker.bindTooltip(tooltip);
        markersLayer.addLayer(marker);
      }
    });
  } else {
    console.log('No prospective events to process');
  }

  // Add markersLayer to map
  markersLayer.addTo(map!);

  // Add prospective events to voronoi calculation
  if (prospectiveEvents && prospectiveEvents.length > 0) {
    let prospectsInVoronoi = 0;
    prospectiveEvents.forEach((prospect) => {
      if (prospect.coordinates && prospect.geocodingStatus === 'success' && prospect.eventAmbassador) {
        prospectsInVoronoi++;
        const coord = prospect.coordinates;
        const [lng, lat] = toGeoJSONArray(coord); // Voronoi uses GeoJSON format [lng, lat]

        // Get the RA color for the voronoi polygon
        const ea = eventAmbassadors.get(prospect.eventAmbassador);
        const raColor = ea?.regionalAmbassador
          ? raColorMap.get(ea.regionalAmbassador) ?? DEFAULT_POLYGON_COLOUR
          : DEFAULT_POLYGON_COLOUR;

        const tooltip = `
          <strong>Prospective Event:</strong> ${prospect.prospectEvent}<br>
          <strong>Country:</strong> ${prospect.country}<br>
          <strong>State:</strong> ${prospect.state}<br>
          <strong>Event Ambassador:</strong> ${prospect.eventAmbassador}<br>
          <strong>Regional Ambassador:</strong> ${ea?.regionalAmbassador || 'Unknown'}<br>
          <strong>Status:</strong> ${prospect.ambassadorMatchStatus}
        `;

        voronoiPoints.push([lng, lat, JSON.stringify({ raColor, tooltip })]);
      }
    });
    console.log(`${prospectsInVoronoi} prospective events added to Voronoi calculation`);
  }

  // Remove duplicate coordinates to prevent degenerate Voronoi polygons
  const uniquePoints = voronoiPoints.filter((point, index, arr) => {
    const [lng, lat] = point;
    return !arr.slice(0, index).some(otherPoint => {
      const [otherLng, otherLat] = otherPoint;
      return Math.abs(lng - otherLng) < 0.000001 && Math.abs(lat - otherLat) < 0.000001;
    });
  });


  // Create Voronoi polygons from the unique points
  const voronoi = d3GeoVoronoi.geoVoronoi(uniquePoints.map((p) => [p[0], p[1]]));
  const polygons = voronoi.polygons();

  polygons.features.forEach((feature, index) => {
    const { raColor, tooltip } = JSON.parse(uniquePoints[index][2]);

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

/**
 * Calculate bounds from events allocated to Event Ambassadors
 */
function calculateEventBounds(
  eventTeamsTableData: EventTeamsTableDataMap,
  eventDetails: EventDetailsMap
): L.LatLngBounds | null {
  const bounds = new L.LatLngBounds([]);
  let hasBounds = false;

  eventDetails.forEach((event, eventName) => {
    const data = eventTeamsTableData.get(eventName);
    if (data) {
      const coord = eventDetailsToCoordinate(event);
      const [lat, lng] = toLeafletArray(coord);
      bounds.extend([lat, lng]);
      hasBounds = true;
    }
  });

  return hasBounds ? bounds : null;
}

function setupMapView(eventBounds: L.LatLngBounds | null) {
  if (!_map) {
    _map = L.map("mapContainer");
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(_map);
    
    if (eventBounds) {
      _map.fitBounds(eventBounds);
    } else {
      _map.setView([0, 0], 2); // Default view if no bounds
    }
    
    _markersLayer = L.layerGroup();
    _polygonsLayer = L.layerGroup();
    _highlightLayer = L.layerGroup();
    _highlightLayer.addTo(_map);
  } else if (eventBounds) {
    // Update bounds if map already exists
    _map.fitBounds(eventBounds);
  }
  return {map: _map, markersLayer: _markersLayer, polygonsLayer: _polygonsLayer};
}

function assignColorsToNames(names: string[]): Map<string, string> {
  const nameColorMap = new Map<string, string>();
  names.forEach((name, index) => {
    nameColorMap.set(name, colorPalette[index % colorPalette.length]);
  });
  return nameColorMap;
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
