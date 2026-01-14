# Quick Start: Share Changes with Ambassadors

**Feature**: Share Changes with Ambassadors  
**Date**: 2026-01-14  
**Phase**: 1 - Design & Contracts

## Overview

This feature enhances state sharing capabilities to make it easy for ambassadors to share their changes with colleagues. It adds multiple sharing methods (file download, URL-based sharing, copy-paste), export reminders, cross-browser sync, and user-friendly import guidance.

## Key Components

### Sharing Module (`src/actions/shareState.ts`)

Functions for sharing state via multiple methods:
- `shareStateAsFile()`: Export as downloadable file (enhances existing `exportState.ts`)
- `shareStateAsUrl()`: Generate shareable data URL
- `shareStateToClipboard()`: Copy JSON to clipboard

### Change Tracking Module (`src/actions/trackChanges.ts`)

Tracks unsaved changes for export reminders:
- `trackStateChange()`: Mark that state has changed
- `hasUnsavedChanges()`: Check if unsaved changes exist
- `markStateExported()`: Mark that state was exported
- `setupExportReminder()`: Register beforeunload reminder

### Import Guidance Module (`src/actions/showImportGuidance.ts`)

User-friendly import experience:
- `shouldShowImportGuidance()`: Determine if guidance needed
- `showImportGuidance()`: Display guidance UI
- `dismissImportGuidance()`: Hide guidance
- `markDataImported()`: Mark successful import

### Models

- **ChangeTracker** (`src/models/ChangeTracker.ts`): Tracks export and change timestamps
- **ImportGuidanceState** (`src/models/ImportGuidanceState.ts`): Tracks guidance display state
- **ShareStateResult** (`src/types/SharingTypes.ts`): Result type for sharing operations

### Utilities

- **Clipboard Utilities** (`src/utils/clipboard.ts`): Clipboard API wrapper with fallbacks
- **URL Sharing Utilities** (`src/utils/urlSharing.ts`): Data URL generation and validation

## Usage Flow

### Exporting and Sharing State

1. **User makes changes** → `trackStateChange()` called automatically
2. **User clicks "Share"** → Sharing dialog appears with three options:
   - **Download File**: `shareStateAsFile()` → File downloads, `markStateExported()` called
   - **Copy URL**: `shareStateAsUrl()` → URL copied, can be shared via messaging
   - **Copy to Clipboard**: `shareStateToClipboard()` → JSON copied to clipboard
3. **After successful share** → `markStateExported()` updates change tracker
4. **User closes window** → If unsaved changes exist, `beforeunload` reminder appears

### Importing Shared State

1. **User opens application** → `shouldShowImportGuidance()` checks if guidance needed
2. **If no data imported** → `showImportGuidance()` displays friendly instructions
3. **User receives shared file/URL** → Can import via:
   - **File**: Click "Import State" → Select file → `validateStateFile()` → `importApplicationState()`
   - **URL**: Paste data URL → Parse and validate → `importApplicationState()`
   - **Clipboard**: Paste JSON → Parse and validate → `importApplicationState()`
4. **After successful import** → `markDataImported()` hides guidance, updates state

### Export Reminder Flow

1. **Application initializes** → `setupExportReminder()` registers beforeunload listener
2. **User makes changes** → `trackStateChange()` updates timestamp
3. **User attempts to close window** → `beforeunload` event fires
4. **If `hasUnsavedChanges() === true`** → Browser shows native confirmation dialog
5. **User chooses**:
   - **Export**: Shares state → `markStateExported()` → Window closes
   - **Cancel**: Stays on page
   - **Leave anyway**: Window closes (changes may be lost)

## Integration Points

### Existing Code Integration

**State Mutation Functions** (call `trackStateChange()` after changes):
- `onboardAmbassador()` → After successful onboarding
- `offboardAmbassador()` → After successful offboarding
- `reallocateEventAmbassador()` → After successful reallocation
- `reallocateEventTeam()` → After successful reallocation
- `assignEventToAmbassador()` → After successful assignment
- `resolveIssue()` → After successful issue resolution
- Any function that modifies `eventAmbassadors`, `eventTeams`, `regionalAmbassadors`, or `changesLog`

**Export Functions** (enhance existing):
- `exportApplicationState()` → Call `markStateExported()` on success
- `downloadStateFile()` → Already works, no changes needed

**Import Functions** (enhance existing):
- `importApplicationState()` → Call `markDataImported()` on success
- `validateStateFile()` → Already works, add URL/clipboard parsing variants

**UI Initialization** (`src/index.ts`):
- On page load: Check `shouldShowImportGuidance()` → Show guidance if needed
- On page load: Call `setupExportReminder()` to register beforeunload listener
- Add sharing buttons/menu to UI with three options (file, URL, clipboard)

## Data Flow

```
User Action → State Change → trackStateChange() → ChangeTracker updated
                                                      ↓
User Shares → shareStateAs*() → markStateExported() → ChangeTracker updated
                                                      ↓
User Closes → beforeunload → hasUnsavedChanges() → Show reminder (if true)
```

```
User Opens App → shouldShowImportGuidance() → Show guidance (if needed)
                                                      ↓
User Imports → importApplicationState() → markDataImported() → Hide guidance
```

## Storage Keys

- `"changeTracker"`: ChangeTracker state (lastExportTimestamp, lastChangeTimestamp)
- `"importGuidanceState"`: ImportGuidanceState (hasImportedData, guidanceDismissed, lastGuidanceShown)
- Existing keys unchanged: `"eventAmbassadors"`, `"eventTeams"`, `"regionalAmbassadors"`, `"changesLog"`

## Error Handling

- **Sharing failures**: Show user-friendly error message, suggest alternative method
- **Clipboard unavailable**: Fall back to legacy `document.execCommand('copy')`, or suggest file download
- **URL too large**: Suggest file download instead, show size limit message
- **Import validation failures**: Show plain-language error with actionable next steps
- **Storage failures**: Gracefully degrade, show warning message

## Accessibility Considerations

- All sharing buttons must be keyboard accessible
- Import guidance must be readable by screen readers (ARIA labels)
- Error messages must be announced to assistive technologies
- Drag-and-drop import must have keyboard alternative
- Export reminder (beforeunload) uses browser's native accessible dialog

## Testing Strategy

- **Unit Tests**: Each sharing method, change tracking, import guidance logic
- **Integration Tests**: Full export/import flow, reminder triggering, guidance display
- **Accessibility Tests**: Keyboard navigation, screen reader compatibility
- **Error Handling Tests**: Invalid states, storage failures, API unavailability
- **Cross-browser Tests**: Clipboard API availability, beforeunload behavior

## Future Enhancements

- True cross-browser sync (requires backend service)
- QR code generation for mobile sharing
- Change history/diff viewing
- Auto-save functionality
- Collaborative editing (real-time sync)
