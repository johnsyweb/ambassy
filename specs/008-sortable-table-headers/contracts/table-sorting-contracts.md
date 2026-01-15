# Contracts: Table Sorting

**Feature**: Sortable Table Headers  
**Date**: 2026-01-13  
**Phase**: 1 - Design & Contracts

## Core Sorting Functions

### `initializeTableSorting(tableId: string, defaultColumn: number, defaultDirection: 'asc' | 'desc'): void`

Initializes sortable headers for a table and applies default sort.

**Parameters**:
- `tableId` (string, required): DOM ID of the table (e.g., "eventTeamsTable")
- `defaultColumn` (number, required): Zero-based column index for default sort
- `defaultDirection` ('asc' | 'desc', required): Default sort direction

**Returns**: `void`

**Throws**:
- `Error` if table with `tableId` not found in DOM
- `Error` if `defaultColumn` is invalid for table

**Side Effects**:
- Makes all data column headers clickable (excludes action columns)
- Adds keyboard event listeners to headers
- Applies default sort to table
- Updates visual sort indicators

**Preconditions**:
- Table must exist in DOM with `<thead>` and `<tbody>` structure
- Table must have been populated with data

**Postconditions**:
- All sortable column headers are interactive
- Table is sorted by default column in default direction
- Visual indicators show default sort state

**Usage**: Call once after populating a table.

---

### `sortTable(tableId: string, columnIndex: number, columnType?: 'text' | 'number' | 'date' | 'boolean'): void`

Sorts a table by the specified column.

**Parameters**:
- `tableId` (string, required): DOM ID of the table
- `columnIndex` (number, required): Zero-based column index to sort by
- `columnType` ('text' | 'number' | 'date' | 'boolean', optional): Data type for sorting. If omitted, auto-detected.

**Returns**: `void`

**Throws**:
- `Error` if table not found
- `Error` if `columnIndex` is invalid

**Side Effects**:
- Reorders table rows in DOM
- Updates `TableSortState` for the table
- Updates visual sort indicators
- Preserves row selection state

**Preconditions**:
- Table must exist and be initialized for sorting
- `columnIndex` must be valid for table

**Postconditions**:
- Table rows are sorted by specified column
- Sort state is updated
- Visual indicators reflect sort state

**Behavior**:
- If clicking same column: toggles sort direction (asc ↔ desc)
- If clicking different column: sorts ascending by new column
- Empty/null values always sort to end

**Usage**: Called automatically on header click, or can be called programmatically.

---

### `getSortState(tableId: string): TableSortState | null`

Gets the current sort state for a table.

**Parameters**:
- `tableId` (string, required): DOM ID of the table

**Returns**: `TableSortState | null` - Current sort state, or `null` if table not initialized

**Throws**: Never throws

**Side Effects**: None (read-only)

**Preconditions**: None

**Postconditions**: Returns current sort state or null

---

### `resetToDefaultSort(tableId: string): void`

Resets a table to its default sort order.

**Parameters**:
- `tableId` (string, required): DOM ID of the table

**Returns**: `void`

**Throws**:
- `Error` if table not found or not initialized

**Side Effects**:
- Sorts table by default column in default direction
- Updates sort state
- Updates visual indicators

**Preconditions**:
- Table must be initialized for sorting

**Postconditions**:
- Table is sorted by default column
- Sort state reflects default configuration

---

## Comparator Functions

### `compareText(a: string, b: string): number`

Compares two text values using locale-aware comparison.

**Parameters**:
- `a` (string): First value
- `b` (string): Second value

**Returns**: `number` - Negative if `a < b`, positive if `a > b`, 0 if equal

**Throws**: Never throws

**Side Effects**: None

**Implementation**: Uses `String.prototype.localeCompare()`

---

### `compareNumbers(a: number, b: number): number`

Compares two numeric values.

**Parameters**:
- `a` (number): First value
- `b` (number): Second value

**Returns**: `number` - Negative if `a < b`, positive if `a > b`, 0 if equal

**Throws**: Never throws

**Side Effects**: None

**Implementation**: Direct numeric comparison (`a - b`)

---

### `compareDates(a: Date, b: Date): number`

Compares two date values chronologically.

**Parameters**:
- `a` (Date): First date
- `b` (Date): Second date

**Returns**: `number` - Negative if `a < b`, positive if `a > b`, 0 if equal

**Throws**: Never throws

**Side Effects**: None

**Implementation**: Uses `Date.getTime()` for comparison

---

### `compareBooleans(a: boolean, b: boolean): number`

Compares two boolean values (false < true).

**Parameters**:
- `a` (boolean): First value
- `b` (boolean): Second value

**Returns**: `number` - Negative if `a < b`, positive if `a > b`, 0 if equal

**Throws**: Never throws

**Side Effects**: None

---

### `detectColumnType(tableId: string, columnIndex: number): 'text' | 'number' | 'date' | 'boolean'`

Detects the data type of a table column by sampling cell content.

**Parameters**:
- `tableId` (string, required): DOM ID of the table
- `columnIndex` (number, required): Zero-based column index

**Returns**: `'text' | 'number' | 'date' | 'boolean'` - Detected type, defaults to 'text' if ambiguous

**Throws**: Never throws (returns 'text' on error)

**Side Effects**: None (read-only)

**Preconditions**:
- Table must exist and have data rows

**Postconditions**: Returns detected type based on sample cells

**Detection Logic**:
1. Sample first 5-10 non-empty cells
2. Try parsing as number, date, boolean
3. If majority match a type, return that type
4. Otherwise return 'text'

---

## Visual Indicator Functions

### `updateSortIndicator(tableId: string, columnIndex: number, direction: 'asc' | 'desc' | null): void`

Updates the visual sort indicator for a column header.

**Parameters**:
- `tableId` (string, required): DOM ID of the table
- `columnIndex` (number, required): Zero-based column index
- `direction` ('asc' | 'desc' | null, required): Sort direction, or `null` to clear indicator

**Returns**: `void`

**Throws**: Never throws (fails silently if elements not found)

**Side Effects**:
- Adds/removes sort indicator (arrow) in column header
- Updates ARIA `aria-sort` attribute

**Preconditions**: None (fails silently if elements not found)

**Postconditions**: Visual indicator reflects sort state

---

### `clearSortIndicators(tableId: string): void`

Clears all sort indicators from a table's headers.

**Parameters**:
- `tableId` (string, required): DOM ID of the table

**Returns**: `void`

**Throws**: Never throws

**Side Effects**:
- Removes all sort indicators
- Resets all `aria-sort` attributes to "none"

**Preconditions**: None

**Postconditions**: No visual indicators remain

---

## Integration Contracts

### Table Population Functions

All table population functions must:

1. **After populating table**, call `initializeTableSorting()` with appropriate defaults
2. **Preserve existing functionality** (row selection, click handlers, etc.)
3. **Handle empty tables** gracefully (no sorting needed)

**Example**:
```typescript
export function populateMyTable(data: MyData[]): void {
  // ... existing population logic ...
  
  // Initialize sorting after population
  initializeTableSorting('myTable', 0, 'asc');
}
```

### Row Selection Preservation

Sorting must preserve row selection by:

1. **Before sorting**: Store selected row identifier (from `data-*` attribute)
2. **After sorting**: Reapply selection using existing `highlightTableRow()` functions
3. **Handle edge cases**: Selection may not exist after sort (e.g., filtered out)

**Contract**: Selection state is preserved if the selected row still exists after sorting.

---

## Error Handling

All functions handle errors gracefully:

- **Missing DOM elements**: Fail silently or log warning (non-critical)
- **Invalid parameters**: Throw descriptive `Error`
- **Type detection failures**: Fallback to text sorting
- **Sort failures**: Log error, leave table unsorted

## Accessibility Contracts

All sortable headers must:

- Have `aria-sort` attribute indicating sort state
- Be keyboard focusable (`tabindex="0"`)
- Have descriptive `aria-label` (e.g., "Sort by Event Name")
- Respond to Enter and Space keys
- Have visible focus indicators
- Announce sort state to screen readers
