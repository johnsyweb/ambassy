import {
  EventDetailsMap,
  eventDetailsToCoordinate,
} from "@models/EventDetailsMap";
import {
  regionalAmbassadorsFrom,
  eventAmbassadorsFrom,
  EventTeamsTableDataMap,
} from "@models/EventTeamsTableData";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { toLeafletArray, getLatitude, getLongitude } from "@models/Coordinate";

import { geoVoronoi } from "d3-geo-voronoi";
import L from "leaflet";
import {
  buildVoronoiSites,
  clipTerritoryRingsToViewport,
  VoronoiSite,
  VoronoiTerritoryCache,
  viewportFromLeafletBounds,
} from "@utils/voronoiTerritories";
import { getEventTeamsTableDataByShortName } from "@models/EventDetailsMap";
import {
  eventTeamRowMatchesAmbassadorNameFilter,
  getAmbassadorNameFilter,
  isAmbassadorNameFilterActive,
  prospectRowMatchesAmbassadorNameFilter,
} from "@utils/ambassadorNameFilter";
import { colorPalette } from "./colorPalette";

const DEFAULT_EVENT_COLOUR = "rebeccapurple";
const DEFAULT_POLYGON_COLOUR = "lightgrey";

export function populateMap(
  eventTeamsTableData: EventTeamsTableDataMap,
  eventDetails: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  prospectiveEvents?: ProspectiveEvent[],
) {
  const raNames = regionalAmbassadorsFrom(eventTeamsTableData);
  const eaNames = eventAmbassadorsFrom(eventTeamsTableData);
  const raColorMap = assignColorsToNames(raNames);
  const eaColorMap = assignColorsToNames(eaNames);

  _mapTerritoryFilterContext = {
    eventTeamsTableData,
    filter: getAmbassadorNameFilter(),
  };

  // Calculate event bounds for map centering
  const eventBounds = calculateEventBounds(eventTeamsTableData, eventDetails);
  const { map, markersLayer, polygonsLayer } = setupMapView(eventBounds);

  markersLayer.clearLayers();
  polygonsLayer.clearLayers();
  _markerMap.clear();
  _eventMarkerFilterState.clear();
  _prospectMarkers.clear();

  eventDetails.forEach((event, eventName) => {
    const coord = eventDetailsToCoordinate(event);
    const latitude = getLatitude(coord);
    const longitude = getLongitude(coord);
    const data = getEventTeamsTableDataByShortName(
      eventTeamsTableData,
      eventName,
    );

    // Skip events without ambassador data for processing

    if (data) {
      _eventMarkerFilterState.set(eventName, {
        kind: "allocated",
        regionalAmbassador: data.regionalAmbassador,
        eventAmbassador: data.eventAmbassador,
      });

      const eaColor =
        eaColorMap.get(data.eventAmbassador) ?? DEFAULT_EVENT_COLOUR;
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
      _eventMarkerFilterState.set(eventName, { kind: "unallocated" });

      // Unallocated events - make them larger and more visible for easier clicking
      const marker = L.circleMarker([latitude, longitude], {
        radius: 4,
        color: DEFAULT_EVENT_COLOUR,
        fillColor: DEFAULT_EVENT_COLOUR,
        fillOpacity: 0.6,
        weight: 2,
      });
      marker.bindTooltip(`${eventName}<br><em>Click to allocate</em>`, {
        permanent: false,
        direction: "top",
        offset: [0, -10],
      });

      // Add hover effect to make it clear the marker is interactive
      marker.on("mouseover", () => {
        marker.setStyle({
          radius: 6,
          fillOpacity: 0.8,
          weight: 3,
        });
        const element = marker.getElement() as HTMLElement | null;
        if (element) {
          element.style.cursor = "pointer";
        }
      });
      marker.on("mouseout", () => {
        marker.setStyle({
          radius: 4,
          fillOpacity: 0.6,
          weight: 2,
        });
        const element = marker.getElement() as HTMLElement | null;
        if (element) {
          element.style.cursor = "pointer";
        }
      });

      // Set cursor style on the marker element when added to map
      marker.on("add", () => {
        const element = marker.getElement() as HTMLElement | null;
        if (element) {
          element.style.cursor = "pointer";
        }
      });

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
    prospectiveEvents.forEach((prospect) => {
      if (prospect.coordinates && prospect.geocodingStatus === "success") {
        // Get the EA's color for the prospective event marker
        const eaColor = prospect.eventAmbassador
          ? (eaColorMap.get(prospect.eventAmbassador) ?? DEFAULT_EVENT_COLOUR)
          : DEFAULT_EVENT_COLOUR; // Default color for unassigned prospects

        // Use diamond shape with EA's color
        const marker = L.marker(toLeafletArray(prospect.coordinates), {
          icon: L.divIcon({
            className: "prospective-event-marker",
            html: `<span style="color: ${eaColor}; font-size: 16px;">◆</span>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
        });

        const tooltip = `
          <strong>Prospective Event:</strong> ${prospect.prospectEvent}<br>
          <strong>Country:</strong> ${prospect.country}<br>
          <strong>State:</strong> ${prospect.state}<br>
          <strong>Event Ambassador:</strong> ${prospect.eventAmbassador || "Unassigned"}<br>
          <strong>Status:</strong> ${prospect.ambassadorMatchStatus}
        `;

        marker.bindTooltip(tooltip);
        markersLayer.addLayer(marker);
        _prospectMarkers.set(prospect.id, {
          marker,
          eventAmbassador: prospect.eventAmbassador,
        });
      }
    });
  }

  // Add markersLayer to map
  markersLayer.addTo(map!);

  _currentVoronoiSites = buildVoronoiSites({
    eventDetails,
    eventTeamsTableData,
    prospectiveEvents,
    styleForAllocatedEvent: (eventShortName) => {
      const data = getEventTeamsTableDataByShortName(
        eventTeamsTableData,
        eventShortName,
      )!;
      return {
        raColor:
          raColorMap.get(data.regionalAmbassador) ?? DEFAULT_POLYGON_COLOUR,
        tooltip: `
          <strong>Event:</strong> ${eventShortName}<br>
          <strong>Event Director(s):</strong> ${data.eventDirectors}<br>
          <strong>Event Ambassador(s):</strong> ${data.eventAmbassador}<br>
          <strong>Regional Ambassador(s):</strong> ${data.regionalAmbassador}<br>
        `,
      };
    },
    styleForProspect: (prospect) => {
      const ea = eventAmbassadors.get(prospect.eventAmbassador);
      const raColor = ea?.regionalAmbassador
        ? (raColorMap.get(ea.regionalAmbassador) ?? DEFAULT_POLYGON_COLOUR)
        : DEFAULT_POLYGON_COLOUR;

      return {
        raColor,
        tooltip: `
          <strong>Prospective Event:</strong> ${prospect.prospectEvent}<br>
          <strong>Country:</strong> ${prospect.country}<br>
          <strong>State:</strong> ${prospect.state}<br>
          <strong>Event Ambassador:</strong> ${prospect.eventAmbassador}<br>
          <strong>Regional Ambassador:</strong> ${ea?.regionalAmbassador || "Unknown"}<br>
          <strong>Status:</strong> ${prospect.ambassadorMatchStatus}
        `,
      };
    },
  });

  drawClippedTerritoryPolygons(map!, polygonsLayer, _currentVoronoiSites);
  ensureViewportClipListener(map!);
  applyAmbassadorNameFilterToMap(eventTeamsTableData);

  // Add polygonsLayer to map
  // Note: polygons are non-interactive (interactive: false) so they don't block marker clicks
  polygonsLayer.addTo(map!);

  // Ensure markersLayer is on top by removing and re-adding it after polygons
  // This ensures markers are clickable even though polygons are added later
  if (map!.hasLayer(markersLayer)) {
    markersLayer.remove();
  }
  markersLayer.addTo(map!);

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
  eventDetails: EventDetailsMap,
): L.LatLngBounds | null {
  const bounds = new L.LatLngBounds([]);
  let hasBounds = false;

  eventDetails.forEach((event, eventName) => {
    const data = getEventTeamsTableDataByShortName(
      eventTeamsTableData,
      eventName,
    );
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
  }
  return {
    map: _map,
    markersLayer: _markersLayer,
    polygonsLayer: _polygonsLayer,
  };
}

function assignColorsToNames(names: string[]): Map<string, string> {
  const nameColorMap = new Map<string, string>();
  names.forEach((name, index) => {
    nameColorMap.set(name, colorPalette[index % colorPalette.length]);
  });
  return nameColorMap;
}

function drawClippedTerritoryPolygons(
  map: L.Map,
  polygonsLayer: L.LayerGroup,
  sites: VoronoiSite[],
): void {
  polygonsLayer.clearLayers();

  const territoryRings = _voronoiTerritoryCache.getRings(sites, geoVoronoi);
  const clippedPolygons = clipTerritoryRingsToViewport(
    territoryRings,
    viewportFromLeafletBounds(map.getBounds()),
  );

  clippedPolygons.forEach(({ id, coordinates, raColor, tooltip }) => {
    if (
      _mapTerritoryFilterContext &&
      isAmbassadorNameFilterActive(_mapTerritoryFilterContext.filter)
    ) {
      const data = getEventTeamsTableDataByShortName(
        _mapTerritoryFilterContext.eventTeamsTableData,
        id,
      );
      if (
        !data ||
        !eventTeamRowMatchesAmbassadorNameFilter(
          data,
          _mapTerritoryFilterContext.filter,
        )
      ) {
        return;
      }
    }

    const poly = L.polygon(coordinates, {
      color: raColor,
      fillOpacity: 0.1,
      interactive: false,
    });
    poly.bindTooltip(tooltip);
    polygonsLayer.addLayer(poly);
  });
}

function ensureViewportClipListener(map: L.Map): void {
  if (_viewportClipListenerAttached) {
    return;
  }

  map.on("moveend zoomend", () => {
    if (_currentVoronoiSites && _polygonsLayer && _map) {
      drawClippedTerritoryPolygons(_map, _polygonsLayer, _currentVoronoiSites);
    }
  });
  _viewportClipListenerAttached = true;
}

// Global variables
let _map: L.Map | null = null;
let _markersLayer: L.LayerGroup;
let _polygonsLayer: L.LayerGroup;
let _layersControl: L.Control.Layers | null = null;
const _markerMap: Map<string, L.CircleMarker> = new Map();
let _highlightLayer: L.LayerGroup | null = null;
let _markerClickHandler: ((eventShortName: string) => void) | null = null;
const _voronoiTerritoryCache = new VoronoiTerritoryCache();
let _currentVoronoiSites: VoronoiSite[] = [];
let _viewportClipListenerAttached = false;
let _mapTerritoryFilterContext: {
  eventTeamsTableData: EventTeamsTableDataMap;
  filter: string;
} | null = null;

type EventMarkerFilterState =
  | {
      kind: "allocated";
      regionalAmbassador: string;
      eventAmbassador: string;
    }
  | { kind: "unallocated" };

const _eventMarkerFilterState = new Map<string, EventMarkerFilterState>();
const _prospectMarkers = new Map<
  string,
  { marker: L.Marker; eventAmbassador?: string }
>();

function eventMarkerMatchesFilter(
  state: EventMarkerFilterState,
  filter: string,
): boolean {
  if (!isAmbassadorNameFilterActive(filter)) {
    return true;
  }

  if (state.kind === "unallocated") {
    return false;
  }

  return eventTeamRowMatchesAmbassadorNameFilter(
    {
      eventShortName: "",
      eventDirectors: "",
      eventAmbassador: state.eventAmbassador,
      regionalAmbassador: state.regionalAmbassador,
      eventCoordinates: "",
      eventSeries: 1,
      eventCountryCode: 0,
      eventCountry: "",
    },
    filter,
  );
}

function setMarkerLayerVisibility(
  markersLayer: L.LayerGroup,
  marker: L.Layer,
  visible: boolean,
): void {
  if (visible) {
    if (!markersLayer.hasLayer(marker)) {
      markersLayer.addLayer(marker);
    }
    return;
  }

  if (markersLayer.hasLayer(marker)) {
    markersLayer.removeLayer(marker);
  }
}

export function applyAmbassadorNameFilterToMap(
  eventTeamsTableData: EventTeamsTableDataMap,
): void {
  if (!_map || !_markersLayer || !_polygonsLayer) {
    return;
  }

  const filter = getAmbassadorNameFilter();
  _mapTerritoryFilterContext = { eventTeamsTableData, filter };

  _markerMap.forEach((marker, eventName) => {
    const state = _eventMarkerFilterState.get(eventName);
    if (!state) {
      return;
    }

    setMarkerLayerVisibility(
      _markersLayer,
      marker,
      eventMarkerMatchesFilter(state, filter),
    );
  });

  _prospectMarkers.forEach(({ marker, eventAmbassador }) => {
    setMarkerLayerVisibility(
      _markersLayer,
      marker,
      prospectRowMatchesAmbassadorNameFilter(eventAmbassador, filter),
    );
  });

  if (_currentVoronoiSites.length > 0) {
    drawClippedTerritoryPolygons(_map, _polygonsLayer, _currentVoronoiSites);
  }
}

export function isEventMarkerVisibleOnMap(eventName: string): boolean {
  const marker = _markerMap.get(eventName);
  return marker ? _markersLayer.hasLayer(marker) : false;
}

export function resetVoronoiTerritoryCacheForTests(): void {
  _voronoiTerritoryCache.clear();
  _currentVoronoiSites = [];
  _viewportClipListenerAttached = false;
  _eventMarkerFilterState.clear();
  _prospectMarkers.clear();
}

export function getMarkerMap(): Map<string, L.CircleMarker> {
  return _markerMap;
}

export function getHighlightLayer(): L.LayerGroup | null {
  return _highlightLayer;
}

export function getMap(): L.Map | null {
  return _map;
}

export function setMarkerClickHandler(
  handler: (eventShortName: string) => void,
): void {
  _markerClickHandler = handler;
}
