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

let map: L.Map | null = null;
let markersLayer: L.LayerGroup;
let polygonsLayer: L.LayerGroup;

export function populateMap(
  eventTeamsTableData: EventTeamsTableDataMap,
  eventDetails: EventDetailsMap
) {
  const raNames = regionalAmbassadorsFrom(eventTeamsTableData);
  const eaNames = eventAmbassadorsFrom(eventTeamsTableData);

  const raColorMap = assignColorsToNames(raNames);
  const eaColorMap = assignColorsToNames(eaNames);

  if (!map) {
    map = L.map("mapContainer").setView([0, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  }

  if (!map) {
    return;
  }
  setMapCenterToCountry(eventTeamsTableData);

  // Clear existing layers
  if (markersLayer) {
    markersLayer.clearLayers();
  } else {
    markersLayer = L.layerGroup();
  }

  if (polygonsLayer) {
    polygonsLayer.clearLayers();
  } else {
    polygonsLayer = L.layerGroup();
  }

  // Collect points for Voronoi diagram
  const points: [number, number, string][] = [];

  // Add dots for each parkrun event
  eventDetails.forEach((event, eventName) => {
    const latitiude = event.geometry.coordinates[1];
    const longitude = event.geometry.coordinates[0];
    const data = eventTeamsTableData.get(eventName);
    if (data) {
      const raColor = raColorMap.get(data.regionalAmbassador) ?? "white";
      const eaColor = eaColorMap.get(data.eventAmbassador) ?? "purple";
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

      points.push([longitude, latitiude, JSON.stringify({ raColor, tooltip })]);
    } else {
      const marker = L.circleMarker([latitiude, longitude], {
        radius: 2,
        color: "goldenrod",
      });
      marker.bindTooltip(eventName);
      markersLayer.addLayer(marker);
      const countries = new Set(Array.from(eventTeamsTableData.values()).map((data) => data.eventCountryCode ));
      if (countries.has(event.properties.countrycode)) {
        points.push([
          event.geometry.coordinates[0],
          event.geometry.coordinates[1],
          JSON.stringify({ raColor: "lightgrey", tooltip: eventName }),
        ]);
      }
    }
  });

  // Add markersLayer to map
  markersLayer.addTo(map!);

  const voronoi = d3GeoVoronoi.geoVoronoi(points.map((p) => [p[0], p[1]]));
  const polygons = voronoi.polygons();

  polygons.features.forEach((feature, index) => {
    const { raColor, tooltip } = JSON.parse(points[index][2]);
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

  // Add layer control
  const overlayMaps = {
    "Event Markers": markersLayer,
    "Ambassador Polygons": polygonsLayer,
  };
  L.control.layers(undefined, overlayMaps).addTo(map!);
}

function setMapCenterToCountry(eventTeamsTableData: EventTeamsTableDataMap) {
  const Country = [...eventTeamsTableData.values()]
    .map((data) => data.eventCountryCode)
    .filter(Boolean)[0];
  const bounds = countries[Country].bounds;
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
