import { findEventShortNameBySlug } from "./findEventShortNameBySlug";
import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";

function greenheartEvent(): EventDetails {
  return {
    id: "greenheartrobinaparklands",
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [153.38233, -28.06302],
    },
    properties: {
      eventname: "greenheartrobinaparklands",
      EventLongName: "Greenheart Robina Parklands parkrun",
      EventShortName: "Greenheart Robina Parklands",
      LocalisedEventLongName: null,
      countrycode: 3,
      seriesid: 1,
      EventLocation: "Robina",
    },
  };
}

describe("findEventShortNameBySlug", () => {
  it("returns the EventShortName for a matching eventname slug", () => {
    const eventDetails: EventDetailsMap = new Map([
      ["Greenheart Robina Parklands", greenheartEvent()],
    ]);

    expect(
      findEventShortNameBySlug("greenheartrobinaparklands", eventDetails),
    ).toBe("Greenheart Robina Parklands");
  });
});
