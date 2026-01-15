import {
  shouldShowImportGuidance,
  showImportGuidance,
  dismissImportGuidance,
  markDataImported,
} from "./showImportGuidance";
import { loadFromStorage, saveToStorage } from "@utils/storage";
import { ImportGuidanceState, createImportGuidanceState } from "@models/ImportGuidanceState";

jest.mock("@utils/storage");

describe("showImportGuidance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (loadFromStorage as jest.Mock).mockReturnValue(null);
    document.body.innerHTML = '<div id="introduction"></div>';
  });

  describe("shouldShowImportGuidance", () => {
    it("should return true when no data imported and not dismissed", () => {
      const mockState: ImportGuidanceState = createImportGuidanceState();
      (loadFromStorage as jest.Mock).mockReturnValue(mockState);

      expect(shouldShowImportGuidance()).toBe(true);
    });

    it("should return false when data has been imported", () => {
      const mockState: ImportGuidanceState = {
        hasImportedData: true,
        guidanceDismissed: false,
      };
      (loadFromStorage as jest.Mock).mockReturnValue(mockState);

      expect(shouldShowImportGuidance()).toBe(false);
    });

    it("should return false when guidance has been dismissed", () => {
      const mockState: ImportGuidanceState = {
        hasImportedData: false,
        guidanceDismissed: true,
      };
      (loadFromStorage as jest.Mock).mockReturnValue(mockState);

      expect(shouldShowImportGuidance()).toBe(false);
    });

    it("should return false when no state exists (treat as dismissed)", () => {
      (loadFromStorage as jest.Mock).mockReturnValue(null);

      expect(shouldShowImportGuidance()).toBe(false);
    });
  });

  describe("showImportGuidance", () => {
    it("should display guidance UI in introduction section", () => {
      showImportGuidance();

      const introduction = document.getElementById("introduction");
      expect(introduction?.innerHTML).toContain("import");
      expect(introduction?.innerHTML).toContain("shared");
    });

    it("should update lastGuidanceShown timestamp", () => {
      showImportGuidance();

      expect(saveToStorage).toHaveBeenCalledWith(
        "importGuidanceState",
        expect.objectContaining({
          lastGuidanceShown: expect.any(Number),
        })
      );
    });
  });

  describe("dismissImportGuidance", () => {
    it("should hide guidance UI and mark as dismissed", () => {
      const mockState: ImportGuidanceState = createImportGuidanceState();
      (loadFromStorage as jest.Mock).mockReturnValue(mockState);

      document.getElementById("introduction")!.innerHTML = '<div id="importGuidance">Test</div>';

      dismissImportGuidance();

      const guidance = document.getElementById("importGuidance");
      expect(guidance?.style.display).toBe("none");

      expect(saveToStorage).toHaveBeenCalledWith(
        "importGuidanceState",
        expect.objectContaining({
          guidanceDismissed: true,
        })
      );
    });
  });

  describe("markDataImported", () => {
    it("should mark data as imported and hide guidance", () => {
      const mockState: ImportGuidanceState = createImportGuidanceState();
      (loadFromStorage as jest.Mock).mockReturnValue(mockState);

      document.getElementById("introduction")!.innerHTML = '<div id="importGuidance">Test</div>';

      markDataImported();

      expect(saveToStorage).toHaveBeenCalledWith(
        "importGuidanceState",
        expect.objectContaining({
          hasImportedData: true,
        })
      );

      const guidance = document.getElementById("importGuidance");
      expect(guidance?.style.display).toBe("none");
    });
  });
});
