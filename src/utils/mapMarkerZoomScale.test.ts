import {
  allocatedLiveMarkerRadius,
  mapMarkerZoomScale,
  prospectMapMarkerPixelSize,
  unallocatedMarkerRadii,
} from "./mapMarkerZoomScale";

describe("mapMarkerZoomScale", () => {
  it("returns unity at and below the floor zoom", () => {
    expect(mapMarkerZoomScale(11)).toBe(1);
    expect(mapMarkerZoomScale(8)).toBe(1);
  });

  it("returns the cap at and above the maximum zoom", () => {
    expect(mapMarkerZoomScale(18)).toBe(2);
    expect(mapMarkerZoomScale(20)).toBe(2);
  });

  it("interpolates linearly between floor and cap", () => {
    expect(mapMarkerZoomScale(14.5)).toBeCloseTo(1.5, 5);
    expect(mapMarkerZoomScale(13)).toBeCloseTo(1 + 2 / 7, 5);
    expect(mapMarkerZoomScale(16)).toBeCloseTo(1 + 5 / 7, 5);
  });
});

describe("allocatedLiveMarkerRadius", () => {
  it("uses baseline radius at floor zoom", () => {
    expect(allocatedLiveMarkerRadius(11)).toBe(5);
  });

  it("doubles at cap zoom", () => {
    expect(allocatedLiveMarkerRadius(18)).toBe(10);
  });
});

describe("unallocatedMarkerRadii", () => {
  it("scales base and hover radii together", () => {
    expect(unallocatedMarkerRadii(11)).toEqual({ base: 4, hover: 6 });
    expect(unallocatedMarkerRadii(18)).toEqual({ base: 8, hover: 12 });
  });
});

describe("prospectMapMarkerPixelSize", () => {
  it("scales the prospect diamond from its baseline size", () => {
    expect(prospectMapMarkerPixelSize(11)).toBe(20);
    expect(prospectMapMarkerPixelSize(13)).toBeCloseTo(20 * (1 + 2 / 7), 5);
    expect(prospectMapMarkerPixelSize(18)).toBe(40);
  });
});
