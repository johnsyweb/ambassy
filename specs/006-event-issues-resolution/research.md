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

### 2. Address Geocoding UX

**Decision**: Select issue → enter street address → automatic geocoding (issue-driven workflow)

**Rationale**:
- User selects issue first, then enters address - clear workflow
- Address entry is contextual to the selected issue
- Prevents confusion about which issue is being resolved
- More user-friendly than manual map clicking
- Automatic geocoding provides accurate coordinates

**Alternatives Considered**:
- Click map → select issue: Less intuitive, requires remembering which pin corresponds to which issue
- Address entry → manual pin adjustment: More complex, not necessary if geocoding is accurate
- Hybrid approach: Geocode first, then allow manual adjustment

**Implementation Notes**:
- User selects issue from table
- Address input field becomes available
- User enters address (e.g., "Unit 10, 82/86 Minnie St, Southport QLD 4215")
- System geocodes address to coordinates
- Clear error message if geocoding fails
- Resolved event appears on map with standard marker

### 3. Issues Data Structure

**Decision**: Store issues in memory during session, persist resolved events to localStorage

**Rationale**:
- Issues are derived data (can be regenerated from eventTeams and eventDetails)
- Only resolved events need persistence (geocoded coordinates)
- Reduces storage complexity
- Issues recalculated on each load ensures accuracy

**Alternatives Considered**:
- Persist issues list: Unnecessary, can be regenerated
- Store in separate Map: More complex than array, array sufficient for table display

**Implementation Notes**:
- Issues stored as `EventIssue[]` array
- Resolved events stored in eventDetailsMap (same structure as fetched events)
- Geocoded coordinates marked with special flag or stored separately
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
- Limit results to top N matches (e.g., 20) for performance

### 5. Geocoding Service Selection

**Decision**: Use browser Geolocation API with fallback to external geocoding service

**Rationale**:
- Browser Geolocation API provides free, privacy-respecting geocoding
- No API keys required for basic usage
- Fallback to external service (OpenStreetMap Nominatim) for better accuracy
- Handles both forward geocoding (address → coordinates) and reverse geocoding if needed

**Alternatives Considered**:
- Google Maps Geocoding API: Requires API key, usage limits, not free for heavy usage
- Mapbox Geocoding API: Similar limitations to Google Maps
- Pure client-side solutions: Limited accuracy, no external data sources

**Implementation Notes**:
- Try browser Geolocation API first (navigator.geolocation)
- Fallback to Nominatim API (https://nominatim.openstreetmap.org/)
- Handle rate limiting and error cases
- Validate geocoding results for accuracy
- Cache geocoding results to avoid repeated API calls

### 6. Tab Navigation Integration

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
- **Event Details**: `src/models/EventDetails.ts` - Extend to support geocoded coordinates
- **Event Fetching**: `src/actions/fetchEvents.ts` - Already fetches events.json
- **Map System**: `src/actions/populateMap.ts` - Display geocoded events as markers
- **Table Generation**: `src/models/EventTeamsTable.ts` - Modify to detect issues instead of logging errors

### New Components

- **Issues Detection**: `src/actions/detectIssues.ts` - Identify events without coordinates
- **Issues Table**: `src/actions/populateIssuesTable.ts` - Display issues in table
- **Event Search**: `src/actions/searchEvents.ts` - Search events.json with fuzzy matching
- **Issue Resolution**: `src/actions/resolveIssue.ts` - Resolve issues (found or geocoded)
- **Address Geocoding**: `src/actions/geocodeAddress.ts` - Convert addresses to coordinates
- **Geocoding Service**: `src/utils/geocoding.ts` - Handle geocoding API calls
