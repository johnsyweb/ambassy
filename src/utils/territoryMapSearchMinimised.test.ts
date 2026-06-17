import {
  clearTerritoryMapSearchMinimised,
  isTerritoryMapSearchMinimised,
  setTerritoryMapSearchMinimised,
  TERRITORY_MAP_SEARCH_MINIMISED_SESSION_KEY,
} from "./territoryMapSearchMinimised";

describe("territoryMapSearchMinimised", () => {
  beforeEach(() => {
    clearTerritoryMapSearchMinimised();
  });

  it("defaults to expanded", () => {
    expect(isTerritoryMapSearchMinimised()).toBe(false);
  });

  it("persists minimised state in session storage", () => {
    setTerritoryMapSearchMinimised(true);
    expect(isTerritoryMapSearchMinimised()).toBe(true);
    expect(
      sessionStorage.getItem(TERRITORY_MAP_SEARCH_MINIMISED_SESSION_KEY),
    ).toBe("true");
  });

  it("clears minimised state when expanded", () => {
    setTerritoryMapSearchMinimised(true);
    setTerritoryMapSearchMinimised(false);
    expect(isTerritoryMapSearchMinimised()).toBe(false);
    expect(
      sessionStorage.getItem(TERRITORY_MAP_SEARCH_MINIMISED_SESSION_KEY),
    ).toBeNull();
  });
});
