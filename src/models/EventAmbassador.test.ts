import { EventAmbassador } from "./EventAmbassador";

describe("EventAmbassador", () => {
  describe("state field", () => {
    it("should allow state field to be optional for backward compatibility", () => {
      const ambassador: EventAmbassador = {
        name: "Test EA",
        events: [],
      };

      expect(ambassador.state).toBeUndefined();
      expect(ambassador.name).toBe("Test EA");
    });

    it("should allow state field to be set", () => {
      const ambassador: EventAmbassador = {
        name: "Test EA",
        events: [],
        state: "VIC",
      };

      expect(ambassador.state).toBe("VIC");
    });

    it("should work with all existing fields", () => {
      const ambassador: EventAmbassador = {
        name: "Test EA",
        events: ["event1", "event2"],
        prospectiveEvents: ["prospect1"],
        regionalAmbassador: "Test REA",
        state: "NSW",
      };

      expect(ambassador.name).toBe("Test EA");
      expect(ambassador.events).toEqual(["event1", "event2"]);
      expect(ambassador.prospectiveEvents).toEqual(["prospect1"]);
      expect(ambassador.regionalAmbassador).toBe("Test REA");
      expect(ambassador.state).toBe("NSW");
    });
  });
});
