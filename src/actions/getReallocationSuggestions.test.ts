import { getReallocationSuggestions } from "./getReallocationSuggestions";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { CapacityLimits } from "@models/CapacityLimits";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { suggestEventReallocation } from "./suggestReallocation";
import { loadCapacityLimits } from "./checkCapacity";

jest.mock("./suggestReallocation");
jest.mock("./checkCapacity");

describe("getReallocationSuggestions", () => {
  let eventShortName: string;
  let eventTeamsTableData: EventTeamsTableDataMap;
  let eventAmbassadors: EventAmbassadorMap;
  let eventDetails: EventDetailsMap;
  let limits: CapacityLimits;
  let regionalAmbassadors: RegionalAmbassadorMap;

  beforeEach(() => {
    eventShortName = "test-event";

    eventTeamsTableData = new Map();
    eventTeamsTableData.set("test-event", {
      eventShortName: "test-event",
      eventDirectors: "Director 1",
      eventAmbassador: "Current EA",
      regionalAmbassador: "Current REA",
      eventCoordinates: "37.80000° S 144.90000° E",
      eventSeries: 1,
      eventCountryCode: 3,
      eventCountry: "Australia",
    });

    eventAmbassadors = new Map();
    eventAmbassadors.set("Current EA", {
      name: "Current EA",
      events: ["test-event"],
    });

    eventDetails = new Map();
    eventDetails.set("test-event", {
      geometry: {
        coordinates: [144.9, -37.8],
      },
      properties: {
        seriesid: 1,
        countrycode: 3,
      },
    } as import("@models/EventDetails").EventDetails);

    limits = {
      eventAmbassadorMin: 2,
      eventAmbassadorMax: 9,
      regionalAmbassadorMin: 3,
      regionalAmbassadorMax: 10,
    };

    regionalAmbassadors = new Map();

    (loadCapacityLimits as jest.Mock).mockReturnValue(limits);
  });

  it("should find current ambassador from EventTeamsTableData", () => {
    const mockSuggestions = [
      {
        fromAmbassador: "Current EA",
        toAmbassador: "New EA",
        items: ["test-event"],
        score: 85,
        reasons: ["Has available capacity"],
      },
    ];

    (suggestEventReallocation as jest.Mock).mockReturnValue(mockSuggestions);

    const result = getReallocationSuggestions(
      eventShortName,
      eventTeamsTableData,
      eventAmbassadors,
      eventDetails,
      limits,
      regionalAmbassadors,
    );

    expect(suggestEventReallocation).toHaveBeenCalledWith(
      "Current EA",
      ["test-event"],
      eventAmbassadors,
      eventDetails,
      limits,
      regionalAmbassadors,
    );
    expect(result).toEqual(mockSuggestions);
  });

  it("should throw error if event not found in EventTeamsTableData", () => {
    expect(() => {
      getReallocationSuggestions(
        "non-existent-event",
        eventTeamsTableData,
        eventAmbassadors,
        eventDetails,
        limits,
        regionalAmbassadors,
      );
    }).toThrow("Event 'non-existent-event' not found in table data");
  });

  it("should throw error if event has no current ambassador", () => {
    eventTeamsTableData.set("unassigned-event", {
      eventShortName: "unassigned-event",
      eventDirectors: "Director 1",
      eventAmbassador: "",
      regionalAmbassador: "",
      eventCoordinates: "37.80000° S 144.90000° E",
      eventSeries: 1,
      eventCountryCode: 3,
      eventCountry: "Australia",
    });

    expect(() => {
      getReallocationSuggestions(
        "unassigned-event",
        eventTeamsTableData,
        eventAmbassadors,
        eventDetails,
        limits,
        regionalAmbassadors,
      );
    }).toThrow(
      "Event 'unassigned-event' is not currently assigned to any ambassador",
    );
  });

  it("should throw error if current ambassador does not exist in EventAmbassadorMap", () => {
    eventTeamsTableData.set("orphaned-event", {
      eventShortName: "orphaned-event",
      eventDirectors: "Director 1",
      eventAmbassador: "Non-existent EA",
      regionalAmbassador: "",
      eventCoordinates: "37.80000° S 144.90000° E",
      eventSeries: 1,
      eventCountryCode: 3,
      eventCountry: "Australia",
    });

    expect(() => {
      getReallocationSuggestions(
        "orphaned-event",
        eventTeamsTableData,
        eventAmbassadors,
        eventDetails,
        limits,
        regionalAmbassadors,
      );
    }).toThrow("Current ambassador 'Non-existent EA' not found");
  });
});
