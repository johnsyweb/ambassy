Status: ready-for-agent

# Draw territory polygons for viewport-visible allocations only

## What to build

Keep global Voronoi cache intact but limit `drawClippedTerritoryPolygons()` to allocated events whose territory intersects the current viewport, reducing polygon layer work on wide views.

## Acceptance criteria

- [ ] Polygon count scales with visible allocations, not all allocations globally
- [ ] Pan/zoom re-clips without Voronoi recompute
- [ ] Filtered map view still hides non-matching REA territories
- [ ] No visible regression at REA working zoom levels (spot-check coastal allocations)

## Blocked by

- `.scratch/map-performance/issues/01-hide-global-unallocated-markers.md`
