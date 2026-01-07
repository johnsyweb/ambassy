# Research: Ambassador Capacity Management and Lifecycle

**Feature**: Ambassador Capacity Management and Lifecycle  
**Date**: 2026-01-07  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. Geographic Distance Calculation Approach

**Decision**: Implement Haversine formula directly in TypeScript for calculating distances between event coordinates

**Rationale**: 
- Haversine formula is well-established for calculating great-circle distances between two points on a sphere
- Simple to implement (approximately 20-30 lines of code)
- No external dependencies required
- Sufficiently accurate for Victoria region (distances typically < 500km)
- Performance is adequate for typical use cases (100-200 events)

**Alternatives Considered**:
- External library (e.g., geolib): Adds dependency, overkill for simple distance calculations
- Euclidean distance: Less accurate for geographic coordinates, especially over longer distances
- Pre-computed distance matrix: Would require significant storage and complexity for dynamic data

**Implementation Notes**:
- Use Earth radius of 6371 km (mean radius)
- Handle missing or invalid coordinates gracefully (return null or large distance)
- Cache distance calculations if performance becomes an issue (optimization for later)

### 2. Region Assignment Strategy

**Decision**: Support both manual assignment and automatic derivation from event coordinates

**Rationale**:
- Victoria's three regions may not have clear geographic boundaries
- Some events may span regions or have ambiguous assignments
- Manual assignment provides flexibility for edge cases
- Automatic derivation can assist but shouldn't override manual assignments

**Alternatives Considered**:
- Purely manual assignment: More accurate but requires user input for every event
- Purely automatic assignment: May be inaccurate for boundary cases or events with missing coordinates
- Region boundaries as polygons: Complex to implement, may not match actual organisational boundaries

**Implementation Notes**:
- Store region assignment in EventDetails or separate mapping
- Provide UI for manual region assignment
- Optional automatic suggestion based on coordinates (can be overridden)
- Default to "Unknown" region if assignment cannot be determined

### 3. Landowner Information Extraction

**Decision**: Landowner extraction removed from requirements. Landowner grouping is no longer part of allocation principles.

**Rationale**:
- Pattern matching from EventLocation field is not feasible due to inconsistent data format
- Landowner grouping removed from allocation principles per clarification
- System will focus on capacity, region, geographic proximity, and conflict avoidance

**Alternatives Considered**:
- Pattern matching from EventLocation: Not feasible due to data inconsistency
- Manual landowner assignment: Not required as landowner grouping removed from principles
- External landowner database: Not needed

**Implementation Notes**:
- No landowner extraction or grouping functionality required
- Focus allocation principles on: capacity, region, proximity, conflicts

### 4. Conflict of Interest Tracking

**Decision**: Support manual conflict flagging with optional conflict metadata

**Rationale**:
- Automatic conflict detection is complex and may have false positives/negatives
- Manual flagging allows users to apply domain knowledge
- Conflicts may be personal, professional, or organisational
- Simple flag is sufficient for filtering suggestions

**Alternatives Considered**:
- Automatic conflict detection: Complex, requires additional data sources, may be inaccurate
- Detailed conflict metadata: Adds complexity, may not be necessary for filtering
- No conflict tracking: Would violate requirement FR-027

**Implementation Notes**:
- Add optional `conflicts` field to ambassador models (array of ambassador names or event names)
- Provide UI for flagging conflicts
- Filter reallocation suggestions to exclude conflicted ambassadors
- Allow user override if no conflict-free options available

### 5. Reallocation Suggestion Algorithm

**Decision**: Multi-factor scoring system with weighted priorities

**Rationale**:
- Multiple principles must be balanced (capacity, region, landowner, proximity, conflicts)
- Scoring system allows flexible prioritization
- Can be tuned based on user feedback
- Pragmatic approach aligns with "don't let perfect get in the way of better"

**Alternatives Considered**:
- Strict priority ordering: Too rigid, doesn't allow balancing
- Machine learning approach: Overkill, requires training data, adds complexity
- Simple capacity-only filtering: Doesn't meet requirements for allocation principles

**Implementation Notes**:
- Score each potential recipient ambassador based on:
  - Capacity availability (higher score for more available capacity)
  - Regional alignment (higher score for same region)
  - Geographic proximity (higher score for closer events)
  - Conflict avoidance (exclude or heavily penalize conflicts)
- Weight factors based on importance (capacity > region > proximity)
- Present top N suggestions (e.g., top 3) with scores/justifications
- Allow user to override and manually select recipients

### 6. Capacity Limit Storage

**Decision**: Store capacity limits in localStorage with application state

**Rationale**:
- Consistent with existing state persistence approach
- Simple to implement
- Persists across sessions
- No additional infrastructure required

**Alternatives Considered**:
- Separate configuration file: Adds complexity, requires file management
- Hard-coded defaults: Not configurable, violates requirement FR-017/FR-018
- Server-side storage: Not applicable for client-side only application

**Implementation Notes**:
- Store capacity limits in localStorage with key "ambassy:capacityLimits"
- Default values: EA min=2, max=9; REA min=3, max=10
- Include in ApplicationState export/import for sharing
- Validate limits on save (min <= max, positive integers)

### 7. Geographic Proximity Calculation for Reallocation

**Decision**: Calculate average distance from recipient's existing events to events being reallocated

**Rationale**:
- Considers recipient's current geographic footprint
- Promotes clustering of nearby events
- Simple to calculate and understand
- Aligns with "support nearby events" principle

**Alternatives Considered**:
- Distance to recipient's "home" event: Requires additional data (home event), may not be available
- Minimum distance: Doesn't consider overall geographic distribution
- Centroid-based distance: More complex, may not reflect actual event distribution

**Implementation Notes**:
- For each potential recipient, calculate average distance from their existing events to each event being reallocated
- Use minimum average distance as proximity score
- Handle recipients with no existing events (use default score or exclude from proximity scoring)

## Best Practices Identified

1. **Geographic Calculations**: Use Haversine formula for accurate distance calculations
2. **Multi-factor Scoring**: Weighted scoring system for balancing multiple principles
3. **Graceful Degradation**: Handle missing data (coordinates, regions, landowners) without breaking functionality
4. **User Override**: Always allow users to override suggestions when principles conflict
5. **Performance**: Cache distance calculations if needed, but initial implementation should be fast enough
6. **Data Validation**: Validate all user inputs (capacity limits, ambassador names, etc.)

## Dependencies

- No new npm packages required
- Uses existing geographic data (EventDetails.coordinates)
- Uses existing localStorage API
- May implement Haversine formula directly (no external dependency)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Geographic calculations slow for large datasets | Medium | Implement caching, optimize algorithm, limit calculation scope |
| Region boundaries unclear or ambiguous | Medium | Support manual assignment, default to "Unknown", flag for review |
| Landowner information missing or inconsistent | Low | Support manual assignment, use pattern matching for common cases |
| Reallocation suggestions don't match user expectations | Medium | Provide multiple suggestions, allow override, gather user feedback for tuning |
| Capacity limits not intuitive | Low | Provide sensible defaults, clear UI, validation messages |
| Conflicts not properly tracked | Medium | Provide clear UI for conflict management, allow override when needed |

## Conclusion

All research questions resolved. Implementation approach uses existing infrastructure, implements geographic calculations directly, and provides flexible multi-factor scoring for reallocation suggestions. Ready to proceed to Phase 1 design.

