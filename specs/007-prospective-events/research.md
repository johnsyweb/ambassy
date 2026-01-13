# Research: Prospective Events Feature

## Research Tasks

### 1. CSV Structure Parsing
**Task**: How to parse prospective events CSV with multiple data types and validation

**Findings**:
- CSV has format: `Prospect Event,Country,State,Prospect ED/s,EA,Date Made Contact,Course Found,Landowner Permission,Funding Confirmed,Edit`
- Contains mixed data types: strings, dates, booleans
- All columns are required except `Edit` (optional notes)
- Need robust parsing for dates and boolean values
- Validation required for country/state combinations

**Decision**: Implement comprehensive CSV parser with type validation
**Rationale**: Ensures data integrity and proper handling of different field types
**Alternatives Considered**: Simple string splitting (rejected: insufficient validation)

### 2. Ambassador Name Matching
**Task**: How to match EA names from CSV against existing Event Ambassador data

**Findings**:
- Existing Event Ambassadors have full names with spaces
- CSV EA names may or may not have spaces
- Need fuzzy matching that handles space normalization
- Only Event Ambassadors need to be matched (not Regional Ambassadors)

**Decision**: Implement fuzzy string matching with space normalization for EAs only
**Rationale**: Handles name variations while focusing on Event Ambassador relationships
**Alternatives Considered**: Exact matching only (rejected: too restrictive for real-world data)

### 3. Geocoding Strategy
**Task**: What information is available for geocoding prospective events

**Findings**:
- CSV provides: Country, State for each prospective event
- Better location data than initially assumed
- Can use country + state for regional geocoding
- May need to combine with prospect event name for more precise location
- Still may need manual resolution for ambiguous locations

**Decision**: Attempt geocoding using country/state data, enhanced by prospect event name
**Rationale**: More location data available than initially expected, improving geocoding success
**Alternatives Considered**: Require full addresses (rejected: would limit prospect tracking usefulness)

### 4. Issue Resolution Integration
**Task**: How to integrate prospective event issues with existing resolution workflows

**Findings**:
- Existing system has Issues tab for event coordinate problems
- Prospective events may have similar issues (missing coordinates, unmatched ambassadors)
- Need to extend issue types and resolution workflows
- Should reuse existing UI patterns and dialogs

**Decision**: Extend existing Issues system to handle prospective events
**Rationale**: Maintains consistency and reuses proven patterns
**Alternatives Considered**: Separate UI (rejected: duplicates functionality)

### 5. UI Integration
**Task**: How to present prospective events in the existing interface

**Findings**:
- Existing interface has tabs for different data types
- Should add "Prospective Events" tab or integrate into existing views
- Need import button/functionality in main UI
- Resolution workflow should match existing patterns

**Decision**: Add "Prospective Events" tab with import and management capabilities
**Rationale**: Clear separation while maintaining consistent UX patterns
**Alternatives Considered**: Integrate into existing Event Teams tab (rejected: different lifecycle)

## Technical Approach

**Architecture**: Extend existing data models and workflows
- New `ProspectiveEvent` model extending base event structure
- Reuse geocoding and ambassador matching utilities
- Extend Issues system for prospective event problems
- Add new tab to main interface

**Data Flow**:
1. CSV Import → Parse → Validate → Store
2. Geocoding Attempt → Success/Fail handling
3. Ambassador Matching → Resolution workflow
4. UI Display → Issue resolution → Final integration

**Error Handling**: Graceful degradation with clear user feedback
**Performance**: Batch processing for imports, caching for geocoding