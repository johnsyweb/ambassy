import L from "leaflet";
import {
  isProspectMapLegendDismissed,
  setProspectMapLegendDismissed,
} from "./prospectMapLegendDismiss";

export interface ProspectLaunchReadiness {
  courseFound: boolean;
  landownerPermission: boolean;
  fundingConfirmed: boolean;
}

export const PROSPECT_SEGMENT_NOT_CONFIRMED_FILL = "#d0d0d0";
export const PROSPECT_MARKER_OUTLINE_STROKE = "#1a1a1a";
export const PROSPECT_MARKER_OUTLINE_STROKE_WIDTH = 2.25;
export const PROSPECT_SEGMENT_STROKE = "#4a4a4a";
export const PROSPECT_SEGMENT_STROKE_WIDTH = 0.5;
export const LEGEND_SAMPLE_BORDER_COLOR = "rebeccapurple";

export function buildLiveEventLegendSampleHtml(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="prospect-map-legend-live-sample" role="img" aria-hidden="true">
  <circle cx="8" cy="8" r="5" fill="none" stroke="${LEGEND_SAMPLE_BORDER_COLOR}" stroke-width="1.5"/>
</svg>`;
}

export function buildProspectMapMarkerHtml(
  readiness: ProspectLaunchReadiness,
  borderColor: string,
): string {
  const segmentFill = (confirmed: boolean): string =>
    confirmed ? borderColor : PROSPECT_SEGMENT_NOT_CONFIRMED_FILL;

  const segmentPolygon = (
    points: string,
    fill: string,
    readinessKey: string,
  ): string =>
    `<polygon points="${points}" fill="${fill}" stroke="${PROSPECT_SEGMENT_STROKE}" stroke-width="${PROSPECT_SEGMENT_STROKE_WIDTH}" data-readiness="${readinessKey}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" role="img" aria-label="Prospective event map marker">
  <polygon points="8,0 16,8 8,16 0,8" fill="none" stroke="${PROSPECT_MARKER_OUTLINE_STROKE}" stroke-width="${PROSPECT_MARKER_OUTLINE_STROKE_WIDTH}" data-marker-part="outline"/>
  <polygon points="8,0 16,8 8,16 0,8" fill="none" stroke="${borderColor}" stroke-width="1.5" data-marker-part="border"/>
  ${segmentPolygon("8,0 16,8 8,8", segmentFill(readiness.courseFound), "course-found")}
  ${segmentPolygon("0,8 8,16 8,8", segmentFill(readiness.landownerPermission), "landowner-permission")}
  ${segmentPolygon("16,8 8,16 8,8", segmentFill(readiness.fundingConfirmed), "funding-confirmed")}
</svg>`;
}

function formatReadinessFlag(confirmed: boolean): string {
  return confirmed ? "Yes" : "No";
}

export function formatProspectMapTooltip(prospect: {
  prospectEvent: string;
  country: string;
  state: string;
  eventAmbassador: string;
  courseFound: boolean;
  landownerPermission: boolean;
  fundingConfirmed: boolean;
}): string {
  return `
    <strong>Prospective Event:</strong> ${prospect.prospectEvent}<br>
    <strong>Country:</strong> ${prospect.country}<br>
    <strong>State:</strong> ${prospect.state}<br>
    <strong>Event Ambassador:</strong> ${prospect.eventAmbassador || "Unassigned"}<br>
    <strong>Course found:</strong> ${formatReadinessFlag(prospect.courseFound)}<br>
    <strong>Landowner permission:</strong> ${formatReadinessFlag(prospect.landownerPermission)}<br>
    <strong>Funding confirmed:</strong> ${formatReadinessFlag(prospect.fundingConfirmed)}
  `.trim();
}

export function buildProspectMapLegendHtml(): string {
  const readinessSample = buildProspectMapMarkerHtml(
    {
      courseFound: true,
      landownerPermission: false,
      fundingConfirmed: true,
    },
    LEGEND_SAMPLE_BORDER_COLOR,
  );

  return `
    <div class="prospect-map-legend" role="note" aria-label="Map marker legend">
      <div class="prospect-map-legend-header">
        <h3 class="prospect-map-legend-title">Marker legend</h3>
        <button type="button" class="prospect-map-legend-dismiss" aria-label="Dismiss marker legend">×</button>
      </div>
      <div class="prospect-map-legend-row">
        <span class="prospect-map-legend-icon">${buildLiveEventLegendSampleHtml()}</span>
        <span>Live event</span>
      </div>
      <div class="prospect-map-legend-row">
        <span class="prospect-map-legend-icon prospect-map-legend-prospect-sample">${buildProspectMapMarkerHtml(
          {
            courseFound: true,
            landownerPermission: true,
            fundingConfirmed: true,
          },
          LEGEND_SAMPLE_BORDER_COLOR,
        )}</span>
        <span>Prospective event</span>
      </div>
      <div class="prospect-map-legend-row">
        <span class="prospect-map-legend-icon prospect-map-legend-readiness-sample">${readinessSample}</span>
      </div>
      <p>Course found — top</p>
      <p>Landowner permission — bottom-left</p>
      <p>Funding confirmed — bottom-right</p>
      <p>Filled = confirmed; grey = not confirmed</p>
    </div>
  `.trim();
}

export function syncProspectMapLegend(
  mapContainer: HTMLElement,
  showLegend: boolean,
): void {
  removeProspectMapLegendUi(mapContainer);

  if (!showLegend) {
    return;
  }

  if (isProspectMapLegendDismissed()) {
    mountProspectMapLegendRestore(mapContainer);
    return;
  }

  mountProspectMapLegendPanel(mapContainer);
}

function removeProspectMapLegendUi(mapContainer: HTMLElement): void {
  mapContainer.querySelector(".prospect-map-legend-host")?.remove();
  mapContainer.querySelector(".prospect-map-legend-restore-host")?.remove();
}

function mountProspectMapLegendPanel(mapContainer: HTMLElement): void {
  const legendHost = document.createElement("div");
  legendHost.className = "prospect-map-legend-host";
  legendHost.innerHTML = buildProspectMapLegendHtml();

  const dismissButton = legendHost.querySelector(
    ".prospect-map-legend-dismiss",
  ) as HTMLButtonElement | null;
  dismissButton?.addEventListener("click", () => {
    setProspectMapLegendDismissed(true);
    syncProspectMapLegend(mapContainer, true);
  });

  mapContainer.appendChild(legendHost);
}

function mountProspectMapLegendRestore(mapContainer: HTMLElement): void {
  const restoreHost = document.createElement("div");
  restoreHost.className = "prospect-map-legend-restore-host";
  restoreHost.innerHTML = `<button type="button" class="prospect-map-legend-restore">Show marker legend</button>`;

  const restoreButton = restoreHost.querySelector(
    ".prospect-map-legend-restore",
  ) as HTMLButtonElement;
  restoreButton.addEventListener("click", () => {
    setProspectMapLegendDismissed(false);
    syncProspectMapLegend(mapContainer, true);
  });

  mapContainer.appendChild(restoreHost);
}

export const PROSPECT_MAP_MARKER_SIZE = 20;
export const PROSPECT_MAP_MARKER_ANCHOR = PROSPECT_MAP_MARKER_SIZE / 2;

export function createProspectMapDivIcon(
  readiness: ProspectLaunchReadiness,
  borderColor: string,
  pixelSize: number = PROSPECT_MAP_MARKER_SIZE,
): L.DivIcon {
  const anchor = pixelSize / 2;

  return L.divIcon({
    className: "prospective-event-marker",
    html: buildProspectMapMarkerHtml(readiness, borderColor),
    iconSize: [pixelSize, pixelSize],
    iconAnchor: [anchor, anchor],
  });
}
