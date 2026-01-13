# Tasks: Button Accessibility Improvements

**Input**: Design documents from `/specs/001-button-accessibility/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included following Test-Driven Development principles from constitution. Tests MUST be written first and fail before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below follow single project structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification

- [x] T001 Verify project structure matches implementation plan in specs/001-button-accessibility/plan.md
- [x] T002 [P] Verify TypeScript 5.9.3 configuration in tsconfig.json supports strict mode and ES6 target
- [x] T003 [P] Verify Jest 30.2.0 and ts-jest 29.4.5 are configured for testing with jsdom environment

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create hasApplicationData function in src/index.ts to check if all required data Maps have data
- [x] T005 [P] Create isMapViewDisplayed function in src/index.ts to check if map view section is visible
- [x] T006 [P] Create updateButtonVisibility function in src/index.ts to manage button visibility based on state

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Export Button in Map View Only (Priority: P1) 🎯 MVP

**Goal**: Hide export button in upload section, show export button only in map view when data is loaded. This prevents user confusion by only showing export functionality when it's meaningful.

**Independent Test**: Upload CSV files, verify export button appears in map view. Visit application with no data, verify export button not visible in upload section. This delivers value by providing a clearer, more intuitive user interface that only shows relevant actions.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [P] [US1] Write unit test for hasApplicationData function in src/index.test.ts (returns false when no data)
- [x] T008 [P] [US1] Write unit test for hasApplicationData function in src/index.test.ts (returns true when all data present)
- [x] T009 [P] [US1] Write unit test for isMapViewDisplayed function in src/index.test.ts (returns false when upload section visible)
- [x] T010 [P] [US1] Write unit test for isMapViewDisplayed function in src/index.test.ts (returns true when map view visible)
- [x] T011 [P] [US1] Write unit test for updateButtonVisibility function in src/index.test.ts (hides export button when no data)
- [x] T012 [P] [US1] Write unit test for updateButtonVisibility function in src/index.test.ts (shows export button when data loaded)
- [x] T013 [P] [US1] Write integration test for export button visibility in upload section (not visible when no data) in src/index.test.ts
- [x] T014 [P] [US1] Write integration test for export button visibility in map view (visible when data loaded) in src/index.test.ts

### Implementation for User Story 1

- [x] T015 [US1] Remove export button element from upload section in public/index.html (remove button with id="exportButton")
- [x] T016 [US1] Remove setupExportButton("exportButton") call from src/index.ts (line 84)
- [x] T017 [US1] Implement hasApplicationData function in src/index.ts to check if eventTeams, eventAmbassadors, and regionalAmbassadors all have data
- [x] T018 [US1] Implement isMapViewDisplayed function in src/index.ts to check if map view section display style is not "none"
- [x] T019 [US1] Implement updateButtonVisibility function in src/index.ts that calls hasApplicationData and isMapViewDisplayed, then updates export button visibility in map view
- [x] T020 [US1] Call updateButtonVisibility in ambassy function in src/index.ts when data state changes
- [x] T021 [US1] Ensure export button in map view (id="exportButtonMap") remains functional after visibility changes

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Export button should only appear in map view when data is loaded.

---

## Phase 4: User Story 2 - Import Button Always Accessible (Priority: P2)

**Goal**: Ensure import button is visible and functional in both upload section and map view section at all times. This provides maximum flexibility for users to import shared state files regardless of their current workflow state.

**Independent Test**: Visit application with no data, verify import button visible in upload section. Upload CSV files, verify import button visible in map view. Click import button from both locations, verify file picker opens. This delivers value by ensuring users can import data whenever they need to, regardless of their current workflow state.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T022 [P] [US2] Write unit test for updateButtonVisibility function ensuring import button always visible in upload section in src/index.test.ts
- [x] T023 [P] [US2] Write unit test for updateButtonVisibility function ensuring import button always visible in map view in src/index.test.ts
- [x] T024 [P] [US2] Write integration test for import button visibility in upload section (always visible) in src/index.test.ts
- [x] T025 [P] [US2] Write integration test for import button visibility in map view (always visible) in src/index.test.ts
- [x] T026 [P] [US2] Write integration test for import button functionality from upload section in src/index.test.ts
- [x] T027 [P] [US2] Write integration test for import button functionality from map view in src/index.test.ts

### Implementation for User Story 2

- [x] T028 [US2] Verify import button exists in upload section (id="importButton") in public/index.html
- [x] T029 [US2] Verify import button exists in map view section (id="importButtonMap") in public/index.html
- [x] T030 [US2] Update updateButtonVisibility function in src/index.ts to ensure import buttons are always visible (both locations)
- [x] T031 [US2] Ensure setupImportButton calls remain for both button IDs in src/index.ts (lines 86-87)
- [x] T032 [US2] Verify import functionality works correctly when triggered from upload section
- [x] T033 [US2] Verify import functionality works correctly when triggered from map view section
- [x] T034 [US2] Ensure import button remains keyboard accessible in both locations

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Import button should be accessible from both locations at all times.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T035 [P] Verify keyboard accessibility for all buttons (Tab navigation, Enter/Space activation) in both sections
- [x] T036 [P] Ensure no layout shifts occur when buttons appear/disappear (use display: none, not visibility: hidden)
- [x] T037 [P] Verify button visibility updates correctly when transitioning from upload section to map view
- [x] T038 [P] Verify button visibility updates correctly when data is cleared (purge button clicked)
- [x] T039 [P] Test button visibility when importing data while viewing map (should refresh visibility)
- [x] T040 [P] Ensure all tests pass and maintain high code coverage
- [x] T041 [P] Review code for adherence to Single Responsibility Principle
- [x] T042 [P] Verify Australian English is used for all user-facing text (if any added)
- [x] T043 [P] Perform final lint:fix and lint check
- [x] T044 [P] Run TypeScript type checking (tsc --noEmit)
- [x] T045 [P] Run all tests (pnpm test)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May share visibility update logic with US1 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Helper functions before visibility logic
- Visibility logic before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, both user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

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
4. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Button visibility uses `display: none` to completely remove from layout (no space taken)
- Hidden buttons automatically excluded from keyboard navigation (display: none removes from tab order)

