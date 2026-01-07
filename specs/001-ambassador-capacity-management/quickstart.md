# Quick Start: Ambassador Capacity Management and Lifecycle Feature

**Feature**: Ambassador Capacity Management and Lifecycle  
**Date**: 2026-01-07  
**Phase**: 1 - Design & Contracts

## Overview

This feature adds comprehensive lifecycle management for Event Ambassadors and Regional Ambassadors, including onboarding, offboarding, capacity checking, and intelligent reallocation suggestions. The system considers multiple allocation principles: capacity availability, regional alignment, landowner grouping, geographic proximity, and conflict avoidance.

## Key Components

### Capacity Management (`src/models/CapacityLimits.ts`, `src/models/CapacityStatus.ts`)

Core models for capacity configuration and status:
- `CapacityLimits`: Configuration with min/max for EA and REA
- `CapacityStatus`: Enum (WITHIN, UNDER, OVER)
- Default limits: EA 2-9 events, REA 3-10 Event Ambassadors

### Onboarding (`src/actions/onboardAmbassador.ts`)

Functions to add new ambassadors:
- `onboardEventAmbassador()`: Add new Event Ambassador
- `onboardRegionalAmbassador()`: Add new Regional Ambassador
- Validation for duplicate names

### Capacity Checking (`src/actions/checkCapacity.ts`)

Functions to calculate and display capacity status:
- `checkEventAmbassadorCapacity()`: Calculate EA capacity status
- `checkRegionalAmbassadorCapacity()`: Calculate REA capacity status
- `calculateAllCapacityStatuses()`: Update all ambassadors
- `loadCapacityLimits()`: Load from localStorage
- `saveCapacityLimits()`: Save to localStorage

### Reallocation Engine (`src/actions/suggestReallocation.ts`)

Multi-factor scoring system for reallocation suggestions:
- `suggestEventReallocation()`: Generate suggestions for events
- `suggestEventAmbassadorReallocation()`: Generate suggestions for EAs
- `calculateReallocationScore()`: Score potential recipients
- `calculateGeographicProximityScore()`: Calculate proximity score
- Considers: capacity, region, landowner, proximity, conflicts

### Offboarding (`src/actions/offboardAmbassador.ts`)

Functions to remove ambassadors and reallocate:
- `offboardEventAmbassador()`: Remove EA and reallocate events
- `offboardRegionalAmbassador()`: Remove REA and reallocate EAs
- `checkReallocationCapacityWarning()`: Warn if capacity exceeded

### Geographic Utilities (`src/utils/geography.ts`)

Geographic calculations:
- `calculateDistance()`: Haversine formula for distance
- `calculateAverageDistance()`: Average distance between event sets
- Handles missing coordinates gracefully

### Region Utilities (`src/utils/regions.ts`)

Region assignment and management:
- `assignRegion()`: Assign region to event or ambassador
- `getRegionForEvent()`: Get region for event
- `extractLandowner()`: Extract landowner from EventLocation

## Usage Flow

### Onboarding an Event Ambassador

1. User clicks "Add Event Ambassador" button
2. User enters ambassador name
3. System validates name is unique
4. System creates new EventAmbassador with empty events array
5. System saves to localStorage
6. System logs onboarding action
7. System refreshes UI to show new ambassador (status: UNDER capacity)

### Checking Capacity

1. System loads CapacityLimits from localStorage (or uses defaults)
2. System calculates capacity status for each ambassador:
   - Count events/EAs supported
   - Compare to min/max limits
   - Set capacityStatus (WITHIN/UNDER/OVER)
3. System displays capacity status in UI (colour coding, badges, etc.)

### Offboarding with Reallocation

1. User selects ambassador to offboard
2. System identifies events/EAs to be reallocated
3. System generates reallocation suggestions:
   - Filter potential recipients (exclude conflicts)
   - Score each recipient based on multiple factors
   - Sort by score (highest first)
   - Generate top 3-5 suggestions
4. System displays suggestions with:
   - Recipient name
   - Score and reasons
   - Warnings (if capacity exceeded)
5. User selects recipient or overrides suggestion
6. System reallocates items to selected recipient
7. System removes offboarded ambassador
8. System logs all changes
9. System refreshes UI

### Configuring Capacity Limits

1. User opens "Capacity Settings" dialog
2. System loads current limits from localStorage
3. User modifies min/max values for EA and/or REA
4. System validates limits (min <= max, positive integers)
5. User saves configuration
6. System saves to localStorage
7. System recalculates all capacity statuses
8. System refreshes UI

## Integration Points

### Modified Files

- `src/models/EventAmbassador.ts`: Add optional `capacityStatus`, `region`, `conflicts` fields
- `src/models/RegionalAmbassador.ts`: Add optional `capacityStatus`, `region`, `conflicts` fields
- `src/index.ts`: Add UI event handlers for onboarding, offboarding, capacity display
- `public/index.html`: Add UI elements (buttons, dialogs, capacity indicators)

### New Files

- `src/models/CapacityLimits.ts`: Capacity limit configuration
- `src/models/CapacityStatus.ts`: Capacity status enum
- `src/models/ReallocationSuggestion.ts`: Reallocation suggestion model
- `src/actions/onboardAmbassador.ts`: Onboarding functions
- `src/actions/offboardAmbassador.ts`: Offboarding functions
- `src/actions/checkCapacity.ts`: Capacity checking functions
- `src/actions/suggestReallocation.ts`: Reallocation suggestion engine
- `src/actions/configureCapacityLimits.ts`: Capacity limit configuration
- `src/utils/geography.ts`: Geographic distance calculations
- `src/utils/regions.ts`: Region assignment utilities

## Testing Strategy

### Unit Tests

- Capacity calculation functions
- Onboarding validation and creation
- Offboarding and reallocation
- Geographic distance calculations
- Region assignment
- Landowner extraction
- Reallocation scoring algorithm

### Integration Tests

- Onboarding flow (add ambassador, verify in UI, verify persistence)
- Capacity checking flow (change allocations, verify status updates)
- Offboarding flow (offboard ambassador, verify reallocation, verify removal)
- Configuration flow (change limits, verify recalculation, verify persistence)

### Manual Testing Checklist

- [ ] Onboard new Event Ambassador - verify appears in list, status is UNDER
- [ ] Onboard new Regional Ambassador - verify appears in list, status is UNDER
- [ ] Assign events to EA - verify capacity status updates (UNDER → WITHIN → OVER)
- [ ] Configure capacity limits - verify new limits applied, statuses recalculated
- [ ] Offboard EA with events - verify suggestions generated, verify reallocation works
- [ ] Offboard REA with EAs - verify suggestions generated, verify reallocation works
- [ ] Verify capacity warnings appear when reallocation would exceed limits
- [ ] Verify geographic proximity influences suggestions
- [ ] Verify region alignment influences suggestions
- [ ] Verify landowner grouping influences suggestions
- [ ] Verify conflicts exclude ambassadors from suggestions
- [ ] Verify all changes logged in changes log

## Error Handling

### Duplicate Ambassador Name

- **Cause**: User attempts to onboard ambassador with existing name
- **Handling**: Validate before creation, display error message, prevent creation

### Invalid Capacity Limits

- **Cause**: User enters invalid limits (min > max, negative values)
- **Handling**: Validate on input, display error, prevent saving

### Missing Geographic Data

- **Cause**: Event coordinates missing or invalid
- **Handling**: Skip proximity calculations, flag in suggestions, allow manual override

### No Suitable Recipients

- **Cause**: All potential recipients at capacity or have conflicts
- **Handling**: Warn user, still provide suggestions (may exceed capacity), allow manual selection

## Performance Considerations

- Capacity checking: O(n) where n is number of ambassadors - should be fast (< 100ms)
- Reallocation suggestions: O(n*m) where n is recipients, m is events - may take 1-2 seconds for large datasets
- Geographic calculations: Cache distance calculations if performance becomes an issue
- UI updates: Batch updates to avoid multiple re-renders

## Accessibility Considerations

- All new UI elements keyboard accessible
- Capacity status clearly visible (colour coding + text labels)
- Reallocation suggestions clearly presented with reasons
- Error messages accessible to screen readers
- Australian English for all text

## Future Enhancements (Out of Scope)

- Bulk onboarding/offboarding
- Historical capacity tracking
- Capacity forecasting
- Automatic conflict detection
- Region boundary visualization
- Advanced reallocation algorithms (optimization, machine learning)

