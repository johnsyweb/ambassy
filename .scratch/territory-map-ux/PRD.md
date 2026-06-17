# Territory map and REA workflow UX

## Source

User feedback from REA call, June 2026.

## Problem

Regional Event Ambassadors use the **territory map** to scan live events, prospective events, and REA territory polygons. Recent work added **prospect launch readiness** segments on prospect markers and a persistent legend, but several map and table workflows still feel awkward in real use:

- Layer choices reset on reload; live and prospect markers share one layer.
- The legend explains encoding but lacks examples and cannot be dismissed.
- Markers stay fixed size and disappear visually when zoomed in.
- There is no map search for events, prospects, or towns (only the ambassador name filter on tables).
- Prospect geocoding — especially **New Zealand** addresses — gives poor feedback and few suggestions.
- **Event Teams** reallocation requires selecting a row before the Reallocate control works.
- Internal prospect status (`Status: matched`, Ambassador Match column) is meaningless to REAs.

## Goal

Make territory planning on the map faster and clearer for REAs, without changing Voronoi semantics or launch-pipeline data model.

## Out of scope (this epic)

- Editing prospect readiness from the map
- Voronoi polygon styling changes
- Changes to state export schema (layer prefs may use session storage only, like ambassador name filter)

## Proposed slices

Implement in order where dependencies apply:

| # | Issue | Type | Rationale |
|---|--------|------|-----------|
| 01 | Event team reallocate without row selection | AFK | Quick table UX fix; unblocks daily REA workflow |
| 02 | Separate live and prospect map layers | AFK | Prerequisite for meaningful layer persistence |
| 03 | Persist map layer visibility | AFK | Depends on issue 02 layer split |
| 04 | Prospect map legend with examples and dismiss | AFK | Builds on recent legend; user-tested feedback |
| 05 | Zoom-aware map marker sizing | AFK | Independent map readability improvement |
| 06 | Map search for event, prospect, and town | AFK | Larger slice; may reuse geocoding/Nominatim for towns |
| 07 | NZ prospect geocoding feedback and suggestions | AFK | Independent prospects workflow |
| 08 | Prospect status plain language (not "matched") | AFK | Quick copy fix; voronoi tooltip + Prospects table |

## Domain terms

See `CONTEXT.md`: **Territory map**, **Prospect map marker**, **Prospect launch readiness**, **Ambassador name filter** (existing table filter — map search is separate).

## Notes on current code

- Leaflet layer control overlays: `"Event Markers"` (live + prospects + viewport unallocated) and `"Regional Event Ambassador"` (`populateMap.ts`). No persistence.
- Prospect legend: `syncProspectMapLegend()` — persistent, not dismissable, text-only (no example markers).
- Event Teams reallocate button: disabled unless `selectedEventShortName` matches row (`populateEventTeamsTable.ts`).
- Ambassador name filter: session storage only; filters tables and map markers, not towns or event names directly.
- Prospect `ambassadorMatchStatus` raw values still appear in Voronoi tooltips (`Status: matched`); Prospects table **Ambassador Match** column uses `getStatusText()` which maps `matched` → "✅ Success" — conflated with geocoding labels.
