# Data Model: Ambassador Capacity Management and Lifecycle

**Feature**: Ambassador Capacity Management and Lifecycle  
**Date**: 2026-01-07  
**Phase**: 1 - Design & Contracts

## Entities

### CapacityLimits

Configuration settings that define preferred capacity ranges for ambassadors.

**Fields**:
- `eventAmbassadorMin` (number, required): Minimum preferred number of events for Event Ambassadors (default: 2)
- `eventAmbassadorMax` (number, required): Maximum preferred number of events for Event Ambassadors (default: 9)
- `regionalAmbassadorMin` (number, required): Minimum preferred number of Event Ambassadors for Regional Ambassadors (default: 3)
- `regionalAmbassadorMax` (number, required): Maximum preferred number of Event Ambassadors for Regional Ambassadors (default: 10)

**Relationships**: Used by CapacityStatus calculations

**Validation Rules**:
- All values must be positive integers
- `eventAmbassadorMin` must be <= `eventAmbassadorMax`
- `regionalAmbassadorMin` must be <= `regionalAmbassadorMax`
- Values are stored in localStorage and persist across sessions

### CapacityStatus

Indicates whether an ambassador is within preferred limits, under capacity, or over capacity.

**Values**:
- `WITHIN`: Current allocation is within preferred range (min <= count <= max)
- `UNDER`: Current allocation is below minimum preferred limit (count < min)
- `OVER`: Current allocation exceeds maximum preferred limit (count > max)

**Relationships**: Calculated for EventAmbassador and RegionalAmbassador entities

**Validation Rules**:
- Status is calculated based on current allocation count and configured CapacityLimits
- Status updates automatically when allocations change

### ReallocationSuggestion

A recommendation to move events or Event Ambassadors from one ambassador to another.

**Fields**:
- `fromAmbassador` (string, required): Name of ambassador being offboarded
- `toAmbassador` (string, required): Name of suggested recipient ambassador
- `items` (string[], required): Array of event names or Event Ambassador names to reallocate
- `score` (number, required): Calculated score indicating how well this suggestion matches allocation principles (higher is better)
- `reasons` (string[], optional): Array of reasons explaining why this suggestion was made (e.g., "Same region", "Common landowner", "Geographic proximity")
- `warnings` (string[], optional): Array of warnings about this suggestion (e.g., "Would exceed capacity limit", "Potential conflict of interest")

**Relationships**: Generated for offboarding operations

**Validation Rules**:
- `fromAmbassador` must exist in current ambassador data
- `toAmbassador` must exist in current ambassador data
- `items` must not be empty
- `score` must be >= 0
- Multiple suggestions may be generated for a single offboarding operation

### Region

One of three regions that Victoria is divided into.

**Values**:
- `REGION_1`: First Victoria region (name/configurable)
- `REGION_2`: Second Victoria region (name/configurable)
- `REGION_3`: Third Victoria region (name/configurable)
- `UNKNOWN`: Region not assigned or cannot be determined

**Relationships**: Assigned to events and ambassadors

**Validation Rules**:
- Events may be assigned to regions manually or automatically
- Region assignment may be ambiguous or span multiple regions
- Default to UNKNOWN if assignment cannot be determined

### EventAmbassador (Extended)

Existing entity extended with capacity-related fields.

**Existing Fields**:
- `name` (string, required): Ambassador name
- `events` (string[], required): Array of events supported

**New Fields**:
- `capacityStatus` (CapacityStatus, calculated): Current capacity status
- `region` (Region, optional): Region assignment
- `conflicts` (string[], optional): Array of ambassador names or event names that represent conflicts of interest

**Relationships**: Unchanged from existing model

**Validation Rules**:
- `capacityStatus` is calculated based on `events.length` and CapacityLimits
- `conflicts` array may be empty
- `region` may be UNKNOWN

### RegionalAmbassador (Extended)

Existing entity extended with capacity-related fields.

**Existing Fields**:
- `name` (string, required): Ambassador name
- `state` (string, required): State assignment
- `supportsEAs` (string[], required): Array of Event Ambassador names supported

**New Fields**:
- `capacityStatus` (CapacityStatus, calculated): Current capacity status
- `region` (Region, optional): Region assignment
- `conflicts` (string[], optional): Array of Event Ambassador names that represent conflicts of interest

**Relationships**: Unchanged from existing model

**Validation Rules**:
- `capacityStatus` is calculated based on `supportsEAs.length` and CapacityLimits
- `conflicts` array may be empty
- `region` may be UNKNOWN

### EventDetails (Extended)

Existing entity extended with region information.

**Existing Fields**: (from EventDetails interface)
- `id`, `type`, `geometry`, `properties` (unchanged)

**New Fields** (stored separately or in metadata):
- `region` (Region, optional): Region assignment for this event

**Relationships**: Unchanged from existing model

**Validation Rules**:
- `region` may be UNKNOWN if not assigned

## State Transitions

### Onboarding Flow

1. **Initial State**: User initiates onboarding action
2. **Input Collection**: System collects ambassador name (and state for Regional Ambassador)
3. **Validation**: System checks for duplicate names
4. **Creation**: System creates new ambassador with empty events/supportsEAs list
5. **Persistence**: System saves to localStorage
6. **Logging**: System logs onboarding action
7. **UI Update**: System refreshes display to show new ambassador

### Capacity Checking Flow

1. **Trigger**: Data change or user request
2. **Load Limits**: System loads CapacityLimits from localStorage (or uses defaults)
3. **Calculate Status**: For each ambassador, calculate capacity status based on allocation count
4. **Update Models**: System updates ambassador capacityStatus fields
5. **Display**: System displays capacity status in UI

### Offboarding Flow

1. **Initial State**: User selects ambassador to offboard
2. **Check Allocations**: System identifies events/EAs to be reallocated
3. **Generate Suggestions**: System generates reallocation suggestions using multi-factor scoring
4. **Present Options**: System displays suggestions with scores and reasons
5. **User Selection**: User selects recipient(s) or overrides suggestions
6. **Reallocation**: System moves events/EAs to selected recipients
7. **Removal**: System removes offboarded ambassador
8. **Logging**: System logs offboarding and reallocation actions
9. **UI Update**: System refreshes display

### Capacity Limit Configuration Flow

1. **Initial State**: User opens configuration UI
2. **Load Current**: System loads current CapacityLimits from localStorage
3. **User Input**: User modifies limit values
4. **Validation**: System validates new limits (min <= max, positive integers)
5. **Save**: System saves validated limits to localStorage
6. **Recalculate**: System recalculates all capacity statuses with new limits
7. **UI Update**: System refreshes display with updated capacity statuses

## Validation Rules Summary

### Capacity Limits Validation

1. **Minimum/Maximum**: min must be <= max for both ambassador types
2. **Positive Integers**: All limit values must be positive integers
3. **Reasonable Range**: Limits should be within reasonable bounds (e.g., 1-50 for events, 1-20 for EAs)

### Ambassador Validation

1. **Unique Names**: Ambassador names must be unique within their type
2. **Non-empty Name**: Ambassador name must not be empty
3. **Valid Events**: Events array must contain valid event names (if events exist in system)

### Reallocation Validation

1. **Valid Recipients**: Recipient ambassadors must exist
2. **Non-empty Items**: Items to reallocate must not be empty
3. **Capacity Warnings**: System must warn if reallocation would exceed capacity limits

### Region Validation

1. **Valid Region**: Region must be one of the defined values or UNKNOWN
2. **Consistency**: Events in same region should be grouped where possible

## Error States

### Invalid Capacity Limits

- **Cause**: User enters invalid limits (min > max, negative values, non-integers)
- **Handling**: Validate on input, display error message, prevent saving until valid

### Duplicate Ambassador Name

- **Cause**: User attempts to onboard ambassador with existing name
- **Handling**: Check for duplicates before creation, display error, require unique name

### Missing Geographic Data

- **Cause**: Event coordinates missing or invalid
- **Handling**: Skip proximity calculations for affected events, flag in suggestions, allow manual override

### No Suitable Recipients

- **Cause**: All potential recipients are at capacity or have conflicts
- **Handling**: Warn user, still provide suggestions (may exceed capacity), allow manual selection

### Reallocation Would Exceed Capacity

- **Cause**: Selected recipient would exceed capacity limit after reallocation
- **Handling**: Warn user before confirming, allow override if user confirms

