Status: needs-triage

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
| Trigger | **Add prospective event here** control on or beside the temporary place pin (not auto-open dialog on place select) |
| Pre-fill | Coordinates from pin; place display name as suggested prospect name or address field |
| Pin lifetime | Pin remains until next search or map click; create action available while pin is visible |
| Scope | Reuse `showAddProspectDialog` / `createProspectFromAddress`; minimal new UI |

## Agent brief

**Category:** enhancement  
**Summary:** Let REAs create a prospective event from a territory map search place pin.

**Current behaviour (after issue 06):**  
Place search drops a temporary pin and pans the map. No create action.

**Desired behaviour:**

- While temporary place pin is visible, REA can choose **Add prospective event here**
- Opens existing add-prospect dialog with coordinates pre-filled from pin location
- Place label seeds address or prospect name field where sensible
- On successful create, refresh map/prospects as today; pin cleared after dialog completes or on next search

**Acceptance criteria:**

- [ ] Add action is keyboard accessible while pin is visible
- [ ] Dialog opens with coordinates pre-filled from pin
- [ ] Successful create persists prospect and refreshes UI
- [ ] No change to place-only search when REA does not use create action
- [ ] Tests updated; full test suite passes

**Out of scope:**

- Dragging pin to adjust location
- Creating live event allocations from place pin
- Issue 07 NZ geocoding feedback (may improve address pre-fill later)

## Blocked by

- Issue 06 temporary place pin

## Notes

Domain: extends **Temporary place pin** workflow. See `CONTEXT.md` when grilled.
