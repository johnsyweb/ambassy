Status: done

# Canvas renderer for mass markers

## What to build

Use Leaflet's canvas rendering path for event markers so large marker sets do not create thousands of SVG `<path>` elements.

## Acceptance criteria

- [x] Event markers render via canvas (or `preferCanvas`) where supported
- [x] Tooltips and click handlers still work for allocated and viewport unallocated markers
- [x] No regression in marker visibility/filter behaviour
- [x] Measurable reduction in DOM node count when many markers are visible (browser; circle markers share one canvas layer instead of per-marker SVG paths)

## Blocked by

- `.scratch/map-performance/issues/02-viewport-unallocated-markers.md` (recommended — smaller marker set first)
