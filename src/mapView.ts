
import L from "leaflet";
import * as d3GeoVoronoi from "d3-geo-voronoi";
import { EventDetails } from "./models/EventDetails";
import { RegionalAmbassadorMap } from "./models/RegionalAmbassadorMap";

export function initializeMap(
  eaIsSupportedBy: RegionalAmbassadorMap,
  eventDetails: EventDetails[],
  names: string[]) {
  const colorMap = assignColorsToNames(names);
  const map = L.map("mapContainer").setView([0, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Collect points for Voronoi diagram
  const points: [number, number, string][] = [];

  // Add dots for each parkrun event
  eventDetails
    .filter(
      (event) =>
        event.properties.countrycode === 3 && event.properties.seriesid === 1
    ) // Australian, open, 5km events only
    .forEach((event) => {
      const associatedTeam = event.associatedTeam;
      const ea = associatedTeam?.associatedEA;
      const ra = ea ? eaIsSupportedBy.get(ea.name) : ''
      const [lng, lat] = event.geometry.coordinates;
      const raColor = ra ? colorMap.get(ra.name) : "white";
      const eaColor = ea ? colorMap.get(ea.name) : "purple";
      const tooltip = `
        <strong>Event:</strong> ${event.properties.EventShortName}<br>
        <strong>Event Director(s):</strong> ${associatedTeam?.eventDirectors?.join(
          ", "
        )}<br>
        <strong>Event Ambassador(s):</strong> ${ea?.name}<br>
        <strong>Regional Ambassador(s):</strong> ${ra}<br>
      `;
      points.push([lng, lat, JSON.stringify({ raColor, tooltip })]);
      const marker = L.circleMarker([lat, lng], {
        radius: 5,
        color: eaColor,
      }).addTo(map);
      marker.bindTooltip(tooltip);
    });

  // Generate Voronoi diagram
  const voronoi = d3GeoVoronoi.geoVoronoi(points.map((p) => [p[0], p[1]]));
  const polygons = voronoi.polygons();

  // Add Voronoi cells to the map
  polygons.features.forEach((feature, index) => {
    const { raColor, tooltip } = JSON.parse(points[index][2]);
    const coordinates = (
      feature.geometry.coordinates[0] as [number, number][]
    ).map((coord) => [coord[1], coord[0]] as L.LatLngTuple);
    const poly = L.polygon(coordinates, {
      color: raColor,
      fillOpacity: 0.2,
    }).addTo(map);
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
];

   
function assignColorsToNames(names: string[]): Map<string, string> {
  const nameColorMap = new Map<string, string>();
  names.forEach((name, index) => {
    nameColorMap.set(name, colorPalette[index % colorPalette.length]);
  });
  return nameColorMap;
}