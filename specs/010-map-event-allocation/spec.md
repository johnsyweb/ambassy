# Feature Specification: Map Event Allocation

**Feature Branch**: `010-map-event-allocation`  
**Created**: 2026-01-15  
**Status**: Draft  
**Input**: User description: "We need to be able to select an event without an EA allocation from the map and allocate them an EA (and by hierarchy, an REA). If Event Directors are known, this should be displayued in the table, along with all other information and the map view updated."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Allocate Event Ambassador from Map (Priority: P1)

As an ambassador coordinator, I want to select an unallocated event from the map and assign it to an Event Ambassador, so that I can efficiently manage event allocations directly from the geographic view.

**Why this priority**: This is the core functionality that enables the primary workflow of allocating events from the map interface. Without this, users cannot complete the main task.

**Independent Test**: Can be fully tested by clicking an unallocated event marker on the map, selecting an Event Ambassador from a dialog, and verifying the event is assigned. This delivers immediate value by enabling event allocation from the map view.

**Acceptance Scenarios**:

1. **Given** an event exists in the system without an Event Ambassador allocation, **When** I click the event marker on the map, **Then** I can see event details and initiate EA allocation
2. **Given** I have clicked an unallocated event marker, **When** I select an Event Ambassador from the allocation dialog, **Then** the event is assigned to that EA and the system automatically determines the supporting Regional Ambassador based on the EA's hierarchy
3. **Given** I have allocated an event to an EA, **When** the allocation completes, **Then** the change is logged in the changes log with appropriate details
4. **Given** I click an unallocated event marker, **When** I cancel the allocation dialog, **Then** no changes are made and I return to the map view

---

### User Story 2 - Display Event Information in Table (Priority: P2)

As an ambassador coordinator, I want to see complete event information including Event Directors in the Event Teams table, so that I have full context about each event when making allocation decisions.

**Why this priority**: Displaying Event Directors and other event information provides essential context for allocation decisions. This enhances the user experience but is secondary to the core allocation functionality.

**Independent Test**: Can be fully tested by verifying that events with known Event Directors display this information in the Event Teams table, along with coordinates, series, and country information. This delivers value by providing complete event context.

**Acceptance Scenarios**:

1. **Given** an event has Event Directors recorded in the system, **When** the event is displayed in the Event Teams table, **Then** the Event Directors are shown in the Event Director(s) column
2. **Given** an event has no Event Directors recorded, **When** the event is displayed in the Event Teams table, **Then** the Event Director(s) column shows "N/A" or equivalent placeholder
3. **Given** an event is allocated from the map, **When** it appears in the Event Teams table, **Then** all available event information (name, coordinates, series, country, Event Directors) is displayed
4. **Given** an event has Event Directors, **When** I view the event on the map, **Then** the tooltip displays Event Directors along with other event information

---

### User Story 3 - Update Map View After Allocation (Priority: P3)

As an ambassador coordinator, I want the map view to update immediately after allocating an event, so that I can see the visual confirmation of the allocation and the event's new appearance on the map.

**Why this priority**: Visual feedback enhances user confidence and provides immediate confirmation of successful allocation. This is important for user experience but the allocation itself (P1) is more critical.

**Independent Test**: Can be fully tested by allocating an event from the map and verifying that the event marker updates its appearance (size, color) to reflect the new EA allocation, and that the event appears in Voronoi polygons if applicable. This delivers value through immediate visual confirmation.

**Acceptance Scenarios**:

1. **Given** I have allocated an event to an Event Ambassador, **When** the allocation completes, **Then** the event marker on the map updates to show the EA's assigned color and larger size
2. **Given** an event has been allocated, **When** I view the map, **Then** the event tooltip displays the assigned EA and supporting REA
3. **Given** an event has been allocated, **When** the map refreshes, **Then** the event is included in Voronoi polygon calculations if applicable
4. **Given** I have allocated an event, **When** I view the Event Teams table, **Then** the event row is highlighted or scrolled into view to show the new allocation

---

### Edge Cases

- What happens when an unallocated event is clicked but no Event Ambassadors exist in the system?
- How does the system handle clicking an unallocated event that has Event Directors but no EA allocation?
- What happens if the selected EA is later offboarded or transitioned to REA after allocation?
- How does the system handle events that exist in eventDetails but have no corresponding EventTeam data?
- What happens when multiple users try to allocate the same unallocated event simultaneously?
- How does the system handle events with missing or invalid coordinate data?
- What happens when an event is allocated but the selected EA's supporting REA cannot be determined?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to click event markers on the map that represent events without Event Ambassador allocation
- **FR-002**: System MUST display event details (name, coordinates, series, country) when an unallocated event is selected from the map
- **FR-003**: System MUST provide a dialog or interface for selecting an Event Ambassador when allocating an unallocated event from the map
- **FR-004**: System MUST automatically determine and assign the supporting Regional Ambassador based on the selected Event Ambassador's hierarchy when allocating an event
- **FR-005**: System MUST log all event allocations in the changes log with appropriate details (event name, assigned EA, supporting REA)
- **FR-006**: System MUST display Event Directors in the Event Teams table when this information is available for an event
- **FR-007**: System MUST display "N/A" or equivalent placeholder in the Event Director(s) column when Event Directors are not known
- **FR-008**: System MUST display all available event information (name, coordinates, series, country, Event Directors, EA, REA) in the Event Teams table for allocated events
- **FR-009**: System MUST update the map view immediately after event allocation to reflect the new EA assignment (marker color, size, tooltip)
- **FR-010**: System MUST include newly allocated events in Voronoi polygon calculations if applicable
- **FR-011**: System MUST prevent allocation of events that already have an Event Ambassador assigned
- **FR-012**: System MUST handle cases where no Event Ambassadors exist in the system by displaying an appropriate message
- **FR-013**: System MUST validate that the selected Event Ambassador exists before completing allocation
- **FR-014**: System MUST update the Event Teams table to include newly allocated events with all available information
- **FR-015**: System MUST display Event Directors in map tooltips when this information is available

### Key Entities *(include if feature involves data)*

- **Unallocated Event**: An event that exists in the eventDetails collection but has no corresponding entry in eventTeamsTableData, meaning it has no assigned Event Ambassador
- **Event Allocation**: The assignment of an event to an Event Ambassador, which automatically establishes the supporting Regional Ambassador relationship through the EA's hierarchy
- **Event Directors**: Information about event directors stored in the EventTeam model, displayed as a comma-separated list in the Event Teams table
- **Event Information**: Complete event details including name, coordinates (formatted), series ID, country code, country name, Event Directors, assigned EA, and supporting REA

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can allocate an unallocated event to an Event Ambassador from the map in under 30 seconds from clicking the event marker to completing allocation
- **SC-002**: 100% of successfully allocated events display complete information (EA, REA, Event Directors if known, coordinates, series, country) in the Event Teams table
- **SC-003**: Map view updates to reflect new allocations within 1 second of allocation completion
- **SC-004**: 95% of users can successfully allocate an event from the map on their first attempt without requiring assistance
- **SC-005**: All event allocations from the map are logged in the changes log with complete details (event name, assigned EA, supporting REA, timestamp)
- **SC-006**: Events with known Event Directors display this information in both the Event Teams table and map tooltips 100% of the time

## Assumptions

- Events without EA allocation are identified by their absence from eventTeamsTableData while existing in eventDetails
- Event Directors information is stored in the EventTeam model and may be available even for unallocated events if EventTeam data exists
- The system uses the existing `assignEventToAmbassador` function or similar mechanism for allocation
- Map markers for unallocated events are visually distinct (smaller size, default color) to indicate their unallocated status
- The allocation dialog will reuse existing patterns from the codebase (similar to reallocation dialogs)
- Regional Ambassador assignment is automatic based on which REA supports the selected EA
- The Event Teams table already has columns for all required information (Event Directors, coordinates, series, country)

## Dependencies

- Existing map functionality (`populateMap`, marker click handlers)
- Event Ambassador and Regional Ambassador data structures
- Event allocation functionality (`assignEventToAmbassador`)
- Event Teams table display (`populateEventTeamsTable`)
- Changes log system for tracking allocations
- EventTeam and EventDetails data models

## Out of Scope

- Creating new Event Ambassadors or Regional Ambassadors from the map interface (this must be done through existing onboarding flows)
- Bulk allocation of multiple events at once
- Editing event details (name, coordinates, etc.) from the map interface
- Reallocating events that already have EA assignments (this remains in the Event Teams table reallocation flow)
- Automatic suggestion of EA assignments based on geographic proximity or other heuristics (manual selection required)
