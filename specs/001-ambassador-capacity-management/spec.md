# Feature Specification: Ambassador Capacity Management and Lifecycle

**Feature Branch**: `001-ambassador-capacity-management`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "Ambassadors are volunteers with lives outside of parkrun. Ambassadors will come and go. We need to be able to easily onboard and offboard both regional and event ambassadors. When an ambassdor leaves or changes roles, we'd prefer to allocate their events to existing ambassadors with capacity. By capacity, I mean that we prefer for Event ambassadors to support between 2 and 9 events. Any more than this should be flagged. We prefer Regional event ambassadors to support between three and 10 event ambassadors. More than this should be flagged. These limits should be configurable settings."

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

As a Regional Event Ambassador, I want to remove an ambassador from the system and automatically suggest reallocation of their events to ambassadors with available capacity, so that events continue to be supported when ambassadors leave or change roles.

**Why this priority**: Offboarding is a critical workflow that happens regularly as volunteers move on. Without reallocation suggestions, users must manually identify suitable recipients, which is time-consuming and error-prone.

**Independent Test**: Can be fully tested by removing an Event Ambassador with assigned events, verifying the system suggests reallocation to ambassadors with capacity, and confirming events can be reallocated. This delivers value by streamlining the offboarding process and ensuring events remain supported.

**Acceptance Scenarios**:

1. **Given** an Event Ambassador supports 3 events and there are other Event Ambassadors with capacity, **When** the user offboards the ambassador, **Then** the system suggests reallocating the 3 events to ambassadors with available capacity
2. **Given** a Regional Ambassador supports 5 Event Ambassadors and there are other Regional Ambassadors with capacity, **When** the user offboards the Regional Ambassador, **Then** the system suggests reallocating the 5 Event Ambassadors to Regional Ambassadors with available capacity
3. **Given** an ambassador is offboarded and events are reallocated, **When** the user confirms the reallocation, **Then** the events are moved to the new ambassador and the old ambassador is removed
4. **Given** there are no ambassadors with available capacity for reallocation, **When** the user attempts to offboard an ambassador, **Then** the system warns that reallocation may exceed capacity limits
5. **Given** an ambassador is offboarded, **When** the reallocation is complete, **Then** the changes are logged in the changes log

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
- **Reallocation Suggestion**: A recommendation to move events or Event Ambassadors from one ambassador to another, prioritised by recipient capacity availability.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can onboard a new Event Ambassador in under 30 seconds (from action initiation to confirmation)
- **SC-002**: Users can onboard a new Regional Ambassador in under 30 seconds (from action initiation to confirmation)
- **SC-003**: System correctly identifies capacity status (within/under/over) for 100% of ambassadors based on current allocations
- **SC-004**: Capacity status is visible to users within 1 second of viewing ambassador information
- **SC-005**: Users can offboard an Event Ambassador and receive reallocation suggestions in under 2 minutes
- **SC-006**: Users can offboard a Regional Ambassador and receive reallocation suggestions in under 2 minutes
- **SC-007**: Reallocation suggestions prioritise ambassadors with available capacity (within preferred limits) 100% of the time when such ambassadors exist
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

## Dependencies

- Existing Event Ambassador data structure (`EventAmbassador` interface with `name` and `events` fields)
- Existing Regional Ambassador data structure (`RegionalAmbassador` interface with `name`, `state`, and `supportsEAs` fields)
- Existing changes log functionality (`LogEntry` interface and logging infrastructure)
- Existing data persistence (localStorage for state management)
- Existing UI components for displaying ambassador information

## Out of Scope

- Automatic reallocation without user confirmation (system only suggests, user decides)
- Per-ambassador custom capacity limits (limits are global per ambassador type)
- Historical capacity tracking or capacity trends over time
- Capacity forecasting or predictive analytics
- Integration with external systems for ambassador data
- Bulk onboarding/offboarding operations (handled one at a time)
- Role changes (e.g., Event Ambassador becoming Regional Ambassador) - treated as offboard + onboard
