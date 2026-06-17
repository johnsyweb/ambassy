import {
  buildPlaceSearchQuery,
  inferExpectedCountryCodeFromStateRegion,
} from "./prospectPlaceSearch";

describe("inferExpectedCountryCodeFromStateRegion", () => {
  it("maps NZ to NZ", () => {
    expect(inferExpectedCountryCodeFromStateRegion("NZ")).toBe("NZ");
    expect(inferExpectedCountryCodeFromStateRegion("New Zealand")).toBe("NZ");
  });

  it("maps Australian states to AU", () => {
    expect(inferExpectedCountryCodeFromStateRegion("VIC")).toBe("AU");
    expect(inferExpectedCountryCodeFromStateRegion("nsw")).toBe("AU");
  });

  it("returns null for unknown regions", () => {
    expect(inferExpectedCountryCodeFromStateRegion("Ontario")).toBeNull();
  });
});

describe("buildPlaceSearchQuery", () => {
  it("appends New Zealand for NZ state", () => {
    expect(buildPlaceSearchQuery("main st, hamilton", "NZ")).toBe(
      "main st, hamilton, New Zealand",
    );
  });
});
