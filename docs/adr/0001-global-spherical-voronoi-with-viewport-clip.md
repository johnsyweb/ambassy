---
status: accepted
---

# Global spherical Voronoi with viewport clip for REA territory polygons

Ambassy draws **REA territory polygons** on the map: one visible cell per allocated live event (or EA-assigned prospective event), coloured by Regional Event Ambassador. The layer broke for edge allocations such as Mt Clarence when the diagram used a local bounding box around current allocations — open coastlines had no southern neighbours, so `d3-geo-voronoi` produced cells that wrapped across the globe.

We compute a **global, static spherical Voronoi diagram** over all Voronoi sites, cache the resulting cell rings, and **clip to the map viewport** on pan and zoom. Domain terms live in `CONTEXT.md`.

## Voronoi sites

| Site type | Visible polygon? |
|---|---|
| Allocated live events | Yes — coloured by REA |
| Unallocated parkruns in `events.json` (any series, valid coordinates) | No — constraining sites only |
| Prospective events with valid coordinates and an assigned EA | Yes — coloured by REA |

## Decision

1. **Geometry:** spherical Voronoi via `d3-geo-voronoi` (not planar / pixel-space Voronoi).
2. **Scope:** global site set; diagram recomputed only when Voronoi sites change (allocations, `events.json` refresh, prospect or coordinate changes).
3. **Render:** intersect cached cell rings with current map bounds; pan/zoom re-clips without recomputing.
4. **Failure:** if a cell cannot be computed or clipped, show the marker only — no polygon, no user-facing error.
5. **Rendering:** draw clipped rings as Leaflet `L.polygon` straight lat/lng segments.

## Considered options

**Allocation bounding box + edge sentinels (rejected)**  
Only nearby unallocated parkruns within a padded box around current allocations became constraining sites; synthetic points closed open edges. Fixed Mt Clarence locally but failed when allocations spanned distant regions (e.g. SG + JP + AU in one view) and required tuning padding and sentinel placement.

**Viewport-scoped sites, recompute on pan/zoom (rejected)**  
Similar to [running-challenges](https://github.com/fraz3alpha/running-challenges) site filtering. Territory meaning would change with zoom level; inconsistent with REA interpretation of stable geographic patches.

**Planar Voronoi in pixel space like running-challenges (rejected)**  
Simpler viewport clipping, but wrong geography for a global AP rollout and inconsistent with REA territory as a real-world nearest-neighbour region on the sphere.

**Global sites + viewport clip on render (accepted)**  
Adopts running-challenges' insight (full parkrun catalogue as sites, clip to what is on screen) while keeping spherical compute and REA colouring. Mt Clarence and UK coastal events are bounded by the global parkrun network without per-region bounding boxes.

## Deferred

- **Antimeridian (±180°):** out of scope until allocations span the Pacific; UK, Australia, SE Asia, Japan, and NZ are unaffected.
- **Geodesic edge subdivision:** out of scope until straight lat/lng chords look wrong at REA working zoom.
- **Fallback envelope** (e.g. circle around event when cell is undrawable): rejected in favour of marker-only silence.

## Consequences

- Remove allocation bounding box, expanded bounds, and synthetic edge sentinels from `populateMap`.
- Extract Voronoi logic into a testable module with cache invalidation keyed on site data.
- Add `moveend` / `zoomend` listeners to re-clip cached rings.
- Global compute over ~2,500+ sites runs once per site change; acceptable given cache.
- A polygon library (or equivalent) is needed for geographic viewport intersection on spherical rings.
