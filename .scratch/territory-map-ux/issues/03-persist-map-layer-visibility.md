Status: done

# Persist map layer visibility

## Parent

`.scratch/territory-map-ux/PRD.md`

## What to build

Remember which map overlays the REA has turned on or off across page reloads within the session (same persistence model as **ambassador name filter** — session storage, cleared on Purge).

## Acceptance criteria

- [ ] Live events, prospective events, and REA territory polygon visibility restore after reload when session data exists
- [ ] Layer preferences clear on Purge with other session UI state
- [ ] Layer preferences are not included in state export/import
- [ ] Sensible defaults when no saved preference exists (all layers visible)
- [ ] Tests updated; full test suite passes

## Blocked by

- `.scratch/territory-map-ux/issues/02-separate-live-and-prospect-map-layers.md`
