import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { findCanonicalEventShortName } from "./findCanonicalEventShortName";

function albertMelbourneEvent(): EventDetails {
  return {
    id: "albertmelbourne",
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [144.9631, -37.8136],
    },
    properties: {
      eventname: "albertmelbourne",
      EventLongName: "Albert Melbourne parkrun",
      EventShortName: "Albert Melbourne",
      LocalisedEventLongName: null,
      countrycode: 3,
      seriesid: 1,
      EventLocation: "Melbourne",
    },
  };
}

describe("findCanonicalEventShortName", () => {
  it("returns the events.json EventShortName when a comma variant is given", () => {
    const eventDetails: EventDetailsMap = new Map([
      ["Albert Melbourne", albertMelbourneEvent()],
    ]);

    expect(findCanonicalEventShortName("Albert, Melbourne", eventDetails)).toBe(
      "Albert Melbourne",
    );
  });

  it("returns undefined when no live parkrun matches", () => {
    const eventDetails: EventDetailsMap = new Map([
      ["Albert Melbourne", albertMelbourneEvent()],
    ]);

    expect(
      findCanonicalEventShortName("Unknown Event", eventDetails),
    ).toBeUndefined();
  });

  it("returns undefined when normalised matching is ambiguous", () => {
    const eventDetails: EventDetailsMap = new Map([
      [
        "Foo Bar",
        {
          ...albertMelbourneEvent(),
          properties: {
            ...albertMelbourneEvent().properties,
            EventShortName: "Foo Bar",
          },
        },
      ],
      [
        "Foo, Bar",
        {
          ...albertMelbourneEvent(),
          properties: {
            ...albertMelbourneEvent().properties,
            EventShortName: "Foo, Bar",
          },
        },
      ],
    ]);

    expect(
      findCanonicalEventShortName("Foo  Bar", eventDetails),
    ).toBeUndefined();
  });

  it("returns the canonical name when the CSV adds a location after a comma", () => {
    const eventDetails: EventDetailsMap = new Map([
      [
        "Hamilton Park",
        {
          ...albertMelbourneEvent(),
          properties: {
            ...albertMelbourneEvent().properties,
            EventShortName: "Hamilton Park",
            EventLongName: "Hamilton Park parkrun, Gore",
          },
        },
      ],
    ]);

    expect(
      findCanonicalEventShortName("Hamilton Park, Gore", eventDetails),
    ).toBe("Hamilton Park");
  });

  it("returns the canonical name when the CSV includes a parkrun suffix", () => {
    const eventDetails: EventDetailsMap = new Map([
      [
        "Ōamaru Public Gardens",
        {
          ...albertMelbourneEvent(),
          properties: {
            ...albertMelbourneEvent().properties,
            EventShortName: "Ōamaru Public Gardens",
            EventLongName: "Ōamaru Public Gardens parkrun",
          },
        },
      ],
    ]);

    expect(
      findCanonicalEventShortName(
        "Ōamaru Public Gardens parkrun",
        eventDetails,
      ),
    ).toBe("Ōamaru Public Gardens");
  });

  it("returns the canonical name when macrons differ from events.json", () => {
    const eventDetails: EventDetailsMap = new Map([
      [
        "Ōpaheke Park",
        {
          ...albertMelbourneEvent(),
          properties: {
            ...albertMelbourneEvent().properties,
            EventShortName: "Ōpaheke Park",
            EventLongName: "Ōpaheke Park parkrun",
          },
        },
      ],
    ]);

    expect(findCanonicalEventShortName("Opaheke Park", eventDetails)).toBe(
      "Ōpaheke Park",
    );
  });

  it("prefers a full-name match over a comma-prefix match", () => {
    const eventDetails: EventDetailsMap = new Map([
      ["Albert", albertMelbourneEvent()],
      [
        "Albert Melbourne",
        {
          ...albertMelbourneEvent(),
          properties: {
            ...albertMelbourneEvent().properties,
            EventShortName: "Albert Melbourne",
          },
        },
      ],
    ]);

    expect(findCanonicalEventShortName("Albert, Melbourne", eventDetails)).toBe(
      "Albert Melbourne",
    );
  });
});
