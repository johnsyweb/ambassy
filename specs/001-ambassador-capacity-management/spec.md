# Feature Specification: Ambassador Capacity Management and Lifecycle

**Feature Branch**: `001-ambassador-capacity-management`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "Ambassadors are volunteers with lives outside of parkrun. Ambassadors will come and go. We need to be able to easily onboard and offboard both regional and event ambassadors. When an ambassdor leaves or changes roles, we'd prefer to allocate their events to existing ambassadors with capacity. By capacity, I mean that we prefer for Event ambassadors to support between 2 and 9 events. Any more than this should be flagged. We prefer Regional event ambassadors to support between three and 10 event ambassadors. More than this should be flagged. These limits should be configurable settings."

## Clarifications

### Session 2026-01-07

- Q: Landowner extraction: Pattern matching from EventLocation field is probably not possible. Let's remove this as a requirement for now. → A: Landowner extraction requirement removed. Landowner grouping is no longer part of allocation principles. System will focus on capacity, region, geographic proximity, and conflict avoidance.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Onboard New Ambassadors (Priority: P1)

As a Regional Event Ambassador, I want to add new Event Ambassadors and Regional Ambassadors to the system, so that I can manage the growing volunteer network and assign events to new ambassadors.

**Why this priority**: Onboarding is foundational - new ambassadors must be added before they can be assigned events or checked for capacity. This enables the basic workflow of managing the ambassador network.

**Independent Test**: Can be fully tested by adding a new Event Ambassador or Regional Ambassador to the system, verifying they appear in the data, and confirming they can be assigned events. This delivers value by enabling the system to grow and adapt as new volunteers join.

**Acceptance Scenarios**:

1. **Given** a user wants to add a new Event Ambassador, **When** the user provides the ambassador's name, **Then** the Event Ambassador is added to the system with an empty events list
2. **Given** a user wants to add a new Regional Ambassador, **When** the user provides the ambassador's name and state, **Then** the Regional Ambassador is added to the system with an empty supportsEAs list
3. **Given** a new ambassador has been added, **When** the user views the ambassador list, **Then** the new ambassador appears in the appropriate list (Event Ambassadors or Regional Ambassadors)

---

### User Story 2 - Capacity Checking and Flagging (Priority: P2)

As a Regional Event Ambassador, I want to see which ambassadors are within capacity limits and which are over capacity, so that I can make informed decisions about event allocation and identify ambassadors who may need support.

**Why this priority**: Capacity checking is essential for making good allocation decisions during offboarding and ongoing management. Without this visibility, users cannot make informed decisions about reallocation.

**Independent Test**: Can be fully tested by checking ambassadors' current allocations against capacity limits, verifying correct identification of those within limits, at limits, and over limits. This delivers value by providing visibility into workload distribution and identifying potential issues.

**Acceptance Scenarios**:

1. **Given** an Event Ambassador supports 5 events, **When** the system checks capacity (preferred range 2-9), **Then** the ambassador is marked as within capacity
2. **Given** an Event Ambassador supports 10 events, **When** the system checks capacity (preferred range 2-9), **Then** the ambassador is flagged as over capacity
3. **Given** a Regional Ambassador supports 8 Event Ambassadors, **When** the system checks capacity (preferred range 3-10), **Then** the ambassador is marked as within capacity
4. **Given** a Regional Ambassador supports 12 Event Ambassadors, **When** the system checks capacity (preferred range 3-10), **Then** the ambassador is flagged as over capacity
5. **Given** an Event Ambassador supports 1 event, **When** the system checks capacity (preferred range 2-9), **Then** the ambassador is flagged as under capacity
6. **Given** capacity limits are configured, **When** the system displays ambassador information, **Then** capacity status (within/under/over) is clearly visible

---

### User Story 3 - Offboard Ambassadors with Event Reallocation (Priority: P3)

As a Regional Event Ambassador, I want to remove an ambassador from the system and automatically suggest reallocation of their events to ambassadors with available capacity, following allocation principles (regional alignment, geographic proximity, conflict avoidance, environmental considerations), so that events continue to be supported appropriately when ambassadors leave or change roles.

**Why this priority**: Offboarding is a critical workflow that happens regularly as volunteers move on. Without intelligent reallocation suggestions that consider organisational principles, users must manually identify suitable recipients, which is time-consuming and error-prone.

**Independent Test**: Can be fully tested by removing an Event Ambassador with assigned events, verifying the system suggests reallocation to ambassadors considering capacity, region, proximity, and conflicts, and confirming events can be reallocated. This delivers value by streamlining the offboarding process while ensuring events are allocated according to organisational principles.

**Acceptance Scenarios**:

1. **Given** an Event Ambassador supports 3 events and there are other Event Ambassadors with capacity, **When** the user offboards the ambassador, **Then** the system suggests reallocating the 3 events to ambassadors with available capacity, prioritising those in the same region, with nearby events, and avoiding conflicts of interest
2. **Given** events are geographically close, **When** the system suggests reallocation, **Then** those events are prioritised for allocation to Event Ambassadors already supporting nearby events
4. **Given** a Regional Ambassador supports 5 Event Ambassadors and there are other Regional Ambassadors with capacity, **When** the user offboards the Regional Ambassador, **Then** the system suggests reallocating the 5 Event Ambassadors to Regional Ambassadors with available capacity, prioritising those in the same region
5. **Given** an ambassador is offboarded and events are reallocated, **When** the user confirms the reallocation, **Then** the events are moved to the new ambassador and the old ambassador is removed
6. **Given** there are no ambassadors with available capacity for reallocation, **When** the user attempts to offboard an ambassador, **Then** the system warns that reallocation may exceed capacity limits but still provides suggestions
7. **Given** reallocation suggestions cannot perfectly satisfy all principles (e.g., capacity vs proximity), **When** the system presents suggestions, **Then** the system prioritises pragmatically and allows users to override suggestions
8. **Given** an ambassador is offboarded, **When** the reallocation is complete, **Then** the changes are logged in the changes log
9. **Given** Victoria is divided into three regions, **When** events are displayed or reallocated, **Then** it is clear which region each event belongs to
10. **Given** the map shows event locations, **When** reallocation suggestions are made, **Then** the map informs but does not dictate allocations (geographic proximity is a factor but not the only factor)

---

### User Story 4 - Configurable Capacity Limits (Priority: P4)

As a Regional Event Ambassador, I want to configure the preferred capacity ranges for Event Ambassadors and Regional Ambassadors, so that the system reflects our current organisational preferences and can adapt as policies change.

**Why this priority**: Configurable limits provide flexibility as organisational needs evolve. While important, this can be implemented after the core capacity checking functionality is in place.

**Independent Test**: Can be fully tested by changing capacity limit settings, verifying the new limits are saved, and confirming capacity checks use the updated limits. This delivers value by allowing the system to adapt to changing organisational needs without code changes.

**Acceptance Scenarios**:

1. **Given** a user wants to change Event Ambassador capacity limits, **When** the user sets minimum to 3 and maximum to 8, **Then** the new limits are saved and used for capacity checking
2. **Given** a user wants to change Regional Ambassador capacity limits, **When** the user sets minimum to 4 and maximum to 12, **Then** the new limits are saved and used for capacity checking
3. **Given** capacity limits have been configured, **When** the user restarts the application, **Then** the configured limits are preserved and still in effect
4. **Given** a user sets invalid capacity limits (e.g., minimum greater than maximum), **When** the user attempts to save, **Then** the system displays an error and prevents saving invalid limits

---

### Edge Cases

- What happens when offboarding an ambassador who has no assigned events/EAs? The ambassador should be removed without reallocation prompts
- How does the system handle offboarding when all remaining ambassadors are already at or over capacity? System should warn but allow offboarding with manual reallocation
- What happens if capacity limits are set to 0 or negative values? System should validate and reject invalid limits
- How does the system handle duplicate ambassador names during onboarding? System should prevent duplicates or require unique identifiers
- What happens when reallocating events would push a recipient ambassador over capacity? System should warn but allow the reallocation if user confirms
- How does the system handle partial reallocation (some events to one ambassador, others to another)? System should support distributing events across multiple ambassadors
- What happens when an Event Ambassador is offboarded but their events are not reallocated? Events should remain unassigned or be flagged for manual assignment
- What happens when geographic proximity conflicts with other principles (e.g., capacity)? System should balance principles pragmatically, allowing user override
- How does the system handle conflicts of interest when no conflict-free ambassadors are available? System should flag conflicts but allow user to proceed if they confirm
- What happens when events span multiple regions or regions are not clearly defined? System should still provide suggestions, flagging ambiguity for user review
- How does the system handle events that are prospects (not yet started) with limited location data? System should use available data and flag limitations

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to add new Event Ambassadors with a name
- **FR-002**: System MUST allow users to add new Regional Ambassadors with a name and state
- **FR-003**: System MUST prevent duplicate ambassador names (Event Ambassadors and Regional Ambassadors must have unique names within their respective types)
- **FR-004**: System MUST calculate Event Ambassador capacity based on the number of events they support
- **FR-005**: System MUST calculate Regional Ambassador capacity based on the number of Event Ambassadors they support
- **FR-006**: System MUST flag Event Ambassadors as under capacity when they support fewer events than the minimum preferred limit
- **FR-007**: System MUST flag Event Ambassadors as over capacity when they support more events than the maximum preferred limit
- **FR-008**: System MUST flag Regional Ambassadors as under capacity when they support fewer Event Ambassadors than the minimum preferred limit
- **FR-009**: System MUST flag Regional Ambassadors as over capacity when they support more Event Ambassadors than the maximum preferred limit
- **FR-010**: System MUST display capacity status (within/under/over) for all ambassadors
- **FR-011**: System MUST allow users to remove (offboard) Event Ambassadors from the system
- **FR-012**: System MUST allow users to remove (offboard) Regional Ambassadors from the system
- **FR-013**: System MUST suggest reallocation of events when offboarding an Event Ambassador
- **FR-014**: System MUST suggest reallocation of Event Ambassadors when offboarding a Regional Ambassador
- **FR-015**: System MUST prioritise reallocation suggestions to ambassadors with available capacity (within preferred limits)
- **FR-016**: System MUST warn users when reallocation would push recipients over capacity limits
- **FR-023**: System MUST identify and display which region (of three Victoria regions) each event belongs to
- **FR-025**: System MUST prioritise reallocating events to Event Ambassadors already supporting geographically nearby events
- **FR-026**: System MUST prioritise reallocating Event Ambassadors to Regional Ambassadors in the same region where possible
- **FR-027**: System MUST consider and flag potential conflicts of interest in reallocation suggestions
- **FR-028**: System MUST use geographic proximity (map data) to inform but not dictate reallocation suggestions
- **FR-029**: System MUST allow users to override reallocation suggestions when pragmatic trade-offs are needed
- **FR-030**: System MUST balance multiple allocation principles (capacity, region, proximity, conflicts) when generating suggestions
- **FR-017**: System MUST allow users to configure minimum and maximum capacity limits for Event Ambassadors
- **FR-018**: System MUST allow users to configure minimum and maximum capacity limits for Regional Ambassadors
- **FR-019**: System MUST persist configured capacity limits across application sessions
- **FR-020**: System MUST validate capacity limit configuration (minimum must be less than or equal to maximum, both must be positive integers)
- **FR-021**: System MUST log all onboarding and offboarding actions in the changes log
- **FR-022**: System MUST support reallocating events to multiple Event Ambassadors (distributing events across several ambassadors)

### Key Entities *(include if feature involves data)*

- **Event Ambassador**: Represents a volunteer who supports multiple parkrun events. Has a name and a list of events they support. Capacity is measured by the number of events supported.
- **Regional Ambassador**: Represents a volunteer who supports multiple Event Ambassadors. Has a name, state, and a list of Event Ambassadors they support. Capacity is measured by the number of Event Ambassadors supported.
- **Capacity Limits**: Configuration settings that define preferred ranges for ambassador capacity. Includes minimum and maximum values for both Event Ambassadors and Regional Ambassadors.
- **Capacity Status**: Indicates whether an ambassador is within preferred limits, under capacity, or over capacity based on current allocations and configured limits.
- **Reallocation Suggestion**: A recommendation to move events or Event Ambassadors from one ambassador to another, prioritised by multiple factors including capacity availability, regional alignment, geographic proximity, and conflict avoidance.
- **Region**: One of three regions that Victoria is divided into. Events and ambassadors belong to regions, which should be clearly identifiable.
- **Conflict of Interest**: A situation where an ambassador's personal or professional relationships could create bias or inappropriate influence in their ambassador role. Must be considered in all allocations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can onboard a new Event Ambassador in under 30 seconds (from action initiation to confirmation)
- **SC-002**: Users can onboard a new Regional Ambassador in under 30 seconds (from action initiation to confirmation)
- **SC-003**: System correctly identifies capacity status (within/under/over) for 100% of ambassadors based on current allocations
- **SC-004**: Capacity status is visible to users within 1 second of viewing ambassador information
- **SC-005**: Users can offboard an Event Ambassador and receive reallocation suggestions in under 2 minutes
- **SC-006**: Users can offboard a Regional Ambassador and receive reallocation suggestions in under 2 minutes
- **SC-007**: Reallocation suggestions prioritise ambassadors with available capacity (within preferred limits) 100% of the time when such ambassadors exist
- **SC-012**: Reallocation suggestions consider regional alignment, geographic proximity, and conflict avoidance in addition to capacity 100% of the time
- **SC-013**: Reallocation suggestions prioritise geographically nearby events for Event Ambassadors already supporting nearby events at least 70% of the time when such ambassadors have capacity
- **SC-008**: Users can configure capacity limits in under 1 minute
- **SC-009**: Configured capacity limits persist across application sessions 100% of the time
- **SC-010**: System prevents invalid capacity limit configurations (minimum > maximum, negative values) 100% of the time
- **SC-011**: All onboarding and offboarding actions are logged in the changes log within 5 seconds of completion

## Assumptions

- Ambassadors have unique names within their type (Event Ambassador names are unique, Regional Ambassador names are unique, but an Event Ambassador and Regional Ambassador could share the same name)
- Capacity limits are positive integers (no fractional or negative values)
- When offboarding, users want suggestions but may choose to manually reallocate or leave events unassigned
- Capacity checking is based on current allocations only (does not consider future planned changes)
- Reallocation suggestions are recommendations that users can accept, modify, or reject
- Capacity limits apply globally to all ambassadors of the same type (not per-ambassador custom limits)
- The system will warn but allow reallocation that exceeds capacity limits if the user confirms
- Victoria is divided into three regions, and events can be assigned to regions (region information may be derived from event location or explicitly assigned)
- Events have geographic coordinates (latitude/longitude) available from event data, which can be used to calculate proximity
- Conflicts of interest information may need to be manually tracked or flagged by users (system may not have automatic conflict detection)
- Geographic proximity is calculated using event coordinates, but proximity is one factor among many and should not override other important principles
- When allocation principles conflict (e.g., capacity vs proximity), the system should balance pragmatically and allow user override - "don't let perfect get in the way of better"
- The map provides visual context but allocations are ultimately user decisions informed by multiple factors

## Dependencies

- Existing Event Ambassador data structure (`EventAmbassador` interface with `name` and `events` fields)
- Existing Regional Ambassador data structure (`RegionalAmbassador` interface with `name`, `state`, and `supportsEAs` fields)
- Existing changes log functionality (`LogEntry` interface and logging infrastructure)
- Existing data persistence (localStorage for state management)
- Existing UI components for displaying ambassador information
- Existing event geographic data (`EventDetails` interface with `geometry.coordinates` for latitude/longitude)
- Existing map functionality for visualising event locations and geographic relationships

## Out of Scope

- Automatic reallocation without user confirmation (system only suggests, user decides)
- Per-ambassador custom capacity limits (limits are global per ambassador type)
- Historical capacity tracking or capacity trends over time
- Capacity forecasting or predictive analytics
- Integration with external systems for ambassador data
- Bulk onboarding/offboarding operations (handled one at a time)
- Role changes (e.g., Event Ambassador becoming Regional Ambassador) - treated as offboard + onboard
- Automatic conflict of interest detection (conflicts must be manually flagged or tracked)
- Automatic region assignment based on geography (regions may be manually assigned or derived from existing data)
- Landowner grouping or identification (not part of allocation principles)
- Enforcing perfect adherence to all principles (system suggests pragmatically, user makes final decisions)
