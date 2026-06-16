Status: done

# Keep parsed events catalogue in memory

## What to build

After first `getEvents()` parse of the `localStorage` cache, hold the `EventDetailsMap` in a module singleton so hot paths do not re-parse the ~915 KB JSON blob.

## Acceptance criteria

- [x] Second `getEvents()` call returns cached map without `JSON.parse` of full catalogue
- [x] Cache invalidates when `fetchEvents()` refreshes data or `persistEventDetails()` updates
- [x] Tests cover cache hit and invalidation

## Blocked by

None — can start immediately
