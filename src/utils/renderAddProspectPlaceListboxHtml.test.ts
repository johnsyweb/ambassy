import { renderAddProspectPlaceListboxHtml } from "./renderAddProspectPlaceListboxHtml";

describe("renderAddProspectPlaceListboxHtml", () => {
  it("renders map-style place options with data attributes", () => {
    const html = renderAddProspectPlaceListboxHtml([
      {
        label: "Ruffey Lake Park, Doncaster, VIC, Australia",
        latitude: -37.78,
        longitude: 145.12,
      },
    ]);

    expect(html).toContain('aria-label="Places"');
    expect(html).toContain("territory-map-search-section-label");
    expect(html).toContain("territory-map-search-option");
    expect(html).toContain("Ruffey Lake Park");
    expect(html).toContain('data-place-index="0"');
    expect(html).toContain('data-latitude="-37.78"');
  });

  it("returns an empty string when there are no places", () => {
    expect(renderAddProspectPlaceListboxHtml([])).toBe("");
  });
});
