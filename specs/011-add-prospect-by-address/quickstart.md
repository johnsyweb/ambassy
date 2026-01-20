# Quickstart: Add Prospect by Address

**Feature**: 011-add-prospect-by-address  
**Date**: 2026-01-18

## Overview

This guide provides a quick way to understand and implement the "Add Prospect by Address" feature, which allows REAs to add new prospective events by entering an address.

## Getting Started

### 1. User Flow

1. REA clicks "Add Prospect" button in main toolbar
2. Dialog appears with form fields
3. REA enters prospect name, address, and state
4. System automatically geocodes address when both address and state are filled
5. System displays allocation suggestions (top 3-5 EAs)
6. REA selects an EA (from suggestions or manual list)
7. System creates prospect, persists it, and refreshes display

### 2. Basic Implementation

#### Button Setup (in `index.ts`)

```typescript
function setupAddProspectButton(): void {
  const button = document.getElementById("addProspectButton");
  if (!button) return;

  button.addEventListener("click", () => {
    const eventAmbassadors = getEventAmbassadorsFromSession();
    const regionalAmbassadors = getRegionalAmbassadorsFromSession();
    const eventDetails = getEventDetailsFromSession();

    if (eventAmbassadors.size === 0) {
      alert("No Event Ambassadors available. Please onboard an Event Ambassador first.");
      return;
    }

    showAddProspectDialog(
      eventAmbassadors,
      regionalAmbassadors,
      eventDetails,
      () => {
        // On success: refresh table, map, track changes
        refreshProspectsTable();
        populateMap();
        trackStateChange();
      },
      () => {
        // On cancel: no action needed
      }
    );
  });
}
```

#### Dialog Function (in `actions/showAddProspectDialog.ts`)

```typescript
export function showAddProspectDialog(
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventDetails: EventDetailsMap,
  onSuccess: () => void,
  onCancel: () => void
): void {
  const dialog = document.getElementById("reallocationDialog");
  // ... setup dialog DOM ...
  
  // Form fields
  const prospectNameInput = document.createElement("input");
  const addressInput = document.createElement("input");
  const stateInput = document.createElement("input");
  // ... optional fields ...
  
  // Geocoding trigger (automatic when address + state filled)
  let geocodeTimeout: NodeJS.Timeout | null = null;
  
  const triggerGeocoding = async () => {
    const address = addressInput.value.trim();
    const state = stateInput.value.trim();
    
    if (!address || !state) return;
    
    // Debounce
    if (geocodeTimeout) clearTimeout(geocodeTimeout);
    geocodeTimeout = setTimeout(async () => {
      // Show loading
      // Call geocodeAddress
      // Infer country
      // Generate suggestions
      // Display suggestions
    }, 500);
  };
  
  addressInput.addEventListener("input", triggerGeocoding);
  stateInput.addEventListener("blur", triggerGeocoding);
  
  // EA selection handler
  const handleEASelection = async (eaName: string) => {
    const prospect = createProspectFromAddress({
      prospectEvent: prospectNameInput.value.trim(),
      address: addressInput.value.trim(),
      state: stateInput.value.trim(),
      coordinates: geocodedCoordinates,
      country: inferredCountry,
      eventAmbassador: eaName,
      // ... optional fields ...
    }, eventAmbassadors, regionalAmbassadors);
    
    // Persist
    const existing = loadProspectiveEvents();
    saveProspectiveEvents([...existing, prospect]);
    
    // Log change
    trackChanges(/* prospect creation log entry */);
    
    dialog.style.display = "none";
    onSuccess();
  };
}
```

#### Core Creation Logic (in `actions/createProspectFromAddress.ts`)

```typescript
export function createProspectFromAddress(
  prospectData: ProspectCreationData,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap
): ProspectiveEvent {
  // Validate required fields
  if (!prospectData.prospectEvent?.trim()) {
    throw new Error("Prospect name is required");
  }
  // ... other validations ...
  
  // Generate ID
  const id = generateProspectiveEventId(
    prospectData.prospectEvent,
    prospectData.country,
    prospectData.state
  );
  
  // Create prospect
  const prospect: ProspectiveEvent = {
    id,
    prospectEvent: prospectData.prospectEvent.trim(),
    country: prospectData.country,
    state: prospectData.state.trim(),
    prospectEDs: prospectData.prospectEDs || "",
    eventAmbassador: prospectData.eventAmbassador,
    courseFound: prospectData.courseFound ?? false,
    landownerPermission: prospectData.landownerPermission ?? false,
    fundingConfirmed: prospectData.fundingConfirmed ?? false,
    dateMadeContact: prospectData.dateMadeContact || null,
    coordinates: prospectData.coordinates,
    geocodingStatus: prospectData.coordinates ? 'success' : 'manual',
    ambassadorMatchStatus: 'matched',
    importTimestamp: Date.now(),
    sourceRow: -1, // Indicates manual creation
  };
  
  // Validate
  const validation = validateProspectiveEvent(prospect);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
  }
  
  // Update EA allocation count
  const ea = eventAmbassadors.get(prospect.eventAmbassador);
  if (ea) {
    if (!ea.prospectiveEvents) {
      ea.prospectiveEvents = [];
    }
    ea.prospectiveEvents.push(prospect.id);
  }
  
  return prospect;
}
```

### 3. Key Integration Points

#### HTML Button (in `public/index.html`)

```html
<button type="button" id="addProspectButton" title="Add Prospect by Address">📍 Add Prospect</button>
```

Add to main toolbar alongside other "Add" buttons.

#### Table Refresh

After prospect creation, call:
```typescript
refreshProspectsTable(); // Updates Prospects table
```

#### Map Update

After prospect creation, call:
```typescript
populateMap(); // Updates map with new prospect marker
```

#### Change Tracking

After prospect creation:
```typescript
trackStateChange(); // Marks state as modified
trackChanges(/* log entry */); // Logs prospect creation
```

### 4. Error Handling

#### Geocoding Failures

```typescript
try {
  const { lat, lng } = await geocodeAddress(address);
  // Success
} catch (error) {
  // Show error message
  // Offer retry or manual coordinate entry
}
```

#### Validation Failures

```typescript
const validation = validateProspectiveEvent(prospect);
if (!validation.isValid) {
  // Display validation errors
  // Prevent creation
}
```

#### No EAs Available

```typescript
if (eventAmbassadors.size === 0) {
  // Show error message
  // Prevent dialog from showing suggestions
}
```

### 5. Testing

#### Unit Tests

```typescript
describe('createProspectFromAddress', () => {
  it('should create prospect with required fields', () => {
    const prospect = createProspectFromAddress({
      prospectEvent: 'Test Prospect',
      address: '123 Main St',
      state: 'VIC',
      coordinates: createCoordinate(-37.8, 144.9),
      country: 'Australia',
      eventAmbassador: 'Test EA',
    }, eventAmbassadors, regionalAmbassadors);
    
    expect(prospect.prospectEvent).toBe('Test Prospect');
    expect(prospect.eventAmbassador).toBe('Test EA');
  });
  
  // ... more tests ...
});
```

#### Integration Tests

```typescript
describe('showAddProspectDialog', () => {
  it('should create and persist prospect on EA selection', async () => {
    // Setup
    // Open dialog
    // Enter details
    // Wait for geocoding
    // Select EA
    // Verify prospect created and persisted
  });
});
```

## Common Patterns

### Automatic Geocoding with Debouncing

```typescript
let geocodeTimeout: NodeJS.Timeout | null = null;

function triggerGeocoding() {
  if (geocodeTimeout) clearTimeout(geocodeTimeout);
  
  geocodeTimeout = setTimeout(async () => {
    // Perform geocoding
  }, 500); // 500ms debounce
}
```

### Re-geocoding on Address Change

```typescript
let lastGeocodedAddress = '';

addressInput.addEventListener('input', () => {
  const currentAddress = addressInput.value.trim();
  
  if (lastGeocodedAddress && currentAddress !== lastGeocodedAddress) {
    // Address changed after geocoding - re-geocode
    triggerGeocoding();
  }
});
```

### Loading State Management

```typescript
function setLoading(isLoading: boolean) {
  geocodeButton.disabled = isLoading;
  loadingIndicator.style.display = isLoading ? 'inline' : 'none';
  addressInput.disabled = isLoading;
  stateInput.disabled = isLoading;
}
```

## Next Steps

1. Implement `showAddProspectDialog` function
2. Implement `createProspectFromAddress` function
3. Implement `generateProspectAllocationSuggestions` helper
4. Add button to HTML and setup handler
5. Write unit tests for all functions
6. Write integration tests for full flow
7. Test accessibility (keyboard navigation, screen readers)
8. Update README if needed
