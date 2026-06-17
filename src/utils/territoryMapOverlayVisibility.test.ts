import { ApplicationState } from "@models/ApplicationState";
import {
  clearTerritoryMapOverlayVisibility,
  DEFAULT_TERRITORY_MAP_OVERLAY_VISIBILITY,
  getTerritoryMapOverlayVisibility,
  setTerritoryMapOverlayVisibility,
  TERRITORY_MAP_OVERLAY_VISIBILITY_SESSION_KEY,
} from "./territoryMapOverlayVisibility";

describe("territoryMapOverlayVisibility", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("defaults all overlays to visible when nothing is stored", () => {
    expect(getTerritoryMapOverlayVisibility()).toEqual(
      DEFAULT_TERRITORY_MAP_OVERLAY_VISIBILITY,
    );
  });

  it("persists overlay visibility in session storage", () => {
    setTerritoryMapOverlayVisibility({
      liveEvents: false,
      prospectiveEvents: true,
      unallocatedParkruns: false,
      regionalEventAmbassador: true,
    });

    expect(
      sessionStorage.getItem(TERRITORY_MAP_OVERLAY_VISIBILITY_SESSION_KEY),
    ).toBe(
      JSON.stringify({
        liveEvents: false,
        prospectiveEvents: true,
        unallocatedParkruns: false,
        regionalEventAmbassador: true,
      }),
    );
    expect(getTerritoryMapOverlayVisibility()).toEqual({
      liveEvents: false,
      prospectiveEvents: true,
      unallocatedParkruns: false,
      regionalEventAmbassador: true,
    });
  });

  it("falls back to defaults for malformed stored values", () => {
    sessionStorage.setItem(
      TERRITORY_MAP_OVERLAY_VISIBILITY_SESSION_KEY,
      "{not-json",
    );

    expect(getTerritoryMapOverlayVisibility()).toEqual(
      DEFAULT_TERRITORY_MAP_OVERLAY_VISIBILITY,
    );
  });

  it("clears stored overlay visibility", () => {
    setTerritoryMapOverlayVisibility({
      liveEvents: false,
      prospectiveEvents: false,
      unallocatedParkruns: false,
      regionalEventAmbassador: false,
    });

    clearTerritoryMapOverlayVisibility();

    expect(
      sessionStorage.getItem(TERRITORY_MAP_OVERLAY_VISIBILITY_SESSION_KEY),
    ).toBeNull();
    expect(getTerritoryMapOverlayVisibility()).toEqual(
      DEFAULT_TERRITORY_MAP_OVERLAY_VISIBILITY,
    );
  });

  it("is not part of the application state export schema", () => {
    const stateKeys = Object.keys({} as ApplicationState["data"]);
    expect(stateKeys).not.toContain("territoryMapOverlayVisibility");
    expect(TERRITORY_MAP_OVERLAY_VISIBILITY_SESSION_KEY).not.toContain(
      "eventAmbassadors",
    );
  });
});
