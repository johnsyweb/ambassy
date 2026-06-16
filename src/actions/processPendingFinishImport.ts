import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";
import {
  FINISH_IMPORT_READY_EVENT,
  FinishImportPayload,
  PENDING_FINISH_IMPORT_STORAGE_KEY,
} from "@models/FinishImportPayload";
import { loadFromStorage, saveToStorage } from "@utils/storage";
import {
  importAmbassadorFinishHistory,
  parseFinishImportPayload,
} from "./importAmbassadorFinishHistory";
import {
  AmbassadorReference,
  findAmbassadorByParkrunnerId,
} from "./setAmbassadorParkrunnerId";
import { showAssignParkrunnerImportDialog } from "./showAssignParkrunnerImportDialog";

export function storePendingFinishImport(payload: FinishImportPayload): void {
  saveToStorage(PENDING_FINISH_IMPORT_STORAGE_KEY, payload);
  window.dispatchEvent(new CustomEvent(FINISH_IMPORT_READY_EVENT));
}

export function consumePendingFinishImport(): FinishImportPayload | null {
  const payload = loadFromStorage<FinishImportPayload>(
    PENDING_FINISH_IMPORT_STORAGE_KEY,
  );
  if (!payload) {
    return null;
  }

  saveToStorage(PENDING_FINISH_IMPORT_STORAGE_KEY, null);
  return payload;
}

export async function processPendingFinishImport(
  eventDetails: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
  onComplete: () => void,
): Promise<boolean> {
  const pending = consumePendingFinishImport();
  if (!pending) {
    return false;
  }

  await processFinishImportPayload(
    pending,
    eventDetails,
    eventAmbassadors,
    regionalAmbassadors,
    log,
    onComplete,
  );
  return true;
}

export async function processFinishImportFromClipboard(
  raw: string,
  eventDetails: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
  onComplete: () => void,
): Promise<void> {
  const payload = parseFinishImportPayload(raw);
  await processFinishImportPayload(
    payload,
    eventDetails,
    eventAmbassadors,
    regionalAmbassadors,
    log,
    onComplete,
  );
}

async function processFinishImportPayload(
  payload: FinishImportPayload,
  eventDetails: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
  onComplete: () => void,
): Promise<void> {
  const ambassador = findAmbassadorByParkrunnerId(
    payload.parkrunnerId,
    eventAmbassadors,
    regionalAmbassadors,
  );

  if (!ambassador) {
    const assigned = await showAssignParkrunnerImportDialog(
      payload.parkrunnerId,
      eventAmbassadors,
      regionalAmbassadors,
      log,
    );
    if (!assigned) {
      return;
    }

    importAmbassadorFinishHistory(
      payload,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      log,
      assigned,
    );
    onComplete();
    return;
  }

  importAmbassadorFinishHistory(
    payload,
    eventDetails,
    eventAmbassadors,
    regionalAmbassadors,
    log,
    ambassador,
  );
  onComplete();
}

export function registerFinishImportListener(handler: () => void): () => void {
  window.addEventListener(FINISH_IMPORT_READY_EVENT, handler);
  return () => window.removeEventListener(FINISH_IMPORT_READY_EVENT, handler);
}

export type { AmbassadorReference };
