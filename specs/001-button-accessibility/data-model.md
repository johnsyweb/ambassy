# Data Model: Button Accessibility Improvements

**Feature**: Button Accessibility Improvements  
**Date**: 2026-01-07  
**Phase**: 1 - Design & Contracts

## Entities

### Button Visibility State

Represents the visibility state of export and import buttons based on application data state.

**Fields**:
- `hasData` (boolean, required): Whether application has loaded data (Event Ambassadors, Event Teams, Regional Ambassadors)
- `isMapViewVisible` (boolean, required): Whether the map view section is currently displayed
- `isUploadSectionVisible` (boolean, required): Whether the upload section is currently displayed

**Relationships**: Determines visibility of Export Button and Import Button entities

**Validation Rules**:
- `hasData` is true when all three data Maps have size > 0
- `isMapViewVisible` and `isUploadSectionVisible` are mutually exclusive (one visible at a time)
- When `hasData` is true, `isMapViewVisible` should be true
- When `hasData` is false, `isUploadSectionVisible` should be true

### Export Button

UI element that triggers state export functionality.

**Visibility Rules**:
- Visible when: `hasData === true && isMapViewVisible === true`
- Hidden when: `hasData === false || isMapViewVisible === false`

**Relationships**: Appears in Map View Section when data is loaded

### Import Button

UI element that triggers state import functionality.

**Visibility Rules**:
- Visible when: `isUploadSectionVisible === true || isMapViewVisible === true` (always visible)
- Hidden when: Never (always accessible)

**Relationships**: Appears in both Upload Section and Map View Section

### Upload Section

Initial view shown when no data is loaded.

**Contains**:
- CSV file upload input
- Import button (always visible)
- Export button (never visible in this section)

### Map View Section

View shown when data is loaded.

**Contains**:
- Map container
- Event Teams table
- Changes Log table
- Export button (visible when data loaded)
- Import button (always visible)
- Purge Data button

## State Transitions

### Data Loading Flow

1. **Initial State**: `hasData = false`, Upload Section visible, Export button hidden, Import button visible
2. **Data Uploaded**: `hasData = true`, Map View becomes visible, Export button appears, Import button remains visible
3. **Data Cleared**: `hasData = false`, Upload Section becomes visible, Export button hidden, Import button remains visible

### Visibility Update Flow

1. **Check Data State**: Evaluate if all required data Maps have data
2. **Update Section Visibility**: Show/hide upload section and map view section
3. **Update Button Visibility**: Show/hide export button based on data state, keep import button always visible

## Validation Rules Summary

### Button Visibility Validation

1. **Export Button**: Must be hidden when no data, visible when data loaded and map view displayed
2. **Import Button**: Must be visible in both upload section and map view section at all times
3. **State Consistency**: Button visibility must match application data state

### UI State Validation

1. **Section Visibility**: Only one section (upload or map view) should be visible at a time
2. **Data Consistency**: Button visibility must reflect actual data availability
3. **Accessibility**: Hidden buttons must not be focusable via keyboard navigation

## Error States

### Button Not Visible When Expected

- **Cause**: Visibility logic error, incorrect state check
- **Handling**: Debug visibility logic, ensure state checks are correct

### Button Visible When Should Be Hidden

- **Cause**: Visibility logic error, state not properly checked
- **Handling**: Debug visibility logic, ensure export button hidden when no data

### Layout Shift

- **Cause**: Using `visibility: hidden` instead of `display: none`
- **Handling**: Use `display: none` to completely remove from layout

