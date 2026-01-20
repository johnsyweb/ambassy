# Feature Specification: End of Prospect Lifecycle

**Feature Branch**: `012-prospect-goes-live`  
**Created**: 2026-01-18  
**Status**: Draft  
**Input**: User description: "From time to time, a prospect will become an actual parkrun event (go live). We need a way for REAs to mark a prospect as having transitioned to a live event, remove it from the prospects list, and optionally allocate it to an Event Ambassador if it wasn't already allocated. This marks the end of the prospect lifecycle."

**Clarification**: There are two ways for a prospect to finish:
1. **Launch**: When a prospect transitions to a live event. In most cases, this will mean getting an entry in the events.json file with a similar name and a similar location (except for closed events such as those in custodial or military locations).
2. **Archive**: When a prospect is not viable due to a lack of suitable courses, lack of landowner support, lack of community volunteer support. We should simply remove them from our app.

## Clarifications

### Session 2026-01-18

- Q: What are the two ways for a prospect to finish? → A: Launch (transitions to live event) and Archive (not viable, remove from app)
- Q: What UI pattern should be used for Launch and Archive actions? → A: Replace existing "Remove" button with separate "Launch" and "Archive" buttons side-by-side
- Q: Should the system ask for a specific reason when archiving a prospect? → A: No, log archive as "not viable" without asking for specific reason (course/landowner/volunteer)
- Q: How should the system match prospect names to existing events when launching? → A: Always show all potential matches and let REA select manually
- Q: Should launch/archive actions be reversible? → A: Irreversible (like all current actions), but change log structure should support potential future undo functionality

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Launch Prospect (Priority: P1)

A Regional Event Ambassador (REA) needs to mark a prospect as having launched (become an actual parkrun event). When a prospect launches, it should be removed from the prospects list, and if the prospect already has an assigned Event Ambassador, that EA's allocation count should be updated (removing the prospect from their prospectiveEvents count and optionally adding it to their live events if the event exists in the system).

**Why this priority**: This is the core functionality for the most common prospect completion path. Without this, REAs cannot track when prospects successfully transition to live events. It enables proper cleanup of prospect data and maintains accurate EA allocation counts.

**Independent Test**: Can be fully tested by selecting a prospect from the prospects table, marking it as "Launched", and verifying it is removed from the prospects list and EA allocation counts are updated appropriately. This delivers immediate value by completing the prospect lifecycle for successful prospects.

**Acceptance Scenarios**:

1. **Given** an REA is viewing the Prospects table, **When** they click a "Launch" or "Mark as Launched" action button for a prospect, **Then** a confirmation dialog appears asking them to confirm the launch transition
2. **Given** a prospect has an assigned Event Ambassador, **When** the REA confirms marking it as launched, **Then** the prospect is removed from the prospects list and the EA's prospectiveEvents count is decremented
3. **Given** a prospect has been marked as launched, **When** the REA views the Event Ambassadors table, **Then** the EA's allocation count no longer includes that prospect
4. **Given** a prospect has been marked as launched, **When** the REA views the map, **Then** the prospect marker is removed from the map
5. **Given** a prospect has been marked as launched, **When** the REA views the changes log, **Then** an entry is recorded indicating the prospect launched (transitioned to a live event)

---

### User Story 2 - Archive Prospect (Priority: P1)

A Regional Event Ambassador (REA) needs to mark a prospect as archived when it is not viable (due to lack of suitable courses, lack of landowner support, or lack of community volunteer support). When a prospect is archived, it should be removed from the prospects list and the assigned Event Ambassador's allocation count should be updated.

**Why this priority**: This is equally important as Launch - prospects that are not viable need to be removed from the system to maintain accurate data. This is a core functionality for completing the prospect lifecycle.

**Independent Test**: Can be fully tested by selecting a prospect from the prospects table, marking it as "Archived", and verifying it is removed from the prospects list and EA allocation counts are updated appropriately. This delivers immediate value by cleaning up non-viable prospects.

**Acceptance Scenarios**:

1. **Given** an REA is viewing the Prospects table, **When** they click an "Archive" or "Mark as Archived" action button for a prospect, **Then** a confirmation dialog appears asking them to confirm the archive action
2. **Given** a prospect has an assigned Event Ambassador, **When** the REA confirms archiving it, **Then** the prospect is removed from the prospects list and the EA's prospectiveEvents count is decremented
3. **Given** a prospect has been archived, **When** the REA views the Event Ambassadors table, **Then** the EA's allocation count no longer includes that prospect
4. **Given** a prospect has been archived, **When** the REA views the map, **Then** the prospect marker is removed from the map
5. **Given** a prospect has been archived, **When** the REA views the changes log, **Then** an entry is recorded indicating the prospect was archived (with reason: not viable)

---

### User Story 3 - Allocate Event When Prospect Launches (Priority: P2)

If a prospect launches and the corresponding event already exists in the system's event details (from the parkrun events.json), the system should allow the REA to optionally allocate that event to an Event Ambassador during the launch process.

**Why this priority**: When a prospect becomes a real event, it may already exist in the parkrun events data. Allowing allocation during the transition creates a smooth workflow, but the core value is completing the prospect lifecycle (P1).

**Independent Test**: Can be tested by marking a prospect as launched where the event name matches an existing event in eventDetails, and verifying the system offers to allocate the event to an EA.

**Acceptance Scenarios**:

1. **Given** a prospect is being marked as launched, **When** the REA confirms the launch, **Then** the system presents all potential matching events (by name and location similarity) and allows the REA to select one or proceed without allocation
2. **Given** the system presents potential matching events when a prospect launches, **When** the REA selects an event (or chooses to proceed without allocation), **Then** the system offers to allocate the selected event to an Event Ambassador (suggesting the prospect's assigned EA if one exists)
3. **Given** the system offers to allocate an event when a prospect launches, **When** the REA selects an EA (or chooses to leave unallocated), **Then** the event is allocated according to the selection and the prospect is removed from prospects
4. **Given** a prospect without an assigned EA launches and potential matching events are found, **When** the REA selects an event and confirms the launch, **Then** the system allows allocation of the event to any EA or leaving it unallocated

---

### User Story 4 - Handle Prospect Without Existing Event (Priority: P2)

When a prospect launches but the corresponding event does not yet exist in the system's event details (e.g., it's not yet in parkrun's events.json, or it's a closed event in a custodial or military location), the system should still allow marking it as launched and simply remove it from prospects without requiring event allocation.

**Why this priority**: Not all prospects that launch will immediately appear in parkrun's events data (especially closed events). The system should handle this gracefully, allowing REAs to mark prospects as launched even when the event isn't in the system yet.

**Independent Test**: Can be tested by marking a prospect as launched where no matching event exists in eventDetails, and verifying the prospect is removed without requiring event allocation.

**Acceptance Scenarios**:

1. **Given** a prospect is being marked as launched and no matching event exists in eventDetails, **When** the REA confirms the launch, **Then** the prospect is removed from the prospects list without requiring event allocation
2. **Given** a prospect without a matching event launches, **When** the launch is confirmed, **Then** the EA's prospectiveEvents count is updated (if the prospect had an assigned EA) and the prospect is removed

---

### Edge Cases

- What happens when marking a prospect as launched/archived that has no assigned Event Ambassador? → System should allow the transition and simply remove the prospect
- How does the system match prospect names to existing events? → System presents all potential matching events (by name and location similarity) and allows REA to manually select which event (if any) or proceed without allocation
- What happens if a prospect's assigned EA no longer exists in the system? → System should handle gracefully, remove prospect, and log a warning
- How does the system handle prospects that were created manually vs. imported from CSV? → All prospects should be handled the same way regardless of source
- What happens if a prospect has no coordinates (geocoding never succeeded)? → System should still allow marking as launched/archived, removing the prospect
- Should the system allow undoing a launch/archive transition? → Actions are irreversible (like all current actions), but change log structure should support potential future undo functionality
- What happens when archiving a prospect - should the system ask for a reason? → System logs archive as "not viable" without asking for specific reason (course/landowner/volunteer)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST replace the existing "Remove" button in the Prospects table with separate "Launch" and "Archive" buttons displayed side-by-side
- **FR-001a**: System MUST provide a "Launch" button/action in Prospects table for marking prospects as launched
- **FR-001b**: System MUST provide an "Archive" button/action in Prospects table for marking prospects as archived
- **FR-003**: System MUST display a confirmation dialog when marking a prospect as launched or archived to prevent accidental transitions
- **FR-004**: System MUST remove the prospect from the Prospects table immediately after confirming launch or archive
- **FR-005**: System MUST remove the prospect from the assigned Event Ambassador's prospectiveEvents array when the prospect is launched or archived
- **FR-006**: System MUST update EA allocation counts after removing a prospect (decrement prospectiveEvents count)
- **FR-007**: System MUST remove the prospect marker from the map after it is launched or archived
- **FR-008**: System MUST log the launch/archive in the changes log with appropriate details (prospect name, date, assigned EA if any)
- **FR-008a**: System MUST log archived prospects with reason "not viable" (no specific reason selection required)
- **FR-009**: System MUST check for potential matching events in eventDetails when a prospect launches (by prospect name and location similarity)
- **FR-009a**: System MUST present all potential matching events to the REA and allow manual selection (or option to proceed without allocation)
- **FR-010**: System MUST offer to allocate the selected event to an Event Ambassador if one is chosen when a prospect launches
- **FR-011**: System MUST suggest the prospect's assigned EA as the default allocation if one exists and an event is being allocated
- **FR-012**: System MUST allow REAs to select a different EA or leave the event unallocated when allocating during launch
- **FR-013**: System MUST handle cases where no matching event exists in eventDetails (allow launch without event allocation)
- **FR-014**: System MUST handle cases where a prospect has no assigned EA (allow launch/archive without EA allocation update)
- **FR-015**: System MUST validate that the prospect exists before allowing the transition
- **FR-016**: System MUST persist all changes (prospect removal, EA allocation updates, event allocation if applicable) immediately after confirmation
- **FR-017**: System MUST NOT offer event allocation when archiving a prospect (archive is for non-viable prospects only)
- **FR-018**: System MUST log launch/archive actions in a format that supports potential future undo functionality (even though undo is not implemented in this feature)

### Key Entities *(include if feature involves data)*

- **ProspectiveEvent**: The prospect being transitioned - will be removed from the prospects list
- **EventAmbassador**: If the prospect had an assigned EA, their prospectiveEvents array will be updated (prospect ID removed)
- **EventDetails**: May contain a matching event that can be allocated during the transition
- **EventTeam**: If a matching event exists and is allocated, the EventTeam may need to be updated

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: REAs can mark a prospect as launched or archived in under 30 seconds (including confirmation)
- **SC-002**: System correctly updates EA allocation counts after prospect launch/archive (prospectiveEvents count decremented, live events count incremented if event allocated during launch)
- **SC-003**: 100% of prospects marked as launched/archived are removed from the prospects list and no longer appear on the map
- **SC-004**: All launch/archive transitions are logged in the changes log with complete details for audit trail
- **SC-005**: System handles edge cases gracefully (missing EA, no matching event, etc.) without errors or data corruption

## Assumptions

- Prospects that launch may or may not have a corresponding event in eventDetails (event may not be in parkrun's events.json yet, or may be a closed event)
- REAs know when a prospect has launched (become a live event) or should be archived (not viable)
- Matching prospect names to existing events may require fuzzy matching or manual selection if multiple matches exist, and should consider location similarity
- Prospects can launch without being allocated to an event in the system
- The launch/archive actions are irreversible (prospects cannot be restored after marking as launched/archived) - needs confirmation
- Change log entries should be structured to support potential future undo functionality (not implemented in this feature)
- Archived prospects are not viable and should not be allocated to events (only launch should offer event allocation)

## Dependencies

- Existing prospect management infrastructure (ProspectiveEventList, persistProspectiveEvents)
- Existing EA allocation management (EventAmbassadorMap, assignEventToAmbassador)
- Existing event allocation infrastructure (EventDetailsMap, EventTeamMap)
- Existing change logging (LogEntry, changes log)
- Event name matching capabilities (may need fuzzy matching if not already available)

## Out of Scope

- Creating new event entries in eventDetails when a prospect launches (assumes events are managed separately via parkrun's events.json)
- Undoing a launch/archive transition (once marked as launched/archived, prospect is permanently removed)
- Bulk operations (marking multiple prospects as launched/archived at once)
- Automatic detection of when prospects launch or should be archived (manual action required)
- Requiring explicit reason entry when archiving (reason is implicit: not viable)
