# API Contracts: Event History URL Construction

**Feature**: Event History Links  
**Date**: 2026-01-14

## Overview

This feature adds a utility function for constructing event history URLs. No REST/GraphQL APIs are involved as this is a client-side UI feature.

## Function Contract

### buildEventHistoryUrl

**Location**: `src/utils/eventHistoryUrl.ts`

**Signature**:
```typescript
function buildEventHistoryUrl(
  eventShortName: string,
  countrycode: number,
  countries: CountryMap
): string | null
```

**Parameters**:
- `eventShortName: string` - The event's short name (e.g., "albertmelbourne")
  - Must be non-empty
  - Used as path segment in URL
- `countrycode: number` - The event's country code (e.g., 3 for Australia)
  - Must be a valid number
  - Used to lookup country in CountryMap
- `countries: CountryMap` - Map of country codes to Country objects
  - Keys are country code strings (e.g., "3")
  - Values have `url` property (string | null)

**Returns**:
- `string | null` - The constructed URL or null if construction is not possible
  - Format: `https://${country.url}/${eventShortName}/results/eventhistory/`
  - Returns null if:
    - countrycode not found in countries map
    - country.url is null
    - eventShortName is empty
    - Any other validation failure

**Preconditions**:
- countries parameter must be a valid CountryMap object
- countrycode must be a non-negative integer

**Postconditions**:
- If all data is valid, returns a complete URL string
- If any data is invalid, returns null
- Function is pure (no side effects)

**Examples**:

```typescript
// Valid case
buildEventHistoryUrl("albertmelbourne", 3, { "3": { url: "www.parkrun.com.au", bounds: [...] } })
// Returns: "https://www.parkrun.com.au/albertmelbourne/results/eventhistory/"

// Missing country
buildEventHistoryUrl("albertmelbourne", 3, {})
// Returns: null

// Null country URL
buildEventHistoryUrl("albertmelbourne", 3, { "3": { url: null, bounds: [...] } })
// Returns: null

// Empty event name
buildEventHistoryUrl("", 3, { "3": { url: "www.parkrun.com.au", bounds: [...] } })
// Returns: null
```

## UI Contract

### Event Name Link Rendering

**Location**: `src/actions/populateAmbassadorsTable.ts` in `populateEventAmbassadorsTable` function

**Behavior**:
- Each event name in the "Events" column must be rendered as an HTML anchor element (`<a>`)
- Link must have `href` attribute set to the constructed URL
- Link must have `target="_blank"` to open in new tab
- Link must have `rel="noopener noreferrer"` for security
- Link must be keyboard accessible (focusable, activatable with Enter/Space)
- If URL construction fails (returns null), event name must be rendered as plain text (not a link)
- Multiple event names must be separated by commas and semicolons as currently implemented

**Accessibility Requirements**:
- Links must have visible focus indicators
- Links must be announced by screen readers as "link" followed by event name
- If link is disabled (URL null), must have aria-label explaining why (e.g., "Event history unavailable - missing country domain")

**Styling**:
- Links should match existing text appearance (inherit text color, no underline unless hovered)
- Hover state should indicate clickability (underline or color change)
- Focus state must be clearly visible
