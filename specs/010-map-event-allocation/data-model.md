# Data Model: Map Event Allocation

**Feature**: Map Event Allocation  
**Date**: 2026-01-15

## Overview

This feature extends existing data models to support allocation of unallocated events from the map interface. No new data structures are required - the feature works with existing models.

## Existing Entities

### EventDetails

**Source**: External parkrun API (GeoJSON format)

```typescript
interface EventDetails {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    eventname: string;
    EventLongName: string;
    EventShortName: string;
    LocalisedEventLongName: string | null;
    countrycode: number;
    seriesid: number;
    EventLocation: string;
  };
}
```

**Usage in Feature**: 
- All events (allocated and unallocated) exist in `EventDetailsMap`
- Used to determine which events are available for allocation
- Provides coordinates, series, country information for display

### EventTeam

**Source**: CSV import or manual entry

```typescript
interface EventTeam {
  eventShortName: string;
  eventAmbassador: string;
  eventDirectors: string[];
}
```

**Usage in Feature**:
- Contains Event Directors information (may exist for unallocated events)
- Used to populate Event Directors column in Event Teams table
- May not exist for all events (some events may have no EventTeam data)

### EventTeamsTableData

**Source**: Derived from `extractEventTeamsTableData` function

```typescript
interface EventTeamsTableData {
  eventShortName: string;
  eventDirectors: string;
  eventAmbassador: string;
  regionalAmbassador: string;
  eventCoordinates: string;
  eventSeries: number;
  eventCountryCode: number;
  eventCountry: string;
}
```

**Usage in Feature**:
- Only includes events that have EA assignments (allocated events)
- Unallocated events are NOT in this map
- After allocation, newly allocated events appear in this map
- Used to populate Event Teams table and determine map marker appearance

### EventAmbassador

**Source**: Onboarding or transitions

```typescript
interface EventAmbassador {
  name: string;
  events: string[];
  prospectiveEvents?: string[];
  capacityStatus?: CapacityStatus;
  conflicts?: string[];
  regionalAmbassador?: string;
  state?: string;
}
```

**Usage in Feature**:
- Selected from allocation dialog
- Event is added to `events` array during allocation
- `regionalAmbassador` field used to determine supporting REA

### RegionalAmbassador

**Source**: Onboarding or transitions

```typescript
interface RegionalAmbassador {
  name: string;
  state: string;
  supportsEAs: string[];
  prospectiveEvents?: string[];
  capacityStatus?: CapacityStatus;
  conflicts?: string[];
  eventsForReallocation?: string[];
  prospectiveEventsForReallocation?: string[];
}
```

**Usage in Feature**:
- Automatically determined from EA's `regionalAmbassador` field
- Or looked up via `getRegionalAmbassadorForEventAmbassador` utility
- Displayed in Event Teams table as supporting REA

## Data Flow

### Unallocated Event Identification

1. **Input**: `eventDetails: EventDetailsMap` (all events from API)
2. **Input**: `eventTeamsTableData: EventTeamsTableDataMap` (only allocated events)
3. **Logic**: Event is unallocated if `eventDetails.has(eventName) && !eventTeamsTableData.has(eventName)`
4. **Output**: List of unallocated events for map display

### Allocation Flow

1. **User Action**: Click unallocated event marker on map
2. **System**: Detect event is unallocated (not in `eventTeamsTableData`)
3. **System**: Show allocation dialog with EA suggestions
4. **User Action**: Select EA from dialog
5. **System**: Call `assignEventToAmbassador(eventName, "", selectedEA, ...)`
6. **System**: Determine REA using `getRegionalAmbassadorForEventAmbassador(selectedEA, regionalAmbassadors)`
7. **System**: Update `eventAmbassadors` (event added to EA's events array)
8. **System**: Regenerate `eventTeamsTableData` using `extractEventTeamsTableData`
9. **System**: Refresh map (`populateMap`) and table (`populateEventTeamsTable`)
10. **System**: Log change in changes log

### Event Directors Display

1. **Source**: `EventTeam.eventDirectors: string[]` (may be empty or undefined)
2. **Transformation**: `eventTeam?.eventDirectors.join(", ") ?? "N/A"`
3. **Display**: Event Teams table "Event Director(s)" column
4. **Display**: Map tooltip (for allocated events)

**Note**: Event Directors may exist for unallocated events if EventTeam data was imported. After allocation, Event Directors are displayed in the table using the same logic as existing allocated events.

## State Transitions

### Event Allocation State

```
Unallocated Event
  (exists in eventDetails, not in eventTeamsTableData)
    ↓
  [User clicks marker]
    ↓
  [User selects EA]
    ↓
  [assignEventToAmbassador called]
    ↓
Allocated Event
  (exists in eventDetails AND eventTeamsTableData)
```

### Map Marker Appearance

```
Unallocated: radius=1, color=DEFAULT_EVENT_COLOUR, tooltip=eventName only
    ↓
Allocated: radius=5, color=EA_COLOR, tooltip=full event details (EA, REA, Event Directors)
```

## Validation Rules

1. **Event must exist in eventDetails**: Cannot allocate events that don't exist in the system
2. **Event must not already be allocated**: Check `!eventTeamsTableData.has(eventName)` before showing allocation dialog
3. **Selected EA must exist**: Validate `eventAmbassadors.has(selectedEA)` before allocation
4. **EA must have supporting REA**: If EA has no `regionalAmbassador` field and no REA found via lookup, show warning but allow allocation (REA will be empty/null)

## Edge Cases

1. **Event with EventTeam data but no EA**: Event Directors will be displayed after allocation
2. **Event without EventTeam data**: Event Directors will show "N/A" after allocation
3. **EA without supporting REA**: REA column will be empty/null, but allocation proceeds
4. **No Event Ambassadors exist**: Show error message, cannot allocate
5. **Event already allocated**: Prevent showing allocation dialog (should not occur if check is correct)

## Data Persistence

- **Event Ambassadors**: Persisted via `persistEventAmbassadors` (localStorage)
- **Event Teams Table Data**: Derived/regenerated, not directly persisted
- **Changes Log**: Persisted via `persistChangesLog` (localStorage)
- **Event Details**: Loaded from API, not persisted locally
- **Event Teams**: Persisted via `persistEventTeams` (localStorage) if EventTeam data exists

## Relationships

```
EventDetails (all events)
  ↓ (filtered by allocation status)
EventTeamsTableData (allocated events only)
  ↓ (contains)
EventAmbassador (assigned EA)
  ↓ (has)
RegionalAmbassador (supporting REA)
  ↓ (may have)
EventTeam (Event Directors, if data exists)
```
