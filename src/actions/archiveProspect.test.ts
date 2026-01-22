import { archiveProspect } from "./archiveProspect";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";

jest.mock("./persistState", () => ({
  persistEventAmbassadors: jest.fn(),
}));

jest.mock("./persistProspectiveEvents", () => ({
  saveProspectiveEvents: jest.fn(),
}));

jest.mock("./checkCapacity", () => ({
  loadCapacityLimits: jest.fn(() => ({
    eventAmbassadorMin: 1,
    eventAmbassadorMax: 10,
    regionalAmbassadorMin: 1,
    regionalAmbassadorMax: 10,
  })),
  calculateAllCapacityStatuses: jest.fn(),
}));

describe("archiveProspect", () => {
  let prospects: ProspectiveEventList;
  let eventAmbassadors: EventAmbassadorMap;
  let regionalAmbassadors: RegionalAmbassadorMap;
  let log: LogEntry[];

  const baseProspect = {
    id: "p1",
    prospectEvent: "Test Prospect",
    country: "AU",
    state: "VIC",
    prospectEDs: "ED",
    eventAmbassador: "EA1",
    courseFound: false,
    landownerPermission: false,
    fundingConfirmed: false,
    dateMadeContact: null,
    coordinates: { latitude: -37.8, longitude: 144.9 },
    geocodingStatus: "success" as const,
    ambassadorMatchStatus: "matched" as const,
    importTimestamp: Date.now(),
    sourceRow: 1,
    notes: "",
  };

  beforeEach(() => {
    prospects = new ProspectiveEventList([baseProspect]);
    eventAmbassadors = new Map([
      [
        "EA1",
        {
          name: "EA1",
          events: [],
          prospectiveEvents: ["p1"],
        },
      ],
    ]);
    regionalAmbassadors = new Map();
    log = [];
    jest.clearAllMocks();
  });

  it("archives a prospect, updates EA prospective list, recalculates capacity, persists and logs", () => {
    archiveProspect(
      "p1",
      prospects,
      eventAmbassadors,
      regionalAmbassadors,
      log,
    );

    expect(prospects.findById("p1")).toBeUndefined();
    expect(eventAmbassadors.get("EA1")?.prospectiveEvents).toEqual([]);

    const { calculateAllCapacityStatuses } = jest.requireMock("./checkCapacity");
    expect(calculateAllCapacityStatuses).toHaveBeenCalled();

    const { saveProspectiveEvents } = jest.requireMock("./persistProspectiveEvents");
    expect(saveProspectiveEvents).toHaveBeenCalled();

    const { persistEventAmbassadors } = jest.requireMock("./persistState");
    expect(persistEventAmbassadors).toHaveBeenCalled();

    expect(log[0]).toBeDefined();
    expect(log[0].type).toBe("Prospect Archived");
    expect(log[0].newValue).toBe("Archived (not viable)");
  });

  it("throws if prospect not found", () => {
    expect(() =>
      archiveProspect(
        "missing",
        prospects,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      ),
    ).toThrow("Prospect with ID 'missing' not found");
  });

  it("logs archive with correct type and 'not viable' wording", () => {
    archiveProspect(
      "p1",
      prospects,
      eventAmbassadors,
      regionalAmbassadors,
      log,
    );

    expect(log[0].type).toBe("Prospect Archived");
    expect(log[0].newValue).toBe("Archived (not viable)");
    expect(log[0].event).toContain("archived (not viable)");
  });

  it("handles prospect without assigned EA correctly in log", () => {
    const prospectWithoutEA = {
      ...baseProspect,
      id: "p2",
      eventAmbassador: "",
    };
    prospects.add(prospectWithoutEA);

    archiveProspect(
      "p2",
      prospects,
      eventAmbassadors,
      regionalAmbassadors,
      log,
    );

    expect(log[0].oldValue).toBe("Unassigned");
    expect(log[0].type).toBe("Prospect Archived");
  });
});
