import L from 'leaflet';
import { EventTeam } from './models/EventTeam';

let map: L.Map;

export function renderMap(eventTeams: EventTeam[]): void {
  if (typeof document === 'undefined') {
    console.error('Document is not defined. This function should be run in a browser environment.');
    return;
  }

  if (!map) {
    map = L.map('map').setView([0, 0], 2); // Initialize the map with a default view

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }

  // Clear existing markers
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // Update map info
  updateMapInfo();
}

function updateMapInfo(): void {
  const mapExtentsDiv = document.getElementById('mapExtents');
  const zoomLevelDiv = document.getElementById('zoomLevel');
  const centerCoordinatesDiv = document.getElementById('centerCoordinates');

  const bounds = map.getBounds();
  const zoomLevel = map.getZoom();
  const center = map.getCenter();

  if (mapExtentsDiv) {
    mapExtentsDiv.innerHTML = `
      <strong>Map Extents:</strong><br>
      South-West: ${bounds.getSouthWest().lat.toFixed(2)}, ${bounds.getSouthWest().lng.toFixed(2)}<br>
      North-East: ${bounds.getNorthEast().lat.toFixed(2)}, ${bounds.getNorthEast().lng.toFixed(2)}
    `;
  }

  if (zoomLevelDiv) {
    zoomLevelDiv.innerHTML = `<strong>Zoom Level:</strong> ${zoomLevel}`;
  }

  if (centerCoordinatesDiv) {
    centerCoordinatesDiv.innerHTML = `<strong>Center Coordinates:</strong> ${center.lat.toFixed(2)}, ${center.lng.toFixed(2)}`;
  }
}