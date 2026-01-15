import { allocateEventFromMap } from "./allocateEventFromMap";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";
import { assignEventToAmbassador } from "./assignEventToAmbassador";
import { getRegionalAmbassadorForEventAmbassador } from "@utils/regions";

jest.mock("./assignEventToAmbassador");
jest.mock("@utils/regions");

describe("allocateEventFromMap", () => {
  let eventAmbassadors: EventAmbassadorMap;
  let regionalAmbassadors: RegionalAmbassadorMap;
  let eventTeams: EventTeamMap;
  let eventDetails: EventDetailsMap;
  let log: LogEntry[];

  beforeEach(() => {
    eventAmbassadors = new Map();
    eventAmbassadors.set("EA1", {
      name: "EA1",
      events: [],
      state: "VIC",
      regionalAmbassador: "REA1",
    });

    regionalAmbassadors = new Map();
    regionalAmbassadors.set("REA1", {
      name: "REA1",
      state: "VIC",
      supportsEAs: ["EA1"],
    });

    eventTeams = new Map();
    eventTeams.set("event1", {
      eventShortName: "event1",
      eventAmbassador: "",
      eventDirectors: ["Director1", "Director2"],
    });

    eventDetails = new Map();
    eventDetails.set("event1", {
      id: "1",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [144.9631, -37.8136],
      },
      properties: {
        eventname: "Event 1",
        EventLongName: "Event 1 Long Name",
        EventShortName: "event1",
        LocalisedEventLongName: null,
        countrycode: 0,
        seriesid: 1,
        EventLocation: "Location 1",
      },
    });

    log = [];

    (getRegionalAmbassadorForEventAmbassador as jest.Mock).mockReturnValue("REA1");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should allocate event to Event Ambassador", () => {
    allocateEventFromMap(
      "event1",
      "EA1",
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      eventDetails,
      log
    );

    expect(assignEventToAmbassador).toHaveBeenCalledWith(
      "event1",
      "",
      "EA1",
      eventAmbassadors,
      log,
      regionalAmbassadors
    );
  });

  it("should throw error if Event Ambassador not found", () => {
    expect(() => {
      allocateEventFromMap(
        "event1",
        "NonExistentEA",
        eventAmbassadors,
        regionalAmbassadors,
        eventTeams,
        eventDetails,
        log
      );
    }).toThrow('Event Ambassador "NonExistentEA" not found');
  });

  it("should throw error if event not found in eventDetails", () => {
    expect(() => {
      allocateEventFromMap(
        "NonExistentEvent",
        "EA1",
        eventAmbassadors,
        regionalAmbassadors,
        eventTeams,
        eventDetails,
        log
      );
    }).toThrow('Event "NonExistentEvent" not found in eventDetails');
  });

  it("should determine REA from EA's hierarchy", () => {
    allocateEventFromMap(
      "event1",
      "EA1",
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      eventDetails,
      log
    );

    expect(getRegionalAmbassadorForEventAmbassador).toHaveBeenCalledWith(
      "EA1",
      regionalAmbassadors
    );
  });

  it("should log allocation change", () => {
    allocateEventFromMap(
      "event1",
      "EA1",
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      eventDetails,
      log
    );

    expect(assignEventToAmbassador).toHaveBeenCalled();
    expect(log.length).toBeGreaterThan(0);
  });
});
