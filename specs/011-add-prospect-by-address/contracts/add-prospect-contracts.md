# API Contracts: Add Prospect by Address

**Feature**: 011-add-prospect-by-address  
**Date**: 2026-01-18  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the function contracts for the "Add Prospect by Address" feature. All functions follow existing patterns in the codebase and maintain consistency with similar functionality.

## Core Functions

### showAddProspectDialog

**Purpose**: Display dialog for adding a new prospect by address entry.

**Signature**:
```typescript
export function showAddProspectDialog(
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventDetails: EventDetailsMap,
  onSuccess: () => void,
  onCancel: () => void
): void
```

**Parameters**:
- `eventAmbassadors: EventAmbassadorMap` - Map of all Event Ambassadors (required for suggestions and validation)
- `regionalAmbassadors: RegionalAmbassadorMap` - Map of all Regional Ambassadors (required for REA inference)
- `eventDetails: EventDetailsMap` - Map of event details (used for creating temporary entry for allocation suggestions)
- `onSuccess: () => void` - Callback invoked when prospect is successfully created
- `onCancel: () => void` - Callback invoked when dialog is cancelled

**Returns**: `void`

**Behavior**:
- Displays dialog with form fields (prospect name, address, state, optional fields)
- Automatically triggers geocoding when address and state are both filled
- Shows loading indicator during geocoding
- Displays allocation suggestions after successful geocoding
- Handles geocoding failures with retry/manual coordinate options
- Creates prospect when EA is selected and form is valid
- Calls `onSuccess` after successful creation
- Calls `onCancel` when dialog is cancelled

**Preconditions**:
- Dialog elements must exist in DOM (`reallocationDialog` or dedicated dialog)
- `eventAmbassadors` must not be empty (validated before showing suggestions)

**Postconditions**:
- If successful: Prospect created, persisted, table/map refreshed, change logged
- If cancelled: No changes made, dialog closed

**Error Handling**:
- Geocoding failures: Show error message with retry/manual coordinate options
- Validation failures: Show validation errors, prevent creation
- No EAs available: Show error message, prevent creation

**Accessibility**:
- Dialog has `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- All inputs keyboard accessible
- Escape key closes dialog
- Enter key submits (when form valid)
- Tab navigation between fields

### createProspectFromAddress

**Purpose**: Core business logic for creating a prospect from address entry data.

**Signature**:
```typescript
export function createProspectFromAddress(
  prospectData: {
    prospectEvent: string;
    address: string;
    state: string;
    coordinates: Coordinate;
    country: string;
    eventAmbassador: string;
    prospectEDs?: string;
    dateMadeContact?: Date | null;
    courseFound?: boolean;
    landownerPermission?: boolean;
    fundingConfirmed?: boolean;
  },
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap
): ProspectiveEvent
```

**Parameters**:
- `prospectData`: Object containing prospect details
  - `prospectEvent: string` - Required: Prospect name
  - `address: string` - Required: Address used for geocoding (not stored, for reference)
  - `state: string` - Required: State/region
  - `coordinates: Coordinate` - Required: Geocoded or manually entered coordinates
  - `country: string` - Required: Country inferred from coordinates
  - `eventAmbassador: string` - Required: Selected EA name
  - `prospectEDs?: string` - Optional: Event Director(s)
  - `dateMadeContact?: Date | null` - Optional: Date contact was made
  - `courseFound?: boolean` - Optional: Course found flag (defaults to false)
  - `landownerPermission?: boolean` - Optional: Landowner permission flag (defaults to false)
  - `fundingConfirmed?: boolean` - Optional: Funding confirmed flag (defaults to false)
- `eventAmbassadors: EventAmbassadorMap` - Required: For EA validation and allocation count update
- `regionalAmbassadors: RegionalAmbassadorMap` - Required: For REA inference

**Returns**: `ProspectiveEvent` - Created prospect object

**Behavior**:
- Validates all required fields
- Generates unique ID via `generateProspectiveEventId`
- Creates ProspectiveEvent with all provided data and defaults
- Validates prospect via `validateProspectiveEvent`
- Updates EA allocation count to include new prospect
- Returns created prospect

**Preconditions**:
- All required fields must be provided and non-empty
- `eventAmbassador` must exist in `eventAmbassadors`
- `coordinates` must be valid (validated via `isValidCoordinate`)
- At least one EA must exist in system

**Postconditions**:
- Prospect object created with valid data
- EA allocation count updated (in memory, not persisted here)

**Error Handling**:
- Throws error if required fields missing
- Throws error if EA not found
- Throws error if validation fails
- Throws error if coordinates invalid

**Side Effects**:
- Modifies `eventAmbassadors` map (updates EA allocation count)
- Does NOT persist to storage (caller responsible)

### generateProspectAllocationSuggestions

**Purpose**: Generate EA allocation suggestions for a prospect based on coordinates.

**Signature**:
```typescript
export function generateProspectAllocationSuggestions(
  prospectName: string,
  coordinates: Coordinate,
  eventAmbassadors: EventAmbassadorMap,
  eventDetails: EventDetailsMap,
  regionalAmbassadors: RegionalAmbassadorMap
): ReallocationSuggestion[]
```

**Parameters**:
- `prospectName: string` - Prospect name (used for temporary EventDetails entry)
- `coordinates: Coordinate` - Prospect coordinates
- `eventAmbassadors: EventAmbassadorMap` - All EAs for suggestions
- `eventDetails: EventDetailsMap` - Event details map (used for creating temporary entry)
- `regionalAmbassadors: RegionalAmbassadorMap` - All REAs for REA inference

**Returns**: `ReallocationSuggestion[]` - Sorted suggestions (highest score first)

**Behavior**:
- Creates temporary EventDetails entry with prospect name and coordinates
- Calls `suggestEventAllocation` with temporary entry
- Returns sorted suggestions

**Preconditions**:
- `coordinates` must be valid
- `eventAmbassadors` must not be empty
- `prospectName` must be non-empty

**Postconditions**:
- Returns array of suggestions sorted by score (highest first)
- Temporary EventDetails entry may be added to map (should be cleaned up)

**Error Handling**:
- Returns empty array if no EAs available
- Throws error if coordinates invalid

**Side Effects**:
- May add temporary entry to `eventDetails` map (should be removed after use)

## Supporting Functions

### inferCountryFromCoordinates

**Purpose**: Infer country name string from coordinates.

**Signature**:
```typescript
export async function inferCountryFromCoordinates(
  coordinates: Coordinate
): Promise<string>
```

**Parameters**:
- `coordinates: Coordinate` - Coordinates to infer country from

**Returns**: `Promise<string>` - Country name string (or "Unknown" if inference fails)

**Behavior**:
- Calls `getCountryCodeFromCoordinate` to get country code
- Converts country code to country name string
- Returns "Unknown" if code is 0 or conversion fails

**Preconditions**:
- `coordinates` must be valid

**Postconditions**:
- Returns country name string (never empty, "Unknown" if inference fails)

**Error Handling**:
- Returns "Unknown" if inference fails (does not throw)

## Integration Contracts

### Button Setup

**Function**: `setupAddProspectButton()` (in `index.ts`)

**Contract**:
- Adds click handler to "Add Prospect" button
- Retrieves required data (eventAmbassadors, regionalAmbassadors, eventDetails)
- Calls `showAddProspectDialog` with data and callbacks
- Callbacks handle table refresh, map update, change tracking

### Persistence Integration

**Function**: Uses existing `saveProspectiveEvents` and `loadProspectiveEvents`

**Contract**:
- After prospect creation, load existing prospects
- Add new prospect to array
- Save updated array via `saveProspectiveEvents`

### Display Integration

**Function**: Uses existing `refreshProspectsTable` and `populateMap`

**Contract**:
- After prospect creation, call `refreshProspectsTable()` to update table
- Call `populateMap()` or trigger map refresh to show new prospect marker

### Change Tracking Integration

**Function**: Uses existing `trackStateChange` and `trackChanges`

**Contract**:
- After prospect creation, call `trackStateChange()` to mark state as modified
- Create log entry via `trackChanges()` with prospect creation details

## Error Contracts

### Geocoding Errors

**Error Types**:
- `GeocodingServiceError`: Geocoding service unavailable or returned error
- `GeocodingNotFoundError`: No results found for address
- `GeocodingInvalidResponseError`: Invalid response format from service

**Handling**:
- Display user-friendly error message
- Offer retry option (re-geocode with same or modified address)
- Offer manual coordinate entry option

### Validation Errors

**Error Types**:
- `ValidationError`: Field validation failed (from `validateProspectiveEvent`)

**Handling**:
- Display field-specific error messages
- Highlight invalid fields
- Prevent prospect creation until errors resolved

### Business Rule Errors

**Error Types**:
- `NoEAsAvailableError`: No Event Ambassadors exist in system
- `EANotFoundError`: Selected EA does not exist
- `InvalidCoordinatesError`: Coordinates are invalid

**Handling**:
- Display clear error message
- Prevent prospect creation
- Guide user to resolve issue (e.g., "Please onboard an Event Ambassador first")

## Testing Contracts

### Unit Tests

**Required Test Coverage**:
- `showAddProspectDialog`: Dialog display, form interaction, geocoding trigger, error handling
- `createProspectFromAddress`: Validation, ID generation, EA update, error cases
- `generateProspectAllocationSuggestions`: Suggestion generation, sorting, edge cases
- `inferCountryFromCoordinates`: Country inference, error handling

### Integration Tests

**Required Test Coverage**:
- Full flow: Dialog open → geocoding → suggestions → selection → creation → persistence → display
- Error flows: Geocoding failure, validation failure, no EAs available
- Edge cases: Manual coordinates, country inference failure, duplicate names

### Accessibility Tests

**Required Test Coverage**:
- Keyboard navigation through all fields
- Screen reader announcements
- Focus management
- ARIA attribute correctness
