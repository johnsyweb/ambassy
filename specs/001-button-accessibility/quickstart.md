# Quick Start: Button Accessibility Improvements Feature

**Feature**: Button Accessibility Improvements  
**Date**: 2026-01-07  
**Phase**: 1 - Design & Contracts

## Overview

This feature adjusts button visibility to improve user experience by showing export functionality only when data is available, while keeping import functionality accessible at all times.

## Key Components

### Visibility Management (`src/index.ts`)

Functions to control button visibility:
- `updateButtonVisibility(hasData, isMapViewVisible)`: Main visibility update function
- `hasApplicationData()`: Check if data is loaded
- `isMapViewDisplayed()`: Check if map view is visible

### UI Elements (`public/index.html`)

- Export button in map view section: `id="exportButtonMap"`
- Import button in upload section: `id="importButton"`
- Import button in map view section: `id="importButtonMap"`
- Export button removed from upload section

## Usage Flow

### Initial State (No Data)

1. User visits application → Upload section visible
2. Export button not visible (removed from upload section)
3. Import button visible in upload section
4. User can import shared state or upload CSV files

### Data Loaded State

1. User uploads CSV files → Data loaded
2. Map view section becomes visible
3. Export button appears in map view section
4. Import button remains visible in map view section
5. User can export state or import new state

### State Transitions

1. **No Data → Data Loaded**: Export button appears in map view, import button remains accessible
2. **Data Loaded → No Data**: Export button disappears, import button remains accessible

## Integration Points

### Modified Files

- `src/index.ts`: 
  - Remove `setupExportButton("exportButton")` call
  - Add visibility update logic in `ambassy()` function
  - Update button visibility when transitioning between sections

- `public/index.html`:
  - Remove export button from upload section
  - Keep import button in upload section
  - Keep export and import buttons in map view section

### New Functions

- `updateButtonVisibility()`: Main visibility management function
- `hasApplicationData()`: Data availability check
- `isMapViewDisplayed()`: UI state check

## Testing Strategy

### Unit Tests

- Visibility logic functions
- State detection functions
- Button visibility based on data state

### Integration Tests

- Button visibility in upload section (no data)
- Button visibility in map view (data loaded)
- Visibility transitions when data is loaded/cleared
- Keyboard accessibility in both states

### Manual Testing Checklist

- [ ] Visit application with no data - export button not visible in upload section
- [ ] Import button visible in upload section
- [ ] Upload CSV files - export button appears in map view
- [ ] Import button visible in map view
- [ ] Click export button in map view - file downloads
- [ ] Click import button from either location - file picker opens
- [ ] Purge data - export button disappears, import button remains
- [ ] Keyboard navigation works for all visible buttons

## Error Handling

### Button Not Found

- **Cause**: Element ID mismatch or element removed
- **Handling**: Check element exists before modifying visibility, use optional chaining

### Visibility Not Updating

- **Cause**: State check logic error
- **Handling**: Verify data availability checks, ensure visibility updates called at right time

## Performance Considerations

- Visibility changes should be instantaneous (DOM manipulation is fast)
- No performance impact expected (simple style property changes)
- No re-rendering required (direct DOM manipulation)

## Accessibility Considerations

- Hidden buttons must not be focusable (`display: none` removes from tab order)
- Visible buttons must remain keyboard accessible
- Button labels and tooltips remain unchanged
- Screen readers will not announce hidden buttons

## Future Enhancements (Out of Scope)

- Animated transitions for button appearance/disappearance
- Button tooltips explaining why export is unavailable
- Additional button locations
- Button styling changes

