# Quick Start: Event Team Reallocation Feature

**Feature**: Event Team Reallocation  
**Date**: 2026-01-08  
**Phase**: 1 - Design & Contracts

## Overview

This feature enables users to select an Event Team from the Event Teams table and reallocate it to another Event Ambassador. The application prioritises potential recipients based on their available capacity and the geographic proximity of events they already support to the event being reallocated.

## Key Components

### Reallocation Dialog (`src/actions/showReallocationDialog.ts`)

Modal dialog for selecting a recipient ambassador:
- Displays prioritised suggestions from `suggestEventReallocation()`
- Shows top 3-5 suggestions as clickable buttons
- Provides "Other" dropdown for manual selection
- Keyboard accessible (Tab, Enter, Arrow keys, Escape)
- Reuses existing `#reallocationDialog` HTML element

### Reallocation Action (`src/actions/reallocateEventTeam.ts`)

Core reallocation logic:
- `reallocateEventTeam()`: Performs the actual reallocation
- Calls `assignEventToAmbassador()` for assignment
- Updates `EventTeamsTableData` to reflect new assignment
- Persists changes and recalculates capacity statuses
- Handles errors gracefully

### Suggestion Generation (`src/actions/getReallocationSuggestions.ts`)

Convenience wrapper for generating suggestions:
- `getReallocationSuggestions()`: Finds current ambassador and calls `suggestEventReallocation()`
- Returns prioritised list of recipient suggestions
- Each suggestion includes score, reasons, and warnings

### Validation (`src/actions/validateReallocation.ts`)

Pre-flight validation:
- `validateReallocation()`: Validates reallocation can be performed
- Checks event exists, ambassador exists, not a no-op reallocation
- Returns user-friendly error messages

## Usage Flow

### Selecting an Event Team

1. User views Event Teams table
2. User clicks on a table row (or navigates with keyboard)
3. Row is highlighted (via existing `SelectionState`)
4. "Reallocate" button becomes enabled/visible

### Opening Reallocation Dialog

1. User clicks "Reallocate" button (or presses keyboard shortcut)
2. System reads `selectedEventShortName` from `SelectionState`
3. System finds current ambassador from `EventTeamsTableData`
4. System calls `getReallocationSuggestions()`:
   - Finds current ambassador
   - Calls `suggestEventReallocation()` with single event
   - Returns prioritised suggestions
5. System displays dialog with suggestions

### Viewing Suggestions

Dialog displays:
- **Top 3-5 suggestions** as buttons:
  - Ambassador name
  - Score (e.g., "Score: 85")
  - Reasons (e.g., "Has available capacity", "Geographic proximity")
  - Warnings if applicable (e.g., "Would exceed capacity limit")
- **"Other" dropdown** with all ambassadors (sorted alphabetically)
- **Cancel button** to close dialog without changes

### Completing Reallocation

1. User selects a suggestion button or chooses from "Other" dropdown
2. System calls `validateReallocation()` to verify selection
3. If valid, system calls `reallocateEventTeam()`:
   - Removes event from old ambassador's `events` array
   - Adds event to new ambassador's `events` array
   - Updates `EventTeamsTableData[eventShortName].eventAmbassador`
   - Persists changes via `persistEventAmbassadors()` and `persistEventTeams()`
   - Recalculates capacity statuses
   - Logs change to changelog
4. System closes dialog
5. System refreshes UI to show new assignment
6. System clears selection (or keeps selection if user prefers)

### Cancelling Reallocation

1. User clicks "Cancel" button or presses Escape
2. System closes dialog
3. System restores focus to "Reallocate" button
4. No changes made, selection state unchanged

## Integration Points

### Modified Files

- `src/actions/populateEventTeamsTable.ts`: 
  - Add "Reallocate" button/action to table
  - Button enabled when row is selected
  - Button triggers `showReallocationDialog()`
- `public/index.html`: 
  - Reuse existing `#reallocationDialog` element
  - Ensure dialog structure supports dynamic content
- `public/style.css`: 
  - Ensure dialog styles are appropriate
  - Add styles for suggestion buttons if needed

### New Files

- `src/actions/showReallocationDialog.ts`: Dialog management and UI
- `src/actions/showReallocationDialog.test.ts`: Tests for dialog
- `src/actions/reallocateEventTeam.ts`: Core reallocation action
- `src/actions/reallocateEventTeam.test.ts`: Tests for reallocation
- `src/actions/getReallocationSuggestions.ts`: Suggestion wrapper (optional convenience function)
- `src/actions/getReallocationSuggestions.test.ts`: Tests for suggestions
- `src/actions/validateReallocation.ts`: Validation function
- `src/actions/validateReallocation.test.ts`: Tests for validation

### Existing Functions Used (No Modifications)

- `suggestEventReallocation()` (from `src/actions/suggestReallocation.ts`)
- `assignEventToAmbassador()` (from `src/actions/assignEventToAmbassador.ts`)
- `calculateAllCapacityStatuses()` (from `src/actions/checkCapacity.ts`)
- `persistEventAmbassadors()` and `persistEventTeams()` (from `src/actions/persistState.ts`)
- `SelectionState` (from `src/models/SelectionState.ts`)

## Testing Strategy

### Unit Tests

- `showReallocationDialog()`: Dialog display, button creation, keyboard navigation
- `reallocateEventTeam()`: Assignment logic, persistence, error handling
- `getReallocationSuggestions()`: Suggestion generation, current ambassador lookup
- `validateReallocation()`: Validation rules, error messages

### Integration Tests

- Complete reallocation flow: Select event → Open dialog → Choose recipient → Verify assignment
- Error handling: Invalid ambassador, missing event, no-op reallocation
- UI updates: Table refresh, capacity status recalculation, logging
- Keyboard navigation: Tab through suggestions, Enter to select, Escape to cancel

### Manual Testing Checklist

- [ ] Select Event Team row → "Reallocate" button appears/enabled
- [ ] Click "Reallocate" → Dialog opens with suggestions
- [ ] Suggestions show ambassador name, score, reasons, warnings
- [ ] Top suggestions displayed as buttons
- [ ] "Other" dropdown contains all ambassadors
- [ ] Click suggestion button → Reallocation completes, dialog closes
- [ ] Select from "Other" dropdown → Reallocation completes, dialog closes
- [ ] Click "Cancel" → Dialog closes, no changes made
- [ ] Press Escape → Dialog closes, no changes made
- [ ] Tab navigation works in dialog
- [ ] Enter key activates buttons
- [ ] Verify event removed from old ambassador's events
- [ ] Verify event added to new ambassador's events
- [ ] Verify table data updated
- [ ] Verify capacity statuses recalculated
- [ ] Verify change logged
- [ ] Verify UI refreshed
- [ ] Test error cases: Invalid ambassador, missing event
- [ ] Test edge cases: Unassigned event, same ambassador (no-op)

## Error Handling

### Event Not Selected

- **Cause**: User clicks "Reallocate" without selecting a row
- **Handling**: Disable button when no selection, or show error message

### Event Not Assigned

- **Cause**: Selected event has no current ambassador
- **Handling**: Show message "Event is not currently assigned to any ambassador"

### No Suggestions Available

- **Cause**: All ambassadors at capacity or have conflicts
- **Handling**: Still show "Other" dropdown, display warning message

### Invalid Recipient

- **Cause**: Selected ambassador does not exist
- **Handling**: Validate before assignment, show error alert, revert dialog

### Assignment Failure

- **Cause**: `assignEventToAmbassador()` throws error
- **Handling**: Catch error, show alert with message, close dialog, no changes persisted

## Performance Considerations

- Suggestion generation: O(n) where n is number of ambassadors - should complete in <500ms
- Dialog rendering: Should be instant (<100ms perceived latency)
- Assignment: O(1) operation - should be instant
- UI refresh: May take 100-200ms for large tables - acceptable

## Accessibility Considerations

- "Reallocate" button keyboard accessible (Tab, Enter, Space)
- Dialog keyboard accessible (Tab, Enter, Escape, Arrow keys)
- Dialog has proper ARIA attributes (`role="dialog"`, `aria-labelledby`)
- Suggestion buttons have descriptive labels
- Focus management: Focus moves to dialog when opened, returns when closed
- Screen reader announcements for suggestions and warnings
- Australian English for all text

## Keyboard Shortcuts

- **Tab**: Navigate between buttons and dropdown in dialog
- **Enter**: Activate focused button or select from dropdown
- **Escape**: Close dialog without changes
- **Arrow keys**: Navigate suggestion buttons (if implemented)

## Future Enhancements (Out of Scope)

- Bulk reallocation (select multiple events)
- Undo/redo functionality
- Reallocation history/audit trail
- Custom scoring weights
- Filter suggestions by region or other criteria
- Drag-and-drop reallocation
- Keyboard shortcut to open dialog directly
