export const TERRITORY_MAP_OVERLAY_VISIBILITY_SESSION_KEY =
  "ambassy:territoryMapOverlayVisibility";

export interface TerritoryMapOverlayVisibility {
  liveEvents: boolean;
  prospectiveEvents: boolean;
  unallocatedParkruns: boolean;
  regionalEventAmbassador: boolean;
}

export const DEFAULT_TERRITORY_MAP_OVERLAY_VISIBILITY: TerritoryMapOverlayVisibility =
  {
    liveEvents: true,
    prospectiveEvents: true,
    unallocatedParkruns: true,
    regionalEventAmbassador: true,
  };

function readBooleanField(
  record: Record<string, unknown>,
  key: keyof TerritoryMapOverlayVisibility,
  fallback: boolean,
): boolean {
  const value = record[key];
  return typeof value === "boolean" ? value : fallback;
}

function parseStoredVisibility(
  raw: string | null,
): TerritoryMapOverlayVisibility {
  if (!raw) {
    return { ...DEFAULT_TERRITORY_MAP_OVERLAY_VISIBILITY };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return { ...DEFAULT_TERRITORY_MAP_OVERLAY_VISIBILITY };
    }

    const record = parsed as Record<string, unknown>;
    return {
      liveEvents: readBooleanField(
        record,
        "liveEvents",
        DEFAULT_TERRITORY_MAP_OVERLAY_VISIBILITY.liveEvents,
      ),
      prospectiveEvents: readBooleanField(
        record,
        "prospectiveEvents",
        DEFAULT_TERRITORY_MAP_OVERLAY_VISIBILITY.prospectiveEvents,
      ),
      unallocatedParkruns: readBooleanField(
        record,
        "unallocatedParkruns",
        DEFAULT_TERRITORY_MAP_OVERLAY_VISIBILITY.unallocatedParkruns,
      ),
      regionalEventAmbassador: readBooleanField(
        record,
        "regionalEventAmbassador",
        DEFAULT_TERRITORY_MAP_OVERLAY_VISIBILITY.regionalEventAmbassador,
      ),
    };
  } catch {
    return { ...DEFAULT_TERRITORY_MAP_OVERLAY_VISIBILITY };
  }
}

export function getTerritoryMapOverlayVisibility(): TerritoryMapOverlayVisibility {
  return parseStoredVisibility(
    sessionStorage.getItem(TERRITORY_MAP_OVERLAY_VISIBILITY_SESSION_KEY),
  );
}

export function setTerritoryMapOverlayVisibility(
  visibility: TerritoryMapOverlayVisibility,
): void {
  sessionStorage.setItem(
    TERRITORY_MAP_OVERLAY_VISIBILITY_SESSION_KEY,
    JSON.stringify(visibility),
  );
}

export function clearTerritoryMapOverlayVisibility(): void {
  sessionStorage.removeItem(TERRITORY_MAP_OVERLAY_VISIBILITY_SESSION_KEY);
}
