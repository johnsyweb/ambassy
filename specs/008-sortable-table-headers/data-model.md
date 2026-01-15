# Data Model: Sortable Table Headers

**Feature**: Sortable Table Headers with Sticky Positioning  
**Date**: 2026-01-13  
**Phase**: 1 - Design & Contracts

## Overview

This feature adds sorting and sticky header functionality to tables. The data model is minimal - primarily ephemeral UI state for tracking sort configuration and current sort state.

## Core Entities

### TableSortState

Tracks the current sort state for a table, including default configuration.

**Location**: `src/models/TableSortState.ts`

**Fields**:
```typescript
interface TableSortState {
  tableId: string;                    // Unique table identifier (e.g., "eventTeamsTable")
  sortColumn: string | null;          // Currently sorted column identifier (column index or name)
  sortDirection: 'asc' | 'desc';     // Current sort direction
  defaultColumn: string;              // Default column to sort by
  defaultDirection: 'asc' | 'desc';  // Default sort direction
}
```

**State Transitions**:
- `initializeSorting(tableId, defaultColumn, defaultDirection)` → Creates initial state with defaults
- `sortByColumn(tableId, columnIndex)` → Updates `sortColumn` and toggles `sortDirection` if same column
- `resetToDefault(tableId)` → Resets to `defaultColumn` and `defaultDirection`

**Validation Rules**:
- `tableId` must match an existing table in the DOM
- `sortColumn` must be a valid column index for the table
- `defaultColumn` must be a valid column index for the table

### Default Sort Configuration

Defines sensible default sort orders for each table type.

**Storage**: Hard-coded in table initialization functions

**Configurations**:
```typescript
const DEFAULT_SORTS = {
  eventTeamsTable: { column: 2, direction: 'asc' },        // Event Name
  eventAmbassadorsTable: { column: 0, direction: 'asc' },   // Name
  regionalAmbassadorsTable: { column: 0, direction: 'asc' }, // Name
  prospectsTable: { column: 0, direction: 'asc' },         // Prospect Event
  changesTable: { column: 4, direction: 'desc' },          // Timestamp (most recent first)
  issuesTable: { column: 0, direction: 'asc' },              // Event Name
};
```

## Extended Entities

### Column Type Detection

Tracks detected data type for each column to use appropriate comparator.

**Storage**: Ephemeral, detected on-demand during sorting

**Types**:
- `'text'` - Default, uses locale-aware string comparison
- `'number'` - Numeric comparison
- `'date'` - Chronological comparison
- `'boolean'` - Boolean comparison (checkmarks, yes/no)

**Detection Logic**:
1. Sample first 5-10 non-empty cells in column
2. Try parsing as number, date, boolean
3. If majority match a type, use that type
4. Fallback to text if ambiguous

## Relationships

```
TableSortState
  └── tableId → HTMLTableElement (via document.querySelector)

Column Type Detection
  └── (tableId, columnIndex) → ColumnType (ephemeral, detected on-demand)
```

## State Management Flow

1. **Table Initialized** → Create `TableSortState` with defaults → Apply default sort
2. **User Clicks Header** → Update `TableSortState` → Sort table → Update visual indicators
3. **Table Refreshed** → Reset to default sort (unless user has manually sorted)
4. **User Sorts Different Column** → Update `sortColumn` → Set `sortDirection` to 'asc' → Sort table

## Data Flow

```
User Clicks Header
  ↓
Update TableSortState
  ↓
Detect Column Type (if not cached)
  ↓
Sort Table Rows (DOM reordering)
  ↓
Update Visual Indicators
  ↓
Preserve Row Selection (if any)
```

## Persistence

**No persistence required** - Sort state is ephemeral UI state that resets on page refresh. Users can re-sort as needed.

## Validation

- Table ID must exist in DOM
- Column index must be valid for table
- Sort direction must be 'asc' or 'desc'
- Default configuration must be valid

## Edge Cases

- Empty table (no sorting needed)
- Single row table (sorting has no effect)
- All cells empty in column (fallback to text sorting)
- Mixed data types in column (fallback to text sorting)
- Table refreshed while sorted (reset to default or preserve user sort - decision: reset to default)
