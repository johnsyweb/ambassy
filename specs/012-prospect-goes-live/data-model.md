# Data Model: End of Prospect Lifecycle

**Feature**: 012-prospect-goes-live
**Date**: 2026-01-18
**Phase**: 1 - Design & Contracts

## Overview

This feature extends the existing prospect and event data models to support prospect lifecycle completion (Launch and Archive). No new entities are introduced; the feature modifies existing entities through removal and optional allocation.

## Core Entities

### ProspectiveEvent (Existing - Modified via Removal)

The prospect being launched or archived. The entity is removed from the system, not modified.

**Key Attributes Used**:
- `id: string` - Used to identify prospect for removal
- `prospectEvent: string` - Prospect name for event matching
- `country: string` - Country for location context
- `state: string` - State for location context
- `eventAmbassador: string` - Assigned EA (if any) for allocation count updates
- `coordinates?: Coordinate` - Location for event matching (if available)

**Lifecycle Transitions**:
```
ProspectiveEvent (exists)
  → Launch → Removed (optional: EventDetails allocated to EA)
  → Archive → Removed (no event allocation)
```

**Validation Rules**:
- Prospect must exist before launch/archive
- Prospect may or may not have assigned EA
- Prospect may or may not have coordinates

### EventAmbassador (Existing - Modified via Array Updates)

If the prospect had an assigned EA, their `prospectiveEvents` array is updated to remove the prospect ID.

**Key Attributes Modified**:
- `prospectiveEvents: string[]` - Prospect ID removed from this array
- `allocationCount` - Recalculated after prospect removal (via `calculateAllCapacityStatuses`)

**Update Pattern**:
```typescript
if (ea.prospectiveEvents) {
  ea.prospectiveEvents = ea.prospectiveEvents.filter(id => id !== prospectId);
}
```

### EventDetails (Existing - Used for Matching)

Potential matching events when launching a prospect. Used for manual selection by REA.

**Key Attributes Used for Matching**:
- `properties.EventShortName: string` - Primary name field
- `properties.EventLongName: string` - Long name field
- `properties.eventname: string` - Alternative name field
- `properties.LocalisedEventLongName?: string` - Localised name (if available)
- `geometry.coordinates: [number, number]` - Event location for distance calculation

**Matching Strategy**:
1. Search by name using `searchEvents(prospectName, eventDetails)` - returns matches sorted by quality
2. Filter by location (distance from prospect coordinates) - max 50km threshold
3. Sort by distance (closest first) then match quality
4. Present all matches to REA for manual selection

### LogEntry (Existing - Extended Usage)

Log entries for launch and archive actions. Structured to support potential future undo functionality.

**Log Entry Types**:
- `"Prospect Launched"` - Prospect marked as launched
- `"Prospect Archived"` - Prospect marked as archived

**Launch Log Entry Structure**:
```typescript
{
  type: "Prospect Launched",
  event: `Prospect "${prospect.prospectEvent}" (${prospect.country}, ${prospect.state}) launched`,
  oldValue: prospect.eventAmbassador || "Unassigned",
  newValue: selectedEventEA || "No event allocated",
  timestamp: Date.now()
}
```

**Archive Log Entry Structure**:
```typescript
{
  type: "Prospect Archived",
  event: `Prospect "${prospect.prospectEvent}" (${prospect.country}, ${prospect.state}) archived (not viable)`,
  oldValue: prospect.eventAmbassador || "Unassigned",
  newValue: "Archived",
  timestamp: Date.now()
}
```

**Future Undo Support**:
- Log entries contain prospect name, country, state, assigned EA (if any)
- Launch entries contain matched event (if allocated) and EA
- May need structured data (JSON in `event` field) or extended LogEntry interface in future

### ProspectiveEventList (Existing - Used for Removal)

Collection of prospects. Used to remove prospects via `remove(id: string)` method.

**Key Methods Used**:
- `remove(id: string): boolean` - Removes prospect by ID
- `getAll(): ProspectiveEvent[]` - Returns all prospects for persistence

## State Transitions

### Prospect Lifecycle

```
[ProspectiveEvent Exists]
    ↓
  Launch? ──────→ [Event Matching] ───→ [Event Allocation?] ───→ [Removed, Event Allocated]
    │                                                                              │
    └──────────────────────────────────────────────────────────────────────────────┘
    │
  Archive? ───→ [Removed, No Event Allocation]
```

### EA Allocation Updates

```
[EA.prospectiveEvents includes prospectId]
    ↓
[Launch/Archive]
    ↓
[EA.prospectiveEvents filtered (prospectId removed)]
    ↓
[calculateAllCapacityStatuses() recalculates allocationCount]
```

## Data Flow

### Launch Flow

1. **Input**: Prospect ID, eventDetails (for matching)
2. **Match Events**: `searchEvents(prospectName, eventDetails)` + location filter
3. **REA Selection**: Manual selection of matching event (or none)
4. **Event Allocation**: If event selected, `assignEventToAmbassador(...)`
5. **Prospect Removal**: `prospects.remove(prospectId)`
6. **EA Update**: Remove prospectId from `ea.prospectiveEvents`
7. **Capacity Recalc**: `calculateAllCapacityStatuses(...)`
8. **Persistence**: `saveProspectiveEvents(...)`, `persistEventAmbassadors(...)`
9. **Logging**: Log entry with type "Prospect Launched"
10. **UI Refresh**: Refresh prospects table and map

### Archive Flow

1. **Input**: Prospect ID
2. **Prospect Removal**: `prospects.remove(prospectId)`
3. **EA Update**: Remove prospectId from `ea.prospectiveEvents` (if EA assigned)
4. **Capacity Recalc**: `calculateAllCapacityStatuses(...)`
5. **Persistence**: `saveProspectiveEvents(...)`, `persistEventAmbassadors(...)`
6. **Logging**: Log entry with type "Prospect Archived"
7. **UI Refresh**: Refresh prospects table and map

## Validation Rules

### Launch Validation

- Prospect must exist (`prospects.findById(prospectId)` returns non-null)
- Prospect may or may not have assigned EA
- Prospect may or may not have coordinates (affects location filtering)
- Event selection is optional (can proceed without allocation)
- Selected EA must exist in `eventAmbassadors` (if event allocated)

### Archive Validation

- Prospect must exist (`prospects.findById(prospectId)` returns non-null)
- No event matching/allocation required
- EA may or may not exist (if prospect had assigned EA)

## Edge Cases

### Missing EA

- **Launch**: If prospect's assigned EA no longer exists, log warning, proceed with removal
- **Archive**: Same as launch - proceed with removal, log warning if EA missing

### No Coordinates

- **Launch**: Location filtering disabled, show all name matches, proceed normally
- **Archive**: No impact (no matching required)

### No Matching Events

- **Launch**: Show empty match list, allow proceeding without allocation, remove prospect normally

### Multiple Matching Events

- **Launch**: Show all matches sorted by distance + quality, REA selects manually

### Missing EventDetails

- **Launch**: Skip matching, proceed without allocation, remove prospect normally

## Persistence

### Prospect Removal

- `saveProspectiveEvents(prospects.getAll())` - Persists updated prospect list (prospect removed)
- `persistEventAmbassadors(eventAmbassadors)` - Persists updated EA arrays (prospectId removed)
- `persistChangesLog(log)` - Persists launch/archive log entries

### Event Allocation (Launch only)

- `assignEventToAmbassador(...)` handles event allocation persistence
- Updates `eventAmbassadors`, `eventTeams`, logs allocation separately

## Relationships

### Launch Relationships

```
ProspectiveEvent (removed)
  └─→ eventAmbassador: EventAmbassador (prospectiveEvents updated)
      └─→ regionalAmbassador: RegionalAmbassador (inherited)
  
ProspectiveEvent (removed)
  └─→ coordinates: Coordinate (used for matching)
      └─→ EventDetails[] (potential matches)
          └─→ selectedEvent: EventDetails (allocated to EA)
              └─→ assignEventToAmbassador → EventAmbassador
```

### Archive Relationships

```
ProspectiveEvent (removed)
  └─→ eventAmbassador: EventAmbassador (prospectiveEvents updated)
      └─→ regionalAmbassador: RegionalAmbassador (inherited)
```

## Business Rules

1. **Launch**: Prospect must be removed regardless of event allocation outcome
2. **Archive**: Prospect must be removed, no event allocation offered
3. **EA Allocation Count**: Must be updated after prospect removal (via `calculateAllCapacityStatuses`)
4. **Logging**: All launch/archive actions must be logged for audit trail
5. **Irreversibility**: Launch/archive actions are irreversible (prospect cannot be restored)
6. **Future Undo**: Log entries structured to support potential future undo (not implemented)
