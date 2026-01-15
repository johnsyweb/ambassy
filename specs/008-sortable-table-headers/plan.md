# Implementation Plan: Sortable Table Headers with Sticky Positioning

**Branch**: `008-sortable-table-headers` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-sortable-table-headers/spec.md`

## Summary

Implement sortable columns and sticky headers for all tables in the Ambassy application. Users can click column headers to sort data, with visual indicators showing sort state. Headers remain visible when scrolling through long tables. Each table has sensible default sort orders that present the most relevant data first.

**Technical Approach**: Create a reusable table sorting utility that handles different data types (text, numbers, dates, booleans), integrates with existing table population functions, preserves row selection state during sorting, and uses CSS `position: sticky` for header positioning.

## Technical Context

**Language/Version**: TypeScript (strict mode), ES2020+  
**Primary Dependencies**: DOM APIs, existing table population functions  
**Storage**: No new storage required (sort state is ephemeral, resets on refresh)  
**Testing**: Jest for unit tests, manual testing for UI interactions  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single-page web application  
**Performance Goals**: Sort operations complete in <100ms for tables with 500+ rows  
**Constraints**: Must preserve existing row selection functionality, must work with existing table styling, must be keyboard accessible  
**Scale/Scope**: 6 tables (Event Teams, Event Ambassadors, Regional Ambassadors, Prospects, Changes Log, Issues), each with 5-13 columns, potentially hundreds of rows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Single Responsibility**: Each function handles one concern (sorting, sticky positioning, visual indicators)
- ✅ **Test Coverage**: All sorting logic and utilities must have unit tests
- ✅ **Accessibility**: Sortable headers must be keyboard accessible (Enter/Space to sort)
- ✅ **Type Safety**: All sorting functions must be fully typed
- ✅ **Code Layout**: Follow existing patterns in `src/actions/` for table population
- ✅ **No Test Environment Checks**: Tests must test production code directly

## Project Structure

### Documentation (this feature)

```text
specs/008-sortable-table-headers/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── actions/
│   ├── populateEventTeamsTable.ts          # Modify: Add sorting support
│   ├── populateAmbassadorsTable.ts         # Modify: Add sorting support
│   ├── populateProspectsTable.ts           # Modify: Add sorting support
│   ├── populateChangesLogTable.ts          # Modify: Add sorting support
│   ├── populateIssuesTable.ts              # Modify: Add sorting support
│   └── tableSorting.ts                      # NEW: Core sorting utilities
├── models/
│   └── TableSortState.ts                    # NEW: Sort state model
└── utils/
    └── sortComparators.ts                   # NEW: Data type-specific comparators

public/
└── style.css                                # Modify: Add sticky header styles, sort indicator styles

tests/
└── src/
    ├── actions/
    │   ├── tableSorting.test.ts             # NEW: Unit tests for sorting
    │   └── sortComparators.test.ts          # NEW: Unit tests for comparators
    └── models/
        └── TableSortState.test.ts            # NEW: Unit tests for sort state
```

**Structure Decision**: Single project structure. New utilities in `src/actions/tableSorting.ts` and `src/utils/sortComparators.ts`. Sort state model in `src/models/TableSortState.ts`. Existing table population functions modified to integrate sorting. CSS updates in `public/style.css`.

## Complexity Tracking

> **No violations identified** - All functionality follows existing patterns and single responsibility principle.

## Phase 0: Research & Discovery

### Research Questions

1. **CSS Sticky Positioning**: How does `position: sticky` work with table headers? What are browser compatibility considerations?
2. **Sort Performance**: What's the most efficient way to sort DOM rows vs. sorting data and re-rendering?
3. **Selection Preservation**: How to preserve row selection (by data attribute) when rows are reordered?
4. **Accessibility**: What ARIA attributes and keyboard interactions are needed for sortable table headers?
5. **Visual Indicators**: What are best practices for showing sort direction (arrows, icons, text)?
6. **Data Type Detection**: How to reliably detect and sort different data types (text, numbers, dates, booleans) from DOM content?

### Research Tasks

- [ ] R001: Research CSS `position: sticky` for table headers, browser support, and edge cases
- [ ] R002: Research DOM sorting vs. data sorting performance implications
- [ ] R003: Research ARIA patterns for sortable table headers (aria-sort, aria-label)
- [ ] R004: Research visual indicator patterns (Unicode arrows, CSS icons, SVG)
- [ ] R005: Research data type detection strategies from table cell content
- [ ] R006: Research empty/null value handling in sort algorithms

### Key Findings (to be filled in Phase 0)

- CSS sticky positioning approach
- Sort algorithm selection
- Accessibility requirements
- Visual indicator approach
- Data type detection strategy

## Phase 1: Design & Contracts

### Data Model

**TableSortState** (new model):
- `tableId: string` - Unique identifier for the table
- `sortColumn: string | null` - Currently sorted column identifier
- `sortDirection: 'asc' | 'desc'` - Current sort direction
- `defaultColumn: string` - Default column to sort by
- `defaultDirection: 'asc' | 'desc'` - Default sort direction

**Default Sort Configurations**:
- Event Teams Table: Sort by "Event Name" (ascending)
- Event Ambassadors Table: Sort by "Name" (ascending)
- Regional Ambassadors Table: Sort by "Name" (ascending)
- Prospects Table: Sort by "Prospect Event" (ascending)
- Changes Log Table: Sort by "Timestamp" (descending - most recent first)
- Issues Table: Sort by "Event Name" (ascending)

### Core Functions

**Sorting Utilities** (`src/actions/tableSorting.ts`):
- `initializeTableSorting(tableId: string, defaultColumn: string, defaultDirection: 'asc' | 'desc'): void` - Set up sortable headers for a table
- `sortTable(tableId: string, columnIndex: number, columnType: 'text' | 'number' | 'date' | 'boolean'): void` - Sort table by column
- `applySortState(tableId: string, sortState: TableSortState): void` - Apply sort state to table
- `getSortState(tableId: string): TableSortState | null` - Get current sort state
- `resetToDefaultSort(tableId: string): void` - Reset table to default sort

**Comparators** (`src/utils/sortComparators.ts`):
- `compareText(a: string, b: string): number` - Locale-aware text comparison
- `compareNumbers(a: number, b: number): number` - Numeric comparison
- `compareDates(a: Date, b: Date): number` - Chronological comparison
- `compareBooleans(a: boolean, b: boolean): number` - Boolean comparison
- `detectColumnType(tableId: string, columnIndex: number): 'text' | 'number' | 'date' | 'boolean'` - Detect data type from sample cells

**Visual Indicators**:
- `updateSortIndicator(tableId: string, columnIndex: number, direction: 'asc' | 'desc' | null): void` - Update visual sort indicator
- `clearSortIndicators(tableId: string): void` - Clear all sort indicators

### Integration Points

**Table Population Functions** (modify existing):
- `populateEventTeamsTable()` - Add sort initialization after population
- `populateEventAmbassadorsTable()` - Add sort initialization after population
- `populateRegionalAmbassadorsTable()` - Add sort initialization after population
- `populateProspectsTable()` - Add sort initialization after population
- `populateChangesLogTable()` - Add sort initialization after population
- `populateIssuesTable()` - Add sort initialization after population

**Selection Preservation**:
- Modify sorting to preserve row selection by:
  1. Store selected row identifier before sort
  2. Reapply selection after sort completes
  3. Use existing `highlightTableRow()` functions

### CSS Changes

**Sticky Headers** (`public/style.css`):
- Add `position: sticky; top: 0;` to `thead th` elements
- Ensure proper z-index for headers above table body
- Handle background color to prevent content showing through

**Sort Indicators**:
- Add styles for sort indicator icons/arrows
- Add hover states for sortable headers
- Add focus states for keyboard navigation

### Contracts

See `contracts/table-sorting-contracts.md` (to be created in Phase 1) for detailed function contracts.

## Phase 2: Implementation

### Implementation Strategy

1. **Create Core Utilities First**: Build sorting utilities and comparators with comprehensive tests
2. **Implement Sticky Headers**: Add CSS for sticky positioning (independent of sorting)
3. **Integrate Sorting**: Modify each table population function to add sorting support
4. **Add Visual Indicators**: Implement sort direction indicators
5. **Preserve Selection**: Ensure row selection works correctly after sorting
6. **Test Integration**: Verify all tables work correctly with sorting and sticky headers

### Implementation Order

1. **Core Sorting Infrastructure** (P1)
   - Create `TableSortState` model
   - Create `sortComparators.ts` utilities
   - Create `tableSorting.ts` core functions
   - Write unit tests

2. **Sticky Headers** (P1)
   - Add CSS for sticky positioning
   - Test across different viewport sizes
   - Verify with multiple tables

3. **Table Integration** (P1)
   - Integrate sorting into Event Teams table
   - Integrate sorting into Event Ambassadors table
   - Integrate sorting into Regional Ambassadors table
   - Integrate sorting into Prospects table
   - Integrate sorting into Changes Log table
   - Integrate sorting into Issues table

4. **Visual Indicators** (P1)
   - Add sort direction indicators
   - Add hover/focus states
   - Ensure accessibility

5. **Selection Preservation** (P1)
   - Ensure selection preserved during sort
   - Test with all table types

6. **Default Sort Orders** (P2)
   - Configure default sorts for each table
   - Apply defaults on initial load

### Testing Strategy

**Unit Tests**:
- Sort comparators for each data type
- Sort state model
- Core sorting functions
- Edge cases (empty values, mixed types)

**Integration Tests**:
- Sort integration with each table
- Selection preservation during sort
- Default sort application

**Manual Testing**:
- Visual indicators
- Sticky header behavior
- Keyboard accessibility
- Performance with large tables (500+ rows)

## Dependencies

- Existing table HTML structure (already has `<thead>` and `<tbody>`)
- Existing table population functions
- Existing row selection functionality (`SelectionState`, `highlightTableRow()`)
- Existing CSS styling

## Risks & Mitigations

**Risk 1**: Performance degradation with large tables (500+ rows)
- **Mitigation**: Use efficient DOM manipulation, consider virtual scrolling if needed (out of scope for MVP)

**Risk 2**: Sticky headers conflict with existing CSS
- **Mitigation**: Test thoroughly, use specific selectors, ensure z-index is correct

**Risk 3**: Selection state lost during sort
- **Mitigation**: Store selection identifier before sort, reapply after sort completes

**Risk 4**: Data type detection fails for edge cases
- **Mitigation**: Provide fallback to text sorting, allow manual column type configuration if needed

## Success Metrics

- All 6 tables support sorting on all data columns
- Sort operations complete in <100ms for 500+ row tables
- Headers remain sticky when scrolling through long tables
- Row selection preserved during sorting
- Visual indicators clearly show sort state
- Keyboard accessible (Enter/Space to sort)
- All tests pass
