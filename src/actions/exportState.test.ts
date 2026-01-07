import { exportApplicationState, downloadStateFile } from "./exportState";
import { loadFromStorage } from "@utils/storage";

jest.mock("@utils/storage");

describe("exportState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => "blob:test-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  describe("exportApplicationState", () => {
    it("should create ApplicationState blob from localStorage data", () => {
      const mockData = {
        eventAmbassadors: [["EA1", { name: "Test EA", events: [] }]],
        eventTeams: [["Event1", { eventShortName: "Event1", eventAmbassador: "EA1", eventDirectors: [] }]],
        regionalAmbassadors: [["REA1", { name: "Test REA", state: "VIC", supportsEAs: [] }]],
        changesLog: [],
      };

      (loadFromStorage as jest.Mock)
        .mockReturnValueOnce(mockData.eventAmbassadors)
        .mockReturnValueOnce(mockData.eventTeams)
        .mockReturnValueOnce(mockData.regionalAmbassadors)
        .mockReturnValueOnce(mockData.changesLog);

      const blob = exportApplicationState();

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("application/json");
    });

    it("should throw error when data is incomplete", () => {
      (loadFromStorage as jest.Mock)
        .mockReturnValueOnce([["EA1", { name: "Test EA", events: [] }]])
        .mockReturnValueOnce(null)
        .mockReturnValueOnce([["REA1", { name: "Test REA", state: "VIC", supportsEAs: [] }]])
        .mockReturnValueOnce([]);

      expect(() => exportApplicationState()).toThrow();
    });
  });

  describe("downloadStateFile", () => {
    it("should trigger browser download", () => {
      const blob = new Blob(['{"test": "data"}'], { type: "application/json" });
      const filename = "ambassy-state-2026-01-07.json";

      const createElementSpy = jest.spyOn(document, "createElement");
      const appendChildSpy = jest.spyOn(document.body, "appendChild");
      const removeChildSpy = jest.spyOn(document.body, "removeChild");

      downloadStateFile(blob, filename);

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});

