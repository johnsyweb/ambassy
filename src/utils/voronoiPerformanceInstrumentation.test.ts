import {
  isVoronoiComputeInstrumentationEnabled,
  measureVoronoiRingComputation,
  VORONOI_COMPUTE_MARK_END,
  VORONOI_COMPUTE_MARK_START,
  VORONOI_COMPUTE_MEASURE,
} from "./voronoiPerformanceInstrumentation";

describe("voronoiPerformanceInstrumentation", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = "development";
    jest.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });

  function mockPerformanceApi(): void {
    const marks = new Set<string>();
    const measures: PerformanceMeasure[] = [];

    Object.defineProperty(global, "performance", {
      configurable: true,
      value: {
        mark: jest.fn((name: string) => {
          marks.add(name);
        }),
        measure: jest.fn((name: string, startMark: string, endMark: string) => {
          measures.push({
            name,
            entryType: "measure",
            startTime: 0,
            duration: 12.5,
            detail: null,
            toJSON: () => ({}),
          } as PerformanceMeasure);
          expect(marks.has(startMark)).toBe(true);
          expect(marks.has(endMark)).toBe(true);
        }),
        getEntriesByName: jest.fn((name: string) =>
          measures.filter((entry) => entry.name === name),
        ),
        clearMarks: jest.fn((name: string) => {
          marks.delete(name);
        }),
        clearMeasures: jest.fn((name: string) => {
          for (let index = measures.length - 1; index >= 0; index -= 1) {
            if (measures[index].name === name) {
              measures.splice(index, 1);
            }
          }
        }),
      },
    });
  }

  it("is enabled in development when the Performance API exists", () => {
    mockPerformanceApi();
    expect(isVoronoiComputeInstrumentationEnabled()).toBe(true);
  });

  it("is disabled in production builds", () => {
    mockPerformanceApi();
    process.env.NODE_ENV = "production";
    expect(isVoronoiComputeInstrumentationEnabled()).toBe(false);
  });

  it("records marks and measures once per Voronoi recompute", () => {
    mockPerformanceApi();

    const result = measureVoronoiRingComputation(
      2500,
      () => ["ring-a", "ring-b"],
      (rings) => `${rings.length} visible territories`,
    );

    expect(result).toEqual(["ring-a", "ring-b"]);
    expect(performance.mark).toHaveBeenCalledWith(VORONOI_COMPUTE_MARK_START);
    expect(performance.mark).toHaveBeenCalledWith(VORONOI_COMPUTE_MARK_END);
    expect(performance.measure).toHaveBeenCalledWith(
      VORONOI_COMPUTE_MEASURE,
      VORONOI_COMPUTE_MARK_START,
      VORONOI_COMPUTE_MARK_END,
    );
    expect(console.debug).toHaveBeenCalledWith(
      `[ambassy] ${VORONOI_COMPUTE_MEASURE}: 12.5ms (2500 Voronoi sites, 2 visible territories)`,
    );
    expect(performance.clearMarks).toHaveBeenCalledWith(
      VORONOI_COMPUTE_MARK_START,
    );
    expect(performance.clearMarks).toHaveBeenCalledWith(
      VORONOI_COMPUTE_MARK_END,
    );
    expect(performance.clearMeasures).toHaveBeenCalledWith(
      VORONOI_COMPUTE_MEASURE,
    );
  });

  it("skips instrumentation in production", () => {
    mockPerformanceApi();
    process.env.NODE_ENV = "production";

    const result = measureVoronoiRingComputation(
      10,
      () => ["ring-a"],
      (rings) => `${rings.length} visible territories`,
    );

    expect(result).toEqual(["ring-a"]);
    expect(performance.mark).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
  });
});
