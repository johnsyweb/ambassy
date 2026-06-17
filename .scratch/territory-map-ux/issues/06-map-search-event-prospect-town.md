Status: done

# Map search for event, prospect, and town

## Parent

`.scratch/territory-map-ux/PRD.md`

## What to build

Add **territory map search** on the territory map so an REA can find and fly to:

- A **live event** by name (allocated or unallocated in `events.json`)
- A **prospective event** by name
- A **town or place** (Nominatim, privacy model per README)

Separate from the **ambassador name filter** (filtering vs navigation).

## Grill decisions

| Decision | Choice |
|----------|--------|
| Purpose vs ambassador filter | **Navigation only** — full local catalogue; pan/zoom even when filter hides marker |
| Filter-hidden feedback | Muted *Hidden by ambassador name filter* suffix on matching rows **and** post-selection `aria-live` status |
| Control placement | Top-left overlay on `#mapContainer` |
| Suggestion layout | Grouped sections: **Live events**, **Prospective events**, **Places** (empty sections hidden) |
| Nominatim timing | Parallel after ~300 ms debounce, query ≥3 characters |
| Result limits | Live events 10, Prospective events 10, Places 5 |
| Live event rows | Event name; muted *Unallocated* suffix when not in Event Teams |
| Prospect rows | Include prospects without coordinates; muted *No location* suffix |
| Selection — live event (allocated) | Pan/zoom, highlight marker, Event Teams tab + row selected |
| Selection — live event (unallocated) | Pan/zoom, highlight if marker drawable; no Event Teams row |
| Selection — prospect (with coordinates) | Pan/zoom, Prospects tab + row selected |
| Selection — prospect (no coordinates) | Prospects tab + row selected; status *No map location — geocode from the Prospects table*; no auto-geocode |
| Selection — place | Pan/zoom at zoom 13; **temporary place pin**; cleared on next search selection or map click |
| Prospect from place pin | **Out of scope** — separate slice (pin only in v1) |
| Keyboard shortcut | `Ctrl+K` / `Cmd+K` focuses search (when not in another text field); `/` remains ambassador filter |

## Agent brief

**Category:** enhancement  
**Summary:** Add territory map search with grouped autocomplete, Nominatim place lookup, and navigation that composes with the ambassador name filter.

**Current behaviour:**  
No map search control. REAs navigate via table row clicks (`selectEventTeamRow`, `selectProspectRow`) or marker clicks. Event name fuzzy match exists in `searchEvents()` (max 10). Nominatim geocoding exists in `@utils/geocoding` / `@utils/geography`. Ambassador name filter uses `/` shortcut above data tabs.

**Desired behaviour:**

**Search UI (top-left on map):**

- Labelled input (e.g. **Find on map**) with combobox/listbox suggestions
- `Ctrl+K` / `Cmd+K` focuses input
- Keyboard navigable suggestions; Escape closes list

**Search logic:**

- **Live events:** `searchEvents()` against full `eventDetails`; show long name; *Unallocated* when absent from `eventTeamsTableData`; max 10
- **Prospective events:** fuzzy/substring match on `prospectEvent` (reuse or extend fuzzy utilities); *No location* when not geocoded; max 10
- **Places:** debounced Nominatim (≥3 chars, limit 5); display Nominatim label; no CSV/ambassador data sent

**On result selection:**

- Reuse `centerMapOnEvents` / `highlightEventsOnMap` / table-map navigation where applicable
- Filter-hidden targets: still pan; show suffix + status message
- Place: temporary pin layer; remove on next search pick or map click
- Do **not** open allocation dialog automatically for unallocated events

**Key interfaces:**

- New module(s) e.g. `territoryMapSearch.ts` + `initializeTerritoryMapSearch()` wired from `index.ts` after map init
- Nominatim place search helper (may extend `@utils/geocoding` with multi-result + limit)
- Prospect name search helper (parallel to `searchEvents`)
- Temporary place pin on map (separate layer or marker; clear API)
- CSS for top-left search host (match legend panel visual family)

**Acceptance criteria:**

- [ ] Search input keyboard accessible on map view; `Ctrl+K` / `Cmd+K` focuses it
- [ ] Grouped suggestions: Live events, Prospective events, Places
- [ ] Live events include allocated and unallocated; unallocated labelled
- [ ] Prospects include no-location rows with appropriate selection behaviour
- [ ] Selecting a result pans/zooms; highlights marker when one exists
- [ ] Filter-hidden targets show row suffix and post-selection status
- [ ] Place selection drops temporary pin (cleared on next search or map click)
- [ ] Nominatim place search; no allocation CSV data sent
- [ ] Not confused with ambassador name filter
- [ ] Tests updated; full test suite passes

**Out of scope:**

- Add prospective event from place pin (follow-on slice)
- Changing ambassador name filter behaviour
- Persisting last search query
- Map search in state export/import
- Issue 07 NZ geocoding feedback (may share Nominatim helpers later)

## Blocked by

None

## Notes

Domain term **Territory map search** and **temporary place pin** in `CONTEXT.md`. No ADR — navigation vs filter distinction follows ADR 0006 spirit; map search is complementary, not a filter mode.
