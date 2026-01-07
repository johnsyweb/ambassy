import {
  checkEventAmbassadorCapacity,
  checkRegionalAmbassadorCapacity,
  loadCapacityLimits,
  calculateAllCapacityStatuses,
} from "./checkCapacity";
import { CapacityStatus } from "../models/CapacityStatus";
import { CapacityLimits, defaultCapacityLimits } from "../models/CapacityLimits";
import { EventAmbassadorMap } from "../models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";
import { EventAmbassador } from "../models/EventAmbassador";
import { RegionalAmbassador } from "../models/RegionalAmbassador";
import { saveToStorage, loadFromStorage } from "../utils/storage";

jest.mock("../utils/storage");

describe("checkCapacity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("checkEventAmbassadorCapacity", () => {
    it("should return WITHIN when ambassador has events within capacity range", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      const eventCount = 5;

      const status = checkEventAmbassadorCapacity(eventCount, limits);
      expect(status).toBe(CapacityStatus.WITHIN);
    });

    it("should return UNDER when ambassador has fewer events than minimum", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      const eventCount = 1;

      const status = checkEventAmbassadorCapacity(eventCount, limits);
      expect(status).toBe(CapacityStatus.UNDER);
    });

    it("should return OVER when ambassador has more events than maximum", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      const eventCount = 10;

      const status = checkEventAmbassadorCapacity(eventCount, limits);
      expect(status).toBe(CapacityStatus.OVER);
    });

    it("should return WITHIN when ambassador has exactly minimum events", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      const eventCount = 2;

      const status = checkEventAmbassadorCapacity(eventCount, limits);
      expect(status).toBe(CapacityStatus.WITHIN);
    });

    it("should return WITHIN when ambassador has exactly maximum events", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      const eventCount = 9;

      const status = checkEventAmbassadorCapacity(eventCount, limits);
      expect(status).toBe(CapacityStatus.WITHIN);
    });
  });

  describe("checkRegionalAmbassadorCapacity", () => {
    it("should return WITHIN when ambassador supports EAs within capacity range", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      const eaCount = 8;

      const status = checkRegionalAmbassadorCapacity(eaCount, limits);
      expect(status).toBe(CapacityStatus.WITHIN);
    });

    it("should return UNDER when ambassador supports fewer EAs than minimum", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      const eaCount = 2;

      const status = checkRegionalAmbassadorCapacity(eaCount, limits);
      expect(status).toBe(CapacityStatus.UNDER);
    });

    it("should return OVER when ambassador supports more EAs than maximum", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      const eaCount = 12;

      const status = checkRegionalAmbassadorCapacity(eaCount, limits);
      expect(status).toBe(CapacityStatus.OVER);
    });

    it("should return WITHIN when ambassador supports exactly minimum EAs", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      const eaCount = 3;

      const status = checkRegionalAmbassadorCapacity(eaCount, limits);
      expect(status).toBe(CapacityStatus.WITHIN);
    });

    it("should return WITHIN when ambassador supports exactly maximum EAs", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      const eaCount = 10;

      const status = checkRegionalAmbassadorCapacity(eaCount, limits);
      expect(status).toBe(CapacityStatus.WITHIN);
    });
  });

  describe("loadCapacityLimits", () => {
    it("should return default limits when not stored", () => {
      (loadFromStorage as jest.Mock).mockReturnValue(null);

      const limits = loadCapacityLimits();
      expect(limits).toEqual(defaultCapacityLimits);
    });

    it("should return stored limits when available", () => {
      const storedLimits: CapacityLimits = {
        eventAmbassadorMin: 3,
        eventAmbassadorMax: 8,
        regionalAmbassadorMin: 4,
        regionalAmbassadorMax: 12,
      };
      (loadFromStorage as jest.Mock).mockReturnValue(storedLimits);

      const limits = loadCapacityLimits();
      expect(limits).toEqual(storedLimits);
      expect(loadFromStorage).toHaveBeenCalledWith("capacityLimits");
    });
  });

  describe("calculateAllCapacityStatuses", () => {
    it("should calculate capacity status for all Event Ambassadors", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };

      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: ["Event1", "Event2", "Event3"] }], // 3 events - WITHIN
        ["EA2", { name: "EA2", events: ["Event4"] }], // 1 event - UNDER
        ["EA3", { name: "EA3", events: Array(10).fill("Event").map((_, i) => `Event${i}`) }], // 10 events - OVER
      ]);

      calculateAllCapacityStatuses(eventAmbassadors, new Map(), limits);

      expect(eventAmbassadors.get("EA1")?.capacityStatus).toBe(CapacityStatus.WITHIN);
      expect(eventAmbassadors.get("EA2")?.capacityStatus).toBe(CapacityStatus.UNDER);
      expect(eventAmbassadors.get("EA3")?.capacityStatus).toBe(CapacityStatus.OVER);
    });

    it("should calculate capacity status for all Regional Ambassadors", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };

      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["REA1", { name: "REA1", state: "VIC", supportsEAs: ["EA1", "EA2", "EA3", "EA4", "EA5"] }], // 5 EAs - WITHIN
        ["REA2", { name: "REA2", state: "VIC", supportsEAs: ["EA6", "EA7"] }], // 2 EAs - UNDER
        ["REA3", { name: "REA3", state: "VIC", supportsEAs: Array(12).fill("EA").map((_, i) => `EA${i}`) }], // 12 EAs - OVER
      ]);

      calculateAllCapacityStatuses(new Map(), regionalAmbassadors, limits);

      expect(regionalAmbassadors.get("REA1")?.capacityStatus).toBe(CapacityStatus.WITHIN);
      expect(regionalAmbassadors.get("REA2")?.capacityStatus).toBe(CapacityStatus.UNDER);
      expect(regionalAmbassadors.get("REA3")?.capacityStatus).toBe(CapacityStatus.OVER);
    });

    it("should handle empty ambassador maps", () => {
      const limits: CapacityLimits = defaultCapacityLimits;

      const eventAmbassadors: EventAmbassadorMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();

      expect(() => {
        calculateAllCapacityStatuses(eventAmbassadors, regionalAmbassadors, limits);
      }).not.toThrow();
    });
  });
});

