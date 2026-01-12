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

- [X] T001 Verify project structure matches implementation plan in specs/006-event-issues-resolution/plan.md
- [X] T002 [P] Verify existing tab system (`src/utils/tabs.ts`) supports adding new tabs
- [X] T003 [P] Verify existing `extractEventTeamsTableData` function location and structure in `src/models/EventTeamsTable.ts`
- [X] T004 [P] Verify existing `getEvents()` function fetches events.json in `src/actions/fetchEvents.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Create `EventIssue` interface in `src/models/EventIssue.ts` with eventShortName, eventAmbassador, regionalAmbassador, issueType, status, resolutionMethod, resolvedAt fields
- [X] T006 [P] Create `IssuesState` interface in `src/models/IssuesState.ts` with issues and selectedIssue fields
- [X] T007 [P] Create `detectIssues` function in `src/actions/detectIssues.ts` that identifies events without coordinates
- [X] T008 [P] Create `normalizeEventName` utility function in `src/utils/fuzzyMatch.ts` for string normalization (lowercase, remove parentheses, trim)
- [X] T009 [P] Create `levenshteinDistance` function in `src/utils/fuzzyMatch.ts` for fuzzy matching
- [X] T010 [P] Create `geocodeAddress` utility function in `src/utils/geocoding.ts` for converting addresses to coordinates
- [X] T011 [P] Modify `extractEventTeamsTableData` in `src/models/EventTeamsTable.ts` to collect issues instead of calling `console.error`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Event Issues (Priority: P1) 🎯 MVP

**Goal**: Display a table of events that are missing coordinates/details. Replace console errors with Issues tab UI.

**Independent Test**: Load application with Event Teams data containing events without coordinates, verify Issues tab displays table with event names, assigned ambassadors, and issue descriptions. Verify no console errors appear. This delivers value by enabling users to identify which events need resolution.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T012 [P] [US1] Write unit test for `detectIssues` function identifying events without coordinates in `src/actions/detectIssues.test.ts`
- [X] T013 [P] [US1] Write unit test for `detectIssues` function creating EventIssue objects with correct fields in `src/actions/detectIssues.test.ts`
- [X] T014 [P] [US1] Write unit test for `detectIssues` function handling events with missing ambassadors gracefully in `src/actions/detectIssues.test.ts`
- [X] T015 [P] [US1] Write unit test for `populateIssuesTable` function creating table rows in `src/actions/populateIssuesTable.test.ts`
- [X] T016 [P] [US1] Write unit test for `populateIssuesTable` function displaying event name, ambassadors, issue type in `src/actions/populateIssuesTable.test.ts`
- [X] T017 [P] [US1] Write unit test for `populateIssuesTable` function showing empty state when no issues in `src/actions/populateIssuesTable.test.ts`
- [X] T018 [P] [US1] Write integration test for Issues tab displaying issues table in `src/actions/populateIssuesTable.test.ts`

### Implementation for User Story 1

- [X] T017 [US1] Implement `detectIssues` function in `src/actions/detectIssues.ts` to scan eventTeams and identify missing events
- [X] T018 [US1] Modify `extractEventTeamsTableData` in `src/models/EventTeamsTable.ts` to remove `console.error` calls
- [X] T019 [US1] Add "Issues" tab button to tab navigation in `public/index.html`
- [X] T020 [US1] Add Issues tab content panel HTML structure in `public/index.html` with table element
- [X] T021 [US1] Implement `populateIssuesTable` function in `src/actions/populateIssuesTable.ts` to create table rows
- [X] T022 [US1] Display event name, Event Ambassador, Regional Ambassador, issue type columns in Issues table in `src/actions/populateIssuesTable.ts`
- [X] T023 [US1] Add "Issues" tab to tab system in `src/utils/tabs.ts` (or extend `initializeTabs` in `src/index.ts`)
- [X] T024 [US1] Wire up Issues tab to call `populateIssuesTable` when tab becomes visible in `src/index.ts`
- [X] T025 [US1] Call `detectIssues` when Event Teams data is loaded and pass to `populateIssuesTable` in `src/index.ts`
- [X] T026 [US1] Add CSS styles for Issues table in `public/style.css` (consistent with other tables)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can see Issues tab with table of events without coordinates, and console errors are eliminated.

---

## Phase 4: User Story 2 - Resolve Issue by Finding Event (Priority: P2)

**Goal**: Enable users to search parkrun's events.json for matching events and resolve issues by selecting the correct match.

**Independent Test**: Select an issue from Issues table, click "Search Events", enter event name, verify search results display matching events with name variations handled, select a match, verify issue is resolved and event appears on map. This delivers value by enabling users to resolve issues for events with name variations, typos, or information in parentheses.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T027 [P] [US2] Write unit test for `normalizeEventName` function removing parentheses and normalizing case in `src/utils/fuzzyMatch.test.ts`
- [ ] T028 [P] [US2] Write unit test for `levenshteinDistance` function calculating correct distance in `src/utils/fuzzyMatch.test.ts`
- [ ] T029 [P] [US2] Write unit test for `searchEvents` function finding exact matches in `src/actions/searchEvents.test.ts`
- [ ] T030 [P] [US2] Write unit test for `searchEvents` function finding normalized matches (parentheses removed) in `src/actions/searchEvents.test.ts`
- [ ] T031 [P] [US2] Write unit test for `searchEvents` function finding fuzzy matches (typos) in `src/actions/searchEvents.test.ts`
- [ ] T032 [P] [US2] Write unit test for `searchEvents` function checking all name fields (EventShortName, EventLongName, etc.) in `src/actions/searchEvents.test.ts`
- [ ] T033 [P] [US2] Write unit test for `searchEvents` function returning results sorted by match quality in `src/actions/searchEvents.test.ts`
- [ ] T034 [P] [US2] Write unit test for `searchEvents` function limiting results to top 10 in `src/actions/searchEvents.test.ts`
- [ ] T035 [P] [US2] Write unit test for `resolveIssueWithEvent` function adding event to eventDetailsMap in `src/actions/resolveIssue.test.ts`
- [ ] T036 [P] [US2] Write unit test for `resolveIssueWithEvent` function marking issue as resolved in `src/actions/resolveIssue.test.ts`
- [ ] T037 [P] [US2] Write unit test for `resolveIssueWithEvent` function logging resolution in `src/actions/resolveIssue.test.ts`
- [ ] T038 [P] [US2] Write integration test for search dialog workflow in `src/actions/searchEvents.test.ts`

### Implementation for User Story 2

- [X] T039 [US2] Implement `normalizeEventName` function in `src/utils/fuzzyMatch.ts`
- [X] T040 [US2] Implement `levenshteinDistance` function in `src/utils/fuzzyMatch.ts`
- [X] T041 [US2] Implement `searchEvents` function in `src/actions/searchEvents.ts` with exact, normalized, and fuzzy matching
- [X] T042 [US2] Create search dialog HTML structure in `public/index.html` (or reuse existing dialog structure)
- [X] T043 [US2] Add "Search Events" button to Issues table row in `src/actions/populateIssuesTable.ts`
- [X] T044 [US2] Implement search dialog display function showing search input and results list in `src/actions/searchEvents.ts`
- [X] T045 [US2] Display search results with event name, location, and match type (exact/normalized/fuzzy) in `src/actions/searchEvents.ts`
- [X] T046 [US2] Implement result selection handler in `src/actions/searchEvents.ts` to call `resolveIssueWithEvent`
- [X] T047 [US2] Implement `resolveIssueWithEvent` function in `src/actions/resolveIssue.ts`
- [X] T048 [US2] Update eventDetailsMap with resolved event in `src/actions/resolveIssue.ts`
- [X] T049 [US2] Remove resolved issue from issues list and refresh Issues table in `src/actions/resolveIssue.ts`
- [X] T050 [US2] Refresh map and Event Teams table after resolution in `src/index.ts`
- [X] T051 [US2] Implement keyboard navigation in search dialog (Tab, Enter, Arrow keys) in `src/actions/searchEvents.ts`
- [X] T052 [US2] Add ARIA attributes for search dialog accessibility in `src/actions/searchEvents.ts`
- [X] T053 [US2] Handle "No matches found" case with clear message in `src/actions/searchEvents.ts`

**Checkpoint**: At this point, User Story 2 should be fully functional. Users can search events.json, find matches with fuzzy matching, and resolve issues by selecting the correct event.

---

## Phase 5: User Story 3 - Resolve Issue by Providing Address (Priority: P2)

**Goal**: Enable users to enter a street address that gets automatically geocoded to coordinates for closed/restricted events not in events.json.

**Independent Test**: Select an issue from Issues table, enter a street address (e.g., "Quentin Rd, Puckapunyal VIC 3662"), verify geocoding succeeds, verify issue is resolved, verify event appears on map with geocoded coordinates. This delivers value by enabling users to resolve issues for closed/restricted events using simple address entry.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T054 [P] [US3] Write unit test for `geocodeAddress` function calling geocoding service in `src/utils/geocoding.test.ts`
- [ ] T055 [P] [US3] Write unit test for `geocodeAddress` function returning lat/lng coordinates in `src/utils/geocoding.test.ts`
- [ ] T056 [P] [US3] Write unit test for `geocodeAddress` function handling service failures in `src/utils/geocoding.test.ts`
- [ ] T057 [P] [US3] Write unit test for `resolveIssueWithAddress` function calling geocoding service in `src/actions/resolveIssue.test.ts`
- [ ] T058 [P] [US3] Write unit test for `resolveIssueWithAddress` function creating EventDetails with geocoded coordinates in `src/actions/resolveIssue.test.ts`
- [ ] T059 [P] [US3] Write unit test for `resolveIssueWithAddress` function setting geocodedAddress flag in `src/actions/resolveIssue.test.ts`
- [ ] T060 [P] [US3] Write unit test for `resolveIssueWithAddress` function storing source address in `src/actions/resolveIssue.test.ts`
- [ ] T061 [P] [US3] Write unit test for `resolveIssueWithAddress` function handling geocoding failures in `src/actions/resolveIssue.test.ts`
- [ ] T062 [P] [US3] Write unit test for `showAddressDialog` function displaying input field in `src/actions/showAddressDialog.test.ts`
- [ ] T063 [P] [US3] Write unit test for `showAddressDialog` function handling address submission in `src/actions/showAddressDialog.test.ts`
- [ ] T064 [P] [US3] Write integration test for address geocoding workflow in `src/actions/showAddressDialog.test.ts`

### Implementation for User Story 3

- [X] T065 [US3] Implement `geocodeAddress` function in `src/utils/geocoding.ts` using browser Geolocation API + Nominatim fallback
- [X] T066 [US3] Add address validation in `src/utils/geocoding.ts` (non-empty, reasonable length)
- [X] T067 [US3] Implement `showAddressDialog` function in `src/actions/showAddressDialog.ts` with input field and buttons
- [X] T068 [US3] Add "Enter Address" button to Issues table row in `src/actions/populateIssuesTable.ts`
- [X] T069 [US3] Wire up "Enter Address" button to show address dialog in `src/actions/populateIssuesTable.ts`
- [X] T070 [US3] Implement `resolveIssueWithAddress` function in `src/actions/resolveIssue.ts`
- [X] T071 [US3] Create EventDetails object with geocoded coordinates and minimal properties in `src/actions/resolveIssue.ts`
- [X] T072 [US3] Set `geocodedAddress: true` flag and `sourceAddress` field on EventDetails in `src/actions/resolveIssue.ts`
- [X] T073 [US3] Add resolved event to eventDetailsMap in `src/actions/resolveIssue.ts`
- [X] T074 [US3] Remove resolved issue from issues list and refresh Issues table in `src/actions/resolveIssue.ts`
- [X] T075 [US3] Refresh map and Event Teams table after resolution in `src/index.ts`
- [X] T076 [US3] Add loading indicator during geocoding in `src/actions/showAddressDialog.ts`
- [X] T077 [US3] Handle geocoding errors with clear user messages in `src/actions/showAddressDialog.ts`
- [X] T078 [US3] Add keyboard navigation (Enter to submit, Escape to cancel) in `src/actions/showAddressDialog.ts`
- [X] T079 [US3] Add ARIA attributes for address dialog accessibility in `src/actions/showAddressDialog.ts`

**Checkpoint**: At this point, User Story 3 should be fully functional. Users can enter street addresses that get geocoded to coordinates and resolve issues for closed/restricted events not in events.json.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, error handling, accessibility, and integration

- [ ] T080 [P] Add error handling for geocoding failures in `src/actions/resolveIssue.ts`
- [ ] T081 [P] Add error handling for search failures in `src/actions/searchEvents.ts`
- [ ] T082 [P] Add loading states for search operations in `src/actions/searchEvents.ts`
- [ ] T083 [P] Ensure Issues table is keyboard navigable (Tab, Enter, Arrow keys) in `src/actions/populateIssuesTable.ts`
- [ ] T084 [P] Add screen reader announcements for issue resolution in `src/actions/resolveIssue.ts`
- [ ] T085 [P] Persist resolved events (geocoded coordinates) to localStorage in `src/actions/resolveIssue.ts`
- [ ] T086 [P] Load persisted geocoded events on application startup in `src/index.ts`
- [ ] T087 [P] Ensure Issues table updates when issues are resolved in `src/actions/populateIssuesTable.ts`
- [ ] T088 [P] Add confirmation dialog before resolving issue (optional, for safety) in `src/actions/resolveIssue.ts`
- [ ] T089 [P] Add "Resolved" status column to Issues table (for tracking resolved issues) in `src/actions/populateIssuesTable.ts`
- [ ] T090 [P] Filter resolved issues from active Issues table (show only unresolved) in `src/actions/populateIssuesTable.ts`
- [ ] T091 [P] Update README.md with Issues tab feature documentation
- [ ] T092 [P] Run all tests and ensure they pass
- [ ] T093 [P] Run linting and fix any issues
- [ ] T094 [P] Run TypeScript type checking and fix any errors
- [ ] T095 [P] Format code with Prettier

**Checkpoint**: All polish tasks complete. Feature is production-ready with proper error handling, accessibility, and integration.

---

## Summary

**Total Tasks**: 95
**Phase 1 (Setup)**: 4 tasks
**Phase 2 (Foundational)**: 7 tasks
**Phase 3 (US1 - View Issues)**: 15 tasks (7 tests + 8 implementation)
**Phase 4 (US2 - Search Resolution)**: 27 tasks (12 tests + 15 implementation)
**Phase 5 (US3 - Address Geocoding)**: 26 tasks (11 tests + 15 implementation)
**Phase 6 (Polish)**: 16 tasks

**Estimated Complexity**: Medium-High (fuzzy matching, geocoding API integration, tab integration)

**Dependencies**:
- Phase 2 must complete before any user story work
- US2 and US3 can be implemented in parallel after US1
- Phase 6 depends on all user stories being complete
