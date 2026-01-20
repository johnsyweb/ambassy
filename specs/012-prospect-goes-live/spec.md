# Feature Specification: Prospect Goes Live

**Feature Branch**: `012-prospect-goes-live`  
**Created**: 2026-01-18  
**Status**: Draft  
**Input**: User description: "From time to time, a prospect will become an actual parkrun event (go live). We need a way for REAs to mark a prospect as having transitioned to a live event, remove it from the prospects list, and optionally allocate it to an Event Ambassador if it wasn't already allocated. This marks the end of the prospect lifecycle."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark Prospect as Live Event (Priority: P1)

A Regional Event Ambassador (REA) needs to mark a prospect as having become an actual parkrun event. When a prospect goes live, it should be removed from the prospects list, and if the prospect already has an assigned Event Ambassador, that EA's allocation count should be updated (removing the prospect from their prospectiveEvents count and optionally adding it to their live events if the event exists in the system).

**Why this priority**: This is the core functionality - without this, REAs cannot track the completion of the prospect lifecycle. It enables proper cleanup of prospect data and maintains accurate EA allocation counts.

**Independent Test**: Can be fully tested by selecting a prospect from the prospects table, marking it as "gone live", and verifying it is removed from the prospects list and EA allocation counts are updated appropriately. This delivers immediate value by completing the prospect lifecycle.

**Acceptance Scenarios**:

1. **Given** an REA is viewing the Prospects table, **When** they click a "Mark as Live" or "Goes Live" action button for a prospect, **Then** a confirmation dialog appears asking them to confirm the transition
2. **Given** a prospect has an assigned Event Ambassador, **When** the REA confirms marking it as live, **Then** the prospect is removed from the prospects list and the EA's prospectiveEvents count is decremented
3. **Given** a prospect has been marked as live, **When** the REA views the Event Ambassadors table, **Then** the EA's allocation count no longer includes that prospect
4. **Given** a prospect has been marked as live, **When** the REA views the map, **Then** the prospect marker is removed from the map
5. **Given** a prospect has been marked as live, **When** the REA views the changes log, **Then** an entry is recorded indicating the prospect transitioned to a live event

---

### User Story 2 - Allocate Event When Prospect Goes Live (Priority: P2)

If a prospect goes live and the corresponding event already exists in the system's event details (from the parkrun events.json), the system should allow the REA to optionally allocate that event to an Event Ambassador during the "goes live" process.

**Why this priority**: When a prospect becomes a real event, it may already exist in the parkrun events data. Allowing allocation during the transition creates a smooth workflow, but the core value is completing the prospect lifecycle (P1).

**Independent Test**: Can be tested by marking a prospect as live where the event name matches an existing event in eventDetails, and verifying the system offers to allocate the event to an EA.

**Acceptance Scenarios**:

1. **Given** a prospect is being marked as live and the event name matches an existing event in eventDetails, **When** the REA confirms the transition, **Then** the system offers to allocate the event to an Event Ambassador (suggesting the prospect's assigned EA if one exists)
2. **Given** the system offers to allocate an event when a prospect goes live, **When** the REA selects an EA (or chooses to leave unallocated), **Then** the event is allocated according to the selection and the prospect is removed from prospects
3. **Given** a prospect without an assigned EA goes live and the event exists in eventDetails, **When** the REA confirms the transition, **Then** the system allows allocation of the event to any EA or leaving it unallocated

---

### User Story 3 - Handle Prospect Without Existing Event (Priority: P2)

When a prospect goes live but the corresponding event does not yet exist in the system's event details (e.g., it's not yet in parkrun's events.json), the system should still allow marking it as live and simply remove it from prospects without requiring event allocation.

**Why this priority**: Not all prospects that go live will immediately appear in parkrun's events data. The system should handle this gracefully, allowing REAs to mark prospects as live even when the event isn't in the system yet.

**Independent Test**: Can be tested by marking a prospect as live where no matching event exists in eventDetails, and verifying the prospect is removed without requiring event allocation.

**Acceptance Scenarios**:

1. **Given** a prospect is being marked as live and no matching event exists in eventDetails, **When** the REA confirms the transition, **Then** the prospect is removed from the prospects list without requiring event allocation
2. **Given** a prospect without a matching event goes live, **When** the transition is confirmed, **Then** the EA's prospectiveEvents count is updated (if the prospect had an assigned EA) and the prospect is removed

---

### Edge Cases

- What happens when marking a prospect as live that has no assigned Event Ambassador? → System should allow the transition and simply remove the prospect
- How does the system match prospect names to existing events? → System should use fuzzy matching or exact matching to find events with similar names
- What happens if a prospect name matches multiple events? → System should allow REA to select which event (if any) or proceed without allocation
- What happens if a prospect's assigned EA no longer exists in the system? → System should handle gracefully, remove prospect, and log a warning
- How does the system handle prospects that were created manually vs. imported from CSV? → All prospects should be handled the same way regardless of source
- What happens if a prospect has no coordinates (geocoding never succeeded)? → System should still allow marking as live, removing the prospect
- Should the system allow undoing a "goes live" transition? → Consider read-only log entry vs. reversible operation (needs clarification)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a way for REAs to mark a prospect as having gone live (e.g., "Mark as Live" or "Goes Live" button/action in Prospects table)
- **FR-002**: System MUST display a confirmation dialog when marking a prospect as live to prevent accidental transitions
- **FR-003**: System MUST remove the prospect from the Prospects table immediately after confirming the transition
- **FR-004**: System MUST remove the prospect from the assigned Event Ambassador's prospectiveEvents array when the prospect goes live
- **FR-005**: System MUST update EA allocation counts after removing a prospect (decrement prospectiveEvents count)
- **FR-006**: System MUST remove the prospect marker from the map after it goes live
- **FR-007**: System MUST log the transition in the changes log with appropriate details (prospect name, date transitioned, assigned EA if any)
- **FR-008**: System MUST check if a matching event exists in eventDetails when a prospect goes live (by prospect name or similar matching)
- **FR-009**: System MUST offer to allocate the matching event to an Event Ambassador if one exists when a prospect goes live
- **FR-010**: System MUST suggest the prospect's assigned EA as the default allocation if one exists and the event is being allocated
- **FR-011**: System MUST allow REAs to select a different EA or leave the event unallocated when allocating during "goes live"
- **FR-012**: System MUST handle cases where no matching event exists in eventDetails (allow transition without event allocation)
- **FR-013**: System MUST handle cases where a prospect has no assigned EA (allow transition without EA allocation update)
- **FR-014**: System MUST validate that the prospect exists before allowing the transition
- **FR-015**: System MUST persist all changes (prospect removal, EA allocation updates, event allocation if applicable) immediately after confirmation

### Key Entities *(include if feature involves data)*

- **ProspectiveEvent**: The prospect being transitioned - will be removed from the prospects list
- **EventAmbassador**: If the prospect had an assigned EA, their prospectiveEvents array will be updated (prospect ID removed)
- **EventDetails**: May contain a matching event that can be allocated during the transition
- **EventTeam**: If a matching event exists and is allocated, the EventTeam may need to be updated

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: REAs can mark a prospect as gone live in under 30 seconds (including confirmation)
- **SC-002**: System correctly updates EA allocation counts after prospect goes live (prospectiveEvents count decremented, live events count incremented if event allocated)
- **SC-003**: 100% of prospects marked as live are removed from the prospects list and no longer appear on the map
- **SC-004**: All "goes live" transitions are logged in the changes log with complete details for audit trail
- **SC-005**: System handles edge cases gracefully (missing EA, no matching event, etc.) without errors or data corruption

## Assumptions

- Prospects that go live may or may not have a corresponding event in eventDetails (event may not be in parkrun's events.json yet)
- REAs know when a prospect has become a live event
- Matching prospect names to existing events may require fuzzy matching or manual selection if multiple matches exist
- Prospects can go live without being allocated to an event in the system
- The "goes live" action is irreversible (prospects cannot be restored after marking as live) - needs confirmation

## Dependencies

- Existing prospect management infrastructure (ProspectiveEventList, persistProspectiveEvents)
- Existing EA allocation management (EventAmbassadorMap, assignEventToAmbassador)
- Existing event allocation infrastructure (EventDetailsMap, EventTeamMap)
- Existing change logging (LogEntry, changes log)
- Event name matching capabilities (may need fuzzy matching if not already available)

## Out of Scope

- Creating new event entries in eventDetails when a prospect goes live (assumes events are managed separately via parkrun's events.json)
- Undoing a "goes live" transition (once marked as live, prospect is permanently removed)
- Bulk operations (marking multiple prospects as live at once)
- Automatic detection of when prospects go live (manual action required)
