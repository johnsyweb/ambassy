import L from "leaflet";

export type TemporaryPlacePinOptions = {
  label?: string;
  onAddProspect?: () => void;
};

export type TemporaryPlacePinState = {
  label: string;
  latitude: number;
  longitude: number;
  coordinatesWereDragged: boolean;
};

export const TEMPORARY_PLACE_PIN_ICON_SIZE = 24;
export const TEMPORARY_PLACE_PIN_ICON_ANCHOR =
  TEMPORARY_PLACE_PIN_ICON_SIZE / 2;
export const TEMPORARY_PLACE_PIN_POPUP_CLASS = "temporary-place-pin-leaflet-popup";

let temporaryPlacePinLayer: L.LayerGroup | null = null;
let temporaryPlacePinMarker: L.Layer | null = null;
let temporaryPlacePinState: TemporaryPlacePinState | null = null;
let temporaryPlacePinOnAddProspect: (() => void) | null = null;
let mapClickListenerMap: L.Map | null = null;

export function shouldClearPlacePinOnMapClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return true;
  }

  return (
    target.closest(
      ".territory-map-search-host, .territory-map-search-restore-host, .prospect-map-legend-host, .prospect-map-legend-restore-host, .temporary-place-pin-marker, .temporary-place-pin-leaflet-popup, .leaflet-popup",
    ) === null
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildTemporaryPlacePinIconHtml(label: string): string {
  return `<button type="button" class="temporary-place-pin-marker-dot" tabindex="0" aria-label="Place pin for ${escapeHtml(label)}">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <circle cx="12" cy="12" r="8" fill="#e85d04" fill-opacity="0.92" stroke="#1a1a1a" stroke-width="2.5"/>
  </svg>
</button>`;
}

export function buildTemporaryPlacePinPopupHtml(label: string): string {
  return `
    <div class="temporary-place-pin-popup">
      <p class="temporary-place-pin-popup-label">${escapeHtml(label)}</p>
      <button type="button" class="temporary-place-pin-add-prospect">Add prospective event here</button>
    </div>
  `.trim();
}

function wirePopupAddProspectButton(marker: L.Marker): void {
  const button = (
    marker.getPopup()?.getElement() ?? document
  ).querySelector(".temporary-place-pin-add-prospect") as HTMLButtonElement | null;
  button?.addEventListener(
    "click",
    (clickEvent) => {
      L.DomEvent.stopPropagation(clickEvent);
      temporaryPlacePinOnAddProspect?.();
    },
    { once: true },
  );
}

function openPlacePinPopup(marker: L.Marker): void {
  marker.openPopup();
  wirePopupAddProspectButton(marker);
}

function attachAddProspectPopupHandler(marker: L.Marker): void {
  marker.on("click", (event) => {
    L.DomEvent.stopPropagation(event);
    openPlacePinPopup(marker);
  });
}

function createInteractivePlacePinMarker(
  latitude: number,
  longitude: number,
  label: string,
): L.Marker {
  const marker = L.marker([latitude, longitude], {
    draggable: true,
    zIndexOffset: 1000,
    icon: L.divIcon({
      className: "temporary-place-pin-marker",
      html: buildTemporaryPlacePinIconHtml(label),
      iconSize: [
        TEMPORARY_PLACE_PIN_ICON_SIZE,
        TEMPORARY_PLACE_PIN_ICON_SIZE,
      ],
      iconAnchor: [
        TEMPORARY_PLACE_PIN_ICON_ANCHOR,
        TEMPORARY_PLACE_PIN_ICON_ANCHOR,
      ],
    }),
  });

  marker.bindPopup(buildTemporaryPlacePinPopupHtml(label), {
    autoPan: true,
    autoPanPadding: [80, 80],
    className: TEMPORARY_PLACE_PIN_POPUP_CLASS,
  });
  attachAddProspectPopupHandler(marker);

  marker.on("dragend", () => {
    const latLng = marker.getLatLng();
    if (temporaryPlacePinState) {
      temporaryPlacePinState.latitude = latLng.lat;
      temporaryPlacePinState.longitude = latLng.lng;
      temporaryPlacePinState.coordinatesWereDragged = true;
    }
  });

  marker.on("add", () => {
    const dot = marker
      .getElement()
      ?.querySelector(".temporary-place-pin-marker-dot") as
      | HTMLButtonElement
      | null;
    dot?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPlacePinPopup(marker);
      }
    });
  });

  return marker;
}

export function setTemporaryPlacePin(
  map: L.Map,
  latitude: number,
  longitude: number,
  options: TemporaryPlacePinOptions = {},
): void {
  clearTemporaryPlacePin(map);
  temporaryPlacePinState = {
    label: options.label ?? "",
    latitude,
    longitude,
    coordinatesWereDragged: false,
  };
  temporaryPlacePinOnAddProspect = options.onAddProspect ?? null;

  if (options.label) {
    temporaryPlacePinMarker = createInteractivePlacePinMarker(
      latitude,
      longitude,
      options.label,
    );
  } else {
    temporaryPlacePinMarker = L.circleMarker([latitude, longitude], {
      radius: 8,
      color: "#333333",
      fillColor: "#666666",
      fillOpacity: 0.85,
      weight: 2,
    });
  }

  temporaryPlacePinLayer = L.layerGroup();
  temporaryPlacePinLayer.addLayer(temporaryPlacePinMarker);
  temporaryPlacePinLayer.addTo(map);
  ensureTemporaryPlacePinClearOnMapClick(map);
}

export function openTemporaryPlacePinActions(): void {
  if (!temporaryPlacePinMarker || !("openPopup" in temporaryPlacePinMarker)) {
    return;
  }

  openPlacePinPopup(temporaryPlacePinMarker as L.Marker);
}

export function getTemporaryPlacePin(): TemporaryPlacePinState | null {
  return temporaryPlacePinState ? { ...temporaryPlacePinState } : null;
}

export function clearTemporaryPlacePin(map?: L.Map | null): void {
  if (temporaryPlacePinLayer && map?.hasLayer(temporaryPlacePinLayer)) {
    temporaryPlacePinLayer.remove();
  }

  temporaryPlacePinLayer = null;
  temporaryPlacePinMarker = null;
  temporaryPlacePinState = null;
  temporaryPlacePinOnAddProspect = null;
}

export function getTemporaryPlacePinLayer(): L.LayerGroup | null {
  return temporaryPlacePinLayer;
}

function ensureTemporaryPlacePinClearOnMapClick(map: L.Map): void {
  if (mapClickListenerMap === map) {
    return;
  }

  mapClickListenerMap = map;
  map.on("click", (event) => {
    if (!shouldClearPlacePinOnMapClick(event.originalEvent?.target ?? null)) {
      return;
    }

    clearTemporaryPlacePin(map);
  });
}

export function resetTemporaryPlacePinForTests(): void {
  temporaryPlacePinLayer = null;
  temporaryPlacePinMarker = null;
  temporaryPlacePinState = null;
  temporaryPlacePinOnAddProspect = null;
  mapClickListenerMap = null;
}
