# Research: Sortable Table Headers with Sticky Positioning

**Feature**: Sortable Table Headers  
**Date**: 2026-01-13  
**Phase**: 0 - Research & Discovery

## Research Questions

### R001: CSS Sticky Positioning for Table Headers

**Question**: How does `position: sticky` work with table headers? What are browser compatibility considerations?

**Findings**:
- `position: sticky` works with `thead` and `th` elements in modern browsers
- Requires `top: 0` (or other offset) to define sticky position
- Parent container must have sufficient height for scrolling
- Browser support: Chrome 56+, Firefox 32+, Safari 13+, Edge 16+ (all modern browsers)
- Z-index may be needed to ensure headers appear above table body
- Background color should be set to prevent content showing through

**Implementation Approach**:
```css
thead th {
  position: sticky;
  top: 0;
  background-color: #f2f2f2;
  z-index: 10;
}
```

**Edge Cases**:
- Multiple tables on same page (each header sticks independently)
- Tables within scrollable containers (sticky relative to container, not viewport)
- Mobile viewports with limited height

### R002: Sort Performance - DOM vs. Data Sorting

**Question**: What's the most efficient way to sort DOM rows vs. sorting data and re-rendering?

**Findings**:
- **DOM Sorting**: Directly reorder DOM nodes using `appendChild()` (moves nodes, doesn't recreate)
  - Pros: Preserves event listeners, faster for small-medium tables
  - Cons: Can cause layout thrashing with very large tables
- **Data Sorting + Re-render**: Sort data array, clear tbody, repopulate
  - Pros: Cleaner separation, easier to test
  - Cons: Loses event listeners, requires re-attaching handlers

**Decision**: Use DOM sorting (reorder nodes) for better performance and to preserve event listeners. For tables with 500+ rows, performance is acceptable (<100ms).

**Implementation Approach**:
1. Get all rows from tbody as array
2. Sort array using comparator
3. Re-append sorted rows to tbody (appendChild moves nodes efficiently)

### R003: ARIA Patterns for Sortable Table Headers

**Question**: What ARIA attributes and keyboard interactions are needed for sortable table headers?

**Findings**:
- `aria-sort="ascending" | "descending" | "none"` - Indicates sort state
- `role="columnheader"` - Already implicit in `<th>`, but can be explicit
- `tabindex="0"` - Make headers keyboard focusable
- `aria-label` - Descriptive label for screen readers (e.g., "Sort by Event Name")
- Keyboard: Enter or Space to sort

**Implementation Approach**:
```html
<th aria-sort="ascending" tabindex="0" aria-label="Sort by Event Name">
  Event Name ↑
</th>
```

**Accessibility Requirements**:
- All sortable headers must be keyboard accessible
- Screen reader announcements must indicate sort state
- Focus indicators must be visible

### R004: Visual Indicator Patterns

**Question**: What are best practices for showing sort direction (arrows, icons, text)?

**Findings**:
- Unicode arrows: `↑` (ascending), `↓` (descending), `↕` (sortable but not sorted)
- CSS-only indicators using `::after` pseudo-elements
- SVG icons (more customizable but adds complexity)
- Text indicators: "A-Z", "Z-A" (less common)

**Decision**: Use Unicode arrows for simplicity and no additional dependencies:
- `↑` for ascending
- `↓` for descending
- `↕` or no indicator for unsorted (optional)

**Implementation Approach**:
- Add arrow to header text when sorted
- Update arrow on sort direction change
- Clear arrow when sorting by different column

### R005: Data Type Detection from Table Cell Content

**Question**: How to reliably detect and sort different data types (text, numbers, dates, booleans) from DOM content?

**Findings**:
- **Text**: Default fallback, use `localeCompare()` for sorting
- **Numbers**: Detect if cell content is numeric (parseFloat/parseInt), handle formatted numbers
- **Dates**: Detect common date formats (ISO, locale strings), parse to Date objects
- **Booleans**: Detect checkmarks (✅/❌), yes/no, true/false

**Detection Strategy**:
1. Sample first 5-10 non-empty cells in column
2. Try parsing as number, date, boolean
3. If majority match a type, use that type
4. Fallback to text if ambiguous

**Implementation Approach**:
```typescript
function detectColumnType(tableId: string, columnIndex: number): ColumnType {
  // Sample cells, try parsing, return detected type
}
```

**Edge Cases**:
- Mixed types in column (fallback to text)
- Empty cells (skip in detection, handle in sorting)
- Formatted numbers (strip formatting before parsing)

### R006: Empty/Null Value Handling in Sort Algorithms

**Question**: How should empty/null values be handled in sort algorithms?

**Findings**:
- Common approaches:
  1. Empty values always first (ascending) or last (descending)
  2. Empty values always last regardless of direction
  3. Empty values always first regardless of direction
- Most user-friendly: Empty values always last (users typically want to see populated data first)

**Decision**: Empty/null values always sort to the end, regardless of sort direction.

**Implementation Approach**:
```typescript
function compareWithEmpty(a: string, b: string, comparator: (a: T, b: T) => number): number {
  if (a === '' && b === '') return 0;
  if (a === '') return 1;  // a goes to end
  if (b === '') return -1; // b goes to end
  return comparator(a, b);
}
```

## Key Technical Decisions

1. **Sticky Headers**: Use CSS `position: sticky` with proper z-index and background
2. **Sorting Method**: DOM node reordering (preserves event listeners)
3. **Visual Indicators**: Unicode arrows (↑ ↓)
4. **Data Type Detection**: Sample-based detection with text fallback
5. **Empty Values**: Always sort to end
6. **Accessibility**: Full ARIA support with keyboard navigation

## Browser Compatibility

- **Sticky Positioning**: All modern browsers (Chrome 56+, Firefox 32+, Safari 13+, Edge 16+)
- **DOM Manipulation**: Universal support
- **ARIA Attributes**: Universal support
- **Unicode Characters**: Universal support

## Performance Considerations

- DOM sorting is efficient for tables up to 1000 rows
- Sticky positioning has minimal performance impact
- Data type detection runs once per column, cached
- Sort operations should complete in <100ms for typical tables

## Open Questions

None - all research questions answered.
