Status: done

# Issue address resolution with shared place search

## Parent

`.scratch/shared-place-location/PRD.md`

## What to build

Upgrade Issues address dialog: shared place search in preview mode, editable state from EA/REA, parkrun URL field, **Resolve** commits picked coordinates via `resolveIssueWithCoordinates` (no second Photon call). Remove success `alert()` from issue resolution callback.

## Acceptance criteria

- [ ] Place pick updates address label and stores coordinates for Resolve
- [ ] Resolve persists `geocodedAddress` with URL metadata when provided
- [ ] No manual coordinates block in dialog
- [ ] Inline errors only

## Blocked by

- `.scratch/shared-place-location/issues/01-shared-place-location-module.md`
