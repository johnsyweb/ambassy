import { detectIssues } from "./detectIssues";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetails } from "@models/EventDetails";

describe("detectIssues", () => {
  let eventTeams: EventTeamMap;
  let eventDetails: EventDetailsMap;
  let eventAmbassadors: EventAmbassadorMap;
  let regionalAmbassadors: RegionalAmbassadorMap;

  beforeEach(() => {
    eventTeams = new Map();
    eventDetails = new Map();
    eventAmbassadors = new Map();
    regionalAmbassadors = new Map();

    regionalAmbassadors.set("RA1", {
      name: "RA1",
      state: "VIC",
      supportsEAs: ["EA1"],
    });

    eventAmbassadors.set("EA1", {
      name: "EA1",
      events: ["event1", "event2", "event3"],
    });

    const validEvent: EventDetails = {
      id: "event1",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [144.9631, -37.8136],
      },
      properties: {
        eventname: "Event 1",
        EventLongName: "Event 1",
        EventShortName: "event1",
        LocalisedEventLongName: null,
        countrycode: 13,
        seriesid: 1,
        EventLocation: "Melbourne",
      },
    };

    eventDetails.set("event1", validEvent);
  });

  it("should return empty array when all events have details", () => {
    const validEvent2: EventDetails = {
      id: "event2",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [144.9631, -37.8136],
      },
      properties: {
        eventname: "Event 2",
        EventLongName: "Event 2",
        EventShortName: "event2",
        LocalisedEventLongName: null,
        countrycode: 13,
        seriesid: 1,
        EventLocation: "Melbourne",
      },
    };

    const validEvent3: EventDetails = {
      id: "event3",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [144.9631, -37.8136],
      },
      properties: {
        eventname: "Event 3",
        EventLongName: "Event 3",
        EventShortName: "event3",
        LocalisedEventLongName: null,
        countrycode: 13,
        seriesid: 1,
        EventLocation: "Melbourne",
      },
    };

    eventDetails.set("event2", validEvent2);
    eventDetails.set("event3", validEvent3);

    const issues = detectIssues(
      eventTeams,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors
    );

    expect(issues).toHaveLength(0);
  });

  it("should detect events without coordinates", () => {
    const issues = detectIssues(
      eventTeams,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors
    );

    expect(issues).toHaveLength(2);
    expect(issues[0].eventShortName).toBe("event2");
    expect(issues[0].issueType).toBe("missing_coordinates");
    expect(issues[0].status).toBe("unresolved");
    expect(issues[0].eventAmbassador).toBe("EA1");
    expect(issues[0].regionalAmbassador).toBe("RA1");
  });

  it("should detect events with missing details (invalid coordinates)", () => {
    const invalidEvent: EventDetails = {
      id: "event2",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [] as unknown as [number, number],
      },
      properties: {
        eventname: "Event 2",
        EventLongName: "Event 2",
        EventShortName: "event2",
        LocalisedEventLongName: null,
        countrycode: 13,
        seriesid: 1,
        EventLocation: "Melbourne",
      },
    };

    eventDetails.set("event2", invalidEvent);

    const issues = detectIssues(
      eventTeams,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors
    );

    expect(issues).toHaveLength(2);
    expect(issues.find((i) => i.eventShortName === "event2")?.issueType).toBe(
      "missing_details"
    );
  });

  it("should handle missing Event Ambassador gracefully", () => {
    eventAmbassadors.delete("EA1");

    const issues = detectIssues(
      eventTeams,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors
    );

    expect(issues).toHaveLength(0);
  });

  it("should sort issues by event name", () => {
    eventAmbassadors.set("EA2", {
      name: "EA2",
      events: ["zevent", "aevent"],
    });

    regionalAmbassadors.set("RA2", {
      name: "RA2",
      state: "NSW",
      supportsEAs: ["EA2"],
    });

    const issues = detectIssues(
      eventTeams,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors
    );

    expect(issues.length).toBeGreaterThan(1);
    for (let i = 1; i < issues.length; i++) {
      expect(issues[i].eventShortName >= issues[i - 1].eventShortName).toBe(true);
    }
  });
});
