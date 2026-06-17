import {
  applyUnallocatedParkrunsOverlayTitle,
  LIVE_EVENTS_OVERLAY_LABEL,
  PROSPECTIVE_EVENTS_OVERLAY_LABEL,
  UNALLOCATED_PARKRUNS_OVERLAY_LABEL,
  UNALLOCATED_PARKRUNS_OVERLAY_TITLE,
} from "./territoryMapOverlays";

describe("territoryMapOverlays", () => {
  it("sets title on the unallocated parkruns layer control label", () => {
    document.body.innerHTML = `
      <div id="mapContainer">
        <div class="leaflet-control-layers-overlays">
          <label><span>${LIVE_EVENTS_OVERLAY_LABEL}</span></label>
          <label><span>${UNALLOCATED_PARKRUNS_OVERLAY_LABEL}</span></label>
          <label><span>${PROSPECTIVE_EVENTS_OVERLAY_LABEL}</span></label>
        </div>
      </div>
    `;

    applyUnallocatedParkrunsOverlayTitle(
      document.getElementById("mapContainer")!,
    );

    const labels = document.querySelectorAll(
      ".leaflet-control-layers-overlays label",
    );
    expect(labels[0].getAttribute("title")).toBeNull();
    expect(labels[1].getAttribute("title")).toBe(
      UNALLOCATED_PARKRUNS_OVERLAY_TITLE,
    );
    expect(labels[2].getAttribute("title")).toBeNull();
  });
});
