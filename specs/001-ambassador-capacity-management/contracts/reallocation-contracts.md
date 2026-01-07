# Function Contracts: Reallocation Suggestions

**Feature**: Ambassador Capacity Management and Lifecycle  
**Date**: 2026-01-07  
**Type**: Function Contracts

## Suggest Event Reallocation

### `suggestEventReallocation(fromAmbassador: string, events: string[], eventAmbassadors: EventAmbassadorMap, eventDetails: EventDetailsMap, limits: CapacityLimits, options?: ReallocationOptions): ReallocationSuggestion[]`

Generates reallocation suggestions for events when offboarding an Event Ambassador.

**Parameters**:
- `fromAmbassador` (string): Name of Event Ambassador being offboarded
- `events` (string[]): Array of event names to reallocate
- `eventAmbassadors` (EventAmbassadorMap): Current Event Ambassadors
- `eventDetails` (EventDetailsMap): Event details including coordinates
- `limits` (CapacityLimits): Capacity limits configuration
- `options` (ReallocationOptions, optional): Options for reallocation (regions, conflicts, etc.)

**Returns**: `ReallocationSuggestion[]` - Array of suggestions sorted by score (highest first)

**Throws**: 
- `AmbassadorNotFoundError` if fromAmbassador doesn't exist
- `InvalidEventsError` if events array is empty

**Side Effects**: None (pure function)

**Preconditions**:
- `fromAmbassador` must exist in `eventAmbassadors`
- `events` must be non-empty array
- All events in `events` array must exist in `eventDetails`
- `eventAmbassadors` must not be empty (at least one potential recipient)

**Postconditions**:
- Returns array of suggestions (may be empty if no suitable recipients)
- Suggestions are sorted by score (descending)
- Each suggestion includes score, reasons, and warnings
- Suggestions consider capacity, region, landowner, proximity, and conflicts

---

## Suggest Event Ambassador Reallocation

### `suggestEventAmbassadorReallocation(fromAmbassador: string, eventAmbassadorNames: string[], regionalAmbassadors: RegionalAmbassadorMap, eventAmbassadors: EventAmbassadorMap, limits: CapacityLimits, options?: ReallocationOptions): ReallocationSuggestion[]`

Generates reallocation suggestions for Event Ambassadors when offboarding a Regional Ambassador.

**Parameters**:
- `fromAmbassador` (string): Name of Regional Ambassador being offboarded
- `eventAmbassadorNames` (string[]): Array of Event Ambassador names to reallocate
- `regionalAmbassadors` (RegionalAmbassadorMap): Current Regional Ambassadors
- `eventAmbassadors` (EventAmbassadorMap): Current Event Ambassadors (for region lookup)
- `limits` (CapacityLimits): Capacity limits configuration
- `options` (ReallocationOptions, optional): Options for reallocation

**Returns**: `ReallocationSuggestion[]` - Array of suggestions sorted by score

**Throws**: 
- `AmbassadorNotFoundError` if fromAmbassador doesn't exist
- `InvalidEventAmbassadorsError` if eventAmbassadorNames array is empty

**Side Effects**: None (pure function)

**Preconditions**:
- `fromAmbassador` must exist in `regionalAmbassadors`
- `eventAmbassadorNames` must be non-empty array
- All Event Ambassadors in `eventAmbassadorNames` must exist in `eventAmbassadors`
- `regionalAmbassadors` must not be empty (at least one potential recipient)

**Postconditions**:
- Returns array of suggestions sorted by score
- Suggestions prioritise same region where possible
- Suggestions consider capacity availability
- Each suggestion includes warnings if capacity would be exceeded

---

## Calculate Reallocation Score

### `calculateReallocationScore(recipient: EventAmbassador | RegionalAmbassador, items: string[], itemType: 'events' | 'eventAmbassadors', eventDetails: EventDetailsMap, limits: CapacityLimits, options?: ReallocationOptions): number`

Calculates a score indicating how suitable a recipient is for reallocation.

**Parameters**:
- `recipient` (EventAmbassador | RegionalAmbassador): Potential recipient ambassador
- `items` (string[]): Items (events or EAs) being reallocated
- `itemType` ('events' | 'eventAmbassadors'): Type of items being reallocated
- `eventDetails` (EventDetailsMap): Event details for proximity calculations
- `limits` (CapacityLimits): Capacity limits
- `options` (ReallocationOptions, optional): Reallocation options

**Returns**: `number` - Score (higher is better, 0-100 scale)

**Throws**: Never throws (returns 0 on error)

**Side Effects**: None

**Preconditions**:
- `recipient` must be valid ambassador
- `items` must be non-empty array
- `itemType` must match type of `items`

**Postconditions**:
- Returns score based on:
  - Capacity availability (higher score for more available capacity)
  - Regional alignment (higher score for same region)
  - Landowner grouping (higher score for matching landowner)
  - Geographic proximity (higher score for closer events)
  - Conflict avoidance (exclude or heavily penalize conflicts)
- Returns 0 if recipient has conflicts (unless override specified)

---

## Calculate Geographic Proximity Score

### `calculateGeographicProximityScore(recipientEvents: string[], reallocatingEvents: string[], eventDetails: EventDetailsMap): number`

Calculates geographic proximity score based on average distance between recipient's events and events being reallocated.

**Parameters**:
- `recipientEvents` (string[]): Events currently supported by recipient
- `reallocatingEvents` (string[]): Events being reallocated
- `eventDetails` (EventDetailsMap): Event details with coordinates

**Returns**: `number` - Proximity score (higher is closer, 0-100 scale)

**Throws**: Never throws (returns 0 on error or missing coordinates)

**Side Effects**: None

**Preconditions**:
- All events in arrays must exist in `eventDetails`
- Events should have valid coordinates (may be missing)

**Postconditions**:
- Returns score based on average distance (closer = higher score)
- Returns 0 if recipient has no existing events (no proximity baseline)
- Returns 0 if coordinates are missing for any events
- Uses Haversine formula for distance calculation

---

## Extract Landowner from Event Location

### `extractLandowner(eventLocation: string): string | null`

Extracts landowner information from EventLocation field.

**Parameters**:
- `eventLocation` (string): EventLocation field from EventDetails

**Returns**: `string | null` - Extracted landowner name or null if not found

**Throws**: Never throws

**Side Effects**: None

**Preconditions**:
- `eventLocation` must be string (may be empty)

**Postconditions**:
- Returns extracted landowner if pattern matches (e.g., "City of X", "Parks Victoria")
- Returns null if no pattern matches or eventLocation is empty
- Pattern matching is case-insensitive

