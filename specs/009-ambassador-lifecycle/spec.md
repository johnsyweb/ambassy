# Feature Specification: Ambassador Lifecycle Management

**Feature Branch**: `009-ambassador-lifecycle`  
**Created**: 2026-01-15  
**Status**: Draft  
**Input**: User description: "Onboarding, cross-boarding and offboarding ambassadors. When we onboard an ambassador we should ensure that we know which state they're in. We should allocate an EA to an REA. Sometimes an EA will become an REA. We should leave their EA-Team assignments intact at this point. One of their first acts as an REA will be to reallocate their event teams to other EAs. Sometimes an REA will become an EA. We should reallocate their ambassador-ambassador assigments at this point."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enhanced Onboarding with State and Allocation (Priority: P1)

As a Regional Event Ambassador, I want to onboard new Event Ambassadors with their state information and assign them to a Regional Ambassador, so that new ambassadors are properly integrated into the organizational structure from the start.

**Why this priority**: Onboarding is the foundation of ambassador management. Ensuring state information is captured and EAs are allocated to REAs during onboarding prevents data gaps and ensures proper organizational structure from day one.

**Independent Test**: Can be fully tested by onboarding a new Event Ambassador with state information and REA assignment, verifying the state is stored, the EA appears in the REA's supportsEAs list, and the EA's regionalAmbassador field is set. This delivers value by ensuring complete data capture and proper organizational relationships from the start.

**Acceptance Scenarios**:

1. **Given** a user wants to onboard a new Event Ambassador, **When** the user provides the ambassador's name and state, **Then** the Event Ambassador is added with the state information stored
2. **Given** a user wants to onboard a new Event Ambassador, **When** the user provides the ambassador's name, state, and assigns them to a Regional Ambassador, **Then** the Event Ambassador is added, the EA appears in the REA's supportsEAs list, and the EA's regionalAmbassador field is set to the REA's name
3. **Given** a new Event Ambassador has been onboarded with state and REA assignment, **When** the user views the ambassador information, **Then** the state is visible and the REA relationship is clear
4. **Given** a user wants to onboard a new Regional Ambassador, **When** the user provides the ambassador's name and state, **Then** the Regional Ambassador is added with the state information stored (REA onboarding remains unchanged from existing functionality)

---

### User Story 2 - Cross-Boarding: Event Ambassador to Regional Ambassador (Priority: P2)

As a Regional Event Ambassador, I want to transition an Event Ambassador to become a Regional Ambassador while preserving their existing event team assignments, so that the ambassador can gradually reallocate their events to other EAs after taking on the REA role.

**Why this priority**: Role transitions are common as ambassadors take on more responsibility. Preserving existing assignments during EA-to-REA transitions allows for a smooth handover period where the new REA can manage reallocation of their former events as one of their first acts in the new role.

**Independent Test**: Can be fully tested by transitioning an EA to REA, verifying the EA's event assignments remain intact, the ambassador now appears as an REA with an empty supportsEAs list, and the ambassador no longer appears in the EA list. This delivers value by supporting natural career progression while maintaining continuity of event support.

**Acceptance Scenarios**:

1. **Given** an Event Ambassador supports 5 events and is assigned to a Regional Ambassador, **When** the user transitions the EA to become an REA, **Then** the ambassador is removed from the Event Ambassadors list, added to the Regional Ambassadors list with their state information, their event assignments remain intact (events list preserved), and they have an empty supportsEAs list
2. **Given** an Event Ambassador has prospective events assigned, **When** the user transitions the EA to become an REA, **Then** the prospective events assignments remain intact
3. **Given** an Event Ambassador is transitioned to REA, **When** the user views the new REA's information, **Then** their previous event assignments are visible, indicating they need to be reallocated
4. **Given** an Event Ambassador is transitioned to REA, **When** the transition completes, **Then** the ambassador is removed from their previous REA's supportsEAs list (since they are no longer an EA)
5. **Given** an Event Ambassador is transitioned to REA, **When** the transition completes, **Then** the changes are logged appropriately in the changes log

---

### User Story 3 - Cross-Boarding: Regional Ambassador to Event Ambassador (Priority: P2)

As a Regional Event Ambassador, I want to transition a Regional Ambassador to become an Event Ambassador and automatically reallocate their supported Event Ambassadors to other Regional Ambassadors, so that the organizational structure remains intact when an REA steps down to an EA role.

**Why this priority**: When REAs step down to EA roles, their supported EAs must be reallocated to maintain proper organizational structure. Automatic reallocation during transition ensures no EAs are left without REA support.

**Independent Test**: Can be fully tested by transitioning an REA to EA, verifying the REA's supported EAs are reallocated to other REAs, the ambassador now appears as an EA with an empty events list, and the ambassador no longer appears in the REA list. This delivers value by maintaining organizational integrity during role transitions.

**Acceptance Scenarios**:

1. **Given** a Regional Ambassador supports 4 Event Ambassadors, **When** the user transitions the REA to become an EA, **Then** the system prompts for reallocation of the 4 EAs to other Regional Ambassadors, the ambassador is removed from the Regional Ambassadors list, added to the Event Ambassadors list with their state information, and has an empty events list
2. **Given** a Regional Ambassador supports Event Ambassadors and there are other REAs with capacity, **When** the user transitions the REA to EA and reallocates the supported EAs, **Then** the EAs are moved to the new REAs' supportsEAs lists, each EA's regionalAmbassador field is updated, and the reallocation is logged
3. **Given** a Regional Ambassador supports Event Ambassadors, **When** the user transitions the REA to EA, **Then** the system validates that all supported EAs can be reallocated before allowing the transition to complete
4. **Given** a Regional Ambassador is transitioned to EA, **When** the transition completes, **Then** the changes are logged appropriately in the changes log
5. **Given** a Regional Ambassador has no supported EAs, **When** the user transitions the REA to become an EA, **Then** the transition completes immediately without requiring reallocation

---

### Edge Cases

- What happens when transitioning an EA to REA if the EA has no event assignments? → Transition completes successfully with empty events list preserved
- What happens when transitioning an REA to EA if there are no other REAs available? → Transition is blocked until at least one other REA exists or all EAs are reallocated
- What happens when transitioning an REA to EA if the REA has no supported EAs? → Transition completes immediately without requiring reallocation
- How does the system handle state information when transitioning between roles? → State information is preserved during transitions (EA state becomes REA state, REA state becomes EA state)
- What happens if an EA being transitioned to REA is the only EA supported by their current REA? → The REA's supportsEAs list becomes empty, which may flag them as under capacity
- What happens when reallocating EAs during REA-to-EA transition if some target REAs are at capacity? → System should warn about capacity but allow reallocation if user confirms, or suggest alternative REAs with available capacity
- How does the system handle prospective events when transitioning EA to REA? → Prospective events remain assigned to the ambassador (now REA) and can be reallocated later
- What happens if a user attempts to transition an ambassador who doesn't exist? → System shows an error and prevents the transition

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST capture and store state information when onboarding Event Ambassadors
- **FR-002**: System MUST allow assignment of Event Ambassadors to Regional Ambassadors during onboarding
- **FR-003**: System MUST automatically add newly onboarded EAs to their assigned REA's supportsEAs list
- **FR-004**: System MUST set the regionalAmbassador field on newly onboarded EAs to their assigned REA's name
- **FR-005**: System MUST allow transitioning an Event Ambassador to become a Regional Ambassador
- **FR-006**: System MUST preserve all event team assignments (events and prospectiveEvents) when transitioning EA to REA
- **FR-007**: System MUST remove the ambassador from Event Ambassadors list when transitioning EA to REA
- **FR-008**: System MUST add the ambassador to Regional Ambassadors list when transitioning EA to REA
- **FR-009**: System MUST preserve state information when transitioning EA to REA
- **FR-010**: System MUST remove the ambassador from their previous REA's supportsEAs list when transitioning EA to REA
- **FR-011**: System MUST allow transitioning a Regional Ambassador to become an Event Ambassador
- **FR-012**: System MUST require reallocation of all supported Event Ambassadors when transitioning REA to EA
- **FR-013**: System MUST validate that all supported EAs can be reallocated before allowing REA-to-EA transition to complete
- **FR-014**: System MUST automatically update each reallocated EA's regionalAmbassador field when transitioning REA to EA
- **FR-015**: System MUST automatically update each target REA's supportsEAs list when reallocating EAs during REA-to-EA transition
- **FR-016**: System MUST remove the ambassador from Regional Ambassadors list when transitioning REA to EA
- **FR-017**: System MUST add the ambassador to Event Ambassadors list when transitioning REA to EA
- **FR-018**: System MUST preserve state information when transitioning REA to EA
- **FR-019**: System MUST log all transitions and reallocations in the changes log
- **FR-020**: System MUST prevent REA-to-EA transition if no other REAs exist and the REA has supported EAs
- **FR-021**: System MUST allow REA-to-EA transition if the REA has no supported EAs, even if no other REAs exist

### Key Entities *(include if feature involves data)*

- **EventAmbassador**: Represents an Event Ambassador with name, events list, prospectiveEvents list, state (new), and regionalAmbassador field. State information must be captured during onboarding and preserved during transitions.

- **RegionalAmbassador**: Represents a Regional Ambassador with name, state, and supportsEAs list. State information is already captured and preserved during transitions.

- **Transition State**: Represents the temporary state during role transitions, including the ambassador being transitioned, their current assignments, and any reallocation requirements.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete onboarding a new Event Ambassador with state and REA assignment in under 30 seconds
- **SC-002**: 100% of newly onboarded Event Ambassadors have state information captured
- **SC-003**: 100% of newly onboarded Event Ambassadors assigned to REAs are correctly added to the REA's supportsEAs list
- **SC-004**: Users can complete EA-to-REA transition in under 1 minute, preserving all event assignments
- **SC-005**: 100% of EA-to-REA transitions preserve all existing event and prospective event assignments
- **SC-006**: Users can complete REA-to-EA transition with reallocation in under 3 minutes
- **SC-007**: 100% of REA-to-EA transitions successfully reallocate all supported Event Ambassadors
- **SC-008**: System prevents REA-to-EA transitions when reallocation is not possible (validation occurs before transition)
- **SC-009**: All transitions and reallocations are logged in the changes log with clear old and new values
- **SC-010**: State information is preserved correctly in 100% of role transitions

## Assumptions

- State information is a required field for Event Ambassadors (similar to Regional Ambassadors)
- Event Ambassadors can be onboarded without an initial REA assignment, but the system should prompt for assignment
- When transitioning EA to REA, the ambassador's event assignments are intentionally left intact for later reallocation by the new REA
- When transitioning REA to EA, all supported EAs must be reallocated immediately (no option to leave them unassigned)
- State information format and validation follows the same rules as Regional Ambassadors
- The existing offboarding functionality continues to work independently of these new transition features
- Capacity limits and validation continue to apply during reallocation operations

## Dependencies

- Existing ambassador data models (EventAmbassador, RegionalAmbassador)
- Existing onboarding functions (onboardEventAmbassador, onboardRegionalAmbassador)
- Existing offboarding functions (offboardEventAmbassador, offboardRegionalAmbassador)
- Existing reallocation functions and UI components
- Changes log system for tracking transitions
- State persistence system

## Out of Scope

- Automatic reallocation of events when transitioning EA to REA (user will handle this manually after transition)
- Bulk transitions (one ambassador at a time)
- Transition history or audit trail beyond changes log
- Reversing transitions (would require separate offboarding/onboarding)
- Changing state information after onboarding (separate feature)
- Changing REA assignment for existing EAs (covered by existing reallocation features)
