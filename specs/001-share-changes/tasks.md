# Tasks: Share Changes with Ambassadors

**Input**: Design documents from `/specs/001-share-changes/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Following TDD approach - tests written first, then implementation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, tests co-located with source files using `.test.ts` suffix

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create types and models that all user stories depend on

- [ ] T001 [P] Create `SharingMethod` type in `src/types/SharingTypes.ts`
- [ ] T002 [P] Create `ShareStateResult` interface in `src/types/SharingTypes.ts`
- [ ] T003 [P] Create `ChangeTracker` model in `src/models/ChangeTracker.ts`
- [ ] T004 [P] Create `ImportGuidanceState` model in `src/models/ImportGuidanceState.ts`
- [ ] T005 [P] Create error types (`SharingError`, `StateTooLargeError`, `ClipboardUnavailableError`) in `src/types/SharingTypes.ts`

**Checkpoint**: Types and models ready - foundational work can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational Components

- [ ] T006 [P] [FOUNDATION] Write tests for `ChangeTracker` in `src/models/ChangeTracker.test.ts`
- [ ] T007 [P] [FOUNDATION] Write tests for `ImportGuidanceState` in `src/models/ImportGuidanceState.test.ts`
- [ ] T008 [P] [FOUNDATION] Write tests for `trackStateChange()` in `src/actions/trackChanges.test.ts`
- [ ] T009 [P] [FOUNDATION] Write tests for `hasUnsavedChanges()` in `src/actions/trackChanges.test.ts`
- [ ] T010 [P] [FOUNDATION] Write tests for `markStateExported()` in `src/actions/trackChanges.test.ts`
- [ ] T011 [P] [FOUNDATION] Write tests for clipboard utilities in `src/utils/clipboard.test.ts`
- [ ] T012 [P] [FOUNDATION] Write tests for URL sharing utilities in `src/utils/urlSharing.test.ts`

### Implementation for Foundational Components

- [ ] T013 [P] [FOUNDATION] Implement `ChangeTracker` model in `src/models/ChangeTracker.ts` (T006 must pass)
- [ ] T014 [P] [FOUNDATION] Implement `ImportGuidanceState` model in `src/models/ImportGuidanceState.ts` (T007 must pass)
- [ ] T015 [FOUNDATION] Implement `trackStateChange()` in `src/actions/trackChanges.ts` (T008 must pass)
- [ ] T016 [FOUNDATION] Implement `hasUnsavedChanges()` in `src/actions/trackChanges.ts` (T009 must pass)
- [ ] T017 [FOUNDATION] Implement `markStateExported()` in `src/actions/trackChanges.ts` (T010 must pass)
- [ ] T018 [P] [FOUNDATION] Implement clipboard utilities in `src/utils/clipboard.ts` (T011 must pass)
- [ ] T019 [P] [FOUNDATION] Implement URL sharing utilities in `src/utils/urlSharing.ts` (T012 must pass)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Easy State Export and Sharing (Priority: P1) 🎯 MVP

**Goal**: Ambassadors can easily export and share their state via multiple methods (file, URL, clipboard)

**Independent Test**: Export state after making changes, share via each method, verify another ambassador can import it successfully

### Tests for User Story 1

- [ ] T020 [P] [US1] Write tests for `shareStateAsFile()` in `src/actions/shareState.test.ts`
- [ ] T021 [P] [US1] Write tests for `shareStateAsUrl()` in `src/actions/shareState.test.ts`
- [ ] T022 [P] [US1] Write tests for `shareStateToClipboard()` in `src/actions/shareState.test.ts`
- [ ] T023 [US1] Write integration test for full export/share flow in `src/actions/shareState.test.ts`

### Implementation for User Story 1

- [ ] T024 [US1] Enhance `exportApplicationState()` in `src/actions/exportState.ts` to call `markStateExported()` on success
- [ ] T025 [US1] Implement `shareStateAsFile()` in `src/actions/shareState.ts` (T020 must pass)
- [ ] T026 [US1] Implement `shareStateAsUrl()` in `src/actions/shareState.ts` (T021 must pass)
- [ ] T027 [US1] Implement `shareStateToClipboard()` in `src/actions/shareState.ts` (T022 must pass)
- [ ] T028 [US1] Create sharing UI component with three method options (file, URL, clipboard) in `src/index.ts`
- [ ] T029 [US1] Integrate sharing methods with existing export button in `src/index.ts`
- [ ] T030 [US1] Add error handling and user-friendly error messages for sharing failures

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 4 - Friendly Import Experience (Priority: P1) 🎯 MVP

**Goal**: Less technical ambassadors can easily import shared state with clear, friendly guidance

**Independent Test**: Non-technical user receives shared file/URL/clipboard data and successfully imports it using only on-screen guidance

### Tests for User Story 4

- [ ] T031 [P] [US4] Write tests for `shouldShowImportGuidance()` in `src/actions/showImportGuidance.test.ts`
- [ ] T032 [P] [US4] Write tests for `showImportGuidance()` in `src/actions/showImportGuidance.test.ts`
- [ ] T033 [P] [US4] Write tests for `dismissImportGuidance()` in `src/actions/showImportGuidance.test.ts`
- [ ] T034 [P] [US4] Write tests for `markDataImported()` in `src/actions/showImportGuidance.test.ts`
- [ ] T035 [US4] Write tests for URL import parsing in `src/actions/importState.test.ts`
- [ ] T036 [US4] Write tests for clipboard import parsing in `src/actions/importState.test.ts`

### Implementation for User Story 4

- [ ] T037 [US4] Implement `shouldShowImportGuidance()` in `src/actions/showImportGuidance.ts` (T031 must pass)
- [ ] T038 [US4] Implement `showImportGuidance()` in `src/actions/showImportGuidance.ts` (T032 must pass)
- [ ] T039 [US4] Implement `dismissImportGuidance()` in `src/actions/showImportGuidance.ts` (T033 must pass)
- [ ] T040 [US4] Implement `markDataImported()` in `src/actions/showImportGuidance.ts` (T034 must pass)
- [ ] T041 [US4] Enhance `importApplicationState()` in `src/actions/importState.ts` to call `markDataImported()` on success
- [ ] T042 [US4] Add URL import parsing function in `src/actions/importState.ts` (T035 must pass)
- [ ] T043 [US4] Add clipboard import parsing function in `src/actions/importState.ts` (T036 must pass)
- [ ] T044 [US4] Create import guidance UI component with step-by-step instructions in `public/index.html` and `src/index.ts`
- [ ] T045 [US4] Display import guidance on main screen when `shouldShowImportGuidance()` returns true
- [ ] T046 [US4] Add drag-and-drop support for import files in `src/index.ts`
- [ ] T047 [US4] Enhance import error messages to be plain language and actionable
- [ ] T048 [US4] Add success confirmation message after successful import with summary

**Checkpoint**: At this point, User Stories 1 AND 4 should both work independently (MVP complete)

---

## Phase 5: User Story 2 - Cross-Browser State Synchronization (Priority: P2)

**Goal**: State automatically syncs across browser tabs for same-browser scenarios

**Independent Test**: Make changes in one tab, verify state appears in another tab, confirm changes persist across sessions

### Tests for User Story 2

- [ ] T049 [P] [US2] Write tests for `syncStateAcrossTabs()` in `src/actions/syncState.test.ts`
- [ ] T050 [US2] Write integration test for cross-tab sync using storage events in `src/actions/syncState.test.ts`

### Implementation for User Story 2

- [ ] T051 [US2] Create `SyncMetadata` model in `src/models/SyncState.ts`
- [ ] T052 [US2] Implement `syncStateAcrossTabs()` in `src/actions/syncState.ts` (T049 must pass)
- [ ] T053 [US2] Set up `storage` event listener for cross-tab communication in `src/actions/syncState.ts`
- [ ] T054 [US2] Implement conflict detection and resolution (last-write-wins) in `src/actions/syncState.ts`
- [ ] T055 [US2] Integrate sync with state change tracking (call sync after `trackStateChange()`) in `src/actions/trackChanges.ts`
- [ ] T056 [US2] Add UI indicator showing sync status in `src/index.ts`
- [ ] T057 [US2] Handle offline scenarios by queuing sync operations in `src/actions/syncState.ts`

**Checkpoint**: At this point, User Stories 1, 2, AND 4 should all work independently

---

## Phase 6: User Story 3 - Export Reminder Before Window Close (Priority: P3)

**Goal**: System reminds ambassadors to export before closing if they have unsaved changes

**Independent Test**: Make changes, attempt to close window, verify reminder appears

### Tests for User Story 3

- [ ] T058 [P] [US3] Write tests for `setupExportReminder()` in `src/actions/trackChanges.test.ts`
- [ ] T059 [P] [US3] Write tests for `removeExportReminder()` in `src/actions/trackChanges.test.ts`
- [ ] T060 [US3] Write integration test for beforeunload reminder triggering in `src/actions/trackChanges.test.ts`

### Implementation for User Story 3

- [ ] T061 [US3] Implement `setupExportReminder()` in `src/actions/trackChanges.ts` (T058 must pass)
- [ ] T062 [US3] Implement `removeExportReminder()` in `src/actions/trackChanges.ts` (T059 must pass)
- [ ] T063 [US3] Register beforeunload event listener in `src/index.ts` during initialization
- [ ] T064 [US3] Integrate reminder with change tracking (only show if `hasUnsavedChanges() === true`)
- [ ] T065 [US3] Add visual indicator for unsaved changes (optional badge/icon) in `src/index.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Integration and State Mutation Hooks

**Purpose**: Integrate change tracking into all existing state mutation functions

- [ ] T066 [INTEGRATION] Add `trackStateChange()` call to `onboardAmbassador()` in `src/actions/onboardAmbassador.ts`
- [ ] T067 [INTEGRATION] Add `trackStateChange()` call to `offboardAmbassador()` in `src/actions/offboardAmbassador.ts`
- [ ] T068 [INTEGRATION] Add `trackStateChange()` call to `reallocateEventAmbassador()` in `src/actions/reallocateEventAmbassador.ts`
- [ ] T069 [INTEGRATION] Add `trackStateChange()` call to `reallocateEventTeam()` in `src/actions/reallocateEventTeam.ts`
- [ ] T070 [INTEGRATION] Add `trackStateChange()` call to `assignEventToAmbassador()` in `src/actions/assignEventToAmbassador.ts`
- [ ] T071 [INTEGRATION] Add `trackStateChange()` call to `resolveIssue()` in `src/actions/resolveIssue.ts`
- [ ] T072 [INTEGRATION] Add `trackStateChange()` call to any other state mutation functions identified

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T073 [P] Update README.md with new sharing features and usage instructions
- [ ] T074 [P] Add keyboard accessibility for all new UI components (sharing buttons, import guidance)
- [ ] T075 [P] Ensure all user-facing text uses Australian English
- [ ] T076 [P] Add ARIA labels and roles for accessibility (screen readers)
- [ ] T077 [P] Verify all error messages are plain language and actionable
- [ ] T078 [P] Performance testing: verify export/import operations complete in <1 second for typical states
- [ ] T079 [P] Test cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] T080 [P] Test offline scenarios and graceful degradation
- [ ] T081 [P] Code cleanup and refactoring (remove any temporary code)
- [ ] T082 [P] Run quickstart.md validation to ensure documentation matches implementation
- [ ] T083 [P] Verify all tests pass and coverage is adequate
- [ ] T084 [P] Run linting and fix any issues
- [ ] T085 [P] Run TypeScript type checking and fix any issues

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US4 → US2 → US3)
- **Integration (Phase 7)**: Depends on User Stories 1 and 3 completion (change tracking)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on change tracking (Phase 2)

### Within Each User Story

- Tests (TDD) MUST be written and FAIL before implementation
- Models before actions
- Actions before UI integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T005) marked [P] can run in parallel
- All Foundational test tasks (T006-T012) marked [P] can run in parallel
- All Foundational implementation tasks (T013-T019) marked [P] can run in parallel (after tests pass)
- Once Foundational phase completes, User Stories 1 and 4 can start in parallel (both P1)
- User Stories 2 and 3 can start after Foundational, but US3 depends on change tracking
- All tests for a user story marked [P] can run in parallel
- All Polish tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Stories 1 & 4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Easy Export/Sharing)
4. Complete Phase 4: User Story 4 (Friendly Import)
5. Complete Phase 7: Integration (hook change tracking into mutations)
6. **STOP and VALIDATE**: Test User Stories 1 & 4 independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic sharing)
3. Add User Story 4 → Test independently → Deploy/Demo (MVP with friendly import)
4. Add User Story 2 → Test independently → Deploy/Demo (Cross-tab sync)
5. Add User Story 3 → Test independently → Deploy/Demo (Export reminders)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Export/Sharing)
   - Developer B: User Story 4 (Import Guidance)
3. After US1 & US4 complete:
   - Developer A: User Story 2 (Cross-browser sync)
   - Developer B: User Story 3 (Export reminders)
   - Developer C: Integration (Phase 7)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All new code must follow constitution requirements (TDD, accessibility, Australian English, etc.)
