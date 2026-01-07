const STORAGE_PREFIX = "ambassy:";

export function isStorageAvailable(): boolean {
  try {
    const testKey = `${STORAGE_PREFIX}test`;
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

let storageWarningShown = false;

function showStorageWarning(): void {
  if (!storageWarningShown) {
    const warningElement = document.getElementById("storageWarning");
    if (warningElement) {
      warningElement.textContent =
        "Persistence unavailable. Data will be lost when browser closes.";
      warningElement.style.display = "block";
      storageWarningShown = true;
    }
  }
}

export function saveToStorage(key: string, value: unknown): boolean {
  const prefixedKey = `${STORAGE_PREFIX}${key}`;
  try {
    if (isStorageAvailable()) {
      localStorage.setItem(prefixedKey, JSON.stringify(value));
      return true;
    } else {
      sessionStorage.setItem(prefixedKey, JSON.stringify(value));
      showStorageWarning();
      return false;
    }
  } catch (error) {
    if (error instanceof DOMException && (error.code === 22 || error.name === "QuotaExceededError")) {
      console.warn("Storage quota exceeded. Falling back to sessionStorage.");
      try {
        sessionStorage.setItem(prefixedKey, JSON.stringify(value));
        showStorageWarning();
        return false;
      } catch {
        console.error("Failed to save to sessionStorage:", error);
        return false;
      }
    }
    console.error("Failed to save to storage:", error);
    return false;
  }
}

export function loadFromStorage<T>(key: string): T | null {
  const prefixedKey = `${STORAGE_PREFIX}${key}`;
  try {
    let storedValue: string | null = null;
    if (isStorageAvailable()) {
      storedValue = localStorage.getItem(prefixedKey);
    }
    if (storedValue === null) {
      storedValue = sessionStorage.getItem(prefixedKey);
    }
    if (storedValue === null) {
      return null;
    }
    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error);
    return null;
  }
}

export function migrateFromSessionStorage(): void {
  if (!isStorageAvailable()) {
    return;
  }

  const keysToMigrate = [
    "Event Ambassadors",
    "Event Teams",
    "Regional Ambassadors",
    "log",
  ];

  for (const key of keysToMigrate) {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    const sessionValue = sessionStorage.getItem(prefixedKey);
    const localValue = localStorage.getItem(prefixedKey);

    if (sessionValue !== null && localValue === null) {
      try {
        localStorage.setItem(prefixedKey, sessionValue);
      } catch (error) {
        console.error(`Failed to migrate ${key} from sessionStorage:`, error);
      }
    }
  }
}

