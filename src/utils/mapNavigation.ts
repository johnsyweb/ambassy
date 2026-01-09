import L from "leaflet";
import { EventDetailsMap } from "@models/EventDetailsMap";

export function centerMapOnEvents(
  eventShortNames: string[],
  eventDetails: EventDetailsMap,
  map: L.Map
): void {
  if (eventShortNames.length === 0) {
    return;
  }

  const validEvents = eventShortNames.filter((name) =>
    eventDetails.has(name)
  );

  if (validEvents.length === 0) {
    return;
  }

  if (validEvents.length === 1) {
    const event = eventDetails.get(validEvents[0]);
    if (event) {
      const [longitude, latitude] = event.geometry.coordinates;
      map.setView([latitude, longitude], 10, { animate: true });
    }
  } else {
    const bounds = validEvents
      .map((name) => {
        const event = eventDetails.get(name);
        if (!event) return null;
        const [longitude, latitude] = event.geometry.coordinates;
        return [latitude, longitude] as L.LatLngTuple;
      })
      .filter((coord): coord is L.LatLngTuple => coord !== null);

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }
}

export function highlightEventsOnMap(
  eventShortNames: string[],
  markerMap: Map<string, L.CircleMarker>,
  highlightLayer: L.LayerGroup
): void {
  highlightLayer.clearLayers();

  eventShortNames.forEach((eventShortName) => {
    const marker = markerMap.get(eventShortName);
    if (marker) {
      const highlightMarker = L.circleMarker(marker.getLatLng(), {
        radius: marker.options.radius ? marker.options.radius * 1.5 : 7.5,
        color: "#ff0000",
        fillColor: "#ff0000",
        fillOpacity: 0.7,
        weight: 3,
      });
      highlightLayer.addLayer(highlightMarker);
    }
  });
}

export function clearMapHighlights(highlightLayer: L.LayerGroup): void {
  highlightLayer.clearLayers();
}

