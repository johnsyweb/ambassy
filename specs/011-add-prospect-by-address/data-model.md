# Data Model: Add Prospect by Address

**Feature**: 011-add-prospect-by-address  
**Date**: 2026-01-18  
**Phase**: 1 - Design & Contracts

## Overview

This feature extends the existing `ProspectiveEvent` data model to support creation via address entry. No new entities are introduced; the feature uses existing data structures with specific field population patterns.

## Core Entities

### ProspectiveEvent (Existing - Extended Usage)

Represents a potential future parkrun event. When created via address entry, specific fields are populated as follows:

```typescript
interface ProspectiveEvent {
  // Identity
  id: string; // Generated via generateProspectiveEventId(prospectEvent, country, state)
  
  // Event Details (Required)
  prospectEvent: string; // User-entered prospect name (required)
  country: string; // Inferred from coordinates via getCountryCodeFromCoordinate (required)
  state: string; // User-entered state/region (required)
  
  // Event Details (Optional - can be provided at creation)
  prospectEDs: string; // Event Director(s) name (optional, defaults to "")
  eventAmbassador: string; // Selected EA name (required after selection)
  
  // Status Flags (Optional - can be provided at creation)
  courseFound: boolean; // Defaults to false
  landownerPermission: boolean; // Defaults to false
  fundingConfirmed: boolean; // Defaults to false
  
  // Timeline (Optional - can be provided at creation)
  dateMadeContact: Date | null; // Defaults to null
  
  // Location (Required - from geocoding or manual entry)
  coordinates?: Coordinate; // From geocodeAddress or manual entry (required for creation)
  
  // Processing Status
  geocodingStatus: 'pending' | 'success' | 'failed' | 'manual';
  // 'success' if geocoded successfully, 'manual' if coordinates entered manually
  
  ambassadorMatchStatus: 'pending' | 'matched' | 'unmatched';
  // 'matched' since EA is assigned during creation
  
  // Metadata
  importTimestamp: number; // Date.now() at creation time
  sourceRow: number; // -1 to indicate manual creation (not from CSV)
  notes?: string; // Optional user notes
}
```

### Field Population Rules

**At Dialog Open**:
- All fields empty/unset except defaults

**After Geocoding Success**:
- `coordinates`: Set from geocoding result
- `country`: Inferred from coordinates via `getCountryCodeFromCoordinate`
- `geocodingStatus`: Set to `'success'`

**After Manual Coordinate Entry**:
- `coordinates`: Set from manual entry
- `country`: Inferred from coordinates via `getCountryCodeFromCoordinate`
- `geocodingStatus`: Set to `'manual'`

**After EA Selection**:
- `eventAmbassador`: Set to selected EA name
- `ambassadorMatchStatus`: Set to `'matched'`

**At Prospect Creation**:
- `id`: Generated via `generateProspectiveEventId(prospectEvent, country, state)`
- `importTimestamp`: Set to `Date.now()`
- `sourceRow`: Set to `-1` (indicates manual creation)
- All optional fields: Use user-provided values or defaults (false for booleans, "" for strings, null for dates)

### Validation Rules

**Before Geocoding**:
- `prospectEvent`: Must be non-empty (trimmed)
- `state`: Must be non-empty (trimmed)
- `address`: Must be non-empty (trimmed) - for geocoding only, not stored

**Before Prospect Creation**:
- `prospectEvent`: Required (validated via `validateProspectiveEvent`)
- `country`: Required (validated via `validateProspectiveEvent`)
- `state`: Required (validated via `validateProspectiveEvent`)
- `coordinates`: Required (either from geocoding or manual entry)
- `eventAmbassador`: Required (must be selected)
- All fields must pass `validateProspectiveEvent` checks

**Business Rules**:
- At least one EA must exist in system (FR-015)
- Country must be inferred successfully (or use default code 0 if inference fails)
- Coordinates must be valid (validated via `isValidCoordinate`)

## Supporting Entities

### ReallocationSuggestion (Existing - Used for EA Suggestions)

Used to display EA allocation suggestions:

```typescript
interface ReallocationSuggestion {
  fromAmbassador: string; // Empty string for new allocations
  toAmbassador: string; // EA name
  items: string[]; // [prospectEvent] for prospects
  score: number; // Higher = better match
  reasons?: string[]; // Why this EA is suggested
  warnings?: string[]; // Capacity or other warnings
  allocationCount?: number; // Total allocations (live + prospects)
  liveEventsCount?: number; // Live events count
  prospectEventsCount?: number; // Prospect events count
  neighboringEvents?: Array<{ name: string; distanceKm: number }>; // Nearby events
}
```

### GeocodingResult (Existing - Used for Geocoding)

Result from `geocodeAddress`:

```typescript
interface GeocodingResult {
  lat: number | string;
  lon: number | string;
  lng?: number | string;
  display_name: string;
}
```

### Coordinate (Existing - Used for Location)

Location coordinate:

```typescript
type Coordinate = [number, number]; // [latitude, longitude]
```

## State Transitions

### Dialog State Machine

```
[Initial] 
  → [Entering Details] (user enters prospect name, address, state)
  → [Geocoding] (automatic trigger when address + state filled)
    → [Geocoding Success] → [Showing Suggestions] (allocation suggestions displayed)
    → [Geocoding Failed] → [Error State] (options: retry or manual coordinates)
  → [Manual Coordinates] (user enters coordinates manually)
    → [Showing Suggestions] (allocation suggestions displayed)
  → [Selecting EA] (user selects EA from suggestions or manual list)
  → [Creating Prospect] (prospect created and persisted)
  → [Complete] (dialog closed, prospect visible in table/map)
```

### Prospect Lifecycle

```
[Not Created]
  → [Created] (via address entry dialog)
    → [Persisted] (saved to localStorage)
    → [Displayed] (visible in Prospects table and map)
```

## Data Flow

### Creation Flow

1. User enters prospect name, address, state (optional fields can be filled)
2. System triggers geocoding automatically (when address + state filled)
3. System infers country from geocoded coordinates
4. System generates allocation suggestions using temporary EventDetails entry
5. User selects EA (from suggestions or manual list)
6. System creates ProspectiveEvent with all collected data
7. System persists prospect to localStorage
8. System refreshes Prospects table and map
9. System logs change in changes log

### Error Handling

- **Geocoding Failure**: User can retry with different address or enter coordinates manually
- **Country Inference Failure**: System uses default country code (0) and allows creation to proceed
- **No EAs Available**: System prevents prospect creation and shows error message
- **Validation Failure**: System shows validation errors and prevents creation

## Relationships

### ProspectiveEvent Relationships

- **EventAmbassador**: Many-to-one (many prospects can be assigned to one EA)
- **RegionalAmbassador**: Inherited through EA relationship (many-to-one via EA)
- **Coordinate**: One-to-one (each prospect has one coordinate location)

### Integration Points

- **EventDetailsMap**: Temporary entry created for allocation suggestions
- **EventAmbassadorMap**: Used to get EA list and update allocation counts
- **RegionalAmbassadorMap**: Used to infer REA from selected EA
- **ProspectiveEventList**: Used to add new prospect and refresh display

## Constraints

### Uniqueness

- Prospect IDs are unique (generated with timestamp + random component)
- Duplicate prospect names are allowed (may show warning but not prevent creation)

### Referential Integrity

- `eventAmbassador` must exist in `EventAmbassadorMap`
- Inferred REA must exist in `RegionalAmbassadorMap` (if EA has REA relationship)

### Data Integrity

- Coordinates must be valid (latitude: -90 to 90, longitude: -180 to 180)
- Country code must be valid number (0 for unknown)
- All required fields must be non-empty after trimming
- Date fields must be valid Date objects or null
