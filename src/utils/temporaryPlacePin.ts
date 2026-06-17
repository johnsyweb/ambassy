import L from "leaflet";

let temporaryPlacePinLayer: L.LayerGroup | null = null;
let mapClickListenerAttached = false;

export function setTemporaryPlacePin(
  map: L.Map,
  latitude: number,
  longitude: number,
): void {
  clearTemporaryPlacePin(map);
  temporaryPlacePinLayer = L.layerGroup();
  temporaryPlacePinLayer.addLayer(
    L.circleMarker([latitude, longitude], {
      radius: 8,
      color: "#333333",
      fillColor: "#666666",
      fillOpacity: 0.85,
      weight: 2,
    }),
  );
  temporaryPlacePinLayer.addTo(map);
  ensureTemporaryPlacePinClearOnMapClick(map);
}

export function clearTemporaryPlacePin(map?: L.Map | null): void {
  if (temporaryPlacePinLayer && map?.hasLayer(temporaryPlacePinLayer)) {
    temporaryPlacePinLayer.remove();
  }

  temporaryPlacePinLayer = null;
}

export function getTemporaryPlacePinLayer(): L.LayerGroup | null {
  return temporaryPlacePinLayer;
}

function ensureTemporaryPlacePinClearOnMapClick(map: L.Map): void {
  if (mapClickListenerAttached) {
    return;
  }

  map.on("click", () => {
    clearTemporaryPlacePin(map);
  });
  mapClickListenerAttached = true;
}

export function resetTemporaryPlacePinForTests(): void {
  temporaryPlacePinLayer = null;
  mapClickListenerAttached = false;
}
