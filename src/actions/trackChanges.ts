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
  // If lastChangeTimestamp is 0, no changes have been made yet
  if (tracker.lastChangeTimestamp === 0) {
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

export function initializeChangeTrackerForLoadedData(): void {
  const tracker = loadFromStorage<ChangeTracker>(STORAGE_KEY);
  // If tracker doesn't exist, initialize it with current timestamp as "exported"
  // This treats loaded data as "already saved" until user makes changes
  if (!tracker) {
    const newTracker = createChangeTracker();
    newTracker.lastExportTimestamp = Date.now();
    newTracker.lastChangeTimestamp = 0;
    saveToStorage(STORAGE_KEY, newTracker);
  } else if (tracker.lastChangeTimestamp === 0 && tracker.lastExportTimestamp === 0) {
    // If tracker exists but is uninitialized (both timestamps are 0),
    // treat loaded data as "already saved"
    tracker.lastExportTimestamp = Date.now();
    saveToStorage(STORAGE_KEY, tracker);
  }
}
