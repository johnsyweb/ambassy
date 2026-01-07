# Function Contracts: Onboarding

**Feature**: Ambassador Capacity Management and Lifecycle  
**Date**: 2026-01-07  
**Type**: Function Contracts

## Onboard Event Ambassador

### `onboardEventAmbassador(name: string, eventAmbassadors: EventAmbassadorMap): EventAmbassadorMap`

Adds a new Event Ambassador to the system.

**Parameters**:
- `name` (string): Name of the new Event Ambassador (must be unique, non-empty)
- `eventAmbassadors` (EventAmbassadorMap): Current map of Event Ambassadors

**Returns**: `EventAmbassadorMap` - Updated map including the new ambassador

**Throws**: 
- `DuplicateAmbassadorError` if name already exists
- `InvalidNameError` if name is empty or invalid

**Side Effects**: None (pure function, caller responsible for persistence)

**Preconditions**:
- `name` must be non-empty string
- `eventAmbassadors` must be valid EventAmbassadorMap
- Ambassador with `name` must not already exist in `eventAmbassadors`

**Postconditions**:
- Returned map contains new EventAmbassador with empty events array
- New ambassador has `capacityStatus` of UNDER (0 events < min)
- Original map is unchanged (new map returned)

---

## Onboard Regional Ambassador

### `onboardRegionalAmbassador(name: string, state: string, regionalAmbassadors: RegionalAmbassadorMap): RegionalAmbassadorMap`

Adds a new Regional Ambassador to the system.

**Parameters**:
- `name` (string): Name of the new Regional Ambassador (must be unique, non-empty)
- `state` (string): State assignment for the Regional Ambassador
- `regionalAmbassadors` (RegionalAmbassadorMap): Current map of Regional Ambassadors

**Returns**: `RegionalAmbassadorMap` - Updated map including the new ambassador

**Throws**: 
- `DuplicateAmbassadorError` if name already exists
- `InvalidNameError` if name is empty or invalid

**Side Effects**: None (pure function, caller responsible for persistence)

**Preconditions**:
- `name` must be non-empty string
- `state` must be non-empty string
- `regionalAmbassadors` must be valid RegionalAmbassadorMap
- Ambassador with `name` must not already exist in `regionalAmbassadors`

**Postconditions**:
- Returned map contains new RegionalAmbassador with empty supportsEAs array
- New ambassador has `capacityStatus` of UNDER (0 EAs < min)
- Original map is unchanged (new map returned)

---

## Validate Ambassador Name

### `validateAmbassadorName(name: string, existingNames: string[]): boolean`

Validates that an ambassador name is unique and valid.

**Parameters**:
- `name` (string): Name to validate
- `existingNames` (string[]): Array of existing ambassador names to check against

**Returns**: `boolean` - true if name is valid and unique, false otherwise

**Throws**: Never throws

**Side Effects**: None

**Preconditions**:
- `name` must be string (may be empty)
- `existingNames` must be array of strings

**Postconditions**:
- Returns false if name is empty or exists in existingNames
- Returns true if name is non-empty and unique

