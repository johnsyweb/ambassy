import {
  buildProspectMapLegendHtml,
  buildProspectMapMarkerHtml,
  formatProspectMapTooltip,
  syncProspectMapLegend,
} from "./prospectMapMarker";
import type { ProspectiveEvent } from "@models/ProspectiveEvent";

function parseMarkerHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function getSegmentFill(html: string, readinessKey: string): string | null {
  const segment = parseMarkerHtml(html).querySelector(
    `[data-readiness="${readinessKey}"]`,
  );
  return segment?.getAttribute("fill") ?? null;
}

describe("buildProspectMapMarkerHtml", () => {
  it("shows course found as confirmed in the top segment when course is found", () => {
    const html = buildProspectMapMarkerHtml(
      {
        courseFound: true,
        landownerPermission: false,
        fundingConfirmed: false,
      },
      "#336699",
    );

    expect(getSegmentFill(html, "course-found")).toBe("#336699");
  });

  it("shows course found as not confirmed in the top segment when course is not found", () => {
    const html = buildProspectMapMarkerHtml(
      {
        courseFound: false,
        landownerPermission: false,
        fundingConfirmed: false,
      },
      "#336699",
    );

    expect(getSegmentFill(html, "course-found")).toBe("#d0d0d0");
  });

  it("shows landowner permission as confirmed in the bottom-left segment when granted", () => {
    const html = buildProspectMapMarkerHtml(
      {
        courseFound: false,
        landownerPermission: true,
        fundingConfirmed: false,
      },
      "#336699",
    );

    expect(getSegmentFill(html, "landowner-permission")).toBe("#336699");
  });

  it("shows funding confirmed in the bottom-right segment when funding is confirmed", () => {
    const html = buildProspectMapMarkerHtml(
      {
        courseFound: false,
        landownerPermission: false,
        fundingConfirmed: true,
      },
      "#336699",
    );

    expect(getSegmentFill(html, "funding-confirmed")).toBe("#336699");
  });

  it("uses the Event Ambassador colour on the marker border", () => {
    const html = buildProspectMapMarkerHtml(
      {
        courseFound: false,
        landownerPermission: false,
        fundingConfirmed: false,
      },
      "#ff6600",
    );

    const border = parseMarkerHtml(html).querySelector(
      '[data-marker-part="border"]',
    );
    expect(border?.getAttribute("stroke")).toBe("#ff6600");
  });
});

function baseProspect(
  overrides: Partial<ProspectiveEvent> = {},
): ProspectiveEvent {
  return {
    id: "p1",
    prospectEvent: "Future parkrun",
    country: "Australia",
    state: "VIC",
    prospectEDs: "Pat",
    eventAmbassador: "EA1",
    courseFound: false,
    landownerPermission: false,
    fundingConfirmed: false,
    dateMadeContact: null,
    geocodingStatus: "success",
    ambassadorMatchStatus: "matched",
    importTimestamp: 0,
    sourceRow: 1,
    ...overrides,
  };
}

describe("formatProspectMapTooltip", () => {
  it("lists all three prospect launch readiness flags explicitly", () => {
    const tooltip = formatProspectMapTooltip(
      baseProspect({
        courseFound: true,
        landownerPermission: false,
        fundingConfirmed: true,
      }),
    );

    expect(tooltip).toContain("<strong>Course found:</strong> Yes");
    expect(tooltip).toContain("<strong>Landowner permission:</strong> No");
    expect(tooltip).toContain("<strong>Funding confirmed:</strong> Yes");
  });

  it("includes the prospective event name and assigned Event Ambassador", () => {
    const tooltip = formatProspectMapTooltip(baseProspect());

    expect(tooltip).toContain("Future parkrun");
    expect(tooltip).toContain("EA1");
  });
});

describe("buildProspectMapLegendHtml", () => {
  it("explains live circle and prospect diamond markers", () => {
    const legend = buildProspectMapLegendHtml();

    expect(legend).toContain("Live event");
    expect(legend).toContain("Prospective event");
  });

  it("maps each prospect launch readiness flag to a segment label", () => {
    const legend = buildProspectMapLegendHtml();

    expect(legend).toContain("Course found");
    expect(legend).toContain("Landowner permission");
    expect(legend).toContain("Funding confirmed");
  });
});

describe("syncProspectMapLegend", () => {
  it("adds a persistent legend when geocoded prospects are on the map", () => {
    document.body.innerHTML = '<div id="mapContainer"></div>';
    const mapContainer = document.getElementById("mapContainer")!;

    syncProspectMapLegend(mapContainer, true);

    expect(mapContainer.querySelector(".prospect-map-legend")).not.toBeNull();
  });

  it("removes the legend when no geocoded prospects remain", () => {
    document.body.innerHTML = '<div id="mapContainer"></div>';
    const mapContainer = document.getElementById("mapContainer")!;

    syncProspectMapLegend(mapContainer, true);
    syncProspectMapLegend(mapContainer, false);

    expect(mapContainer.querySelector(".prospect-map-legend")).toBeNull();
  });
});
