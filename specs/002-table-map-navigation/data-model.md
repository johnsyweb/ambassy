# Data Model: Table-Map Navigation

## Overview

This feature adds selection state management to enable bidirectional navigation between tables and map view. The data model is minimal - primarily state management for UI interactions.

## Core Entities

### SelectionState

Centralized state object that tracks current selections across all tables and the map.

**Location**: `src/models/SelectionState.ts`

**Fields**:
```typescript
interface SelectionState {
  // Event Teams table selection (also used for map → table)
  selectedEventShortName: string | null;
  
  // Event Ambassador table selection
  selectedEventAmbassador: string | null;
  
  // Regional Ambassador table selection
  selectedRegionalAmbassador: string | null;
  
  // Set of event short names currently highlighted on map
  highlightedEvents: Set<string>;
  
  // Currently visible/active tab name
  activeTab: string | null;
}
```

**State Transitions**:
- `selectEventTeamRow(eventShortName)` → Sets `selectedEventShortName`, updates `highlightedEvents` to single event
- `selectEventAmbassadorRow(ambassadorName)` → Sets `selectedEventAmbassador`, updates `highlightedEvents` to all events for that EA
- `selectRegionalAmbassadorRow(ambassadorName)` → Sets `selectedRegionalAmbassador`, updates `highlightedEvents` to all events for supported EAs
- `selectMapEvent(eventShortName)` → Sets `selectedEventShortName`, triggers table highlight if tab visible
- `clearSelection()` → Resets all selection fields to null/empty

**Validation Rules**:
- `selectedEventShortName` must exist in `eventTeamsTableData` if not null
- `selectedEventAmbassador` must exist in `eventAmbassadors` if not null
- `selectedRegionalAmbassador` must exist in `regionalAmbassadors` if not null
- `highlightedEvents` must only contain valid event short names

## Extended Entities

### Map Marker Storage

Extend `populateMap.ts` to store marker references.

**Storage**: `Map<string, L.CircleMarker>` keyed by event short name

**Purpose**: Enable lookup of markers for highlighting without re-querying DOM

**Lifecycle**: 
- Created when map is populated
- Cleared when map is repopulated
- Updated when events are added/removed

### Table Row References

Store references to table rows for highlighting.

**Storage**: DOM element references (no separate data structure needed)

**Purpose**: Enable direct DOM manipulation for highlighting

**Lifecycle**: 
- Created when table is populated
- Updated when table is repopulated
- Cleared when table is cleared

## Relationships

```
SelectionState
  ├── selectedEventShortName → EventTeamsTableData (via eventShortName)
  ├── selectedEventAmbassador → EventAmbassador (via name)
  ├── selectedRegionalAmbassador → RegionalAmbassador (via name)
  └── highlightedEvents → EventDetailsMap (via event short names)

Map Marker Storage
  └── eventShortName → L.CircleMarker

Table Row References
  └── eventShortName → HTMLTableRowElement (Event Teams)
  └── ambassadorName → HTMLTableRowElement (EA/REA tables)
```

## State Management Flow

1. **User selects table row** → Updates `SelectionState` → Triggers map highlight update
2. **User selects map marker** → Updates `SelectionState` → Triggers table highlight update (if tab visible)
3. **User switches tabs** → Updates `activeTab` → Applies stored selection if applicable
4. **User clears selection** → Resets `SelectionState` → Clears all highlights

## Data Flow

```
Table Selection
  ↓
SelectionState.update()
  ↓
Map Highlighting API
  ↓
Leaflet Marker Updates

Map Marker Click
  ↓
SelectionState.update()
  ↓
Table Highlighting API
  ↓
DOM Row Updates
```

## Persistence

**No persistence required** - Selection state is ephemeral UI state that resets on page refresh.

## Validation

- Event short names must exist in `eventTeamsTableData`
- Ambassador names must exist in respective ambassador maps
- Highlighted events must be valid (exist in `eventDetails`)
- Tab names must be valid tab identifiers

## Edge Cases

- **Event doesn't exist**: Selection is cleared, no error thrown
- **Ambassador has no events**: `highlightedEvents` is empty set, map shows no highlights
- **Map not initialized**: Selection state stored, map update deferred until map available
- **Table not visible**: Selection state stored, table highlight deferred until tab visible
- **Multiple rapid selections**: Last selection wins, previous highlights cleared

