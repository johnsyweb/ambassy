# Quickstart: Sortable Table Headers

**Feature**: Sortable Table Headers with Sticky Positioning  
**Date**: 2026-01-13

## Overview

All tables in Ambassy now support:
- **Clickable column headers** to sort data
- **Sticky headers** that remain visible when scrolling
- **Sensible default sort orders** for each table
- **Visual indicators** showing sort direction

## User Guide

### Sorting Tables

1. **Click any column header** to sort by that column
2. **Click the same header again** to reverse the sort order
3. **Click a different header** to sort by that column (ascending)

### Visual Indicators

- **↑** (up arrow) = Ascending sort
- **↓** (down arrow) = Descending sort
- No arrow = Column not currently sorted

### Keyboard Access

- **Tab** to navigate to column headers
- **Enter** or **Space** to sort by focused column
- Headers are fully accessible to screen readers

### Default Sort Orders

Each table opens with a sensible default sort:

- **Event Teams**: Sorted by Event Name (A-Z)
- **Event Ambassadors**: Sorted by Name (A-Z)
- **Regional Ambassadors**: Sorted by Name (A-Z)
- **Prospects**: Sorted by Prospect Event (A-Z)
- **Changes Log**: Sorted by Timestamp (newest first)
- **Issues**: Sorted by Event Name (A-Z)

## Developer Guide

### Adding Sorting to a New Table

1. **Ensure table has `<thead>` and `<tbody>` structure**
2. **Call `initializeTableSorting()` after populating table**:
   ```typescript
   import { initializeTableSorting } from './actions/tableSorting';
   
   populateMyTable(data);
   initializeTableSorting('myTable', 0, 'asc'); // tableId, defaultColumn, defaultDirection
   ```

3. **Add sticky header CSS** (already in `style.css` for all tables)

### Sorting Programmatically

```typescript
import { sortTable, getSortState } from './actions/tableSorting';

// Sort by column index 2 (ascending)
sortTable('eventTeamsTable', 2, 'text');

// Get current sort state
const state = getSortState('eventTeamsTable');
console.log(state?.sortColumn, state?.sortDirection);
```

### Custom Column Types

By default, column types are auto-detected. To specify a type:

```typescript
import { sortTable } from './actions/tableSorting';

// Force numeric sorting
sortTable('myTable', 1, 'number');

// Force date sorting
sortTable('myTable', 3, 'date');
```

## Architecture

### Core Components

1. **`tableSorting.ts`**: Main sorting functions and state management
2. **`sortComparators.ts`**: Data type-specific comparison functions
3. **`TableSortState.ts`**: Sort state model
4. **CSS**: Sticky positioning and visual indicator styles

### Integration Points

- **Table Population Functions**: Call `initializeTableSorting()` after populating
- **Row Selection**: Automatically preserved during sorting
- **Visual Updates**: Sort indicators updated automatically

## Testing

### Manual Testing Checklist

- [ ] Click column headers to sort
- [ ] Click same header to reverse sort
- [ ] Scroll long tables - headers remain visible
- [ ] Sort preserves row selection
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader announces sort state
- [ ] Default sorts applied on page load
- [ ] All 6 tables work correctly

### Automated Tests

Run unit tests:
```bash
npm test -- tableSorting
npm test -- sortComparators
npm test -- TableSortState
```

## Troubleshooting

**Headers not sticking?**
- Check CSS: `thead th { position: sticky; top: 0; }`
- Ensure parent container allows scrolling

**Sort not working?**
- Verify table has `<thead>` and `<tbody>`
- Check that `initializeTableSorting()` was called
- Check browser console for errors

**Selection lost after sort?**
- Selection should be preserved automatically
- Check that row has `data-*` attribute for identification

**Wrong data type detected?**
- Column type is auto-detected from cell content
- Can manually specify type: `sortTable(tableId, columnIndex, 'number')`
