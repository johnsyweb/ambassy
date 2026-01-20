# Research: Add Prospect by Address

**Feature**: 011-add-prospect-by-address  
**Date**: 2026-01-18  
**Phase**: 0 - Research

## Research Tasks & Findings

### 1. Dialog Pattern Analysis

**Decision**: Follow existing dialog patterns from `showAddressDialog`, `showEventAllocationDialog`, and `showReallocationDialog`.

**Rationale**: 
- Consistent UX across the application
- Proven accessibility patterns (ARIA attributes, keyboard navigation)
- Established error handling and loading state patterns
- Reuses existing dialog DOM structure (`reallocationDialog` or create new dedicated dialog)

**Key Patterns Identified**:
- Dialog elements: `dialog`, `title`, `content`, `cancelButton` from DOM
- ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Keyboard handling: Escape to cancel, Enter to submit, Tab navigation
- Loading states: Disable inputs/buttons, show loading indicator
- Error display: Dedicated error message div with `role="alert"`
- Event cleanup: Remove event listeners on cancel/close

**Alternatives Considered**:
- Creating new dialog HTML element: Rejected - would require HTML changes and duplicate accessibility setup
- Using a dialog library: Rejected - violates open source preference and adds unnecessary dependency

### 2. Geocoding Integration

**Decision**: Use existing `geocodeAddress` utility from `utils/geocoding.ts` with automatic retry and manual coordinate fallback.

**Rationale**:
- Already handles Nominatim API integration
- Supports coordinate format detection
- Error handling already implemented
- No rate limiting concerns for single-user usage

**Key Findings**:
- Function signature: `geocodeAddress(address: string): Promise<{lat: number, lng: number}>`
- Throws errors on failure (must be caught)
- Returns coordinates in standard format
- No built-in retry logic (must implement in dialog)
- Manual coordinate entry supported via coordinate format detection

**Alternatives Considered**:
- Alternative geocoding services: Rejected - Nominatim is free, open source, and already integrated
- Client-side geocoding: Rejected - requires large datasets and doesn't match existing patterns

### 3. Allocation Algorithm Integration

**Decision**: Adapt `suggestEventAllocation` to work with prospect coordinates by creating a temporary event name or modifying the function to accept coordinates directly.

**Rationale**:
- `suggestEventAllocation` requires an event name from `eventDetails` map
- Prospects don't have event names initially
- Need to either: (a) create temporary EventDetails entry, or (b) create coordinate-based variant

**Key Findings**:
- Function signature: `suggestEventAllocation(eventName: string, eventAmbassadors: EventAmbassadorMap, eventDetails: EventDetailsMap, regionalAmbassadors: RegionalAmbassadorMap): ReallocationSuggestion[]`
- Returns `ReallocationSuggestion[]` sorted by score (highest first)
- Uses `eventDetails.get(eventName)` to get coordinates
- Can create temporary EventDetails entry with prospect name and coordinates
- Alternative: Create `suggestProspectAllocation(coordinates: Coordinate, ...)` variant

**Decision**: Create temporary EventDetails entry for prospect to reuse existing algorithm.

**Alternatives Considered**:
- Duplicating allocation logic: Rejected - violates DRY principle
- Modifying `suggestEventAllocation` to accept coordinates: Rejected - breaks existing usage, better to create wrapper

### 4. Prospect Creation Pattern

**Decision**: Follow existing prospect creation patterns from CSV import, using `generateProspectiveEventId` and `validateProspectiveEvent`.

**Rationale**:
- Consistent ID generation ensures uniqueness
- Validation ensures data integrity
- Default values match CSV import expectations

**Key Findings**:
- ID generation: `generateProspectiveEventId(prospectEvent: string, country: string, state: string): string`
- Format: `${prospectEvent}-${country}-${state}` (normalized) + timestamp + random
- Validation: `validateProspectiveEvent(event: ProspectiveEvent): ValidationResult`
- Required fields: `prospectEvent`, `country` (validated)
- Default values from CSV import:
  - `geocodingStatus: 'pending'` → should be `'success'` or `'manual'` for new prospects
  - `ambassadorMatchStatus: 'pending'` → should be `'matched'` since EA is assigned during creation
  - `importTimestamp: Date.now()`
  - `sourceRow: 0` (or -1 to indicate manual creation)
  - Boolean flags: `false` (from CSV parsing)
  - `dateMadeContact: null` (unless provided)
  - `prospectEDs: ""` (unless provided)

**Alternatives Considered**:
- Different ID format: Rejected - must match existing pattern for consistency
- Skipping validation: Rejected - violates data integrity requirements

### 5. UI Integration Patterns

**Decision**: Follow existing button setup patterns in `index.ts` and integrate with existing refresh mechanisms.

**Rationale**:
- Consistent with other "Add" buttons (Add Event Ambassador, Add Regional Ambassador)
- Reuses existing table refresh and map update mechanisms
- Integrates with change tracking/logging

**Key Findings**:
- Button setup: `setupOnboardingButtons()` pattern in `index.ts`
- Button placement: Main toolbar alongside other "Add" buttons
- Table refresh: `refreshProspectsTable()` function exists
- Map update: `populateMap()` function handles prospect markers
- Change tracking: `trackStateChange()` called after state modifications
- Change logging: `trackChanges()` creates log entries

**Integration Points**:
1. Add button handler in `index.ts` (similar to `setupOnboardingButtons`)
2. Call `refreshProspectsTable()` after prospect creation
3. Call `populateMap()` or trigger map refresh after prospect creation
4. Call `trackStateChange()` after state modification
5. Create log entry via `trackChanges()` with prospect creation details

**Alternatives Considered**:
- Separate refresh mechanism: Rejected - would duplicate existing functionality
- Manual DOM updates: Rejected - violates single responsibility, better to use existing refresh functions

### 6. Country Inference from Coordinates

**Decision**: Use existing `getCountryCodeFromCoordinate` function to infer country from geocoded coordinates.

**Rationale**:
- Already implemented and tested
- Handles coordinate-to-country mapping
- Returns country code (number) which needs conversion to country name string

**Key Findings**:
- Function: `getCountryCodeFromCoordinate(coordinate: Coordinate): Promise<number>`
- Returns country code as number (0 for unknown)
- Need to convert country code to country name string for `ProspectiveEvent.country`
- May need to look up country name from code (check if utility exists)

**Alternatives Considered**:
- Manual country entry: Rejected - violates requirement to infer from coordinates
- Alternative geocoding service with country: Rejected - Nominatim doesn't reliably return country in standard format

### 7. Automatic Geocoding Trigger

**Decision**: Implement automatic geocoding when both address and state fields are filled, using debouncing to avoid excessive API calls.

**Rationale**:
- Improves UX by providing immediate feedback
- Reduces user clicks
- Must debounce to avoid rate limiting on rapid typing

**Key Findings**:
- Can use `setTimeout` with debouncing (e.g., 500ms delay after last keystroke)
- Should trigger on field blur as well (immediate trigger)
- Must cancel pending geocoding if address changes during geocoding
- Loading state must be shown during geocoding

**Implementation Pattern**:
```typescript
let geocodeTimeout: NodeJS.Timeout | null = null;
let currentGeocodeAbort: AbortController | null = null;

function triggerGeocoding() {
  if (geocodeTimeout) clearTimeout(geocodeTimeout);
  if (currentGeocodeAbort) currentGeocodeAbort.abort();
  
  geocodeTimeout = setTimeout(async () => {
    // Perform geocoding
  }, 500);
}
```

**Alternatives Considered**:
- Manual "Geocode" button: Rejected - violates requirement for automatic triggering
- Immediate geocoding on every keystroke: Rejected - would cause excessive API calls

### 8. Re-geocoding on Address Change

**Decision**: Automatically re-geocode when address field changes after initial geocoding, with debouncing.

**Rationale**:
- Keeps allocation suggestions current
- Avoids stale data
- Must debounce to avoid excessive API calls

**Implementation**:
- Track whether geocoding has completed successfully
- On address field change after successful geocoding, trigger new geocoding
- Cancel previous geocoding if still in progress
- Update allocation suggestions after new geocoding completes

**Alternatives Considered**:
- Manual re-geocode button: Rejected - violates requirement for automatic re-geocoding
- No re-geocoding: Rejected - would leave stale suggestions

## Summary

All research tasks completed. Key decisions:
1. Follow existing dialog patterns for consistency
2. Use existing geocoding utility with error handling
3. Create temporary EventDetails entry to reuse allocation algorithm
4. Follow existing prospect creation patterns (ID generation, validation)
5. Integrate with existing refresh and tracking mechanisms
6. Use existing country inference function
7. Implement automatic geocoding with debouncing
8. Implement automatic re-geocoding on address change

No blocking issues identified. Ready to proceed to Phase 1 (Design & Contracts).
