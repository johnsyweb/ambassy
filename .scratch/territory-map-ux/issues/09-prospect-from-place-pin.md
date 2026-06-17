Status: ready

# Add prospective event from place pin

## Parent

`.scratch/territory-map-ux/PRD.md`

## Depends on

- `.scratch/territory-map-ux/issues/06-map-search-event-prospect-town.md` (temporary place pin)

## What to build

When an REA selects a **place** from **territory map search**, a **temporary place pin** marks the location. Extend that pin with an action to start adding a **prospective event** at that place — reusing the existing add-prospect flow with coordinates pre-filled.

## Grill decisions

| Decision | Choice |
|----------|--------|
| Trigger UI | **Leaflet popup** on the place pin with **Add prospective event here** (not auto-open dialog on place select) |
| Popup open | **Click pin** to open popup — not auto-open on place select |
| Pre-fill | **Address** ← Nominatim place label; **prospect name** and **state** blank; coords from pin |
| Coords in dialog | **Pinned by default**; editing address/state may **re-geocode** and replace coords (normal dialog path) |
| Pin drag | **Draggable before dialog opens** only; fine-tune on map, then open dialog; in-dialog changes via re-geocode |
| Pin lifetime | Until next search or map click; **clear on successful create only** (cancel keeps pin) |
| Keyboard | **Both**: focusable pin (Enter opens popup) **and** search status **Open place actions** control |
| `geocodingStatus` | **`success`** if coords unchanged from place search; **`manual`** if pin dragged without re-geocode; **re-geocode → `success`** (final source wins) |
| Scope | Reuse `showAddProspectDialog` / `createProspectFromAddress`; extend `temporaryPlacePin` with label, popup, drag |

## Agent brief

**Category:** enhancement  
**Summary:** Let REAs create a prospective event from a territory map search place pin.

**Current behaviour (after issue 06):**  
Place search drops a temporary pin and pans the map. No create action.

**Desired behaviour:**

- Place pin stores label + coordinates; pin is **draggable** until add-prospect dialog opens
- REA **clicks pin** (or uses **Open place actions** in search status) to open popup with place name + **Add prospective event here**
- Opens existing add-prospect dialog with address pre-filled and coords from pin; prospect name and state blank
- On successful create, refresh map/prospects as today and **clear pin**; on cancel, pin remains
- Map click or next search still clears pin as today

**Acceptance criteria:**

- [ ] Popup with add action appears on pin click; not auto-opened on place select
- [ ] Pin draggable before dialog; drag updates stored coordinates
- [ ] Keyboard: focusable pin + search status control both open popup
- [ ] Dialog opens with address and coords pre-filled; name and state required
- [ ] Address re-geocode in dialog can replace coords; `geocodingStatus` reflects final coords source
- [ ] Successful create persists prospect, refreshes UI, clears pin; cancel leaves pin
- [ ] No change to place-only search when REA does not use create action
- [ ] Tests updated; full test suite passes

**Implementation notes:**

- Extend `setTemporaryPlacePin(map, lat, lng, label, onAddProspect?)` — popup bound to marker, `dragend` tracks moved coords vs original Nominatim point
- Pass place label from `initializeTerritoryMapSearch` place selection into pin
- Extend `showAddProspectDialog` with optional `initialPlace?: { address, coordinates }` pre-fill
- Stop pin click from triggering map-click clear handler
- Update `CONTEXT.md` **Temporary place pin** workflow when implemented

**Out of scope:**

- Creating live event allocations from place pin
- Dragging pin while add-prospect dialog is open
- Issue 07 NZ geocoding feedback (may improve address pre-fill later)

## Blocked by

- Issue 06 temporary place pin (done)

## Notes

Domain: extends **Temporary place pin** workflow. See `CONTEXT.md`.
