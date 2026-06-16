Status: done

# Skip populateMap when map inputs unchanged

## What to build

Track a fingerprint of Voronoi sites, allocations, prospects, and ambassador filter state. Skip `populateMap()` when the fingerprint is unchanged since the last render.

## Acceptance criteria

- [x] Consecutive `refreshUI()` calls with identical map inputs do not rebuild markers or polygons
- [x] Fingerprint invalidates on allocation, prospect, coordinate, or filter changes
- [x] Regression test: double refresh does not double marker count

## Blocked by

- `.scratch/map-performance/issues/04-split-refresh-ui.md`
