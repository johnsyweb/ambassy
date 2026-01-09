# Tasks: Table-Map Navigation Integration

**Input**: Design documents from `/specs/002-table-map-navigation/`
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

- [ ] T001 Verify project structure matches implementation plan in specs/002-table-map-navigation/plan.md
- [ ] T002 [P] Verify TypeScript 5.9.3 configuration in tsconfig.json supports strict mode and ES6 target
- [ ] T003 [P] Verify Jest 30.2.0 and ts-jest 29.4.5 are configured for testing with jsdom environment

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Create SelectionState interface in src/models/SelectionState.ts with selectedEventShortName, selectedEventAmbassador, selectedRegionalAmbassador, highlightedEvents, activeTab fields
- [ ] T005 [P] Create createSelectionState function in src/models/SelectionState.ts that returns new SelectionState instance
- [ ] T006 [P] Create clearSelection function in src/models/SelectionState.ts to reset all selection fields
- [ ] T007 [P] Create mapNavigation utility functions in src/utils/mapNavigation.ts for centerMapOnEvents (single and multiple events)
- [ ] T008 [P] Add CSS class `.selected` for table row highlighting in public/style.css
- [ ] T009 [P] Add CSS styles for map marker highlighting (larger radius, different color) in public/style.css

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Event Teams ↔ Map Navigation (Priority: P1) 🎯 MVP

**Goal**: Enable bidirectional navigation between Event Teams table and map. Users can select a table row to highlight/center the event on the map, and click a map marker to highlight the corresponding table row.

**Independent Test**: Select a row in the Event Teams table, verify the event is highlighted and centered on the map. Click an event marker on the map, verify the corresponding table row is highlighted. This delivers value by enabling seamless navigation between data view and geographic view.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Write unit test for selectEventTeamRow function (updates selection state) in src/actions/tableMapNavigation.test.ts
- [ ] T011 [P] [US1] Write unit test for selectEventTeamRow function (validates event exists) in src/actions/tableMapNavigation.test.ts
- [ ] T012 [P] [US1] Write unit test for selectMapEvent function (updates selection state) in src/actions/tableMapNavigation.test.ts
- [ ] T013 [P] [US1] Write unit test for highlightEventsOnMap function (highlights single event) in src/utils/mapNavigation.test.ts
- [ ] T014 [P] [US1] Write unit test for highlightEventsOnMap function (clears previous highlights) in src/utils/mapNavigation.test.ts
- [ ] T015 [P] [US1] Write unit test for centerMapOnEvents function (single event uses setView) in src/utils/mapNavigation.test.ts
- [ ] T016 [P] [US1] Write unit test for highlightTableRow function (adds selected class) in src/actions/tableMapNavigation.test.ts
- [ ] T017 [P] [US1] Write unit test for highlightTableRow function (clears previous selection) in src/actions/tableMapNavigation.test.ts
- [ ] T018 [P] [US1] Write unit test for scrollToTableRow function (scrolls to row) in src/actions/tableMapNavigation.test.ts
- [ ] T019 [P] [US1] Write integration test for table row click → map highlight in src/actions/tableMapNavigation.test.ts
- [ ] T020 [P] [US1] Write integration test for map marker click → table highlight in src/actions/tableMapNavigation.test.ts

### Implementation for User Story 1

- [ ] T021 [US1] Implement selectEventTeamRow function in src/actions/tableMapNavigation.ts
- [ ] T022 [US1] Implement selectMapEvent function in src/actions/tableMapNavigation.ts
- [ ] T023 [US1] Implement highlightEventsOnMap function in src/utils/mapNavigation.ts
- [ ] T024 [US1] Implement centerMapOnEvents function in src/utils/mapNavigation.ts (single event case)
- [ ] T025 [US1] Implement highlightTableRow function in src/actions/tableMapNavigation.ts
- [ ] T026 [US1] Implement scrollToTableRow function in src/actions/tableMapNavigation.ts
- [ ] T027 [US1] Extend populateMap.ts to store marker references in Map<string, L.CircleMarker> keyed by event short name
- [ ] T028 [US1] Extend populateMap.ts to create highlightLayer (L.LayerGroup) for highlighted markers
- [ ] T029 [US1] Add click handlers to map markers in populateMap.ts to call selectMapEvent
- [ ] T030 [US1] Add click handlers to Event Teams table rows in populateEventTeamsTable.ts to call selectEventTeamRow
- [ ] T031 [US1] Wire up table selection → map highlighting in src/index.ts or tableMapNavigation.ts
- [ ] T032 [US1] Wire up map selection → table highlighting in src/index.ts or tableMapNavigation.ts
- [ ] T033 [US1] Ensure map highlights update when Event Teams table row is selected
- [ ] T034 [US1] Ensure table highlights update when map marker is clicked (if tab visible)

**Checkpoint**: At this point, User Story 1 should be fully functional. Users can navigate between Event Teams table and map bidirectionally.

---

## Phase 4: User Story 2 - Map → Event Teams Table Navigation (Priority: P2)

**Goal**: When a user clicks an event marker on the map, the corresponding row in the Event Teams table is highlighted if that tab is visible.

**Independent Test**: Click an event marker on the map, verify the Event Teams table row is highlighted and scrolled into view (if tab is visible). Switch tabs and verify selection persists. This delivers value by enabling map-first navigation workflow.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T035 [P] [US2] Write unit test for tab visibility check function in src/actions/tableMapNavigation.test.ts
- [ ] T036 [P] [US2] Write unit test for deferred table highlighting (tab not visible) in src/actions/tableMapNavigation.test.ts
- [ ] T037 [P] [US2] Write integration test for map click → table highlight when tab visible in src/actions/tableMapNavigation.test.ts
- [ ] T038 [P] [US2] Write integration test for map click → deferred highlight when tab not visible in src/actions/tableMapNavigation.test.ts
- [ ] T039 [P] [US2] Write integration test for tab switch → apply deferred selection in src/actions/tableMapNavigation.test.ts

### Implementation for User Story 2

- [ ] T040 [US2] Implement tab visibility check function in src/actions/tableMapNavigation.ts
- [ ] T041 [US2] Add tab visibility awareness to map → table navigation logic
- [ ] T042 [US2] Store selection state when tab is not visible
- [ ] T043 [US2] Apply stored selection when Event Teams tab becomes visible
- [ ] T044 [US2] Wire up tab switch handler to apply deferred selections in src/index.ts

**Checkpoint**: At this point, User Story 2 should be fully functional. Map clicks highlight table rows when tab is visible, and selection persists across tab switches.

---

## Phase 5: User Story 3 - Event Ambassador → Map Navigation (Priority: P3)

**Goal**: When a user selects a row in the Event Ambassador table, all events assigned to that ambassador are highlighted and centered on the map.

**Independent Test**: Select a row in the Event Ambassador table, verify all events assigned to that ambassador are highlighted on the map, and the map centers/zooms to show all highlighted events. This delivers value by enabling users to see geographic distribution of an ambassador's events.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T045 [P] [US3] Write unit test for selectEventAmbassadorRow function (updates selection state) in src/actions/tableMapNavigation.test.ts
- [ ] T046 [P] [US3] Write unit test for selectEventAmbassadorRow function (finds all events for EA) in src/actions/tableMapNavigation.test.ts
- [ ] T047 [P] [US3] Write unit test for selectEventAmbassadorRow function (handles EA with no events) in src/actions/tableMapNavigation.test.ts
- [ ] T048 [P] [US3] Write unit test for centerMapOnEvents function (multiple events uses fitBounds) in src/utils/mapNavigation.test.ts
- [ ] T049 [P] [US3] Write integration test for EA table row click → map highlights all events in src/actions/tableMapNavigation.test.ts

### Implementation for User Story 3

- [ ] T050 [US3] Implement selectEventAmbassadorRow function in src/actions/tableMapNavigation.ts
- [ ] T051 [US3] Add logic to find all events assigned to selected Event Ambassador
- [ ] T052 [US3] Update highlightedEvents in selection state with all EA events
- [ ] T053 [US3] Extend centerMapOnEvents to handle multiple events (use fitBounds)
- [ ] T054 [US3] Add click handlers to Event Ambassador table rows in populateAmbassadorsTable.ts
- [ ] T055 [US3] Wire up EA table selection → map highlighting in src/index.ts or tableMapNavigation.ts
- [ ] T056 [US3] Ensure map highlights and centers on all EA events when EA row is selected

**Checkpoint**: At this point, User Story 3 should be fully functional. Users can select an Event Ambassador to see all their events highlighted on the map.

---

## Phase 6: User Story 4 - Regional Ambassador → Map Navigation (Priority: P4)

**Goal**: When a user selects a row in the Regional Ambassador table, all events assigned to Event Ambassadors supported by that Regional Ambassador are highlighted and centered on the map.

**Independent Test**: Select a row in the Regional Ambassador table, verify all events assigned to supported Event Ambassadors are highlighted on the map, and the map centers/zooms to show all highlighted events. This delivers value by enabling users to see geographic distribution of a region's events.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T057 [P] [US4] Write unit test for selectRegionalAmbassadorRow function (updates selection state) in src/actions/tableMapNavigation.test.ts
- [ ] T058 [P] [US4] Write unit test for selectRegionalAmbassadorRow function (finds all events for supported EAs) in src/actions/tableMapNavigation.test.ts
- [ ] T059 [P] [US4] Write unit test for selectRegionalAmbassadorRow function (handles REA with no supported EAs) in src/actions/tableMapNavigation.test.ts
- [ ] T060 [P] [US4] Write unit test for selectRegionalAmbassadorRow function (handles REA with EAs that have no events) in src/actions/tableMapNavigation.test.ts
- [ ] T061 [P] [US4] Write integration test for REA table row click → map highlights all region events in src/actions/tableMapNavigation.test.ts

### Implementation for User Story 4

- [ ] T062 [US4] Implement selectRegionalAmbassadorRow function in src/actions/tableMapNavigation.ts
- [ ] T063 [US4] Add logic to find all Event Ambassadors supported by selected Regional Ambassador
- [ ] T064 [US4] Add logic to find all events assigned to supported Event Ambassadors
- [ ] T065 [US4] Update highlightedEvents in selection state with all region events
- [ ] T066 [US4] Add click handlers to Regional Ambassador table rows in populateAmbassadorsTable.ts
- [ ] T067 [US4] Wire up REA table selection → map highlighting in src/index.ts or tableMapNavigation.ts
- [ ] T068 [US4] Ensure map highlights and centers on all region events when REA row is selected

**Checkpoint**: At this point, User Story 4 should be fully functional. Users can select a Regional Ambassador to see all events in their region highlighted on the map.

---

## Phase 7: Accessibility & Keyboard Navigation

**Purpose**: Ensure all interactions are keyboard accessible and screen reader compatible

### Tests for Accessibility

- [ ] T069 [P] Write unit test for onTableRowKeyDown function (arrow keys navigate) in src/actions/tableMapNavigation.test.ts
- [ ] T070 [P] Write unit test for onTableRowKeyDown function (Enter selects) in src/actions/tableMapNavigation.test.ts
- [ ] T071 [P] Write unit test for onMapMarkerKeyPress function (Enter/Space selects) in src/actions/tableMapNavigation.test.ts
- [ ] T072 [P] Write integration test for keyboard navigation in Event Teams table in src/actions/tableMapNavigation.test.ts
- [ ] T073 [P] Write integration test for keyboard navigation in EA table in src/actions/tableMapNavigation.test.ts
- [ ] T074 [P] Write integration test for keyboard navigation in REA table in src/actions/tableMapNavigation.test.ts
- [ ] T075 [P] Write integration test for keyboard navigation on map markers in src/actions/tableMapNavigation.test.ts

### Implementation for Accessibility

- [ ] T076 Add tabindex="0" to table rows in populateEventTeamsTable.ts
- [ ] T077 Add tabindex="0" to table rows in populateAmbassadorsTable.ts
- [ ] T078 Add role="row" and aria-selected attributes to table rows
- [ ] T079 Implement onTableRowKeyDown function in src/actions/tableMapNavigation.ts (arrow keys, Enter)
- [ ] T080 Add keyboard event handlers to table rows
- [ ] T081 Add role="button" and aria-label to map markers in populateMap.ts
- [ ] T082 Add tabindex="0" to map markers for keyboard navigation
- [ ] T083 Implement onMapMarkerKeyPress function in src/actions/tableMapNavigation.ts
- [ ] T084 Add keyboard event handlers to map markers
- [ ] T085 Add aria-live region for selection announcements in public/index.html
- [ ] T086 Implement focus management when selection changes
- [ ] T087 Add screen reader announcements for selection changes

**Checkpoint**: At this point, all interactions should be fully keyboard accessible and screen reader compatible.

---

## Phase 8: Polish & Edge Cases

**Purpose**: Handle edge cases, add animations, optimize performance

### Tests for Edge Cases

- [ ] T088 [P] Write unit test for handling event that doesn't exist in src/actions/tableMapNavigation.test.ts
- [ ] T089 [P] Write unit test for handling EA with no events in src/actions/tableMapNavigation.test.ts
- [ ] T090 [P] Write unit test for handling REA with no supported EAs in src/actions/tableMapNavigation.test.ts
- [ ] T091 [P] Write unit test for handling map not initialized in src/actions/tableMapNavigation.test.ts
- [ ] T092 [P] Write unit test for handling rapid selection changes in src/actions/tableMapNavigation.test.ts
- [ ] T093 [P] Write performance test for highlighting 1000+ events in src/utils/mapNavigation.test.ts

### Implementation for Polish

- [ ] T094 Add smooth animations to map centering (animate: true option)
- [ ] T095 Add smooth scrolling to table row scrolling (scrollIntoView with behavior: 'smooth')
- [ ] T096 Handle edge case: event doesn't exist (clear selection gracefully)
- [ ] T097 Handle edge case: EA/REA with no events (show no highlights, don't error)
- [ ] T098 Handle edge case: map not initialized (store selection, apply when map ready)
- [ ] T099 Handle edge case: rapid selection changes (debounce or cancel previous)
- [ ] T100 Optimize highlight layer updates (batch operations)
- [ ] T101 Add visual feedback for selection state (loading indicators if needed)
- [ ] T102 Ensure selection state persists during tab switches
- [ ] T103 Clear selection when data is refreshed/reloaded

**Checkpoint**: At this point, all edge cases should be handled and performance should be optimized.

---

## Phase 9: Integration & Coordination

**Purpose**: Wire up all components and ensure they work together

### Tests for Integration

- [ ] T104 [P] Write integration test for full navigation flow (table → map → table) in src/actions/tableMapNavigation.test.ts
- [ ] T105 [P] Write integration test for EA selection → map → clear → REA selection in src/actions/tableMapNavigation.test.ts
- [ ] T106 [P] Write integration test for tab switching with selections in src/actions/tableMapNavigation.test.ts

### Implementation for Integration

- [ ] T107 Implement initializeTableMapNavigation function in src/actions/tableMapNavigation.ts
- [ ] T108 Wire up all event handlers in src/index.ts
- [ ] T109 Ensure selection state is shared across all components
- [ ] T110 Ensure map highlights update when tables are repopulated
- [ ] T111 Ensure table highlights update when map is repopulated
- [ ] T112 Add cleanup logic to clear selections when needed
- [ ] T113 Verify all user stories work together without conflicts

**Checkpoint**: At this point, all components should be integrated and working together seamlessly.

---

## Phase 10: Documentation & Final Checks

**Purpose**: Update documentation and perform final validation

- [ ] T114 Update README.md with table-map navigation features
- [ ] T115 Add usage examples to README.md
- [ ] T116 Verify all tests pass
- [ ] T117 Verify code coverage meets requirements
- [ ] T118 Run lint:fix and verify no linting errors
- [ ] T119 Run TypeScript type checking (tsc --noEmit)
- [ ] T120 Verify keyboard navigation works end-to-end
- [ ] T121 Verify screen reader compatibility
- [ ] T122 Performance test with 1000+ events
- [ ] T123 Verify no console errors or warnings
- [ ] T124 Verify all existing functionality still works

**Checkpoint**: Feature complete and ready for use.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed sequentially (US1 → US2 → US3 → US4)
  - Or US1 can be completed independently before others
- **Accessibility (Phase 7)**: Can start after US1, but benefits from all user stories complete
- **Polish (Phase 8)**: Depends on all user stories being complete
- **Integration (Phase 9)**: Depends on all user stories and accessibility being complete
- **Documentation (Phase 10)**: Depends on all implementation being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 functionality
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses same map highlighting infrastructure
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Uses same map highlighting infrastructure

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before actions
- Core functions before UI integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel

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
6. Add Accessibility → Test independently → Deploy/Demo
7. Add Polish → Test independently → Deploy/Demo
8. Each increment adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Selection state is ephemeral (not persisted)
- Map marker references are stored for efficient lookup
- Table row references are accessed via DOM queries (no separate storage needed)
- Keyboard navigation follows standard patterns (arrow keys, Enter, Tab)
- Screen reader support via ARIA attributes and live regions

