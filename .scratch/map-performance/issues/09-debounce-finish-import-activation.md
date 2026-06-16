Status: done

# Debounce finish-import activation handlers

## What to build

Debounce `focus` / `visibilitychange` / `storage` handlers that call `attemptPendingFinishImport()` so rapid tab switches do not enqueue redundant work.

## Acceptance criteria

- [x] Handlers debounced (~100 ms) without delaying first legitimate import
- [x] Pending import still processes on `ambassy-finish-import-ready`
- [x] Test: rapid focus events invoke at most one processing pass per debounce window

## Blocked by

None — can start immediately
