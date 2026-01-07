# Function Contracts: Offboarding

**Feature**: Ambassador Capacity Management and Lifecycle  
**Date**: 2026-01-07  
**Type**: Function Contracts

## Offboard Event Ambassador

### `offboardEventAmbassador(ambassadorName: string, recipientName: string | null, eventAmbassadors: EventAmbassadorMap, eventDetails: EventDetailsMap, limits: CapacityLimits, log: LogEntry[]): { eventAmbassadors: EventAmbassadorMap, log: LogEntry[] }`

Removes an Event Ambassador and optionally reallocates their events.

**Parameters**:
- `ambassadorName` (string): Name of Event Ambassador to offboard
- `recipientName` (string | null): Name of recipient ambassador (null if events should remain unassigned)
- `eventAmbassadors` (EventAmbassadorMap): Current Event Ambassadors
- `eventDetails` (EventDetailsMap): Event details
- `limits` (CapacityLimits): Capacity limits
- `log` (LogEntry[]): Current changes log

**Returns**: Object with updated `eventAmbassadors` map and `log` array

**Throws**: 
- `AmbassadorNotFoundError` if ambassadorName doesn't exist
- `RecipientNotFoundError` if recipientName is provided but doesn't exist

**Side Effects**: None (pure function, caller responsible for persistence)

**Preconditions**:
- `ambassadorName` must exist in `eventAmbassadors`
- If `recipientName` is provided, it must exist in `eventAmbassadors` and not be the same as `ambassadorName`

**Postconditions**:
- Ambassador is removed from returned map
- If `recipientName` provided, all events are moved to recipient
- If `recipientName` is null, events remain unassigned (removed from any ambassador)
- Changes are logged in returned log array
- Original maps are unchanged (new maps returned)

---

## Offboard Regional Ambassador

### `offboardRegionalAmbassador(ambassadorName: string, recipientName: string | null, regionalAmbassadors: RegionalAmbassadorMap, eventAmbassadors: EventAmbassadorMap, limits: CapacityLimits, log: LogEntry[]): { regionalAmbassadors: RegionalAmbassadorMap, eventAmbassadors: EventAmbassadorMap, log: LogEntry[] }`

Removes a Regional Ambassador and optionally reallocates their Event Ambassadors.

**Parameters**:
- `ambassadorName` (string): Name of Regional Ambassador to offboard
- `recipientName` (string | null): Name of recipient Regional Ambassador (null if EAs should remain unassigned)
- `regionalAmbassadors` (RegionalAmbassadorMap): Current Regional Ambassadors
- `eventAmbassadors` (EventAmbassadorMap): Current Event Ambassadors (unchanged but returned for consistency)
- `limits` (CapacityLimits): Capacity limits
- `log` (LogEntry[]): Current changes log

**Returns**: Object with updated `regionalAmbassadors` map, `eventAmbassadors` map, and `log` array

**Throws**: 
- `AmbassadorNotFoundError` if ambassadorName doesn't exist
- `RecipientNotFoundError` if recipientName is provided but doesn't exist

**Side Effects**: None (pure function, caller responsible for persistence)

**Preconditions**:
- `ambassadorName` must exist in `regionalAmbassadors`
- If `recipientName` is provided, it must exist in `regionalAmbassadors` and not be the same as `ambassadorName`

**Postconditions**:
- Ambassador is removed from returned map
- If `recipientName` provided, all Event Ambassadors are moved to recipient's supportsEAs
- If `recipientName` is null, Event Ambassadors remain unassigned (removed from any Regional Ambassador)
- Changes are logged in returned log array
- Original maps are unchanged (new maps returned)

---

## Check Reallocation Capacity Warning

### `checkReallocationCapacityWarning(recipient: EventAmbassador | RegionalAmbassador, itemsToAdd: string[], itemType: 'events' | 'eventAmbassadors', limits: CapacityLimits): string | null`

Checks if reallocation would push recipient over capacity and returns warning message.

**Parameters**:
- `recipient` (EventAmbassador | RegionalAmbassador): Potential recipient
- `itemsToAdd` (string[]): Items being added
- `itemType` ('events' | 'eventAmbassadors'): Type of items
- `limits` (CapacityLimits): Capacity limits

**Returns**: `string | null` - Warning message or null if no warning needed

**Throws**: Never throws

**Side Effects**: None

**Preconditions**:
- `recipient` must be valid ambassador
- `itemsToAdd` must be non-empty array
- `itemType` must match recipient type

**Postconditions**:
- Returns warning message if adding items would exceed maximum capacity limit
- Returns null if capacity would remain within limits
- Warning message includes current count, items being added, and new total

