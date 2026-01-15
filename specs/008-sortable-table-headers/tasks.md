# Tasks: Sortable Table Headers with Sticky Positioning

**Input**: Design documents from `/specs/008-sortable-table-headers/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as they are required by the constitution (all sorting logic must have unit tests).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below use single project structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create TableSortState model in src/models/TableSortState.ts
- [ ] T002 [P] Create sortComparators utility in src/utils/sortComparators.ts
- [ ] T003 [P] Create tableSorting core functions in src/actions/tableSorting.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Write unit tests for TableSortState model in src/models/TableSortState.test.ts
- [ ] T005 [P] Write unit tests for sortComparators in src/utils/sortComparators.test.ts
- [ ] T006 [P] Write unit tests for tableSorting core functions in src/actions/tableSorting.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Sort Table Columns (Priority: P1) 🎯 MVP

**Goal**: Users can click on any column header to sort the table data by that column, making it easier to find and organize information.

**Independent Test**: Click column headers and verify rows reorder correctly. Visual indicators show sort state. Sorting works for all data types (text, numbers, dates, booleans).

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Write integration test for Event Teams table sorting in src/actions/populateEventTeamsTable.test.ts
- [ ] T008 [P] [US1] Write integration test for Event Ambassadors table sorting in src/actions/populateAmbassadorsTable.test.ts
- [ ] T009 [P] [US1] Write integration test for Prospects table sorting in src/actions/populateProspectsTable.test.ts

### Implementation for User Story 1

- [ ] T010 [US1] Add click handlers to column headers in src/actions/tableSorting.ts (initializeTableSorting function)
- [ ] T011 [US1] Implement sortTable function with DOM row reordering in src/actions/tableSorting.ts
- [ ] T012 [US1] Implement visual sort indicators (arrows) in src/actions/tableSorting.ts (updateSortIndicator function)
- [ ] T013 [US1] Add keyboard accessibility (Enter/Space) to sortable headers in src/actions/tableSorting.ts
- [ ] T014 [US1] Integrate sorting into Event Teams table in src/actions/populateEventTeamsTable.ts
- [ ] T015 [US1] Integrate sorting into Event Ambassadors table in src/actions/populateAmbassadorsTable.ts
- [ ] T016 [US1] Integrate sorting into Regional Ambassadors table in src/actions/populateAmbassadorsTable.ts
- [ ] T017 [US1] Integrate sorting into Prospects table in src/actions/populateProspectsTable.ts
- [ ] T018 [US1] Integrate sorting into Changes Log table in src/actions/populateChangesLogTable.ts
- [ ] T019 [US1] Integrate sorting into Issues table in src/actions/populateIssuesTable.ts
- [ ] T020 [US1] Add ARIA attributes (aria-sort, aria-label) to sortable headers in src/actions/tableSorting.ts
- [ ] T021 [US1] Implement row selection preservation during sorting in src/actions/tableSorting.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - all tables support column sorting with visual indicators

---

## Phase 4: User Story 2 - Sticky Table Headers (Priority: P1) 🎯 MVP

**Goal**: Table headers remain visible at the top of the viewport when users scroll down through long tables, ensuring column context is always available.

**Independent Test**: Scroll through a table with many rows and verify headers remain visible. Test with multiple tables on same page. Test across different viewport sizes.

### Tests for User Story 2

- [ ] T022 [P] [US2] Write visual regression test for sticky headers in different viewport sizes (manual test checklist)

### Implementation for User Story 2

- [ ] T023 [US2] Add CSS sticky positioning to table headers in public/style.css (thead th { position: sticky; top: 0; })
- [ ] T024 [US2] Add z-index to sticky headers to ensure they appear above table body in public/style.css
- [ ] T025 [US2] Add background color to sticky headers to prevent content showing through in public/style.css
- [ ] T026 [US2] Test sticky headers with Event Teams table (50+ rows)
- [ ] T027 [US2] Test sticky headers with Prospects table (50+ rows)
- [ ] T028 [US2] Verify sticky headers work with multiple tables visible simultaneously

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - tables are sortable and headers remain sticky when scrolling

---

## Phase 5: User Story 3 - Sensible Default Sort Orders (Priority: P2)

**Goal**: Each table opens with a sensible default sort order that presents the most useful data first, reducing the need for users to manually sort.

**Independent Test**: Load each table and verify the initial sort order matches the defined defaults. Verify defaults are applied on table refresh.

### Tests for User Story 3

- [ ] T029 [P] [US3] Write unit test for default sort application in src/actions/tableSorting.test.ts
- [ ] T030 [P] [US3] Write integration test for default sort on table load in src/actions/populateEventTeamsTable.test.ts

### Implementation for User Story 3

- [ ] T031 [US3] Configure default sort for Event Teams table (column 2, ascending) in src/actions/populateEventTeamsTable.ts
- [ ] T032 [US3] Configure default sort for Event Ambassadors table (column 0, ascending) in src/actions/populateAmbassadorsTable.ts
- [ ] T033 [US3] Configure default sort for Regional Ambassadors table (column 0, ascending) in src/actions/populateAmbassadorsTable.ts
- [ ] T034 [US3] Configure default sort for Prospects table (column 0, ascending) in src/actions/populateProspectsTable.ts
- [ ] T035 [US3] Configure default sort for Changes Log table (column 4, descending) in src/actions/populateChangesLogTable.ts
- [ ] T036 [US3] Configure default sort for Issues table (column 0, ascending) in src/actions/populateIssuesTable.ts
- [ ] T037 [US3] Implement resetToDefaultSort function in src/actions/tableSorting.ts
- [ ] T038 [US3] Apply default sorts on initial table population in all table population functions

**Checkpoint**: All user stories should now be independently functional - tables have sorting, sticky headers, and sensible defaults

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T039 [P] Add hover states for sortable headers in public/style.css
- [ ] T040 [P] Add focus states for keyboard navigation in public/style.css
- [ ] T041 [P] Ensure sort indicators are clearly visible and accessible in public/style.css
- [ ] T042 Code cleanup and refactoring across table sorting utilities
- [ ] T043 Performance testing with large tables (500+ rows) - verify <100ms sort time
- [ ] T044 [P] Additional edge case tests for empty values, mixed types, empty tables
- [ ] T045 Accessibility audit - verify keyboard navigation and screen reader support
- [ ] T046 Run quickstart.md validation - verify all examples work correctly
- [ ] T047 Update documentation if needed based on implementation findings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 and User Story 2 can proceed in parallel after Foundational (both P1)
  - User Story 3 (P2) can start after Foundational, but benefits from US1/US2 completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent of US1, can run in parallel
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Uses sorting infrastructure from US1, but can be implemented independently

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Core utilities before integration
- Integration tasks can run in parallel for different tables
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002, T003)
- All Foundational test tasks marked [P] can run in parallel (T004, T005, T006)
- Once Foundational phase completes, User Story 1 and User Story 2 can start in parallel
- Integration tasks for different tables (T014-T019) can run in parallel
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all integration tests for User Story 1 together:
Task: "Write integration test for Event Teams table sorting in src/actions/populateEventTeamsTable.test.ts"
Task: "Write integration test for Event Ambassadors table sorting in src/actions/populateAmbassadorsTable.test.ts"
Task: "Write integration test for Prospects table sorting in src/actions/populateProspectsTable.test.ts"

# Launch all table integration tasks together (after core sorting is done):
Task: "Integrate sorting into Event Teams table in src/actions/populateEventTeamsTable.ts"
Task: "Integrate sorting into Event Ambassadors table in src/actions/populateAmbassadorsTable.ts"
Task: "Integrate sorting into Regional Ambassadors table in src/actions/populateAmbassadorsTable.ts"
Task: "Integrate sorting into Prospects table in src/actions/populateProspectsTable.ts"
Task: "Integrate sorting into Changes Log table in src/actions/populateChangesLogTable.ts"
Task: "Integrate sorting into Issues table in src/actions/populateIssuesTable.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T007-T021) - Sorting functionality
4. Complete Phase 4: User Story 2 (T022-T028) - Sticky headers
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Sorting MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Sticky headers!)
4. Add User Story 3 → Test independently → Deploy/Demo (Default sorts)
5. Add Polish → Final polish and optimization
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (sorting)
   - Developer B: User Story 2 (sticky headers) - can run in parallel
3. Once US1 and US2 complete:
   - Developer A: User Story 3 (default sorts)
   - Developer B: Polish tasks
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Total Tasks**: 47 tasks across 6 phases
- **MVP Scope**: Phases 1-4 (User Stories 1 & 2) = 28 tasks
- **Full Feature**: All phases = 47 tasks
