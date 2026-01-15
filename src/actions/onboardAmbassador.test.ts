import {
  validateAmbassadorName,
  onboardEventAmbassador,
  onboardRegionalAmbassador,
} from "./onboardAmbassador";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";
import {
  persistEventAmbassadors,
  persistRegionalAmbassadors,
} from "./persistState";

jest.mock("./persistState");
jest.mock("./trackChanges");

describe("onboardAmbassador", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateAmbassadorName", () => {
    it("should return true for a valid unique name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();

      const isValid = validateAmbassadorName(
        "New Ambassador",
        eventAmbassadors,
        regionalAmbassadors,
      );

      expect(isValid).toBe(true);
    });

    it("should return false for an empty name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();

      const isValid = validateAmbassadorName(
        "",
        eventAmbassadors,
        regionalAmbassadors,
      );

      expect(isValid).toBe(false);
    });

    it("should return false for a name with only whitespace", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();

      const isValid = validateAmbassadorName(
        "   ",
        eventAmbassadors,
        regionalAmbassadors,
      );

      expect(isValid).toBe(false);
    });

    it("should return false if name already exists in event ambassadors", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Existing EA", { name: "Existing EA", events: [] }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();

      const isValid = validateAmbassadorName(
        "Existing EA",
        eventAmbassadors,
        regionalAmbassadors,
      );

      expect(isValid).toBe(false);
    });

    it("should return false if name already exists in regional ambassadors", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Existing REA", { name: "Existing REA", state: "VIC", supportsEAs: [] }],
      ]);

      const isValid = validateAmbassadorName(
        "Existing REA",
        eventAmbassadors,
        regionalAmbassadors,
      );

      expect(isValid).toBe(false);
    });

    it("should trim whitespace before validation", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Existing EA", { name: "Existing EA", events: [] }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();

      const isValid = validateAmbassadorName(
        "  Existing EA  ",
        eventAmbassadors,
        regionalAmbassadors,
      );

      expect(isValid).toBe(false);
    });
  });

  describe("onboardEventAmbassador", () => {
    it("should create a new event ambassador with empty events array", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      onboardEventAmbassador(
        "New EA",
        "VIC",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(eventAmbassadors.has("New EA")).toBe(true);
      const ambassador = eventAmbassadors.get("New EA");
      expect(ambassador).toEqual({
        name: "New EA",
        events: [],
        state: "VIC",
      });
    });

    it("should trim whitespace from the name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      onboardEventAmbassador(
        "  Trimmed EA  ",
        "NSW",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(eventAmbassadors.has("Trimmed EA")).toBe(true);
      expect(eventAmbassadors.has("  Trimmed EA  ")).toBe(false);
    });

    it("should throw error if name already exists in event ambassadors", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Existing EA", { name: "Existing EA", events: [] }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      expect(() => {
        onboardEventAmbassador(
          "Existing EA",
          "VIC",
          eventAmbassadors,
          regionalAmbassadors,
          log,
        );
      }).toThrow("Ambassador name already exists");
    });

    it("should throw error if name already exists in regional ambassadors", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Existing REA", { name: "Existing REA", state: "VIC", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];

      expect(() => {
        onboardEventAmbassador(
          "Existing REA",
          "VIC",
          eventAmbassadors,
          regionalAmbassadors,
          log,
        );
      }).toThrow("Ambassador name already exists");
    });

    it("should persist event ambassadors after creation", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      onboardEventAmbassador(
        "New EA",
        "VIC",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(persistEventAmbassadors).toHaveBeenCalledWith(eventAmbassadors);
    });

    it("should log the onboarding action", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      const beforeTimestamp = Date.now();
      onboardEventAmbassador(
        "New EA",
        "VIC",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );
      const afterTimestamp = Date.now();

      expect(log.length).toBe(1);
      expect(log[0].type).toBe("onboard event ambassador");
      expect(log[0].event).toBe("New EA");
      expect(log[0].oldValue).toBe("");
      expect(log[0].newValue).toBe("New EA");
      expect(log[0].timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(log[0].timestamp).toBeLessThanOrEqual(afterTimestamp);
    });

    it("should throw error for empty name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      expect(() => {
        onboardEventAmbassador("", "VIC", eventAmbassadors, regionalAmbassadors, log);
      }).toThrow("Ambassador name already exists");
    });

    it("should create event ambassador with state information", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      onboardEventAmbassador(
        "New EA",
        "VIC",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const ambassador = eventAmbassadors.get("New EA");
      expect(ambassador?.state).toBe("VIC");
      expect(ambassador?.name).toBe("New EA");
      expect(ambassador?.events).toEqual([]);
    });

    it("should assign EA to REA when regionalAmbassadorName provided", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];

      onboardEventAmbassador(
        "New EA",
        "VIC",
        eventAmbassadors,
        regionalAmbassadors,
        log,
        "Test REA",
      );

      const ea = eventAmbassadors.get("New EA");
      expect(ea?.regionalAmbassador).toBe("Test REA");

      const rea = regionalAmbassadors.get("Test REA");
      expect(rea?.supportsEAs).toContain("New EA");
    });

    it("should log onboarding, REA assignment, and supportsEAs addition separately", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Test REA", { name: "Test REA", state: "VIC", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];

      onboardEventAmbassador(
        "New EA",
        "VIC",
        eventAmbassadors,
        regionalAmbassadors,
        log,
        "Test REA",
      );

      expect(log.length).toBe(3);

      expect(log[0].type).toBe("onboard event ambassador");
      expect(log[0].event).toBe("New EA");
      expect(log[0].oldValue).toBe("");
      expect(log[0].newValue).toBe("New EA");

      expect(log[1].type).toBe("assign event ambassador to regional ambassador");
      expect(log[1].event).toBe("New EA");
      expect(log[1].oldValue).toBe("");
      expect(log[1].newValue).toBe("Test REA");

      expect(log[2].type).toBe("add event ambassador to regional supports");
      expect(log[2].event).toBe("Test REA");
      expect(log[2].oldValue).toBe("");
      expect(log[2].newValue).toBe("New EA");
    });

    it("should throw error if REA does not exist when assigning", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      expect(() => {
        onboardEventAmbassador(
          "New EA",
          "VIC",
          eventAmbassadors,
          regionalAmbassadors,
          log,
          "NonExistent REA",
        );
      }).toThrow("Regional Ambassador \"NonExistent REA\" not found");
    });

    it("should handle onboarding with state but without REA assignment", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      onboardEventAmbassador(
        "New EA",
        "NSW",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const ambassador = eventAmbassadors.get("New EA");
      expect(ambassador?.state).toBe("NSW");
      expect(ambassador?.regionalAmbassador).toBeUndefined();
      expect(log.length).toBe(1);
      expect(log[0].type).toBe("onboard event ambassador");
    });
  });

  describe("onboardRegionalAmbassador", () => {
    it("should create a new regional ambassador with empty supportsEAs array", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      onboardRegionalAmbassador(
        "New REA",
        "VIC",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(regionalAmbassadors.has("New REA")).toBe(true);
      const ambassador = regionalAmbassadors.get("New REA");
      expect(ambassador).toEqual({
        name: "New REA",
        state: "VIC",
        supportsEAs: [],
      });
    });

    it("should trim whitespace from the name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      onboardRegionalAmbassador(
        "  Trimmed REA  ",
        "NSW",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(regionalAmbassadors.has("Trimmed REA")).toBe(true);
      expect(regionalAmbassadors.has("  Trimmed REA  ")).toBe(false);
    });

    it("should throw error if name already exists in event ambassadors", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Existing EA", { name: "Existing EA", events: [] }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      expect(() => {
        onboardRegionalAmbassador(
          "Existing EA",
          "VIC",
          eventAmbassadors,
          regionalAmbassadors,
          log,
        );
      }).toThrow("Ambassador name already exists");
    });

    it("should throw error if name already exists in regional ambassadors", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Existing REA", { name: "Existing REA", state: "VIC", supportsEAs: [] }],
      ]);
      const log: LogEntry[] = [];

      expect(() => {
        onboardRegionalAmbassador(
          "Existing REA",
          "NSW",
          eventAmbassadors,
          regionalAmbassadors,
          log,
        );
      }).toThrow("Ambassador name already exists");
    });

    it("should persist regional ambassadors after creation", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      onboardRegionalAmbassador(
        "New REA",
        "VIC",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      expect(persistRegionalAmbassadors).toHaveBeenCalledWith(
        regionalAmbassadors,
      );
    });

    it("should log the onboarding action", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      const beforeTimestamp = Date.now();
      onboardRegionalAmbassador(
        "New REA",
        "VIC",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );
      const afterTimestamp = Date.now();

      expect(log.length).toBe(1);
      expect(log[0].type).toBe("onboard regional ambassador");
      expect(log[0].event).toBe("New REA");
      expect(log[0].oldValue).toBe("");
      expect(log[0].newValue).toBe("New REA");
      expect(log[0].timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(log[0].timestamp).toBeLessThanOrEqual(afterTimestamp);
    });

    it("should throw error for empty name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      expect(() => {
        onboardRegionalAmbassador(
          "",
          "VIC",
          eventAmbassadors,
          regionalAmbassadors,
          log,
        );
      }).toThrow("Ambassador name already exists");
    });

    it("should preserve the state value", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: LogEntry[] = [];

      onboardRegionalAmbassador(
        "New REA",
        "NSW",
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );

      const ambassador = regionalAmbassadors.get("New REA");
      expect(ambassador?.state).toBe("NSW");
    });
  });
});
