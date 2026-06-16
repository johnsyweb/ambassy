import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { findUniqueAmbassadorByProfileDisplayName } from "./matchAmbassadorByProfileDisplayName";

describe("findUniqueAmbassadorByProfileDisplayName", () => {
  it("matches one ambassador when the profile display name normalises to the same full string", () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      ["Alex Sample", { name: "Alex Sample", events: [] }],
    ]);
    const regionalAmbassadors: RegionalAmbassadorMap = new Map();

    expect(
      findUniqueAmbassadorByProfileDisplayName(
        "Alex  SAMPLE",
        eventAmbassadors,
        regionalAmbassadors,
      ),
    ).toEqual({ role: "ea", name: "Alex Sample" });
  });

  it("does not match when normalised names differ", () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      ["Samuel Taylor", { name: "Samuel Taylor", events: [] }],
    ]);
    const regionalAmbassadors: RegionalAmbassadorMap = new Map();

    expect(
      findUniqueAmbassadorByProfileDisplayName(
        "Sam TAYLOR",
        eventAmbassadors,
        regionalAmbassadors,
      ),
    ).toBeNull();
  });

  it("does not pre-select when the profile display name matches more than one ambassador", () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      ["Alex Sample", { name: "Alex Sample", events: [] }],
    ]);
    const regionalAmbassadors: RegionalAmbassadorMap = new Map([
      [
        "Alex Sample",
        { name: "Alex Sample", state: "QLD", supportsEAs: ["Example EA"] },
      ],
    ]);

    expect(
      findUniqueAmbassadorByProfileDisplayName(
        "ALEX SAMPLE",
        eventAmbassadors,
        regionalAmbassadors,
      ),
    ).toBeNull();
  });
});
