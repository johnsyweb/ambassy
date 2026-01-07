# Tasks: Ambassador Capacity Management and Lifecycle

**Input**: Design documents from `/specs/001-ambassador-capacity-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included following Test-Driven Development principles from constitution. Tests MUST be written first and fail before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below follow single project structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification

- [x] T001 Verify project structure matches implementation plan in specs/001-ambassador-capacity-management/plan.md
- [x] T002 [P] Verify TypeScript 5.9.3 configuration in tsconfig.json supports strict mode and ES6 target
- [x] T003 [P] Verify Jest 30.2.0 and ts-jest 29.4.5 are configured for testing with jsdom environment

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Create CapacityStatus enum in src/models/CapacityStatus.ts with values WITHIN, UNDER, OVER
- [ ] T005 [P] Create CapacityLimits interface in src/models/CapacityLimits.ts with eventAmbassadorMin, eventAmbassadorMax, regionalAmbassadorMin, regionalAmbassadorMax fields
- [ ] T006 [P] Create Region enum/type in src/models/Region.ts with REGION_1, REGION_2, REGION_3, UNKNOWN values
- [ ] T007 [P] Create ReallocationSuggestion interface in src/models/ReallocationSuggestion.ts with fromAmbassador, toAmbassador, items, score, reasons, warnings fields
- [ ] T008 [P] Create calculateDistance function using Haversine formula in src/utils/geography.ts
- [ ] T009 [P] Create calculateAverageDistance function in src/utils/geography.ts for proximity scoring
- [ ] T010 [P] Create assignRegion function in src/utils/regions.ts for region assignment
- [ ] T011 [P] Create getRegionForEvent function in src/utils/regions.ts to get event region
- [ ] T012 [P] Create defaultCapacityLimits constant in src/models/CapacityLimits.ts (EA: 2-9, REA: 3-10)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Onboard New Ambassadors (Priority: P1) 🎯 MVP

**Goal**: Add new Event Ambassadors and Regional Ambassadors to the system. This enables the system to grow and adapt as new volunteers join.

**Independent Test**: Add a new Event Ambassador or Regional Ambassador to the system, verify they appear in the data, and confirm they can be assigned events. This delivers value by enabling the system to grow and adapt as new volunteers join.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Write unit test for validateAmbassadorName function (valid unique name) in src/actions/onboardAmbassador.test.ts
- [ ] T014 [P] [US1] Write unit test for validateAmbassadorName function (duplicate name) in src/actions/onboardAmbassador.test.ts
- [ ] T015 [P] [US1] Write unit test for validateAmbassadorName function (empty name) in src/actions/onboardAmbassador.test.ts
- [ ] T016 [P] [US1] Write unit test for onboardEventAmbassador function in src/actions/onboardAmbassador.test.ts
- [ ] T017 [P] [US1] Write unit test for onboardRegionalAmbassador function in src/actions/onboardAmbassador.test.ts
- [ ] T018 [P] [US1] Write integration test for onboarding Event Ambassador and verifying it appears in data in src/actions/onboardAmbassador.test.ts
- [ ] T019 [P] [US1] Write integration test for onboarding Regional Ambassador and verifying it appears in data in src/actions/onboardAmbassador.test.ts

### Implementation for User Story 1

- [ ] T020 [US1] Create validateAmbassadorName function in src/actions/onboardAmbassador.ts to check for duplicate names
- [ ] T021 [US1] Create onboardEventAmbassador function in src/actions/onboardAmbassador.ts that adds new Event Ambassador with empty events array
- [ ] T022 [US1] Create onboardRegionalAmbassador function in src/actions/onboardAmbassador.ts that adds new Regional Ambassador with empty supportsEAs array
- [ ] T023 [US1] Integrate onboardEventAmbassador with persistEventAmbassadors in src/actions/onboardAmbassador.ts to save to localStorage
- [ ] T024 [US1] Integrate onboardRegionalAmbassador with persistRegionalAmbassadors in src/actions/onboardAmbassador.ts to save to localStorage
- [ ] T025 [US1] Add logging for onboarding actions in src/actions/onboardAmbassador.ts using existing LogEntry infrastructure
- [ ] T026 [US1] Add "Add Event Ambassador" button and input dialog to public/index.html
- [ ] T027 [US1] Add "Add Regional Ambassador" button and input dialog to public/index.html
- [ ] T028 [US1] Wire up onboarding buttons in src/index.ts to call onboardEventAmbassador and onboardRegionalAmbassador
- [ ] T029 [US1] Ensure new ambassadors appear in UI after onboarding (refresh display in src/index.ts)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can onboard new ambassadors.

---

## Phase 4: User Story 2 - Capacity Checking and Flagging (Priority: P2)

**Goal**: Display capacity status (within/under/over) for all ambassadors based on configurable limits. This provides visibility into workload distribution and identifies potential issues.

**Independent Test**: Check ambassadors' current allocations against capacity limits, verify correct identification of those within limits, at limits, and over limits. This delivers value by providing visibility into workload distribution and identifying potential issues.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T030 [P] [US2] Write unit test for checkEventAmbassadorCapacity function (within capacity) in src/actions/checkCapacity.test.ts
- [ ] T031 [P] [US2] Write unit test for checkEventAmbassadorCapacity function (under capacity) in src/actions/checkCapacity.test.ts
- [ ] T032 [P] [US2] Write unit test for checkEventAmbassadorCapacity function (over capacity) in src/actions/checkCapacity.test.ts
- [ ] T033 [P] [US2] Write unit test for checkRegionalAmbassadorCapacity function (within capacity) in src/actions/checkCapacity.test.ts
- [ ] T034 [P] [US2] Write unit test for checkRegionalAmbassadorCapacity function (under capacity) in src/actions/checkCapacity.test.ts
- [ ] T035 [P] [US2] Write unit test for checkRegionalAmbassadorCapacity function (over capacity) in src/actions/checkCapacity.test.ts
- [ ] T036 [P] [US2] Write unit test for loadCapacityLimits function (returns defaults when not stored) in src/actions/checkCapacity.test.ts
- [ ] T037 [P] [US2] Write unit test for loadCapacityLimits function (returns stored limits) in src/actions/checkCapacity.test.ts
- [ ] T038 [P] [US2] Write unit test for calculateAllCapacityStatuses function in src/actions/checkCapacity.test.ts
- [ ] T039 [P] [US2] Write integration test for capacity status display in UI in src/index.test.ts

### Implementation for User Story 2

- [ ] T040 [US2] Create checkEventAmbassadorCapacity function in src/actions/checkCapacity.ts to calculate capacity status
- [ ] T041 [US2] Create checkRegionalAmbassadorCapacity function in src/actions/checkCapacity.ts to calculate capacity status
- [ ] T042 [US2] Create loadCapacityLimits function in src/actions/checkCapacity.ts to load from localStorage or return defaults
- [ ] T043 [US2] Create calculateAllCapacityStatuses function in src/actions/checkCapacity.ts to update all ambassadors
- [ ] T044 [US2] Extend EventAmbassador interface in src/models/EventAmbassador.ts to include optional capacityStatus field
- [ ] T045 [US2] Extend RegionalAmbassador interface in src/models/RegionalAmbassador.ts to include optional capacityStatus field
- [ ] T046 [US2] Call calculateAllCapacityStatuses in ambassy function in src/index.ts when data is loaded
- [ ] T047 [US2] Add capacity status display to ambassador tables/lists in public/index.html (colour coding, badges, etc.)
- [ ] T048 [US2] Ensure capacity status updates when allocations change (call calculateAllCapacityStatuses after updates)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Capacity status is visible for all ambassadors.

---

## Phase 5: User Story 3 - Offboard Ambassadors with Event Reallocation (Priority: P3)

**Goal**: Remove ambassadors and suggest reallocation of their events/EAs to ambassadors with available capacity, considering regional alignment, geographic proximity, and conflict avoidance. This streamlines the offboarding process while ensuring events are allocated according to organisational principles.

**Independent Test**: Remove an Event Ambassador with assigned events, verify the system suggests reallocation to ambassadors considering capacity, region, proximity, and conflicts, and confirm events can be reallocated. This delivers value by streamlining the offboarding process while ensuring events are allocated according to organisational principles.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T049 [P] [US3] Write unit test for calculateDistance function (Haversine formula) in src/utils/geography.test.ts
- [ ] T050 [P] [US3] Write unit test for calculateAverageDistance function in src/utils/geography.test.ts
- [ ] T051 [P] [US3] Write unit test for calculateGeographicProximityScore function in src/actions/suggestReallocation.test.ts
- [ ] T052 [P] [US3] Write unit test for calculateReallocationScore function (capacity factor) in src/actions/suggestReallocation.test.ts
- [ ] T053 [P] [US3] Write unit test for calculateReallocationScore function (region factor) in src/actions/suggestReallocation.test.ts
- [ ] T054 [P] [US3] Write unit test for calculateReallocationScore function (proximity factor) in src/actions/suggestReallocation.test.ts
- [ ] T055 [P] [US3] Write unit test for calculateReallocationScore function (conflict avoidance) in src/actions/suggestReallocation.test.ts
- [ ] T056 [P] [US3] Write unit test for suggestEventReallocation function in src/actions/suggestReallocation.test.ts
- [ ] T057 [P] [US3] Write unit test for suggestEventAmbassadorReallocation function in src/actions/suggestReallocation.test.ts
- [ ] T058 [P] [US3] Write unit test for checkReallocationCapacityWarning function in src/actions/offboardAmbassador.test.ts
- [ ] T059 [P] [US3] Write unit test for offboardEventAmbassador function in src/actions/offboardAmbassador.test.ts
- [ ] T060 [P] [US3] Write unit test for offboardRegionalAmbassador function in src/actions/offboardAmbassador.test.ts
- [ ] T061 [P] [US3] Write integration test for offboarding flow with reallocation suggestions in src/actions/offboardAmbassador.test.ts

### Implementation for User Story 3

- [ ] T062 [US3] Implement calculateDistance function using Haversine formula in src/utils/geography.ts
- [ ] T063 [US3] Implement calculateAverageDistance function in src/utils/geography.ts
- [ ] T064 [US3] Implement calculateGeographicProximityScore function in src/actions/suggestReallocation.ts
- [ ] T065 [US3] Implement calculateReallocationScore function in src/actions/suggestReallocation.ts with multi-factor scoring (capacity, region, proximity, conflicts)
- [ ] T066 [US3] Implement suggestEventReallocation function in src/actions/suggestReallocation.ts
- [ ] T067 [US3] Implement suggestEventAmbassadorReallocation function in src/actions/suggestReallocation.ts
- [ ] T068 [US3] Implement checkReallocationCapacityWarning function in src/actions/offboardAmbassador.ts
- [ ] T069 [US3] Implement offboardEventAmbassador function in src/actions/offboardAmbassador.ts
- [ ] T070 [US3] Implement offboardRegionalAmbassador function in src/actions/offboardAmbassador.ts
- [ ] T071 [US3] Add logging for offboarding and reallocation actions in src/actions/offboardAmbassador.ts
- [ ] T072 [US3] Extend EventAmbassador interface in src/models/EventAmbassador.ts to include optional region and conflicts fields
- [ ] T073 [US3] Extend RegionalAmbassador interface in src/models/RegionalAmbassador.ts to include optional region and conflicts fields
- [ ] T074 [US3] Add "Offboard Ambassador" button and confirmation dialog to public/index.html
- [ ] T075 [US3] Wire up offboarding button in src/index.ts to show reallocation suggestions dialog
- [ ] T076 [US3] Implement reallocation suggestion display UI in public/index.html (show suggestions with scores, reasons, warnings)
- [ ] T077 [US3] Wire up reallocation selection in src/index.ts to call offboard functions with selected recipient
- [ ] T078 [US3] Ensure UI refreshes after offboarding and reallocation in src/index.ts
- [ ] T079 [US3] Add region assignment UI to public/index.html (for events and ambassadors)
- [ ] T080 [US3] Wire up region assignment in src/index.ts to call assignRegion function
- [ ] T081 [US3] Add conflict of interest flagging UI to public/index.html
- [ ] T082 [US3] Wire up conflict flagging in src/index.ts to update ambassador conflicts field

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can offboard ambassadors with intelligent reallocation suggestions.

---

## Phase 6: User Story 4 - Configurable Capacity Limits (Priority: P4)

**Goal**: Configure preferred capacity ranges for Event Ambassadors and Regional Ambassadors. This allows the system to adapt to changing organisational needs without code changes.

**Independent Test**: Change capacity limit settings, verify the new limits are saved, and confirm capacity checks use the updated limits. This delivers value by allowing the system to adapt to changing organisational needs without code changes.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T083 [P] [US4] Write unit test for validateCapacityLimits function (valid limits) in src/actions/configureCapacityLimits.test.ts
- [ ] T084 [P] [US4] Write unit test for validateCapacityLimits function (min > max) in src/actions/configureCapacityLimits.test.ts
- [ ] T085 [P] [US4] Write unit test for validateCapacityLimits function (negative values) in src/actions/configureCapacityLimits.test.ts
- [ ] T086 [P] [US4] Write unit test for validateCapacityLimits function (non-integers) in src/actions/configureCapacityLimits.test.ts
- [ ] T087 [P] [US4] Write unit test for saveCapacityLimits function in src/actions/configureCapacityLimits.test.ts
- [ ] T088 [P] [US4] Write integration test for configuring limits and verifying capacity statuses update in src/actions/configureCapacityLimits.test.ts

### Implementation for User Story 4

- [ ] T089 [US4] Create validateCapacityLimits function in src/actions/configureCapacityLimits.ts
- [ ] T090 [US4] Create saveCapacityLimits function in src/actions/configureCapacityLimits.ts to save to localStorage
- [ ] T091 [US4] Update loadCapacityLimits function in src/actions/checkCapacity.ts to use saveCapacityLimits for persistence
- [ ] T092 [US4] Add "Configure Capacity Limits" button and dialog to public/index.html
- [ ] T093 [US4] Wire up configuration button in src/index.ts to show capacity limits dialog
- [ ] T094 [US4] Implement capacity limits input form in public/index.html with validation
- [ ] T095 [US4] Wire up save button in src/index.ts to validate and save capacity limits
- [ ] T096 [US4] Ensure capacity statuses recalculate after limits are saved in src/index.ts
- [ ] T097 [US4] Include capacity limits in ApplicationState export/import in src/models/ApplicationState.ts

**Checkpoint**: At this point, all user stories should be independently functional. Users can configure capacity limits.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T098 [P] Ensure all onboarding/offboarding actions are logged in changes log
- [ ] T099 [P] Verify capacity status updates correctly when events are assigned/reassigned
- [ ] T100 [P] Verify region assignment persists across sessions
- [ ] T101 [P] Verify conflict flagging persists across sessions
- [ ] T102 [P] Ensure geographic calculations handle missing coordinates gracefully
- [ ] T103 [P] Verify reallocation suggestions handle edge cases (no recipients, all at capacity, etc.)
- [ ] T104 [P] Ensure all new UI elements are keyboard accessible
- [ ] T105 [P] Verify Australian English is used for all user-facing text
- [ ] T106 [P] Update README.md with instructions for onboarding, offboarding, capacity checking, and configuration
- [ ] T107 [P] Ensure all tests pass and maintain high code coverage
- [ ] T108 [P] Review code for adherence to Single Responsibility Principle
- [ ] T109 [P] Perform final lint:fix and lint check
- [ ] T110 [P] Run TypeScript type checking (tsc --noEmit)
- [ ] T111 [P] Run all tests (pnpm test)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses CapacityLimits and CapacityStatus from foundation
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses capacity checking from US2, but can be implemented independently
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Uses capacity checking infrastructure from US2

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before actions
- Core functions before UI integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
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
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
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
- Capacity status is calculated, not stored (recalculated when needed)
- Region and conflicts are optional fields that can be added incrementally
- Geographic calculations use Haversine formula for accuracy
- Reallocation scoring balances multiple factors pragmatically

