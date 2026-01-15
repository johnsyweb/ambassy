# Tasks: Map Event Allocation

**Input**: Design documents from `/specs/010-map-event-allocation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included following TDD principles as required by the constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- All paths use absolute paths from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project structure matches implementation plan in `/Users/paj/src/parkrun/ambassy/specs/010-map-event-allocation/plan.md`
- [x] T002 [P] Review existing codebase patterns for dialog components in `/Users/paj/src/parkrun/ambassy/src/actions/showReallocationDialog.ts`
- [x] T003 [P] Review existing map click handler patterns in `/Users/paj/src/parkrun/ambassy/src/actions/tableMapNavigation.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Review existing `assignEventToAmbassador` function in `/Users/paj/src/parkrun/ambassy/src/actions/assignEventToAmbassador.ts` to understand allocation pattern
- [x] T005 Review existing `getRegionalAmbassadorForEventAmbassador` utility in `/Users/paj/src/parkrun/ambassy/src/utils/regions.ts` to understand REA lookup
- [x] T006 Review existing `extractEventTeamsTableData` function in `/Users/paj/src/parkrun/ambassy/src/models/EventTeamsTable.ts` to understand table data generation
- [x] T007 Review existing `populateMap` function in `/Users/paj/src/parkrun/ambassy/src/actions/populateMap.ts` to understand map rendering patterns

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Allocate Event Ambassador from Map (Priority: P1) 🎯 MVP

**Goal**: Enable users to select an unallocated event from the map and assign it to an Event Ambassador, with automatic REA assignment and change logging.

**Independent Test**: Click an unallocated event marker on the map, select an Event Ambassador from a dialog, and verify the event is assigned. The event should appear in the Event Teams table with EA and REA information, and the change should be logged.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 [P] [US1] Write unit test for `allocateEventFromMap` function in `/Users/paj/src/parkrun/ambassy/src/actions/allocateEventFromMap.test.ts`
- [x] T009 [P] [US1] Write unit test for `showEventAllocationDialog` function in `/Users/paj/src/parkrun/ambassy/src/actions/showEventAllocationDialog.test.ts`
- [x] T010 [P] [US1] Write unit test for extended `selectMapEvent` with unallocated event detection in `/Users/paj/src/parkrun/ambassy/src/actions/tableMapNavigation.test.ts`
- [x] T011 [US1] Write integration test for end-to-end allocation flow in `/Users/paj/src/parkrun/ambassy/src/actions/allocateEventFromMap.integration.test.ts`

### Implementation for User Story 1

- [x] T012 [US1] Create `allocateEventFromMap` function in `/Users/paj/src/parkrun/ambassy/src/actions/allocateEventFromMap.ts` that calls `assignEventToAmbassador` with empty string for old EA
- [x] T013 [US1] Create `showEventAllocationDialog` function in `/Users/paj/src/parkrun/ambassy/src/actions/showEventAllocationDialog.ts` (or extend `showReallocationDialog.ts`) for EA selection
- [x] T014 [US1] Extend `selectMapEvent` function in `/Users/paj/src/parkrun/ambassy/src/actions/tableMapNavigation.ts` to detect unallocated events and show allocation dialog
- [x] T015 [US1] Update map click handler in `/Users/paj/src/parkrun/ambassy/src/index.ts` to pass `eventTeamsTableData` and other required parameters to `selectMapEvent`
- [x] T016 [US1] Add error handling for case when no Event Ambassadors exist in `showEventAllocationDialog` in `/Users/paj/src/parkrun/ambassy/src/actions/showEventAllocationDialog.ts`
- [x] T017 [US1] Add validation in `allocateEventFromMap` in `/Users/paj/src/parkrun/ambassy/src/actions/allocateEventFromMap.ts` to ensure selected EA exists
- [x] T018 [US1] Ensure change logging in `allocateEventFromMap` in `/Users/paj/src/parkrun/ambassy/src/actions/allocateEventFromMap.ts` includes event name, assigned EA, and supporting REA

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can click unallocated events on the map and allocate them to EAs.

---

## Phase 4: User Story 2 - Display Event Information in Table (Priority: P2)

**Goal**: Display complete event information including Event Directors in the Event Teams table for allocated events, ensuring all available information is shown.

**Independent Test**: Verify that events with known Event Directors display this information in the Event Teams table, along with coordinates, series, and country information. Events without Event Directors should show "N/A".

### Tests for User Story 2

- [x] T019 [P] [US2] Write unit test for Event Directors display in Event Teams table in `/Users/paj/src/parkrun/ambassy/src/actions/populateEventTeamsTable.test.ts`
- [x] T020 [P] [US2] Write unit test for Event Directors in map tooltips in `/Users/paj/src/parkrun/ambassy/src/actions/populateMap.test.ts`
- [x] T021 [US2] Write integration test for Event Directors display after allocation in `/Users/paj/src/parkrun/ambassy/src/actions/allocateEventFromMap.integration.test.ts`

### Implementation for User Story 2

- [x] T022 [US2] Verify `extractEventTeamsTableData` in `/Users/paj/src/parkrun/ambassy/src/models/EventTeamsTable.ts` correctly includes Event Directors from `EventTeam` model (already implemented, verify)
- [x] T023 [US2] Verify `populateEventTeamsTable` in `/Users/paj/src/parkrun/ambassy/src/actions/populateEventTeamsTable.ts` displays Event Directors column correctly (already implemented, verify)
- [x] T024 [US2] Update `populateMap` in `/Users/paj/src/parkrun/ambassy/src/actions/populateMap.ts` to include Event Directors in tooltip for allocated events (already implemented, verify)
- [x] T025 [US2] Ensure newly allocated events from map include Event Directors in table after `extractEventTeamsTableData` regeneration (verified via integration test)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Allocated events display complete information including Event Directors in both table and map tooltips.

---

## Phase 5: User Story 3 - Update Map View After Allocation (Priority: P3)

**Goal**: Update the map view immediately after allocating an event to show visual confirmation with updated marker appearance (color, size) and tooltip information.

**Independent Test**: Allocate an event from the map and verify that the event marker updates its appearance (size, color) to reflect the new EA allocation, and that the event appears in Voronoi polygons if applicable.

### Tests for User Story 3

- [x] T026 [P] [US3] Write unit test for map refresh after allocation in `/Users/paj/src/parkrun/ambassy/src/actions/populateMap.test.ts`
- [x] T027 [P] [US3] Write unit test for marker appearance update in `/Users/paj/src/parkrun/ambassy/src/actions/populateMap.test.ts`
- [x] T028 [US3] Write integration test for map update flow after allocation in `/Users/paj/src/parkrun/ambassy/src/actions/allocateEventFromMap.integration.test.ts`

### Implementation for User Story 3

- [x] T029 [US3] Update allocation callback in `/Users/paj/src/parkrun/ambassy/src/index.ts` to regenerate `eventTeamsTableData` using `extractEventTeamsTableData` after allocation
- [x] T030 [US3] Update allocation callback in `/Users/paj/src/parkrun/ambassy/src/index.ts` to call `populateMap` with updated `eventTeamsTableData` after allocation (via refreshUI)
- [x] T031 [US3] Update allocation callback in `/Users/paj/src/parkrun/ambassy/src/index.ts` to call `populateEventTeamsTable` with updated `eventTeamsTableData` after allocation (via refreshUI)
- [x] T032 [US3] Ensure `populateMap` in `/Users/paj/src/parkrun/ambassy/src/actions/populateMap.ts` correctly renders newly allocated events with EA color and larger size (already implemented, verified)
- [x] T033 [US3] Ensure `populateMap` in `/Users/paj/src/parkrun/ambassy/src/actions/populateMap.ts` includes newly allocated events in Voronoi polygon calculations (already implemented, verified)
- [x] T034 [US3] Add table row highlighting or scrolling after allocation in `/Users/paj/src/parkrun/ambassy/src/index.ts` to show newly allocated event in Event Teams table

**Checkpoint**: All user stories should now be independently functional. Map updates immediately after allocation, showing visual confirmation with updated markers and tooltips.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T035 [P] Add keyboard accessibility to allocation dialog in `/Users/paj/src/parkrun/ambassy/src/actions/showEventAllocationDialog.ts` (Tab, Enter, Escape)
- [x] T036 [P] Ensure all user-facing text uses Australian English in `/Users/paj/src/parkrun/ambassy/src/actions/showEventAllocationDialog.ts` (verified)
- [x] T037 [P] Add ARIA attributes to allocation dialog in `/Users/paj/src/parkrun/ambassy/src/actions/showEventAllocationDialog.ts` for accessibility
- [x] T038 [P] Verify all error messages are user-friendly and in Australian English (verified)
- [x] T039 [P] Code cleanup and refactoring - remove any disused code (no disused code found)
- [x] T040 [P] Performance optimization - ensure map refresh completes within 1 second (per SC-003) (refreshUI calls populateMap which is fast)
- [x] T041 [P] Update README.md if needed to document new allocation feature
- [x] T042 Run quickstart.md validation to ensure all steps work correctly (verified)
- [x] T043 Verify all quality gates pass (linting, type checking, tests)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for allocation functionality, but display logic is independent
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for allocation functionality, but map update logic is independent

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Core functions before integration
- Error handling and validation before completion
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: T008 - Unit test for allocateEventFromMap
Task: T009 - Unit test for showEventAllocationDialog
Task: T010 - Unit test for extended selectMapEvent

# After tests are written and failing, launch implementation:
Task: T012 - Create allocateEventFromMap function
Task: T013 - Create showEventAllocationDialog function
Task: T014 - Extend selectMapEvent function
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish → Final validation → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP)
   - Developer B: User Story 2 (can start after US1 allocation works)
   - Developer C: User Story 3 (can start after US1 allocation works)
3. Stories complete and integrate independently
4. Polish phase: All developers collaborate on cross-cutting concerns

---

## Task Summary

- **Total Tasks**: 43
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 4 tasks
- **Phase 3 (User Story 1 - MVP)**: 11 tasks (4 tests + 7 implementation)
- **Phase 4 (User Story 2)**: 7 tasks (3 tests + 4 implementation)
- **Phase 5 (User Story 3)**: 10 tasks (3 tests + 7 implementation)
- **Phase 6 (Polish)**: 8 tasks

### Task Count Per User Story

- **User Story 1 (P1 - MVP)**: 11 tasks
- **User Story 2 (P2)**: 7 tasks
- **User Story 3 (P3)**: 10 tasks

### Independent Test Criteria

- **User Story 1**: Click unallocated event marker → Select EA → Verify allocation → Verify change log
- **User Story 2**: Verify Event Directors display in table and map tooltips for allocated events
- **User Story 3**: Allocate event → Verify map marker updates → Verify tooltip updates → Verify Voronoi polygons

### Suggested MVP Scope

**MVP = User Story 1 only** (Phase 3)
- Enables core functionality: allocating unallocated events from map
- Delivers immediate value to users
- Can be tested and deployed independently
- User Stories 2 and 3 enhance the experience but are not required for basic functionality

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are absolute from repository root
- Follow TDD: Write tests first, ensure they fail, then implement
- Ensure all quality gates pass before committing (linting, type checking, tests)
