import L from "leaflet";

export interface ProspectLaunchReadiness {
  courseFound: boolean;
  landownerPermission: boolean;
  fundingConfirmed: boolean;
}

export const PROSPECT_SEGMENT_NOT_CONFIRMED_FILL = "#d0d0d0";

export function buildProspectMapMarkerHtml(
  readiness: ProspectLaunchReadiness,
  borderColor: string,
): string {
  const segmentFill = (confirmed: boolean): string =>
    confirmed ? borderColor : PROSPECT_SEGMENT_NOT_CONFIRMED_FILL;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" role="img" aria-label="Prospective event map marker">
  <polygon points="8,0 16,8 8,16 0,8" fill="none" stroke="${borderColor}" stroke-width="1.5" data-marker-part="border"/>
  <polygon points="8,0 16,8 8,8" fill="${segmentFill(readiness.courseFound)}" data-readiness="course-found"/>
  <polygon points="0,8 8,16 8,8" fill="${segmentFill(readiness.landownerPermission)}" data-readiness="landowner-permission"/>
  <polygon points="16,8 8,16 8,8" fill="${segmentFill(readiness.fundingConfirmed)}" data-readiness="funding-confirmed"/>
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
  return `
    <div class="prospect-map-legend" role="note" aria-label="Map marker legend">
      <p><strong>Live event</strong> — circle marker</p>
      <p><strong>Prospective event</strong> — diamond marker</p>
      <p><strong>Course found</strong> — top segment</p>
      <p><strong>Landowner permission</strong> — bottom-left segment</p>
      <p><strong>Funding confirmed</strong> — bottom-right segment</p>
      <p>Filled segment — confirmed; grey segment — not confirmed</p>
    </div>
  `.trim();
}

export function syncProspectMapLegend(
  mapContainer: HTMLElement,
  showLegend: boolean,
): void {
  const existingLegend = mapContainer.querySelector(".prospect-map-legend");

  if (!showLegend) {
    existingLegend?.remove();
    return;
  }

  if (existingLegend) {
    return;
  }

  const legendHost = document.createElement("div");
  legendHost.className = "prospect-map-legend-host";
  legendHost.innerHTML = buildProspectMapLegendHtml();
  mapContainer.appendChild(legendHost);
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
