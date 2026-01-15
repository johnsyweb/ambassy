# Research: Map Event Allocation

**Date**: 2026-01-15  
**Feature**: Map Event Allocation  
**Status**: Complete

## Research Tasks

### Task 1: Identify Unallocated Events

**Question**: How are unallocated events currently identified in the system?

**Decision**: Unallocated events are identified by their presence in `eventDetails` (from parkrun API) but absence from `eventTeamsTableData`. The `extractEventTeamsTableData` function only includes events that have both an EA assignment and are in the REA→EA→Event hierarchy. Events without EA assignments are not included in `eventTeamsTableData`.

**Rationale**: This is the existing pattern used in `populateMap.ts` where events without data in `eventTeamsTableData` are rendered with smaller markers (radius: 1) and default color, while allocated events have larger markers (radius: 5) with EA-specific colors.

**Alternatives Considered**: 
- Creating a separate "unallocated events" collection: Rejected - would duplicate data and require synchronization
- Adding a flag to EventDetails: Rejected - EventDetails comes from external API, shouldn't be modified

### Task 2: Allocation Dialog Pattern

**Question**: What dialog pattern should be used for allocating unallocated events?

**Decision**: Reuse the existing `showReallocationDialog` pattern, adapted for initial allocation (no "current ambassador" to display).

**Rationale**: The existing `showReallocationDialog` provides:
- Keyboard-accessible modal dialog
- Suggestion-based selection (top 3-5 suggestions)
- Manual selection dropdown for "Other" option
- Consistent UI/UX with existing reallocation flows
- Proper ARIA attributes and accessibility

**Alternatives Considered**:
- Creating a new dialog component: Rejected - would duplicate functionality and create inconsistency
- Using native browser prompts: Rejected - not accessible, doesn't support suggestions, poor UX

### Task 3: Event Directors Display

**Question**: How should Event Directors be displayed for unallocated events?

**Decision**: Event Directors are stored in `EventTeam` model and may be available even for unallocated events if EventTeam data exists. When displaying unallocated events in the Event Teams table after allocation, use `eventTeam?.eventDirectors.join(", ") ?? "N/A"` pattern (same as existing allocated events).

**Rationale**: This maintains consistency with existing Event Teams table display. Event Directors are independent of EA allocation - they're event metadata that may exist before allocation.

**Alternatives Considered**: 
- Creating separate display logic: Rejected - would duplicate code and create inconsistency
- Hiding Event Directors for unallocated events: Rejected - violates FR-006 and FR-008

### Task 4: Map Update After Allocation

**Question**: How should the map be updated after allocating an event?

**Decision**: After allocation, call `populateMap` again with updated `eventTeamsTableData` to refresh all markers. The newly allocated event will now appear in `eventTeamsTableData`, so it will be rendered with the EA's color and larger size.

**Rationale**: 
- `populateMap` already handles the distinction between allocated and unallocated events
- Ensures Voronoi polygons are recalculated if applicable
- Maintains consistency with existing map rendering logic
- Simple and reliable - no special-case logic needed

**Alternatives Considered**:
- Manually updating only the affected marker: Rejected - would require duplicating marker creation logic and might miss Voronoi polygon updates
- Debouncing map updates: Rejected - per SC-003, updates must be within 1 second, debouncing could delay feedback

### Task 5: REA Assignment

**Question**: How is the supporting Regional Ambassador determined when allocating an event?

**Decision**: Use existing `getRegionalAmbassadorForEventAmbassador` utility function to find which REA supports the selected EA. This is already used in `reallocateEventTeam` and maintains consistency.

**Rationale**: The REA is determined by the EA's `regionalAmbassador` field (set during onboarding or reallocation). The `getRegionalAmbassadorForEventAmbassador` function provides a fallback lookup from REA's `supportsEAs` list if the field is missing.

**Alternatives Considered**:
- Manual REA selection: Rejected - violates FR-004 (automatic determination required)
- Creating new lookup logic: Rejected - would duplicate existing functionality

### Task 6: Table Update After Allocation

**Question**: How should the Event Teams table be updated after allocation?

**Decision**: After allocation, regenerate `eventTeamsTableData` using `extractEventTeamsTableData`, then call `populateEventTeamsTable` to refresh the table display. The newly allocated event will now be included in the table data.

**Rationale**: 
- `extractEventTeamsTableData` already includes all allocated events
- Ensures table shows complete information (EA, REA, Event Directors, coordinates, etc.)
- Maintains consistency with existing table population logic
- Simple and reliable - no special-case logic needed

**Alternatives Considered**:
- Manually inserting a table row: Rejected - would duplicate table row creation logic and might miss sorting/formatting
- Partial table refresh: Rejected - could cause inconsistencies if sorting is active

## Integration Points

### Existing Functions to Extend

1. **`selectMapEvent`** (`src/actions/tableMapNavigation.ts`):
   - Currently only handles events in `eventTeamsTableData`
   - Needs to detect unallocated events and show allocation dialog

2. **`populateMap`** (`src/actions/populateMap.ts`):
   - Already distinguishes allocated vs unallocated events
   - No changes needed - will automatically show newly allocated events correctly after refresh

3. **`extractEventTeamsTableData`** (`src/models/EventTeamsTable.ts`):
   - Already includes all allocated events
   - No changes needed - newly allocated events will automatically appear

4. **`populateEventTeamsTable`** (`src/actions/populateEventTeamsTable.ts`):
   - Already displays all events from `eventTeamsTableData`
   - No changes needed - will automatically show newly allocated events

### New Functions Required

1. **`allocateEventFromMap`** (`src/actions/allocateEventFromMap.ts`):
   - Handle unallocated event click
   - Show allocation dialog (adapted from `showReallocationDialog`)
   - Call `assignEventToAmbassador` with empty string for old EA
   - Determine REA using `getRegionalAmbassadorForEventAmbassador`
   - Update `eventTeamsTableData` and refresh UI

2. **`showEventAllocationDialog`** (or extend `showReallocationDialog`):
   - Similar to `showReallocationDialog` but for initial allocation
   - No "current ambassador" to display
   - Generate suggestions for EA selection
   - Handle allocation completion

## Dependencies

- **Existing**: `assignEventToAmbassador`, `getRegionalAmbassadorForEventAmbassador`, `showReallocationDialog` (pattern), `extractEventTeamsTableData`, `populateMap`, `populateEventTeamsTable`
- **No new external dependencies required**

## Performance Considerations

- Map refresh after allocation: Should be fast (< 1 second per SC-003) since we're just re-rendering existing data
- Table refresh: Should be fast since we're regenerating from in-memory data structures
- Dialog rendering: Should be instant (DOM manipulation only)

## Accessibility Considerations

- Allocation dialog must be keyboard accessible (Tab, Enter, Escape)
- Map marker clicks must be accessible (already handled by Leaflet)
- All user-facing text must be in Australian English
- ARIA attributes must be maintained (reuse existing dialog patterns)
