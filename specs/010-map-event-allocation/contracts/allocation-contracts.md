# API Contracts: Map Event Allocation

**Feature**: Map Event Allocation  
**Date**: 2026-01-15  
**Type**: Function Contracts (TypeScript)

## Overview

This feature extends existing function contracts and introduces one new function for handling unallocated event allocation from the map interface.

## Existing Contracts (Extended)

### `selectMapEvent`

**File**: `src/actions/tableMapNavigation.ts`

**Current Signature**:
```typescript
export function selectMapEvent(
  state: SelectionState,
  eventShortName: string,
  markerMap: Map<string, L.CircleMarker>,
  highlightLayer: L.LayerGroup | null,
  eventDetails: EventDetailsMap,
  map: L.Map | null
): void
```

**Extended Behavior**:
- **NEW**: If `eventShortName` is not in `eventTeamsTableData`, detect as unallocated event
- **NEW**: Show allocation dialog instead of just highlighting
- **NEW**: Pass `eventTeamsTableData` parameter to check allocation status

**Updated Signature** (conceptual):
```typescript
export function selectMapEvent(
  state: SelectionState,
  eventShortName: string,
  markerMap: Map<string, L.CircleMarker>,
  highlightLayer: L.LayerGroup | null,
  eventDetails: EventDetailsMap,
  map: L.Map | null,
  eventTeamsTableData: EventTeamsTableDataMap, // NEW
  eventAmbassadors: EventAmbassadorMap, // NEW
  regionalAmbassadors: RegionalAmbassadorMap, // NEW
  eventTeams: EventTeamMap, // NEW
  onAllocate?: (eventName: string, eaName: string) => void // NEW callback
): void
```

**Preconditions**:
- `eventShortName` must exist in `eventDetails`
- `eventDetails` must not be null
- If unallocated, `eventAmbassadors` must not be empty

**Postconditions**:
- If allocated: Event is highlighted on map and table (existing behavior)
- If unallocated: Allocation dialog is shown
- Selection state is updated

**Side Effects**:
- Updates `state.selectedEventShortName`
- Updates `state.highlightedEvents`
- May show modal dialog
- May highlight map markers
- May center map on event

## New Contracts

### `allocateEventFromMap`

**File**: `src/actions/allocateEventFromMap.ts` (NEW)

**Signature**:
```typescript
export function allocateEventFromMap(
  eventName: string,
  selectedEA: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventTeams: EventTeamMap,
  eventDetails: EventDetailsMap,
  log: LogEntry[]
): void
```

**Purpose**: Allocate an unallocated event to an Event Ambassador from the map interface.

**Parameters**:
- `eventName: string` - Short name of the event to allocate (must exist in `eventDetails`)
- `selectedEA: string` - Name of the Event Ambassador to assign (must exist in `eventAmbassadors`)
- `eventAmbassadors: EventAmbassadorMap` - Map of all Event Ambassadors
- `regionalAmbassadors: RegionalAmbassadorMap` - Map of all Regional Ambassadors
- `eventTeams: EventTeamMap` - Map of Event Teams (for Event Directors)
- `eventDetails: EventDetailsMap` - Map of all event details
- `log: LogEntry[]` - Changes log array to append entries

**Returns**: `void`

**Preconditions**:
- `eventName` must exist in `eventDetails`
- `eventName` must NOT exist in current `eventTeamsTableData` (unallocated)
- `selectedEA` must exist in `eventAmbassadors`
- `log` must be a valid array (will be mutated)

**Postconditions**:
- Event is added to `selectedEA.events` array
- `eventAmbassadors` is persisted via `persistEventAmbassadors`
- Change is logged in `log` array
- Capacity statuses are recalculated
- State change is tracked via `trackStateChange`

**Side Effects**:
- Mutates `eventAmbassadors` (adds event to EA's events array)
- Mutates `log` (appends log entry)
- Persists to localStorage via `persistEventAmbassadors`
- Tracks state change via `trackStateChange`
- Recalculates capacity statuses

**Throws**:
- `Error` if `selectedEA` not found in `eventAmbassadors`
- `Error` if `eventName` not found in `eventDetails`

**Usage Example**:
```typescript
const log: LogEntry[] = [];
allocateEventFromMap(
  "albertpark",
  "John Smith",
  eventAmbassadors,
  regionalAmbassadors,
  eventTeams,
  eventDetails,
  log
);
// Event "albertpark" is now assigned to "John Smith"
// REA is automatically determined from EA's hierarchy
```

### `showEventAllocationDialog`

**File**: `src/actions/showEventAllocationDialog.ts` (NEW, or extend `showReallocationDialog.ts`)

**Signature**:
```typescript
export function showEventAllocationDialog(
  eventName: string,
  eventDetails: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventTeams: EventTeamMap,
  onSelect: (eaName: string) => void,
  onCancel: () => void
): void
```

**Purpose**: Display a modal dialog for selecting an Event Ambassador to allocate an unallocated event.

**Parameters**:
- `eventName: string` - Short name of the event to allocate
- `eventDetails: EventDetailsMap` - Map of all event details (for displaying event info)
- `eventAmbassadors: EventAmbassadorMap` - Map of all Event Ambassadors (for selection)
- `regionalAmbassadors: RegionalAmbassadorMap` - Map of all Regional Ambassadors (for REA display)
- `eventTeams: EventTeamMap` - Map of Event Teams (for Event Directors display)
- `onSelect: (eaName: string) => void` - Callback when EA is selected
- `onCancel: () => void` - Callback when dialog is cancelled

**Returns**: `void`

**Preconditions**:
- `eventName` must exist in `eventDetails`
- `eventAmbassadors` must not be empty
- Dialog elements must exist in DOM (`#reallocationDialog`, etc.)

**Postconditions**:
- Dialog is displayed with event information
- EA suggestions are shown (top 3-5)
- Manual selection dropdown is available
- Dialog is keyboard accessible (Tab, Enter, Escape)

**Side Effects**:
- Creates/modifies DOM elements for dialog
- Shows modal overlay
- Binds keyboard event handlers
- May generate EA suggestions based on proximity/capacity

**Throws**:
- `Error` if dialog elements not found in DOM
- `Error` if `eventAmbassadors` is empty

**Accessibility Requirements**:
- Dialog must have `role="dialog"` and `aria-modal="true"`
- Dialog must trap focus
- Dialog must be dismissible with Escape key
- All interactive elements must be keyboard accessible
- Dialog must have `aria-labelledby` pointing to title

**Usage Example**:
```typescript
showEventAllocationDialog(
  "albertpark",
  eventDetails,
  eventAmbassadors,
  regionalAmbassadors,
  eventTeams,
  (eaName) => {
    // Handle allocation
    allocateEventFromMap(eventName, eaName, ...);
  },
  () => {
    // Handle cancellation
    console.log("Allocation cancelled");
  }
);
```

## Contract Dependencies

### `assignEventToAmbassador`

**File**: `src/actions/assignEventToAmbassador.ts`

**Used By**: `allocateEventFromMap`

**Contract**: 
- Called with `oldEventAmbassador = ""` (empty string) for unallocated events
- Handles event assignment, persistence, capacity recalculation, and logging

### `getRegionalAmbassadorForEventAmbassador`

**File**: `src/utils/regions.ts`

**Used By**: `allocateEventFromMap` (indirectly via `extractEventTeamsTableData`)

**Contract**:
- Returns REA name if EA has supporting REA, null otherwise
- Looks up from EA's `regionalAmbassador` field or REA's `supportsEAs` list

### `extractEventTeamsTableData`

**File**: `src/models/EventTeamsTable.ts`

**Used By**: After allocation, to regenerate table data

**Contract**:
- Includes all events that have EA assignments
- Automatically includes newly allocated events after `assignEventToAmbassador` is called

### `populateMap`

**File**: `src/actions/populateMap.ts`

**Used By**: After allocation, to refresh map display

**Contract**:
- Renders allocated events with EA colors and larger markers
- Renders unallocated events with default color and smaller markers
- Automatically shows newly allocated events correctly after refresh

## Error Handling

### No Event Ambassadors Available

**Scenario**: User clicks unallocated event, but `eventAmbassadors` is empty

**Handling**: 
- Show error message: "No Event Ambassadors available. Please onboard an Event Ambassador first."
- Do not show allocation dialog
- Return to map view

### Event Already Allocated

**Scenario**: User clicks event that is already in `eventTeamsTableData`

**Handling**:
- Should not occur if check is correct
- If occurs, treat as allocated event (highlight, don't show allocation dialog)

### Selected EA Not Found

**Scenario**: Selected EA name doesn't exist in `eventAmbassadors`

**Handling**:
- Throw error in `allocateEventFromMap`
- Show error message to user
- Do not proceed with allocation

### Event Not Found in eventDetails

**Scenario**: Event name doesn't exist in `eventDetails`

**Handling**:
- Throw error in `allocateEventFromMap`
- Show error message to user
- Do not proceed with allocation

## Testing Contracts

### Unit Tests Required

1. **`allocateEventFromMap`**:
   - Allocates event to EA successfully
   - Adds event to EA's events array
   - Determines REA correctly
   - Logs change correctly
   - Throws error if EA not found
   - Throws error if event not found

2. **`showEventAllocationDialog`**:
   - Shows dialog with event information
   - Displays EA suggestions
   - Handles EA selection
   - Handles cancellation
   - Keyboard accessible
   - Throws error if no EAs available

3. **`selectMapEvent` (extended)**:
   - Detects unallocated events correctly
   - Shows allocation dialog for unallocated events
   - Highlights allocated events (existing behavior)
   - Handles edge cases (no EAs, event not found)

### Integration Tests Required

1. **End-to-end allocation flow**:
   - Click unallocated event marker
   - Select EA from dialog
   - Verify event is allocated
   - Verify map updates
   - Verify table updates
   - Verify change is logged

2. **Event Directors display**:
   - Allocate event with Event Directors
   - Verify Event Directors appear in table
   - Verify Event Directors appear in map tooltip

3. **REA assignment**:
   - Allocate event to EA with REA
   - Verify REA appears in table
   - Verify REA appears in map tooltip
