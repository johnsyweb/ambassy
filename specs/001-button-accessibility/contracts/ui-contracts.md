# UI Function Contracts

**Feature**: Button Accessibility Improvements  
**Date**: 2026-01-07  
**Type**: Function Contracts

## Button Visibility Management

### `updateButtonVisibility(hasData: boolean, isMapViewVisible: boolean): void`

Updates visibility of export and import buttons based on application state.

**Parameters**:
- `hasData` (boolean): Whether application has loaded data
- `isMapViewVisible` (boolean): Whether map view section is currently visible

**Returns**: `void`

**Throws**: Never throws (errors handled internally)

**Side Effects**: Modifies DOM element visibility properties

**Preconditions**:
- `hasData` must accurately reflect data availability
- `isMapViewVisible` must accurately reflect current UI state

**Postconditions**:
- Export button in map view visible when `hasData === true && isMapViewVisible === true`
- Export button in upload section hidden (removed from DOM or hidden)
- Import buttons visible in both locations

---

### `hideExportButtonInUploadSection(): void`

Hides the export button in the upload section.

**Parameters**: None

**Returns**: `void`

**Throws**: Never throws

**Side Effects**: Sets export button display style to "none" or removes from DOM

**Preconditions**:
- Export button element exists in upload section

**Postconditions**:
- Export button not visible in upload section
- Export button not focusable via keyboard

---

### `showExportButtonInMapView(): void`

Shows the export button in the map view section.

**Parameters**: None

**Returns**: `void`

**Throws**: Never throws

**Side Effects**: Sets export button display style to show button

**Preconditions**:
- Export button element exists in map view section
- Data is loaded

**Postconditions**:
- Export button visible in map view section
- Export button keyboard accessible

---

### `ensureImportButtonVisible(location: 'upload' | 'mapView'): void`

Ensures import button is visible in the specified location.

**Parameters**:
- `location` ('upload' | 'mapView'): Which section to ensure button visibility

**Returns**: `void`

**Throws**: Never throws

**Side Effects**: Sets import button display style to show button

**Preconditions**:
- Import button element exists in specified location

**Postconditions**:
- Import button visible in specified location
- Import button keyboard accessible

---

## State Detection Functions

### `hasApplicationData(): boolean`

Checks if application has loaded data available for export.

**Parameters**: None

**Returns**: `boolean` - true if all required data Maps have data, false otherwise

**Throws**: Never throws

**Side Effects**: Reads from localStorage or checks Map sizes

**Preconditions**: None

**Postconditions**:
- Returns true when Event Ambassadors, Event Teams, and Regional Ambassadors all have data
- Returns false when any required data is missing

---

### `isMapViewDisplayed(): boolean`

Checks if map view section is currently displayed.

**Parameters**: None

**Returns**: `boolean` - true if map view section is visible, false otherwise

**Throws**: Never throws

**Side Effects**: Checks DOM element display style

**Preconditions**:
- Map view section element exists

**Postconditions**:
- Returns true when map view section display style is not "none"
- Returns false when upload section is visible instead

