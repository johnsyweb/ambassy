Status: ready-for-agent

# Instrument Voronoi first-compute cost

## What to build

Add dev-only `performance.mark` / `measure` around global Voronoi ring computation so we can quantify first-render cost after allocation changes with a full catalogue.

## Acceptance criteria

- [ ] Marks surround `computeVisibleTerritoryRings` / cache miss path
- [ ] Measures logged once per cache invalidation (not every pan/zoom)
- [ ] Document how to read timings in browser devtools
- [ ] No production console noise (guard behind dev flag or `console.debug`)

## Blocked by

None — can start immediately
