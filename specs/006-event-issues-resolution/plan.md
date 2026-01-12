# Implementation Plan: Event Issues Resolution

**Branch**: `006-event-issues-resolution` | **Date**: 2026-01-08 | **Spec**: `specs/006-event-issues-resolution/spec.md`
**Input**: Feature specification from `/specs/006-event-issues-resolution/spec.md`

## Summary

Replace console error messages for missing event details with an Issues tab that displays a table of events without coordinates. Users can resolve issues by finding events from parkrun's events.json (handling name variations, typos, parentheses, restricted events) or by entering street addresses for closed/restricted events that get automatically geocoded to coordinates.

## Technical Context

**Language/Version**: TypeScript (strict mode)  
**Primary Dependencies**: Leaflet (map), axios (events.json fetching), browser Geolocation API or external geocoding service, existing Ambassy modules
**Storage**: localStorage (for resolved events and geocoded coordinates)
**Testing**: Jest
**Target Platform**: Modern web browsers (ES6+)
**Project Type**: Single-page web application
**Performance Goals**: Issues detection <100ms, event search <500ms, address geocoding <1000ms
**Constraints**: Must handle large events.json files efficiently, must not block UI during issue detection, geocoding may require network requests
**Scale/Scope**: Handle hundreds of events, support fuzzy search across thousands of events in events.json, handle geocoding API rate limits

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Quality Gates
- ✅ Code will be formatted with Prettier
- ✅ Code will pass ESLint linting
- ✅ Code will pass TypeScript type checking
- ✅ Tests will be written (TDD approach)
- ✅ Disused code (console.error calls) will be removed

### II. Test-Driven Development
- ✅ Tests will be written for all new functions
- ✅ Tests will test production code directly
- ✅ Functions will have low cyclomatic complexity
- ✅ Tests will not pollute console

### III. Atomic Commits with Semantic Messages
- ✅ Each change will be committed atomically with semantic messages

### IV. Single Responsibility & Clean Architecture
- ✅ Issues detection will be separate from resolution
- ✅ Event search will be a dedicated function
- ✅ Map pin placement will be a dedicated function
- ✅ No comments - code will be self-documenting

### V. Accessibility & User Experience
- ✅ All interactions will be keyboard accessible
- ✅ UI will be clean and professional
- ✅ Australian English for all text

### VI. Open Source Preference
- ✅ Using existing Leaflet library for map functionality
- ✅ Using existing axios for HTTP requests

### VII. Documentation Currency
- ✅ README will be updated if needed

### VIII. Production/Test Parity
- ✅ Code will behave identically in production and test

**Status**: ✅ All gates pass

## Project Structure

### Documentation (this feature)

```text
specs/006-event-issues-resolution/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── models/
│   └── EventIssue.ts          # New: Issue data model
├── actions/
│   ├── detectIssues.ts        # New: Detect events without coordinates
│   ├── populateIssuesTable.ts # New: Populate Issues tab table
│   ├── searchEvents.ts        # New: Search events.json for matches
│   ├── resolveIssue.ts        # New: Resolve issue (found or geocoded)
│   └── placeMapPin.ts         # New: Handle map pin placement
├── utils/
│   └── fuzzyMatch.ts          # New: Fuzzy matching for event names
└── index.ts                   # Modified: Add Issues tab, wire up handlers
```

## Phase 0: Outline & Research

### Research Tasks

1. **Event Name Matching Strategies**
   - Research fuzzy matching algorithms for event names
   - Research handling of name variations (parentheses, typos, multiple name fields)
   - Decision: Which fuzzy matching approach to use (Levenshtein, Jaro-Winkler, simple string matching)

2. **Map Pin Placement UX**
   - Research best practices for click-to-place-pin functionality
   - Research Leaflet marker placement patterns
   - Decision: How to handle pin placement workflow (select issue → click map vs. click map → select issue)

3. **Issues Data Structure**
   - Research efficient data structures for issue tracking
   - Research resolution state management
   - Decision: How to store and track issue resolution state

4. **Events.json Search Performance**
   - Research efficient search strategies for large JSON datasets
   - Research client-side search libraries vs. custom implementation
   - Decision: Search implementation approach (custom vs. library)

5. **Tab Navigation Integration**
   - Research existing tab system implementation
   - Research adding new tab to existing tab navigation
   - Decision: How to integrate Issues tab with existing tab system

## Phase 1: Design & Contracts

### Data Model

**EventIssue**:
- `eventShortName: string` - Event name from Event Teams data
- `eventAmbassador: string` - Assigned Event Ambassador
- `regionalAmbassador: string` - Assigned Regional Ambassador
- `issueType: "missing_coordinates" | "missing_details"` - Type of issue
- `status: "unresolved" | "resolved"` - Resolution status
- `resolutionMethod?: "found_in_events_json" | "manual_pin"` - How issue was resolved
- `resolvedAt?: number` - Timestamp of resolution

**IssuesState**:
- `issues: EventIssue[]` - List of all issues
- `selectedIssue: string | null` - Currently selected issue for resolution

### API Contracts

**detectIssues()**: `(eventTeams: EventTeamMap, eventDetails: EventDetailsMap, eventAmbassadors: EventAmbassadorMap, regionalAmbassadors: RegionalAmbassadorMap) => EventIssue[]`

**searchEvents()**: `(query: string, events: EventDetailsMap) => EventDetails[]`

**resolveIssueWithEvent()**: `(issue: EventIssue, eventDetails: EventDetails, eventDetailsMap: EventDetailsMap) => void`

**resolveIssueWithPin()**: `(issue: EventIssue, coordinates: [number, number], eventDetailsMap: EventDetailsMap) => void`

**placeMapPin()**: `(map: L.Map, onPinPlaced: (coordinates: [number, number]) => void) => void`

## Phase 2: Implementation Strategy

### Step 1: Issues Detection
- Modify `extractEventTeamsTableData` to collect issues instead of logging errors
- Create `detectIssues` function to identify events without coordinates
- Remove `console.error` calls

### Step 2: Issues Tab UI
- Add "Issues" tab to tab navigation
- Create `populateIssuesTable` function
- Display issues in table format

### Step 3: Event Search
- Create `searchEvents` function with fuzzy matching
- Create search UI in Issues tab
- Handle multiple name fields and variations

### Step 4: Map Pin Placement
- Add click handler to map for pin placement
- Create pin placement UI workflow
- Store manual coordinates

### Step 5: Issue Resolution
- Create `resolveIssue` functions
- Update eventDetailsMap with resolved coordinates
- Remove resolved issues from table
- Refresh map and Event Teams table

## Constraints & Tradeoffs

**Constraints**:
- Must work with existing Leaflet map implementation
- Must integrate with existing tab system
- Must handle large events.json files efficiently
- Must preserve existing functionality

**Tradeoffs**:
- Fuzzy matching accuracy vs. performance (chose balanced approach)
- Manual pin placement vs. search-only (support both for flexibility)
- Real-time issue detection vs. on-demand (chose on-demand for performance)

## Success Criteria

- Console errors eliminated
- Issues tab displays all events without coordinates
- Users can resolve issues via search or pin placement
- Resolved events appear on map and in Event Teams table
- All existing functionality preserved
