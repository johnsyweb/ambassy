Status: done

# Shared place location search module

## Parent

`.scratch/shared-place-location/PRD.md`

## What to build

Extract `bindPlaceLocationSearch` from Add Prospect: debounced search-first Photon, Places listbox, manual coordinates fallback, inline location status and errors. Support `immediate` commit (Reset Location) and `preview` commit (Issues address resolution).

## Acceptance criteria

- [ ] Single module owns search queue interaction and Places UI binding
- [ ] Unit tests cover single-result auto-resolve, multi-result list, empty → manual coords, preview mode
- [ ] Add Prospect refactored to use module without behaviour regression

## Blocked by

None - can start immediately
