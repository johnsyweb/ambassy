# Function Contracts: Event Issues Resolution

**Feature**: Event Issues Resolution  
**Date**: 2026-01-08  
**Type**: Function Contracts

## Detect Issues

### `detectIssues(eventTeams: EventTeamMap, eventDetails: EventDetailsMap, eventAmbassadors: EventAmbassadorMap, regionalAmbassadors: RegionalAmbassadorMap): EventIssue[]`

Detects events that are missing coordinates or details from events.json.

**Parameters**:
- `eventTeams` (EventTeamMap): Map of all event teams
- `eventDetails` (EventDetailsMap): Map of event details (may be incomplete)
- `eventAmbassadors` (EventAmbassadorMap): Map of Event Ambassadors
- `regionalAmbassadors` (RegionalAmbassadorMap): Map of Regional Ambassadors

**Returns**: `EventIssue[]` - Array of issues, empty if no issues found

**Throws**: None (gracefully handles missing data)

**Side Effects**: None (pure function)

**Preconditions**:
- `eventTeams` must not be null
- `eventDetails` may be incomplete (some events missing)
- `eventAmbassadors` and `regionalAmbassadors` must contain all referenced ambassadors

**Postconditions**:
- Returns array of issues for events not found in `eventDetails`
- Each issue references valid ambassadors
- Issues are sorted by event name

---

## Search Events

### `searchEvents(query: string, events: EventDetailsMap): EventDetails[]`

Searches events.json for events matching the query string, handling name variations and typos.

**Parameters**:
- `query` (string): Search query (event name or partial name)
- `events` (EventDetailsMap): Map of all events from events.json

**Returns**: `EventDetails[]` - Array of matching events, sorted by match quality (exact > normalized > fuzzy)

**Throws**: None

**Side Effects**: None (pure function)

**Preconditions**:
- `query` must be non-empty string
- `events` must not be null (can be empty)

**Postconditions**:
- Returns array of matching events (may be empty)
- Results sorted by match quality (exact matches first, then fuzzy matches)
- Maximum 10 results returned (for performance)
- Checks all name fields: EventShortName, EventLongName, LocalisedEventLongName, eventname

**Match Quality**:
1. Exact match (case-insensitive)
2. Normalized match (removed parentheses, trimmed)
3. Fuzzy match (Levenshtein distance <= 2 for short names, <= 3 for longer names)

---

## Resolve Issue with Event

### `resolveIssueWithEvent(issue: EventIssue, eventDetails: EventDetails, eventDetailsMap: EventDetailsMap): void`

Resolves an issue by adding the found event from events.json to the eventDetailsMap.

**Parameters**:
- `issue` (EventIssue): The issue to resolve
- `eventDetails` (EventDetails): Event details from events.json
- `eventDetailsMap` (EventDetailsMap): Map to update (will be modified)

**Returns**: `void`

**Throws**:
- `Error` if `eventDetails` is missing required fields
- `Error` if `issue.eventShortName` doesn't match `eventDetails.properties.EventShortName`

**Side Effects**:
- Adds `eventDetails` to `eventDetailsMap` with key `issue.eventShortName`
- Updates issue status to "resolved"
- Logs resolution to changes log

**Preconditions**:
- `issue.status` must be "unresolved"
- `eventDetails` must have valid geometry.coordinates
- `eventDetails.properties.EventShortName` should match `issue.eventShortName` (or be the correct match)

**Postconditions**:
- Event added to `eventDetailsMap`
- Issue marked as resolved
- Resolution logged

---

## Resolve Issue with Pin

### `resolveIssueWithAddress(issue: EventIssue, address: string, eventDetailsMap: EventDetailsMap): Promise<void>`

Resolves an issue by geocoding an address to obtain coordinates.

**Parameters**:
- `issue` (EventIssue): The issue to resolve
- `address` (string): Street address to geocode (e.g., "Quentin Rd, Puckapunyal VIC 3662")
- `eventDetailsMap` (EventDetailsMap): Map to update (will be modified)

**Returns**: `Promise<void>`

**Throws**:
- `Error` if address is empty or geocoding fails
- `Error` if geocoding returns invalid coordinates

**Side Effects**:
- Calls geocoding service to convert address to coordinates
- Creates new `EventDetails` with geocoded coordinates
- Adds to `eventDetailsMap` with key `issue.eventShortName`
- Sets `geocodedAddress: true` flag and `sourceAddress` field
- Updates issue status to "resolved"
- Logs resolution to changes log

**Preconditions**:
- `issue.status` must be "unresolved"
- `address` must be non-empty string
- Geocoding service must be available

**Postconditions**:
- EventDetails created with geocoded coordinates
- Event added to `eventDetailsMap`
- Issue marked as resolved
- Resolution logged

---

## Geocode Address

### `geocodeAddress(address: string): Promise<{lat: number, lng: number}>`

Converts a street address to geographic coordinates using geocoding service.

**Parameters**:
- `address` (string): Street address to geocode

**Returns**: `Promise<{lat: number, lng: number}>` - Promise resolving to latitude/longitude coordinates

**Throws**:
- `Error` if address is empty
- `Error` if geocoding service unavailable
- `Error` if geocoding fails or returns no results

**Side Effects**:
- Makes HTTP request to geocoding service
- May cache geocoding results

**Preconditions**:
- `address` must be non-empty string
- Network connection available for geocoding service

**Postconditions**:
- Returns valid latitude/longitude coordinates
- Results may be cached for performance

---

## Show Address Dialog

### `showAddressDialog(issue: EventIssue, onAddressEntered: (address: string) => void, onCancel: () => void): void`

Displays dialog for entering street address for geocoding.

**Parameters**:
- `issue` (EventIssue): The issue being resolved
- `onAddressEntered` ((address: string) => void): Callback when address is entered and geocoding should proceed
- `onCancel` (() => void): Callback when user cancels

**Returns**: `void`

**Throws**: None

**Side Effects**:
- Displays modal dialog
- Focuses address input field
- Handles keyboard navigation (Enter to submit, Escape to cancel)

**Preconditions**:
- `issue` must have valid event information
- Dialog container must exist in DOM

**Postconditions**:
- Dialog displayed with address input focused
- Callbacks attached for address entry and cancellation

---

## Populate Issues Table

### `populateIssuesTable(issues: EventIssue[], onIssueSelect: (issue: EventIssue) => void, onResolve: (issue: EventIssue) => void): void`

Populates the Issues tab table with detected issues.

**Parameters**:
- `issues` (EventIssue[]): Array of issues to display
- `onIssueSelect` ((issue: EventIssue) => void): Callback when issue is selected
- `onResolve` ((issue: EventIssue) => void): Callback when resolve action is triggered

**Returns**: `void`

**Throws**: None

**Side Effects**:
- Clears existing table content
- Creates table rows for each issue
- Attaches event handlers for selection and resolution

**Preconditions**:
- Issues table element must exist in DOM
- `issues` must be array (can be empty)

**Postconditions**:
- Table populated with issue rows
- Event handlers attached
- Empty state shown if no issues
