Status: done

# Event team reallocate without row selection

## Parent

`.scratch/territory-map-ux/PRD.md`

## What to build

On the **Event Teams** tab, the Reallocate control on each row should work without requiring that row to be selected first. Selection may still highlight the row for map sync, but reallocation is available from the row action directly.

## Acceptance criteria

- [ ] Reallocate button on an Event Teams row is enabled regardless of row selection state
- [ ] Clicking Reallocate on a row opens the same reallocation flow as today for that event
- [ ] Keyboard activation (Enter/Space on focused button) still works
- [ ] Map/table selection behaviour is unchanged unless required for the reallocation dialog
- [ ] Tests updated; full test suite passes

## Blocked by

None — can start immediately
