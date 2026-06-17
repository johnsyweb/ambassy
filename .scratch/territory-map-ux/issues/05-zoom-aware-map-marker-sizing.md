Status: done

# Zoom-aware map marker sizing

## Parent

`.scratch/territory-map-ux/PRD.md`

## What to build

Scale territory map event markers with zoom so they remain easy to see and click when the REA zooms into street-level detail — especially where fixed-size markers currently feel too small.

## Grill decisions

| Decision | Choice |
|----------|--------|
| Direction | Grow when zoomed in only; never shrink below today's baselines |
| Scale floor | Unity (1×) at zoom ≤ 11 |
| Scale cap | 2× at zoom 18 |
| Interpolation | Linear between floor and cap |
| Marker kinds | Allocated live, prospective, viewport unallocated — same multiplier, each from its own baseline |
| Unallocated hover | Scales with base (today 4px / 6px hover → 8px / 12px at max) |
| Selection highlights | Refresh on `zoomend` when a live event is selected (1.5× allocated radius) |
| Update timing | On `zoomend` and after initial draw / table navigation — not during zoom animation |
| HITL | Before merge: PR screenshot at zoom 16–18 on a dense cluster for visual sign-off |

## Baseline sizes (scale = 1 at zoom ≤ 11)

| Kind | Baseline |
|------|----------|
| Allocated live | 5px circle radius |
| Prospective | 20×20px diamond |
| Viewport unallocated | 4px radius (6px on hover) |

## Scale formula

```
scale(z) = 1                          when z ≤ 11
scale(z) = 1 + (z - 11) / 7         when 11 < z < 18   // linear to 2× at 18
scale(z) = 2                          when z ≥ 18
```

Example sizes:

| Zoom | Scale | Live | Prospect | Unallocated (hover) |
|------|-------|------|----------|---------------------|
| ≤11 | 1× | 5px | 20px | 4px (6px) |
| 13 | ~1.29× | ~6.5px | ~26px | ~5px (~8px) |
| 16 | ~1.71× | ~8.5px | ~34px | ~7px (~10px) |
| 18 | 2× | 10px | 40px | 8px (12px) |

## Agent brief

1. Add a pure `mapMarkerZoomScale(zoom: number): number` (and helpers for each marker kind's pixel size) in a dedicated util module with unit tests.
2. On `populateMap` after markers are created, and on existing `zoomend` listener, call a `syncMapMarkerSizes(map)` that:
   - Updates `setRadius` on all allocated live markers in `_markerMap` (excluding unallocated-only entries — check `_eventMarkerFilterState` or `_unallocatedMarkerMap`).
   - Updates existing viewport unallocated markers in `_unallocatedMarkerMap` (they are **not** recreated when still in view on zoom — must resize in place).
   - Updates prospect `L.marker` icons via `setIcon` with scaled `iconSize` / `iconAnchor` (SVG viewBox stays 16×16; container scales).
3. Wire unallocated hover handlers to use scaled base and hover radii from the same helper.
4. When `selectionState.highlightedEvents` is non-empty, re-call `highlightEventsOnMap` on `zoomend` so the red ring stays 1.5× the live marker.
5. Filtered map view: same scaling rules; only visibility differs.
6. Out of scope: REA territory polygons, static prospect legend control (issue 04), changing table-navigation target zoom (13).

## Acceptance criteria

- [ ] Marker visual size responds to map zoom per formula above
- [ ] Live circles and prospect diamonds remain distinguishable at all supported zoom levels
- [ ] Prospect readiness segments remain readable after scaling
- [ ] Marker hit targets improve when zoomed in (prospect ≥ 26px at zoom 13)
- [ ] Selection highlight ring resizes with zoom when active
- [ ] No material regression to map DOM budget smoke test limits
- [ ] Unit tests for scale function; integration tests for marker sync where practical
- [ ] PR includes screenshot at zoom 16–18 on bundled sample data for HITL sign-off
- [ ] Full test suite passes

## Blocked by

None — can start immediately

## Notes

Domain term captured in `CONTEXT.md` as **Territory map marker zoom scale**. No ADR — constants are easy to tune from HITL feedback.
