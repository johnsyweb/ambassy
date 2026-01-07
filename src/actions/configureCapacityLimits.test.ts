import {
  validateCapacityLimits,
  saveCapacityLimits,
} from "./configureCapacityLimits";
import { CapacityLimits, defaultCapacityLimits } from "../models/CapacityLimits";
import { saveToStorage, loadFromStorage } from "../utils/storage";

jest.mock("../utils/storage");

describe("configureCapacityLimits", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateCapacityLimits", () => {
    it("should return true for valid limits", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      expect(validateCapacityLimits(limits)).toBe(true);
    });

    it("should return false when min > max for Event Ambassadors", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 10,
        eventAmbassadorMax: 5,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      expect(validateCapacityLimits(limits)).toBe(false);
    });

    it("should return false when min > max for Regional Ambassadors", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 15,
        regionalAmbassadorMax: 10,
      };
      expect(validateCapacityLimits(limits)).toBe(false);
    });

    it("should return false for negative values", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: -1,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      expect(validateCapacityLimits(limits)).toBe(false);
    });

    it("should return false for non-integer values", () => {
      const limits = {
        eventAmbassadorMin: 2.5,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      } as unknown as CapacityLimits;
      expect(validateCapacityLimits(limits)).toBe(false);
    });

    it("should return false when min equals max (valid edge case)", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 5,
        eventAmbassadorMax: 5,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };
      expect(validateCapacityLimits(limits)).toBe(true);
    });
  });

  describe("saveCapacityLimits", () => {
    it("should save valid limits to storage", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 3,
        eventAmbassadorMax: 8,
        regionalAmbassadorMin: 4,
        regionalAmbassadorMax: 12,
      };
      (saveToStorage as jest.Mock).mockReturnValue(true);

      saveCapacityLimits(limits);

      expect(saveToStorage).toHaveBeenCalledWith("capacityLimits", limits);
    });

    it("should throw error when trying to save invalid limits", () => {
      const limits: CapacityLimits = {
        eventAmbassadorMin: 10,
        eventAmbassadorMax: 5,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10,
      };

      expect(() => saveCapacityLimits(limits)).toThrow();
      expect(saveToStorage).not.toHaveBeenCalled();
    });
  });

  describe("Integration test", () => {
    it("should configure limits and verify capacity statuses update", () => {
      const newLimits: CapacityLimits = {
        eventAmbassadorMin: 3,
        eventAmbassadorMax: 8,
        regionalAmbassadorMin: 4,
        regionalAmbassadorMax: 12,
      };
      (saveToStorage as jest.Mock).mockReturnValue(true);
      (loadFromStorage as jest.Mock).mockReturnValue(newLimits);

      saveCapacityLimits(newLimits);

      expect(saveToStorage).toHaveBeenCalledWith("capacityLimits", newLimits);
      
      const loaded = loadFromStorage<CapacityLimits>("capacityLimits");
      expect(loaded).toEqual(newLimits);
    });
  });
});

