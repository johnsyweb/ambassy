# Feature Specification: Event Issues Resolution

**Feature ID**: `006-event-issues-resolution`  
**Date**: 2026-01-08  
**Status**: Planning

## Summary

Replace console error messages for missing event details with an Issues tab that displays a table of events without coordinates. Users can resolve issues by finding events from parkrun's events.json (handling name variations, typos, parentheses, restricted events) or by placing pins on the map.

## User Stories

### US1: View Event Issues
**As a** Regional Event Ambassador  
**I want to** see a table of events that are missing coordinates/details  
**So that** I can identify which events need to be resolved

**Acceptance Criteria:**
- Issues tab displays a table of events without coordinates
- Table shows event name, assigned Event Ambassador, and issue description
- Issues are detected when event details are not found in events.json
- Console errors are replaced with this UI

### US2: Resolve Issue by Finding Event
**As a** Regional Event Ambassador  
**I want to** search parkrun's events.json to find the correct event  
**So that** I can resolve issues for events with name variations, typos, or information in parentheses

**Acceptance Criteria:**
- User can search events.json for matching events
- Search handles name variations (multiple "name" fields, typos, parentheses)
- User can select a matching event to resolve the issue
- Resolved events are added to eventDetailsMap with correct coordinates

### US3: Resolve Issue by Placing Pin
**As a** Regional Event Ambassador  
**I want to** place a pin on the map to manually set coordinates  
**So that** I can resolve issues for events that aren't in events.json (restricted, discontinued, etc.)

**Acceptance Criteria:**
- User can click on map to place a pin
- Pin placement sets coordinates for the event
- Event is marked as resolved
- Manual coordinates are stored in eventDetailsMap

## Functional Requirements

### FR-001: Issues Detection
- System must detect events without coordinates/details during `extractEventTeamsTableData`
- Issues must be collected into an Issues list
- Console.error calls must be removed

### FR-002: Issues Tab
- New "Issues" tab must be added to the tab navigation
- Issues table must display:
  - Event name
  - Assigned Event Ambassador
  - Assigned Regional Ambassador
  - Issue type/description
  - Resolution status
- Table must be sortable and filterable

### FR-003: Event Search Resolution
- User can search parkrun's events.json for matching events
- Search must handle:
  - Multiple name fields (EventShortName, EventLongName, LocalisedEventLongName, eventname)
  - Typos and variations
  - Information in parentheses (e.g., "Event Name (not currently operating)")
  - Restricted events
- User can select a matching event to resolve the issue

### FR-004: Map Pin Resolution
- User can click on map to place a pin for an event
- Pin placement must set coordinates for the selected event
- Coordinates must be stored in eventDetailsMap
- Event must be marked as resolved

### FR-005: Issue Resolution Tracking
- Resolved issues must be removed from the Issues table
- Resolution method must be logged in the changes log (found in events.json vs. manual pin placement)
- Resolution log entries must include:
  - Event name
  - Resolution method (found_in_events_json or manual_pin)
  - Timestamp
  - Source event name (if found via search) or coordinates (if manual pin)
- Resolved events must appear in Event Teams table and map
- Resolution state must persist across application reloads via localStorage

## Technical Requirements

### TR-001: Issues Data Model
- Issues must be stored in a structured format
- Each issue must track:
  - Event name
  - Assigned ambassadors
  - Resolution status
  - Resolution method (if resolved)

### TR-002: Event Search
- Search must query events.json data
- Search algorithm must handle fuzzy matching for typos
- Search must check all name fields in EventDetails

### TR-003: Map Pin Placement
- Map must support click-to-place-pin functionality
- Pin coordinates must be captured and stored
- Pin must be associated with the selected issue

### TR-004: Data Persistence
- Resolved events must be persisted to localStorage via eventDetailsMap
- Manual coordinates must be stored alongside fetched events in eventDetailsMap
- Resolution log entries must be persisted to localStorage via changes log
- Resolution state must persist across application reloads
- On reload, resolved events are loaded from localStorage and issues are recalculated (resolved events no longer appear as issues)

## Non-Functional Requirements

### NFR-001: Performance
- Issues detection must not significantly slow down table generation
- Event search must be responsive (<500ms for typical searches)

### NFR-002: User Experience
- Issues table must be easy to scan and understand
- Resolution workflow must be intuitive
- Clear feedback when issues are resolved

## Edge Cases

### EC-001: Multiple Matches
- If search returns multiple matches, user must be able to select the correct one
- UI must display all matches with distinguishing information

### EC-002: No Matches Found
- If search finds no matches, user must be able to place pin manually
- Clear indication that manual placement is required

### EC-003: Restricted Events
- Restricted events may not appear in events.json
- System must allow manual pin placement for restricted events

### EC-004: Event Name Changes
- Events may have changed names
- Search must help identify renamed events

## Success Criteria

- Console errors for missing events are eliminated
- Users can easily identify and resolve event coordinate issues
- All events have coordinates and appear on the map
- Resolution workflow is intuitive and efficient
