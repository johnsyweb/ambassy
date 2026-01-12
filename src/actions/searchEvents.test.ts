import { searchEvents } from "./searchEvents";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventDetails } from "@models/EventDetails";

describe("searchEvents", () => {
  let events: EventDetailsMap;

  beforeEach(() => {
    events = new Map<string, EventDetails>();

    const event1: EventDetails = {
      id: "event1",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [144.9631, -37.8136],
      },
      properties: {
        eventname: "Event One",
        EventLongName: "Event One",
        EventShortName: "event1",
        LocalisedEventLongName: null,
        countrycode: 13,
        seriesid: 1,
        EventLocation: "Melbourne",
      },
    };

    const event2: EventDetails = {
      id: "event2",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [151.2093, -33.8688],
      },
      properties: {
        eventname: "Event Two",
        EventLongName: "Event Two (not currently operating)",
        EventShortName: "event2",
        LocalisedEventLongName: "Event Two Localised",
        countrycode: 13,
        seriesid: 1,
        EventLocation: "Sydney",
      },
    };

    const event3: EventDetails = {
      id: "event3",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [153.0251, -27.4698],
      },
      properties: {
        eventname: "Event Three",
        EventLongName: "Event Three",
        EventShortName: "event3",
        LocalisedEventLongName: null,
        countrycode: 13,
        seriesid: 1,
        EventLocation: "Brisbane",
      },
    };

    events.set("event1", event1);
    events.set("event2", event2);
    events.set("event3", event3);
  });

  it("should return empty array for empty query", () => {
    const results = searchEvents("", events);
    expect(results).toEqual([]);
  });

  it("should return empty array when no matches found", () => {
    const results = searchEvents("nonexistent", events);
    expect(results).toEqual([]);
  });

  it("should find exact match by EventShortName", () => {
    const results = searchEvents("event1", events);
    expect(results).toHaveLength(1);
    expect(results[0].properties.EventShortName).toBe("event1");
  });

  it("should find exact match by EventLongName", () => {
    const results = searchEvents("Event One", events);
    expect(results).toHaveLength(1);
    expect(results[0].properties.EventShortName).toBe("event1");
  });

  it("should find exact match by eventname", () => {
    const results = searchEvents("Event One", events);
    expect(results).toHaveLength(1);
    expect(results[0].properties.eventname).toBe("Event One");
  });

  it("should find match by LocalisedEventLongName", () => {
    const results = searchEvents("Event Two Localised", events);
    expect(results).toHaveLength(1);
    expect(results[0].properties.EventShortName).toBe("event2");
  });

  it("should handle case-insensitive matching", () => {
    const results = searchEvents("EVENT ONE", events);
    expect(results).toHaveLength(1);
    expect(results[0].properties.EventShortName).toBe("event1");
  });

  it("should handle normalized matching (remove parentheses)", () => {
    const results = searchEvents("Event Two not currently operating", events);
    expect(results.length).toBeGreaterThan(0);
    const event2Result = results.find((r) => r.properties.EventShortName === "event2");
    expect(event2Result).toBeDefined();
  });

  it("should find fuzzy matches for typos", () => {
    const results = searchEvents("evnt1", events);
    expect(results.length).toBeGreaterThan(0);
    const event1Result = results.find((r) => r.properties.EventShortName === "event1");
    expect(event1Result).toBeDefined();
  });

  it("should return results sorted by match quality (exact first)", () => {
    const results = searchEvents("event", events);
    expect(results.length).toBeGreaterThan(1);
    const exactMatch = results.find((r) => r.properties.EventShortName === "event1");
    expect(exactMatch).toBeDefined();
    expect(results[0].properties.EventShortName).toBe("event1");
  });

  it("should limit results to top 10", () => {
    const manyEvents = new Map<string, EventDetails>();
    for (let i = 0; i < 15; i++) {
      const event: EventDetails = {
        id: `event${i}`,
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [144.9631, -37.8136],
        },
        properties: {
          eventname: `Event ${i}`,
          EventLongName: `Event ${i}`,
          EventShortName: `event${i}`,
          LocalisedEventLongName: null,
          countrycode: 13,
          seriesid: 1,
          EventLocation: "Melbourne",
        },
      };
      manyEvents.set(`event${i}`, event);
    }

    const results = searchEvents("event", manyEvents);
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it("should handle partial matches", () => {
    const results = searchEvents("One", events);
    expect(results.length).toBeGreaterThan(0);
    const event1Result = results.find((r) => r.properties.EventShortName === "event1");
    expect(event1Result).toBeDefined();
  });
});
