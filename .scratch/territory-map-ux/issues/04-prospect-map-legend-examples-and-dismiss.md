Status: done

# Prospect map legend with examples and dismiss

## Parent

`.scratch/territory-map-ux/PRD.md`

## What to build

Improve the **prospect map legend** on the territory map:

- Show **example markers** (live circle vs prospect diamond with sample segment fills), not text alone
- Allow the REA to **dismiss** the legend; dismissed state persists for the session until Purge or explicit restore

## Grill decisions

| Decision | Choice |
|----------|--------|
| Legend scope | Live vs prospective **shape** and **prospect launch readiness** segment fills only — not unallocated parkrun markers, not Event Ambassador border colour |
| Visual examples | Reuse production helpers: CSS/SVG live circle sample + `buildProspectMapMarkerHtml()` for sample diamonds; neutral sample colour (`rebeccapurple`, map default) |
| Sample readiness | Course found ✓, landowner permission ✗, funding confirmed ✓ (one grey segment) |
| Layout | Icon + label rows: sample marker left, short label right |
| Readiness rows | Live row, prospective row, one mixed-fill sample diamond row, three text-only positional labels (top / bottom-left / bottom-right), footer *Filled = confirmed; grey = not confirmed* |
| Panel heading | **Marker legend** |
| Dismiss control | × button, top-right; `aria-label="Dismiss marker legend"`; keyboard-focusable (Enter/Space); Escape does **not** dismiss |
| Dismiss persistence | Session storage flag (like overlay visibility); cleared on Purge; not in state export/import |
| Restore control | **Show marker legend** button, same bottom-left corner; same visual style as legend panel (white/translucent box, border) |
| Restore visibility | Same gate as legend: Prospective events overlay on **and** at least one visible prospect marker (respect ambassador filter) |
| Auto-show | When gate is met and legend not dismissed; no auto-restore while dismissed until Purge or explicit restore click |

## Agent brief

**Category:** enhancement  
**Summary:** Add visual marker examples and session-persisted dismiss/restore to the prospect map legend.

**Current behaviour:**  
`buildProspectMapLegendHtml()` in `prospectMapMarker.ts` renders text-only rows. `syncProspectMapLegend()` adds/removes the legend host; `.prospect-map-legend-host` has `pointer-events: none`. Visibility is driven from `populateMap.ts` via `syncProspectMapLegendVisibility()` — Prospective events overlay on and at least one prospect marker in layer after filter.

**Desired behaviour:**

**Legend content (Marker legend panel):**

1. Heading: **Marker legend**; × dismiss top-right  
2. Row: live circle sample + *Live event*  
3. Row: prospect diamond sample (all segments illustrative) + *Prospective event*  
4. Row: mixed-fill sample diamond (course ✓, landowner ✗, funding ✓)  
5. Text rows: *Course found — top*, *Landowner permission — bottom-left*, *Funding confirmed — bottom-right*  
6. Footer: *Filled = confirmed; grey = not confirmed*

**Dismiss / restore:**

- Dismiss sets session flag; legend removed; **Show marker legend** button appears (same corner, matching panel style)  
- Restore clears flag; legend re-rendered  
- Both respect existing visibility gate from issue 02  
- `sessionStorage.clear()` on Purge already clears flag

**Key interfaces:**

- `buildProspectMapLegendHtml()` — visual examples via reused marker HTML helpers  
- `syncProspectMapLegend()` — wire dismiss button, restore host, session dismiss flag; enable `pointer-events` on interactive host  
- New util (e.g. `prospectMapLegendDismiss.ts`) — get/set/clear session dismiss flag, mirroring `territoryMapOverlayVisibility.ts`  
- `populateMap.ts` — `syncProspectMapLegendVisibility()` passes dismiss state into legend sync  
- `public/style.css` — legend row layout, dismiss button, restore button; remove blanket `pointer-events: none` from host (or scope it)

**Acceptance criteria:**

- [ ] Legend includes visual examples of live circle and prospect diamond markers  
- [ ] Legend includes visual example of segment fill meaning (confirmed vs not confirmed)  
- [ ] Panel heading **Marker legend**; layout matches icon + label row grill  
- [ ] × dismiss is keyboard accessible  
- [ ] Dismissed state persists in session storage until Purge  
- [ ] **Show marker legend** restores after dismiss (map corner, matching panel style)  
- [ ] Legend auto-shows when gate met and not dismissed  
- [ ] Restore control uses same visibility gate as legend  
- [ ] Not included in state export/import  
- [ ] Tests updated; full test suite passes

**Out of scope:**

- Unallocated parkrun markers in legend  
- Event Ambassador border colour explanation  
- Persisting dismiss across browser sessions (localStorage)  
- Legend placement other than bottom-left

## Blocked by

None — issue 02 layer split is complete

## Notes

Domain term **Prospect map legend** in `CONTEXT.md`. No ADR — same session-storage pattern as ambassador name filter and overlay visibility.
