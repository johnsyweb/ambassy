import {
  transitionEventAmbassadorToRegional,
  transitionRegionalAmbassadorToEvent,
  validateREAToEATransition,
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

  describe("validateREAToEATransition", () => {
    it("should return null if transition is valid (other REAs exist)", () => {
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1", "EA2"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);

      const result = validateREAToEATransition("Test REA", regionalAmbassadors);
      expect(result).toBeNull();
    });

    it("should return error if no other REAs exist and REA has supported EAs", () => {
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1", "EA2"] }],
      ]);

      const result = validateREAToEATransition("Test REA", regionalAmbassadors);
      expect(result).toContain("cannot be transitioned");
      expect(result).toContain("no other Regional Ambassadors");
    });

    it("should return null if REA has no supported EAs even if no other REAs exist", () => {
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: [] }],
      ]);

      const result = validateREAToEATransition("Test REA", regionalAmbassadors);
      expect(result).toBeNull();
    });

    it("should return error if REA does not exist", () => {
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();

      const result = validateREAToEATransition("NonExistent REA", regionalAmbassadors);
      expect(result).toContain("not found");
    });
  });

  describe("transitionRegionalAmbassadorToEvent", () => {
    it("should remove REA from Regional Ambassadors map", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([["EA1", "Other REA"]]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(regionalAmbassadors.has("Test REA")).toBe(false);
    });

    it("should add ambassador to Event Ambassadors map", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([["EA1", "Other REA"]]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(eventAmbassadors.has("Test REA")).toBe(true);
      const ea = eventAmbassadors.get("Test REA");
      expect(ea?.name).toBe("Test REA");
      expect(ea?.state).toBe("VIC");
      expect(ea?.events).toEqual([]);
    });

    it("should reallocate each EA to new REA", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
        ["EA2", { name: "EA2", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1", "EA2"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([
        ["EA1", "Other REA"],
        ["EA2", "Other REA"],
      ]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const otherREA = regionalAmbassadors.get("Other REA");
      expect(otherREA?.supportsEAs).toContain("EA1");
      expect(otherREA?.supportsEAs).toContain("EA2");

      const ea1 = eventAmbassadors.get("EA1");
      expect(ea1?.regionalAmbassador).toBe("Other REA");

      const ea2 = eventAmbassadors.get("EA2");
      expect(ea2?.regionalAmbassador).toBe("Other REA");
    });

    it("should remove each EA from old REA's supportsEAs list", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([["EA1", "Other REA"]]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const testREA = regionalAmbassadors.get("Test REA");
      expect(testREA).toBeUndefined();
    });

    it("should preserve state information during transition", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "NSW", supportsEAs: ["EA1"] }],
        ["Other REA", { name: "Other REA", state: "VIC", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([["EA1", "Other REA"]]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const ea = eventAmbassadors.get("Test REA");
      expect(ea?.state).toBe("NSW");
    });

    it("should log removal from REA list", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([["EA1", "Other REA"]]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const removeLog = log.find((entry) => entry.type === "remove regional ambassador");
      expect(removeLog).toBeDefined();
      expect(removeLog?.event).toBe("Test REA");
      expect(removeLog?.oldValue).toBe("Test REA");
      expect(removeLog?.newValue).toBe("");
    });

    it("should log addition to EA list", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([["EA1", "Other REA"]]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const addLog = log.find((entry) => entry.type === "add event ambassador");
      expect(addLog).toBeDefined();
      expect(addLog?.event).toBe("Test REA");
      expect(addLog?.oldValue).toBe("");
      expect(addLog?.newValue).toBe("Test REA");
    });

    it("should log each EA removal from old REA's supportsEAs list", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
        ["EA2", { name: "EA2", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1", "EA2"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([
        ["EA1", "Other REA"],
        ["EA2", "Other REA"],
      ]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const removeLogs = log.filter(
        (entry) => entry.type === "remove event ambassador from regional supports",
      );
      expect(removeLogs.length).toBe(2);
      expect(removeLogs[0].event).toBe("Test REA");
      expect(removeLogs[1].event).toBe("Test REA");
    });

    it("should log each EA addition to new REA's supportsEAs list", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
        ["EA2", { name: "EA2", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1", "EA2"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([
        ["EA1", "Other REA"],
        ["EA2", "Other REA"],
      ]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const addLogs = log.filter(
        (entry) => entry.type === "add event ambassador to regional supports",
      );
      expect(addLogs.length).toBe(2);
      expect(addLogs[0].event).toBe("Other REA");
      expect(addLogs[1].event).toBe("Other REA");
    });

    it("should log each EA's regionalAmbassador field update", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
        ["EA2", { name: "EA2", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1", "EA2"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([
        ["EA1", "Other REA"],
        ["EA2", "Other REA"],
      ]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const assignLogs = log.filter(
        (entry) => entry.type === "assign event ambassador to regional ambassador",
      );
      expect(assignLogs.length).toBe(2);
      expect(assignLogs[0].event).toBe("EA1");
      expect(assignLogs[0].oldValue).toBe("Test REA");
      expect(assignLogs[0].newValue).toBe("Other REA");
      expect(assignLogs[1].event).toBe("EA2");
      expect(assignLogs[1].oldValue).toBe("Test REA");
      expect(assignLogs[1].newValue).toBe("Other REA");
    });

    it("should handle REA with no supported EAs", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>();

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(eventAmbassadors.has("Test REA")).toBe(true);
      expect(regionalAmbassadors.has("Test REA")).toBe(false);
    });

    it("should throw error if REA does not exist", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>();

      expect(() => {
        transitionRegionalAmbassadorToEvent(
          "NonExistent REA",
          eaRecipients,
          eventAmbassadors,
          regionalAmbassadors,
          log,
        );
      }).toThrow('Regional Ambassador "NonExistent REA" not found');
    });

    it("should throw error if EA recipient does not exist", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([["EA1", "NonExistent REA"]]);

      expect(() => {
        transitionRegionalAmbassadorToEvent(
          "Test REA",
          eaRecipients,
          eventAmbassadors,
          regionalAmbassadors,
          log,
        );
      }).toThrow('Recipient Regional Ambassador "NonExistent REA" not found');
    });

    it("should throw error if EA does not exist in recipients map", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
        ["EA2", { name: "EA2", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1", "EA2"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([["EA1", "Other REA"]]);

      expect(() => {
        transitionRegionalAmbassadorToEvent(
          "Test REA",
          eaRecipients,
          eventAmbassadors,
          regionalAmbassadors,
          log,
        );
      }).toThrow("Not all supported Event Ambassadors have recipients");
    });

    it("should persist Event Ambassadors after addition and updates", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([["EA1", "Other REA"]]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(persistEventAmbassadors).toHaveBeenCalledWith(eventAmbassadors);
    });

    it("should persist Regional Ambassadors after removal and updates", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([["EA1", "Other REA"]]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(persistRegionalAmbassadors).toHaveBeenCalled();
    });

    it("should call trackStateChange after all operations", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([["EA1", "Other REA"]]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(trackStateChange).toHaveBeenCalled();
    });

    it("should persist changes log after all operations", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], state: "VIC", regionalAmbassador: "Test REA" }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: ["EA1"] }],
        ["Other REA", { name: "Other REA", state: "NSW", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];
      const eaRecipients = new Map<string, string>([["EA1", "Other REA"]]);

      transitionRegionalAmbassadorToEvent(
        "Test REA",
        eaRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(persistChangesLog).toHaveBeenCalledWith(log);
    });
  });
});
