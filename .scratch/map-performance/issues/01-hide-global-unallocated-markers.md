Status: done

# Hide global unallocated event markers

## What to build

Stop creating Leaflet markers for every unallocated parkrun in the global `events.json` catalogue on each `populateMap()` call. Allocated events and prospective events keep markers; unallocated events remain **constraining Voronoi sites** only (ADR 0001).

Map-click allocation of unallocated events is out of scope here — restored in issue 02 via viewport culling, or via existing event search.

## Acceptance criteria

- [x] `populateMap()` creates markers only for allocated live events and prospective events
- [x] Global unallocated events still participate in `buildVoronoiSites()` as constraining sites
- [x] With sample CSVs loaded, rendered marker count is O(allocated events), not O(global catalogue)
- [x] Tests updated; full test suite passes
- [x] README notes that map-click allocation of unallocated events returns in a follow-up issue

## Blocked by

None — can start immediately
