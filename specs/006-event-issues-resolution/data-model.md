# Data Model: Event Issues Resolution

**Feature**: Event Issues Resolution  
**Date**: 2026-01-08  
**Phase**: 1 - Design & Contracts

## Overview

This feature introduces new data models for tracking and resolving events without coordinates, and extends existing models to support manual coordinate storage.

## New Entities

### EventIssue

Represents an event that is missing coordinates or details from events.json.

**Fields**:
- `eventShortName: string` (required) - Event name from Event Teams data
- `eventAmbassador: string` (required) - Assigned Event Ambassador name
- `regionalAmbassador: string` (required) - Assigned Regional Ambassador name
- `issueType: "missing_coordinates" | "missing_details"` (required) - Type of issue
  - `missing_coordinates`: Event not found in events.json, needs coordinates
  - `missing_details`: Event found but missing required details
- `status: "unresolved" | "resolved"` (required) - Resolution status
- `resolutionMethod?: "found_in_events_json" | "geocoded_address"` (optional) - How issue was resolved
  - `found_in_events_json`: Event was found via search in events.json
  - `geocoded_address`: Coordinates were obtained via address geocoding
- `resolvedAt?: number` (optional) - Timestamp when issue was resolved (Unix timestamp)

**Relationships**:
- References `EventTeam` via `eventShortName`
- References `EventAmbassador` via `eventAmbassador`
- References `RegionalAmbassador` via `regionalAmbassador`

**Validation Rules**:
- `eventShortName` must be non-empty
- `eventAmbassador` must exist in EventAmbassadorMap
- `regionalAmbassador` must exist in RegionalAmbassadorMap
- `status` must be "unresolved" or "resolved"
- If `status === "resolved"`, `resolutionMethod` and `resolvedAt` must be present

**State Transitions**:
- `unresolved` → `resolved` (via `resolveIssueWithEvent` or `resolveIssueWithAddress`)
- Once resolved, issue is removed from active issues list

### IssuesState

Tracks the current state of issues detection and resolution.

**Fields**:
- `issues: EventIssue[]` (required) - List of all detected issues
- `selectedIssue: string | null` (required) - Currently selected issue eventShortName (null if none selected)

**Relationships**:
- Contains multiple `EventIssue` objects

**Validation Rules**:
- `issues` must be array (can be empty)
- `selectedIssue` must be null or match an eventShortName in `issues`

**State Transitions**:
- Issues list updated when `detectIssues()` is called
- Selected issue updated when user selects an issue from table
- Selected issue cleared when issue is resolved or user cancels

## Extended Entities

### EventDetails (Extended)

Extended to support geocoded coordinates for events not in events.json.

**New Fields**:
- `geocodedAddress?: boolean` (optional) - Flag indicating coordinates were obtained via geocoding
- `sourceAddress?: string` (optional) - Original address used for geocoding
- `source?: "events_json" | "geocoded"` (optional) - Source of event details

**Existing Fields**: (unchanged)
- `id`, `type`, `geometry`, `properties` - All existing fields preserved

**Validation Rules**:
- If `geocodedAddress === true`, `source` must be "geocoded" and `sourceAddress` must be present
- If `source === "geocoded"`, `geometry.coordinates` must be present
- Geocoded events may have minimal `properties` (only EventShortName required)

**Relationships**: (unchanged)
- Referenced by `EventTeam` via EventShortName
- Stored in `EventDetailsMap`

## Data Flow

### Issue Detection Flow

1. `extractEventTeamsTableData()` processes events
2. For each event, checks if `eventDetailsMap.has(eventName)`
3. If missing, creates `EventIssue` with `status: "unresolved"`
4. Issues collected into `EventIssue[]` array
5. Issues passed to `populateIssuesTable()` for display

### Issue Resolution Flow

**Option A: Found in events.json**
1. User searches for event name
2. `searchEvents()` returns matching events from events.json
3. User selects matching event
4. `resolveIssueWithEvent()` adds event to `eventDetailsMap`
5. Issue marked as resolved, removed from issues list
6. Map and Event Teams table refreshed

**Option B: Address Geocoding**
1. User selects issue from table
2. User enters street address (e.g., "Quentin Rd, Puckapunyal VIC 3662")
3. System geocodes address to obtain coordinates
4. `resolveIssueWithAddress()` creates EventDetails with geocoded coordinates
5. Event added to `eventDetailsMap` with `geocodedAddress: true`
6. Issue marked as resolved, removed from issues list
7. Map and Event Teams table refreshed

### Persistence Flow

1. Resolved events (both found and geocoded) stored in `eventDetailsMap`
2. `eventDetailsMap` persisted to localStorage via existing persistence mechanism
3. Geocoded coordinates persist alongside fetched events
4. On reload, geocoded events loaded from localStorage
5. Issues recalculated from current `eventTeams` and `eventDetailsMap`

## Storage Strategy

**Issues**: Not persisted (derived data, recalculated on load)
**Resolved Events**: Persisted in `eventDetailsMap` (same storage as fetched events)
**Geocoded Coordinates**: Stored in `EventDetails.geometry.coordinates` with `geocodedAddress: true` flag and `sourceAddress` field

## Validation Rules Summary

- Event names must be non-empty strings
- Ambassadors must exist in respective Maps
- Resolved issues must have resolution method and timestamp
- Geocoded events must have valid coordinates and source address
- Issues are recalculated when eventDetailsMap changes
