import { loadFromStorage, saveToStorage } from "@utils/storage";
import { ChangeTracker, createChangeTracker, hasUnsavedChanges as checkUnsavedChanges } from "@models/ChangeTracker";

const STORAGE_KEY = "changeTracker";

let beforeUnloadHandler: ((event: BeforeUnloadEvent) => void) | null = null;

export function trackStateChange(): void {
  const tracker = loadFromStorage<ChangeTracker>(STORAGE_KEY) || createChangeTracker();
  tracker.lastChangeTimestamp = Date.now();
  saveToStorage(STORAGE_KEY, tracker);
}

export function hasUnsavedChanges(): boolean {
  const tracker = loadFromStorage<ChangeTracker>(STORAGE_KEY);
  if (!tracker) {
    return false;
  }
  return checkUnsavedChanges(tracker);
}

export function markStateExported(): void {
  const tracker = loadFromStorage<ChangeTracker>(STORAGE_KEY) || createChangeTracker();
  tracker.lastExportTimestamp = Date.now();
  saveToStorage(STORAGE_KEY, tracker);
}

export function setupExportReminder(): void {
  beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = "";
    }
  };
  window.addEventListener("beforeunload", beforeUnloadHandler);
}

export function removeExportReminder(): void {
  if (beforeUnloadHandler) {
    window.removeEventListener("beforeunload", beforeUnloadHandler);
    beforeUnloadHandler = null;
  }
}
