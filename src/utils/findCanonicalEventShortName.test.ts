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
});
