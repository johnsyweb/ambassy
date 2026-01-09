# Quick Start: Table-Map Navigation Integration

## Overview

This feature enables bidirectional navigation between tables and map view. Users can select rows in tables to highlight and center events on the map, and click map markers to highlight corresponding table rows.

## Key Concepts

1. **Selection State**: Centralized state object tracks current selections
2. **Bidirectional Sync**: Table selections update map, map selections update tables
3. **Tab Awareness**: Map → Table navigation only works if target table tab is visible
4. **Accessibility**: Full keyboard navigation and screen reader support

## Architecture

```
User Interaction
  ↓
Selection State Update
  ↓
UI Update (Table/Map)
  ↓
Visual Feedback
```

## Key Files

- `src/models/SelectionState.ts` - Selection state model
- `src/actions/tableMapNavigation.ts` - Navigation coordination logic
- `src/actions/populateMap.ts` - Extended with marker storage and highlighting
- `src/actions/populateEventTeamsTable.ts` - Extended with row selection
- `src/actions/populateAmbassadorsTable.ts` - Extended with row selection
- `src/utils/mapNavigation.ts` - Map centering/zooming utilities

## Usage Flow

### Table → Map Navigation

1. User clicks row in Event Teams table
2. `selectEventTeamRow()` updates selection state
3. `highlightEventsOnMap()` highlights marker
4. `centerMapOnEvents()` centers map on event

### Map → Table Navigation

1. User clicks event marker on map
2. `selectMapEvent()` updates selection state
3. `highlightTableRow()` highlights row (if tab visible)
4. `scrollToTableRow()` scrolls table to show row

### Event Ambassador → Map

1. User clicks row in EA table
2. `selectEventAmbassadorRow()` updates selection state
3. Finds all events for that EA
4. Highlights all events on map
5. Centers map to show all events

### Regional Ambassador → Map

1. User clicks row in REA table
2. `selectRegionalAmbassadorRow()` updates selection state
3. Finds all events for supported EAs
4. Highlights all events on map
5. Centers map to show all events

## Integration Points

### In `populateMap.ts`

```typescript
// Store marker references
const markerMap = new Map<string, L.CircleMarker>();

// Create highlight layer
const highlightLayer = L.layerGroup();

// When creating markers:
markerMap.set(eventShortName, marker);
marker.on('click', () => onMapMarkerClick(eventShortName));
```

### In `populateEventTeamsTable.ts`

```typescript
// Add selection handlers
row.addEventListener('click', () => onTableRowClick(eventShortName, 'eventTeams'));
row.setAttribute('tabindex', '0');
row.addEventListener('keydown', (e) => onTableRowKeyDown(e, eventShortName, 'eventTeams'));
```

### In `index.ts`

```typescript
// Initialize navigation
const selectionState = createSelectionState();
initializeTableMapNavigation(
  selectionState,
  markerMap,
  highlightLayer,
  map,
  eventDetails,
  eventTeamsTableData,
  eventAmbassadors,
  regionalAmbassadors
);
```

## Testing Strategy

1. **Unit Tests**: Test selection state updates, highlighting logic
2. **Integration Tests**: Test table → map and map → table navigation
3. **Accessibility Tests**: Test keyboard navigation, screen reader compatibility
4. **Performance Tests**: Test with 1000+ events

## Common Patterns

### Highlighting a Single Event

```typescript
selectEventTeamRow(selectionState, 'event-name', eventTeamsTableData);
highlightEventsOnMap(['event-name'], markerMap, highlightLayer);
centerMapOnEvents(['event-name'], eventDetails, map);
```

### Highlighting Multiple Events

```typescript
selectEventAmbassadorRow(selectionState, 'EA Name', eventAmbassadors, eventTeamsTableData);
const eventNames = Array.from(selectionState.highlightedEvents);
highlightEventsOnMap(eventNames, markerMap, highlightLayer);
centerMapOnEvents(eventNames, eventDetails, map);
```

### Clearing Selection

```typescript
clearSelection(selectionState);
clearMapHighlights(highlightLayer);
clearTableHighlights('eventTeamsTable');
```

## Accessibility Considerations

- All interactions keyboard accessible
- ARIA attributes for screen readers
- Focus management when selection changes
- Announcements for selection changes

## Performance Considerations

- Batch highlight updates
- Use separate highlight layer for easy clearing
- Debounce rapid selection changes if needed
- Test with large datasets (1000+ events)

