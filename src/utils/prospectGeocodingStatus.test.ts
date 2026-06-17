import { resolveProspectGeocodingStatus } from "./prospectGeocodingStatus";

describe("resolveProspectGeocodingStatus", () => {
  it("returns success for unchanged place search coordinates", () => {
    expect(
      resolveProspectGeocodingStatus({
        coordinatesEnteredManually: false,
        coordinatesFromPinDrag: false,
      }),
    ).toBe("success");
  });

  it("returns manual when the place pin was dragged", () => {
    expect(
      resolveProspectGeocodingStatus({
        coordinatesEnteredManually: false,
        coordinatesFromPinDrag: true,
      }),
    ).toBe("manual");
  });

  it("returns manual when coordinates were entered manually in the dialog", () => {
    expect(
      resolveProspectGeocodingStatus({
        coordinatesEnteredManually: true,
        coordinatesFromPinDrag: false,
      }),
    ).toBe("manual");
  });
});
