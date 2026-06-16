Status: ready-for-agent

# Debounce finish-import activation handlers

## What to build

Debounce `focus` / `visibilitychange` / `storage` handlers that call `attemptPendingFinishImport()` so rapid tab switches do not enqueue redundant work.

## Acceptance criteria

- [ ] Handlers debounced (~100 ms) without delaying first legitimate import
- [ ] Pending import still processes on `ambassy-finish-import-ready`
- [ ] Test: rapid focus events invoke at most one processing pass per debounce window

## Blocked by

None — can start immediately
