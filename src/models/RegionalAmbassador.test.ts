import { RegionalAmbassador } from "./RegionalAmbassador";

describe("RegionalAmbassador", () => {
  describe("eventsForReallocation fields", () => {
    it("should allow eventsForReallocation field to be optional", () => {
      const ambassador: RegionalAmbassador = {
        name: "Test REA",
        state: "VIC",
        supportsEAs: [],
      };

      expect(ambassador.eventsForReallocation).toBeUndefined();
      expect(ambassador.prospectiveEventsForReallocation).toBeUndefined();
      expect(ambassador.name).toBe("Test REA");
    });

    it("should allow eventsForReallocation field to be set", () => {
      const ambassador: RegionalAmbassador = {
        name: "Test REA",
        state: "VIC",
        supportsEAs: [],
        eventsForReallocation: ["event1", "event2"],
      };

      expect(ambassador.eventsForReallocation).toEqual(["event1", "event2"]);
    });

    it("should allow prospectiveEventsForReallocation field to be set", () => {
      const ambassador: RegionalAmbassador = {
        name: "Test REA",
        state: "VIC",
        supportsEAs: [],
        prospectiveEventsForReallocation: ["prospect1", "prospect2"],
      };

      expect(ambassador.prospectiveEventsForReallocation).toEqual([
        "prospect1",
        "prospect2",
      ]);
    });

    it("should work with all existing fields", () => {
      const ambassador: RegionalAmbassador = {
        name: "Test REA",
        state: "NSW",
        supportsEAs: ["EA1", "EA2"],
        eventsForReallocation: ["event1"],
        prospectiveEventsForReallocation: ["prospect1"],
      };

      expect(ambassador.name).toBe("Test REA");
      expect(ambassador.state).toBe("NSW");
      expect(ambassador.supportsEAs).toEqual(["EA1", "EA2"]);
      expect(ambassador.eventsForReallocation).toEqual(["event1"]);
      expect(ambassador.prospectiveEventsForReallocation).toEqual([
        "prospect1",
      ]);
    });
  });
});
