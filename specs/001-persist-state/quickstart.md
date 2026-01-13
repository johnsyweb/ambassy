# Quick Start: State Persistence and Sharing Feature

**Feature**: State Persistence and Sharing  
**Date**: 2026-01-07  
**Phase**: 1 - Design & Contracts

## Overview

This feature adds persistent state management to Ambassy, allowing users to:
1. Have their data persist across browser sessions (automatic)
2. Export their state as a shareable JSON file
3. Import state files shared by other users

## Key Components

### Storage Layer (`src/utils/storage.ts`)

Abstraction over browser storage APIs:
- `saveToStorage(key, value)`: Save data with automatic fallback
- `loadFromStorage<T>(key)`: Load data with type safety
- `isStorageAvailable()`: Check localStorage availability

### Persistence Actions (`src/actions/persistState.ts`)

Functions to persist application data:
- `persistEventAmbassadors(map)`
- `persistEventTeams(map)`
- `persistRegionalAmbassadors(map)`
- `persistChangesLog(entries)`
- `restoreApplicationState()`: Restore all data on page load

### Export Action (`src/actions/exportState.ts`)

- `exportApplicationState()`: Generate JSON file blob
- `downloadStateFile(blob, filename)`: Trigger download

### Import Action (`src/actions/importState.ts`)

- `validateStateFile(file)`: Validate and parse imported file
- `importApplicationState(state)`: Import validated state

### State Model (`src/models/ApplicationState.ts`)

Type definition for complete application state:
```typescript
interface ApplicationState {
  version: string;
  exportedAt: string;
  data: {
    eventAmbassadors: Array<[string, EventAmbassador]>;
    eventTeams: Array<[string, EventTeam]>;
    regionalAmbassadors: Array<[string, RegionalAmbassador]>;
    changesLog: LogEntry[];
  };
}
```

## Usage Flow

### Automatic Persistence

1. User uploads CSV files → Data automatically saved to localStorage
2. User makes changes → Changes automatically persisted
3. User closes browser → Data remains in localStorage
4. User returns → Data automatically restored on page load

### Export Flow

1. User clicks "Export State" button
2. System collects all current state from localStorage
3. System generates JSON file with version and timestamp
4. Browser downloads file (e.g., `ambassy-state-2026-01-07.json`)

### Import Flow

1. User clicks "Import State" button
2. File picker opens
3. User selects exported JSON file
4. System validates file format and version
5. If existing data present, user confirms replacement
6. System imports data to localStorage
7. UI updates to show imported data

## Integration Points

### Modified Files

- `src/index.ts`: Update to use localStorage, add export/import UI
- `src/actions/uploadCSV.ts`: Change sessionStorage to localStorage
- `src/parsers/parseEventTeams.ts`: Update to use localStorage

### New Files

- `src/utils/storage.ts`: Storage abstraction
- `src/actions/persistState.ts`: Persistence functions
- `src/actions/exportState.ts`: Export functionality
- `src/actions/importState.ts`: Import functionality
- `src/models/ApplicationState.ts`: State type definition

### UI Changes

- Add "Export State" button to upload section
- Add "Import State" button to upload section
- Add file input (hidden) for import
- Show notifications for storage availability issues
- Show confirmation dialog before import (if data exists)

## Testing Strategy

### Unit Tests

- Storage abstraction functions (with mocked localStorage)
- Persistence functions
- Export/import functions
- Validation logic
- Error handling

### Integration Tests

- End-to-end export/import flow
- Storage migration from sessionStorage
- Multi-tab synchronisation (storage events)
- Error scenarios (invalid files, storage unavailable)

### Manual Testing Checklist

- [ ] Upload CSV files, close browser, reopen - data persists
- [ ] Export state, verify file format and contents
- [ ] Import exported file, verify data matches
- [ ] Import invalid file, verify error handling
- [ ] Test in private browsing mode (fallback to sessionStorage)
- [ ] Test with multiple tabs open (storage events)

## Error Handling

### Storage Unavailable

- Detect private browsing mode or disabled storage
- Fall back to sessionStorage
- Show user notification: "Persistence unavailable. Data will be lost when browser closes."

### Import Errors

- Invalid JSON: "File format is invalid. Please select a valid Ambassy state file."
- Missing fields: "File is missing required data. Please ensure file is complete."
- Version mismatch: "File version is incompatible. Please export a new file from the current version."
- Invalid data: "File contains invalid data. Please verify the file is not corrupted."

## Performance Considerations

- Export: Should complete in < 5 seconds (SC-002)
- Import: Should complete in < 10 seconds (SC-003)
- Page load restoration: Should complete in < 10 seconds (SC-006)
- Batch localStorage operations where possible
- Use async file reading for imports

## Security Considerations

- No server-side storage (data stays in browser)
- Exported files contain same data as CSV uploads (no additional sensitive data)
- File validation prevents code injection
- No external dependencies (uses native browser APIs)

## Future Enhancements (Out of Scope)

- Version migration for older state files
- Partial import/merge functionality
- Encryption of exported files
- Cloud backup integration
- Multi-user real-time collaboration

