# Quickstart: Map Event Allocation

**Feature**: Map Event Allocation  
**Date**: 2026-01-15

## Overview

This feature enables users to allocate unallocated events to Event Ambassadors directly from the map interface. Events without EA assignments are visually distinct on the map (smaller markers, default color) and can be clicked to initiate allocation.

## User Workflow

### Allocating an Unallocated Event

1. **View Map**: Events without EA allocation appear as small markers (radius: 1) with default purple color
2. **Click Unallocated Event**: Click on an unallocated event marker
3. **Allocation Dialog**: A dialog appears showing:
   - Event name and details
   - Event Directors (if known)
   - Top 3-5 suggested Event Ambassadors
   - "Other" dropdown for manual selection
4. **Select EA**: Choose an Event Ambassador from suggestions or dropdown
5. **Allocation Complete**: 
   - Event is assigned to selected EA
   - Supporting REA is automatically determined
   - Map marker updates (larger size, EA's color)
   - Event appears in Event Teams table
   - Change is logged

### Visual Indicators

**Unallocated Events**:
- Marker: Small circle (radius: 1)
- Color: Default purple (`rebeccapurple`)
- Tooltip: Event name only

**Allocated Events**:
- Marker: Larger circle (radius: 5)
- Color: EA's assigned color
- Tooltip: Full event details (Event Directors, EA, REA)

## Developer Workflow

### Setting Up Development

1. **Branch**: Check out `010-map-event-allocation`
2. **Dependencies**: No new dependencies required
3. **Existing Functions**: Review `assignEventToAmbassador`, `showReallocationDialog`, `populateMap`

### Implementation Steps

1. **Create `allocateEventFromMap` function**:
   ```typescript
   // src/actions/allocateEventFromMap.ts
   export function allocateEventFromMap(...)
   ```

2. **Create/Extend allocation dialog**:
   ```typescript
   // src/actions/showEventAllocationDialog.ts
   // Or extend showReallocationDialog.ts
   export function showEventAllocationDialog(...)
   ```

3. **Extend `selectMapEvent`**:
   ```typescript
   // src/actions/tableMapNavigation.ts
   // Add unallocated event detection
   // Show allocation dialog if unallocated
   ```

4. **Update map click handler**:
   ```typescript
   // src/index.ts
   // Pass eventTeamsTableData to selectMapEvent
   // Handle allocation callback
   ```

5. **Test**:
   - Unit tests for new functions
   - Integration tests for allocation flow
   - Manual testing in browser

### Key Functions

#### `allocateEventFromMap`

Allocates an unallocated event to an Event Ambassador.

```typescript
allocateEventFromMap(
  "albertpark",           // event name
  "John Smith",           // selected EA
  eventAmbassadors,        // EA map
  regionalAmbassadors,     // REA map
  eventTeams,             // Event Teams map
  eventDetails,           // Event details map
  log                     // Changes log
);
```

#### `showEventAllocationDialog`

Shows dialog for selecting EA to allocate event.

```typescript
showEventAllocationDialog(
  "albertpark",           // event name
  eventDetails,           // for displaying event info
  eventAmbassadors,       // for EA selection
  regionalAmbassadors,    // for REA display
  eventTeams,             // for Event Directors
  (eaName) => {           // onSelect callback
    // Handle allocation
  },
  () => {                 // onCancel callback
    // Handle cancellation
  }
);
```

### Testing

#### Unit Tests

```typescript
// src/actions/allocateEventFromMap.test.ts
describe("allocateEventFromMap", () => {
  it("should allocate event to EA", () => {
    // Test allocation
  });
  
  it("should throw error if EA not found", () => {
    // Test error handling
  });
});
```

#### Integration Tests

```typescript
// src/actions/tableMapNavigation.test.ts (extend)
describe("selectMapEvent with unallocated events", () => {
  it("should show allocation dialog for unallocated event", () => {
    // Test dialog display
  });
});
```

### Common Issues

#### Event Not Appearing in Table After Allocation

**Cause**: `eventTeamsTableData` not regenerated after allocation

**Solution**: Call `extractEventTeamsTableData` after allocation, then `populateEventTeamsTable`

#### Map Not Updating After Allocation

**Cause**: `populateMap` not called after allocation

**Solution**: Call `populateMap` with updated `eventTeamsTableData` after allocation

#### REA Not Showing After Allocation

**Cause**: EA has no `regionalAmbassador` field and lookup fails

**Solution**: Ensure EA's `regionalAmbassador` is set during onboarding or use `getRegionalAmbassadorForEventAmbassador` as fallback

## Architecture Notes

### Data Flow

```
User clicks unallocated event marker
  ↓
selectMapEvent detects unallocated event
  ↓
showEventAllocationDialog displays dialog
  ↓
User selects EA
  ↓
allocateEventFromMap allocates event
  ↓
assignEventToAmbassador updates EA's events array
  ↓
extractEventTeamsTableData regenerates table data
  ↓
populateMap refreshes map
  ↓
populateEventTeamsTable refreshes table
```

### Key Design Decisions

1. **Reuse existing patterns**: `showReallocationDialog` pattern for consistency
2. **Automatic REA assignment**: Determined from EA's hierarchy, no manual selection
3. **Event Directors display**: Uses existing `EventTeam` model, no new data structure
4. **Map refresh**: Full refresh via `populateMap` for simplicity and reliability

## Next Steps

1. Implement `allocateEventFromMap` function
2. Create/extend allocation dialog
3. Extend `selectMapEvent` for unallocated events
4. Write unit tests
5. Write integration tests
6. Manual testing in browser
7. Update README if needed
