Status: done

# Instrument Voronoi first-compute cost

## What to build

Add dev-only `performance.mark` / `measure` around global Voronoi ring computation so we can quantify first-render cost after allocation changes with a full catalogue.

## Acceptance criteria

- [x] Marks surround `computeVisibleTerritoryRings` / cache miss path
- [x] Measures logged once per cache invalidation (not every pan/zoom)
- [x] Document how to read timings in browser devtools
- [x] No production console noise (guard behind dev flag or `console.debug`)

## Blocked by

None — can start immediately
