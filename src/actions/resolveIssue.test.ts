import { resolveIssueWithEvent, resolveIssueWithPin } from "./resolveIssue";
import { EventIssue } from "@models/EventIssue";
import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";

describe("resolveIssueWithEvent", () => {
  let issue: EventIssue;
  let eventDetails: EventDetails;
  let eventDetailsMap: EventDetailsMap;
  let log: LogEntry[];

  beforeEach(() => {
    log = [];
    issue = {
      eventShortName: "missing-event",
      eventAmbassador: "EA1",
      regionalAmbassador: "RA1",
      issueType: "missing_coordinates",
      status: "unresolved",
    };

    eventDetails = {
      id: "found-event",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [144.9631, -37.8136],
      },
      properties: {
        eventname: "Found Event",
        EventLongName: "Found Event",
        EventShortName: "missing-event",
        LocalisedEventLongName: null,
        countrycode: 13,
        seriesid: 1,
        EventLocation: "Melbourne",
      },
    };

    eventDetailsMap = new Map<string, EventDetails>();
  });

  it("should add event to eventDetailsMap", () => {
    resolveIssueWithEvent(issue, eventDetails, eventDetailsMap);

    expect(eventDetailsMap.has(issue.eventShortName)).toBe(true);
    expect(eventDetailsMap.get(issue.eventShortName)).toEqual(eventDetails);
  });

  it("should throw error if eventDetails is missing coordinates", () => {
    const invalidEvent: EventDetails = {
      ...eventDetails,
      geometry: {
        type: "Point",
        coordinates: [] as unknown as [number, number],
      },
    };

    expect(() => {
      resolveIssueWithEvent(issue, invalidEvent, eventDetailsMap, log);
    }).toThrow("Event details must have valid coordinates");
  });

  it("should use issue eventShortName as key even if EventShortName differs", () => {
    const differentEvent: EventDetails = {
      ...eventDetails,
      properties: {
        ...eventDetails.properties,
        EventShortName: "different-name",
      },
    };

    resolveIssueWithEvent(issue, differentEvent, eventDetailsMap, log);

    expect(eventDetailsMap.has(issue.eventShortName)).toBe(true);
    expect(eventDetailsMap.has("different-name")).toBe(false);
  });
});

describe("resolveIssueWithPin", () => {
  let issue: EventIssue;
  let eventDetailsMap: EventDetailsMap;
  let log: LogEntry[];

  beforeEach(() => {
    log = [];
    issue = {
      eventShortName: "missing-event",
      eventAmbassador: "EA1",
      regionalAmbassador: "RA1",
      issueType: "missing_coordinates",
      status: "unresolved",
    };

    eventDetailsMap = new Map<string, EventDetails>();
  });

  it("should create EventDetails with manual coordinates", () => {
    const coordinates: [number, number] = [144.9631, -37.8136];

    resolveIssueWithPin(issue, coordinates, eventDetailsMap, log);

    const createdEvent = eventDetailsMap.get(issue.eventShortName);
    expect(createdEvent).toBeDefined();
    expect(createdEvent?.geometry.coordinates).toEqual(coordinates);
    expect(createdEvent?.properties.EventShortName).toBe(issue.eventShortName);
  });

  it("should set manualCoordinates flag", () => {
    const coordinates: [number, number] = [144.9631, -37.8136];

    resolveIssueWithPin(issue, coordinates, eventDetailsMap, log);

    const createdEvent = eventDetailsMap.get(issue.eventShortName);
    expect((createdEvent as any).manualCoordinates).toBe(true);
  });

  it("should log resolution to changes log", () => {
    const coordinates: [number, number] = [144.9631, -37.8136];

    resolveIssueWithPin(issue, coordinates, eventDetailsMap, log);

    expect(log.length).toBe(1);
    expect(log[0].type).toBe("Issue Resolved");
    expect(log[0].event).toBe(issue.eventShortName);
    expect(log[0].oldValue).toBe("Missing coordinates");
    expect(log[0].newValue).toContain("Manual pin placement");
    expect(log[0].newValue).toContain("-37.8136");
    expect(log[0].newValue).toContain("144.9631");
  });

  it("should throw error for invalid longitude", () => {
    const invalidCoordinates: [number, number] = [200, -37.8136];

    expect(() => {
      resolveIssueWithPin(issue, invalidCoordinates, eventDetailsMap, log);
    }).toThrow("Invalid coordinates");
  });

  it("should throw error for invalid latitude", () => {
    const invalidCoordinates: [number, number] = [144.9631, -100];

    expect(() => {
      resolveIssueWithPin(issue, invalidCoordinates, eventDetailsMap, log);
    }).toThrow("Invalid coordinates");
  });

  it("should create minimal EventDetails with required fields", () => {
    const coordinates: [number, number] = [144.9631, -37.8136];

    resolveIssueWithPin(issue, coordinates, eventDetailsMap, log);

    const createdEvent = eventDetailsMap.get(issue.eventShortName);
    expect(createdEvent?.properties.EventShortName).toBe(issue.eventShortName);
    expect(createdEvent?.properties.eventname).toBe(issue.eventShortName);
    expect(createdEvent?.properties.EventLongName).toBe(issue.eventShortName);
  });
});
