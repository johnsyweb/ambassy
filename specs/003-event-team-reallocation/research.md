# Research: Event Team Reallocation Feature

## Research Questions & Decisions

### RQ-001: UI Pattern for Event Team Selection

**Question**: How should users select an Event Team for reallocation?

**Research Findings**:
- Event Teams table already supports row selection (via table-map navigation feature)
- Existing pattern: Click on table row to select, row is highlighted
- Table rows have `data-event-short-name` attribute for identification
- Selection state is managed via `SelectionState` model

**Decision**: Reuse existing table row selection mechanism. When a row is selected, enable a "Reallocate" action button or keyboard shortcut.

**Alternatives Considered**:
- Separate selection mechanism: Rejected - would duplicate existing functionality and confuse users
- Right-click context menu: Rejected - not keyboard accessible by default

**Rationale**: Reusing existing selection provides consistency and reduces code duplication.

---

### RQ-002: UI Pattern for Reallocation Dialog

**Question**: How should the reallocation dialog be presented to users?

**Research Findings**:
- Existing offboarding feature uses a modal dialog (`reallocationDialog`) with:
  - Clickable suggestion buttons (top 3-5 suggestions)
  - Dropdown for "Other" option
  - Keyboard navigation support (Tab, Enter, Arrow keys)
- Dialog pattern is established and accessible
- HTML structure exists in `public/index.html`

**Decision**: Reuse existing `reallocationDialog` pattern. Create a new dialog instance or reuse the existing one with different content. Display prioritised suggestions from `suggestEventReallocation()` function.

**Alternatives Considered**:
- Inline dropdown in table: Rejected - would clutter table UI, harder to show multiple suggestions with reasons
- Separate page: Rejected - breaks workflow, unnecessary navigation

**Rationale**: Modal dialog provides focused interaction, shows all relevant information (suggestions, reasons, warnings), and maintains consistency with existing patterns.

---

### RQ-003: Integration with Existing Reallocation Logic

**Question**: How should this feature integrate with existing `suggestEventReallocation()` function?

**Research Findings**:
- `suggestEventReallocation()` already calculates scores based on:
  - Capacity (30% weight)
  - Region (30% weight)
  - Proximity (30% weight)
  - Conflicts (penalty)
- Function returns sorted array of `ReallocationSuggestion` objects
- Function requires: `fromAmbassador`, `events[]`, `eventAmbassadors`, `eventDetails`, `limits`, `regionalAmbassadors`, `options`
- For single event reallocation, `events` array will contain one event

**Decision**: Call `suggestEventReallocation()` with the selected event's current ambassador as `fromAmbassador` and a single-item `events` array. Use the returned suggestions to populate the dialog.

**Alternatives Considered**:
- Create new scoring function: Rejected - would duplicate logic and risk inconsistency
- Modify existing function: Rejected - existing function is used by offboarding, changes could break that feature

**Rationale**: Reusing existing function ensures consistent prioritisation logic across all reallocation scenarios.

---

### RQ-004: Integration with Assignment Logic

**Question**: How should the actual assignment be performed?

**Research Findings**:
- `assignEventToAmbassador()` function handles:
  - Removing event from old ambassador's events array
  - Adding event to new ambassador's events array
  - Persisting changes
  - Recalculating capacity statuses
  - Logging the change
- Function signature: `assignEventToAmbassador(eventName, oldEventAmbassador, newEventAmbassador, eventAmbassadors, log, regionalAmbassadors?)`
- Function is already used in `populateEventTeamsTable.ts` for dropdown-based assignment

**Decision**: Call `assignEventToAmbassador()` with the selected event, current ambassador, and chosen recipient. Also update `EventTeamsTableData` to reflect the change.

**Alternatives Considered**:
- Create new assignment function: Rejected - would duplicate logic
- Modify existing function: Rejected - function is used in multiple places, changes could introduce regressions

**Rationale**: Reusing existing function ensures consistent assignment logic and logging.

---

### RQ-005: Keyboard Accessibility

**Question**: How should keyboard users trigger and complete reallocation?

**Research Findings**:
- Existing reallocation dialog supports:
  - Tab navigation between buttons
  - Enter to activate buttons
  - Arrow keys for navigation (if implemented)
- Table rows can be selected via keyboard (if table supports keyboard navigation)
- Need to provide keyboard shortcut or button to trigger reallocation dialog

**Decision**: 
- Add "Reallocate" button to Event Teams table (keyboard accessible)
- When row is selected and button is focused, Enter/Space activates dialog
- Dialog reuses existing keyboard navigation patterns
- Ensure focus management: focus moves to dialog when opened, returns to button when closed

**Alternatives Considered**:
- Keyboard shortcut only (no button): Rejected - not discoverable, violates accessibility principle of visible controls
- Right-click menu: Rejected - not keyboard accessible

**Rationale**: Visible button with keyboard support provides discoverability and accessibility.

---

### RQ-006: State Management

**Question**: How should selection state be managed during reallocation?

**Research Findings**:
- `SelectionState` model exists for table-map navigation
- Contains: `selectedEventShortName`, `selectedEventAmbassador`, `selectedRegionalAmbassador`, `highlightedEvents`, `activeTab`
- Selection state is global and shared across features

**Decision**: Use existing `SelectionState` to track selected event. When reallocation dialog is opened, use `selectedEventShortName` to identify the event to reallocate. Clear selection after successful reallocation (or keep selection if user cancels).

**Alternatives Considered**:
- Separate reallocation state: Rejected - would duplicate selection tracking, could get out of sync
- No state tracking: Rejected - need to know which event is being reallocated

**Rationale**: Reusing existing selection state ensures consistency and avoids duplication.

---

### RQ-007: Error Handling

**Question**: How should errors be handled during reallocation?

**Research Findings**:
- `assignEventToAmbassador()` throws errors for invalid ambassadors
- Existing pattern: Show `alert()` for errors, revert UI changes if assignment fails
- Example in `populateEventTeamsTable.ts`: try-catch around `assignEventToAmbassador()`, alert on error, revert dropdown value

**Decision**: Wrap `assignEventToAmbassador()` call in try-catch. On error, show alert with error message, close dialog, keep selection state unchanged. Do not persist changes if assignment fails.

**Alternatives Considered**:
- Silent failure: Rejected - user needs feedback
- Console-only logging: Rejected - not accessible to users

**Rationale**: Alert provides immediate feedback, try-catch prevents application crash, reverting state ensures consistency.

---

## Summary

All research questions resolved. Feature will:
1. Reuse existing table row selection mechanism
2. Use existing modal dialog pattern for reallocation UI
3. Call `suggestEventReallocation()` for prioritised suggestions
4. Call `assignEventToAmbassador()` for actual assignment
5. Provide keyboard-accessible "Reallocate" button
6. Use existing `SelectionState` for selection tracking
7. Handle errors with alerts and state reversion

No new dependencies or technologies required. Feature leverages existing patterns and functions throughout.
