import { PROSPECT_MAP_MARKER_SIZE } from "./prospectMapMarker";

export const MAP_MARKER_ZOOM_SCALE_FLOOR = 11;
export const MAP_MARKER_ZOOM_SCALE_CAP = 18;
export const MAP_MARKER_ZOOM_MAX_SCALE = 2;

export const ALLOCATED_LIVE_MARKER_BASE_RADIUS = 5;
export const UNALLOCATED_MARKER_BASE_RADIUS = 4;
export const UNALLOCATED_MARKER_HOVER_RADIUS = 6;

export function mapMarkerZoomScale(zoom: number): number {
  if (zoom <= MAP_MARKER_ZOOM_SCALE_FLOOR) {
    return 1;
  }

  if (zoom >= MAP_MARKER_ZOOM_SCALE_CAP) {
    return MAP_MARKER_ZOOM_MAX_SCALE;
  }

  const progress =
    (zoom - MAP_MARKER_ZOOM_SCALE_FLOOR) /
    (MAP_MARKER_ZOOM_SCALE_CAP - MAP_MARKER_ZOOM_SCALE_FLOOR);

  return 1 + progress * (MAP_MARKER_ZOOM_MAX_SCALE - 1);
}

export function allocatedLiveMarkerRadius(zoom: number): number {
  return ALLOCATED_LIVE_MARKER_BASE_RADIUS * mapMarkerZoomScale(zoom);
}

export function unallocatedMarkerRadii(zoom: number): {
  base: number;
  hover: number;
} {
  const scale = mapMarkerZoomScale(zoom);
  return {
    base: UNALLOCATED_MARKER_BASE_RADIUS * scale,
    hover: UNALLOCATED_MARKER_HOVER_RADIUS * scale,
  };
}

export function prospectMapMarkerPixelSize(zoom: number): number {
  return PROSPECT_MAP_MARKER_SIZE * mapMarkerZoomScale(zoom);
}
