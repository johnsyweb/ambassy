import { countries } from "@models/country";
import { EventDetailsMap } from "@models/EventDetailsMap";
import {
  ambassadorNamesFrom,
  EventTeamsTableDataMap,
} from "@models/EventTeamsTableData";

import * as d3GeoVoronoi from "d3-geo-voronoi";
import L from "leaflet";

let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;

export function populateMap(
  eventTeamsTableData: EventTeamsTableDataMap,
  eventDetails: EventDetailsMap
) {
  const names = ambassadorNamesFrom(eventTeamsTableData);

  const colorMap = assignColorsToNames(names);
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

  if (markersLayer) {
    map.removeLayer(markersLayer);
  }
  markersLayer = L.layerGroup().addTo(map);

  // Collect points for Voronoi diagram
  const points: [number, number, string][] = [];

  // Add dots for each parkrun event
  eventDetails.forEach((event, eventName) => {
    const latitiude = event.geometry.coordinates[1];
    const longitude = event.geometry.coordinates[0];
    const data = eventTeamsTableData.get(eventName);
    if (data) {
      const raColor = colorMap.get(data.regionalAmbassador) ?? "white";
      const eaColor = colorMap.get(data.eventAmbassador) ?? "purple";
      const tooltip = `
        <strong>Event:</strong> ${eventName}<br>
        <strong>Event Director(s):</strong> ${data.eventDirectors}<br>
        <strong>Event Ambassador(s):</strong> ${data.eventAmbassador}<br>
        <strong>Regional Ambassador(s):</strong> ${data.regionalAmbassador}<br>
      `;

      const marker = L.circleMarker([latitiude, longitude], {
        radius: 5,
        color: eaColor,
      }).addTo(map!);
      marker.bindTooltip(tooltip);

      points.push([longitude, latitiude, JSON.stringify({ raColor, tooltip })]);
    } else {
      const marker = L.circleMarker([latitiude, longitude], {
        radius: 2,
        color: "goldenrod",
      }).addTo(map!);
      marker.bindTooltip(eventName);
      if (event.properties.countrycode === 3) {
        points.push([
          event.geometry.coordinates[0],
          event.geometry.coordinates[1],
          JSON.stringify({ raColor: "lightgrey", tooltip: eventName }),
        ]);
      }
    }
  });

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
    }).addTo(map!);
    poly.bindTooltip(tooltip);
  });
}

const colorPalette = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A1",
  "#A133FF",
  "#33FFF5",
  "#FF8C33",
  "#33FF8C",
  "#8C33FF",
  "#FF338C",
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A1",
  "#A133FF",
  "#33FFF5",
  "#FF8C33",
  "#33FF8C",
  "#8C33FF",
  "#FF338C",
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A1",
  "#A133FF",
  "#33FFF5",
  "#FF8C33",
  "#33FF8C",
  "#8C33FF",
  "#FF338C",
];

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
