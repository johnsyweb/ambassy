# Tasks: Event Issues Resolution

**Input**: Design documents from `/specs/006-event-issues-resolution/`
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

**Purpose**: Project initialization and verification

- [ ] T001 Verify project structure matches implementation plan in specs/006-event-issues-resolution/plan.md
- [ ] T002 [P] Verify existing tab system (`src/utils/tabs.ts`) supports adding new tabs
- [ ] T003 [P] Verify existing `extractEventTeamsTableData` function location and structure in `src/models/EventTeamsTable.ts`
- [ ] T004 [P] Verify existing `getEvents()` function fetches events.json in `src/actions/fetchEvents.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Create `EventIssue` interface in `src/models/EventIssue.ts` with eventShortName, eventAmbassador, regionalAmbassador, issueType, status, resolutionMethod, resolvedAt fields
- [ ] T006 [P] Create `IssuesState` interface in `src/models/IssuesState.ts` with issues and selectedIssue fields
- [ ] T007 [P] Create `detectIssues` function in `src/actions/detectIssues.ts` that identifies events without coordinates
- [ ] T008 [P] Create `normalizeEventName` utility function in `src/utils/fuzzyMatch.ts` for string normalization (lowercase, remove parentheses, trim)
- [ ] T009 [P] Create `levenshteinDistance` function in `src/utils/fuzzyMatch.ts` for fuzzy matching
- [ ] T010 [P] Modify `extractEventTeamsTableData` in `src/models/EventTeamsTable.ts` to collect issues instead of calling `console.error`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Event Issues (Priority: P1) 🎯 MVP

**Goal**: Display a table of events that are missing coordinates/details. Replace console errors with Issues tab UI.

**Independent Test**: Load application with Event Teams data containing events without coordinates, verify Issues tab displays table with event names, assigned ambassadors, and issue descriptions. Verify no console errors appear. This delivers value by enabling users to identify which events need resolution.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Write unit test for `detectIssues` function identifying events without coordinates in `src/actions/detectIssues.test.ts`
- [ ] T012 [P] [US1] Write unit test for `detectIssues` function creating EventIssue objects with correct fields in `src/actions/detectIssues.test.ts`
- [ ] T013 [P] [US1] Write unit test for `detectIssues` function handling events with missing ambassadors gracefully in `src/actions/detectIssues.test.ts`
- [ ] T014 [P] [US1] Write unit test for `populateIssuesTable` function creating table rows in `src/actions/populateIssuesTable.test.ts`
- [ ] T015 [P] [US1] Write unit test for `populateIssuesTable` function displaying event name, ambassadors, issue type in `src/actions/populateIssuesTable.test.ts`
- [ ] T016 [P] [US1] Write unit test for `populateIssuesTable` function showing empty state when no issues in `src/actions/populateIssuesTable.test.ts`
- [ ] T017 [P] [US1] Write integration test for Issues tab displaying issues table in `src/actions/populateIssuesTable.test.ts`

### Implementation for User Story 1

- [ ] T018 [US1] Implement `detectIssues` function in `src/actions/detectIssues.ts` to scan eventTeams and identify missing events
- [ ] T019 [US1] Modify `extractEventTeamsTableData` in `src/models/EventTeamsTable.ts` to remove `console.error` calls
- [ ] T020 [US1] Add "Issues" tab button to tab navigation in `public/index.html`
- [ ] T021 [US1] Add Issues tab content panel HTML structure in `public/index.html` with table element
- [ ] T022 [US1] Implement `populateIssuesTable` function in `src/actions/populateIssuesTable.ts` to create table rows
- [ ] T023 [US1] Display event name, Event Ambassador, Regional Ambassador, issue type columns in Issues table in `src/actions/populateIssuesTable.ts`
- [ ] T024 [US1] Add "Issues" tab to tab system in `src/utils/tabs.ts` (or extend `initializeTabs` in `src/index.ts`)
- [ ] T025 [US1] Wire up Issues tab to call `populateIssuesTable` when tab becomes visible in `src/index.ts`
- [ ] T026 [US1] Call `detectIssues` when Event Teams data is loaded and pass to `populateIssuesTable` in `src/index.ts`
- [ ] T027 [US1] Add CSS styles for Issues table in `public/style.css` (consistent with other tables)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can see Issues tab with table of events without coordinates, and console errors are eliminated.

---

## Phase 4: User Story 2 - Resolve Issue by Finding Event (Priority: P2)

**Goal**: Enable users to search parkrun's events.json for matching events and resolve issues by selecting the correct match.

**Independent Test**: Select an issue from Issues table, click "Search Events", enter event name, verify search results display matching events with name variations handled, select a match, verify issue is resolved and event appears on map. This delivers value by enabling users to resolve issues for events with name variations, typos, or information in parentheses.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T028 [P] [US2] Write unit test for `normalizeEventName` function removing parentheses and normalizing case in `src/utils/fuzzyMatch.test.ts`
- [ ] T029 [P] [US2] Write unit test for `levenshteinDistance` function calculating correct distance in `src/utils/fuzzyMatch.test.ts`
- [ ] T030 [P] [US2] Write unit test for `searchEvents` function finding exact matches in `src/actions/searchEvents.test.ts`
- [ ] T031 [P] [US2] Write unit test for `searchEvents` function finding normalized matches (parentheses removed) in `src/actions/searchEvents.test.ts`
- [ ] T032 [P] [US2] Write unit test for `searchEvents` function finding fuzzy matches (typos) in `src/actions/searchEvents.test.ts`
- [ ] T033 [P] [US2] Write unit test for `searchEvents` function checking all name fields (EventShortName, EventLongName, etc.) in `src/actions/searchEvents.test.ts`
- [ ] T034 [P] [US2] Write unit test for `searchEvents` function returning results sorted by match quality in `src/actions/searchEvents.test.ts`
- [ ] T035 [P] [US2] Write unit test for `searchEvents` function limiting results to top 10 in `src/actions/searchEvents.test.ts`
- [ ] T036 [P] [US2] Write unit test for `resolveIssueWithEvent` function adding event to eventDetailsMap in `src/actions/resolveIssue.test.ts`
- [ ] T037 [P] [US2] Write unit test for `resolveIssueWithEvent` function marking issue as resolved in `src/actions/resolveIssue.test.ts`
- [ ] T038 [P] [US2] Write unit test for `resolveIssueWithEvent` function logging resolution in `src/actions/resolveIssue.test.ts`
- [ ] T039 [P] [US2] Write integration test for search dialog workflow in `src/actions/searchEvents.test.ts`

### Implementation for User Story 2

- [ ] T040 [US2] Implement `normalizeEventName` function in `src/utils/fuzzyMatch.ts`
- [ ] T041 [US2] Implement `levenshteinDistance` function in `src/utils/fuzzyMatch.ts`
- [ ] T042 [US2] Implement `searchEvents` function in `src/actions/searchEvents.ts` with exact, normalized, and fuzzy matching
- [ ] T043 [US2] Create search dialog HTML structure in `public/index.html` (or reuse existing dialog structure)
- [ ] T044 [US2] Add "Search Events" button to Issues table row in `src/actions/populateIssuesTable.ts`
- [ ] T045 [US2] Implement search dialog display function showing search input and results list in `src/actions/searchEvents.ts`
- [ ] T046 [US2] Display search results with event name, location, and match type (exact/normalized/fuzzy) in `src/actions/searchEvents.ts`
- [ ] T047 [US2] Implement result selection handler in `src/actions/searchEvents.ts` to call `resolveIssueWithEvent`
- [ ] T048 [US2] Implement `resolveIssueWithEvent` function in `src/actions/resolveIssue.ts`
- [ ] T049 [US2] Update eventDetailsMap with resolved event in `src/actions/resolveIssue.ts`
- [ ] T050 [US2] Remove resolved issue from issues list and refresh Issues table in `src/actions/resolveIssue.ts`
- [ ] T051 [US2] Refresh map and Event Teams table after resolution in `src/index.ts`
- [ ] T052 [US2] Implement keyboard navigation in search dialog (Tab, Enter, Arrow keys) in `src/actions/searchEvents.ts`
- [ ] T053 [US2] Add ARIA attributes for search dialog accessibility in `src/actions/searchEvents.ts`
- [ ] T054 [US2] Handle "No matches found" case with clear message in `src/actions/searchEvents.ts`

**Checkpoint**: At this point, User Story 2 should be fully functional. Users can search events.json, find matches with fuzzy matching, and resolve issues by selecting the correct event.

---

## Phase 5: User Story 3 - Resolve Issue by Placing Pin (Priority: P2)

**Goal**: Enable users to place a pin on the map to manually set coordinates for events not in events.json.

**Independent Test**: Select an issue from Issues table, click "Place Pin", click on map location, verify pin is placed, verify issue is resolved, verify event appears on map with manual coordinates. This delivers value by enabling users to resolve issues for restricted, discontinued, or other events not in events.json.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T055 [P] [US3] Write unit test for `placeMapPin` function adding click handler to map in `src/actions/placeMapPin.test.ts`
- [ ] T056 [P] [US3] Write unit test for `placeMapPin` function calling callback with coordinates in `src/actions/placeMapPin.test.ts`
- [ ] T057 [P] [US3] Write unit test for `placeMapPin` function returning cleanup function in `src/actions/placeMapPin.test.ts`
- [ ] T058 [P] [US3] Write unit test for `resolveIssueWithPin` function creating EventDetails with manual coordinates in `src/actions/resolveIssue.test.ts`
- [ ] T059 [P] [US3] Write unit test for `resolveIssueWithPin` function setting manualCoordinates flag in `src/actions/resolveIssue.test.ts`
- [ ] T060 [P] [US3] Write unit test for `resolveIssueWithPin` function validating coordinates range in `src/actions/resolveIssue.test.ts`
- [ ] T061 [P] [US3] Write unit test for `resolveIssueWithPin` function marking issue as resolved in `src/actions/resolveIssue.test.ts`
- [ ] T062 [P] [US3] Write integration test for pin placement workflow in `src/actions/placeMapPin.test.ts`

### Implementation for User Story 3

- [ ] T063 [US3] Implement `placeMapPin` function in `src/actions/placeMapPin.ts` to enable map click handler
- [ ] T064 [US3] Add "Place Pin" button to Issues table row in `src/actions/populateIssuesTable.ts`
- [ ] T065 [US3] Wire up "Place Pin" button to enable pin placement mode in `src/actions/populateIssuesTable.ts`
- [ ] T066 [US3] Change map cursor to indicate pin placement mode in `src/actions/placeMapPin.ts`
- [ ] T067 [US3] Capture map click coordinates (lat/lng) in `src/actions/placeMapPin.ts`
- [ ] T068 [US3] Convert Leaflet lat/lng to GeoJSON [longitude, latitude] format in `src/actions/placeMapPin.ts`
- [ ] T069 [US3] Implement `resolveIssueWithPin` function in `src/actions/resolveIssue.ts`
- [ ] T070 [US3] Create EventDetails object with manual coordinates and minimal properties in `src/actions/resolveIssue.ts`
- [ ] T071 [US3] Set `manualCoordinates: true` flag on EventDetails in `src/actions/resolveIssue.ts`
- [ ] T072 [US3] Add resolved event to eventDetailsMap in `src/actions/resolveIssue.ts`
- [ ] T073 [US3] Remove resolved issue from issues list and refresh Issues table in `src/actions/resolveIssue.ts`
- [ ] T074 [US3] Refresh map and Event Teams table after resolution in `src/index.ts`
- [ ] T075 [US3] Disable pin placement mode after pin is placed in `src/actions/placeMapPin.ts`
- [ ] T076 [US3] Restore normal map cursor after pin placement in `src/actions/placeMapPin.ts`
- [ ] T077 [US3] Add visual feedback (pin marker) when pin is placed in `src/actions/placeMapPin.ts`
- [ ] T078 [US3] Handle pin placement cancellation (ESC key or cancel button) in `src/actions/placeMapPin.ts`

**Checkpoint**: At this point, User Story 3 should be fully functional. Users can place pins on the map to manually set coordinates and resolve issues for events not in events.json.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, error handling, accessibility, and integration

- [ ] T079 [P] Add error handling for invalid coordinates in `src/actions/resolveIssue.ts`
- [ ] T080 [P] Add error handling for search failures in `src/actions/searchEvents.ts`
- [ ] T081 [P] Add loading states for search operations in `src/actions/searchEvents.ts`
- [ ] T082 [P] Ensure Issues table is keyboard navigable (Tab, Enter, Arrow keys) in `src/actions/populateIssuesTable.ts`
- [ ] T083 [P] Add screen reader announcements for issue resolution in `src/actions/resolveIssue.ts`
- [ ] T084 [P] Persist resolved events (manual coordinates) to localStorage in `src/actions/resolveIssue.ts`
- [ ] T085 [P] Load persisted manual events on application startup in `src/index.ts`
- [ ] T086 [P] Ensure Issues table updates when issues are resolved in `src/actions/populateIssuesTable.ts`
- [ ] T087 [P] Add confirmation dialog before resolving issue (optional, for safety) in `src/actions/resolveIssue.ts`
- [ ] T088 [P] Add "Resolved" status column to Issues table (for tracking resolved issues) in `src/actions/populateIssuesTable.ts`
- [ ] T089 [P] Filter resolved issues from active Issues table (show only unresolved) in `src/actions/populateIssuesTable.ts`
- [ ] T090 [P] Update README.md with Issues tab feature documentation
- [ ] T091 [P] Run all tests and ensure they pass
- [ ] T092 [P] Run linting and fix any issues
- [ ] T093 [P] Run TypeScript type checking and fix any errors
- [ ] T094 [P] Format code with Prettier

**Checkpoint**: All polish tasks complete. Feature is production-ready with proper error handling, accessibility, and integration.

---

## Summary

**Total Tasks**: 94
**Phase 1 (Setup)**: 4 tasks
**Phase 2 (Foundational)**: 6 tasks
**Phase 3 (US1 - View Issues)**: 17 tasks (7 tests + 10 implementation)
**Phase 4 (US2 - Search Resolution)**: 27 tasks (12 tests + 15 implementation)
**Phase 5 (US3 - Pin Resolution)**: 24 tasks (8 tests + 16 implementation)
**Phase 6 (Polish)**: 16 tasks

**Estimated Complexity**: Medium-High (fuzzy matching, map interaction, tab integration)

**Dependencies**: 
- Phase 2 must complete before any user story work
- US2 and US3 can be implemented in parallel after US1
- Phase 6 depends on all user stories being complete
