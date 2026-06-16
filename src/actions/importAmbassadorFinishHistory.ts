import { EventDetailsMap } from "@models/EventDetailsMap";
import { FinishImportPayload } from "@models/FinishImportPayload";
import {
  AmbassadorFinishHistory,
  AmbassadorFinishHistoryMap,
} from "@models/AmbassadorFinishHistory";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";
import { findEventShortNameBySlug } from "@utils/findEventShortNameBySlug";
import { keepLatestFinishPerEventSlug } from "@utils/keepLatestFinishPerEventSlug";
import {
  formatParkrunnerIdForDisplay,
  normalizeParkrunnerIdForStorage,
} from "@utils/parkrunnerProfileUrl";
import {
  AmbassadorReference,
  ambassadorHistoryStorageKey,
  findAmbassadorByParkrunnerId,
} from "./setAmbassadorParkrunnerId";
import {
  loadAmbassadorFinishHistories,
  persistAmbassadorFinishHistories,
} from "./persistAmbassadorFinishHistory";

export interface FinishImportResult {
  importedEventCount: number;
  discardedEventCount: number;
  ambassador: AmbassadorReference;
}

export function importAmbassadorFinishHistory(
  payload: FinishImportPayload,
  eventDetails: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
  ambassadorOverride?: AmbassadorReference,
): FinishImportResult {
  const ambassador =
    ambassadorOverride ??
    findAmbassadorByParkrunnerId(
      payload.parkrunnerId,
      eventAmbassadors,
      regionalAmbassadors,
    );

  if (!ambassador) {
    throw new Error(`No ambassador has parkrunner ID ${payload.parkrunnerId}.`);
  }

  const matchedFinishes = matchFinishImportEntries(
    {
      ...payload,
      finishes: keepLatestFinishPerEventSlug(payload.finishes),
    },
    eventDetails,
  );
  const histories = loadAmbassadorFinishHistories();
  const historyKey = ambassadorHistoryStorageKey(ambassador);
  const existing = histories[historyKey];

  histories[historyKey] = mergeAmbassadorFinishHistory(
    existing,
    normalizeParkrunnerIdForStorage(payload.parkrunnerId),
    matchedFinishes.finishesByEvent,
  );
  persistAmbassadorFinishHistories(histories);

  log.push({
    type: "Visit History Imported",
    event: ambassador.name,
    oldValue: formatParkrunnerIdForDisplay(payload.parkrunnerId),
    newValue: `${matchedFinishes.importedEventCount} events (${matchedFinishes.discardedEventCount} discarded)`,
    timestamp: Date.now(),
  });

  return {
    importedEventCount: matchedFinishes.importedEventCount,
    discardedEventCount: matchedFinishes.discardedEventCount,
    ambassador,
  };
}

export function parseFinishImportPayload(raw: string): FinishImportPayload {
  const parsed = JSON.parse(raw) as FinishImportPayload;
  if (!parsed || parsed.schemaVersion !== 1) {
    throw new Error("Unsupported finish import format.");
  }
  if (!parsed.parkrunnerId || !Array.isArray(parsed.finishes)) {
    throw new Error("Finish import payload is missing required fields.");
  }

  return parsed;
}

function matchFinishImportEntries(
  payload: FinishImportPayload,
  eventDetails: EventDetailsMap,
): {
  finishesByEvent: Record<string, string>;
  importedEventCount: number;
  discardedEventCount: number;
} {
  const finishesByEvent: Record<string, string> = {};
  let discardedEventCount = 0;

  for (const finish of payload.finishes) {
    const eventShortName = findEventShortNameBySlug(
      finish.eventSlug,
      eventDetails,
    );
    if (!eventShortName) {
      discardedEventCount += 1;
      continue;
    }

    const existingDate = finishesByEvent[eventShortName];
    if (!existingDate || finish.date > existingDate) {
      finishesByEvent[eventShortName] = finish.date;
    }
  }

  const importedEventCount = Object.keys(finishesByEvent).length;

  return { finishesByEvent, importedEventCount, discardedEventCount };
}

function mergeAmbassadorFinishHistory(
  existing: AmbassadorFinishHistory | undefined,
  parkrunnerId: string,
  incoming: Record<string, string>,
): AmbassadorFinishHistory {
  const merged: Record<string, string> = { ...existing?.finishesByEvent };

  for (const [eventShortName, date] of Object.entries(incoming)) {
    const current = merged[eventShortName];
    if (!current || date > current) {
      merged[eventShortName] = date;
    }
  }

  return {
    parkrunnerId,
    finishesByEvent: merged,
    lastImportedAt: Date.now(),
  };
}

export function getAmbassadorFinishHistoriesForImport(): AmbassadorFinishHistoryMap {
  return loadAmbassadorFinishHistories();
}
