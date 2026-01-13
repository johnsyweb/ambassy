# Table-Map Navigation Integration

## Summary

Enable bidirectional navigation between tables and map view. When a user selects a row in any table, the corresponding events should be highlighted and centered on the map. When a user selects an event on the map, the corresponding table row should be highlighted if that tab is visible.

**Scope**: This feature applies only to live events from the Event Teams table. Prospective events are handled separately in other features.

## Clarifications

### Session 2026-01-08

- Q: Should "events" in table-map navigation include prospective events, or only live events from Event Teams table? → A: Only live events from Event Teams table (current scope)
- Q: What visual treatment should be used for highlighted rows/markers? → A: Background color change + border (e.g., light blue background, darker border)
- Q: What should happen when selecting a different row while one is already selected? → A: Automatically deselect previous row, select new row (standard behavior)
- Q: What threshold should be used for "large datasets" in performance testing? → A: 200 events
- Q: What text should be announced for screen reader announcements? → A: "Selected [event/ambassador name], [X] events highlighted on map"

## User Stories

### US1: Event Teams Table → Map Navigation
**As a** user  
**I want** to select a row in the Event Teams table  
**So that** the corresponding event is highlighted and centered on the map

**Acceptance Criteria:**
- Clicking a row in the Event Teams table highlights the corresponding event marker on the map
- The map viewport centers on the selected event
- The selected table row is visually highlighted
- Keyboard navigation (arrow keys, Enter) also triggers map navigation

### US2: Map → Event Teams Table Navigation
**As a** user  
**I want** to click an event marker on the map  
**So that** the corresponding row in the Event Teams table is highlighted (if the table tab is visible)

**Acceptance Criteria:**
- Clicking an event marker on the map highlights the corresponding row in the Event Teams table
- If the Event Teams table tab is not visible, no action is taken
- The table scrolls to show the highlighted row if it's not currently visible
- Keyboard navigation on the map also triggers table highlighting

### US3: Event Ambassador Table → Map Navigation
**As a** user  
**I want** to select a row in the Event Ambassador table  
**So that** all events assigned to that ambassador are highlighted and centered on the map

**Acceptance Criteria:**
- Clicking a row in the Event Ambassador table highlights all events assigned to that ambassador
- The map viewport centers/zooms to show all highlighted events
- The selected table row is visually highlighted
- Keyboard navigation also triggers map navigation

### US4: Regional Ambassador Table → Map Navigation
**As a** user  
**I want** to select a row in the Regional Ambassador table  
**So that** all events assigned to Event Ambassadors supported by that Regional Ambassador are highlighted and centered on the map

**Acceptance Criteria:**
- Clicking a row in the Regional Ambassador table highlights all events assigned to supported Event Ambassadors
- The map viewport centers/zooms to show all highlighted events
- The selected table row is visually highlighted
- Keyboard navigation also triggers map navigation

## Functional Requirements

### FR-001: Table Row Selection
- Tables must support row selection via mouse click
- Tables must support row selection via keyboard (arrow keys + Enter)
- Selected row must be visually distinct using background color change and border (e.g., light blue background with darker border)
- Only one row can be selected at a time per table
- When a new row is selected, the previously selected row is automatically deselected

### FR-002: Map Event Highlighting
- Map must support highlighting individual event markers
- Map must support highlighting multiple event markers simultaneously
- Highlighted markers must be visually distinct from normal markers using background color change and border (e.g., light blue background with darker border)
- Map must support centering viewport on a single event
- Map must support centering/zooming viewport to show multiple events

### FR-003: Map Event Selection
- Map event markers must be clickable
- Clicking an event marker must trigger table row highlighting
- Keyboard navigation on map must also trigger table highlighting

### FR-004: Bidirectional Synchronization
- Table selection must update map state
- Map selection must update table state
- Changes must be synchronized in real-time
- State must persist during tab switches

### FR-005: Tab Visibility Awareness
- Map → Table navigation only occurs if target table tab is visible
- If tab is not visible, selection state is stored but not displayed
- When tab becomes visible, stored selection is applied

## Technical Requirements

### TR-001: Event Identification
- Events must have unique identifiers that link table rows to map markers
- Event short name must be used as the primary identifier
- Only live events from the Event Teams table are included in navigation (prospective events are excluded)

### TR-002: Performance
- Selection changes must update UI within 100ms
- Map centering/zooming must be smooth (animated)
- Multiple event highlighting must not cause performance degradation

### TR-003: Accessibility
- All selection interactions must be keyboard accessible
- Screen reader announcements for selection changes must announce: "Selected [event/ambassador name], [X] events highlighted on map"
- Focus management when switching between table and map

## Non-Functional Requirements

### NFR-001: User Experience
- Visual feedback must be immediate and clear
- Map animations must be smooth and not jarring
- Table scrolling to show selected row must be smooth

### NFR-002: Browser Compatibility
- Must work in all supported browsers (Chrome, Firefox, Safari, Edge)
- Must work with keyboard-only navigation
- Must work with screen readers

## Edge Cases

### EC-001: No Events
- If an Event Ambassador has no events, map shows no highlights
- If a Regional Ambassador supports no Event Ambassadors with events, map shows no highlights

### EC-002: Events Outside Viewport
- Map must zoom/pan to show selected events even if initially outside viewport
- If multiple events are selected, map must zoom to show all of them

### EC-003: Multiple Tables
- Only the active/visible table selection affects the map
- Map selection only affects the relevant table (Event Teams for event markers)

### EC-004: Map Not Loaded
- If map is not initialized, table selection is stored but map update is deferred
- When map becomes available, stored selection is applied

## Success Criteria

- Users can navigate from any table to the map view
- Users can navigate from the map to the Event Teams table
- Visual feedback is clear and immediate
- All interactions are keyboard accessible
- Performance is smooth with datasets up to 200 events

