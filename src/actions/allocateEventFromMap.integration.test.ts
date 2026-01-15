import { allocateEventFromMap } from "./allocateEventFromMap";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";
import { extractEventTeamsTableData } from "@models/EventTeamsTable";

describe("allocateEventFromMap integration", () => {
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
      eventDirectors: ["Director1"],
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
  });

  it("should allocate event and appear in eventTeamsTableData", () => {
    allocateEventFromMap(
      "event1",
      "EA1",
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      eventDetails,
      log
    );

    const eventTeamsTableData = extractEventTeamsTableData(
      regionalAmbassadors,
      eventAmbassadors,
      eventTeams,
      eventDetails
    );

    expect(eventTeamsTableData.has("event1")).toBe(true);
    const eventData = eventTeamsTableData.get("event1");
    expect(eventData).toBeDefined();
    expect(eventData?.eventAmbassador).toBe("EA1");
    expect(eventData?.regionalAmbassador).toBe("REA1");
    expect(eventData?.eventDirectors).toBe("Director1");
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

    const allocationLog = log.find((entry) => entry.type === "allocate event from map");
    expect(allocationLog).toBeDefined();
    expect(allocationLog?.event).toBe("event1");
    expect(allocationLog?.newValue).toBe("EA1");

    const reaLog = log.find(
      (entry) => entry.type === "assign event ambassador to regional ambassador"
    );
    expect(reaLog).toBeDefined();
    expect(reaLog?.newValue).toBe("REA1");
  });

  it("should add event to EA's events array", () => {
    allocateEventFromMap(
      "event1",
      "EA1",
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      eventDetails,
      log
    );

    const ea = eventAmbassadors.get("EA1");
    expect(ea).toBeDefined();
    expect(ea?.events).toContain("event1");
  });

  it("should include Event Directors in eventTeamsTableData after allocation", () => {
    allocateEventFromMap(
      "event1",
      "EA1",
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      eventDetails,
      log
    );

    const eventTeamsTableData = extractEventTeamsTableData(
      regionalAmbassadors,
      eventAmbassadors,
      eventTeams,
      eventDetails
    );

    const eventData = eventTeamsTableData.get("event1");
    expect(eventData?.eventDirectors).toBe("Director1");
  });

  it("should update map view after allocation", () => {
    allocateEventFromMap(
      "event1",
      "EA1",
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      eventDetails,
      log
    );

    const eventTeamsTableData = extractEventTeamsTableData(
      regionalAmbassadors,
      eventAmbassadors,
      eventTeams,
      eventDetails
    );

    expect(eventTeamsTableData.has("event1")).toBe(true);
    const eventData = eventTeamsTableData.get("event1");
    expect(eventData?.eventAmbassador).toBe("EA1");
    expect(eventData?.regionalAmbassador).toBe("REA1");
  });
});
