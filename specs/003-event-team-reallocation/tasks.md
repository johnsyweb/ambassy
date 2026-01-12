# Tasks: Event Team Reallocation

**Input**: Design documents from `/specs/003-event-team-reallocation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included following Test-Driven Development principles from constitution. Tests MUST be written first and fail before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below follow single project structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification

- [ ] T001 Verify project structure matches implementation plan in specs/003-event-team-reallocation/plan.md
- [ ] T002 [P] Verify existing reallocation functions (`suggestEventReallocation`, `assignEventToAmbassador`) are available and tested
- [ ] T003 [P] Verify existing `SelectionState` model supports event selection tracking

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Create `getReallocationSuggestions` function wrapper in src/actions/getReallocationSuggestions.ts that finds current ambassador and calls `suggestEventReallocation()`
- [ ] T005 [P] Create `validateReallocation` function in src/actions/validateReallocation.ts to validate reallocation can be performed
- [ ] T006 [P] Create `reallocateEventTeam` function in src/actions/reallocateEventTeam.ts that performs reallocation using `assignEventToAmbassador()`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Select Event Team for Reallocation (Priority: P1) 🎯 MVP

**Goal**: Enable users to select an Event Team from the Event Teams table for reallocation. Selected row is visually highlighted and selection state is maintained.

**Independent Test**: Select a row in the Event Teams table, verify it is highlighted, verify selection state is tracked, and verify "Reallocate" button becomes enabled. This delivers value by enabling the user to identify which event they want to reallocate.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Write unit test for selection state tracking when row is selected in src/actions/populateEventTeamsTable.test.ts
- [ ] T008 [P] [US1] Write unit test for "Reallocate" button enabling when row is selected in src/actions/populateEventTeamsTable.test.ts
- [ ] T009 [P] [US1] Write integration test for selecting row and verifying selection state in src/actions/populateEventTeamsTable.test.ts

### Implementation for User Story 1

- [ ] T010 [US1] Add "Reallocate" button to Event Teams table row or table header in src/actions/populateEventTeamsTable.ts
- [ ] T011 [US1] Wire up "Reallocate" button to read `selectedEventShortName` from `SelectionState` in src/actions/populateEventTeamsTable.ts
- [ ] T012 [US1] Enable/disable "Reallocate" button based on selection state in src/actions/populateEventTeamsTable.ts
- [ ] T013 [US1] Ensure "Reallocate" button is keyboard accessible (Tab, Enter, Space) in src/actions/populateEventTeamsTable.ts
- [ ] T014 [US1] Add styles for "Reallocate" button in public/style.css

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can select an event and see the "Reallocate" button enabled.

---

## Phase 4: User Story 2 - View Prioritised Ambassador Suggestions (Priority: P2)

**Goal**: Display a prioritised list of potential Event Ambassadors for reallocating the selected event. Suggestions are scored based on capacity and proximity.

**Independent Test**: Select an event, click "Reallocate", verify dialog opens with prioritised suggestions showing ambassador name, score, reasons, and warnings. This delivers value by helping users choose the most appropriate recipient.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T015 [P] [US2] Write unit test for `getReallocationSuggestions` function finding current ambassador in src/actions/getReallocationSuggestions.test.ts
- [ ] T016 [P] [US2] Write unit test for `getReallocationSuggestions` function calling `suggestEventReallocation` with correct parameters in src/actions/getReallocationSuggestions.test.ts
- [ ] T017 [P] [US2] Write unit test for `showReallocationDialog` function displaying suggestions in src/actions/showReallocationDialog.test.ts
- [ ] T018 [P] [US2] Write unit test for `showReallocationDialog` function creating suggestion buttons in src/actions/showReallocationDialog.test.ts
- [ ] T019 [P] [US2] Write unit test for `showReallocationDialog` function displaying "Other" dropdown in src/actions/showReallocationDialog.test.ts
- [ ] T020 [P] [US2] Write integration test for opening dialog with suggestions in src/actions/showReallocationDialog.test.ts

### Implementation for User Story 2

- [ ] T021 [US2] Implement `getReallocationSuggestions` function in src/actions/getReallocationSuggestions.ts
- [ ] T022 [US2] Implement `showReallocationDialog` function in src/actions/showReallocationDialog.ts to display dialog
- [ ] T023 [US2] Create suggestion buttons (top 3-5) with ambassador name, score, reasons in src/actions/showReallocationDialog.ts
- [ ] T024 [US2] Create "Other" dropdown with all ambassadors in src/actions/showReallocationDialog.ts
- [ ] T025 [US2] Display warnings for suggestions that would exceed capacity in src/actions/showReallocationDialog.ts
- [ ] T026 [US2] Implement keyboard navigation (Tab, Enter, Arrow keys) in dialog in src/actions/showReallocationDialog.ts
- [ ] T027 [US2] Implement focus management (focus moves to dialog when opened, returns when closed) in src/actions/showReallocationDialog.ts
- [ ] T028 [US2] Add ARIA attributes for accessibility (`role="dialog"`, `aria-labelledby`) in src/actions/showReallocationDialog.ts
- [ ] T029 [US2] Wire up "Reallocate" button to call `showReallocationDialog` in src/actions/populateEventTeamsTable.ts
- [ ] T030 [US2] Ensure dialog HTML structure exists in public/index.html (reuse `#reallocationDialog`)

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently. Users can see prioritised suggestions when opening the reallocation dialog.

---

## Phase 5: User Story 3 - Complete Reallocation (Priority: P3)

**Goal**: Complete the reallocation by assigning the selected event to the chosen Event Ambassador. Update all data structures, persist changes, and refresh UI.

**Independent Test**: Select an event, choose a recipient from suggestions, verify event is removed from old ambassador, added to new ambassador, table data updated, changes persisted, and UI refreshed. This delivers value by completing the reallocation workflow.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T031 [P] [US3] Write unit test for `validateReallocation` function with valid reallocation in src/actions/validateReallocation.test.ts
- [ ] T032 [P] [US3] Write unit test for `validateReallocation` function with invalid ambassador in src/actions/validateReallocation.test.ts
- [ ] T033 [P] [US3] Write unit test for `validateReallocation` function with no-op reallocation (same ambassador) in src/actions/validateReallocation.test.ts
- [ ] T034 [P] [US3] Write unit test for `validateReallocation` function with unassigned event in src/actions/validateReallocation.test.ts
- [ ] T035 [P] [US3] Write unit test for `reallocateEventTeam` function performing assignment in src/actions/reallocateEventTeam.test.ts
- [ ] T036 [P] [US3] Write unit test for `reallocateEventTeam` function updating EventTeamsTableData in src/actions/reallocateEventTeam.test.ts
- [ ] T037 [P] [US3] Write unit test for `reallocateEventTeam` function persisting changes in src/actions/reallocateEventTeam.test.ts
- [ ] T038 [P] [US3] Write unit test for `reallocateEventTeam` function recalculating capacity statuses in src/actions/reallocateEventTeam.test.ts
- [ ] T039 [P] [US3] Write unit test for `reallocateEventTeam` function logging changes in src/actions/reallocateEventTeam.test.ts
- [ ] T040 [P] [US3] Write integration test for complete reallocation flow in src/actions/reallocateEventTeam.test.ts
- [ ] T041 [P] [US3] Write unit test for error handling in `reallocateEventTeam` function in src/actions/reallocateEventTeam.test.ts

### Implementation for User Story 3

- [ ] T042 [US3] Implement `validateReallocation` function in src/actions/validateReallocation.ts
- [ ] T043 [US3] Implement `reallocateEventTeam` function in src/actions/reallocateEventTeam.ts
- [ ] T044 [US3] Call `assignEventToAmbassador` from `reallocateEventTeam` in src/actions/reallocateEventTeam.ts
- [ ] T045 [US3] Update `EventTeamsTableData` in `reallocateEventTeam` in src/actions/reallocateEventTeam.ts
- [ ] T046 [US3] Persist changes via `persistEventAmbassadors` and `persistEventTeams` in src/actions/reallocateEventTeam.ts
- [ ] T047 [US3] Recalculate capacity statuses via `calculateAllCapacityStatuses` in src/actions/reallocateEventTeam.ts
- [ ] T048 [US3] Log reallocation change to changelog in src/actions/reallocateEventTeam.ts
- [ ] T049 [US3] Wire up suggestion buttons to call `reallocateEventTeam` with validation in src/actions/showReallocationDialog.ts
- [ ] T050 [US3] Wire up "Other" dropdown to call `reallocateEventTeam` with validation in src/actions/showReallocationDialog.ts
- [ ] T051 [US3] Implement error handling (try-catch, alert, revert) in src/actions/showReallocationDialog.ts
- [ ] T052 [US3] Close dialog after successful reallocation in src/actions/showReallocationDialog.ts
- [ ] T053 [US3] Refresh UI after reallocation in src/actions/showReallocationDialog.ts (call `refreshUI()`)
- [ ] T054 [US3] Clear selection state after successful reallocation (optional - or keep selection) in src/actions/showReallocationDialog.ts

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently. Users can complete reallocation and see changes reflected in the UI.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T055 [P] Add error messages for edge cases (no suggestions, invalid selection) in src/actions/showReallocationDialog.ts
- [ ] T056 [P] Ensure all user-facing text uses Australian English in src/actions/showReallocationDialog.ts and src/actions/reallocateEventTeam.ts
- [ ] T057 [P] Add loading state/indicator while suggestions are being calculated in src/actions/showReallocationDialog.ts
- [ ] T058 [P] Verify keyboard shortcuts work correctly (Escape to close, Tab navigation) in src/actions/showReallocationDialog.ts
- [ ] T059 [P] Add unit tests for edge cases (empty suggestions, missing data) in test files
- [ ] T060 [P] Verify accessibility (screen reader announcements, focus management) in src/actions/showReallocationDialog.ts
- [ ] T061 [P] Code cleanup and refactoring (extract common logic, reduce duplication)
- [ ] T062 [P] Performance optimization (cache suggestions if needed, debounce if applicable)
- [ ] T063 [P] Run quickstart.md validation - verify all flows documented work correctly
- [ ] T064 [P] Update README.md if feature affects setup or usage instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P3)
  - US2 depends on US1 (needs selection state)
  - US3 depends on US2 (needs dialog)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 completion (needs selection state and "Reallocate" button)
- **User Story 3 (P3)**: Depends on US2 completion (needs dialog to trigger reallocation)

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Foundation functions before UI functions
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All tests for a user story marked [P] can run in parallel
- Polish tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Reuse existing functions (`suggestEventReallocation`, `assignEventToAmbassador`) - do not modify them
- Follow existing code patterns and structure
- Ensure keyboard accessibility throughout
- Use Australian English for all user-facing text
