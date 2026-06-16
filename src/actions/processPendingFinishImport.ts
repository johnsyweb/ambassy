import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";
import {
  FINISH_IMPORT_READY_EVENT,
  FINISH_IMPORT_SUPPRESS_AUTO_PROMPT_SESSION_KEY,
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

const STORAGE_PREFIX = "ambassy:";

export interface ProcessPendingFinishImportOptions {
  resume?: boolean;
}

export function getPendingFinishImport(): FinishImportPayload | null {
  return loadFromStorage<FinishImportPayload>(
    PENDING_FINISH_IMPORT_STORAGE_KEY,
  );
}

export function clearPendingFinishImport(): void {
  saveToStorage(PENDING_FINISH_IMPORT_STORAGE_KEY, null);
}

export function isFinishImportAutoPromptSuppressed(): boolean {
  return (
    sessionStorage.getItem(
      `${STORAGE_PREFIX}${FINISH_IMPORT_SUPPRESS_AUTO_PROMPT_SESSION_KEY}`,
    ) === "true"
  );
}

export function suppressFinishImportAutoPrompt(): void {
  sessionStorage.setItem(
    `${STORAGE_PREFIX}${FINISH_IMPORT_SUPPRESS_AUTO_PROMPT_SESSION_KEY}`,
    "true",
  );
}

export function clearFinishImportAutoPromptSuppress(): void {
  sessionStorage.removeItem(
    `${STORAGE_PREFIX}${FINISH_IMPORT_SUPPRESS_AUTO_PROMPT_SESSION_KEY}`,
  );
}

export function dismissPendingFinishImport(): void {
  clearPendingFinishImport();
  clearFinishImportAutoPromptSuppress();
}

export function storePendingFinishImport(payload: FinishImportPayload): void {
  clearFinishImportAutoPromptSuppress();
  saveToStorage(PENDING_FINISH_IMPORT_STORAGE_KEY, payload);
  window.dispatchEvent(new CustomEvent(FINISH_IMPORT_READY_EVENT));
}

export function consumePendingFinishImport(): FinishImportPayload | null {
  const payload = getPendingFinishImport();
  if (!payload) {
    return null;
  }

  clearPendingFinishImport();
  return payload;
}

export async function processPendingFinishImport(
  eventDetails: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
  onComplete: () => void,
  options?: ProcessPendingFinishImportOptions,
): Promise<boolean> {
  const pending = getPendingFinishImport();
  if (!pending) {
    return false;
  }

  if (isFinishImportAutoPromptSuppressed() && !options?.resume) {
    return false;
  }

  if (options?.resume) {
    clearFinishImportAutoPromptSuppress();
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
  const pending = getPendingFinishImport();
  if (pending) {
    clearFinishImportAutoPromptSuppress();
    await processFinishImportPayload(
      pending,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      log,
      onComplete,
    );
    return;
  }

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
      {
        parkrunProfileDisplayName: payload.parkrunProfileDisplayName,
      },
    );
    if (!assigned) {
      suppressFinishImportAutoPrompt();
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
    clearPendingFinishImport();
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
  clearPendingFinishImport();
  onComplete();
}

export function registerFinishImportListener(handler: () => void): () => void {
  window.addEventListener(FINISH_IMPORT_READY_EVENT, handler);
  return () => window.removeEventListener(FINISH_IMPORT_READY_EVENT, handler);
}

export function registerFinishImportActivation(handler: () => void): () => void {
  const storageListener = (event: StorageEvent) => {
    if (
      event.key === `${STORAGE_PREFIX}${PENDING_FINISH_IMPORT_STORAGE_KEY}` &&
      event.newValue
    ) {
      handler();
    }
  };

  const visibilityListener = () => {
    if (document.visibilityState === "visible") {
      handler();
    }
  };

  window.addEventListener("storage", storageListener);
  document.addEventListener("visibilitychange", visibilityListener);
  window.addEventListener("focus", handler);

  return () => {
    window.removeEventListener("storage", storageListener);
    document.removeEventListener("visibilitychange", visibilityListener);
    window.removeEventListener("focus", handler);
  };
}

export type { AmbassadorReference };
