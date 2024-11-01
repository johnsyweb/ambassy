import { parseEventTeams, EventTeamRow } from "./parseEventTeams";
import { EventTeamMap } from "../models/EventTeamMap";

describe("parseEventTeams", () => {
  it("should handle empty data", () => {
    const data: EventTeamRow[] = [];

    const result: EventTeamMap = parseEventTeams(data);

    expect(result.size).toBe(0);
  });

  it("should parse event teams correctly", () => {
    const data: EventTeamRow[] = [
      {
        Event: "Erinsborough",
        "Event Ambassador": "Helen Daniels",
        "Event Director/s": "Scott",
      },
      { Event: "", "Event Ambassador": "", "Event Director/s": "Charlene" },
      {
        Event: "Summer Bay",
        "Event Ambassador": "Donald Fisher",
        "Event Director/s": "Chloe",
      },
    ];

    const result: EventTeamMap = parseEventTeams(data);

    expect(result.size).toBe(2);

    const event1 = result.get("Erinsborough");
    expect(event1).toBeDefined();
    expect(event1?.eventShortName).toBe("Erinsborough");
    expect(event1?.eventAmbassador).toBe("Helen Daniels");
    expect(event1?.eventDirectors).toEqual(["Scott", "Charlene"]);

    const event2 = result.get("Summer Bay");
    expect(event2).toBeDefined();
    expect(event2?.eventShortName).toBe("Summer Bay");
    expect(event2?.eventAmbassador).toBe("Donald Fisher");
    expect(event2?.eventDirectors).toEqual(["Chloe"]);
  });

  it("should handle empty data", () => {
    const data: EventTeamRow[] = [];

    const result: EventTeamMap = parseEventTeams(data);

    expect(result.size).toBe(0);
  });

  it("should parse event teams correctly", () => {
    const data: EventTeamRow[] = [
      {
        Event: "Erinsborough",
        "Event Ambassador": "Helen Daniels",
        "Event Director/s": "Scott",
      },
      { Event: "", "Event Ambassador": "", "Event Director/s": "Charlene" },
      {
        Event: "Summer Bay",
        "Event Ambassador": "Donald Fisher",
        "Event Director/s": "Chloe",
      },
    ];

    const result: EventTeamMap = parseEventTeams(data);

    expect(result.size).toBe(2);

    const event1 = result.get("Erinsborough");
    expect(event1).toBeDefined();
    expect(event1?.eventShortName).toBe("Erinsborough");
    expect(event1?.eventAmbassador).toBe("Helen Daniels");
    expect(event1?.eventDirectors).toEqual(["Scott", "Charlene"]);

    const event2 = result.get("Summer Bay");
    expect(event2).toBeDefined();
    expect(event2?.eventShortName).toBe("Summer Bay");
    expect(event2?.eventAmbassador).toBe("Donald Fisher");
    expect(event2?.eventDirectors).toEqual(["Chloe"]);
  });

  it("should handle data with missing event directors", () => {
    const data: EventTeamRow[] = [
      {
        Event: "Erinsborough",
        "Event Ambassador": "Helen Daniels",
        "Event Director/s": "",
      },
    ];

    const result: EventTeamMap = parseEventTeams(data);

    expect(result.size).toBe(1);

    const event1 = result.get("Erinsborough");
    expect(event1).toBeDefined();
    expect(event1?.eventShortName).toBe("Erinsborough");
    expect(event1?.eventAmbassador).toBe("Helen Daniels");
    expect(event1?.eventDirectors).toEqual([]);
  });

  it("should handle multiple directors for a single event", () => {
    const data: EventTeamRow[] = [
      {
        Event: "Erinsborough",
        "Event Ambassador": "Helen Daniels",
        "Event Director/s": "Scott",
      },
      { Event: "", "Event Ambassador": "", "Event Director/s": "Charlene" },
      { Event: "", "Event Ambassador": "", "Event Director/s": "Mike" },
    ];

    const result: EventTeamMap = parseEventTeams(data);

    expect(result.size).toBe(1);

    const event1 = result.get("Erinsborough");
    expect(event1).toBeDefined();
    expect(event1?.eventShortName).toBe("Erinsborough");
    expect(event1?.eventAmbassador).toBe("Helen Daniels");
    expect(event1?.eventDirectors).toEqual(["Scott", "Charlene", "Mike"]);
  });

  it("should handle data with missing event names", () => {
    const data: EventTeamRow[] = [
      {
        Event: "",
        "Event Ambassador": "Helen Daniels",
        "Event Director/s": "Scott",
      },
    ];

    expect(() => parseEventTeams(data)).toThrow();
  });
});
