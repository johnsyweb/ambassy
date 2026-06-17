export const TERRITORY_MAP_SEARCH_MINIMISED_SESSION_KEY =
  "ambassy:territoryMapSearchMinimised";

export function isTerritoryMapSearchMinimised(): boolean {
  return (
    sessionStorage.getItem(TERRITORY_MAP_SEARCH_MINIMISED_SESSION_KEY) ===
    "true"
  );
}

export function setTerritoryMapSearchMinimised(minimised: boolean): void {
  if (minimised) {
    sessionStorage.setItem(TERRITORY_MAP_SEARCH_MINIMISED_SESSION_KEY, "true");
    return;
  }

  sessionStorage.removeItem(TERRITORY_MAP_SEARCH_MINIMISED_SESSION_KEY);
}

export function clearTerritoryMapSearchMinimised(): void {
  sessionStorage.removeItem(TERRITORY_MAP_SEARCH_MINIMISED_SESSION_KEY);
}
