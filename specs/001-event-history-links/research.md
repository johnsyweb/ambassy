# Research: Event History Links

**Feature**: Event History Links  
**Date**: 2026-01-14  
**Status**: Complete

## Research Questions

### Q1: How to construct event history URLs from available data?

**Decision**: Use country code from EventDetails to lookup country domain from CountryMap, then construct URL as `https://${country.url}/${eventShortName}/results/eventhistory/`

**Rationale**: 
- Events have `properties.countrycode` (number) in EventDetails
- Countries map has country code as key (string) with `url` property (e.g., "www.parkrun.com.au")
- This matches the pattern shown in the spec example: `https://www.parkrun.com.au/albertmelbourne/results/eventhistory/`
- Country data is already loaded and cached from events.json API

**Alternatives considered**:
- Hardcoding domain mappings: Rejected - would require maintenance when new countries added
- Storing full URLs in EventDetails: Rejected - not available in current data model, would require API changes
- Using event coordinates to determine country: Rejected - more complex, countrycode already available

### Q2: How to handle missing or invalid country domain data?

**Decision**: Disable link (make it non-clickable) and add tooltip/aria-label explaining missing domain. Display event name as plain text without link styling.

**Rationale**:
- Prevents broken navigation attempts
- Provides clear feedback to user about why link is unavailable
- Maintains table layout consistency
- Follows accessibility best practices (aria-label for screen readers)

**Alternatives considered**:
- Show error message in cell: Rejected - clutters UI, breaks table layout
- Hide event name entirely: Rejected - loses information, confusing UX
- Use fallback domain: Rejected - could lead to wrong country's site

### Q3: Where to place URL construction logic?

**Decision**: Create new utility function `src/utils/eventHistoryUrl.ts` with function `buildEventHistoryUrl(eventShortName: string, countrycode: number, countries: CountryMap): string | null`

**Rationale**:
- Single responsibility: URL construction is isolated and testable
- Reusable: Could be used elsewhere if needed
- Testable: Pure function, easy to unit test
- Follows existing code structure (utils directory for utility functions)

**Alternatives considered**:
- Inline in populateAmbassadorsTable: Rejected - harder to test, violates single responsibility
- In EventDetails model: Rejected - model should not contain presentation logic
- In country.ts: Rejected - country.ts is for country data access, not URL construction

### Q4: How to modify event name display to be clickable links?

**Decision**: Replace `eventsCell.textContent = eventParts.join("; ")` with DOM manipulation that creates `<a>` elements for each event name, separated by commas and semicolons as appropriate.

**Rationale**:
- Native HTML links provide built-in keyboard accessibility
- Browser handles `target="_blank"` for new tabs
- Maintains existing visual appearance (can style links to match current text)
- Screen readers announce links properly

**Alternatives considered**:
- Using button elements: Rejected - buttons are for actions, links are for navigation
- Using onClick handlers on spans: Rejected - loses native link semantics and accessibility
- Opening in same tab: Rejected - violates requirement FR-003

### Q5: How to access EventDetailsMap and CountryMap in populateEventAmbassadorsTable?

**Decision**: Add optional parameters `eventDetails?: EventDetailsMap` and `countries?: CountryMap` to `populateEventAmbassadorsTable` function signature. Update call site in `populateAmbassadorsTable` to pass these.

**Rationale**:
- Follows existing pattern (function already has optional parameters)
- Allows graceful degradation if data not available
- Maintains backward compatibility
- Data is already available at call site (from refreshUI)

**Alternatives considered**:
- Global variables: Rejected - violates clean architecture, harder to test
- Fetching inside function: Rejected - async complexity, already cached
- Required parameters: Rejected - breaks existing call sites, requires more changes

## Technical Decisions Summary

1. **URL Format**: `https://${country.url}/${eventShortName}/results/eventhistory/`
2. **Missing Data Handling**: Disable link, show tooltip, display as plain text
3. **Code Organization**: New utility function `eventHistoryUrl.ts`
4. **UI Implementation**: Native HTML `<a>` elements with `target="_blank"`
5. **Data Access**: Optional parameters to function, passed from call site

## Dependencies

- Existing: EventDetailsMap (from localStorage cache via getEvents)
- Existing: CountryMap (from localStorage cache via getCountries)
- Existing: populateAmbassadorsTable function structure
- No new external dependencies required

## Open Questions

None - all technical decisions resolved.
