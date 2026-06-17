import { searchProspectiveEvents } from "./searchProspectiveEvents";
import { ProspectiveEvent } from "@models/ProspectiveEvent";

function prospect(
  overrides: Partial<ProspectiveEvent> = {},
): ProspectiveEvent {
  return {
    id: "p1",
    prospectEvent: "Future parkrun",
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
    ...overrides,
  };
}

describe("searchProspectiveEvents", () => {
  it("returns an empty list for a blank query", () => {
    expect(searchProspectiveEvents("", [prospect()])).toEqual([]);
  });

  it("matches prospective events by name substring", () => {
    const results = searchProspectiveEvents("future", [
      prospect({ id: "p1", prospectEvent: "Future parkrun" }),
      prospect({ id: "p2", prospectEvent: "Ballarat parkrun" }),
    ]);

    expect(results.map((entry) => entry.id)).toEqual(["p1"]);
  });
});
