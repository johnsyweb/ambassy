# Tasks: End of Prospect Lifecycle (Launch & Archive Prospect)

**Input**: Design documents from `/specs/012-prospect-goes-live/`  
**Prerequisites**: `plan.md` ✅, `spec.md` ✅, `research.md` ✅, `data-model.md` ✅, `contracts/` ✅

**Tests**: Tests are REQUIRED per Constitution (Test-Driven Development). All production code must have tests.  
**Organisation**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1–US4 as defined in `spec.md`
- Use absolute or aliased paths in descriptions (e.g. `@actions/*`, `@models/*`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm project and documentation state for this feature.

- [x] T001 Verify documentation set for 012 exists and is consistent (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/launch-archive-contracts.md`, `quickstart.md`)
- [x] T002 [P] Verify existing prospect infrastructure is ready to extend: `@models/ProspectiveEvent`, `@models/ProspectiveEventList`, `@actions/persistProspectiveEvents`, `@actions/populateProspectsTable`
- [x] T003 [P] Review existing change log and capacity patterns in `@actions/trackChanges.ts`, `@actions/checkCapacity.ts`, `@actions/persistState.ts` to mirror for launch/archive

**Checkpoint**: Ready to design and implement lifecycle-specific actions.

---

## Phase 2: Foundational Actions & Contracts (Blocking Prerequisites)

**Purpose**: Core lifecycle and matching actions used by the UI.

> **NOTE**: Tests MUST be written and FAIL before implementation.

### Tests for Foundational Actions

- [x] T010 [P] [US1] Create unit tests for `launchProspect` in `src/actions/launchProspect.test.ts`
  - Happy path: prospect with EA is launched → removed from prospects, EA prospective count decremented, capacity recalculated, change logged
  - Edge: prospect without EA → still removed, no EA mutation
- [x] T011 [P] [US2] Create unit tests for `archiveProspect` in `src/actions/archiveProspect.test.ts`
  - Happy path: prospect with EA is archived → removed from prospects, EA prospective count decremented, change logged as "not viable"
  - Edge: prospect without EA → still removed, log reflects unassigned prospect
- [x] T012 [P] [US3] Create unit tests for `findMatchingEvents` in `src/actions/findMatchingEvents.test.ts`
  - Returns candidate events by name and location similarity
  - Handles no matches, multiple matches, and missing coordinates gracefully

### Implementation for Foundational Actions

- [x] T020 [US1] Implement `launchProspect` in `src/actions/launchProspect.ts` following `contracts/launch-archive-contracts.md`
  - Remove prospect, update EA prospective events, recalculate capacity, persist state, append change-log entry (`Prospect Launched`)
- [x] T021 [US2] Implement `archiveProspect` in `src/actions/archiveProspect.ts`
  - Same structural flow as `launchProspect` but log as archived/not viable (`Prospect Archived`)
- [x] T022 [US3] Implement `findMatchingEvents` in `src/actions/findMatchingEvents.ts`
  - Use `@actions/searchEvents` and `EventDetailsMap` to return possible live events for a prospect based on name + coordinate proximity

**Checkpoint**: Lifecycle actions and event matching exist with tests; UI can now call them.

---

## Phase 3: User Story 1 – Launch Prospect (P1)

**Goal**: REA can mark a single prospect as launched from the Prospects table; prospect is removed, EA prospective allocation updated, map and tables refreshed, change logged.

### Tests for User Story 1

- [x] T030 [P] [US1] Add tests for Launch button wiring in `src/actions/populateProspectsTable.test.ts`
  - Asserts that a Launch button is rendered for each prospect row with correct label and ARIA attributes
  - Verifies clicking the button calls a launch handler with the correct prospect ID
- [x] T031 [US1] Add integration-style tests in `src/index.test.ts` (or new test) to cover:
  - Launching a prospect removes it from Prospects table and map
  - EA capacity counts update after launch
  - Change log row for "Prospect Launched" is visible

### Implementation for User Story 1

- [x] T040 [US1] Replace the single "🗑️ Remove" button in `@actions/populateProspectsTable` with separate Launch and Archive buttons in the Actions column (side-by-side with Reallocate and Reset Location)
- [x] T041 [US1] Add `handleProspectLifecycleChange` helper in `@actions/populateProspectsTable` to:
  - Confirm irreversible action with the user
  - Remove the prospect, update EA prospective events, recalc capacity, persist state, update change log, and refresh UI
- [x] T042 [US1] Refactor Launch path in `@actions/populateProspectsTable` to call `launchProspect` from `@actions/launchProspect` instead of duplicating lifecycle logic
- [x] T043 [US1] Ensure Launch path removes prospect marker from map via existing refresh flow (`@actions/refreshUI`, `@actions/populateMap`)

**Checkpoint**: Launching a prospect end-to-end works and is covered by tests.

---

## Phase 4: User Story 2 – Archive Prospect (P1)

**Goal**: REA can archive a prospect as not viable; it is removed from Prospects table, EA prospective allocation updated, and change log records the archive.

### Tests for User Story 2

- [x] T050 [P] [US2] Add tests for Archive button wiring in `src/actions/populateProspectsTable.test.ts`
  - Asserts that an Archive button is rendered with correct label and ARIA attributes
  - Verifies clicking the button calls an archive handler with the correct prospect ID
- [x] T051 [US2] Add tests for logging semantics (type "Prospect Archived", "not viable" wording) in `launch-archive` tests

### Implementation for User Story 2

- [x] T060 [US2] Refactor Archive path in `@actions/populateProspectsTable` to call `archiveProspect` from `@actions/archiveProspect`
- [x] T061 [US2] Ensure Archive path mirrors Launch behaviour for:
  - Removing prospect from ProspectiveEventList and EA prospective events
  - Updating capacity, persisting state, refreshing table/map
  - Logging a "Prospect Archived" entry with "not viable" in the description

**Checkpoint**: Archiving a prospect is fully functional and tested.

---

## Phase 5: User Story 3 – Allocate Event When Prospect Launches (P2)

**Goal**: When launching a prospect, system offers matching live events and optional allocation to an EA.

### Tests for User Story 3

- [x] T070 [P] [US3] Add unit tests for `findMatchingEvents` scoring and ordering in `src/actions/findMatchingEvents.test.ts`
- [ ] T071 [US3] Add tests for the launch flow with event matching in a new test file (e.g. `src/actions/launchProspect.integration.test.ts`)
  - Launch with matches: user sees list, selects an event, event is (optionally) allocated to EA
  - Launch with no matches: system allows launch without allocation

### Implementation for User Story 3

- [ ] T080 [US3] Integrate `findMatchingEvents` into `launchProspect`:
  - On launch, compute candidate events and include them in return type for UI to present
- [ ] T081 [US3] Add UI flow to present matching events and EA allocation options (following `showEventAllocationDialog` pattern or a lightweight dialog):
  - Show all potential matches (by name + location similarity)
  - Allow selection of an event or "Proceed without allocation"
- [ ] T082 [US3] Wire selected event into existing allocation logic (`@actions/assignEventToAmbassador`) when user chooses to allocate during launch

**Checkpoint**: Launch flow can optionally allocate a matching live event during the transition.

---

## Phase 6: User Story 4 – Handle Prospect Without Existing Event (P2)

**Goal**: Launch flow must work even when no corresponding event exists in `EventDetailsMap`.

### Tests for User Story 4

- [x] T090 [US4] Add tests for launch with no matching events:
  - `findMatchingEvents` returns empty
  - Launch completes, prospect removed, no event allocation attempted

### Implementation for User Story 4

- [x] T100 [US4] Ensure `launchProspect` and its UI correctly handle the "no matches" case:
  - Skip event allocation UI when there are no matches
  - Still perform full lifecycle transition and logging

**Checkpoint**: Launch flow is robust when events.json does not yet contain the new event.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Ensure accessibility, consistency, and auditability across Launch/Archive flows.

- [x] T110 [P] Add ARIA attributes and keyboard focus behaviour for any new launch/allocation dialogs (re-use patterns from `showAddProspectDialog`)
- [x] T111 [P] Verify Australian English is used in all new user-facing text (Launch, Archive, matching messages)
- [x] T112 [P] Ensure Launch/Archive actions are fully keyboard accessible from the Prospects table (Tab/Shift+Tab navigation, Enter/Space activation)
- [x] T113 [P] Update `README.md` and `quickstart.md` to describe the end-of-lifecycle flows (Launch and Archive, including event allocation where applicable)
- [x] T114 [P] Run full test suite (`npm test`) and ensure new tests pass
- [x] T115 [P] Run linting (`npm run lint`) and fix any issues
- [x] T116 [P] Run TypeScript type-check (`tsc --noEmit` or equivalent) and fix any issues

---

## Dependencies & Execution Order

- **Phase 1 (Setup)** must complete before Foundational actions (Phase 2).
- **Phase 2 (Foundational)** must complete before Launch/Archive UI is fully refactored to use shared actions.
- **User Story 1 & 2 (Launch/Archive)** depend on Foundational actions but can be evolved incrementally from the current inline `handleProspectLifecycleChange` implementation.
- **User Story 3 & 4 (Event matching during Launch)** depend on `findMatchingEvents` and `launchProspect`.
- **Polish (Phase 7)** depends on all required user stories for this release being complete.

Within each story:

- Tests MUST be written before implementation.
- Helper functions and core actions come before UI wiring.
- UI wiring and integration come before polish.

