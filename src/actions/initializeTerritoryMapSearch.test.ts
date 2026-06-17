import {
  initializeTerritoryMapSearch,
  renderTerritoryMapSearchSuggestionsHtml,
  resetTerritoryMapSearchForTests,
  TERRITORY_MAP_SEARCH_INPUT_ID,
} from "./initializeTerritoryMapSearch";
import { createSelectionState } from "@models/SelectionState";

describe("initializeTerritoryMapSearch", () => {
  beforeEach(() => {
    resetTerritoryMapSearchForTests();
    document.body.innerHTML = '<div id="mapContainer"></div>';
  });

  afterEach(() => {
    resetTerritoryMapSearchForTests();
  });

  it("adds a find-on-map control to the map container", () => {
    initializeTerritoryMapSearch(() => null, {
      selectionState: createSelectionState(),
      getMap: () => null,
      getMarkerMap: () => new Map(),
      getHighlightLayer: () => null,
    });

    expect(
      document.getElementById(TERRITORY_MAP_SEARCH_INPUT_ID),
    ).not.toBeNull();
  });

  it("focuses the search input on Ctrl+K", () => {
    initializeTerritoryMapSearch(() => null, {
      selectionState: createSelectionState(),
      getMap: () => null,
      getMarkerMap: () => new Map(),
      getHighlightLayer: () => null,
    });

    const input = document.getElementById(
      TERRITORY_MAP_SEARCH_INPUT_ID,
    ) as HTMLInputElement;
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
    );

    expect(document.activeElement).toBe(input);
  });
});

describe("renderTerritoryMapSearchSuggestionsHtml", () => {
  it("renders grouped sections for live events, prospects, and places", () => {
    const html = renderTerritoryMapSearchSuggestionsHtml(
      {
        liveEvents: [
          {
            kind: "live-event",
            eventShortName: "brighton",
            label: "Brighton Beach parkrun",
            isUnallocated: true,
            hiddenByAmbassadorFilter: false,
          },
        ],
        prospectiveEvents: [
          {
            kind: "prospect",
            prospectId: "p1",
            label: "Future Brighton parkrun",
            hasLocation: false,
            hiddenByAmbassadorFilter: false,
          },
        ],
      },
      [
        {
          kind: "place",
          label: "Brighton, Victoria, Australia",
          latitude: -37.906,
          longitude: 145.001,
        },
      ],
    );

    expect(html).toContain("Live events");
    expect(html).toContain("Prospective events");
    expect(html).toContain("Places");
    expect(html).toContain("Unallocated");
    expect(html).toContain("No location");
  });
});
