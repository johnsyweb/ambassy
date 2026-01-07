# Tasks: State Persistence and Sharing

**Input**: Design documents from `/specs/001-persist-state/`
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

**Purpose**: Project initialization and basic structure

- [ ] T001 Verify project structure matches implementation plan in specs/001-persist-state/plan.md
- [ ] T002 [P] Verify TypeScript 5.9.3 configuration in tsconfig.json supports strict mode and ES6 target
- [ ] T003 [P] Verify Jest 30.2.0 and ts-jest 29.4.5 are configured for testing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Create storage abstraction layer with isStorageAvailable function in src/utils/storage.ts
- [ ] T005 [P] Implement saveToStorage function in src/utils/storage.ts with localStorage fallback to sessionStorage
- [ ] T006 [P] Implement loadFromStorage function in src/utils/storage.ts with type safety
- [ ] T007 [P] Create ApplicationState interface in src/models/ApplicationState.ts with version, exportedAt, and data fields
- [ ] T008 [P] Create ApplicationStateData interface in src/models/ApplicationState.ts with eventAmbassadors, eventTeams, regionalAmbassadors, changesLog arrays
- [ ] T009 Implement migrateFromSessionStorage function in src/utils/storage.ts to copy existing sessionStorage data to localStorage

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Automatic State Persistence (Priority: P1) 🎯 MVP

**Goal**: Persist uploaded CSV data to localStorage so it survives browser sessions, eliminating the need to re-upload files on every visit.

**Independent Test**: Upload CSV files, close browser, reopen application, verify all data is still present without re-uploading. This delivers the primary value of eliminating repetitive file uploads.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Write unit test for saveToStorage function in src/utils/storage.test.ts
- [ ] T011 [P] [US1] Write unit test for loadFromStorage function in src/utils/storage.test.ts
- [ ] T012 [P] [US1] Write unit test for persistEventAmbassadors function in src/actions/persistState.test.ts
- [ ] T013 [P] [US1] Write unit test for persistEventTeams function in src/actions/persistState.test.ts
- [ ] T014 [P] [US1] Write unit test for persistRegionalAmbassadors function in src/actions/persistState.test.ts
- [ ] T015 [P] [US1] Write unit test for persistChangesLog function in src/actions/persistState.test.ts
- [ ] T016 [P] [US1] Write unit test for restoreApplicationState function in src/actions/persistState.test.ts
- [ ] T017 [P] [US1] Write integration test for automatic persistence on CSV upload in src/actions/uploadCSV.test.ts

### Implementation for User Story 1

- [ ] T018 [US1] Create persistEventAmbassadors function in src/actions/persistState.ts that saves EventAmbassadorMap to localStorage
- [ ] T019 [US1] Create persistEventTeams function in src/actions/persistState.ts that saves EventTeamMap to localStorage
- [ ] T020 [US1] Create persistRegionalAmbassadors function in src/actions/persistState.ts that saves RegionalAmbassadorMap to localStorage
- [ ] T021 [US1] Create persistChangesLog function in src/actions/persistState.ts that saves LogEntry array to localStorage
- [ ] T022 [US1] Create restoreApplicationState function in src/actions/persistState.ts that loads all state from localStorage and returns ApplicationState
- [ ] T023 [US1] Modify handleFileUpload function in src/actions/uploadCSV.ts to call persistEventAmbassadors, persistEventTeams, or persistRegionalAmbassadors after parsing CSV
- [ ] T024 [US1] Modify getEventTeamsFromSession function in src/parsers/parseEventTeams.ts to load from localStorage instead of sessionStorage
- [ ] T025 [US1] Modify getRegionalAmbassadorsFromSession function in src/index.ts to load from localStorage instead of sessionStorage
- [ ] T026 [US1] Modify getEventAmbassadorsFromSession function in src/index.ts to load from localStorage instead of sessionStorage
- [ ] T027 [US1] Modify getLogFromSession function in src/index.ts to load from localStorage instead of sessionStorage
- [ ] T028 [US1] Update ambassy function in src/index.ts to call restoreApplicationState on page load and migrate from sessionStorage if needed
- [ ] T029 [US1] Add storage event listener in src/index.ts to detect changes from other tabs and refresh UI
- [ ] T030 [US1] Update purgeButton click handler in src/index.ts to clear localStorage instead of sessionStorage

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can upload CSV files, close browser, and return to see data persisted.

---

## Phase 4: User Story 2 - Export State for Sharing (Priority: P2)

**Goal**: Export current state as a shareable JSON file so users can send it to other ambassadors or parkrun staff for review or collaboration.

**Independent Test**: Click export button, download file, verify file contains all current state data (Event Ambassadors, Event Teams, Regional Ambassadors, changes log) in JSON format. This delivers value by enabling data sharing without requiring recipients to have the original CSV files.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T031 [P] [US2] Write unit test for exportApplicationState function in src/actions/exportState.test.ts
- [ ] T032 [P] [US2] Write unit test for downloadStateFile function in src/actions/exportState.test.ts
- [ ] T033 [P] [US2] Write integration test for export button click triggering file download in src/index.test.ts

### Implementation for User Story 2

- [ ] T034 [US2] Create exportApplicationState function in src/actions/exportState.ts that collects all state from localStorage and creates ApplicationState object
- [ ] T035 [US2] Implement JSON serialization in exportApplicationState function in src/actions/exportState.ts with version "1.0.0" and exportedAt timestamp
- [ ] T036 [US2] Create downloadStateFile function in src/actions/exportState.ts that creates Blob from JSON and triggers browser download
- [ ] T037 [US2] Add export button element to upload section in public/index.html with id "exportButton" and accessible label
- [ ] T038 [US2] Add click event listener for export button in src/index.ts that calls exportApplicationState and downloadStateFile
- [ ] T039 [US2] Generate filename with timestamp format "ambassy-state-YYYY-MM-DD.json" in downloadStateFile function in src/actions/exportState.ts
- [ ] T040 [US2] Add error handling in exportApplicationState function in src/actions/exportState.ts to show user notification if state incomplete

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can persist data and export it as a shareable file.

---

## Phase 5: User Story 3 - Import Shared State (Priority: P3)

**Goal**: Import shared state file so users can view or work with data shared by another ambassador without needing the original CSV files.

**Independent Test**: Import exported state file, verify all data (Event Ambassadors, Event Teams, Regional Ambassadors, changes log) is correctly loaded and displayed. This delivers value by enabling seamless data transfer between users.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T041 [P] [US3] Write unit test for validateStateFile function with valid JSON file in src/actions/importState.test.ts
- [ ] T042 [P] [US3] Write unit test for validateStateFile function with invalid JSON file in src/actions/importState.test.ts
- [ ] T043 [P] [US3] Write unit test for validateStateFile function with missing fields in src/actions/importState.test.ts
- [ ] T044 [P] [US3] Write unit test for validateStateFile function with version mismatch in src/actions/importState.test.ts
- [ ] T045 [P] [US3] Write unit test for importApplicationState function in src/actions/importState.test.ts
- [ ] T046 [P] [US3] Write integration test for import button triggering file selection and import in src/index.test.ts

### Implementation for User Story 3

- [ ] T047 [US3] Create validateStateFile function in src/actions/importState.ts that reads File, parses JSON, and validates structure
- [ ] T048 [US3] Implement version validation in validateStateFile function in src/actions/importState.ts to check version matches "1.0.0"
- [ ] T049 [US3] Implement structure validation in validateStateFile function in src/actions/importState.ts to check required fields (version, exportedAt, data)
- [ ] T050 [US3] Implement data completeness validation in validateStateFile function in src/actions/importState.ts to check all data arrays present
- [ ] T051 [US3] Create custom error classes InvalidFileFormatError, MissingFieldError, VersionMismatchError, InvalidDataError in src/actions/importState.ts
- [ ] T052 [US3] Create importApplicationState function in src/actions/importState.ts that persists validated state to localStorage and updates UI
- [ ] T053 [US3] Add hidden file input element for import in public/index.html with id "importFileInput" and accept=".json"
- [ ] T054 [US3] Add import button element to upload section in public/index.html with id "importButton" and accessible label
- [ ] T055 [US3] Add click event listener for import button in src/index.ts that triggers file input click
- [ ] T056 [US3] Add change event listener for import file input in src/index.ts that calls validateStateFile and importApplicationState
- [ ] T057 [US3] Implement confirmation dialog in src/index.ts before importApplicationState if existing data present in localStorage
- [ ] T058 [US3] Add error handling in import flow in src/index.ts to show clear error messages for InvalidFileFormatError, MissingFieldError, VersionMismatchError, InvalidDataError
- [ ] T059 [US3] Add success notification in importApplicationState function in src/actions/importState.ts after successful import

**Checkpoint**: At this point, all user stories should be independently functional. Users can persist data, export it, and import shared state files.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T060 [P] Update README.md with instructions for using export and import functionality
- [ ] T061 [P] Add user notification for storage unavailability (private browsing mode) in src/utils/storage.ts
- [ ] T062 [P] Add user notification when localStorage quota exceeded in src/utils/storage.ts
- [ ] T063 [P] Ensure all error messages use Australian English in src/actions/importState.ts and src/actions/exportState.ts
- [ ] T064 [P] Verify all UI elements are keyboard accessible (export button, import button, file input) in public/index.html
- [ ] T065 [P] Add visual feedback for export/import operations (loading states, success indicators) in src/index.ts
- [ ] T066 [P] Run quickstart.md validation checklist from specs/001-persist-state/quickstart.md
- [ ] T067 [P] Remove disused sessionStorage code from src/index.ts and src/parsers/parseEventTeams.ts after migration complete
- [ ] T068 [P] Update purgeButton functionality to clear localStorage and show confirmation dialog in src/index.ts

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for state structure (ApplicationState model)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US2 for export format validation

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Storage abstraction before persistence functions
- Persistence functions before UI integration
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Story 1 can start
- All tests for a user story marked [P] can run in parallel
- Storage functions within a story marked [P] can run in parallel
- User Stories 2 and 3 can be worked on after their dependencies are met

---

## Parallel Example: User Story 1

```bash
# Launch all storage abstraction tests together:
Task: "Write unit test for saveToStorage function in src/utils/storage.test.ts"
Task: "Write unit test for loadFromStorage function in src/utils/storage.test.ts"

# Launch all persistence function tests together:
Task: "Write unit test for persistEventAmbassadors function in src/actions/persistState.test.ts"
Task: "Write unit test for persistEventTeams function in src/actions/persistState.test.ts"
Task: "Write unit test for persistRegionalAmbassadors function in src/actions/persistState.test.ts"
Task: "Write unit test for persistChangesLog function in src/actions/persistState.test.ts"

# Launch all persistence function implementations together (after tests):
Task: "Create persistEventAmbassadors function in src/actions/persistState.ts"
Task: "Create persistEventTeams function in src/actions/persistState.ts"
Task: "Create persistRegionalAmbassadors function in src/actions/persistState.ts"
Task: "Create persistChangesLog function in src/actions/persistState.ts"
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
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (can start immediately)
   - Developer B: User Story 2 (waits for US1 ApplicationState model)
   - Developer C: User Story 3 (waits for US2 export format)
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
- Follow constitution: All code must pass linting, type checking, and tests before commit
- Use Australian English for all user-facing text
- Ensure keyboard accessibility for all UI interactions

