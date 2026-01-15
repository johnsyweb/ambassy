# Clarification: Allocation Algorithm Tie-Breaker

**Date**: 2026-01-15  
**Feature**: Map Event Allocation (010-map-event-allocation)  
**Status**: Clarification Request

## Clarification Request

The allocation algorithm should use the nearest event allocation as a tie-breaker for Event Ambassadors with similar capacity.

## Current Understanding

The current implementation in `suggestEventAllocation` uses:
- **Primary ordering**: Total allocation count (fewer allocations = higher priority)
- **Secondary ordering**: Distance to nearest supported event (closer = higher priority)

However, the current scoring mechanism may not properly prioritize capacity over distance, or may not effectively use distance as a tie-breaker when capacities are similar.

## Clarification Questions

1. **What defines "similar capacity"?**
   - Should EAs with the same total allocation count be considered "similar"?
   - Should EAs within a certain range (e.g., ±1 or ±2 allocations) be considered "similar"?
   - Should capacity status (under/within/over) be considered when determining similarity?

2. **How should the tie-breaker work?**
   - When EAs have similar capacity, should distance to nearest event be the primary tie-breaker?
   - Should distance only apply when EAs have identical allocation counts, or within a threshold?
   - Should the algorithm first group EAs by capacity, then sort within each group by distance?

3. **What about EAs with no existing events?**
   - Should EAs with zero allocations always be prioritized regardless of distance?
   - Or should distance still be considered even for zero-allocation EAs?

4. **Should this apply to both allocation and reallocation?**
   - Should the same tie-breaker logic apply to `suggestEventAllocation` (new allocations) and `suggestEventReallocation` (reallocations)?
   - Or should they have different prioritization strategies?

## Proposed Algorithm Structure

Based on the clarification request, the algorithm should:

1. **Primary**: Group EAs by total allocation count (capacity)
2. **Secondary (tie-breaker)**: Within each capacity group, prioritize by distance to nearest event
3. **Tertiary**: Other factors (REA assignment, geographic proximity, etc.)

This ensures that:
- Capacity remains the primary factor
- Distance is used as a tie-breaker when capacities are similar
- The algorithm is consistent with reallocation logic

## Implementation Considerations

The current scoring formula:
```typescript
baseScore = Math.max(0, 1000 - totalAllocations * 10);
distanceBonus = Math.max(0, 100 - closestDistance);
score = baseScore + distanceBonus;
```

This approach may need adjustment to ensure:
- Capacity differences dominate the score
- Distance only affects ranking when capacities are similar
- The scoring is clear and maintainable

## Related Requirements

This clarification relates to:
- **FR-003**: System MUST provide a dialog or interface for selecting an Event Ambassador when allocating an unallocated event from the map
- The suggestion algorithm should prioritize EAs appropriately to help users make good allocation decisions

## Next Steps

Once clarified, this will require:
1. Updating the `suggestEventAllocation` function to implement the clarified tie-breaker logic
2. Potentially updating `suggestEventReallocation` for consistency
3. Updating tests to verify the tie-breaker behavior
4. Updating documentation to reflect the prioritization strategy
