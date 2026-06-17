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
  ViewportBounds,
} from "@utils/voronoiTerritories";
import { findUnallocatedEventsInViewport } from "@utils/viewportUnallocatedMarkers";
import { computeMapPopulationFingerprint } from "@utils/mapPopulationFingerprint";
import { getEventTeamsTableDataByShortName } from "@models/EventDetailsMap";
import {
  eventTeamRowMatchesAmbassadorNameFilter,
  getAmbassadorNameFilter,
  isAmbassadorNameFilterActive,
  prospectRowMatchesAmbassadorNameFilter,
} from "@utils/ambassadorNameFilter";
import {
  createProspectMapDivIcon,
  formatProspectMapTooltip,
  ProspectLaunchReadiness,
  syncProspectMapLegend,
} from "@utils/prospectMapMarker";
import {
  allocatedLiveMarkerRadius,
  MAP_MARKER_ZOOM_SCALE_FLOOR,
  prospectMapMarkerPixelSize,
  unallocatedMarkerRadii,
} from "@utils/mapMarkerZoomScale";
import {
  applyUnallocatedParkrunsOverlayTitle,
  LIVE_EVENTS_OVERLAY_LABEL,
  PROSPECTIVE_EVENTS_OVERLAY_LABEL,
  REGIONAL_EVENT_AMBASSADOR_OVERLAY_LABEL,
  UNALLOCATED_PARKRUNS_OVERLAY_LABEL,
} from "@utils/territoryMapOverlays";
import {
  getTerritoryMapOverlayVisibility,
  setTerritoryMapOverlayVisibility,
} from "@utils/territoryMapOverlayVisibility";
import { colorPalette } from "./colorPalette";

const DEFAULT_EVENT_COLOUR = "rebeccapurple";
const DEFAULT_POLYGON_COLOUR = "lightgrey";

export const EVENT_MARKER_MAP_OPTIONS: L.MapOptions = {
  preferCanvas: true,
};

export function populateMap(
  eventTeamsTableData: EventTeamsTableDataMap,
  eventDetails: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  prospectiveEvents?: ProspectiveEvent[],
) {
  const populationFingerprint = computeMapPopulationFingerprint({
    eventTeamsTableData,
    eventDetails,
    prospectiveEvents,
  });

  if (_map && populationFingerprint === _lastMapPopulationFingerprint) {
    return;
  }

  _lastMapPopulationFingerprint = populationFingerprint;

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
  const {
    map,
    liveMarkersLayer,
    prospectMarkersLayer,
    unallocatedMarkersLayer,
    polygonsLayer,
    isNewMap,
  } = setupMapView(eventBounds);

  liveMarkersLayer.clearLayers();
  prospectMarkersLayer.clearLayers();
  unallocatedMarkersLayer.clearLayers();
  polygonsLayer.clearLayers();
  _markerMap.clear();
  _unallocatedMarkerMap.clear();
  _eventMarkerFilterState.clear();
  _prospectMarkers.clear();
  _mapPopulationContext = { eventDetails, eventTeamsTableData };

  eventTeamsTableData.forEach((data, eventName) => {
    const event = eventDetails.get(eventName);
    if (!event) {
      return;
    }

    const coord = eventDetailsToCoordinate(event);
    const latitude = getLatitude(coord);
    const longitude = getLongitude(coord);

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
      radius: allocatedLiveMarkerRadius(map.getZoom()),
      color: eaColor,
    });
    marker.bindTooltip(tooltip);
    _markerMap.set(eventName, marker);
    liveMarkersLayer.addLayer(marker);

    if (_markerClickHandler) {
      marker.on("click", () => {
        _markerClickHandler!(eventName);
      });
    }
  });

  // Add markers for prospective events
  if (prospectiveEvents && prospectiveEvents.length > 0) {
    prospectiveEvents.forEach((prospect) => {
      if (prospect.coordinates && prospect.geocodingStatus === "success") {
        const eaColor = prospect.eventAmbassador
          ? (eaColorMap.get(prospect.eventAmbassador) ?? DEFAULT_EVENT_COLOUR)
          : DEFAULT_EVENT_COLOUR;

        const readiness: ProspectLaunchReadiness = {
          courseFound: prospect.courseFound,
          landownerPermission: prospect.landownerPermission,
          fundingConfirmed: prospect.fundingConfirmed,
        };

        const marker = L.marker(toLeafletArray(prospect.coordinates), {
          icon: createProspectMapDivIcon(
            readiness,
            eaColor,
            prospectMapMarkerPixelSize(map.getZoom()),
          ),
        });

        marker.bindTooltip(formatProspectMapTooltip(prospect));
        prospectMarkersLayer.addLayer(marker);
        _prospectMarkers.set(prospect.id, {
          marker,
          readiness,
          borderColor: eaColor,
          eventAmbassador: prospect.eventAmbassador,
          regionalAmbassador: eventAmbassadors.get(prospect.eventAmbassador)
            ?.regionalAmbassador,
        });
      }
    });
  }

  refreshViewportUnallocatedMarkers();
  if (isNewMap) {
    map.once("moveend", () => {
      refreshViewportUnallocatedMarkers();
    });
  }

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
        tooltip: formatProspectMapTooltip({
          prospectEvent: prospect.prospectEvent,
          country: prospect.country,
          state: prospect.state,
          eventAmbassador: prospect.eventAmbassador,
          courseFound: prospect.courseFound,
          landownerPermission: prospect.landownerPermission,
          fundingConfirmed: prospect.fundingConfirmed,
        }),
      };
    },
  });

  drawClippedTerritoryPolygons(map!, polygonsLayer, _currentVoronoiSites);
  ensureViewportClipListener(map!);
  applyAmbassadorNameFilterToMap(eventTeamsTableData);

  applyTerritoryMapOverlayVisibility(map!);

  // Add or update layer control (remove existing if present)
  if (_layersControl) {
    _layersControl.remove();
  }
  const overlayMaps = {
    [LIVE_EVENTS_OVERLAY_LABEL]: liveMarkersLayer,
    [PROSPECTIVE_EVENTS_OVERLAY_LABEL]: prospectMarkersLayer,
    [UNALLOCATED_PARKRUNS_OVERLAY_LABEL]: unallocatedMarkersLayer,
    [REGIONAL_EVENT_AMBASSADOR_OVERLAY_LABEL]: polygonsLayer,
  };
  _layersControl = L.control.layers(undefined, overlayMaps);
  _layersControl.addTo(map!);

  ensureMapOverlayListener(map!);
  syncProspectMapLegendVisibility();

  const mapContainer = document.getElementById("mapContainer");
  if (mapContainer) {
    applyUnallocatedParkrunsOverlayTitle(mapContainer);
  }

  syncMapMarkerSizes(map);
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

function setupMapView(eventBounds: L.LatLngBounds | null): {
  map: L.Map;
  liveMarkersLayer: L.LayerGroup;
  prospectMarkersLayer: L.LayerGroup;
  unallocatedMarkersLayer: L.LayerGroup;
  polygonsLayer: L.LayerGroup;
  isNewMap: boolean;
} {
  const isNewMap = !_map;
  if (!_map) {
    _map = L.map("mapContainer", EVENT_MARKER_MAP_OPTIONS);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(_map);

    if (eventBounds) {
      _map.fitBounds(eventBounds);
    } else {
      _map.setView([0, 0], 2); // Default view if no bounds
    }

    _liveMarkersLayer = L.layerGroup();
    _prospectMarkersLayer = L.layerGroup();
    _unallocatedMarkersLayer = L.layerGroup();
    _polygonsLayer = L.layerGroup();
    _highlightLayer = L.layerGroup();
    _highlightLayer.addTo(_map);
  }
  return {
    map: _map,
    liveMarkersLayer: _liveMarkersLayer,
    prospectMarkersLayer: _prospectMarkersLayer,
    unallocatedMarkersLayer: _unallocatedMarkersLayer,
    polygonsLayer: _polygonsLayer,
    isNewMap,
  };
}

function applyTerritoryMapOverlayVisibility(map: L.Map): void {
  const visibility = getTerritoryMapOverlayVisibility();
  const markerLayers = [
    {
      layer: _unallocatedMarkersLayer,
      visible: visibility.unallocatedParkruns,
    },
    {
      layer: _prospectMarkersLayer,
      visible: visibility.prospectiveEvents,
    },
    { layer: _liveMarkersLayer, visible: visibility.liveEvents },
  ];

  _suppressOverlayPersistence = true;
  try {
    for (const { layer } of markerLayers) {
      if (map.hasLayer(layer)) {
        layer.remove();
      }
    }

    for (const { layer, visible } of markerLayers) {
      if (visible) {
        layer.addTo(map);
      }
    }

    if (visibility.regionalEventAmbassador) {
      if (!map.hasLayer(_polygonsLayer)) {
        _polygonsLayer.addTo(map);
      }
    } else if (map.hasLayer(_polygonsLayer)) {
      _polygonsLayer.remove();
    }
  } finally {
    _suppressOverlayPersistence = false;
  }
}

function persistTerritoryMapOverlayVisibilityFromMap(map: L.Map): void {
  if (_suppressOverlayPersistence) {
    return;
  }

  setTerritoryMapOverlayVisibility({
    liveEvents: map.hasLayer(_liveMarkersLayer),
    prospectiveEvents: map.hasLayer(_prospectMarkersLayer),
    unallocatedParkruns: map.hasLayer(_unallocatedMarkersLayer),
    regionalEventAmbassador: map.hasLayer(_polygonsLayer),
  });
}

function hasVisibleProspectMarkersOnMap(): boolean {
  if (!_map?.hasLayer(_prospectMarkersLayer)) {
    return false;
  }

  for (const { marker } of _prospectMarkers.values()) {
    if (_prospectMarkersLayer.hasLayer(marker)) {
      return true;
    }
  }

  return false;
}

function syncProspectMapLegendVisibility(): void {
  const mapContainer = document.getElementById("mapContainer");
  if (!mapContainer) {
    return;
  }

  syncProspectMapLegend(mapContainer, hasVisibleProspectMarkersOnMap());
}

function refreshSelectionHighlightForOverlayState(): void {
  if (!_map || !_highlightLayer) {
    return;
  }

  if (!_map.hasLayer(_liveMarkersLayer)) {
    _highlightLayer.clearLayers();
    return;
  }

  _selectionHighlightRefreshHandler?.();
}

function ensureMapOverlayListener(map: L.Map): void {
  if (_overlayListenerAttached) {
    return;
  }

  map.on("overlayadd overlayremove", () => {
    persistTerritoryMapOverlayVisibilityFromMap(map);
    syncProspectMapLegendVisibility();
    refreshSelectionHighlightForOverlayState();
  });
  _overlayListenerAttached = true;
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
    syncMapMarkerSizes(map);
    refreshViewportUnallocatedMarkers();
    _selectionHighlightRefreshHandler?.();
  });
  _viewportClipListenerAttached = true;
}

function syncMapMarkerSizes(map: L.Map): void {
  const zoom = map.getZoom();
  const liveRadius = allocatedLiveMarkerRadius(zoom);
  const { base, hover } = unallocatedMarkerRadii(zoom);
  const prospectSize = prospectMapMarkerPixelSize(zoom);

  _markerMap.forEach((marker, eventName) => {
    if (_unallocatedMarkerMap.has(eventName)) {
      return;
    }

    marker.setStyle({ radius: liveRadius });
  });

  _unallocatedMarkerMap.forEach((marker) => {
    const isHovered = _unallocatedMarkerHoverState.get(marker) ?? false;
    marker.setStyle({ radius: isHovered ? hover : base });
  });

  _prospectMarkers.forEach(({ marker, readiness, borderColor }) => {
    marker.setIcon(
      createProspectMapDivIcon(readiness, borderColor, prospectSize),
    );
  });
}

function createUnallocatedEventMarker(
  eventName: string,
  latitude: number,
  longitude: number,
): L.CircleMarker {
  const zoom = _map?.getZoom() ?? MAP_MARKER_ZOOM_SCALE_FLOOR;
  const { base } = unallocatedMarkerRadii(zoom);

  const marker = L.circleMarker([latitude, longitude], {
    radius: base,
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

  marker.on("mouseover", () => {
    _unallocatedMarkerHoverState.set(marker, true);
    const { hover: hoverRadius } = unallocatedMarkerRadii(
      _map?.getZoom() ?? MAP_MARKER_ZOOM_SCALE_FLOOR,
    );
    marker.setStyle({
      radius: hoverRadius,
      fillOpacity: 0.8,
      weight: 3,
    });
    const element = marker.getElement() as HTMLElement | null;
    if (element) {
      element.style.cursor = "pointer";
    }
  });
  marker.on("mouseout", () => {
    _unallocatedMarkerHoverState.set(marker, false);
    const { base: baseRadius } = unallocatedMarkerRadii(
      _map?.getZoom() ?? MAP_MARKER_ZOOM_SCALE_FLOOR,
    );
    marker.setStyle({
      radius: baseRadius,
      fillOpacity: 0.6,
      weight: 2,
    });
    const element = marker.getElement() as HTMLElement | null;
    if (element) {
      element.style.cursor = "pointer";
    }
  });
  marker.on("add", () => {
    const element = marker.getElement() as HTMLElement | null;
    if (element) {
      element.style.cursor = "pointer";
    }
  });

  if (_markerClickHandler) {
    marker.on("click", () => {
      _markerClickHandler!(eventName);
    });
  }

  return marker;
}

function refreshViewportUnallocatedMarkers(
  viewportOverride?: ViewportBounds,
): void {
  if (!_map || !_unallocatedMarkersLayer || !_mapPopulationContext) {
    return;
  }

  if (isAmbassadorNameFilterActive(getAmbassadorNameFilter())) {
    for (const eventName of [..._unallocatedMarkerMap.keys()]) {
      removeUnallocatedMarker(eventName);
    }
    return;
  }

  const viewport =
    viewportOverride ?? viewportFromLeafletBounds(_map.getBounds());
  const visibleUnallocated = findUnallocatedEventsInViewport(
    _mapPopulationContext.eventDetails,
    _mapPopulationContext.eventTeamsTableData,
    viewport,
  );
  const visibleNames = new Set(
    visibleUnallocated.map((event) => event.eventName),
  );

  for (const eventName of [..._unallocatedMarkerMap.keys()]) {
    if (!visibleNames.has(eventName)) {
      removeUnallocatedMarker(eventName);
    }
  }

  for (const event of visibleUnallocated) {
    if (_unallocatedMarkerMap.has(event.eventName)) {
      continue;
    }

    _eventMarkerFilterState.set(event.eventName, { kind: "unallocated" });
    const marker = createUnallocatedEventMarker(
      event.eventName,
      event.latitude,
      event.longitude,
    );
    _markerMap.set(event.eventName, marker);
    _unallocatedMarkerMap.set(event.eventName, marker);
    _unallocatedMarkersLayer.addLayer(marker);
  }
}

function removeUnallocatedMarker(eventName: string): void {
  const marker = _unallocatedMarkerMap.get(eventName);
  if (marker && _unallocatedMarkersLayer?.hasLayer(marker)) {
    _unallocatedMarkersLayer.removeLayer(marker);
  }

  _unallocatedMarkerMap.delete(eventName);
  _markerMap.delete(eventName);
  _eventMarkerFilterState.delete(eventName);
}

// Global variables
let _map: L.Map | null = null;
let _liveMarkersLayer: L.LayerGroup;
let _prospectMarkersLayer: L.LayerGroup;
let _unallocatedMarkersLayer: L.LayerGroup;
let _polygonsLayer: L.LayerGroup;
let _layersControl: L.Control.Layers | null = null;
const _markerMap: Map<string, L.CircleMarker> = new Map();
const _unallocatedMarkerMap: Map<string, L.CircleMarker> = new Map();
let _highlightLayer: L.LayerGroup | null = null;
let _markerClickHandler: ((eventShortName: string) => void) | null = null;
let _selectionHighlightRefreshHandler: (() => void) | null = null;
const _unallocatedMarkerHoverState = new WeakMap<L.CircleMarker, boolean>();
const _voronoiTerritoryCache = new VoronoiTerritoryCache();
let _currentVoronoiSites: VoronoiSite[] = [];
let _viewportClipListenerAttached = false;
let _overlayListenerAttached = false;
let _suppressOverlayPersistence = false;
let _mapTerritoryFilterContext: {
  eventTeamsTableData: EventTeamsTableDataMap;
  filter: string;
} | null = null;
let _mapPopulationContext: {
  eventDetails: EventDetailsMap;
  eventTeamsTableData: EventTeamsTableDataMap;
} | null = null;
let _lastMapPopulationFingerprint: string | null = null;

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
  {
    marker: L.Marker;
    readiness: ProspectLaunchReadiness;
    borderColor: string;
    eventAmbassador?: string;
    regionalAmbassador?: string;
  }
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
  if (
    !_map ||
    !_liveMarkersLayer ||
    !_prospectMarkersLayer ||
    !_polygonsLayer
  ) {
    return;
  }

  const filter = getAmbassadorNameFilter();
  _mapTerritoryFilterContext = { eventTeamsTableData, filter };

  _markerMap.forEach((marker, eventName) => {
    const state = _eventMarkerFilterState.get(eventName);
    if (!state) {
      return;
    }

    if (state.kind === "unallocated") {
      return;
    }

    setMarkerLayerVisibility(
      _liveMarkersLayer,
      marker,
      eventMarkerMatchesFilter(state, filter),
    );
  });

  _prospectMarkers.forEach(
    ({ marker, eventAmbassador, regionalAmbassador }) => {
      setMarkerLayerVisibility(
        _prospectMarkersLayer,
        marker,
        prospectRowMatchesAmbassadorNameFilter(
          eventAmbassador,
          regionalAmbassador,
          filter,
        ),
      );
    },
  );

  if (_currentVoronoiSites.length > 0) {
    drawClippedTerritoryPolygons(_map, _polygonsLayer, _currentVoronoiSites);
  }

  refreshViewportUnallocatedMarkers();
  syncProspectMapLegendVisibility();
}

export function isEventMarkerVisibleOnMap(eventName: string): boolean {
  const marker = _markerMap.get(eventName);
  if (!marker) {
    return false;
  }

  if (_unallocatedMarkerMap.has(eventName)) {
    return _unallocatedMarkersLayer.hasLayer(marker);
  }

  return _liveMarkersLayer.hasLayer(marker);
}

export function resetVoronoiTerritoryCacheForTests(): void {
  _voronoiTerritoryCache.clear();
  _currentVoronoiSites = [];
  _viewportClipListenerAttached = false;
  _overlayListenerAttached = false;
  _suppressOverlayPersistence = false;
  _eventMarkerFilterState.clear();
  _prospectMarkers.clear();
  _unallocatedMarkerMap.clear();
  _mapPopulationContext = null;
  _lastMapPopulationFingerprint = null;
  _selectionHighlightRefreshHandler = null;
  _markerMap.clear();
  if (_layersControl) {
    _layersControl.remove();
    _layersControl = null;
  }
  if (_map) {
    try {
      _map.remove();
    } catch {
      // jsdom tests may destroy the container before teardown runs
    }
    _map = null;
  }

  document
    .getElementById("mapContainer")
    ?.querySelector(".prospect-map-legend-host")
    ?.remove();
}

export function getUnallocatedMarkerMap(): Map<string, L.CircleMarker> {
  return _unallocatedMarkerMap;
}

export function refreshViewportUnallocatedMarkersForTests(
  viewport: ViewportBounds,
): void {
  refreshViewportUnallocatedMarkers(viewport);
}

export function getLiveMarkersLayer(): L.LayerGroup {
  return _liveMarkersLayer;
}

export function getProspectMarkersLayer(): L.LayerGroup {
  return _prospectMarkersLayer;
}

export function getUnallocatedMarkersLayer(): L.LayerGroup {
  return _unallocatedMarkersLayer;
}

export function getPolygonsLayer(): L.LayerGroup {
  return _polygonsLayer;
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

export function setSelectionHighlightRefreshHandler(handler: () => void): void {
  _selectionHighlightRefreshHandler = handler;
}

export function syncMapMarkerSizesForTests(map: L.Map): void {
  syncMapMarkerSizes(map);
}
