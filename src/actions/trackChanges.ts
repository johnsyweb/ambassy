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
  const now = Date.now();
  
  // If tracker doesn't exist, initialize it with current timestamp as "exported"
  // This treats loaded data as "already saved" until user makes changes
  if (!tracker) {
    const newTracker = createChangeTracker();
    newTracker.lastExportTimestamp = now;
    newTracker.lastChangeTimestamp = 0;
    saveToStorage(STORAGE_KEY, newTracker);
  } else {
    // If tracker exists, ensure loaded data is treated as "saved"
    // If there were unsaved changes from a previous session, reset them
    // (we can't know if those changes were saved externally, so treat as saved)
    if (tracker.lastChangeTimestamp > tracker.lastExportTimestamp) {
      // Previous session had unsaved changes - reset to treat loaded data as saved
      tracker.lastExportTimestamp = now;
      tracker.lastChangeTimestamp = 0;
      saveToStorage(STORAGE_KEY, tracker);
    } else if (tracker.lastChangeTimestamp === 0 && tracker.lastExportTimestamp === 0) {
      // Uninitialized tracker - treat loaded data as "already saved"
      tracker.lastExportTimestamp = now;
      saveToStorage(STORAGE_KEY, tracker);
    }
    // If tracker shows no unsaved changes (lastChangeTimestamp <= lastExportTimestamp),
    // leave it as-is - data is already marked as saved
  }
}
