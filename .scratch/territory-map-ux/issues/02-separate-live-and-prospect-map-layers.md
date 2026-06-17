Status: done

# Separate live and prospect map layers

## Parent

`.scratch/territory-map-ux/PRD.md`

## What to build

Replace the single **Event Markers** Leaflet overlay with separate toggles for allocated live events, prospective events, and viewport unallocated parkruns. REA territory polygons remain a separate overlay as today.

## Grill decisions

| Decision | Choice |
|----------|--------|
| Live overlay label | **Live events** |
| Prospect overlay label | **Prospective events** |
| Unallocated overlay | **Third overlay** (not bundled with Live events) |
| Unallocated overlay label | **Unallocated parkruns** (checkbox); tooltip explains parkruns with no Event Ambassador allocation, including outside the REA's usual patch |
| parkrun style | Always one word, always lowercase in user-facing copy |
| Prospect legend | Hide when Prospective events overlay is off, or when no prospect marker would render (no geocoded prospects or ambassador filter hides all) |
| Stack order (bottom → top) | Unallocated parkruns → Prospective events → Live events |
| Default visibility | All three marker overlays on at first load |
| Selection highlight | Suppress red ring while Live events overlay is off; table selection unchanged |
| Layer persistence | Out of scope — issue 03 |

## Agent brief

**Category:** enhancement  
**Summary:** Split the territory map marker overlay into three independent Leaflet layer groups with layer-control toggles.

**Current behaviour:**  
One marker `LayerGroup` holds allocated live circle markers, viewport unallocated circle markers, and prospect diamond markers. The layer control exposes a single **Event Markers** overlay plus **Regional Event Ambassador** polygons. Prospect map legend visibility follows geocoded prospect count only. Table–map selection highlight lives on a separate highlight layer.

**Desired behaviour:**  
Three marker overlays in the layer control:

1. **Live events** — allocated live event circle markers only  
2. **Prospective events** — geocoded prospect diamond markers only  
3. **Unallocated parkruns** — viewport unallocated circle markers only (checkbox label **Unallocated parkruns**; `title`/tooltip: parkruns with no Event Ambassador allocation, including outside the REA's usual patch)

Plus **Regional Event Ambassador** polygons unchanged.

- Toggling each overlay shows/hides only its markers.  
- All three marker overlays default **on** at load (no behaviour change from today until the REA toggles).  
- Add order on map (bottom → top): Unallocated parkruns → Prospective events → Live events.  
- Prospect map legend: visible only when the Prospective events overlay is on **and** at least one prospect marker would render (respect ambassador name filter).  
- When Live events overlay is off, suppress the selection highlight ring; restore when overlay is back on if selection still active.  
- Ambassador name filter continues to control per-marker visibility within each overlay; filter already hides unallocated markers when active.  
- Listen for layer-control add/remove events (or equivalent) to refresh legend and highlight suppression.

**Key interfaces:**

- Territory map population — maintain separate layer groups instead of one combined markers layer; update layer control registration.  
- `applyAmbassadorNameFilterToMap()` — apply visibility per overlay group.  
- `syncProspectMapLegend()` — take visibility inputs from overlay state and filter, not prospect count alone.  
- `isEventMarkerVisibleOnMap()` — clarify allocated live vs unallocated if callers depend on it.  
- Selection highlight refresh handler — respect Live events overlay visibility.

**Acceptance criteria:**

- [ ] Layer control shows **Live events**, **Prospective events**, **Unallocated parkruns**, and **Regional Event Ambassador**  
- [ ] Each marker overlay toggles independently  
- [ ] Live overlay contains allocated live circles only  
- [ ] Unallocated overlay contains viewport unallocated circles only  
- [ ] Prospect overlay contains prospect diamonds only  
- [ ] Stack order: unallocated bottom, prospective middle, live top  
- [ ] All three marker overlays on by default  
- [ ] Prospect legend follows overlay + filter visibility rules above  
- [ ] Selection highlight suppressed when Live events overlay off  
- [ ] Ambassador name filter unchanged in effect  
- [ ] Tests updated; full test suite passes

**Out of scope:**

- Persisting overlay checkbox state (issue 03)  
- Legend examples or dismiss (issue 04)  
- Renaming **Regional Event Ambassador** polygon overlay

## Blocked by

None — can start immediately

## Notes

Original issue assumed two overlays; grill expanded to three so unallocated parkruns are independently togglable. Domain terms in `CONTEXT.md`.
