Status: ready-for-agent

# Keep parsed events catalogue in memory

## What to build

After first `getEvents()` parse of the `localStorage` cache, hold the `EventDetailsMap` in a module singleton so hot paths do not re-parse the ~915 KB JSON blob.

## Acceptance criteria

- [ ] Second `getEvents()` call returns cached map without `JSON.parse` of full catalogue
- [ ] Cache invalidates when `fetchEvents()` refreshes data or `persistEventDetails()` updates
- [ ] Tests cover cache hit and invalidation

## Blocked by

None — can start immediately
