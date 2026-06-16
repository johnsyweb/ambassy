# Map and UI performance

## Problem

With ambassador CSVs loaded, `localhost:8081` becomes slow and memory-heavy. Diagnosis (2026-06) found:

- **~3,000 Leaflet SVG paths** — one marker per global parkrun in `events.json` (~2,923 events), not just allocated events
- **~34,000 DOM nodes**, **~47 MB JS heap** with sample CSVs (~164 allocations)
- **Full `populateMap()` rebuild** on every `refreshUI()` call
- **Webpack dev** ships ~1.8 MB `bundle.js` (`cache: false`, full source maps)

Unallocated parkruns are already **constraining Voronoi sites only** per ADR 0001; rendering a clickable marker for each is the dominant cost.

## Goal

Restore responsive REA workflows with bounded DOM/memory, without changing Voronoi territory semantics.

## Issues

Implement in order (highest impact first):

| # | Issue | Status |
|---|--------|--------|
| 01 | Stop rendering global unallocated event markers | done |
| 02 | Viewport-culled unallocated markers for map allocation | done |
| 03 | Canvas renderer for mass markers | done |
| 04 | Split table refresh from map refresh | done |
| 05 | Skip `populateMap` when map inputs unchanged | done |
| 06 | Draw territory polygons for viewport-visible allocations only | done |
| 07 | Instrument Voronoi first-compute cost | done |
| 08 | Tune webpack dev config for faster local dev | done |
| 09 | Debounce finish-import activation handlers | done |
| 10 | Keep parsed events catalogue in memory | done |
| 11 | CI smoke test for map DOM budget | done |
