---
status: accepted
---

# File-only state export and import

REAs exchange working copies of Ambassy data between devices and colleagues. Earlier releases offered Share/Open with file, URL, clipboard, and native-share paths. URL and clipboard sharing proved unreliable at realistic state sizes (~1.5MB limits, long URLs) and confused less technical users.

Domain terms: `CONTEXT.md`.

## Decision

1. **Export** — one header control immediately downloads `ambassy-state-YYYY-MM-DD.json` (schema `2.0.0`). No dialog. Successful export marks state as saved for the unsaved-changes reminder.
2. **Import** — header file picker plus drag-and-drop of a `.json` file. Full replace of all persisted data in the export scope, with confirmation when local data exists or there are unsaved changes. No URL query import, clipboard paste, or native share for application state.
3. **Export scope** — allocations, ambassadors, prospective events, capacity limits, changes log, manually resolved event coordinates, parkrunner IDs, and visit histories. Exclude `events.json` catalogue cache, pending visit import payloads, and session-only UI state (e.g. ambassador name filter).
4. **Schema** — new exports use `2.0.0`. Import accepts `2.0.0` and legacy `1.0.0`; missing prospect and visit-history fields in older files default to empty.
5. **Removal** — delete URL sharing utilities, multi-method share dialog, and related types/tests. Visit-history clipboard import remains a separate flow (see ADR 0005).

## Considered options

**Keep URL sharing as fallback (rejected)** — preserves complexity and unreliable paths users already hit.

**Merge import (rejected)** — ambiguous ownership of allocations and prospects; full replace matches portable snapshot mental model.

**Export dialog (rejected)** — extra step without benefit once file-only export is the sole path.

## Consequences

- `specs/001-share-changes` is superseded for sharing methods; file export/import behaviour lives here and in `CONTEXT.md`.
- `ApplicationState` gains `prospectiveEvents` and `ambassadorFinishHistories`.
- Import must clear prospect and visit-history storage when absent from legacy `1.0.0` files.
- README and onboarding copy use Export/Import, not Share/Open.
