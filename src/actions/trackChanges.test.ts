import { trackStateChange, hasUnsavedChanges, markStateExported, setupExportReminder, removeExportReminder } from "./trackChanges";
import { loadFromStorage, saveToStorage } from "@utils/storage";
import { ChangeTracker } from "@models/ChangeTracker";

jest.mock("@utils/storage");

describe("trackChanges", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (loadFromStorage as jest.Mock).mockReturnValue(null);
    window.removeEventListener = jest.fn();
  });

  describe("trackStateChange", () => {
    it("should update lastChangeTimestamp and save to storage", () => {
      const mockTracker: ChangeTracker = {
        lastExportTimestamp: 1000,
        lastChangeTimestamp: 1000,
      };
      (loadFromStorage as jest.Mock).mockReturnValue(mockTracker);

      const beforeTime = Date.now();
      trackStateChange();
      const afterTime = Date.now();

      expect(saveToStorage).toHaveBeenCalledWith("changeTracker", expect.objectContaining({
        lastExportTimestamp: 1000,
        lastChangeTimestamp: expect.any(Number),
      }));

      const savedTracker = (saveToStorage as jest.Mock).mock.calls[0][1] as ChangeTracker;
      expect(savedTracker.lastChangeTimestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(savedTracker.lastChangeTimestamp).toBeLessThanOrEqual(afterTime);
    });

    it("should create new tracker if none exists", () => {
      (loadFromStorage as jest.Mock).mockReturnValue(null);

      trackStateChange();

      expect(saveToStorage).toHaveBeenCalledWith("changeTracker", expect.objectContaining({
        lastExportTimestamp: 0,
        lastChangeTimestamp: expect.any(Number),
      }));
    });
  });

  describe("hasUnsavedChanges", () => {
    it("should return false when no changes made", () => {
      const mockTracker: ChangeTracker = {
        lastExportTimestamp: 1000,
        lastChangeTimestamp: 1000,
      };
      (loadFromStorage as jest.Mock).mockReturnValue(mockTracker);

      expect(hasUnsavedChanges()).toBe(false);
    });

    it("should return true when changes are newer than export", () => {
      const mockTracker: ChangeTracker = {
        lastExportTimestamp: 1000,
        lastChangeTimestamp: 2000,
      };
      (loadFromStorage as jest.Mock).mockReturnValue(mockTracker);

      expect(hasUnsavedChanges()).toBe(true);
    });

    it("should return false when tracker does not exist", () => {
      (loadFromStorage as jest.Mock).mockReturnValue(null);

      expect(hasUnsavedChanges()).toBe(false);
    });
  });

  describe("markStateExported", () => {
    it("should update lastExportTimestamp and save to storage", () => {
      const mockTracker: ChangeTracker = {
        lastExportTimestamp: 1000,
        lastChangeTimestamp: 2000,
      };
      (loadFromStorage as jest.Mock).mockReturnValue(mockTracker);

      const beforeTime = Date.now();
      markStateExported();
      const afterTime = Date.now();

      expect(saveToStorage).toHaveBeenCalledWith("changeTracker", expect.objectContaining({
        lastExportTimestamp: expect.any(Number),
        lastChangeTimestamp: 2000,
      }));

      const savedTracker = (saveToStorage as jest.Mock).mock.calls[0][1] as ChangeTracker;
      expect(savedTracker.lastExportTimestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(savedTracker.lastExportTimestamp).toBeLessThanOrEqual(afterTime);
    });

    it("should create new tracker if none exists", () => {
      (loadFromStorage as jest.Mock).mockReturnValue(null);

      markStateExported();

      expect(saveToStorage).toHaveBeenCalledWith("changeTracker", expect.objectContaining({
        lastExportTimestamp: expect.any(Number),
        lastChangeTimestamp: 0,
      }));
    });
  });

  describe("setupExportReminder", () => {
    it("should register beforeunload event listener", () => {
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");

      setupExportReminder();

      expect(addEventListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it("should trigger browser confirmation when unsaved changes exist", () => {
      const mockTracker: ChangeTracker = {
        lastExportTimestamp: 1000,
        lastChangeTimestamp: 2000,
      };
      (loadFromStorage as jest.Mock).mockReturnValue(mockTracker);

      setupExportReminder();

      const beforeUnloadEvent = new BeforeUnloadEvent("beforeunload", { cancelable: true });
      Object.defineProperty(beforeUnloadEvent, "returnValue", {
        writable: true,
        value: "",
      });

      const handler = (window.addEventListener as jest.Mock).mock.calls.find(
        (call) => call[0] === "beforeunload"
      )?.[1];

      if (handler) {
        handler(beforeUnloadEvent);
      }

      expect(beforeUnloadEvent.returnValue).toBe("");
    });

    it("should not trigger confirmation when no unsaved changes", () => {
      const mockTracker: ChangeTracker = {
        lastExportTimestamp: 2000,
        lastChangeTimestamp: 1000,
      };
      (loadFromStorage as jest.Mock).mockReturnValue(mockTracker);

      setupExportReminder();

      const beforeUnloadEvent = new BeforeUnloadEvent("beforeunload", { cancelable: true });
      Object.defineProperty(beforeUnloadEvent, "returnValue", {
        writable: true,
        value: "",
      });

      const handler = (window.addEventListener as jest.Mock).mock.calls.find(
        (call) => call[0] === "beforeunload"
      )?.[1];

      if (handler) {
        handler(beforeUnloadEvent);
      }

      expect(beforeUnloadEvent.returnValue).toBe("");
    });
  });

  describe("removeExportReminder", () => {
    it("should remove beforeunload event listener", () => {
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      setupExportReminder();
      removeExportReminder();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
