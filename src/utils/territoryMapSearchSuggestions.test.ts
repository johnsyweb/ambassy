import { buildLocalTerritoryMapSearchSuggestions } from "./territoryMapSearchSuggestions";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { ProspectiveEvent } from "@models/ProspectiveEvent";

function eventDetails(shortName: string, longName: string): EventDetailsMap {
  return new Map([
    [
      shortName,
      {
        id: "1",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [144.9631, -37.8136] as [number, number],
        },
        properties: {
          eventname: longName,
          EventLongName: longName,
          EventShortName: shortName,
          LocalisedEventLongName: null,
          countrycode: 0,
          seriesid: 1,
          EventLocation: "Location",
        },
      },
    ],
  ]);
}

describe("buildLocalTerritoryMapSearchSuggestions", () => {
  it("labels unallocated live events in the live events section", () => {
    const suggestions = buildLocalTerritoryMapSearchSuggestions({
      query: "brighton",
      eventDetails: eventDetails("brighton", "Brighton Beach parkrun"),
      eventTeamsTableData: new Map(),
      prospects: [],
      eventAmbassadors: new Map(),
      ambassadorFilter: "",
    });

    expect(suggestions.liveEvents).toEqual([
      expect.objectContaining({
        eventShortName: "brighton",
        label: "Brighton Beach parkrun",
        isUnallocated: true,
        hiddenByAmbassadorFilter: false,
      }),
    ]);
  });

  it("marks allocated events hidden when the ambassador filter excludes them", () => {
    const eventTeamsTableData: EventTeamsTableDataMap = new Map([
      [
        "brighton",
        {
          eventShortName: "brighton",
          eventDirectors: "Director",
          eventAmbassador: "EA Other",
          regionalAmbassador: "REA1",
          eventCoordinates: "",
          eventSeries: 1,
          eventCountryCode: 3,
          eventCountry: "Australia",
        },
      ],
    ]);

    const suggestions = buildLocalTerritoryMapSearchSuggestions({
      query: "brighton",
      eventDetails: eventDetails("brighton", "Brighton Beach parkrun"),
      eventTeamsTableData,
      prospects: [],
      eventAmbassadors: new Map([["EA Other", { name: "EA Other", events: [] }]]),
      ambassadorFilter: "smith",
    });

    expect(suggestions.liveEvents[0]?.hiddenByAmbassadorFilter).toBe(true);
  });

  it("includes prospects without coordinates with a no-location flag", () => {
    const prospects: ProspectiveEvent[] = [
      {
        id: "p1",
        prospectEvent: "Future Brighton parkrun",
        country: "Australia",
        state: "VIC",
        prospectEDs: "Pat",
        eventAmbassador: "EA1",
        courseFound: false,
        landownerPermission: false,
        fundingConfirmed: false,
        dateMadeContact: null,
        geocodingStatus: "pending",
        ambassadorMatchStatus: "pending",
        importTimestamp: 0,
        sourceRow: 1,
      },
    ];

    const suggestions = buildLocalTerritoryMapSearchSuggestions({
      query: "brighton",
      eventDetails: new Map(),
      eventTeamsTableData: new Map(),
      prospects,
      eventAmbassadors: new Map([["EA1", { name: "EA1", events: [] }]]),
      ambassadorFilter: "",
    });

    expect(suggestions.prospectiveEvents).toEqual([
      expect.objectContaining({
        prospectId: "p1",
        hasLocation: false,
      }),
    ]);
  });
});
