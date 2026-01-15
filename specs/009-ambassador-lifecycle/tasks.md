# Tasks: Ambassador Lifecycle Management

**Input**: Design documents from `/specs/009-ambassador-lifecycle/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are included as they are required by the constitution (all lifecycle operations must have unit tests).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below use single project structure

## Phase 1: Setup (Data Model Changes)

**Purpose**: Extend data models to support state information and event preservation during transitions

- [ ] T001 Extend EventAmbassador interface with state field in src/models/EventAmbassador.ts
- [ ] T002 [P] Extend RegionalAmbassador interface with eventsForReallocation fields in src/models/RegionalAmbassador.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Write unit tests for EventAmbassador model extension in src/models/EventAmbassador.test.ts (if exists) or create new test file
- [ ] T004 [P] Write unit tests for RegionalAmbassador model extension in src/models/RegionalAmbassador.test.ts (if exists) or create new test file

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Enhanced Onboarding with State and Allocation (Priority: P1) 🎯 MVP

**Goal**: Users can onboard new Event Ambassadors with state information and assign them to Regional Ambassadors during onboarding, ensuring complete data capture and proper organizational relationships from the start.

**Independent Test**: Onboard a new Event Ambassador with state and REA assignment, verify state is stored, EA appears in REA's supportsEAs list, EA's regionalAmbassador field is set, and all operations are logged separately.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T005 [P] [US1] Write unit test for enhanced onboardEventAmbassador with state parameter in src/actions/onboardAmbassador.test.ts
- [ ] T006 [P] [US1] Write unit test for onboardEventAmbassador with REA assignment in src/actions/onboardAmbassador.test.ts
- [ ] T007 [P] [US1] Write unit test for granular logging of onboarding operations in src/actions/onboardAmbassador.test.ts
- [ ] T008 [P] [US1] Write integration test for onboarding EA with state and REA assignment in src/actions/onboardAmbassador.test.ts

### Implementation for User Story 1

- [ ] T009 [US1] Update onboardEventAmbassador function signature to accept state parameter (required) in src/actions/onboardAmbassador.ts
- [ ] T010 [US1] Add state field to EventAmbassador creation in onboardEventAmbassador function in src/actions/onboardAmbassador.ts
- [ ] T011 [US1] Add optional regionalAmbassadorName parameter to onboardEventAmbassador function in src/actions/onboardAmbassador.ts
- [ ] T012 [US1] Implement REA assignment logic in onboardEventAmbassador (add EA to REA's supportsEAs list) in src/actions/onboardAmbassador.ts
- [ ] T013 [US1] Set regionalAmbassador field on newly onboarded EA when REA assigned in src/actions/onboardAmbassador.ts
- [ ] T014 [US1] Add granular logging for onboarding operation in src/actions/onboardAmbassador.ts
- [ ] T015 [US1] Add granular logging for REA assignment operation in src/actions/onboardAmbassador.ts
- [ ] T016 [US1] Add granular logging for addition to supportsEAs list in src/actions/onboardAmbassador.ts
- [ ] T017 [US1] Update UI to prompt for state when onboarding Event Ambassador in src/index.ts (setupOnboardingButtons function)
- [ ] T018 [US1] Add REA selection UI (dropdown or prompt) when onboarding Event Ambassador in src/index.ts
- [ ] T019 [US1] Update populateAmbassadorsTable to display state information for Event Ambassadors in src/actions/populateAmbassadorsTable.ts
- [ ] T020 [US1] Ensure UI refreshes after onboarding with state and REA assignment in src/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can onboard EAs with state and REA assignment, with all operations logged separately

---

## Phase 4: User Story 2 - Cross-Boarding: EA to REA (Priority: P2)

**Goal**: Users can transition an Event Ambassador to become a Regional Ambassador while preserving their existing event team assignments, allowing the new REA to gradually reallocate their events.

**Independent Test**: Transition an EA to REA, verify event assignments remain intact, ambassador appears as REA with empty supportsEAs list, no longer appears in EA list, and all state changes are logged separately.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T021 [P] [US2] Write unit test for transitionEventAmbassadorToRegional function in src/actions/transitionAmbassador.test.ts
- [ ] T022 [P] [US2] Write unit test for event preservation during EA-to-REA transition in src/actions/transitionAmbassador.test.ts
- [ ] T023 [P] [US2] Write unit test for removal from EA list during transition in src/actions/transitionAmbassador.test.ts
- [ ] T024 [P] [US2] Write unit test for addition to REA list during transition in src/actions/transitionAmbassador.test.ts
- [ ] T025 [P] [US2] Write unit test for removal from previous REA's supportsEAs list in src/actions/transitionAmbassador.test.ts
- [ ] T026 [P] [US2] Write unit test for prospective events preservation during transition in src/actions/transitionAmbassador.test.ts
- [ ] T027 [P] [US2] Write unit test for state preservation during EA-to-REA transition in src/actions/transitionAmbassador.test.ts
- [ ] T028 [P] [US2] Write unit test for granular logging of EA-to-REA transition operations in src/actions/transitionAmbassador.test.ts
- [ ] T029 [P] [US2] Write integration test for full EA-to-REA transition workflow in src/actions/transitionAmbassador.test.ts

### Implementation for User Story 2

- [ ] T030 [US2] Create transitionAmbassador.ts file in src/actions/transitionAmbassador.ts
- [ ] T031 [US2] Implement transitionEventAmbassadorToRegional function in src/actions/transitionAmbassador.ts
- [ ] T032 [US2] Preserve events list in eventsForReallocation field during EA-to-REA transition in src/actions/transitionAmbassador.ts
- [ ] T033 [US2] Preserve prospectiveEvents list in prospectiveEventsForReallocation field during transition in src/actions/transitionAmbassador.ts
- [ ] T034 [US2] Remove ambassador from Event Ambassadors map during transition in src/actions/transitionAmbassador.ts
- [ ] T035 [US2] Add ambassador to Regional Ambassadors map with preserved state during transition in src/actions/transitionAmbassador.ts
- [ ] T036 [US2] Remove ambassador from previous REA's supportsEAs list during transition in src/actions/transitionAmbassador.ts
- [ ] T037 [US2] Add granular logging for removal from EA list in src/actions/transitionAmbassador.ts
- [ ] T038 [US2] Add granular logging for addition to REA list in src/actions/transitionAmbassador.ts
- [ ] T039 [US2] Add granular logging for removal from previous REA's supportsEAs list in src/actions/transitionAmbassador.ts
- [ ] T040 [US2] Persist Event Ambassadors after removal in src/actions/transitionAmbassador.ts
- [ ] T041 [US2] Persist Regional Ambassadors after addition and supportsEAs update in src/actions/transitionAmbassador.ts
- [ ] T042 [US2] Call trackStateChange after all persistence operations in src/actions/transitionAmbassador.ts
- [ ] T043 [US2] Add "Transition to REA" button to Event Ambassadors table in public/index.html
- [ ] T044 [US2] Create setupTransitionButtons function in src/index.ts
- [ ] T045 [US2] Wire up "Transition to REA" button handler in src/index.ts
- [ ] T046 [US2] Add confirmation dialog for EA-to-REA transition in src/index.ts
- [ ] T047 [US2] Ensure UI refreshes after EA-to-REA transition in src/index.ts
- [ ] T048 [US2] Update populateAmbassadorsTable to display eventsForReallocation for REAs in src/actions/populateAmbassadorsTable.ts

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently - users can transition EAs to REAs with preserved event assignments

---

## Phase 5: User Story 3 - Cross-Boarding: REA to EA (Priority: P2)

**Goal**: Users can transition a Regional Ambassador to become an Event Ambassador and automatically reallocate their supported Event Ambassadors to other Regional Ambassadors, maintaining organizational structure.

**Independent Test**: Transition an REA to EA, verify all supported EAs are reallocated, ambassador appears as EA with empty events list, no longer appears in REA list, and all state changes are logged separately.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T049 [P] [US3] Write unit test for validateREAToEATransition function in src/actions/transitionAmbassador.test.ts
- [ ] T050 [P] [US3] Write unit test for validation blocking when no other REAs exist in src/actions/transitionAmbassador.test.ts
- [ ] T051 [P] [US3] Write unit test for validation allowing transition when REA has no supported EAs in src/actions/transitionAmbassador.test.ts
- [ ] T052 [P] [US3] Write unit test for transitionRegionalAmbassadorToEvent function in src/actions/transitionAmbassador.test.ts
- [ ] T053 [P] [US3] Write unit test for EA reallocation during REA-to-EA transition in src/actions/transitionAmbassador.test.ts
- [ ] T054 [P] [US3] Write unit test for removal from REA list during transition in src/actions/transitionAmbassador.test.ts
- [ ] T055 [P] [US3] Write unit test for addition to EA list during transition in src/actions/transitionAmbassador.test.ts
- [ ] T056 [P] [US3] Write unit test for updating each EA's regionalAmbassador field during reallocation in src/actions/transitionAmbassador.test.ts
- [ ] T057 [P] [US3] Write unit test for updating each target REA's supportsEAs list during reallocation in src/actions/transitionAmbassador.test.ts
- [ ] T058 [P] [US3] Write unit test for granular logging of each EA reallocation in src/actions/transitionAmbassador.test.ts
- [ ] T059 [P] [US3] Write unit test for state preservation during REA-to-EA transition in src/actions/transitionAmbassador.test.ts
- [ ] T060 [P] [US3] Write integration test for full REA-to-EA transition workflow with reallocation in src/actions/transitionAmbassador.test.ts

### Implementation for User Story 3

- [ ] T061 [US3] Implement validateREAToEATransition function in src/actions/transitionAmbassador.ts
- [ ] T062 [US3] Implement transitionRegionalAmbassadorToEvent function in src/actions/transitionAmbassador.ts
- [ ] T063 [US3] Validate all supported EAs can be reallocated before allowing transition in src/actions/transitionAmbassador.ts
- [ ] T064 [US3] Remove ambassador from Regional Ambassadors map during transition in src/actions/transitionAmbassador.ts
- [ ] T065 [US3] Add ambassador to Event Ambassadors map with preserved state during transition in src/actions/transitionAmbassador.ts
- [ ] T066 [US3] Reallocate each supported EA to new REA during transition in src/actions/transitionAmbassador.ts
- [ ] T067 [US3] Update each reallocated EA's regionalAmbassador field in src/actions/transitionAmbassador.ts
- [ ] T068 [US3] Update each target REA's supportsEAs list during reallocation in src/actions/transitionAmbassador.ts
- [ ] T069 [US3] Remove each EA from old REA's supportsEAs list during reallocation in src/actions/transitionAmbassador.ts
- [ ] T070 [US3] Add granular logging for removal from REA list in src/actions/transitionAmbassador.ts
- [ ] T071 [US3] Add granular logging for addition to EA list in src/actions/transitionAmbassador.ts
- [ ] T072 [US3] Add granular logging for each EA removal from old REA's supportsEAs list in src/actions/transitionAmbassador.ts
- [ ] T073 [US3] Add granular logging for each EA addition to new REA's supportsEAs list in src/actions/transitionAmbassador.ts
- [ ] T074 [US3] Add granular logging for each EA's regionalAmbassador field update in src/actions/transitionAmbassador.ts
- [ ] T075 [US3] Persist Event Ambassadors after addition and EA updates in src/actions/transitionAmbassador.ts
- [ ] T076 [US3] Persist Regional Ambassadors after removal and supportsEAs updates in src/actions/transitionAmbassador.ts
- [ ] T077 [US3] Call trackStateChange after all persistence operations in src/actions/transitionAmbassador.ts
- [ ] T078 [US3] Create or adapt reallocation dialog for EA reallocation (REA recipients) in src/actions/showReallocationDialog.ts or new file
- [ ] T079 [US3] Add "Transition to EA" button to Regional Ambassadors table in public/index.html
- [ ] T080 [US3] Wire up "Transition to EA" button handler in src/index.ts
- [ ] T081 [US3] Show validation error if transition not possible in src/index.ts
- [ ] T082 [US3] Show reallocation dialog for REA-to-EA transition in src/index.ts
- [ ] T083 [US3] Ensure UI refreshes after REA-to-EA transition in src/index.ts

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently - users can transition REAs to EAs with automatic EA reallocation

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, edge case handling, and quality assurance

### Edge Case Handling

- [ ] T084 Handle EA-to-REA transition when EA has no event assignments in src/actions/transitionAmbassador.ts
- [ ] T085 Handle REA-to-EA transition when REA has no supported EAs in src/actions/transitionAmbassador.ts
- [ ] T086 Handle EA-to-REA transition when EA is only EA supported by their REA in src/actions/transitionAmbassador.ts
- [ ] T087 Show error when attempting to transition non-existent ambassador in src/index.ts
- [ ] T088 Handle capacity warnings during REA-to-EA EA reallocation in src/actions/transitionAmbassador.ts

### UI & Accessibility

- [ ] T089 Ensure all transition buttons are keyboard accessible in public/index.html
- [ ] T090 Ensure all transition dialogs are keyboard accessible in src/index.ts
- [ ] T091 Add ARIA labels to transition buttons in public/index.html
- [ ] T092 Ensure state information is clearly visible in UI in src/actions/populateAmbassadorsTable.ts

### Integration & Testing

- [ ] T093 Write integration test for full onboarding → transition → reallocation workflow
- [ ] T094 Verify all logging entries are created correctly in integration tests
- [ ] T095 Verify state persistence across page reloads in integration tests
- [ ] T096 Verify UI updates correctly after all operations in integration tests

### Documentation

- [ ] T097 Update README with new onboarding and transition features
- [ ] T098 Ensure all function contracts are documented (if contracts/ directory exists)

**Checkpoint**: Feature complete - all user stories implemented, tested, and polished

---

## Summary

- **Total Tasks**: 98
- **Phase 1 (Setup)**: 2 tasks
- **Phase 2 (Foundational)**: 2 tasks
- **Phase 3 (User Story 1)**: 16 tasks
- **Phase 4 (User Story 2)**: 28 tasks
- **Phase 5 (User Story 3)**: 35 tasks
- **Phase 6 (Polish)**: 15 tasks

**Parallelization Opportunities**: Many test tasks can run in parallel ([P] markers indicate parallelizable tasks)
