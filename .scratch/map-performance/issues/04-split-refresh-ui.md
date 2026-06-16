Status: done

# Split table refresh from map refresh

## What to build

Decompose `refreshUI()` so operations that only change ambassador metadata, logs, or finish history refresh tables without rebuilding the map.

## Acceptance criteria

- [x] Parkrunner ID edits, changes log updates, and similar paths skip `populateMap()` when allocations unchanged
- [x] Allocation, prospect, and filter changes still refresh the map
- [x] Public refresh entry points document which subsystems they invalidate
- [x] Tests prove map is not rebuilt when only log/metadata changes

## Blocked by

- `.scratch/map-performance/issues/01-hide-global-unallocated-markers.md`
