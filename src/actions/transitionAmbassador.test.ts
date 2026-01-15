import {
  transitionEventAmbassadorToRegional,
} from "./transitionAmbassador";
import { EventAmbassadorMap } from "../models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";
import { LogEntry } from "../models/LogEntry";
import {
  persistEventAmbassadors,
  persistRegionalAmbassadors,
  persistChangesLog,
} from "./persistState";
import { trackStateChange } from "./trackChanges";

jest.mock("./persistState");
jest.mock("./trackChanges");

describe("transitionAmbassador", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("transitionEventAmbassadorToRegional", () => {
    it("should remove EA from Event Ambassadors map", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: ["event1"], state: "VIC" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(eventAmbassadors.has("Test EA")).toBe(false);
    });

    it("should add ambassador to Regional Ambassadors map", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: ["event1"], state: "VIC" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(regionalAmbassadors.has("Test EA")).toBe(true);
      const rea = regionalAmbassadors.get("Test EA");
      expect(rea?.name).toBe("Test EA");
      expect(rea?.state).toBe("VIC");
    });

    it("should preserve events in eventsForReallocation field", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: ["event1", "event2"], state: "VIC" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const rea = regionalAmbassadors.get("Test EA");
      expect(rea?.eventsForReallocation).toEqual(["event1", "event2"]);
    });

    it("should preserve prospective events in prospectiveEventsForReallocation field", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", {
          name: "Test EA",
          events: ["event1"],
          prospectiveEvents: ["prospect1", "prospect2"],
          state: "VIC",
        }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const rea = regionalAmbassadors.get("Test EA");
      expect(rea?.prospectiveEventsForReallocation).toEqual(["prospect1", "prospect2"]);
    });

    it("should remove EA from previous REA's supportsEAs list", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA", "Other EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const rea = regionalAmbassadors.get("Test REA");
      expect(rea?.supportsEAs).not.toContain("Test EA");
      expect(rea?.supportsEAs).toContain("Other EA");
    });

    it("should preserve state information during transition", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: [], state: "NSW" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const rea = regionalAmbassadors.get("Test EA");
      expect(rea?.state).toBe("NSW");
    });

    it("should log removal from EA list", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: [], state: "VIC" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const removeLog = log.find((entry) => entry.type === "remove event ambassador");
      expect(removeLog).toBeDefined();
      expect(removeLog?.event).toBe("Test EA");
      expect(removeLog?.oldValue).toBe("Test EA");
      expect(removeLog?.newValue).toBe("");
    });

    it("should log addition to REA list", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: [], state: "VIC" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const addLog = log.find((entry) => entry.type === "add regional ambassador");
      expect(addLog).toBeDefined();
      expect(addLog?.event).toBe("Test EA");
      expect(addLog?.oldValue).toBe("");
      expect(addLog?.newValue).toBe("Test EA");
    });

    it("should log removal from previous REA's supportsEAs list", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA", "Other EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const removeLog = log.find(
        (entry) => entry.type === "remove event ambassador from regional supports",
      );
      expect(removeLog).toBeDefined();
      expect(removeLog?.event).toBe("Test REA");
      expect(removeLog?.oldValue).toContain("Test EA");
      expect(removeLog?.newValue).not.toContain("Test EA");
    });

    it("should handle EA with no previous REA assignment", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: [], state: "VIC" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(regionalAmbassadors.has("Test EA")).toBe(true);
      const rea = regionalAmbassadors.get("Test EA");
      expect(rea?.supportsEAs).toEqual([]);
    });

    it("should handle EA with no events", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: [], state: "VIC" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const rea = regionalAmbassadors.get("Test EA");
      expect(rea?.eventsForReallocation).toEqual([]);
    });

    it("should persist Event Ambassadors after removal", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: [], state: "VIC" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(persistEventAmbassadors).toHaveBeenCalledWith(eventAmbassadors);
    });

    it("should persist Regional Ambassadors after addition and update", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: [], state: "VIC" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(persistRegionalAmbassadors).toHaveBeenCalled();
    });

    it("should call trackStateChange after all operations", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: [], state: "VIC" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(trackStateChange).toHaveBeenCalled();
    });

    it("should throw error if EA does not exist", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      expect(() => {
        transitionEventAmbassadorToRegional(
          "NonExistent EA",
          eventAmbassadors,
          regionalAmbassadors,
          log,
        );
      }).toThrow('Event Ambassador "NonExistent EA" not found');
    });

    it("should persist changes log after all operations", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Test EA", { name: "Test EA", events: [], state: "VIC" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["Test EA"] }],
      ]);
      const log: LogEntry[] = [];

      transitionEventAmbassadorToRegional(
        "Test EA",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(persistChangesLog).toHaveBeenCalledWith(log);
    });
  });
});
