import {
  checkReallocationCapacityWarning,
  offboardEventAmbassador,
  offboardRegionalAmbassador,
} from "./offboardAmbassador";
import { EventAmbassadorMap } from "../models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";
import { EventTeamMap } from "../models/EventTeamMap";
import { EventAmbassador } from "../models/EventAmbassador";
import { RegionalAmbassador } from "../models/RegionalAmbassador";
import { CapacityLimits, defaultCapacityLimits } from "../models/CapacityLimits";
import { EventTeam } from "../models/EventTeam";
import { persistEventAmbassadors, persistRegionalAmbassadors, persistChangesLog } from "./persistState";

jest.mock("./persistState");

describe("offboardAmbassador", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkReallocationCapacityWarning", () => {
    it("should return warning if reallocation would exceed capacity", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };

      const recipient: EventAmbassador = {
        name: "EA1",
        events: ["Event1", "Event2", "Event3", "Event4", "Event5", "Event6", "Event7", "Event8", "Event9"], // 9 events (at max)
      };

      const itemsToReallocate = ["Event10", "Event11"]; // Would exceed max of 9

      const warning = checkReallocationCapacityWarning(recipient, itemsToReallocate, "events", limits);
      expect(warning).toBeTruthy();
      expect(warning).toContain("exceed");
    });

    it("should return null if reallocation stays within capacity", () => {
      const limits: CapacityLimits = defaultCapacityLimits;
      const recipient: EventAmbassador = {
        name: "EA1",
        events: ["Event1", "Event2"], // 2 events
      };
      const itemsToReallocate = ["Event3", "Event4"]; // Would be 4 total (within limit)

      const warning = checkReallocationCapacityWarning(recipient, itemsToReallocate, "events", limits);
      expect(warning).toBeNull();
    });
  });

  describe("offboardEventAmbassador", () => {
    it("should remove Event Ambassador and reallocate events", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: ["Event1", "Event2"] }],
        ["EA2", { name: "EA2", events: ["Event3"] }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const eventTeams: EventTeamMap = new Map([
        ["Event1", { eventShortName: "Event1", eventAmbassador: "EA1", eventDirectors: [] }],
        ["Event2", { eventShortName: "Event2", eventAmbassador: "EA1", eventDirectors: [] }],
      ]);
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      const eventRecipients = new Map<string, string>([
        ["Event1", "EA2"],
        ["Event2", "EA2"],
      ]);
      offboardEventAmbassador(
        "EA1",
        eventRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        eventTeams,
        log
      );

      expect(eventAmbassadors.has("EA1")).toBe(false);
      expect(eventAmbassadors.get("EA2")?.events).toContain("Event1");
      expect(eventAmbassadors.get("EA2")?.events).toContain("Event2");
      expect(persistEventAmbassadors).toHaveBeenCalled();
    });

    it("should log offboarding action", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: ["Event1"] }],
        ["EA2", { name: "EA2", events: [] }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const eventTeams: EventTeamMap = new Map([
        ["Event1", { eventShortName: "Event1", eventAmbassador: "EA1", eventDirectors: [] }],
      ]);
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      const eventRecipients = new Map<string, string>([
        ["Event1", "EA2"],
        ["Event2", "EA2"],
      ]);
      offboardEventAmbassador(
        "EA1",
        eventRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        eventTeams,
        log
      );

      expect(log.length).toBeGreaterThan(0);
      expect(log.some((entry) => entry.type === "offboard event ambassador")).toBe(true);
      expect(persistChangesLog).toHaveBeenCalled();
    });

    it("should handle offboarding ambassador with no events", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [] }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const eventTeams: EventTeamMap = new Map();
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      offboardEventAmbassador(
        "EA1",
        new Map(),
        eventAmbassadors,
        regionalAmbassadors,
        eventTeams,
        log
      );

      expect(eventAmbassadors.has("EA1")).toBe(false);
    });
  });

  describe("offboardRegionalAmbassador", () => {
    it("should remove Regional Ambassador and reallocate Event Ambassadors", () => {
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["REA1", { name: "REA1", state: "VIC", supportsEAs: ["EA1", "EA2"] }],
        ["REA2", { name: "REA2", state: "VIC", supportsEAs: ["EA3"] }],
      ]);
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [] }],
        ["EA2", { name: "EA2", events: [] }],
        ["EA3", { name: "EA3", events: [] }],
      ]);
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      const eaRecipients = new Map<string, string>([
        ["EA1", "REA2"],
        ["EA2", "REA2"],
      ]);
      offboardRegionalAmbassador(
        "REA1",
        eaRecipients,
        regionalAmbassadors,
        eventAmbassadors,
        log
      );

      expect(regionalAmbassadors.has("REA1")).toBe(false);
      expect(regionalAmbassadors.get("REA2")?.supportsEAs).toContain("EA1");
      expect(regionalAmbassadors.get("REA2")?.supportsEAs).toContain("EA2");
      expect(persistRegionalAmbassadors).toHaveBeenCalled();
    });

    it("should log offboarding action", () => {
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["REA1", { name: "REA1", state: "VIC", supportsEAs: ["EA1"] }],
        ["REA2", { name: "REA2", state: "VIC", supportsEAs: [] }],
      ]);
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [] }],
      ]);
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      const eaRecipients = new Map<string, string>([
        ["EA1", "REA2"],
        ["EA2", "REA2"],
      ]);
      offboardRegionalAmbassador(
        "REA1",
        eaRecipients,
        regionalAmbassadors,
        eventAmbassadors,
        log
      );

      expect(log.length).toBeGreaterThan(0);
      expect(log.some((entry) => entry.type === "offboard regional ambassador")).toBe(true);
      expect(persistChangesLog).toHaveBeenCalled();
    });
  });

  describe("Integration test", () => {
    it("should complete offboarding flow with reallocation suggestions", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: ["Event1", "Event2"] }],
        ["EA2", { name: "EA2", events: ["Event3"] }],
      ]);
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const eventTeams: EventTeamMap = new Map([
        ["Event1", { eventShortName: "Event1", eventAmbassador: "EA1", eventDirectors: [] }],
        ["Event2", { eventShortName: "Event2", eventAmbassador: "EA1", eventDirectors: [] }],
      ]);
      const log: Array<{ type: string; event: string; oldValue: string; newValue: string; timestamp: number }> = [];

      const eventRecipients = new Map<string, string>([
        ["Event1", "EA2"],
        ["Event2", "EA2"],
      ]);
      offboardEventAmbassador(
        "EA1",
        eventRecipients,
        eventAmbassadors,
        regionalAmbassadors,
        eventTeams,
        log
      );

      // Verify ambassador removed
      expect(eventAmbassadors.has("EA1")).toBe(false);
      
      // Verify events reallocated
      const ea2 = eventAmbassadors.get("EA2");
      expect(ea2?.events).toContain("Event1");
      expect(ea2?.events).toContain("Event2");
      
      // Verify logging
      expect(log.length).toBeGreaterThan(0);
    });
  });
});

