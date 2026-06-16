import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import {
  expandViewportBounds,
  findUnallocatedEventsInViewport,
  isPointInViewport,
} from "./viewportUnallocatedMarkers";

describe("viewportUnallocatedMarkers", () => {
  const melbourneViewport = {
    minLongitude: 144.5,
    maxLongitude: 145.5,
    minLatitude: -38.5,
    maxLatitude: -37.5,
  };

  it("finds unallocated catalogue events inside the viewport only", () => {
    const eventTeamsTableData: EventTeamsTableDataMap = new Map([
      [
        "allocated",
        {
          eventShortName: "allocated",
          eventDirectors: "Director",
          eventAmbassador: "EA1",
          regionalAmbassador: "REA1",
          eventCoordinates: "",
          eventSeries: 1,
          eventCountryCode: 3,
          eventCountry: "Australia",
        },
      ],
    ]);

    const eventDetails: EventDetailsMap = new Map([
      [
        "allocated",
        {
          id: "1",
          type: "Feature",
          geometry: { type: "Point", coordinates: [144.96, -37.81] },
          properties: {
            eventname: "allocated",
            EventLongName: "Allocated",
            EventShortName: "allocated",
            LocalisedEventLongName: null,
            countrycode: 3,
            seriesid: 1,
            EventLocation: "Melbourne",
          },
        },
      ],
      [
        "nearby-unallocated",
        {
          id: "2",
          type: "Feature",
          geometry: { type: "Point", coordinates: [145.0, -37.9] },
          properties: {
            eventname: "nearby-unallocated",
            EventLongName: "Nearby",
            EventShortName: "nearby-unallocated",
            LocalisedEventLongName: null,
            countrycode: 3,
            seriesid: 1,
            EventLocation: "Melbourne",
          },
        },
      ],
      [
        "distant-unallocated",
        {
          id: "3",
          type: "Feature",
          geometry: { type: "Point", coordinates: [0.1, 51.5] },
          properties: {
            eventname: "distant-unallocated",
            EventLongName: "Distant",
            EventShortName: "distant-unallocated",
            LocalisedEventLongName: null,
            countrycode: 3,
            seriesid: 1,
            EventLocation: "London",
          },
        },
      ],
    ]);

    expect(
      findUnallocatedEventsInViewport(
        eventDetails,
        eventTeamsTableData,
        melbourneViewport,
      ).map((event) => event.eventName),
    ).toEqual(["nearby-unallocated"]);
  });

  it("expands viewport bounds by the configured buffer ratio", () => {
    const expanded = expandViewportBounds(melbourneViewport, 0.1);

    expect(expanded.minLongitude).toBeCloseTo(144.4, 5);
    expect(expanded.maxLongitude).toBeCloseTo(145.6, 5);
    expect(isPointInViewport(-37.45, 145.55, expanded)).toBe(true);
    expect(isPointInViewport(-37.45, 145.55, melbourneViewport)).toBe(false);
  });
});
