Status: done

# Prospect location reset with shared place search

## Parent

`.scratch/shared-place-location/PRD.md`

## What to build

Replace inline Reset Location dialog with `showProspectLocationDialog` using shared place search. Immediate save of coordinates, state, country; browser geolocation retained; inline feedback only.

## Acceptance criteria

- [ ] State/Region → Address field order with editable state pre-filled from prospect
- [ ] Places flow matches Add Prospect; manual coords when Places empty
- [ ] Browser geolocation sets `"manual"`; Photon paths set `"success"`
- [ ] No `alert()` on success or geocoding errors

## Blocked by

- `.scratch/shared-place-location/issues/01-shared-place-location-module.md`
