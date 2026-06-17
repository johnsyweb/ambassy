import {
  clearProspectMapLegendDismissed,
  isProspectMapLegendDismissed,
  setProspectMapLegendDismissed,
  PROSPECT_MAP_LEGEND_DISMISSED_SESSION_KEY,
} from "./prospectMapLegendDismiss";

describe("prospectMapLegendDismiss", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("is not dismissed when nothing is stored", () => {
    expect(isProspectMapLegendDismissed()).toBe(false);
  });

  it("persists dismissed state in session storage", () => {
    setProspectMapLegendDismissed(true);

    expect(
      sessionStorage.getItem(PROSPECT_MAP_LEGEND_DISMISSED_SESSION_KEY),
    ).toBe("true");
    expect(isProspectMapLegendDismissed()).toBe(true);
  });

  it("clears dismissed state", () => {
    setProspectMapLegendDismissed(true);

    clearProspectMapLegendDismissed();

    expect(isProspectMapLegendDismissed()).toBe(false);
  });
});
