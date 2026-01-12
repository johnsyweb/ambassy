import {
  persistEventAmbassadors,
  persistEventTeams,
  persistRegionalAmbassadors,
  persistChangesLog,
  restoreApplicationState,
} from "./persistState";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";
import { saveToStorage, loadFromStorage } from "@utils/storage";

jest.mock("@utils/storage");

describe("persistState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("persistEventAmbassadors", () => {
    it("should save EventAmbassadorMap to storage", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "Test EA", events: ["Event1"] }],
      ]);
      persistEventAmbassadors(eventAmbassadors);
      expect(saveToStorage).toHaveBeenCalledWith(
        "eventAmbassadors",
        Array.from(eventAmbassadors.entries())
      );
    });
  });

  describe("persistEventTeams", () => {
    it("should save EventTeamMap to storage", () => {
      const eventTeams: EventTeamMap = new Map([
        ["Event1", { eventShortName: "Event1", eventAmbassador: "EA1", eventDirectors: [] }],
      ]);
      persistEventTeams(eventTeams);
      expect(saveToStorage).toHaveBeenCalledWith("eventTeams", Array.from(eventTeams.entries()));
    });
  });

  describe("persistRegionalAmbassadors", () => {
    it("should save RegionalAmbassadorMap to storage", () => {
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["REA1", { name: "Test REA", state: "VIC", supportsEAs: ["EA1"] }],
      ]);
      persistRegionalAmbassadors(regionalAmbassadors);
      expect(saveToStorage).toHaveBeenCalledWith(
        "regionalAmbassadors",
        Array.from(regionalAmbassadors.entries())
      );
    });
  });

  describe("persistChangesLog", () => {
    it("should save LogEntry array to storage", () => {
      const log: LogEntry[] = [
        {
          type: "test",
          event: "Event1",
          oldValue: "old",
          newValue: "new",
          timestamp: Date.now(),
        },
      ];
      persistChangesLog(log);
      expect(saveToStorage).toHaveBeenCalledWith("changesLog", log);
    });
  });

  describe("restoreApplicationState", () => {
    it("should restore complete application state from storage", () => {
      const mockState = {
        data: {
          eventAmbassadors: [["EA1", { name: "Test EA", events: [] }]],
          eventTeams: [["Event1", { eventShortName: "Event1", eventAmbassador: "EA1", eventDirectors: [] }]],
          regionalAmbassadors: [["REA1", { name: "Test REA", state: "VIC", supportsEAs: [] }]],
          changesLog: [],
        },
      };

      (loadFromStorage as jest.Mock)
        .mockReturnValueOnce(mockState.data.eventAmbassadors)
        .mockReturnValueOnce(mockState.data.eventTeams)
        .mockReturnValueOnce(mockState.data.regionalAmbassadors)
        .mockReturnValueOnce(mockState.data.changesLog);

      const result = restoreApplicationState();

      expect(result).toBeTruthy();
      // Expect migrated data with new prospectiveEvents and regionalAmbassador fields
      expect(result?.data.eventAmbassadors).toEqual([
        ["EA1", { name: "Test EA", events: [], prospectiveEvents: [], regionalAmbassador: undefined }]
      ]);
      expect(result?.data.eventTeams).toEqual(mockState.data.eventTeams);
      expect(result?.data.regionalAmbassadors).toEqual([
        ["REA1", { name: "Test REA", state: "VIC", supportsEAs: [], prospectiveEvents: [] }]
      ]);
      expect(result?.data.changesLog).toEqual(mockState.data.changesLog);
    });

    it("should return null when data is incomplete", () => {
      (loadFromStorage as jest.Mock)
        .mockReturnValueOnce([["EA1", { name: "Test EA", events: [] }]])
        .mockReturnValueOnce(null)
        .mockReturnValueOnce([["REA1", { name: "Test REA", state: "VIC", supportsEAs: [] }]])
        .mockReturnValueOnce([]);

      const result = restoreApplicationState();
      expect(result).toBeNull();
    });

    it("should return null when no data exists", () => {
      (loadFromStorage as jest.Mock).mockReturnValue(null);
      const result = restoreApplicationState();
      expect(result).toBeNull();
    });
  });
});

