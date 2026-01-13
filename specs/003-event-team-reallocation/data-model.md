# Data Model: Event Team Reallocation

## Overview

This feature does not introduce new data models. It leverages existing models and adds UI state management for the reallocation workflow.

## Existing Models Used

### ReallocationSuggestion

**Location**: `src/models/ReallocationSuggestion.ts`

**Purpose**: Represents a suggestion for reallocating events from one ambassador to another.

**Fields**:
- `fromAmbassador: string` - Name of the ambassador currently assigned
- `toAmbassador: string` - Name of the suggested recipient ambassador
- `items: string[]` - Array of event short names being reallocated (single item for this feature)
- `score: number` - Calculated score (0-100, higher is better)
- `reasons?: string[]` - Optional array of reasons for the suggestion (e.g., "Has available capacity", "Geographic proximity")
- `warnings?: string[]` - Optional array of warnings (e.g., "Would exceed capacity limit")

**Usage**: Returned by `suggestEventReallocation()` function, used to populate reallocation dialog.

### SelectionState

**Location**: `src/models/SelectionState.ts`

**Purpose**: Tracks the currently selected event, ambassador, and highlighted events for table-map navigation.

**Fields**:
- `selectedEventShortName: string | null` - Currently selected event (used to identify event for reallocation)
- `selectedEventAmbassador: string | null` - Currently selected Event Ambassador
- `selectedRegionalAmbassador: string | null` - Currently selected Regional Ambassador
- `highlightedEvents: Set<string>` - Set of event short names to highlight on map
- `activeTab: string | null` - Currently active tab ID

**Usage**: Used to track which event is selected for reallocation. When user clicks "Reallocate" button, `selectedEventShortName` identifies the event to reallocate.

### EventTeamsTableData

**Location**: `src/models/EventTeamsTableData.ts`

**Purpose**: Represents a row in the Event Teams table.

**Fields**:
- `eventShortName: string` - Short name of the event
- `eventAmbassador: string` - Name of assigned Event Ambassador
- `regionalAmbassador: string` - Name of assigned Regional Ambassador
- `eventDirectors: string[]` - Array of Event Director names
- Additional computed fields for display

**Usage**: Updated when reallocation completes to reflect new ambassador assignment.

### EventAmbassadorMap

**Location**: `src/models/EventAmbassadorMap.ts`

**Purpose**: Map of Event Ambassador names to `EventAmbassador` objects.

**Fields** (EventAmbassador):
- `name: string` - Ambassador name
- `events: string[]` - Array of event short names assigned to this ambassador
- `capacityStatus?: CapacityStatus` - Current capacity status (UNDER, WITHIN, OVER)
- `conflicts?: string[]` - Optional array of conflicting event names

**Usage**: 
- Passed to `suggestEventReallocation()` to generate suggestions
- Modified by `assignEventToAmbassador()` to update assignments

### EventDetailsMap

**Location**: `src/models/EventDetailsMap.ts`

**Purpose**: Map of event short names to `EventDetails` objects containing geographic coordinates.

**Fields** (EventDetails):
- `geometry.coordinates: [number, number]` - [longitude, latitude] coordinates
- Additional event metadata

**Usage**: Passed to `suggestEventReallocation()` for proximity calculations.

### CapacityLimits

**Location**: `src/models/CapacityLimits.ts`

**Purpose**: Defines capacity limits for ambassadors.

**Fields**:
- `eventAmbassadorMin: number` - Minimum events per Event Ambassador
- `eventAmbassadorMax: number` - Maximum events per Event Ambassador
- `regionalAmbassadorMin: number` - Minimum EAs per Regional Ambassador
- `regionalAmbassadorMax: number` - Maximum EAs per Regional Ambassador

**Usage**: Passed to `suggestEventReallocation()` for capacity scoring.

## UI State (No Persistent Model)

### Dialog State

**Purpose**: Tracks whether reallocation dialog is open and which event is being reallocated.

**State Variables** (in `showReallocationDialog.ts`):
- `isDialogOpen: boolean` - Whether dialog is currently visible
- `currentEventShortName: string | null` - Event being reallocated (from `SelectionState.selectedEventShortName`)
- `suggestions: ReallocationSuggestion[]` - Cached suggestions for current event

**Lifecycle**:
- Initialized when dialog opens
- Cleared when dialog closes
- Not persisted (ephemeral UI state)

## Data Flow

1. **Selection**: User selects table row → `SelectionState.selectedEventShortName` set
2. **Dialog Open**: User clicks "Reallocate" → Dialog opens, reads `selectedEventShortName`
3. **Suggestions**: `suggestEventReallocation()` called with selected event → Returns `ReallocationSuggestion[]`
4. **Display**: Suggestions displayed in dialog, sorted by score
5. **Selection**: User chooses recipient → `assignEventToAmbassador()` called
6. **Update**: `EventAmbassadorMap` and `EventTeamsTableData` updated
7. **Persistence**: Changes persisted via `persistEventAmbassadors()` and `persistEventTeams()`
8. **Refresh**: UI refreshed to show new assignment

## Validation Rules

- `selectedEventShortName` must exist in `EventTeamsTableDataMap` before opening dialog
- Selected event must have a current `eventAmbassador` (cannot reallocate unassigned events)
- Recipient ambassador must exist in `EventAmbassadorMap`
- Recipient ambassador cannot be the same as current ambassador (no-op reallocation)

## Relationships

- `SelectionState` → `EventTeamsTableData` (via `selectedEventShortName`)
- `ReallocationSuggestion` → `EventAmbassadorMap` (via `toAmbassador`)
- `EventTeamsTableData` → `EventAmbassadorMap` (via `eventAmbassador`)
- `EventDetailsMap` → Used for proximity calculations in scoring
