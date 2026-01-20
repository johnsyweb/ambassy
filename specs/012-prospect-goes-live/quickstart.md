# Quickstart: End of Prospect Lifecycle

**Feature**: 012-prospect-goes-live
**Date**: 2026-01-18

## Overview

This feature implements two completion paths for prospects:
1. **Launch**: Prospect transitions to live event → Remove prospect, optionally allocate matching event to EA
2. **Archive**: Prospect not viable → Remove prospect, no event allocation

## Key Concepts

### Launch vs Archive

- **Launch**: Prospect becomes a real parkrun event (most cases). May or may not exist in events.json yet. Can allocate matching event to EA during launch.
- **Archive**: Prospect is not viable (no suitable course, no landowner support, no volunteer support). Simply removed from system.

### UI Changes

- **Before**: Prospects table has "🗑️ Remove" button
- **After**: Prospects table has "🚀 Launch" and "📦 Archive" buttons side-by-side

### Event Matching

- Launch flow finds potential matching events by name and location
- All matches shown to REA for manual selection
- REA can select event, allocate to EA, or proceed without allocation

## Implementation Guide

### 1. Create Launch Function

**File**: `src/actions/launchProspect.ts`

**Key Steps**:
1. Validate prospect exists
2. Find matching events (if coordinates available)
3. If event selected, allocate to EA
4. Remove prospect from list
5. Update EA allocation counts
6. Persist changes
7. Log launch entry

**Pattern**: Follow `reallocateProspect.ts` for EA updates, follow existing removal pattern for prospect removal.

### 2. Create Archive Function

**File**: `src/actions/archiveProspect.ts`

**Key Steps**:
1. Validate prospect exists
2. Remove prospect from list
3. Update EA allocation counts (if EA assigned)
4. Persist changes
5. Log archive entry

**Pattern**: Simpler than launch - no event matching/allocation needed.

### 3. Create Event Matching Function

**File**: `src/actions/findMatchingEvents.ts`

**Key Steps**:
1. Use `searchEvents(prospectName, eventDetails)` for name matching
2. Filter by location (distance from prospect coordinates)
3. Sort by distance + match quality
4. Return all matches (REA selects manually)

**Pattern**: Reuse `searchEvents.ts`, add location filtering wrapper.

### 4. Create Launch Dialog

**File**: `src/actions/showLaunchDialog.ts` (or integrate into existing dialog file)

**Key Steps**:
1. Show confirmation dialog
2. Find matching events
3. Display matches for selection
4. If event selected, show EA selection (suggest prospect's EA)
5. Call `launchProspect` on confirm
6. Handle success/cancel/errors

**Pattern**: Follow `showEventSearchDialog.ts` for event selection UI, follow `showAddProspectDialog.ts` for dialog patterns.

### 5. Create Archive Dialog

**File**: `src/actions/showArchiveDialog.ts` (or integrate into existing dialog file)

**Key Steps**:
1. Show confirmation dialog with reason (not viable)
2. Call `archiveProspect` on confirm
3. Handle success/cancel/errors

**Pattern**: Simple confirmation dialog, follow existing dialog patterns.

### 6. Update Prospects Table

**File**: `src/actions/populateProspectsTable.ts`

**Key Changes**:
- Remove `removeButton` code (lines ~255-309)
- Add `launchButton` - calls `showLaunchDialog`
- Add `archiveButton` - calls `showArchiveDialog`
- Place buttons side-by-side in button container

**Pattern**: Follow existing button patterns in same file (Reallocate, Reset Location).

## File Structure

```
src/actions/
├── launchProspect.ts              # NEW: Launch logic
├── launchProspect.test.ts         # NEW: Launch tests
├── archiveProspect.ts              # NEW: Archive logic
├── archiveProspect.test.ts         # NEW: Archive tests
├── findMatchingEvents.ts           # NEW: Event matching utility
├── findMatchingEvents.test.ts      # NEW: Matching tests
├── showLaunchDialog.ts             # NEW: Launch UI (or integrate)
├── showArchiveDialog.ts            # NEW: Archive UI (or integrate)
├── populateProspectsTable.ts       # MODIFIED: Replace Remove with Launch/Archive
└── searchEvents.ts                 # EXISTING: Reused for matching
```

## Testing Strategy

### Unit Tests

1. **launchProspect.test.ts**
   - Test prospect validation
   - Test event matching
   - Test event allocation (if selected)
   - Test prospect removal
   - Test EA updates
   - Test logging
   - Test error cases

2. **archiveProspect.test.ts**
   - Test prospect validation
   - Test prospect removal
   - Test EA updates (if EA assigned)
   - Test logging
   - Test error cases

3. **findMatchingEvents.test.ts**
   - Test name matching (exact, fuzzy)
   - Test location filtering
   - Test sorting (distance + quality)
   - Test no coordinates case
   - Test no matches case

### Integration Tests

1. **showLaunchDialog.test.ts**
   - Test dialog display
   - Test event matching UI
   - Test event selection
   - Test EA selection
   - Test launch flow
   - Test cancellation

2. **showArchiveDialog.test.ts**
   - Test dialog display
   - Test archive flow
   - Test cancellation

### UI Tests

1. **populateProspectsTable.test.ts**
   - Test Launch button presence
   - Test Archive button presence
   - Test Remove button absence
   - Test button click handlers
   - Test accessibility (ARIA labels)

## Key Dependencies

### Existing Functions

- `searchEvents(query, events)` - Event name matching
- `assignEventToAmbassador(...)` - Event allocation
- `calculateAllCapacityStatuses(...)` - Capacity recalculation
- `saveProspectiveEvents(...)` - Prospect persistence
- `persistEventAmbassadors(...)` - EA persistence
- `persistChangesLog(...)` - Log persistence

### Existing Patterns

- Prospect removal: `populateProspectsTable.ts` (lines ~255-309)
- EA updates: `reallocateProspect.ts`
- Event allocation: `allocateEventFromMap.ts`
- Dialog patterns: `showAddProspectDialog.ts`, `showEventSearchDialog.ts`

## Common Pitfalls

1. **Forgetting EA updates**: Always update `ea.prospectiveEvents` array when removing prospect
2. **Missing capacity recalculation**: Call `calculateAllCapacityStatuses` after EA updates
3. **Incorrect log entry types**: Use "Prospect Launched" and "Prospect Archived" (not "Prospect Removed")
4. **Location filtering without coordinates**: Check if `prospect.coordinates` exists before filtering
5. **Event allocation without validation**: Validate EA and event exist before allocation

## Success Criteria

- ✅ Launch/Archive buttons replace Remove button in Prospects table
- ✅ Launch flow finds matching events, allows manual selection
- ✅ Archive flow simply removes prospect (no event matching)
- ✅ EA allocation counts update correctly after launch/archive
- ✅ All actions logged with correct entry types
- ✅ UI refreshes after launch/archive
- ✅ All tests pass
- ✅ Code passes linting and type checking

## Next Steps

1. Implement `launchProspect.ts` and tests
2. Implement `archiveProspect.ts` and tests
3. Implement `findMatchingEvents.ts` and tests
4. Implement launch/archive dialogs and tests
5. Update `populateProspectsTable.ts` to replace Remove with Launch/Archive
6. Update README with Launch/Archive functionality
7. Run full test suite and verify all tests pass
