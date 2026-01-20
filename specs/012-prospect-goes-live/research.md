# Research: End of Prospect Lifecycle

**Feature**: End of Prospect Lifecycle (Launch/Archive)
**Date**: 2026-01-18
**Phase**: 0 - Outline & Research

## Research Questions

### 1. Prospect Removal Pattern

**Decision**: Follow existing prospect removal pattern from `populateProspectsTable.ts`

**Rationale**: 
- Existing "Remove" button already implements prospect removal workflow
- Pattern includes: confirm dialog → remove from list → update EA allocations → recalculate capacity → save → log → refresh UI
- Reusing this pattern ensures consistency and reduces risk
- Can extract shared logic into utility functions if needed

**Implementation Notes**:
- Current removal logic: `prospects.remove(prospect.id)`, update `ea.prospectiveEvents` array, `calculateAllCapacityStatuses()`, `saveProspectiveEvents()`, `persistEventAmbassadors()`, log entry
- Launch/Archive will follow same pattern but with different log entry types ("Prospect Launched" vs "Prospect Archived")
- Archive: Simple removal (no event allocation)
- Launch: Removal + optional event matching/allocation

**Alternatives Considered**:
- Create entirely new removal workflow: Rejected - unnecessary duplication, breaks consistency
- Different removal mechanism: Rejected - existing pattern works well, only difference is log entry type

### 2. Event Matching Strategy

**Decision**: Reuse existing `searchEvents` function with location-based filtering

**Rationale**:
- `searchEvents` already implements fuzzy matching, exact matching, normalized matching
- Checks all event name fields (EventShortName, EventLongName, LocalisedEventLongName, eventname)
- Can filter results by location similarity using prospect coordinates
- Follows existing patterns (used in event issues resolution)

**Implementation Notes**:
- Use `searchEvents(prospect.prospectEvent, eventDetails)` to find potential matches
- Filter results by location similarity (distance from prospect coordinates to event coordinates)
- Present all matches to REA for manual selection (as per spec clarification)
- Calculate distance using existing geography utilities (e.g., haversine distance)
- Sort by match quality (exact name match + close location = highest priority)

**Alternatives Considered**:
- Exact name matching only: Rejected - too restrictive, won't handle name variations
- New matching algorithm: Rejected - existing searchEvents covers needs, just needs location filtering
- External fuzzy matching library: Rejected - existing Levenshtein-based matching sufficient

### 3. Event Allocation During Launch

**Decision**: Reuse existing `assignEventToAmbassador` function

**Rationale**:
- `assignEventToAmbassador` already handles event allocation, EA updates, capacity recalculation
- Used in `allocateEventFromMap` - same pattern applies here
- Ensures consistency with other event allocation workflows
- Handles logging automatically

**Implementation Notes**:
- When REA selects matching event during launch, call `assignEventToAmbassador(eventName, "", selectedEA, ...)`
- Old EA is empty string (no previous allocation for new event)
- Suggest prospect's assigned EA as default if one exists
- Allow REA to select different EA or leave unallocated
- Follow existing allocation dialog patterns from `allocateEventFromMap`

**Alternatives Considered**:
- Create new allocation mechanism: Rejected - unnecessary duplication
- Manual EA assignment only: Rejected - spec requires EA suggestion/default

### 4. UI Pattern for Launch/Archive Buttons

**Decision**: Replace existing "Remove" button with side-by-side "Launch" and "Archive" buttons

**Rationale**:
- Clarified in spec: Replace "Remove" button with separate buttons
- Side-by-side layout maintains compact table design
- Clear distinction between two completion paths
- Follows existing button patterns in prospects table (Reallocate, Reset Location, Remove)

**Implementation Notes**:
- Replace `removeButton` in `createProspectRow` with `launchButton` and `archiveButton`
- Use appropriate icons/text: "🚀 Launch" and "📦 Archive" or similar
- Both buttons trigger confirmation dialogs before action
- Confirmation dialogs can be inline (confirm()) or custom dialogs (for better UX)
- Follow existing ARIA patterns for accessibility

**Alternatives Considered**:
- Dropdown menu: Rejected - spec clarified separate buttons
- Single button with dialog selection: Rejected - less clear, extra click
- Keep Remove + add Launch/Archive: Rejected - spec requires replacement

### 5. Log Entry Structure for Future Undo

**Decision**: Structure log entries to support potential future undo functionality

**Rationale**:
- Spec requires log entries support potential future undo (even though undo not implemented now)
- Log entries should contain all information needed to reverse the action
- Follows existing LogEntry structure but may need additional fields

**Implementation Notes**:
- Current LogEntry: `{ type, event, oldValue, newValue, timestamp }`
- Launch entry should include: prospect details (id, name, country, state), assigned EA (if any), matched event (if allocated), prospect coordinates
- Archive entry should include: prospect details, assigned EA (if any)
- May need to extend LogEntry interface in future, but can store extra data in `event` field (JSON string) for now
- Or create separate log entry types: "Prospect Launched", "Prospect Archived" with structured data

**Alternatives Considered**:
- Minimal log entries (current structure): Accepted for now - can extend later
- Extended LogEntry interface immediately: Deferred - not needed until undo implemented
- Separate log entry types: Preferred - clearer structure, but can be added later

### 6. Location-Based Event Filtering

**Decision**: Filter event matches by distance from prospect coordinates

**Rationale**:
- Spec requires matching by "name and location similarity"
- Location filtering reduces false matches (events with same name but different locations)
- Reuses existing geography utilities for distance calculation
- Can set reasonable distance threshold (e.g., 50km) to filter out distant matches

**Implementation Notes**:
- Use existing geography utilities (haversine distance or similar)
- Calculate distance from prospect.coordinates to each matched event's coordinates
- Filter matches by maximum distance threshold (e.g., 50km)
- Sort remaining matches by distance (closest first) then match quality
- If prospect has no coordinates, show all name matches (location filtering disabled)

**Alternatives Considered**:
- No location filtering: Rejected - spec requires location similarity
- Exact location match only: Rejected - too restrictive, events may move slightly
- Fuzzy location matching: Accepted - distance threshold allows for reasonable proximity

## Key Decisions Summary

1. **Follow existing removal pattern** - Reuse prospect removal workflow from populateProspectsTable
2. **Reuse searchEvents for matching** - Leverage existing fuzzy/exact matching, add location filtering
3. **Reuse assignEventToAmbassador** - Use existing event allocation workflow
4. **Side-by-side buttons** - Replace Remove with Launch and Archive buttons
5. **Structure logs for future undo** - Include all data needed for potential reversal
6. **Location-based filtering** - Filter matches by distance from prospect coordinates

## Integration Points

- **populateProspectsTable.ts**: Modify to replace Remove button with Launch/Archive buttons
- **searchEvents.ts**: Reuse for event name matching, add location filtering wrapper
- **assignEventToAmbassador.ts**: Reuse for event allocation during launch
- **reallocateProspect.ts**: Reference for EA allocation count updates pattern
- **LogEntry**: May need extension for structured launch/archive data (deferred)

## Dependencies

- Existing: EventDetailsMap, EventAmbassadorMap, ProspectiveEventList, searchEvents, assignEventToAmbassador
- Geography utilities: Distance calculation (haversine or similar)
- No new external dependencies required
