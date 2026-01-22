import { findMatchingEvents } from "./findMatchingEvents";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { EventDetailsMap } from "@models/EventDetailsMap";

describe("findMatchingEvents", () => {
  const makeEvent = (
    shortName: string,
    lat: number,
    lng: number,
    longName = shortName,
  ) => ({
    id: shortName,
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [lng, lat] as [number, number],
    },
    properties: {
      eventname: shortName.toLowerCase(),
      EventShortName: shortName,
      EventLongName: longName,
      LocalisedEventLongName: null,
      countrycode: 1,
      seriesid: 1,
      EventLocation: "",
    },
  });

  let eventDetails: EventDetailsMap;
  let prospectWithCoords: ProspectiveEvent;
  let prospectWithoutCoords: ProspectiveEvent;

  beforeEach(() => {
    eventDetails = new Map();
    eventDetails.set("nearby-event", makeEvent("Nearby Event", -37.8, 144.9));
    eventDetails.set("far-event", makeEvent("Far Event", -33.8, 151.0));
    prospectWithCoords = {
      id: "p1",
      prospectEvent: "Nearby Event",
      country: "AU",
      state: "VIC",
      prospectEDs: "ED",
      eventAmbassador: "EA1",
      courseFound: false,
      landownerPermission: false,
      fundingConfirmed: false,
      dateMadeContact: null,
      coordinates: {
        latitude: -37.81,
        longitude: 144.96,
      },
      geocodingStatus: "success",
      ambassadorMatchStatus: "matched",
      importTimestamp: Date.now(),
      sourceRow: 1,
      notes: "",
    };
    prospectWithoutCoords = {
      ...prospectWithCoords,
      coordinates: undefined,
    };
  });

  it("returns matches by name when no coordinates", () => {
    const results = findMatchingEvents(prospectWithoutCoords, eventDetails, 50);
    expect(results.length).toBe(1);
    expect(results[0].properties.EventShortName).toBe("Nearby Event");
  });

  it("filters by distance when coordinates are present", () => {
    const results = findMatchingEvents(prospectWithCoords, eventDetails, 50);
    expect(results.length).toBe(1);
    expect(results[0].properties.EventShortName).toBe("Nearby Event");
  });

  it("returns empty when no events are within distance", () => {
    const results = findMatchingEvents(prospectWithCoords, eventDetails, 5);
    expect(results.length).toBe(0);
  });

  it("sorts by distance ascending", () => {
    // Add another close event slightly nearer
    eventDetails.set("closest-event", makeEvent("Closest Event", -37.82, 144.95));
    prospectWithCoords.prospectEvent = "Event";
    const results = findMatchingEvents(prospectWithCoords, eventDetails, 50);
    expect(results.length).toBe(2);
    expect(results[0].properties.EventShortName).toBe("Closest Event");
    expect(results[1].properties.EventShortName).toBe("Nearby Event");
  });
});
