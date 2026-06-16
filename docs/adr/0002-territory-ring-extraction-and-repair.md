---
status: accepted
---

# Territory ring extraction for wrapped spherical Voronoi cells

ADR 0001 keeps **global spherical Voronoi** (`d3-geo-voronoi`) over all Voronoi sites. That decision stands. Some allocated events — notably Baxter on the WA coast — produce cells that are topologically correct on the sphere but **wrap the wrong way** when turned into a drawable lat/lng ring: vertex-distance extraction can miss the site even though the full global cell contains it.

We extract a **local territory ring** from each global cell, validate that it is **drawable** (site inside the polygon via point-in-polygon; sensible longitude span), and **fall back to the raw global cell ring** when local extraction fails validation but the raw ring passes. If both fail, the territory is **undrawable** (marker only, per ADR 0001). Domain terms: `CONTEXT.md`.

## Decision

1. **Keep spherical global compute** — do not replace `d3-geo-voronoi` with planar or pixel-space Voronoi for this problem.
2. **Local extraction** — prefer a site-containing arc split on long wrap edges (local longitude band), then vertex-distance sub-chain; reject arcs that spill too far west of the site.
3. **Drawable validation** — use point-in-polygon (not bounding-box-only); retain longitude-span and related sanity limits.
4. **Raw cell fallback** — when local extraction is missing or not drawable, use the raw global Voronoi ring if it passes drawable validation. Accepts wrapped shapes (e.g. Baxter routes through the Indian Ocean) to keep the site inside without inventing synthetic boundaries.
5. **No meridian-box repair** — synthetic closure at site meridians caused regional interior overlap in Chris Hoy Poy WA; rejected.
6. **Regression coverage** — Jest unit tests for extraction and selection; Node regression scripts against live `events.json` for Baxter, Hamilton Island, Mt Clarence, O'Connors Beach, and Chris Hoy Poy WA (site inside polygon; zero interior dual-occupancy).

## Considered options

**Regional planar / tangent-plane Voronoi (rejected)**  
Recomputing cells in a per-site or per-cluster tangent plane fixed Baxter in isolation but caused **overlapping territories** in manual testing. Rejected; ADR 0001 already rejected global pixel-space planar Voronoi for different reasons.

**Meridian-box / bisector repair (rejected)**  
Closing local vertex chains at site meridians or bisector latitudes made Baxter drawable but produced **368 interior dual-occupancy points** across Chris Hoy Poy WA when neighbours shared the same western meridian.

**Raise vertex-distance threshold globally (rejected)**  
Increasing `MAX_TERRITORY_VERTEX_DISTANCE_DEGREES` to ~37° drew Baxter but changed several other events; raw fallback is surgical (one event in WA regression).

**Marker-only when extraction fails, no fallback (rejected)**  
Hides Baxter entirely when local extraction picks the wrong sub-chain.

**Local extraction + raw fallback (accepted)**  
Preserves global spherical semantics, zero regional overlap in regression, Baxter site inside polygon.

## Consequences

- Implement extraction, point-in-polygon, and ring selection in `voronoiTerritories.ts`.
- Add regression scripts under `script/` and wire them into Jest integration tests.
- ADR 0001 remains the geometry-engine decision; this ADR documents the post-processing layer that turns global cells into drawable REA territory polygons.
- Wrapped fallback rings may look visually untidy (Indian Ocean bow-tie) until overlap-safe half-plane clipping exists.
