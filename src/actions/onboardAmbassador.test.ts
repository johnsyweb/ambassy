import {
  validateAmbassadorName,
  onboardEventAmbassador,
  onboardRegionalAmbassador,
} from "./onboardAmbassador";
import { EventAmbassadorMap } from "../models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";
import { persistEventAmbassadors, persistRegionalAmbassadors } from "./persistState";

jest.mock("./persistState");
jest.mock("@utils/storage");

describe("onboardAmbassador", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("validateAmbassadorName", () => {
    it("should return true for valid unique name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Existing EA", { name: "Existing EA", events: [] }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();

      expect(
        validateAmbassadorName("New EA", eventAmbassadors, regionalAmbassadors)
      ).toBe(true);
    });

    it("should return false for duplicate Event Ambassador name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Duplicate EA", { name: "Duplicate EA", events: [] }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();

      expect(
        validateAmbassadorName(
          "Duplicate EA",
          eventAmbassadors,
          regionalAmbassadors
        )
      ).toBe(false);
    });

    it("should return false for duplicate Regional Ambassador name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Duplicate REA", { name: "Duplicate REA", state: "VIC", supportsEAs: [] }],
      ]);

      expect(
        validateAmbassadorName(
          "Duplicate REA",
          eventAmbassadors,
          regionalAmbassadors
        )
      ).toBe(false);
    });

    it("should return false for empty name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();

      expect(
        validateAmbassadorName("", eventAmbassadors, regionalAmbassadors)
      ).toBe(false);
    });

    it("should return false for whitespace-only name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();

      expect(
        validateAmbassadorName("   ", eventAmbassadors, regionalAmbassadors)
      ).toBe(false);
    });
  });

  describe("onboardEventAmbassador", () => {
    it("should add new Event Ambassador with empty events array", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      onboardEventAmbassador("New EA", eventAmbassadors, regionalAmbassadors, log);

      expect(eventAmbassadors.has("New EA")).toBe(true);
      const ambassador = eventAmbassadors.get("New EA");
      expect(ambassador).toEqual({ name: "New EA", events: [] });
      expect(persistEventAmbassadors).toHaveBeenCalledWith(eventAmbassadors);
    });

    it("should log onboarding action", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      onboardEventAmbassador("New EA", eventAmbassadors, regionalAmbassadors, log);

      expect(log.length).toBe(1);
      expect(log[0].type).toBe("onboard event ambassador");
      expect(log[0].event).toBe("New EA");
      expect(log[0].oldValue).toBe("");
      expect(log[0].newValue).toBe("New EA");
      expect(log[0].timestamp).toBeGreaterThan(0);
    });

    it("should throw error for duplicate name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["Existing EA", { name: "Existing EA", events: [] }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      expect(() => {
        onboardEventAmbassador("Existing EA", eventAmbassadors, regionalAmbassadors, log);
      }).toThrow("Ambassador name already exists");
    });
  });

  describe("onboardRegionalAmbassador", () => {
    it("should add new Regional Ambassador with empty supportsEAs array", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      onboardRegionalAmbassador("New REA", "VIC", eventAmbassadors, regionalAmbassadors, log);

      expect(regionalAmbassadors.has("New REA")).toBe(true);
      const ambassador = regionalAmbassadors.get("New REA");
      expect(ambassador).toEqual({
        name: "New REA",
        state: "VIC",
        supportsEAs: [],
      });
      expect(persistRegionalAmbassadors).toHaveBeenCalledWith(regionalAmbassadors);
    });

    it("should log onboarding action", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      onboardRegionalAmbassador("New REA", "VIC", eventAmbassadors, regionalAmbassadors, log);

      expect(log.length).toBe(1);
      expect(log[0].type).toBe("onboard regional ambassador");
      expect(log[0].event).toBe("New REA");
      expect(log[0].oldValue).toBe("");
      expect(log[0].newValue).toBe("New REA");
      expect(log[0].timestamp).toBeGreaterThan(0);
    });

    it("should throw error for duplicate name", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["Existing REA", { name: "Existing REA", state: "VIC", supportsEAs: [] }],
      ]);
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      expect(() => {
        onboardRegionalAmbassador("Existing REA", "VIC", eventAmbassadors, regionalAmbassadors, log);
      }).toThrow("Ambassador name already exists");
    });
  });

  describe("Integration tests", () => {
    it("should onboard Event Ambassador and verify it appears in data", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      onboardEventAmbassador("Integration EA", eventAmbassadors, regionalAmbassadors, log);

      expect(eventAmbassadors.size).toBe(1);
      expect(eventAmbassadors.has("Integration EA")).toBe(true);
      const ambassador = eventAmbassadors.get("Integration EA");
      expect(ambassador?.name).toBe("Integration EA");
      expect(ambassador?.events).toEqual([]);
      expect(persistEventAmbassadors).toHaveBeenCalled();
    });

    it("should onboard Regional Ambassador and verify it appears in data", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      onboardRegionalAmbassador("Integration REA", "VIC", eventAmbassadors, regionalAmbassadors, log);

      expect(regionalAmbassadors.size).toBe(1);
      expect(regionalAmbassadors.has("Integration REA")).toBe(true);
      const ambassador = regionalAmbassadors.get("Integration REA");
      expect(ambassador?.name).toBe("Integration REA");
      expect(ambassador?.state).toBe("VIC");
      expect(ambassador?.supportsEAs).toEqual([]);
      expect(persistRegionalAmbassadors).toHaveBeenCalled();
    });
  });
});

