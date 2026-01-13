# Feature Specification: Event Team Reallocation

**Feature ID**: `003-event-team-reallocation`  
**Date**: 2026-01-08  
**Status**: Planning

## Summary

Enable users to select an Event Team from the Event Teams table and reallocate it to another Event Ambassador. The application should prioritise potential recipients based on their available capacity and the geographic proximity of events they already support to the event being reallocated.

## Clarifications

### Session 2026-01-08

- Q: How should the distance be displayed? → A: "X.X km to [Event Name]" format combining distance and name (e.g., "5.2 km to Armstrong Creek")
- Q: Should we extend the model to include separate live/prospect counts, or calculate them on the fly? → A: Extend `ReallocationSuggestion` interface with `liveEventsCount?: number` and `prospectEventsCount?: number` fields
- Q: What should be displayed if an Event Ambassador has no events assigned? → A: Display "No events assigned" text, distance field is null/undefined/not shown
- Q: What should be displayed for REA name if an Event Ambassador has no assigned REA? → A: Display "Unassigned" or "No REA" text
- Q: What is the exact scoring formula for prioritisation? → A: Base score = (1000 - totalAllocations * 10), distance bonus = (100 - distanceKm), final score = base + bonus

## User Stories

### US1: Select Event Team for Reallocation
**As a** user managing ambassador assignments  
**I want to** select an Event Team from the Event Teams table  
**So that** I can reallocate it to another Event Ambassador

**Acceptance Criteria:**
- User can select a row in the Event Teams table
- Selected row is visually highlighted
- Selection state is maintained until user selects a different row or cancels

### US2: View Prioritised Ambassador Suggestions
**As a** user reallocating an Event Team  
**I want to** see a prioritised list of potential Event Ambassadors  
**So that** I can choose the most appropriate recipient based on capacity and proximity

**Acceptance Criteria:**
- Application calculates a score for each potential recipient using the formula:
  - Base score = (1000 - totalAllocations * 10) where totalAllocations = live events + prospect events
  - Distance bonus = (100 - distanceKm) for the nearest supported event
  - Final score = base score + distance bonus
  - Ambassadors with fewer total allocations score higher (0 allocations = highest priority)
  - Distance serves as tiebreaker when allocation counts are equal
- Suggestions are displayed in descending order of score
- Each suggestion shows:
  - Ambassador name
  - Number of live events allocated
  - Number of prospect events allocated
  - Total allocation count (sum of live + prospect events)
  - Name of supporting Regional Ambassador (REA) - displays "Unassigned" or "No REA" if missing
  - Distance from subject event to nearest event they support in format "X.X km to [Event Name]" - displays "No events assigned" if EA has no events
  - Score
  - Reasons for the suggestion (e.g., "Has available capacity", "Geographic proximity", "Same region")
  - Warnings if applicable (e.g., "Would exceed capacity limit")

### US3: Complete Reallocation
**As a** user reallocating an Event Team  
**I want to** confirm the reallocation to a selected Event Ambassador  
**So that** the Event Team is assigned to the new ambassador and the change is persisted

**Acceptance Criteria:**
- User can select a suggested ambassador or choose "Other" to manually select
- Reallocation removes the event from the old ambassador's events array
- Reallocation adds the event to the new ambassador's events array
- Event Teams table data is updated
- Change is logged to the changelog
- UI is refreshed to reflect the new assignment
- Capacity statuses are recalculated

## Technical Context

This feature builds on existing functionality:
- `assignEventToAmbassador()` - Core assignment logic
- `suggestEventReallocation()` - Scoring and prioritisation logic (needs extension to include live/prospect counts)
- `calculateGeographicProximityScore()` - Proximity calculations
- `checkEventAmbassadorCapacity()` - Capacity checking
- Event Teams table UI and selection handling

**Data Model Extensions:**
- `ReallocationSuggestion` interface must be extended with:
  - `liveEventsCount?: number` - Number of live events allocated to the ambassador
  - `prospectEventsCount?: number` - Number of prospect events allocated to the ambassador

## Constraints

- Must maintain keyboard accessibility
- Must use Australian English for all user-facing text
- Must follow existing code structure and patterns
- Must integrate with existing table-map navigation feature
- Must preserve existing logging and persistence mechanisms
