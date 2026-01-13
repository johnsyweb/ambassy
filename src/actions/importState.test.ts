import { validateStateFile, importApplicationState } from "./importState";
import { ApplicationState } from "@models/ApplicationState";
import { saveToStorage } from "@utils/storage";

jest.mock("@utils/storage");

describe("importState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateStateFile", () => {
    it("should validate and parse valid state file", async () => {
      const validState: ApplicationState = {
        version: "1.0.0",
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [["EA1", { name: "Test EA", events: [] }]],
          eventTeams: [
            [
              "Event1",
              {
                eventShortName: "Event1",
                eventAmbassador: "EA1",
                eventDirectors: [],
              },
            ],
          ],
          regionalAmbassadors: [
            ["REA1", { name: "Test REA", state: "VIC", supportsEAs: [] }],
          ],
          changesLog: [],
        },
      };

      const file = new File([JSON.stringify(validState)], "test.json", {
        type: "application/json",
      });

      const result = await validateStateFile(file);
      expect(result).toEqual(validState);
    });

    it("should throw error for invalid JSON", async () => {
      const file = new File(["not json"], "test.json", {
        type: "application/json",
      });

      await expect(validateStateFile(file)).rejects.toThrow();
    });

    it("should throw error for missing version field", async () => {
      const invalidState = {
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [],
          eventTeams: [],
          regionalAmbassadors: [],
          changesLog: [],
        },
      };

      const file = new File([JSON.stringify(invalidState)], "test.json", {
        type: "application/json",
      });

      await expect(validateStateFile(file)).rejects.toThrow();
    });

    it("should throw error for version mismatch", async () => {
      const invalidState: ApplicationState = {
        version: "2.0.0",
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [],
          eventTeams: [],
          regionalAmbassadors: [],
          changesLog: [],
        },
      };

      const file = new File([JSON.stringify(invalidState)], "test.json", {
        type: "application/json",
      });

      await expect(validateStateFile(file)).rejects.toThrow();
    });

    it("should throw error for missing data fields", async () => {
      const invalidState = {
        version: "1.0.0",
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [],
        },
      };

      const file = new File([JSON.stringify(invalidState)], "test.json", {
        type: "application/json",
      });

      await expect(validateStateFile(file)).rejects.toThrow();
    });
  });

  describe("importApplicationState", () => {
    it("should persist imported state to storage", () => {
      const state: ApplicationState = {
        version: "1.0.0",
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [["EA1", { name: "Test EA", events: [] }]],
          eventTeams: [
            [
              "Event1",
              {
                eventShortName: "Event1",
                eventAmbassador: "EA1",
                eventDirectors: [],
              },
            ],
          ],
          regionalAmbassadors: [
            ["REA1", { name: "Test REA", state: "VIC", supportsEAs: [] }],
          ],
          changesLog: [],
        },
      };

      importApplicationState(state);

      expect(saveToStorage).toHaveBeenCalledWith(
        "eventAmbassadors",
        state.data.eventAmbassadors,
      );
      expect(saveToStorage).toHaveBeenCalledWith(
        "eventTeams",
        state.data.eventTeams,
      );
      expect(saveToStorage).toHaveBeenCalledWith(
        "regionalAmbassadors",
        state.data.regionalAmbassadors,
      );
      expect(saveToStorage).toHaveBeenCalledWith(
        "changesLog",
        state.data.changesLog,
      );
    });
  });
});
