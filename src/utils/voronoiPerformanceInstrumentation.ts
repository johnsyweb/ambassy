export const VORONOI_COMPUTE_MARK_START = "ambassy:voronoi-compute:start";
export const VORONOI_COMPUTE_MARK_END = "ambassy:voronoi-compute:end";
export const VORONOI_COMPUTE_MEASURE = "ambassy:voronoi-compute";

export function isVoronoiComputeInstrumentationEnabled(): boolean {
  if (typeof performance === "undefined") {
    return false;
  }

  if (
    typeof performance.mark !== "function" ||
    typeof performance.measure !== "function"
  ) {
    return false;
  }

  return process.env.NODE_ENV !== "production";
}

export function measureVoronoiRingComputation<T>(
  siteCount: number,
  compute: () => T,
  describeResult: (result: T) => string,
): T {
  if (!isVoronoiComputeInstrumentationEnabled()) {
    return compute();
  }

  performance.mark(VORONOI_COMPUTE_MARK_START);
  const result = compute();
  performance.mark(VORONOI_COMPUTE_MARK_END);
  performance.measure(
    VORONOI_COMPUTE_MEASURE,
    VORONOI_COMPUTE_MARK_START,
    VORONOI_COMPUTE_MARK_END,
  );

  const entries = performance.getEntriesByName(VORONOI_COMPUTE_MEASURE);
  const latest = entries[entries.length - 1];
  const durationMs =
    latest && "duration" in latest ? latest.duration.toFixed(1) : "?";

  console.debug(
    `[ambassy] ${VORONOI_COMPUTE_MEASURE}: ${durationMs}ms (${siteCount} Voronoi sites, ${describeResult(result)})`,
  );

  performance.clearMarks(VORONOI_COMPUTE_MARK_START);
  performance.clearMarks(VORONOI_COMPUTE_MARK_END);
  performance.clearMeasures(VORONOI_COMPUTE_MEASURE);

  return result;
}
