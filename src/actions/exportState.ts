import {
  ApplicationState,
  CURRENT_APPLICATION_STATE_VERSION,
} from "@models/ApplicationState";
import { EventDetails } from "@models/EventDetails";
import { loadFromStorage } from "@utils/storage";
import { loadCapacityLimits } from "./checkCapacity";
import { loadProspectiveEvents } from "./persistProspectiveEvents";
import { loadAmbassadorFinishHistories } from "./persistAmbassadorFinishHistory";

const CACHE_KEY = "parkrun events";

function isManuallyResolvedEventDetails(
  eventDetails: EventDetails & {
    manualCoordinates?: boolean;
    geocodedAddress?: boolean;
  },
): boolean {
  return (
    eventDetails.manualCoordinates === true ||
    eventDetails.geocodedAddress === true ||
    eventDetails.id.startsWith("manual-") ||
    eventDetails.id.startsWith("geocoded-")
  );
}

export function buildStateExportFilename(date = new Date()): string {
  return `ambassy-state-${date.toISOString().slice(0, 10)}.json`;
}

export function exportApplicationState(): Blob {
  const eventAmbassadors =
    loadFromStorage<
      Array<[string, import("@models/EventAmbassador").EventAmbassador]>
    >("eventAmbassadors");
  const eventTeams =
    loadFromStorage<Array<[string, import("@models/EventTeam").EventTeam]>>(
      "eventTeams",
    );
  const regionalAmbassadors = loadFromStorage<
    Array<[string, import("@models/RegionalAmbassador").RegionalAmbassador]>
  >("regionalAmbassadors");
  const changesLog =
    loadFromStorage<import("@models/LogEntry").LogEntry[]>("changesLog") ?? [];

  if (
    eventAmbassadors === null ||
    eventTeams === null ||
    regionalAmbassadors === null
  ) {
    throw new Error("Cannot export: incomplete application state");
  }

  const capacityLimits = loadCapacityLimits();
  const prospectiveEvents = loadProspectiveEvents();
  const ambassadorFinishHistories = loadAmbassadorFinishHistories();

  const resolvedEventDetails: Array<[string, EventDetails]> = [];
  const cacheData = localStorage.getItem(CACHE_KEY);
  if (cacheData) {
    try {
      const parsed = JSON.parse(cacheData);
      if (parsed.eventDetailsMap && Array.isArray(parsed.eventDetailsMap)) {
        const eventDetailsMap = new Map<string, EventDetails>(
          parsed.eventDetailsMap,
        );
        eventDetailsMap.forEach((eventDetails, key) => {
          if (isManuallyResolvedEventDetails(eventDetails)) {
            resolvedEventDetails.push([key, eventDetails]);
          }
        });
      }
    } catch {
      // Ignore parse errors, proceed without resolved eventDetails
    }
  }

  const state: ApplicationState = {
    version: CURRENT_APPLICATION_STATE_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      eventAmbassadors,
      eventTeams,
      regionalAmbassadors,
      changesLog,
      capacityLimits,
      resolvedEventDetails:
        resolvedEventDetails.length > 0 ? resolvedEventDetails : undefined,
      prospectiveEvents:
        prospectiveEvents.length > 0 ? prospectiveEvents : undefined,
      ambassadorFinishHistories:
        Object.keys(ambassadorFinishHistories).length > 0
          ? ambassadorFinishHistories
          : undefined,
    },
  };

  const json = JSON.stringify(state, null, 2);
  return new Blob([json], { type: "application/json" });
}

export function downloadStateFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
