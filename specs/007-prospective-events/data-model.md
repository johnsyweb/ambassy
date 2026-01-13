# Data Model: Prospective Events

## Overview

The Prospective Events feature extends the existing ambassador and event data models to support potential future parkrun events with comprehensive prospect tracking information.

## Core Entities

### ProspectiveEvent
Represents a potential future parkrun event with detailed prospect tracking.

```typescript
interface ProspectiveEvent {
  // Identity
  id: string; // Auto-generated unique identifier

  // Event Details
  prospectEvent: string; // Name of the prospective event
  country: string; // Country where event would be held
  state: string; // State/region information
  prospectEDs: string; // Prospect Event Director(s) name
  eventAmbassador: string; // Assigned Event Ambassador

  // Status Flags
  courseFound: boolean; // Whether suitable course has been found
  landownerPermission: boolean; // Whether landowner permission obtained
  fundingConfirmed: boolean; // Whether funding is confirmed

  // Timeline
  dateMadeContact: Date | null; // When contact was first made

  // Location (may be incomplete)
  coordinates?: [number, number]; // Lat/lng if geocoded

  // Status tracking
  geocodingStatus: 'pending' | 'success' | 'failed' | 'manual';
  ambassadorMatchStatus: 'pending' | 'matched' | 'unmatched';

  // Metadata
  importTimestamp: number;
  sourceRow: number; // Original CSV row for reference
  edit?: string; // Edit notes or additional information
  notes?: string; // User-added notes or issues
}
```

### ProspectiveEventList
Collection of prospective events with management methods.

```typescript
interface ProspectiveEventList {
  events: ProspectiveEvent[];
  add(event: ProspectiveEvent): void;
  remove(id: string): void;
  findById(id: string): ProspectiveEvent | undefined;
  getUnresolved(): ProspectiveEvent[];
  getResolved(): ProspectiveEvent[];
}
```

## Relationships

### Inheritance from Existing Models
- **EventAmbassador**: Prospective events reference existing EA names and count towards EA allocations
- **RegionalAmbassador**: Prospects inherit REA from their assigned EA
- **EventDetails**: May eventually become full EventDetails entries
- **Country/State**: Reference existing geographic data structures

### Allocation Impact
- **EA Allocations**: Each prospect counts towards the assigned EA's allocation limit
- **REA Inheritance**: Prospects automatically inherit the REA of their assigned EA (inferred, not stored)
- **Reallocation**: Prospects can be reallocated between EAs using Event Team allocation workflow

### Structure
```
RegionalAmbassador (existing)
├── supportsEAs: string[] (existing)
└── inheritedProspects: string[] (via EAs - inferred)
    ↓
EventAmbassador (existing)
├── supportsEvents: string[] (existing)
├── prospectiveEvents: string[] (new)
├── regionalAmbassador: string (existing)
└── allocationCount: number (includes prospects)
    ↓
ProspectiveEvent (new)
├── eventAmbassador: string
├── country: string (inferred REA via EA)
├── state: string
└── coordinates?: [number, number]
```

## State Transitions

### Geocoding Status
```
pending → success (coordinates found)
      → failed (geocoding unsuccessful)
      → manual (requires user intervention)
```

### Ambassador Match Status
```
pending → matched (EA/RA found in existing data)
       → unmatched (requires user allocation)
```

## Validation Rules

### ProspectiveEvent Validation
- `id`: Required, unique, auto-generated
- `prospectEvent`: Required, non-empty string
- `country`: Required, valid country name
- `state`: Optional, but validated if provided
- `eventAmbassador`: Must match existing EA name (if provided)
- `courseFound`, `landownerPermission`, `fundingConfirmed`: Boolean values
- `dateMadeContact`: Valid date format if provided
- `coordinates`: Valid lat/lng range if present
- `geocodingStatus`: Must be valid enum value
- `ambassadorMatchStatus`: Must be valid enum value

### Business Rules
- `prospectEvent` should be unique within country/state
- `eventAmbassador` must exist in existing ambassador data
- `regionalAmbassador` is automatically set based on EA's REA relationship
- Each prospect counts towards the assigned EA's allocation limit
- Status flags should be boolean values (true/false)
- Dates should be parseable and reasonable (not in far future/past)
- Country/state combinations should be valid geographic locations
- Prospects can be reallocated between EAs without changing core prospect data

## Storage & Persistence

### localStorage Keys
- `prospectiveEvents`: Serialized ProspectiveEventList
- Integration with existing `regionalAmbassadors` and `eventAmbassadors` keys

### Serialization
- JSON serialization with date/number preservation
- Backward compatibility with existing data structures
- Migration support for adding prospective events to existing RAs/EAs

## Integration Points

### Existing Models Extension
- Add `prospectiveEvents?: string[]` to RegionalAmbassador interface
- Add `prospectiveEvents?: string[]` to EventAmbassador interface
- Extend event resolution workflows to handle prospective events

### CSV Import Data Flow
```
CSV Row → ProspectiveEvent (parsing)
         → Geocoding Attempt → Coordinate resolution
         → Ambassador Matching → Relationship validation
         → Storage → UI Display
```