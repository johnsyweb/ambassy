# Function Contracts: Capacity Checking

**Feature**: Ambassador Capacity Management and Lifecycle  
**Date**: 2026-01-07  
**Type**: Function Contracts

## Check Event Ambassador Capacity

### `checkEventAmbassadorCapacity(eventAmbassador: EventAmbassador, limits: CapacityLimits): CapacityStatus`

Calculates capacity status for an Event Ambassador.

**Parameters**:
- `eventAmbassador` (EventAmbassador): Event Ambassador to check
- `limits` (CapacityLimits): Capacity limits configuration

**Returns**: `CapacityStatus` - WITHIN, UNDER, or OVER

**Throws**: Never throws

**Side Effects**: None

**Preconditions**:
- `eventAmbassador` must have valid `events` array
- `limits` must have valid `eventAmbassadorMin` and `eventAmbassadorMax` values

**Postconditions**:
- Returns UNDER if `events.length < eventAmbassadorMin`
- Returns OVER if `events.length > eventAmbassadorMax`
- Returns WITHIN if `eventAmbassadorMin <= events.length <= eventAmbassadorMax`

---

## Check Regional Ambassador Capacity

### `checkRegionalAmbassadorCapacity(regionalAmbassador: RegionalAmbassador, limits: CapacityLimits): CapacityStatus`

Calculates capacity status for a Regional Ambassador.

**Parameters**:
- `regionalAmbassador` (RegionalAmbassador): Regional Ambassador to check
- `limits` (CapacityLimits): Capacity limits configuration

**Returns**: `CapacityStatus` - WITHIN, UNDER, or OVER

**Throws**: Never throws

**Side Effects**: None

**Preconditions**:
- `regionalAmbassador` must have valid `supportsEAs` array
- `limits` must have valid `regionalAmbassadorMin` and `regionalAmbassadorMax` values

**Postconditions**:
- Returns UNDER if `supportsEAs.length < regionalAmbassadorMin`
- Returns OVER if `supportsEAs.length > regionalAmbassadorMax`
- Returns WITHIN if `regionalAmbassadorMin <= supportsEAs.length <= regionalAmbassadorMax`

---

## Calculate All Capacity Statuses

### `calculateAllCapacityStatuses(eventAmbassadors: EventAmbassadorMap, regionalAmbassadors: RegionalAmbassadorMap, limits: CapacityLimits): void`

Updates capacity status for all ambassadors in the system.

**Parameters**:
- `eventAmbassadors` (EventAmbassadorMap): Map of Event Ambassadors to update
- `regionalAmbassadors` (RegionalAmbassadorMap): Map of Regional Ambassadors to update
- `limits` (CapacityLimits): Capacity limits configuration

**Returns**: `void`

**Throws**: Never throws

**Side Effects**: Modifies `capacityStatus` field of all ambassadors in both maps

**Preconditions**:
- All maps must be valid
- `limits` must be valid CapacityLimits

**Postconditions**:
- All Event Ambassadors have updated `capacityStatus` based on their `events.length`
- All Regional Ambassadors have updated `capacityStatus` based on their `supportsEAs.length`

---

## Load Capacity Limits

### `loadCapacityLimits(): CapacityLimits`

Loads capacity limits from localStorage or returns defaults.

**Parameters**: None

**Returns**: `CapacityLimits` - Current capacity limits configuration

**Throws**: Never throws (returns defaults on error)

**Side Effects**: Reads from localStorage

**Preconditions**: None

**Postconditions**:
- Returns stored limits if available in localStorage
- Returns default limits (EA: 2-9, REA: 3-10) if not stored or invalid

---

## Save Capacity Limits

### `saveCapacityLimits(limits: CapacityLimits): boolean`

Saves capacity limits to localStorage.

**Parameters**:
- `limits` (CapacityLimits): Capacity limits to save

**Returns**: `boolean` - true if saved successfully, false otherwise

**Throws**: Never throws

**Side Effects**: Writes to localStorage

**Preconditions**:
- `limits` must be valid CapacityLimits (validated before calling)

**Postconditions**:
- Limits are stored in localStorage with key "ambassy:capacityLimits"
- Returns true if storage succeeds, false if localStorage unavailable

---

## Validate Capacity Limits

### `validateCapacityLimits(limits: CapacityLimits): ValidationResult`

Validates capacity limits configuration.

**Parameters**:
- `limits` (CapacityLimits): Limits to validate

**Returns**: `ValidationResult` - Object with `isValid: boolean` and `errors: string[]`

**Throws**: Never throws

**Side Effects**: None

**Preconditions**:
- `limits` must be object with required fields (may have invalid values)

**Postconditions**:
- Returns `isValid: false` if min > max, values are negative, or values are non-integers
- Returns `isValid: true` and empty `errors` array if all validations pass
- Returns array of error messages describing validation failures

