import { inferIssueStateRegion } from "./inferIssueStateRegion";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";

describe("inferIssueStateRegion", () => {
  it("prefers the event ambassador state over the regional ambassador state", () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      ["EA 1", { name: "EA 1", events: [], state: "VIC" }],
    ]);
    const regionalAmbassadors: RegionalAmbassadorMap = new Map([
      ["REA 1", { name: "REA 1", state: "NSW", supportsEAs: ["EA 1"] }],
    ]);

    expect(
      inferIssueStateRegion("EA 1", "REA 1", eventAmbassadors, regionalAmbassadors),
    ).toBe("VIC");
  });

  it("falls back to the regional ambassador state", () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      ["EA 1", { name: "EA 1", events: [] }],
    ]);
    const regionalAmbassadors: RegionalAmbassadorMap = new Map([
      ["REA 1", { name: "REA 1", state: "NZ", supportsEAs: ["EA 1"] }],
    ]);

    expect(
      inferIssueStateRegion("EA 1", "REA 1", eventAmbassadors, regionalAmbassadors),
    ).toBe("NZ");
  });
});
