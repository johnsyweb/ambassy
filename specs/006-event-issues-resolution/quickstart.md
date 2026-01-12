# Quick Start: Event Issues Resolution Feature

**Feature**: Event Issues Resolution  
**Date**: 2026-01-08  
**Phase**: 1 - Design & Contracts

## Overview

This feature replaces console error messages for missing event details with an Issues tab that displays a table of events without coordinates. Users can resolve issues by searching parkrun's events.json or by placing pins on the map.

## Key Components

### Issues Detection (`src/actions/detectIssues.ts`)

Identifies events without coordinates:
- Scans `eventTeams` for events not in `eventDetailsMap`
- Creates `EventIssue` objects for each missing event
- Returns array of issues for display

### Issues Table (`src/actions/populateIssuesTable.ts`)

Displays issues in tabular format:
- Shows event name, assigned ambassadors, issue type
- Allows selection of issues for resolution
- Provides "Resolve" action buttons

### Event Search (`src/actions/searchEvents.ts`)

Searches events.json for matching events:
- Handles name variations (multiple name fields, typos, parentheses)
- Uses fuzzy matching (Levenshtein distance)
- Returns sorted results (exact > normalized > fuzzy)

### Issue Resolution (`src/actions/resolveIssue.ts`)

Resolves issues via two methods:
- `resolveIssueWithEvent()`: Adds event from events.json
- `resolveIssueWithPin()`: Creates event with manual coordinates

### Map Pin Placement (`src/actions/placeMapPin.ts`)

Handles map click for pin placement:
- Enables pin placement mode
- Captures click coordinates
- Associates coordinates with selected issue

## Usage Flow

### Viewing Issues

1. User loads application with Event Teams data
2. System detects events without coordinates
3. Issues tab displays table of unresolved issues
4. User can see which events need resolution

### Resolving via Search

1. User selects issue from Issues table
2. User clicks "Search Events" button
3. Search dialog appears with search input
4. User enters event name (or partial name)
5. System searches events.json and displays matches
6. User selects correct match
7. Issue resolved, event added to map and Event Teams table

### Resolving via Pin Placement

1. User selects issue from Issues table
2. User clicks "Place Pin" button
3. Map enters pin placement mode (cursor changes)
4. User clicks map location
5. Pin placed, coordinates captured
6. Issue resolved, event added to map and Event Teams table

## Integration Points

### Modified Files

- `src/models/EventTeamsTable.ts`: Remove `console.error`, collect issues instead
- `src/index.ts`: Add Issues tab, wire up handlers
- `src/utils/tabs.ts`: Add Issues tab to navigation
- `public/index.html`: Add Issues tab HTML structure

### New Files

- `src/models/EventIssue.ts`: Issue data model
- `src/actions/detectIssues.ts`: Issues detection logic
- `src/actions/populateIssuesTable.ts`: Issues table population
- `src/actions/searchEvents.ts`: Event search with fuzzy matching
- `src/actions/resolveIssue.ts`: Issue resolution functions
- `src/actions/placeMapPin.ts`: Map pin placement handler
- `src/utils/fuzzyMatch.ts`: Fuzzy matching utilities

## Testing Strategy

### Unit Tests

- `detectIssues.test.ts`: Test issue detection logic
- `searchEvents.test.ts`: Test search and fuzzy matching
- `resolveIssue.test.ts`: Test resolution functions
- `fuzzyMatch.test.ts`: Test fuzzy matching algorithm

### Integration Tests

- Issues table population and interaction
- Search dialog workflow
- Map pin placement workflow
- End-to-end resolution flow

## Error Handling

- Invalid coordinates: Validate before creating EventDetails
- Search failures: Display user-friendly error messages
- Map click outside valid area: Ignore or show warning
- Missing event data: Gracefully handle missing ambassadors

## Accessibility Considerations

- Issues table keyboard navigable
- Search dialog keyboard accessible
- Map pin placement has clear instructions
- Screen reader announcements for resolution actions
