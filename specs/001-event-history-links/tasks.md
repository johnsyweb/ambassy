# Tasks: Event History Links

**Input**: Design documents from `/specs/001-event-history-links/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as required by constitution (TDD approach).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below use single project structure

## Phase 1: User Story 1 - Open event history from Event Ambassador tab (Priority: P1) 🎯 MVP

**Goal**: Each live event allocation listed for an Event Ambassador on the Event Ambassador tab renders the event name as a hyperlink that opens the event's parkrun event history page in a new browser tab.

**Independent Test**: With an Event Ambassador who has at least one live event allocation, clicking the event name opens the correct event history page in a new tab using the per-country domain and event short name from data.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T001 [P] [US1] Unit test for buildEventHistoryUrl with valid inputs in src/utils/eventHistoryUrl.test.ts
- [X] T002 [P] [US1] Unit test for buildEventHistoryUrl with different country codes in src/utils/eventHistoryUrl.test.ts
- [X] T003 [P] [US1] Integration test for event names rendering as links in src/actions/populateAmbassadorsTable.test.ts
- [X] T004 [P] [US1] Integration test for link attributes (href, target, rel) in src/actions/populateAmbassadorsTable.test.ts
- [X] T005 [P] [US1] Integration test for keyboard accessibility (focus, activation) in src/actions/populateAmbassadorsTable.test.ts

### Implementation for User Story 1

- [X] T006 [P] [US1] Create buildEventHistoryUrl utility function in src/utils/eventHistoryUrl.ts
- [X] T007 [US1] Add optional eventDetails and countries parameters to populateEventAmbassadorsTable in src/actions/populateAmbassadorsTable.ts
- [X] T008 [US1] Modify eventsCell rendering to create link elements for each event name in src/actions/populateAmbassadorsTable.ts
- [X] T009 [US1] Implement URL construction using buildEventHistoryUrl for each event in src/actions/populateAmbassadorsTable.ts
- [X] T010 [US1] Add link attributes (href, target="_blank", rel="noopener noreferrer") to event name links in src/actions/populateAmbassadorsTable.ts
- [X] T011 [US1] Update populateAmbassadorsTable to pass eventDetails and countries to populateEventAmbassadorsTable in src/actions/populateAmbassadorsTable.ts
- [X] T012 [US1] Update refreshUI to pass eventDetails and countries to populateAmbassadorsTable in src/actions/refreshUI.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Event names should be clickable links that open correct event history pages in new tabs.

---

## Phase 2: User Story 2 - Graceful handling when domain data is missing (Priority: P2)

**Goal**: If country domain data for an event is missing or invalid, the UI gracefully disables the link or shows a tooltip/message explaining the missing domain without throwing errors.

**Independent Test**: Remove or corrupt the country domain for an event; the UI should disable the link or show a tooltip/message explaining the missing domain without throwing errors.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T013 [P] [US2] Unit test for buildEventHistoryUrl with missing country code in src/utils/eventHistoryUrl.test.ts
- [X] T014 [P] [US2] Unit test for buildEventHistoryUrl with null country.url in src/utils/eventHistoryUrl.test.ts
- [X] T015 [P] [US2] Unit test for buildEventHistoryUrl with missing EventDetails in src/utils/eventHistoryUrl.test.ts
- [X] T016 [P] [US2] Integration test for missing domain data rendering as plain text in src/actions/populateAmbassadorsTable.test.ts
- [X] T017 [P] [US2] Integration test for tooltip/aria-label on disabled links in src/actions/populateAmbassadorsTable.test.ts
- [X] T018 [P] [US2] Integration test for no console errors when domain data is missing in src/actions/populateAmbassadorsTable.test.ts

### Implementation for User Story 2

- [X] T019 [US2] Update buildEventHistoryUrl to handle missing country code in src/utils/eventHistoryUrl.ts
- [X] T020 [US2] Update buildEventHistoryUrl to handle null country.url in src/utils/eventHistoryUrl.ts
- [X] T021 [US2] Update populateEventAmbassadorsTable to handle null URL by rendering plain text span in src/actions/populateAmbassadorsTable.ts
- [X] T022 [US2] Add tooltip (title attribute) to plain text spans when URL is unavailable in src/actions/populateAmbassadorsTable.ts
- [X] T023 [US2] Add aria-label to plain text spans for screen reader accessibility in src/actions/populateAmbassadorsTable.ts
- [X] T024 [US2] Add error handling to prevent console errors when EventDetails is missing in src/actions/populateAmbassadorsTable.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Missing domain data should be handled gracefully with user-friendly feedback.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T025 [P] Add CSS styling for event history links to match existing text appearance in public/style.css
- [X] T026 [P] Add hover state styling for event history links in public/style.css
- [X] T027 [P] Add focus state styling for keyboard navigation in public/style.css
- [X] T028 [P] Verify all tests pass (unit and integration) in all test files
- [X] T029 [P] Run linting and fix any errors in modified files
- [X] T030 [P] Run TypeScript type checking and fix any errors
- [ ] T031 Manual test: Verify links work for multiple countries (test 3+ different country domains)
- [ ] T032 Manual test: Verify keyboard navigation works (Tab to focus, Enter to activate)
- [ ] T033 Manual test: Verify screen reader announces links properly
- [ ] T034 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 1)**: No dependencies - can start immediately (uses existing infrastructure)
- **User Story 2 (Phase 2)**: Depends on User Story 1 completion - builds on URL construction logic
- **Polish (Phase 3)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 - Uses buildEventHistoryUrl function from US1

### Within Each User Story

- Tests (T001-T005 for US1, T013-T018 for US2) MUST be written and FAIL before implementation
- Utility function (buildEventHistoryUrl) before table modification
- Table modification after utility function
- Call site updates after table modification
- Story complete before moving to next priority

### Parallel Opportunities

- All test tasks marked [P] can run in parallel (T001-T005, T013-T018)
- Utility function creation (T006) can run in parallel with test writing
- CSS styling tasks (T025-T027) can run in parallel
- Different user stories can be worked on sequentially (US1 → US2)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for buildEventHistoryUrl with valid inputs in src/utils/eventHistoryUrl.test.ts"
Task: "Unit test for buildEventHistoryUrl with different country codes in src/utils/eventHistoryUrl.test.ts"
Task: "Integration test for event names rendering as links in src/actions/populateAmbassadorsTable.test.ts"
Task: "Integration test for link attributes (href, target, rel) in src/actions/populateAmbassadorsTable.test.ts"
Task: "Integration test for keyboard accessibility (focus, activation) in src/actions/populateAmbassadorsTable.test.ts"

# After tests are written, launch utility function creation:
Task: "Create buildEventHistoryUrl utility function in src/utils/eventHistoryUrl.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: User Story 1
   - Write tests (T001-T005) - ensure they FAIL
   - Implement utility function (T006)
   - Modify table rendering (T007-T010)
   - Update function signatures and call sites (T011-T012)
2. **STOP and VALIDATE**: Test User Story 1 independently
   - Verify event names are clickable links
   - Verify links open correct URLs in new tabs
   - Verify keyboard navigation works
3. Deploy/demo if ready

### Incremental Delivery

1. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
2. Add User Story 2 → Test independently → Deploy/Demo
3. Add Polish → Test independently → Deploy/Demo
4. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Developer A: Write all tests for User Story 1 (T001-T005)
2. Developer B: Create utility function (T006) - can start after tests are written
3. Once utility function is done:
   - Developer A: Modify table rendering (T007-T010)
   - Developer B: Update function signatures (T011-T012)
4. After User Story 1 complete:
   - Developer A: User Story 2 tests (T013-T018)
   - Developer B: User Story 2 implementation (T019-T024)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
