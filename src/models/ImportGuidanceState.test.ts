import { createImportGuidanceState, ImportGuidanceState } from "./ImportGuidanceState";

describe("ImportGuidanceState", () => {
  describe("createImportGuidanceState", () => {
    it("should create state with default values", () => {
      const state = createImportGuidanceState();
      expect(state.hasImportedData).toBe(false);
      expect(state.guidanceDismissed).toBe(false);
      expect(state.lastGuidanceShown).toBeUndefined();
    });
  });

  describe("ImportGuidanceState interface", () => {
    it("should allow setting hasImportedData to true", () => {
      const state: ImportGuidanceState = {
        hasImportedData: true,
        guidanceDismissed: false,
      };
      expect(state.hasImportedData).toBe(true);
    });

    it("should allow setting guidanceDismissed to true", () => {
      const state: ImportGuidanceState = {
        hasImportedData: false,
        guidanceDismissed: true,
        lastGuidanceShown: Date.now(),
      };
      expect(state.guidanceDismissed).toBe(true);
      expect(state.lastGuidanceShown).toBeDefined();
    });
  });
});
