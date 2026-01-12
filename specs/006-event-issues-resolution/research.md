# Research: Event Issues Resolution

**Feature**: Event Issues Resolution  
**Date**: 2026-01-08  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. Event Name Matching Strategies

**Decision**: Use simple string matching with normalization + Levenshtein distance for fuzzy matching

**Rationale**: 
- Simple string matching (normalized, case-insensitive) handles most cases (parentheses, case variations)
- Levenshtein distance provides fuzzy matching for typos without requiring external libraries
- Checking all name fields (EventShortName, EventLongName, LocalisedEventLongName, eventname) increases match likelihood
- No external fuzzy matching library needed (keeps dependencies minimal)

**Alternatives Considered**:
- Jaro-Winkler distance: More complex, better for longer strings, but Levenshtein sufficient for event names
- External library (Fuse.js): Adds dependency, Levenshtein can be implemented simply
- Exact matching only: Too restrictive, won't handle typos or name variations

**Implementation Notes**:
- Normalize strings: lowercase, remove parentheses content, trim whitespace
- Check all name fields in EventDetails
- Use Levenshtein distance threshold (e.g., distance <= 2 for short names, <= 3 for longer names)
- Sort results by match quality (exact > normalized > fuzzy)

### 2. Map Pin Placement UX

**Decision**: Select issue → click map to place pin (issue-driven workflow)

**Rationale**:
- User selects issue first, then places pin - clear workflow
- Pin placement is contextual to the selected issue
- Prevents confusion about which issue is being resolved
- Matches common map editing patterns

**Alternatives Considered**:
- Click map → select issue: Less intuitive, requires remembering which pin corresponds to which issue
- Drag-and-drop pin: More complex, not necessary for single coordinate placement

**Implementation Notes**:
- User selects issue from table
- "Place Pin" button becomes enabled
- Clicking map places pin and resolves issue
- Pin is visually distinct (different color/style) from regular event markers

### 3. Issues Data Structure

**Decision**: Store issues in memory during session, persist resolved events to localStorage

**Rationale**:
- Issues are derived data (can be regenerated from eventTeams and eventDetails)
- Only resolved events need persistence (manual coordinates)
- Reduces storage complexity
- Issues recalculated on each load ensures accuracy

**Alternatives Considered**:
- Persist issues list: Unnecessary, can be regenerated
- Store in separate Map: More complex than array, array sufficient for table display

**Implementation Notes**:
- Issues stored as `EventIssue[]` array
- Resolved events stored in eventDetailsMap (same structure as fetched events)
- Manual coordinates marked with special flag or stored separately
- Issues recalculated when eventDetailsMap changes

### 4. Events.json Search Performance

**Decision**: Custom implementation with simple optimizations (indexing, early termination)

**Rationale**:
- Events.json is fetched once and cached
- Custom implementation avoids external dependency
- Simple optimizations (normalize once, check all fields) sufficient
- Can optimize further if needed (index by normalized names)

**Alternatives Considered**:
- External search library (Fuse.js, lunr.js): Adds dependency, custom implementation sufficient
- Server-side search: Not applicable, client-side only application
- Full-text search index: Overkill for event name matching

**Implementation Notes**:
- Normalize all event names once when events.json is loaded
- Create lookup map by normalized name for fast exact matches
- Use Levenshtein for fuzzy matches (can be optimized with early termination)
- Limit results to top N matches (e.g., 10) for performance

### 5. Tab Navigation Integration

**Decision**: Add Issues tab to existing tab system using same pattern as other tabs

**Rationale**:
- Existing tab system (`initializeTabs`) already supports multiple tabs
- Consistent with Event Teams, Event Ambassadors, Regional Ambassadors, Changes Log tabs
- No new infrastructure needed

**Alternatives Considered**:
- Separate modal/dialog: Less integrated, harder to access
- Sidebar panel: Different UI pattern, inconsistent with existing design

**Implementation Notes**:
- Add "Issues" tab button to tab navigation
- Create Issues tab content panel
- Use same tab switching logic as existing tabs
- Issues table populated when tab becomes visible

## Integration Points

### Existing Systems

- **Tab System**: `src/utils/tabs.ts` - Add Issues tab
- **Event Details**: `src/models/EventDetails.ts` - Extend to support manual coordinates
- **Event Fetching**: `src/actions/fetchEvents.ts` - Already fetches events.json
- **Map System**: `src/actions/populateMap.ts` - Add pin placement handler
- **Table Generation**: `src/models/EventTeamsTable.ts` - Modify to detect issues instead of logging errors

### New Components

- **Issues Detection**: `src/actions/detectIssues.ts` - Identify events without coordinates
- **Issues Table**: `src/actions/populateIssuesTable.ts` - Display issues in table
- **Event Search**: `src/actions/searchEvents.ts` - Search events.json with fuzzy matching
- **Issue Resolution**: `src/actions/resolveIssue.ts` - Resolve issues (found or manual)
- **Map Pin Placement**: `src/actions/placeMapPin.ts` - Handle map click for pin placement
