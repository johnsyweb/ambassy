# Quickstart: Event History Links

**Feature**: Event History Links  
**Date**: 2026-01-14

## Overview

This feature adds clickable links to event names in the Event Ambassador tab, opening each event's parkrun event history page in a new browser tab.

## For Developers

### Key Files

- **Implementation**: `src/actions/populateAmbassadorsTable.ts` - Modify `populateEventAmbassadorsTable` function
- **Utility**: `src/utils/eventHistoryUrl.ts` - New file for URL construction logic
- **Tests**: `src/actions/populateAmbassadorsTable.test.ts` - Update/add tests
- **Tests**: `src/utils/eventHistoryUrl.test.ts` - New test file

### Implementation Steps

1. **Create URL construction utility** (`src/utils/eventHistoryUrl.ts`):
   ```typescript
   export function buildEventHistoryUrl(
     eventShortName: string,
     countrycode: number,
     countries: CountryMap
   ): string | null {
     // Lookup country by code
     // Validate country.url is not null
     // Construct and return URL
     // Return null if any validation fails
   }
   ```

2. **Modify table population** (`src/actions/populateAmbassadorsTable.ts`):
   - Add optional parameters: `eventDetails?: EventDetailsMap`, `countries?: CountryMap`
   - In `populateEventAmbassadorsTable`, replace plain text event names with link elements
   - For each event in `allEvents`:
     - Lookup EventDetails from eventDetails map
     - Get countrycode from EventDetails.properties.countrycode
     - Call `buildEventHistoryUrl` with event name, countrycode, countries
     - If URL is not null: create `<a>` element with href, target="_blank", rel="noopener noreferrer"
     - If URL is null: create plain text span with tooltip explaining missing data
   - Maintain existing comma/semicolon separators between events

3. **Update function call** (`src/actions/populateAmbassadorsTable.ts`):
   - In `populateAmbassadorsTable`, pass eventDetails and countries to `populateEventAmbassadorsTable`
   - These should be available from the refreshUI call site

4. **Update call site** (`src/actions/refreshUI.ts` or wherever `populateAmbassadorsTable` is called):
   - Ensure eventDetails and countries are available
   - Pass them to `populateAmbassadorsTable`

### Testing Checklist

- [ ] Unit test: `buildEventHistoryUrl` with valid inputs returns correct URL
- [ ] Unit test: `buildEventHistoryUrl` with missing country returns null
- [ ] Unit test: `buildEventHistoryUrl` with null country.url returns null
- [ ] Unit test: `buildEventHistoryUrl` with empty event name returns null
- [ ] Integration test: Event names render as links in table
- [ ] Integration test: Links have correct href, target, rel attributes
- [ ] Integration test: Missing domain data shows plain text with tooltip
- [ ] Integration test: Keyboard navigation works (Tab to focus, Enter to activate)
- [ ] Integration test: Multiple events render with correct separators
- [ ] Manual test: Clicking link opens new tab with correct URL
- [ ] Manual test: Links work for multiple countries (test 3+ different country domains)

### Data Requirements

- EventDetailsMap must be loaded (via `getEvents()`)
- CountryMap must be loaded (via `getCountries()`)
- Both are cached in localStorage, so typically already available

### Example Usage

```typescript
// In populateEventAmbassadorsTable
const eventLink = document.createElement('a');
const url = buildEventHistoryUrl(eventName, eventDetails.properties.countrycode, countries);
if (url) {
  eventLink.href = url;
  eventLink.target = '_blank';
  eventLink.rel = 'noopener noreferrer';
  eventLink.textContent = eventName;
  eventLink.className = 'event-history-link';
} else {
  // Render as plain text with tooltip
  const span = document.createElement('span');
  span.textContent = eventName;
  span.title = 'Event history unavailable - missing country domain';
  span.setAttribute('aria-label', 'Event history unavailable - missing country domain');
}
```

## For Testers

### Test Scenarios

1. **Happy Path**: Event Ambassador with 3 events from Australia
   - All 3 event names should be clickable links
   - Clicking opens new tab with URLs like `https://www.parkrun.com.au/<event>/results/eventhistory/`

2. **Multiple Countries**: Event Ambassador with events from different countries
   - Each link should use the correct country domain
   - Test with at least: Australia (.com.au), UK (.co.uk), Canada (.ca)

3. **Missing Domain**: Event with countrycode that has null url in CountryMap
   - Event name should appear as plain text (not a link)
   - Tooltip should explain missing domain

4. **Missing EventDetails**: Event short name not in EventDetailsMap
   - Event name should appear as plain text (not a link)
   - No errors in console

5. **Keyboard Navigation**: 
   - Tab through Event Ambassador table
   - Should be able to focus on event name links
   - Enter/Space should activate link and open new tab

6. **Accessibility**:
   - Screen reader should announce links properly
   - Focus indicators should be visible
   - Disabled links should have appropriate aria-labels

## Common Issues

- **Links not appearing**: Check that eventDetails and countries parameters are being passed
- **Wrong domain**: Verify countrycode lookup is correct (string vs number conversion)
- **Broken links**: Check URL construction logic, ensure country.url is not null
- **Accessibility issues**: Verify target="_blank" has rel="noopener noreferrer"
