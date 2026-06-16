Status: ready-for-agent

# Canvas renderer for mass markers

## What to build

Use Leaflet's canvas rendering path for event markers so large marker sets do not create thousands of SVG `<path>` elements.

## Acceptance criteria

- [ ] Event markers render via canvas (or `preferCanvas`) where supported
- [ ] Tooltips and click handlers still work for allocated and viewport unallocated markers
- [ ] No regression in marker visibility/filter behaviour
- [ ] Measurable reduction in DOM node count when many markers are visible

## Blocked by

- `.scratch/map-performance/issues/02-viewport-unallocated-markers.md` (recommended — smaller marker set first)
