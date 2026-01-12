# Feature Specification: Event Team Reallocation

**Feature ID**: `003-event-team-reallocation`  
**Date**: 2026-01-08  
**Status**: Planning

## Summary

Enable users to select an Event Team from the Event Teams table and reallocate it to another Event Ambassador. The application should prioritise potential recipients based on their available capacity and the geographic proximity of events they already support to the event being reallocated.

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
- Application calculates a score for each potential recipient based on:
  - Available capacity (ambassadors with more available capacity score higher)
  - Geographic proximity (ambassadors with events closer to the reallocating event score higher)
- Suggestions are displayed in descending order of score
- Each suggestion shows:
  - Ambassador name
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
- `suggestEventReallocation()` - Scoring and prioritisation logic
- `calculateGeographicProximityScore()` - Proximity calculations
- `checkEventAmbassadorCapacity()` - Capacity checking
- Event Teams table UI and selection handling

## Constraints

- Must maintain keyboard accessibility
- Must use Australian English for all user-facing text
- Must follow existing code structure and patterns
- Must integrate with existing table-map navigation feature
- Must preserve existing logging and persistence mechanisms
