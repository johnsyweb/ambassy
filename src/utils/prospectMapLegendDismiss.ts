export const PROSPECT_MAP_LEGEND_DISMISSED_SESSION_KEY =
  "ambassy:prospectMapLegendDismissed";

export function isProspectMapLegendDismissed(): boolean {
  return (
    sessionStorage.getItem(PROSPECT_MAP_LEGEND_DISMISSED_SESSION_KEY) === "true"
  );
}

export function setProspectMapLegendDismissed(dismissed: boolean): void {
  if (dismissed) {
    sessionStorage.setItem(PROSPECT_MAP_LEGEND_DISMISSED_SESSION_KEY, "true");
    return;
  }

  sessionStorage.removeItem(PROSPECT_MAP_LEGEND_DISMISSED_SESSION_KEY);
}

export function clearProspectMapLegendDismissed(): void {
  sessionStorage.removeItem(PROSPECT_MAP_LEGEND_DISMISSED_SESSION_KEY);
}
