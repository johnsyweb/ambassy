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

### `resolveIssueWithPin(issue: EventIssue, coordinates: [number, number], eventDetailsMap: EventDetailsMap): void`

Resolves an issue by creating EventDetails with manually placed pin coordinates.

**Parameters**:
- `issue` (EventIssue): The issue to resolve
- `coordinates` ([number, number]): [longitude, latitude] coordinates from map pin
- `eventDetailsMap` (EventDetailsMap): Map to update (will be modified)

**Returns**: `void`

**Throws**:
- `Error` if coordinates are invalid (not numbers, out of valid range)

**Side Effects**:
- Creates new `EventDetails` with manual coordinates
- Adds to `eventDetailsMap` with key `issue.eventShortName`
- Sets `manualCoordinates: true` flag
- Updates issue status to "resolved"
- Logs resolution to changes log

**Preconditions**:
- `issue.status` must be "unresolved"
- `coordinates` must be valid [longitude, latitude] tuple
- Longitude must be between -180 and 180
- Latitude must be between -90 and 90

**Postconditions**:
- EventDetails created with manual coordinates
- Event added to `eventDetailsMap`
- Issue marked as resolved
- Resolution logged

---

## Place Map Pin

### `placeMapPin(map: L.Map, onPinPlaced: (coordinates: [number, number]) => void): () => void`

Enables map pin placement mode. Returns cleanup function to disable pin placement.

**Parameters**:
- `map` (L.Map): Leaflet map instance
- `onPinPlaced` ((coordinates: [number, number]) => void): Callback when pin is placed

**Returns**: `() => void` - Cleanup function to disable pin placement

**Throws**: None

**Side Effects**:
- Adds click event listener to map
- Changes map cursor to indicate pin placement mode
- Removes listener when cleanup function is called

**Preconditions**:
- `map` must be initialized Leaflet map
- `onPinPlaced` must be valid function

**Postconditions**:
- Map click handler added
- Cursor changed to indicate pin placement mode
- Cleanup function returned to remove handler

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
