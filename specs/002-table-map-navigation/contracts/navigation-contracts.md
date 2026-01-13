# API Contracts: Table-Map Navigation

## Overview

This document defines the API contracts for table-map navigation functionality. All functions are synchronous and operate on client-side state.

## Selection State API

### `createSelectionState(): SelectionState`

Creates a new selection state instance.

**Parameters**: None

**Returns**: `SelectionState` - New selection state object

**Side Effects**: None

**Errors**: None

---

### `selectEventTeamRow(state: SelectionState, eventShortName: string, eventTeamsTableData: EventTeamsTableDataMap): void`

Selects a row in the Event Teams table and updates selection state.

**Parameters**:
- `state: SelectionState` - Current selection state
- `eventShortName: string` - Event short name to select
- `eventTeamsTableData: EventTeamsTableDataMap` - Event teams data for validation

**Returns**: `void`

**Side Effects**: 
- Updates `state.selectedEventShortName`
- Updates `state.highlightedEvents` to contain only the selected event
- Clears other selections

**Errors**: 
- Throws if `eventShortName` doesn't exist in `eventTeamsTableData`

---

### `selectEventAmbassadorRow(state: SelectionState, ambassadorName: string, eventAmbassadors: EventAmbassadorMap, eventTeamsTableData: EventTeamsTableDataMap): void`

Selects a row in the Event Ambassador table and updates selection state.

**Parameters**:
- `state: SelectionState` - Current selection state
- `ambassadorName: string` - Event Ambassador name to select
- `eventAmbassadors: EventAmbassadorMap` - Event Ambassadors data for validation
- `eventTeamsTableData: EventTeamsTableDataMap` - Event teams data to find events

**Returns**: `void`

**Side Effects**:
- Updates `state.selectedEventAmbassador`
- Updates `state.highlightedEvents` to contain all events assigned to the ambassador
- Clears other selections

**Errors**:
- Throws if `ambassadorName` doesn't exist in `eventAmbassadors`

---

### `selectRegionalAmbassadorRow(state: SelectionState, ambassadorName: string, regionalAmbassadors: RegionalAmbassadorMap, eventTeamsTableData: EventTeamsTableDataMap): void`

Selects a row in the Regional Ambassador table and updates selection state.

**Parameters**:
- `state: SelectionState` - Current selection state
- `ambassadorName: string` - Regional Ambassador name to select
- `regionalAmbassadors: RegionalAmbassadorMap` - Regional Ambassadors data for validation
- `eventTeamsTableData: EventTeamsTableDataMap` - Event teams data to find events

**Returns**: `void`

**Side Effects**:
- Updates `state.selectedRegionalAmbassador`
- Updates `state.highlightedEvents` to contain all events assigned to supported Event Ambassadors
- Clears other selections

**Errors**:
- Throws if `ambassadorName` doesn't exist in `regionalAmbassadors`

---

### `selectMapEvent(state: SelectionState, eventShortName: string): void`

Selects an event from the map and updates selection state.

**Parameters**:
- `state: SelectionState` - Current selection state
- `eventShortName: string` - Event short name to select

**Returns**: `void`

**Side Effects**:
- Updates `state.selectedEventShortName`
- Updates `state.highlightedEvents` to contain only the selected event
- Clears other selections

**Errors**: None (validation happens at table highlight time)

---

### `clearSelection(state: SelectionState): void`

Clears all selections.

**Parameters**:
- `state: SelectionState` - Current selection state

**Returns**: `void`

**Side Effects**:
- Resets all selection fields to null/empty
- Clears `highlightedEvents`

**Errors**: None

---

## Map Highlighting API

### `highlightEventsOnMap(eventShortNames: string[], markerMap: Map<string, L.CircleMarker>, highlightLayer: L.LayerGroup): void`

Highlights events on the map by adding markers to highlight layer.

**Parameters**:
- `eventShortNames: string[]` - Array of event short names to highlight
- `markerMap: Map<string, L.CircleMarker>` - Map of event names to markers
- `highlightLayer: L.LayerGroup` - Leaflet layer group for highlights

**Returns**: `void`

**Side Effects**:
- Clears existing highlights from `highlightLayer`
- Adds highlighted markers to `highlightLayer` with highlight style
- Updates marker styles

**Errors**: 
- Silently ignores event names that don't exist in `markerMap`

---

### `centerMapOnEvents(eventShortNames: string[], eventDetails: EventDetailsMap, map: L.Map): void`

Centers and zooms the map to show the specified events.

**Parameters**:
- `eventShortNames: string[]` - Array of event short names to center on
- `eventDetails: EventDetailsMap` - Event details with coordinates
- `map: L.Map` - Leaflet map instance

**Returns**: `void`

**Side Effects**:
- Updates map viewport (centers and zooms)
- Animates map movement if `eventShortNames.length === 1`, uses `setView()`
- Uses `fitBounds()` if `eventShortNames.length > 1`

**Errors**:
- Silently ignores event names that don't exist in `eventDetails`
- Does nothing if `eventShortNames` is empty

---

### `clearMapHighlights(highlightLayer: L.LayerGroup): void`

Clears all highlights from the map.

**Parameters**:
- `highlightLayer: L.LayerGroup` - Leaflet layer group for highlights

**Returns**: `void`

**Side Effects**:
- Removes all layers from `highlightLayer`

**Errors**: None

---

## Table Highlighting API

### `highlightTableRow(tableId: string, identifier: string, isSelected: boolean): void`

Highlights or unhighlights a row in a table.

**Parameters**:
- `tableId: string` - Table identifier ('eventTeamsTable', 'eventAmbassadorsTable', 'regionalAmbassadorsTable')
- `identifier: string` - Row identifier (event short name or ambassador name)
- `isSelected: boolean` - Whether to highlight (true) or unhighlight (false)

**Returns**: `void`

**Side Effects**:
- Adds/removes `selected` CSS class from table row
- Updates `aria-selected` attribute
- Clears previous selection in same table if `isSelected === true`

**Errors**:
- Silently ignores if table or row doesn't exist

---

### `scrollToTableRow(tableId: string, identifier: string): void`

Scrolls the table to show the specified row.

**Parameters**:
- `tableId: string` - Table identifier
- `identifier: string` - Row identifier

**Returns**: `void`

**Side Effects**:
- Scrolls table container to show the row
- Row becomes visible in viewport

**Errors**:
- Silently ignores if table or row doesn't exist

---

### `clearTableHighlights(tableId: string): void`

Clears all highlights in a table.

**Parameters**:
- `tableId: string` - Table identifier

**Returns**: `void`

**Side Effects**:
- Removes `selected` class from all rows
- Removes `aria-selected` attributes

**Errors**: None

---

## Event Handlers

### `onTableRowClick(event: MouseEvent, rowIdentifier: string, tableType: 'eventTeams' | 'eventAmbassadors' | 'regionalAmbassadors'): void`

Handles table row click events.

**Parameters**:
- `event: MouseEvent` - Click event
- `rowIdentifier: string` - Row identifier (event short name or ambassador name)
- `tableType: 'eventTeams' | 'eventAmbassadors' | 'regionalAmbassadors'` - Table type

**Returns**: `void`

**Side Effects**:
- Updates selection state
- Triggers map highlighting
- Updates table highlighting

**Errors**: None (errors handled internally)

---

### `onTableRowKeyDown(event: KeyboardEvent, rowIdentifier: string, tableType: 'eventTeams' | 'eventAmbassadors' | 'regionalAmbassadors'): void`

Handles table row keyboard events.

**Parameters**:
- `event: KeyboardEvent` - Keyboard event
- `rowIdentifier: string` - Row identifier
- `tableType: 'eventTeams' | 'eventAmbassadors' | 'regionalAmbassadors'` - Table type

**Returns**: `void`

**Side Effects**:
- Arrow keys: Navigate to adjacent row
- Enter: Select current row
- Updates selection state and triggers map highlighting

**Errors**: None

---

### `onMapMarkerClick(event: L.LeafletMouseEvent, eventShortName: string): void`

Handles map marker click events.

**Parameters**:
- `event: L.LeafletMouseEvent` - Leaflet mouse event
- `eventShortName: string` - Event short name

**Returns**: `void`

**Side Effects**:
- Updates selection state
- Triggers table highlighting (if tab visible)
- Updates map highlighting

**Errors**: None

---

### `onMapMarkerKeyPress(event: KeyboardEvent, eventShortName: string): void`

Handles map marker keyboard events.

**Parameters**:
- `event: KeyboardEvent` - Keyboard event
- `eventShortName: string` - Event short name

**Returns**: `void`

**Side Effects**:
- Enter/Space: Select marker
- Updates selection state and triggers table highlighting

**Errors**: None

---

## Coordination API

### `initializeTableMapNavigation(
  selectionState: SelectionState,
  markerMap: Map<string, L.CircleMarker>,
  highlightLayer: L.LayerGroup,
  map: L.Map,
  eventDetails: EventDetailsMap,
  eventTeamsTableData: EventTeamsTableDataMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap
): void`

Initializes table-map navigation system.

**Parameters**:
- `selectionState: SelectionState` - Selection state instance
- `markerMap: Map<string, L.CircleMarker>` - Map of event names to markers
- `highlightLayer: L.LayerGroup` - Highlight layer
- `map: L.Map` - Leaflet map instance
- `eventDetails: EventDetailsMap` - Event details
- `eventTeamsTableData: EventTeamsTableDataMap` - Event teams data
- `eventAmbassadors: EventAmbassadorMap` - Event Ambassadors
- `regionalAmbassadors: RegionalAmbassadorMap` - Regional Ambassadors

**Returns**: `void`

**Side Effects**:
- Wires up event handlers
- Sets up state synchronization
- Initializes accessibility features

**Errors**: None (errors handled internally)

---

## Type Definitions

```typescript
interface SelectionState {
  selectedEventShortName: string | null;
  selectedEventAmbassador: string | null;
  selectedRegionalAmbassador: string | null;
  highlightedEvents: Set<string>;
  activeTab: string | null;
}

type TableType = 'eventTeams' | 'eventAmbassadors' | 'regionalAmbassadors';
```

