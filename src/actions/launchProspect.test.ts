import { launchProspect } from "./launchProspect";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";
import { EventDetailsMap } from "@models/EventDetailsMap";

jest.mock("./assignEventToAmbassador", () => ({
  assignEventToAmbassador: jest.fn(),
}));

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

describe("launchProspect", () => {
  let prospects: ProspectiveEventList;
  let eventAmbassadors: EventAmbassadorMap;
  let regionalAmbassadors: RegionalAmbassadorMap;
  let log: LogEntry[];
  let eventDetails: EventDetailsMap;

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
      [
        "EA2",
        {
          name: "EA2",
          events: [],
          prospectiveEvents: [],
        },
      ],
    ]);
    regionalAmbassadors = new Map();
    log = [];
    eventDetails = new Map();
    eventDetails.set("Event A", {
      id: "Event A",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [144.9, -37.8],
      },
      properties: {
        eventname: "event-a",
        EventShortName: "Event A",
        EventLongName: "Event A",
        LocalisedEventLongName: null,
        countrycode: 1,
        seriesid: 1,
        EventLocation: "Test",
      },
    });
    jest.clearAllMocks();
  });

  it("removes prospect, updates EA prospective list, recalculates capacity, and logs launch", () => {
    launchProspect(
      "p1",
      prospects,
      eventAmbassadors,
      regionalAmbassadors,
      eventDetails,
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
    expect(log[0].type).toBe("Prospect Launched");
  });

  it("allocates selected event to selected EA when provided", () => {
    launchProspect(
      "p1",
      prospects,
      eventAmbassadors,
      regionalAmbassadors,
      eventDetails,
      log,
      "Event A",
      "EA2",
    );

    const { assignEventToAmbassador } = jest.requireMock("./assignEventToAmbassador");
    expect(assignEventToAmbassador).toHaveBeenCalledWith(
      "Event A",
      "",
      "EA2",
      eventAmbassadors,
      log,
      regionalAmbassadors,
    );
  });

  it("throws if prospect not found", () => {
    expect(() =>
      launchProspect(
        "missing",
        prospects,
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        log,
      ),
    ).toThrow("Prospect with ID 'missing' not found");
  });

  it("throws if selected event not in eventDetails", () => {
    expect(() =>
      launchProspect(
        "p1",
        prospects,
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        log,
        "Missing Event",
        "EA1",
      ),
    ).toThrow("Event 'Missing Event' not found");
  });

  it("throws if selected EA does not exist", () => {
    expect(() =>
      launchProspect(
        "p1",
        prospects,
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        log,
        "Event A",
        "UnknownEA",
      ),
    ).toThrow("Event Ambassador 'UnknownEA' not found");
  });
});
