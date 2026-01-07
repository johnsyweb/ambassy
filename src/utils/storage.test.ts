import {
  isStorageAvailable,
  saveToStorage,
  loadFromStorage,
  migrateFromSessionStorage,
} from "./storage";

describe("storage", () => {
  beforeEach(() => {
    if (typeof Storage !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
  });

  describe("isStorageAvailable", () => {
    it("should return true when localStorage is available", () => {
      const result = isStorageAvailable();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("saveToStorage", () => {
    it("should save data to localStorage when available", () => {
      const key = "testKey";
      const value = { test: "data" };
      const result = saveToStorage(key, value);
      const stored = localStorage.getItem("ambassy:testKey");
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored || "{}")).toEqual(value);
      expect(result).toBe(true);
    });

    it("should fall back to sessionStorage when localStorage unavailable", () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      };

      const key = "testKey";
      const value = { test: "data" };
      const result = saveToStorage(key, value);
      const stored = sessionStorage.getItem("ambassy:testKey");
      expect(stored).toBeTruthy();
      expect(result).toBe(false);

      localStorage.setItem = originalSetItem;
    });

    it("should handle quota exceeded errors gracefully", () => {
      const originalSetItem = localStorage.setItem;
      let callCount = 0;
      localStorage.setItem = () => {
        callCount++;
        if (callCount === 1) {
          throw new DOMException("QuotaExceededError", "QuotaExceededError");
        }
      };

      const key = "testKey";
      const value = { test: "data" };
      const result = saveToStorage(key, value);
      expect(result).toBe(false);

      localStorage.setItem = originalSetItem;
    });
  });

  describe("loadFromStorage", () => {
    it("should load data from localStorage when available", () => {
      const key = "testKey";
      const value = { test: "data" };
      localStorage.setItem("ambassy:testKey", JSON.stringify(value));
      const result = loadFromStorage<typeof value>(key);
      expect(result).toEqual(value);
    });

    it("should fall back to sessionStorage when localStorage unavailable", () => {
      const key = "testKey";
      const value = { test: "data" };
      sessionStorage.setItem("ambassy:testKey", JSON.stringify(value));
      const result = loadFromStorage<typeof value>(key);
      expect(result).toEqual(value);
    });

    it("should return null when key does not exist", () => {
      const result = loadFromStorage("nonexistent");
      expect(result).toBeNull();
    });

    it("should return null when JSON is invalid", () => {
      localStorage.setItem("ambassy:invalid", "not json");
      const result = loadFromStorage("invalid");
      expect(result).toBeNull();
    });
  });

  describe("migrateFromSessionStorage", () => {
    it("should migrate data from sessionStorage to localStorage", () => {
      const testData = { test: "data" };
      sessionStorage.setItem("ambassy:Event Ambassadors", JSON.stringify(testData));
      migrateFromSessionStorage();
      const migrated = localStorage.getItem("ambassy:Event Ambassadors");
      expect(migrated).toBeTruthy();
      expect(JSON.parse(migrated || "{}")).toEqual(testData);
    });

    it("should not overwrite existing localStorage data", () => {
      const localData = { local: "data" };
      const sessionData = { session: "data" };
      localStorage.setItem("ambassy:Event Ambassadors", JSON.stringify(localData));
      sessionStorage.setItem("ambassy:Event Ambassadors", JSON.stringify(sessionData));
      migrateFromSessionStorage();
      const migrated = localStorage.getItem("ambassy:Event Ambassadors");
      expect(JSON.parse(migrated || "{}")).toEqual(localData);
    });

    it("should do nothing when localStorage is unavailable", () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      };

      sessionStorage.setItem("ambassy:Event Ambassadors", JSON.stringify({ test: "data" }));
      migrateFromSessionStorage();
      expect(sessionStorage.getItem("ambassy:Event Ambassadors")).toBeTruthy();

      localStorage.setItem = originalSetItem;
    });
  });
});

