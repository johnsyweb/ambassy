Status: ready-for-agent

# Viewport-culled unallocated markers for map allocation

## What to build

Restore map-click allocation for unallocated parkruns without rendering the full global catalogue. Show unallocated markers only inside the current map viewport (plus a small buffer), refreshing on `moveend` / `zoomend`.

## Acceptance criteria

- [ ] Unallocated markers appear only within viewport bounds
- [ ] Pan/zoom updates visible unallocated markers without full `populateMap()` rebuild
- [ ] Clicking a viewport unallocated marker still opens the allocation dialog
- [ ] Marker count in viewport stays bounded at REA working zoom levels
- [ ] Tests cover viewport add/remove behaviour

## Blocked by

- `.scratch/map-performance/issues/01-hide-global-unallocated-markers.md`
