# Tasks: Add Prospect by Address

**Input**: Design documents from `/specs/011-add-prospect-by-address/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are REQUIRED per Constitution (Test-Driven Development). All production code must have tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project structure matches plan.md (src/actions/, src/models/, src/utils/, public/)
- [x] T002 Verify existing dependencies are available (geocodeAddress, suggestEventAllocation, persistProspectiveEvents)
- [x] T003 [P] Review existing dialog patterns in src/actions/showAddressDialog.ts and src/actions/showEventAllocationDialog.ts for consistency

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create utility function inferCountryFromCoordinates in src/models/country.ts to convert country code to country name string
- [x] T005 [P] Create helper function generateProspectAllocationSuggestions in src/actions/suggestEventAllocation.ts to generate EA suggestions for prospects using temporary EventDetails entry

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - REA Adds New Prospect with Address (Priority: P1) 🎯 MVP

**Goal**: Enable REAs to add new prospective events by entering an address. System automatically geocodes the address, infers country, and suggests appropriate EAs. REA selects an EA and prospect is created, persisted, and displayed.

**Independent Test**: REA can click "Add Prospect" button, enter prospect name/address/state, see geocoding succeed, view allocation suggestions, select an EA, and verify prospect appears in Prospects table and map.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T006 [P] [US1] Write unit test for inferCountryFromCoordinates in src/models/country.test.ts
- [x] T007 [P] [US1] Write unit test for generateProspectAllocationSuggestions in src/actions/suggestEventAllocation.test.ts
- [x] T008 [P] [US1] Write unit test for createProspectFromAddress in src/actions/createProspectFromAddress.test.ts
- [x] T009 [P] [US1] Write unit test for showAddProspectDialog dialog display and form fields in src/actions/showAddProspectDialog.test.ts
- [x] T010 [US1] Write integration test for full prospect creation flow (dialog → geocoding → suggestions → selection → creation → persistence) in src/actions/showAddProspectDialog.test.ts

### Implementation for User Story 1

- [x] T011 [US1] Implement inferCountryFromCoordinates function in src/models/country.ts to convert country code (number) to country name string (or "Unknown")
- [x] T012 [US1] Implement generateProspectAllocationSuggestions function in src/actions/suggestEventAllocation.ts that creates temporary EventDetails entry and calls suggestEventAllocation
- [x] T013 [US1] Implement createProspectFromAddress function in src/actions/createProspectFromAddress.ts with validation, ID generation, and EA allocation count update
- [x] T014 [US1] Implement showAddProspectDialog function in src/actions/showAddProspectDialog.ts with form fields (prospect name, address, state, optional fields), following existing dialog patterns
- [x] T015 [US1] Add automatic geocoding trigger logic in src/actions/showAddProspectDialog.ts (trigger when address and state both filled, with 500ms debounce)
- [x] T016 [US1] Add loading indicator display during geocoding in src/actions/showAddProspectDialog.ts (disable form submission, show "Geocoding address..." message)
- [x] T017 [US1] Add country inference after successful geocoding in src/actions/showAddProspectDialog.ts (call inferCountryFromCoordinates)
- [x] T018 [US1] Add allocation suggestion generation and display in src/actions/showAddProspectDialog.ts (call generateProspectAllocationSuggestions, display top 3-5 suggestions with reasons)
- [x] T019 [US1] Add EA selection handling in src/actions/showAddProspectDialog.ts (create prospect via createProspectFromAddress, persist, refresh table/map, log change)
- [x] T020 [US1] Add "Add Prospect" button to main toolbar in public/index.html alongside "Add Event Ambassador" and "Add Regional Ambassador" buttons
- [x] T021 [US1] Add setupAddProspectButton function in src/index.ts to handle button click and call showAddProspectDialog with required data and callbacks
- [x] T022 [US1] Integrate prospect creation with refreshProspectsTable call in src/index.ts onSuccess callback
- [x] T023 [US1] Integrate prospect creation with populateMap call in src/index.ts onSuccess callback to update map markers
- [x] T024 [US1] Integrate prospect creation with trackStateChange and trackChanges in src/index.ts onSuccess callback to log prospect creation

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. REA can add prospect by address, see suggestions, select EA, and prospect appears in table/map.

---

## Phase 4: User Story 2 - Handle Geocoding Failures (Priority: P2)

**Goal**: When geocoding fails, system provides clear feedback and allows REA to retry with different address or manually enter coordinates.

**Independent Test**: REA enters invalid address, sees geocoding failure message with retry/manual coordinate options, chooses manual coordinates, enters coordinates, and successfully creates prospect.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T025 [P] [US2] Write unit test for geocoding failure handling in src/actions/showAddProspectDialog.test.ts
- [x] T026 [P] [US2] Write unit test for manual coordinate entry flow in src/actions/showAddProspectDialog.test.ts
- [x] T027 [US2] Write integration test for geocoding failure → manual coordinate entry → prospect creation flow in src/actions/showAddProspectDialog.test.ts

### Implementation for User Story 2

- [x] T028 [US2] Add geocoding error handling in src/actions/showAddProspectDialog.ts (catch geocoding errors, display user-friendly error message)
- [x] T029 [US2] Add "Retry" option for failed geocoding in src/actions/showAddProspectDialog.ts (allow user to modify address and retry)
- [x] T030 [US2] Add "Enter Coordinates Manually" option for failed geocoding in src/actions/showAddProspectDialog.ts (show coordinate input fields)
- [x] T031 [US2] Add manual coordinate entry validation in src/actions/showAddProspectDialog.ts (validate coordinate format, use isValidCoordinate)
- [x] T032 [US2] Add country inference for manually entered coordinates in src/actions/showAddProspectDialog.ts (call inferCountryFromCoordinates after manual entry)
- [x] T033 [US2] Add geocodingStatus field handling in src/actions/createProspectFromAddress.ts (set to 'success' for geocoded, 'manual' for manual entry)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. REA can create prospects via address geocoding OR manual coordinate entry.

---

## Phase 5: User Story 3 - Manual EA Selection (Priority: P2)

**Goal**: REAs can override allocation suggestions and manually select any EA from the full list, even if not in suggestions.

**Independent Test**: REA views allocation suggestions, clicks "Other" or "Select Different EA", sees full EA list, selects EA not in suggestions, and prospect is created with manually selected EA.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T034 [P] [US3] Write unit test for "Other" button display and EA dropdown/list in src/actions/showAddProspectDialog.test.ts
- [x] T035 [P] [US3] Write unit test for manual EA selection from full list in src/actions/showAddProspectDialog.test.ts
- [x] T036 [US3] Write integration test for suggestion display → "Other" click → EA selection → prospect creation flow in src/actions/showAddProspectDialog.test.ts

### Implementation for User Story 3

- [x] T037 [US3] Add "Other" or "Select Different EA" button/option in src/actions/showAddProspectDialog.ts when suggestions are displayed
- [x] T038 [US3] Add EA dropdown/list display in src/actions/showAddProspectDialog.ts showing all available EAs when "Other" is clicked (follow showReallocationDialog pattern)
- [x] T039 [US3] Add EA selection handler for manually selected EA in src/actions/showAddProspectDialog.ts (same creation flow as suggested EA selection)
- [x] T040 [US3] Verify manually selected EA is correctly assigned in prospect creation (test in createProspectFromAddress)

**Checkpoint**: At this point, all user stories should be independently functional. REA can add prospect, handle geocoding failures, and manually select EAs.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T041 [P] Add re-geocoding on address change in src/actions/showAddProspectDialog.ts (automatically re-geocode when address field changes after initial geocoding, with debouncing)
- [x] T042 [P] Add validation for "no EAs available" case in src/actions/showAddProspectDialog.ts (check eventAmbassadors.size === 0, show error message, prevent dialog from showing suggestions)
- [x] T043 [P] Add duplicate prospect name warning in src/actions/showAddProspectDialog.ts (check if prospect name already exists, show warning but allow creation)
- [x] T044 [P] Add keyboard accessibility improvements in src/actions/showAddProspectDialog.ts (ensure all inputs keyboard accessible, Tab navigation, Enter to submit, Escape to cancel)
- [x] T045 [P] Add ARIA attributes for accessibility in src/actions/showAddProspectDialog.ts (role="dialog", aria-modal="true", aria-labelledby, role="alert" for errors)
- [x] T046 [P] Add focus management in src/actions/showAddProspectDialog.ts (focus first input on open, return focus on close)
- [x] T047 [P] Add Australian English text validation in src/actions/showAddProspectDialog.ts (ensure all user-facing text uses Australian English)
- [x] T048 [P] Add edge case handling for country inference failure in src/actions/createProspectFromAddress.ts (use "Unknown" or default country code 0 if inference fails)
- [x] T049 [P] Add edge case handling for addresses that geocode to multiple locations in src/actions/showAddProspectDialog.ts (use first result or allow user selection)
- [x] T050 [P] Update README.md if needed to document new "Add Prospect" feature
- [x] T051 Run quickstart.md validation to ensure all examples work correctly (verified implementation matches quickstart patterns)
- [x] T052 [P] Code cleanup: Remove any commented-out code, ensure all imports use path aliases (@actions/*, @models/*, etc.)
- [x] T053 [P] Verify all tests pass (npm test)
- [x] T054 [P] Verify linting passes (npm run lint)
- [x] T055 [P] Verify TypeScript compilation passes (tsc --noEmit)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 dialog structure but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 dialog structure but should be independently testable

### Within Each User Story

- Tests (required) MUST be written and FAIL before implementation
- Helper functions before main dialog function
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- Polish phase tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: T006 - Write unit test for inferCountryFromCoordinates in src/utils/country.test.ts
Task: T007 - Write unit test for generateProspectAllocationSuggestions in src/actions/suggestEventAllocation.test.ts
Task: T008 - Write unit test for createProspectFromAddress in src/actions/createProspectFromAddress.test.ts
Task: T009 - Write unit test for showAddProspectDialog dialog display in src/actions/showAddProspectDialog.test.ts

# After tests written, launch helper function implementations:
Task: T011 - Implement inferCountryFromCoordinates function in src/utils/country.ts
Task: T012 - Implement generateProspectAllocationSuggestions function in src/actions/suggestEventAllocation.ts
Task: T013 - Implement createProspectFromAddress function in src/actions/createProspectFromAddress.ts
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
5. Add Polish phase → Final validation → Deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (core functionality)
   - Developer B: User Story 2 (error handling) - can start after US1 dialog structure exists
   - Developer C: User Story 3 (manual selection) - can start after US1 dialog structure exists
3. Stories complete and integrate independently
4. Team works on Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All code must pass linting, type checking, and tests before commit (Constitution requirements)
- Use path aliases for imports (@actions/*, @models/*, etc.) - relative imports prohibited
- Australian English for all user-facing text
- Keyboard accessibility required for all inputs
