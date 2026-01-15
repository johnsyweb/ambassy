import { createChangeTracker, hasUnsavedChanges, ChangeTracker } from "./ChangeTracker";

describe("ChangeTracker", () => {
  describe("createChangeTracker", () => {
    it("should create a tracker with zero timestamps", () => {
      const tracker = createChangeTracker();
      expect(tracker.lastExportTimestamp).toBe(0);
      expect(tracker.lastChangeTimestamp).toBe(0);
    });
  });

  describe("hasUnsavedChanges", () => {
    it("should return false when no changes made", () => {
      const tracker: ChangeTracker = {
        lastExportTimestamp: 1000,
        lastChangeTimestamp: 1000,
      };
      expect(hasUnsavedChanges(tracker)).toBe(false);
    });

    it("should return false when changes are older than export", () => {
      const tracker: ChangeTracker = {
        lastExportTimestamp: 2000,
        lastChangeTimestamp: 1000,
      };
      expect(hasUnsavedChanges(tracker)).toBe(false);
    });

    it("should return true when changes are newer than export", () => {
      const tracker: ChangeTracker = {
        lastExportTimestamp: 1000,
        lastChangeTimestamp: 2000,
      };
      expect(hasUnsavedChanges(tracker)).toBe(true);
    });

    it("should return false when both timestamps are zero", () => {
      const tracker = createChangeTracker();
      expect(hasUnsavedChanges(tracker)).toBe(false);
    });
  });
});
