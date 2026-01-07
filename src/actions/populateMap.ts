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
  const raNames = regionalAmbassadorsFrom(eventTeamsTableData);
  const eaNames = eventAmbassadorsFrom(eventTeamsTableData);
  const raColorMap = assignColorsToNames(raNames);
  const eaColorMap = assignColorsToNames(eaNames);
  const countryCode = country(eventTeamsTableData);

  const {map, markersLayer, polygonsLayer} = setupMapView(countryCode);

  markersLayer.clearLayers();
  polygonsLayer.clearLayers();
  
  const voronoiPoints: [number, number, string][] = [];

  eventDetails.forEach((event, eventName) => {
    const latitiude = event.geometry.coordinates[1];
    const longitude = event.geometry.coordinates[0];
    const data = eventTeamsTableData.get(eventName);
    if (data) {
      const raColor = raColorMap.get(data.regionalAmbassador) ?? DEFAULT_POLYGON_COLOUR;
      const eaColor = eaColorMap.get(data.eventAmbassador) ?? DEFAULT_EVENT_COLOUR;
      const tooltip = `
        <strong>Event:</strong> ${eventName}<br>
        <strong>Event Director(s):</strong> ${data.eventDirectors}<br>
        <strong>Event Ambassador(s):</strong> ${data.eventAmbassador}<br>
        <strong>Regional Ambassador(s):</strong> ${data.regionalAmbassador}<br>
      `;

      const marker = L.circleMarker([latitiude, longitude], {
        radius: 5,
        color: eaColor,
      });
      marker.bindTooltip(tooltip);
      markersLayer.addLayer(marker);

      voronoiPoints.push([longitude, latitiude, JSON.stringify({ raColor, tooltip })]);
    } else {
      const marker = L.circleMarker([latitiude, longitude], {
        radius: 1,
        color: DEFAULT_EVENT_COLOUR,
      });
      marker.bindTooltip(eventName);
      markersLayer.addLayer(marker);
      
      if (countryCode === event.properties.countrycode) {
        voronoiPoints.push([
          event.geometry.coordinates[0],
          event.geometry.coordinates[1],
          JSON.stringify({ raColor: DEFAULT_POLYGON_COLOUR, tooltip: eventName }),
        ]);
      }
    }
  });

  // Add markersLayer to map
  markersLayer.addTo(map!);

  const voronoi = d3GeoVoronoi.geoVoronoi(voronoiPoints.map((p) => [p[0], p[1]]));
  const polygons = voronoi.polygons();

  polygons.features.forEach((feature, index) => {
    const { raColor, tooltip } = JSON.parse(voronoiPoints[index][2]);
    const coordinates = (
      feature.geometry.coordinates[0] as [number, number][]
    ).map((coord) => [coord[1], coord[0]] as L.LatLngTuple);
    const poly = L.polygon(coordinates, {
      color: raColor,
      fillOpacity: 0.1,
    });
    poly.bindTooltip(tooltip);
    polygonsLayer.addLayer(poly);
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
    _markersLayer = L.layerGroup()
    _polygonsLayer = L.layerGroup()
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
