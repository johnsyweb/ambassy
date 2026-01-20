# API Contracts: Launch and Archive Prospects

**Feature**: 012-prospect-goes-live
**Date**: 2026-01-18
**Phase**: 1 - Design & Contracts

## Overview

This document defines the API contracts for launching and archiving prospects. All functions follow existing action patterns from the codebase.

## Core Functions

### launchProspect

**Purpose**: Mark a prospect as launched (transitioned to live event), optionally allocate matching event to EA.

**Signature**:
```typescript
export function launchProspect(
  prospectId: string,
  prospects: ProspectiveEventList,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventDetails: EventDetailsMap,
  log: LogEntry[],
  selectedEventName?: string,
  selectedEA?: string
): void
```

**Parameters**:
- `prospectId: string` - ID of prospect to launch (required)
- `prospects: ProspectiveEventList` - Collection of prospects (required)
- `eventAmbassadors: EventAmbassadorMap` - Map of event ambassadors (required)
- `regionalAmbassadors: RegionalAmbassadorMap` - Map of regional ambassadors (required)
- `eventDetails: EventDetailsMap` - Map of event details for matching (required)
- `log: LogEntry[]` - Changes log array (required)
- `selectedEventName?: string` - Name of event to allocate (optional, if event selected)
- `selectedEA?: string` - Name of EA to assign event to (optional, if event allocated)

**Returns**: `void`

**Behavior**:
1. Validates prospect exists (`prospects.findById(prospectId)`)
2. Finds potential matching events using `findMatchingEvents`
3. If `selectedEventName` provided, allocates event using `assignEventToAmbassador`
4. Removes prospect from `prospects`
5. Updates EA's `prospectiveEvents` array (removes prospectId)
6. Recalculates capacity statuses using `calculateAllCapacityStatuses`
7. Persists changes: `saveProspectiveEvents`, `persistEventAmbassadors`
8. Logs launch entry: type "Prospect Launched"
9. Throws error if prospect not found or validation fails

**Errors**:
- `Error("Prospect with ID '${prospectId}' not found")` - Prospect doesn't exist
- `Error("Event Ambassador '${selectedEA}' not found")` - EA doesn't exist (if event allocated)
- `Error("Event '${selectedEventName}' not found")` - Event doesn't exist (if event allocated)

**Usage**:
```typescript
launchProspect(
  prospectId,
  prospects,
  eventAmbassadors,
  regionalAmbassadors,
  eventDetails,
  log,
  selectedEventName, // optional
  selectedEA // optional
);
```

---

### archiveProspect

**Purpose**: Mark a prospect as archived (not viable), remove from system.

**Signature**:
```typescript
export function archiveProspect(
  prospectId: string,
  prospects: ProspectiveEventList,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[]
): void
```

**Parameters**:
- `prospectId: string` - ID of prospect to archive (required)
- `prospects: ProspectiveEventList` - Collection of prospects (required)
- `eventAmbassadors: EventAmbassadorMap` - Map of event ambassadors (required)
- `regionalAmbassadors: RegionalAmbassadorMap` - Map of regional ambassadors (required)
- `log: LogEntry[]` - Changes log array (required)

**Returns**: `void`

**Behavior**:
1. Validates prospect exists (`prospects.findById(prospectId)`)
2. Removes prospect from `prospects`
3. Updates EA's `prospectiveEvents` array (removes prospectId if EA assigned)
4. Recalculates capacity statuses using `calculateAllCapacityStatuses`
5. Persists changes: `saveProspectiveEvents`, `persistEventAmbassadors`
6. Logs archive entry: type "Prospect Archived" with reason "not viable"
7. Throws error if prospect not found

**Errors**:
- `Error("Prospect with ID '${prospectId}' not found")` - Prospect doesn't exist

**Usage**:
```typescript
archiveProspect(
  prospectId,
  prospects,
  eventAmbassadors,
  regionalAmbassadors,
  log
);
```

---

### findMatchingEvents

**Purpose**: Find potential matching events for a prospect by name and location.

**Signature**:
```typescript
export function findMatchingEvents(
  prospect: ProspectiveEvent,
  eventDetails: EventDetailsMap,
  maxDistanceKm?: number
): EventDetails[]
```

**Parameters**:
- `prospect: ProspectiveEvent` - Prospect to find matches for (required)
- `eventDetails: EventDetailsMap` - Map of event details to search (required)
- `maxDistanceKm?: number` - Maximum distance threshold in kilometers (optional, default: 50)

**Returns**: `EventDetails[]` - Array of matching events, sorted by distance (closest first) then match quality

**Behavior**:
1. Searches events by name using `searchEvents(prospect.prospectEvent, eventDetails)`
2. Filters results by location if prospect has coordinates:
   - Calculates distance from prospect.coordinates to each event's coordinates
   - Filters out events beyond `maxDistanceKm` threshold
3. If no coordinates, returns all name matches (location filtering disabled)
4. Sorts results by:
   - Distance (closest first) - if coordinates available
   - Match quality (exact > normalized > fuzzy) - from searchEvents
5. Returns sorted array of matching events

**Location Filtering**:
- Uses haversine distance or similar geography utility
- Only filters if `prospect.coordinates` exists
- Default threshold: 50km (configurable via `maxDistanceKm`)

**Usage**:
```typescript
const matches = findMatchingEvents(
  prospect,
  eventDetails,
  50 // optional, default 50km
);

// Show matches to REA for manual selection
```

---

## UI Functions

### showLaunchDialog

**Purpose**: Display dialog for launching a prospect with event matching and allocation.

**Signature**:
```typescript
export function showLaunchDialog(
  prospect: ProspectiveEvent,
  prospects: ProspectiveEventList,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventDetails: EventDetailsMap,
  log: LogEntry[],
  onSuccess: () => void,
  onCancel: () => void
): void
```

**Parameters**:
- `prospect: ProspectiveEvent` - Prospect to launch (required)
- `prospects: ProspectiveEventList` - Collection of prospects (required)
- `eventAmbassadors: EventAmbassadorMap` - Map of event ambassadors (required)
- `regionalAmbassadors: RegionalAmbassadorMap` - Map of regional ambassadors (required)
- `eventDetails: EventDetailsMap` - Map of event details (required)
- `log: LogEntry[]` - Changes log array (required)
- `onSuccess: () => void` - Callback after successful launch (required)
- `onCancel: () => void` - Callback if launch cancelled (required)

**Behavior**:
1. Shows confirmation dialog: "Mark prospect as launched?"
2. Finds matching events using `findMatchingEvents`
3. Displays matching events (if any) for REA selection
4. If event selected, shows EA selection dialog (suggests prospect's assigned EA)
5. On confirm, calls `launchProspect` with selections
6. Calls `onSuccess` after successful launch
7. Calls `onCancel` if cancelled
8. Handles errors and displays user-friendly messages

**UI Elements**:
- Confirmation message
- Matching events list (if any)
- Event selection (or "Proceed without allocation")
- EA selection dropdown (if event selected)
- Cancel/Confirm buttons
- Keyboard accessible (Enter/Escape)

---

### showArchiveDialog

**Purpose**: Display confirmation dialog for archiving a prospect.

**Signature**:
```typescript
export function showArchiveDialog(
  prospect: ProspectiveEvent,
  prospects: ProspectiveEventList,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
  onSuccess: () => void,
  onCancel: () => void
): void
```

**Parameters**:
- `prospect: ProspectiveEvent` - Prospect to archive (required)
- `prospects: ProspectiveEventList` - Collection of prospects (required)
- `eventAmbassadors: EventAmbassadorMap` - Map of event ambassadors (required)
- `regionalAmbassadors: RegionalAmbassadorMap` - Map of regional ambassadors (required)
- `log: LogEntry[]` - Changes log array (required)
- `onSuccess: () => void` - Callback after successful archive (required)
- `onCancel: () => void` - Callback if archive cancelled (required)

**Behavior**:
1. Shows confirmation dialog: "Mark prospect as archived (not viable)?"
2. On confirm, calls `archiveProspect`
3. Calls `onSuccess` after successful archive
4. Calls `onCancel` if cancelled
5. Handles errors and displays user-friendly messages

**UI Elements**:
- Confirmation message with reason (not viable)
- Cancel/Confirm buttons
- Keyboard accessible (Enter/Escape)

---

## Integration Points

### Existing Functions Used

- `searchEvents(query: string, events: EventDetailsMap): EventDetails[]` - Event name matching
- `assignEventToAmbassador(...)` - Event allocation (from allocateEventFromMap.ts)
- `calculateAllCapacityStatuses(...)` - Capacity recalculation
- `saveProspectiveEvents(...)` - Prospect persistence
- `persistEventAmbassadors(...)` - EA persistence
- `persistChangesLog(...)` - Log persistence

### Modified Functions

- `populateProspectsTable.ts` - Replace Remove button with Launch/Archive buttons
  - Calls `showLaunchDialog` on Launch button click
  - Calls `showArchiveDialog` on Archive button click

---

## Error Handling

### Validation Errors

All functions validate inputs and throw descriptive errors:
- Prospect not found: `Error("Prospect with ID '${id}' not found")`
- EA not found: `Error("Event Ambassador '${name}' not found")`
- Event not found: `Error("Event '${name}' not found")`

### UI Error Handling

Dialog functions catch errors and display user-friendly messages:
- Try/catch blocks around function calls
- Alert or inline error messages
- Don't block user from retrying

### Error Recovery

- Failed launch/archive: Prospect remains in system, error logged
- Partial failures: State remains consistent (no partial updates)

---

## Testing Contracts

### Unit Tests

- `launchProspect.test.ts` - Test launch logic, validation, EA updates, logging
- `archiveProspect.test.ts` - Test archive logic, validation, EA updates, logging
- `findMatchingEvents.test.ts` - Test event matching, location filtering, sorting

### Integration Tests

- `showLaunchDialog.test.ts` - Test dialog workflow, event selection, EA allocation
- `showArchiveDialog.test.ts` - Test dialog workflow, confirmation
- `populateProspectsTable.test.ts` - Test button replacement, click handlers

### Test Patterns

- Mock dependencies (eventAmbassadors, regionalAmbassadors, etc.)
- Test error cases (missing prospect, missing EA, etc.)
- Test edge cases (no coordinates, no matches, etc.)
- Verify logging entries
- Verify persistence calls
