import { calculateHomeParkrunBonus } from "./homeParkrunBonus";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventDetails } from "@models/EventDetails";

function eventAt(
  shortName: string,
  coordinates: [number, number],
): EventDetails {
  return {
    id: shortName,
    type: "Feature",
    geometry: { type: "Point", coordinates },
    properties: {
      eventname: shortName.toLowerCase().replace(/\s+/g, ""),
      EventLongName: `${shortName} parkrun`,
      EventShortName: shortName,
      LocalisedEventLongName: null,
      countrycode: 3,
      seriesid: 1,
      EventLocation: "",
    },
  };
}

describe("calculateHomeParkrunBonus", () => {
  const eventDetails: EventDetailsMap = new Map([
    [
      "Jamestown Golf Course",
      eventAt("Jamestown Golf Course", [138.561957, -33.228546]),
    ],
    ["Near Jamestown", eventAt("Near Jamestown", [138.57, -33.23])],
    ["Far Away", eventAt("Far Away", [144.9631, -37.8136])],
  ]);

  it("returns no bonus when home parkrun is not set", () => {
    expect(
      calculateHomeParkrunBonus(undefined, ["Near Jamestown"], eventDetails),
    ).toBeNull();
  });

  it("returns decaying bonus within 50km", () => {
    const result = calculateHomeParkrunBonus(
      "Jamestown Golf Course",
      ["Near Jamestown"],
      eventDetails,
    );

    expect(result).not.toBeNull();
    expect(result!.bonus).toBeGreaterThan(400);
    expect(result!.distanceKm).toBeLessThan(5);
  });

  it("returns zero bonus beyond 50km", () => {
    const result = calculateHomeParkrunBonus(
      "Jamestown Golf Course",
      ["Far Away"],
      eventDetails,
    );

    expect(result).toBeNull();
  });
});
