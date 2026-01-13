# Research: Table-Map Navigation Integration

## Research Questions & Decisions

### RQ-001: Leaflet Marker Highlighting Patterns

**Question**: What is the best approach for highlighting markers in Leaflet?

**Research Findings**:
- Leaflet markers can be styled dynamically via `setStyle()` method
- Multiple approaches: change existing marker style, add to separate highlight layer, use icon overlays
- Performance: Style changes are efficient, separate layers allow easy show/hide

**Decision**: Use separate highlight layer (`L.layerGroup`) for highlighted markers
- Allows easy clearing of highlights
- Doesn't modify original markers (can restore easily)
- Better performance (can show/hide entire layer)
- Supports multiple highlight styles

**Alternatives Considered**:
- Modifying existing marker style: Rejected - harder to restore, requires tracking original styles
- Icon overlays: Rejected - more complex, potential z-index issues

**Rationale**: Separate layer provides clean separation, easy management, and good performance.

---

### RQ-002: Leaflet Map Centering/Zooming Patterns

**Question**: How to center map on single point vs multiple points?

**Research Findings**:
- Single point: `map.setView(latLng, zoomLevel)` - simple, direct
- Multiple points: `map.fitBounds(bounds)` - calculates optimal zoom to show all points
- Leaflet supports smooth animations via `{animate: true}` option
- Can calculate bounds from array of LatLng points

**Decision**: 
- Single event: Use `map.setView()` with fixed zoom level (e.g., 12)
- Multiple events: Use `map.fitBounds()` with padding to show all highlighted events
- Enable smooth animations for better UX

**Alternatives Considered**:
- Always use fitBounds: Rejected - single event would zoom out too far
- Fixed zoom for multiple: Rejected - might not show all events

**Rationale**: Hybrid approach provides best UX - close view for single event, optimal view for multiple.

---

### RQ-003: Table Row Selection Patterns

**Question**: Best practices for table row selection with keyboard navigation?

**Research Findings**:
- Standard pattern: Add/remove CSS class for selected state
- Keyboard: Arrow keys navigate rows, Enter selects
- ARIA: Use `aria-selected="true"` attribute
- Focus management: Move focus to selected row

**Decision**: 
- Use CSS class `.selected` for visual highlighting
- Add `aria-selected` attribute for accessibility
- Support arrow keys (up/down) for navigation
- Enter key selects row
- Tab key moves focus between tables/map

**Alternatives Considered**:
- Inline styles: Rejected - harder to maintain, less performant
- Data attributes only: Rejected - need visual feedback

**Rationale**: CSS classes provide maintainable styling, ARIA attributes ensure accessibility.

---

### RQ-004: Bidirectional State Synchronization

**Question**: How to keep table and map state synchronized?

**Research Findings**:
- Event-driven: Table selection fires event, map listens and updates
- Centralized state: Single source of truth, both read from it
- Observer pattern: State object notifies subscribers of changes

**Decision**: Centralized selection state object with event-driven updates
- Single `SelectionState` object holds current selections
- Tables update state when row selected
- Map listens to state changes and updates highlights
- Map updates state when marker clicked
- Tables listen to state changes and update highlights

**Alternatives Considered**:
- Direct function calls: Rejected - tight coupling, harder to test
- Global events only: Rejected - harder to query current state

**Rationale**: Centralized state provides single source of truth while event-driven updates maintain loose coupling.

---

### RQ-005: Accessibility for Map-Table Navigation

**Question**: ARIA patterns for map markers and table navigation?

**Research Findings**:
- Map markers: Use `role="button"`, `aria-label` for event name
- Table rows: Use `aria-selected`, `role="row"`, `tabindex` for keyboard navigation
- Screen reader announcements: Use `aria-live` regions for selection changes
- Focus management: Move focus when selection changes programmatically

**Decision**:
- Map markers: Add `role="button"`, `aria-label="Event: {name}"`, `tabindex="0"`
- Table rows: Add `role="row"`, `aria-selected`, `tabindex="0"` for keyboard navigation
- Selection announcements: Use `aria-live="polite"` region for announcements
- Focus: Move focus to selected row/marker when selection changes

**Alternatives Considered**:
- No ARIA: Rejected - inaccessible to screen reader users
- Custom roles: Rejected - standard roles are better supported

**Rationale**: Standard ARIA patterns ensure compatibility with assistive technologies.

---

### RQ-006: Performance with Large Datasets

**Question**: Leaflet performance with 1000+ markers?

**Research Findings**:
- Leaflet handles 1000+ markers efficiently
- Highlight layer with subset of markers is performant
- Style updates are batched by Leaflet internally
- No need for marker clustering for highlighting use case

**Decision**: 
- Store all markers in main layer
- Create separate highlight layer for highlighted markers
- Clone markers for highlight layer (or use style changes)
- Batch highlight updates (clear all, then add new)

**Alternatives Considered**:
- Marker clustering: Rejected - not needed, adds complexity
- Virtual scrolling: Rejected - not applicable to map view

**Rationale**: Leaflet's performance is sufficient, separate highlight layer provides clean separation.

---

## Technology Choices

### Leaflet Marker Highlighting
- **Choice**: Separate `L.layerGroup` for highlights
- **Rationale**: Clean separation, easy management, good performance

### Map Centering
- **Choice**: `setView()` for single, `fitBounds()` for multiple
- **Rationale**: Optimal UX for both scenarios

### State Management
- **Choice**: Centralized `SelectionState` object
- **Rationale**: Single source of truth, easy to query and update

### Visual Highlighting
- **Choice**: CSS classes for tables, separate layer for map
- **Rationale**: Maintainable, performant, accessible

## Open Questions Resolved

All research questions have been answered. No remaining unknowns.

## References

- Leaflet Documentation: https://leafletjs.com/reference.html
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- Web Accessibility Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

