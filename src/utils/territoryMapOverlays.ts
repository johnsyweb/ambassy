export const LIVE_EVENTS_OVERLAY_LABEL = "Live events";
export const PROSPECTIVE_EVENTS_OVERLAY_LABEL = "Prospective events";
export const UNALLOCATED_PARKRUNS_OVERLAY_LABEL = "Unallocated parkruns";
export const UNALLOCATED_PARKRUNS_OVERLAY_TITLE =
  "parkruns with no Event Ambassador allocation, including outside your usual patch";
export const REGIONAL_EVENT_AMBASSADOR_OVERLAY_LABEL =
  "Regional Event Ambassador";

export function applyUnallocatedParkrunsOverlayTitle(
  mapContainer: HTMLElement,
): void {
  const labels = mapContainer.querySelectorAll(
    ".leaflet-control-layers-overlays label",
  );

  for (const label of labels) {
    if (label.textContent?.trim() === UNALLOCATED_PARKRUNS_OVERLAY_LABEL) {
      label.setAttribute("title", UNALLOCATED_PARKRUNS_OVERLAY_TITLE);
      return;
    }
  }
}
