import { resolveIssueWithEvent, resolveIssueWithPin } from "./resolveIssue";
import { EventIssue } from "@models/EventIssue";
import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";

describe("resolveIssueWithEvent", () => {
  let issue: EventIssue;
  let eventDetails: EventDetails;
  let eventDetailsMap: EventDetailsMap;

  beforeEach(() => {
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
      resolveIssueWithEvent(issue, invalidEvent, eventDetailsMap);
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

    resolveIssueWithEvent(issue, differentEvent, eventDetailsMap);

    expect(eventDetailsMap.has(issue.eventShortName)).toBe(true);
    expect(eventDetailsMap.has("different-name")).toBe(false);
  });
});

describe("resolveIssueWithPin", () => {
  let issue: EventIssue;
  let eventDetailsMap: EventDetailsMap;

  beforeEach(() => {
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

    resolveIssueWithPin(issue, coordinates, eventDetailsMap);

    const createdEvent = eventDetailsMap.get(issue.eventShortName);
    expect(createdEvent).toBeDefined();
    expect(createdEvent?.geometry.coordinates).toEqual(coordinates);
    expect(createdEvent?.properties.EventShortName).toBe(issue.eventShortName);
  });

  it("should set manualCoordinates flag", () => {
    const coordinates: [number, number] = [144.9631, -37.8136];

    resolveIssueWithPin(issue, coordinates, eventDetailsMap);

    const createdEvent = eventDetailsMap.get(issue.eventShortName);
    expect((createdEvent as any).manualCoordinates).toBe(true);
  });

  it("should throw error for invalid longitude", () => {
    const invalidCoordinates: [number, number] = [200, -37.8136];

    expect(() => {
      resolveIssueWithPin(issue, invalidCoordinates, eventDetailsMap);
    }).toThrow("Invalid coordinates");
  });

  it("should throw error for invalid latitude", () => {
    const invalidCoordinates: [number, number] = [144.9631, -100];

    expect(() => {
      resolveIssueWithPin(issue, invalidCoordinates, eventDetailsMap);
    }).toThrow("Invalid coordinates");
  });

  it("should create minimal EventDetails with required fields", () => {
    const coordinates: [number, number] = [144.9631, -37.8136];

    resolveIssueWithPin(issue, coordinates, eventDetailsMap);

    const createdEvent = eventDetailsMap.get(issue.eventShortName);
    expect(createdEvent?.properties.EventShortName).toBe(issue.eventShortName);
    expect(createdEvent?.properties.eventname).toBe(issue.eventShortName);
    expect(createdEvent?.properties.EventLongName).toBe(issue.eventShortName);
  });
});
