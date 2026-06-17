import {
  formatProspectAmbassadorAssignmentStatusLabel,
  formatProspectGeocodingStatusLabel,
} from "./prospectStatusLabels";

describe("formatProspectGeocodingStatusLabel", () => {
  it("uses location-focused labels distinct from ambassador assignment", () => {
    expect(formatProspectGeocodingStatusLabel("pending")).toBe(
      "Pending geocoding",
    );
    expect(formatProspectGeocodingStatusLabel("success")).toBe(
      "Location found",
    );
    expect(formatProspectGeocodingStatusLabel("failed")).toBe(
      "Location not found",
    );
    expect(formatProspectGeocodingStatusLabel("manual")).toBe(
      "Manual coordinates",
    );
  });
});

describe("formatProspectAmbassadorAssignmentStatusLabel", () => {
  it("describes Event Ambassador assignment in plain language", () => {
    expect(formatProspectAmbassadorAssignmentStatusLabel("pending")).toBe(
      "Event Ambassador not yet matched (import)",
    );
    expect(formatProspectAmbassadorAssignmentStatusLabel("matched")).toBe(
      "Event Ambassador assigned",
    );
    expect(formatProspectAmbassadorAssignmentStatusLabel("unmatched")).toBe(
      "No Event Ambassador assigned",
    );
  });
});
