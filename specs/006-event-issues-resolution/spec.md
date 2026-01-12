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

### US3: Resolve Issue by Providing Address
**As a** Regional Event Ambassador
**I want to** enter a street address to automatically set coordinates
**So that** I can resolve issues for closed/restricted events that don't appear in events.json

**Acceptance Criteria:**
- User can enter a street address for the event location
- System geocodes the address to obtain coordinates
- Geocoded coordinates are set for the event
- Event is marked as resolved with geocoded coordinates stored in eventDetailsMap
- Clear error message if geocoding fails

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

### FR-004: Address Geocoding Resolution
- User can enter a street address for the event location
- System must geocode the address to obtain latitude/longitude coordinates
- Geocoded coordinates must be stored in eventDetailsMap
- Event must be marked as resolved with geocoding method logged
- System must handle geocoding failures gracefully with clear error messages

### FR-005: Issue Resolution Tracking
- Resolved issues must be removed from the Issues table
- Resolution method must be logged in the changes log (found in events.json vs. address geocoding)
- Resolution log entries must include:
  - Event name
  - Resolution method (found_in_events_json or geocoded_address)
  - Timestamp
  - Source event name (if found via search) or address (if geocoded)
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

### TR-003: Address Geocoding
- System must integrate with geocoding service (browser Geolocation API or external service)
- Address input must be validated and formatted for geocoding
- Geocoding results must be validated for accuracy and relevance
- Failed geocoding attempts must be logged and reported to user

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
- If search finds no matches, user must be able to enter address manually
- Clear indication that address entry is required

### EC-003: Restricted Events
- Restricted/closed events may not appear in events.json
- System must allow address-based geocoding for restricted events

### EC-004: Event Name Changes
- Events may have changed names
- Search must help identify renamed events

## Clarifications

### Session 2026-01-08

- Q: Should issue resolution be logged in the change log and persisted across reloads? → A: Yes, resolution must be logged in the changes log with event name, resolution method, timestamp, and source details. Resolution state persists via localStorage (eventDetailsMap and changes log).
- Q: How should closed/restricted events be resolved? → A: Replace pin placement entirely with address geocoding (loses manual precision).

## Success Criteria

- Console errors for missing events are eliminated
- Users can easily identify and resolve event coordinate issues
- All events have coordinates and appear on the map
- Resolution workflow is intuitive and efficient
- Issue resolutions are logged in the changes log and persist across application reloads