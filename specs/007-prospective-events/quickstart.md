# Quickstart: Prospective Events Feature

## Overview

This guide provides a quick way to understand and implement the Prospective Events feature for importing and managing potential future parkrun events.

## Getting Started

### 1. CSV Format
Your CSV file should have this structure:
```csv
Prospect Event,Country,State,Prospect ED/s,EA,Date Made Contact,Course Found,Landowner Permission,Funding Confirmed
Botanical Gardens,Australia,VIC,John Smith,Jane Doe,2024-01-15,true,false,true
City Park,Australia,NSW,Mary Johnson,John Smith,2024-02-01,false,true,false
Lake Reserve,Australia,QLD,Robert Brown,Sarah Wilson,2024-01-20,true,true,true
```

**Required columns**:
- `Prospect Event`: Name of the potential event
- `Country`: Country where event would be held
- `State`: State/region within the country
- `Prospect ED/s`: Name of prospect Event Director(s)
- `EA`: Event Ambassador name (must match existing ambassadors)
- `Date Made Contact`: Date when contact was first made (YYYY-MM-DD format)
- `Course Found`: Boolean indicating if suitable course found
- `Landowner Permission`: Boolean indicating landowner permission obtained
- `Funding Confirmed`: Boolean indicating funding secured

### 2. Basic Import Flow
```typescript
import { importProspectiveEvents } from './actions/importProspectiveEvents';

// In your UI handler
const handleImport = async (file: File) => {
  try {
    const result = await importProspectiveEvents(file);

    if (result.success) {
      console.log(`Imported ${result.events.length} prospective events`);

      if (result.warnings.length > 0) {
        console.warn('Import warnings:', result.warnings);
      }
    } else {
      console.error('Import failed:', result.errors);
    }
  } catch (error) {
    console.error('Import error:', error);
  }
};
```

### 3. Data Model Usage
```typescript
import { ProspectiveEvent } from './models/ProspectiveEvent';

// Create a prospective event
const prospect: ProspectiveEvent = {
  id: 'auto-generated',
  prospectEvent: 'Botanical Gardens',
  country: 'Australia',
  state: 'VIC',
  prospectEDs: 'John Smith',
  eventAmbassador: 'Jane Doe',
  dateMadeContact: new Date('2024-01-15'),
  courseFound: true,
  landownerPermission: false,
  fundingConfirmed: true,
  geocodingStatus: 'pending',
  ambassadorMatchStatus: 'pending',
  importTimestamp: Date.now(),
  sourceRow: 1
};
```

## Common Patterns

### Ambassador Name Matching
```typescript
import { matchProspectiveEventAmbassadors } from './actions/matchProspectiveEventAmbassadors';

const matchResult = matchProspectiveEventAmbassadors(
  prospectiveEvents,
  eventAmbassadors
);

// Handle unmatched ambassadors
if (matchResult.unmatched.length > 0) {
  // Show allocation dialog for unmatched EAs
  showAllocationDialog(matchResult.unmatched);
}
```

### Geocoding Integration
```typescript
import { geocodeProspectiveEvents } from './actions/geocodeProspectiveEvents';

const geocodeResult = await geocodeProspectiveEvents(eventsToGeocode);

// Handle failed geocoding
if (geocodeResult.failed.length > 0) {
  // Add to issues for manual resolution
  addToIssues(geocodeResult.failed, 'geocoding_required');
}
```

### Issues Resolution
```typescript
import { showProspectiveEventResolutionDialog } from './actions/showProspectiveEventResolutionDialog';

// When user clicks resolve on an issue
const resolutionResult = await showProspectiveEventResolutionDialog(
  prospectiveEvent,
  ['geocoding_required', 'ambassador_unmatched']
);

if (resolutionResult.resolved) {
  // Update the event with resolved data
  updateProspectiveEvent(resolutionResult.event);
}
```

## UI Integration

### Add Import Button
```html
<button id="importProspectsBtn" type="button">
  📥 Import Prospective Events
</button>
```

```typescript
document.getElementById('importProspectsBtn')?.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      handleImport(file);
    }
  };
  input.click();
});
```

### Add Prospective Events Tab
```html
<div id="prospectiveEventsTab" class="tab-content">
  <table id="prospectiveEventsTable">
    <thead>
      <tr>
        <th>Event</th>
        <th>Regional Ambassador</th>
        <th>Event Ambassador</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>
```

## Testing

### Unit Test Example
```typescript
describe('Prospective Events Import', () => {
  it('should parse hierarchical CSV correctly', () => {
    const csv = `RA Name,RA State,EA Name,EA State
Hugh Jackman,VIC,Paul Robinson,
,,Susan Kennedy,`;

    const events = parseProspectiveEventsCSV(csv);

    expect(events).toHaveLength(2);
    expect(events[0].regionalAmbassador).toBe('Hugh Jackman');
    expect(events[1].regionalAmbassador).toBe('Hugh Jackman'); // Inherited
  });
});
```

## Troubleshooting

### Common Issues
1. **CSV parsing fails**: Check that columns are in correct order
2. **Ambassador not found**: Verify name matching handles spaces correctly
3. **Geocoding fails**: Ensure state/region information is provided
4. **Memory issues**: Large CSVs should be processed in batches

### Debug Mode
```typescript
// Enable detailed logging
localStorage.setItem('prospectiveEventsDebug', 'true');
```

## Next Steps

1. **Implement core parsing** (`parseProspectiveEventsCSV`)
2. **Add geocoding integration** (`geocodeProspectiveEvents`)
3. **Implement name matching** (`matchProspectiveAmbassadors`)
4. **Create UI components** (import dialog, resolution workflow)
5. **Add comprehensive tests** (unit and integration)
6. **Integrate with existing Issues system**

The feature builds on existing patterns for CSV import, geocoding, and issue resolution, ensuring consistency with the current codebase.