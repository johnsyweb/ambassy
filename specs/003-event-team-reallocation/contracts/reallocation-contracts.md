# Function Contracts: Event Team Reallocation

**Feature**: Event Team Reallocation  
**Date**: 2026-01-08  
**Type**: Function Contracts

## Show Reallocation Dialog

### `showReallocationDialog(eventShortName: string, currentAmbassador: string, suggestions: ReallocationSuggestion[], onSelect: (ambassadorName: string) => void, onCancel: () => void): void`

Displays a modal dialog with prioritised ambassador suggestions for reallocating an event.

**Parameters**:
- `eventShortName` (string): Short name of the event being reallocated
- `currentAmbassador` (string): Name of the currently assigned Event Ambassador
- `suggestions` (ReallocationSuggestion[]): Prioritised list of suggestions (from `suggestEventReallocation()`)
- `onSelect` ((ambassadorName: string) => void): Callback invoked when user selects a recipient ambassador
- `onCancel` (() => void): Callback invoked when user cancels the dialog

**Returns**: `void`

**Throws**: Never throws (errors handled via callbacks)

**Side Effects**:
- Displays modal dialog in DOM
- Attaches event listeners to dialog buttons and dropdown
- Manages focus (moves focus to dialog when opened, restores focus when closed)
- Updates dialog HTML content

**Preconditions**:
- `eventShortName` must be non-empty string
- `currentAmbassador` must be non-empty string (event must be assigned)
- `suggestions` array should be sorted by score (descending)
- Dialog HTML element (`#reallocationDialog`) must exist in DOM

**Postconditions**:
- Dialog is visible and accessible
- Top 3-5 suggestions displayed as clickable buttons
- "Other" dropdown option available with all ambassadors
- Keyboard navigation enabled (Tab, Enter, Arrow keys)
- Focus is within dialog
- Dialog can be closed via Cancel button or Escape key

**Accessibility**:
- Dialog has `role="dialog"` and `aria-labelledby` pointing to title
- Buttons have descriptive labels including ambassador name and score
- Focus trap: Tab cycles within dialog, Escape closes dialog
- Screen reader announcements for suggestions and warnings

---

## Reallocate Event Team

### `reallocateEventTeam(eventShortName: string, oldAmbassador: string, newAmbassador: string, eventAmbassadors: EventAmbassadorMap, eventTeamsTableData: EventTeamsTableDataMap, log: LogEntry[], regionalAmbassadors?: RegionalAmbassadorMap): void`

Reallocates an event from one Event Ambassador to another.

**Parameters**:
- `eventShortName` (string): Short name of the event to reallocate
- `oldAmbassador` (string): Name of the current Event Ambassador (empty string if unassigned)
- `newAmbassador` (string): Name of the recipient Event Ambassador
- `eventAmbassadors` (EventAmbassadorMap): Map of Event Ambassadors (will be modified)
- `eventTeamsTableData` (EventTeamsTableDataMap): Event Teams table data (will be updated)
- `log` (LogEntry[]): Changelog array (will be appended to)
- `regionalAmbassadors` (RegionalAmbassadorMap, optional): Regional Ambassadors for capacity calculations

**Returns**: `void`

**Throws**:
- `Error` if `newAmbassador` does not exist in `eventAmbassadors`
- `Error` if `eventShortName` does not exist in `eventTeamsTableData`

**Side Effects**:
- Removes `eventShortName` from `oldAmbassador.events` array (if oldAmbassador is non-empty)
- Adds `eventShortName` to `newAmbassador.events` array
- Updates `eventTeamsTableData[eventShortName].eventAmbassador` to `newAmbassador`
- Persists changes via `persistEventAmbassadors()` and `persistEventTeams()`
- Recalculates capacity statuses via `calculateAllCapacityStatuses()`
- Appends log entry to `log` array

**Preconditions**:
- `newAmbassador` must exist in `eventAmbassadors`
- `eventShortName` must exist in `eventTeamsTableData`
- `oldAmbassador` may be empty string (unassigned event)
- `oldAmbassador` must exist in `eventAmbassadors` if non-empty

**Postconditions**:
- Event is assigned to `newAmbassador`
- Event is removed from `oldAmbassador` (if previously assigned)
- `eventTeamsTableData` reflects new assignment
- Changes are persisted to storage
- Capacity statuses are recalculated
- Log entry created with type "assign event to ambassador"

**Error Handling**:
- If `newAmbassador` not found: throws Error, no changes made
- If `eventShortName` not found in table data: throws Error, no changes made
- Caller should catch errors and display user-friendly message

---

## Get Reallocation Suggestions

### `getReallocationSuggestions(eventShortName: string, eventAmbassadors: EventAmbassadorMap, eventDetails: EventDetailsMap, limits: CapacityLimits, regionalAmbassadors: RegionalAmbassadorMap): ReallocationSuggestion[]`

Generates prioritised suggestions for reallocating a single event.

**Parameters**:
- `eventShortName` (string): Short name of the event to reallocate
- `eventAmbassadors` (EventAmbassadorMap): Current Event Ambassadors
- `eventDetails` (EventDetailsMap): Event details including coordinates
- `limits` (CapacityLimits): Capacity limits configuration
- `regionalAmbassadors` (RegionalAmbassadorMap): Regional Ambassadors for region calculations

**Returns**: `ReallocationSuggestion[]` - Array of suggestions sorted by score (highest first)

**Throws**:
- `Error` if `eventShortName` does not have a current ambassador assigned
- `Error` if current ambassador does not exist in `eventAmbassadors`

**Side Effects**: None (pure function, delegates to `suggestEventReallocation()`)

**Preconditions**:
- `eventShortName` must exist in `eventDetails`
- Event must have a current ambassador assigned (found in `eventAmbassadors`)
- `eventAmbassadors` must contain at least one potential recipient (besides current ambassador)

**Postconditions**:
- Returns array of suggestions (may be empty if no suitable recipients)
- Suggestions are sorted by score (descending)
- Each suggestion includes:
  - `toAmbassador`: Recipient ambassador name
  - `score`: Calculated score (0-100)
  - `reasons`: Array of reasons (e.g., "Has available capacity", "Geographic proximity")
  - `warnings`: Array of warnings if applicable (e.g., "Would exceed capacity limit")
- Current ambassador is excluded from suggestions
- Suggestions consider capacity, region, and proximity

**Implementation Note**: This function is a convenience wrapper around `suggestEventReallocation()` that:
1. Finds the current ambassador for the event
2. Calls `suggestEventReallocation()` with single-event array
3. Returns the suggestions

---

## Validate Reallocation

### `validateReallocation(eventShortName: string, newAmbassador: string, eventAmbassadors: EventAmbassadorMap, eventTeamsTableData: EventTeamsTableDataMap): { valid: boolean; error?: string }`

Validates that a reallocation can be performed.

**Parameters**:
- `eventShortName` (string): Short name of the event to reallocate
- `newAmbassador` (string): Name of the proposed recipient Event Ambassador
- `eventAmbassadors` (EventAmbassadorMap): Current Event Ambassadors
- `eventTeamsTableData` (EventTeamsTableDataMap): Event Teams table data

**Returns**: `{ valid: boolean; error?: string }` - Validation result with optional error message

**Throws**: Never throws

**Side Effects**: None (pure function)

**Preconditions**: None (function handles missing data gracefully)

**Postconditions**:
- Returns `{ valid: true }` if reallocation is valid
- Returns `{ valid: false, error: string }` if reallocation is invalid
- Error messages are user-friendly and specific

**Validation Rules**:
- `eventShortName` must exist in `eventTeamsTableData`
- `newAmbassador` must exist in `eventAmbassadors`
- `newAmbassador` must not be the same as current ambassador (no-op reallocation)
- Event must have a current ambassador assigned (cannot reallocate unassigned events)

**Error Messages**:
- "Event not found in table data"
- "Recipient ambassador not found"
- "Event is already assigned to this ambassador"
- "Event is not currently assigned to any ambassador"

---

## Integration Points

### Existing Functions Used

**`suggestEventReallocation()`** (from `src/actions/suggestReallocation.ts`)
- Called by `getReallocationSuggestions()` to generate suggestions
- No modifications required

**`assignEventToAmbassador()`** (from `src/actions/assignEventToAmbassador.ts`)
- Called by `reallocateEventTeam()` to perform assignment
- No modifications required

**`calculateAllCapacityStatuses()`** (from `src/actions/checkCapacity.ts`)
- Called by `reallocateEventTeam()` after assignment
- No modifications required

**`persistEventAmbassadors()`** and `persistEventTeams()` (from `src/actions/persistState.ts`)
- Called by `reallocateEventTeam()` to persist changes
- No modifications required

### UI Integration

**Event Teams Table** (`src/actions/populateEventTeamsTable.ts`)
- Modified to add "Reallocate" button/action
- Button enabled when row is selected
- Button triggers `showReallocationDialog()`

**Reallocation Dialog** (`public/index.html`)
- Reuses existing `#reallocationDialog` element
- Content populated dynamically by `showReallocationDialog()`

**Selection State** (`src/models/SelectionState.ts`)
- Used to track selected event
- `selectedEventShortName` identifies event for reallocation
- No modifications required
