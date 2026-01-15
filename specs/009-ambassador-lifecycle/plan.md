# Implementation Plan: Ambassador Lifecycle Management

**Branch**: `009-ambassador-lifecycle` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-ambassador-lifecycle/spec.md`

## Summary

This feature enhances ambassador onboarding to capture state information and enable REA assignment, and adds cross-boarding functionality to transition ambassadors between EA and REA roles while preserving or reallocating their assignments appropriately. All state changes are logged individually in the changes log for complete auditability.

**Technical Approach**: Extend existing onboarding functions to capture state and handle REA assignment. Create new transition functions that move ambassadors between EA and REA roles, preserving event assignments for EA-to-REA transitions and requiring reallocation for REA-to-EA transitions. Leverage existing reallocation UI patterns for REA-to-EA transitions.

## Technical Context

**Language/Version**: TypeScript (strict mode)  
**Primary Dependencies**: DOM APIs, localStorage API, Jest for testing  
**Storage**: Browser localStorage (via existing persistence layer)  
**Testing**: Jest with DOM testing utilities  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single web application  
**Performance Goals**: All operations complete in <1 second for typical data volumes (<1000 ambassadors)  
**Constraints**: Must maintain backward compatibility with existing data, all operations must be keyboard accessible  
**Scale/Scope**: Typical usage: 50-200 Event Ambassadors, 5-20 Regional Ambassadors

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Single project structure maintained
- ✅ All functions must have unit tests
- ✅ Code must pass TypeScript strict mode
- ✅ Code must pass linting
- ✅ All changes must be logged
- ✅ UI must be keyboard accessible
- ✅ No implementation details in spec (verified)

## Project Structure

### Documentation (this feature)

```text
specs/009-ambassador-lifecycle/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── checklists/         # Quality checklists
└── contracts/          # Function contracts (to be created)
```

### Source Code (repository root)

```text
src/
├── models/
│   ├── EventAmbassador.ts          # Extend with state field
│   └── RegionalAmbassador.ts        # (no changes)
├── actions/
│   ├── onboardAmbassador.ts         # Extend to capture state and handle REA assignment
│   ├── onboardAmbassador.test.ts    # Extend tests
│   ├── transitionAmbassador.ts      # NEW: Transition functions (EA↔REA)
│   ├── transitionAmbassador.test.ts # NEW: Transition tests
│   └── [existing files unchanged]
└── index.ts                          # Update UI handlers for enhanced onboarding and transitions
```

**Structure Decision**: Single project structure. New transition functions in dedicated file following existing action file patterns. Enhanced onboarding extends existing functions.

## Complexity Tracking

> **No violations detected** - All changes follow existing patterns and architecture.

## Phase 0: Research

### Research Questions

1. **State Field Storage**: How should state be stored in EventAmbassador model? Should it be required or optional for backward compatibility?
   - **Answer**: Add as optional field initially, but make it required for new onboardings. Existing EAs without state will need migration path (can be handled separately).

2. **Transition State Preservation**: When transitioning EA to REA, how should event assignments be preserved? Should they be stored in a special field or kept in the standard events/prospectiveEvents arrays?
   - **Answer**: Keep in standard arrays. REA model doesn't have events field, but we can preserve the data structure. Actually, REAs don't have events - the events remain assigned but the ambassador is now an REA. Need to clarify: events should remain in the data structure but the ambassador is no longer an EA. Wait - looking at the spec, it says "leave their EA-Team assignments intact" - this means the events list should be preserved somewhere. But REA model doesn't have events. Need to check if we need to extend REA model or handle differently.
   - **Revised Answer**: Events remain in EventAmbassador structure but ambassador is moved to REA list. The events list is preserved in the transition data and can be accessed for reallocation later. However, since REA model doesn't have events field, we need to preserve this in transition state or extend REA model. Actually, re-reading spec: "We should leave their EA-Team assignments intact at this point" - this suggests the events should remain visible/accessible. Best approach: preserve events in a temporary structure or extend REA to include eventsForReallocation field (optional).

3. **Reallocation UI Pattern**: What UI pattern should be used for REA-to-EA transition reallocation? Should it reuse existing offboarding reallocation dialog?
   - **Answer**: Reuse existing reallocation dialog pattern from offboarding (showReallocationDialog) but adapt for EA reallocation context. This maintains consistency and reduces development effort.

4. **Logging Granularity**: How should multiple related changes be logged? Should each operation (onboarding, assignment, removal) be separate log entries?
   - **Answer**: Yes - each individual state change must be logged separately per clarification. This includes: onboarding operation, REA assignment, addition to supportsEAs, removal from supportsEAs, each EA reallocation, transition operations.

5. **Validation Requirements**: What validations are needed before allowing transitions? Should we check capacity, existence of target REAs, etc.?
   - **Answer**: For EA-to-REA: Validate EA exists, has valid state. For REA-to-EA: Validate REA exists, has valid state, all supported EAs can be reallocated (at least one other REA exists or all EAs have recipients), target REAs have capacity (warn but allow override).

### Research Findings

- **State Field**: Add as optional `state?: string` to EventAmbassador interface for backward compatibility. Make it required in onboarding UI but allow existing data without state.
- **Event Preservation**: For EA-to-REA transitions, preserve events in EventAmbassador structure during transition. The ambassador is moved to REA list but events remain accessible for later reallocation. Since REA model doesn't have events field, we'll need to either: (a) extend REA model with optional `eventsForReallocation?: string[]` field, or (b) keep events in a separate transition state. Option (a) is cleaner and allows the new REA to see their events for reallocation.
- **Reallocation UI**: Reuse `showReallocationDialog` pattern but create variant for EA reallocation that shows REA recipients instead of EA recipients.
- **Logging**: Each operation logs separately: onboarding (1 entry), REA assignment (1 entry), addition to supportsEAs (1 entry), removal from supportsEAs (1 entry), each EA reallocation (1 entry per EA), transition (1 entry for removal from old list, 1 entry for addition to new list).
- **Validation**: Implement validation functions that check existence, state validity, and reallocation feasibility before allowing transitions.

## Phase 1: Data Model & Core Functions

### Data Model Changes

#### EventAmbassador Interface Extension

**File**: `src/models/EventAmbassador.ts`

```typescript
export interface EventAmbassador {
  name: string;
  events: string[];
  prospectiveEvents?: string[];
  capacityStatus?: CapacityStatus;
  conflicts?: string[];
  regionalAmbassador?: string;
  state?: string; // NEW: State information (e.g., "VIC", "NSW")
}
```

**Rationale**: Add optional state field to maintain backward compatibility. Existing EAs without state will have `undefined`, but new onboardings will require it.

#### RegionalAmbassador Interface Extension (for EA-to-REA transitions)

**File**: `src/models/RegionalAmbassador.ts`

```typescript
export interface RegionalAmbassador {
  name: string;
  state: string;
  supportsEAs: string[];
  prospectiveEvents?: string[];
  capacityStatus?: CapacityStatus;
  conflicts?: string[];
  eventsForReallocation?: string[]; // NEW: Preserved events when EA transitions to REA
  prospectiveEventsForReallocation?: string[]; // NEW: Preserved prospective events
}
```

**Rationale**: Add optional fields to preserve event assignments when EA transitions to REA, allowing the new REA to see and reallocate their former events.

### Core Function Signatures

#### Enhanced Onboarding Functions

**File**: `src/actions/onboardAmbassador.ts`

```typescript
// Enhanced signature - add state parameter
export function onboardEventAmbassador(
  name: string,
  state: string, // NEW: Required state parameter
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
  regionalAmbassadorName?: string // NEW: Optional REA assignment
): void

// Unchanged signature
export function onboardRegionalAmbassador(
  name: string,
  state: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[]
): void
```

#### New Transition Functions

**File**: `src/actions/transitionAmbassador.ts` (NEW)

```typescript
/**
 * Transition an Event Ambassador to become a Regional Ambassador.
 * Preserves all event assignments for later reallocation.
 */
export function transitionEventAmbassadorToRegional(
  ambassadorName: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[]
): void

/**
 * Transition a Regional Ambassador to become an Event Ambassador.
 * Requires reallocation of all supported Event Ambassadors.
 */
export function transitionRegionalAmbassadorToEvent(
  ambassadorName: string,
  eaRecipients: Map<string, string>, // Map of EA name to new REA name
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[]
): void

/**
 * Validate that REA-to-EA transition is possible.
 * Returns error message if validation fails, null if valid.
 */
export function validateREAToEATransition(
  ambassadorName: string,
  regionalAmbassadors: RegionalAmbassadorMap
): string | null
```

### Logging Requirements

Each operation must log separately:

1. **Onboarding EA with state**: `{ type: "onboard event ambassador", event: name, oldValue: "", newValue: name, timestamp }`
2. **Onboarding EA with REA assignment**: 
   - Onboarding entry (above)
   - `{ type: "assign event ambassador to regional ambassador", event: name, oldValue: "", newValue: reaName, timestamp }`
   - `{ type: "add event ambassador to regional supports", event: reaName, oldValue: oldEAs, newValue: newEAs, timestamp }`
3. **EA-to-REA transition**:
   - `{ type: "remove event ambassador", event: name, oldValue: name, newValue: "", timestamp }`
   - `{ type: "add regional ambassador", event: name, oldValue: "", newValue: name, timestamp }`
   - `{ type: "remove event ambassador from regional supports", event: oldREAName, oldValue: oldEAs, newValue: newEAs, timestamp }`
4. **REA-to-EA transition**:
   - `{ type: "remove regional ambassador", event: name, oldValue: name, newValue: "", timestamp }`
   - `{ type: "add event ambassador", event: name, oldValue: "", newValue: name, timestamp }`
   - For each EA reallocation:
     - `{ type: "remove event ambassador from regional supports", event: oldREAName, oldValue: oldEAs, newValue: newEAs, timestamp }`
     - `{ type: "add event ambassador to regional supports", event: newREAName, oldValue: oldEAs, newValue: newEAs, timestamp }`
     - `{ type: "assign event ambassador to regional ambassador", event: eaName, oldValue: oldREAName, newValue: newREAName, timestamp }`

## Phase 2: Integration Points

### UI Changes

#### Enhanced Onboarding UI

**File**: `src/index.ts` - `setupOnboardingButtons()`

- Update Event Ambassador onboarding to prompt for state (required)
- Add optional REA selection dropdown/prompt
- Update Regional Ambassador onboarding (already has state, no changes needed)

#### Event Ambassadors Table Updates

**File**: `public/index.html` - Event Ambassadors table header

- Add "Regional Ambassador" column header as the first column (before Name)
- Update column order: Regional Ambassador, Name, State, Number of Allocations, Events Assigned, Actions

**File**: `src/actions/populateAmbassadorsTable.ts` - `populateEventAmbassadorsTable()`

- Add REA column as first column in table rows (before Name column)
- Display `ambassador.regionalAmbassador` value or "—" if no REA assigned
- Apply consistent styling (italic, gray) for unassigned REA (matching State column pattern)
- Update row creation order to match new column order: REA, Name, State, Allocations, Events, Actions
- Ensure REA column is included in table sorting initialization (column index 0)

#### Transition UI

**File**: `src/index.ts` - New function `setupTransitionButtons()`

- Add "Transition to REA" button to Event Ambassadors table
- Add "Transition to EA" button to Regional Ambassadors table
- For REA-to-EA: Show reallocation dialog (reuse existing pattern)
- For EA-to-REA: Simple confirmation dialog

**File**: `public/index.html`

- Add transition buttons to ambassador tables
- Ensure keyboard accessibility

### Integration with Existing Systems

- **Persistence**: Use existing `persistEventAmbassadors()` and `persistRegionalAmbassadors()`
- **Change Tracking**: Use existing `trackStateChange()` after all operations
- **Logging**: Use existing `persistChangesLog()` after all operations
- **UI Refresh**: Use existing `refreshUI()` after transitions
- **Capacity Checking**: Existing capacity checking will automatically apply to new REAs
- **Table Sorting**: Existing table sorting system (from feature 008) will work with new REA column - ensure REA column is sortable

## Phase 3: Testing Strategy

### Unit Tests

**File**: `src/actions/onboardAmbassador.test.ts`
- Test enhanced `onboardEventAmbassador` with state
- Test `onboardEventAmbassador` with REA assignment
- Test logging for each operation separately

**File**: `src/actions/populateAmbassadorsTable.test.ts`
- Test REA column appears as first column in Event Ambassadors table
- Test REA column displays REA name when assigned
- Test REA column displays "—" when no REA assigned
- Test REA column styling matches State column for unassigned values
- Test table sorting works with REA column (column index 0)

**File**: `src/actions/transitionAmbassador.test.ts` (NEW)
- Test `transitionEventAmbassadorToRegional` preserves events
- Test `transitionEventAmbassadorToRegional` removes from EA list
- Test `transitionEventAmbassadorToRegional` adds to REA list
- Test `transitionEventAmbassadorToRegional` removes from old REA's supportsEAs
- Test `transitionRegionalAmbassadorToEvent` requires reallocation
- Test `transitionRegionalAmbassadorToEvent` reallocates all EAs
- Test `transitionRegionalAmbassadorToEvent` blocks if reallocation impossible
- Test `validateREAToEATransition` returns errors appropriately
- Test logging for each operation separately

### Integration Tests

- Test full EA onboarding flow with state and REA assignment
- Test EA-to-REA transition preserves events and updates all relationships
- Test REA-to-EA transition with reallocation updates all relationships
- Test UI buttons trigger correct operations
- Test state persistence across page reloads

## Phase 4: Implementation Order

1. **Data Model Updates** (Phase 1)
   - Extend EventAmbassador interface with state field
   - Extend RegionalAmbassador interface with eventsForReallocation fields
   - Update type definitions

2. **Enhanced Onboarding** (User Story 1)
   - Update `onboardEventAmbassador` to accept state and optional REA
   - Add REA assignment logic
   - Add granular logging
   - Update UI to prompt for state and REA
   - Write tests

3. **EA-to-REA Transition** (User Story 2)
   - Implement `transitionEventAmbassadorToRegional`
   - Add UI button and handler
   - Write tests

4. **REA-to-EA Transition** (User Story 3)
   - Implement `validateREAToEATransition`
   - Implement `transitionRegionalAmbassadorToEvent`
   - Create/adapt reallocation dialog for EA reallocation
   - Add UI button and handler
   - Write tests

5. **Polish & Integration**
   - Ensure all logging is granular
   - Verify UI accessibility
   - Integration testing
   - Update documentation

## Assumptions & Constraints

- State field is optional for backward compatibility but required for new onboardings
- Existing EAs without state will show as "Unknown" or empty in UI
- Events preserved during EA-to-REA transition remain visible to the new REA for manual reallocation
- REA-to-EA transition requires all EAs to be reallocated (no partial transitions)
- All operations must maintain data integrity (no orphaned references)
- All operations must be reversible via separate offboarding/onboarding if needed

## Risks & Mitigations

- **Risk**: Breaking existing data without state field
  - **Mitigation**: Make state optional, provide migration path in separate feature
- **Risk**: Complex reallocation UI for REA-to-EA transitions
  - **Mitigation**: Reuse existing reallocation dialog patterns
- **Risk**: Events preserved in REA model might confuse users
  - **Mitigation**: Clear UI labeling indicating these are events for reallocation
- **Risk**: Granular logging might create too many log entries
  - **Mitigation**: This is by design per clarification - provides better auditability

## Dependencies

- Existing ambassador data models
- Existing onboarding/offboarding functions
- Existing reallocation UI components
- Existing persistence and logging infrastructure
- Existing capacity checking system

## Out of Scope (Confirmed)

- Automatic reallocation of events when EA transitions to REA
- Bulk transitions
- Transition history beyond changes log
- Reversing transitions (use separate offboarding/onboarding)
- Changing state after onboarding (separate feature)
- Changing REA assignment for existing EAs (covered by existing reallocation)
