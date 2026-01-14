# API Contracts: Sharing and Synchronization

**Feature**: Share Changes with Ambassadors  
**Date**: 2026-01-14  
**Phase**: 1 - Design & Contracts

## Sharing Functions

### `shareStateAsFile(): Promise<ShareStateResult>`

Exports application state as a downloadable file (existing functionality enhanced).

**Parameters**: None

**Returns**: `Promise<ShareStateResult>` - Result with `method = "file"` and `data` as Blob

**Throws**: 
- `Error` if state is incomplete or invalid
- `Error` if file download cannot be initiated

**Side Effects**: 
- Triggers browser file download
- Updates `ChangeTracker.lastExportTimestamp` on success

**Preconditions**:
- Application must have valid state data loaded
- All required state components must be present

**Postconditions**:
- File download initiated in browser
- `ChangeTracker.lastExportTimestamp` updated to current time
- Returns success result with Blob data

---

### `shareStateAsUrl(): Promise<ShareStateResult>`

Exports application state as a shareable data URL.

**Parameters**: None

**Returns**: `Promise<ShareStateResult>` - Result with `method = "url"` and `data` as string (data: URL)

**Throws**:
- `Error` if state is incomplete or invalid
- `Error` if state size exceeds URL length limits (>1.5MB after Base64 encoding)

**Side Effects**:
- Updates `ChangeTracker.lastExportTimestamp` on success

**Preconditions**:
- Application must have valid state data loaded
- State size must be <1.5MB (after Base64 encoding)

**Postconditions**:
- Returns success result with data: URL string
- `ChangeTracker.lastExportTimestamp` updated to current time
- URL can be shared via messaging/email

**Error Handling**:
- If state too large, returns error result suggesting file download instead

---

### `shareStateToClipboard(): Promise<ShareStateResult>`

Copies application state JSON to clipboard.

**Parameters**: None

**Returns**: `Promise<ShareStateResult>` - Result with `method = "clipboard"` and `data = null`

**Throws**:
- `Error` if Clipboard API unavailable (not in secure context)
- `Error` if clipboard write fails

**Side Effects**:
- Copies JSON string to system clipboard
- Updates `ChangeTracker.lastExportTimestamp` on success

**Preconditions**:
- Must be in secure context (HTTPS or localhost)
- Clipboard API must be available

**Postconditions**:
- JSON string copied to clipboard
- `ChangeTracker.lastExportTimestamp` updated to current time
- Returns success result

**Error Handling**:
- Falls back to legacy `document.execCommand('copy')` if Clipboard API unavailable
- Returns error result if all clipboard methods fail

---

## Change Tracking Functions

### `trackStateChange(): void`

Marks that application state has changed (call after any state mutation).

**Parameters**: None

**Returns**: `void`

**Throws**: Never throws

**Side Effects**: 
- Updates `ChangeTracker.lastChangeTimestamp` to current time
- Stores updated ChangeTracker in localStorage

**Preconditions**: None

**Postconditions**:
- `ChangeTracker.lastChangeTimestamp` updated
- `ChangeTracker.hasUnsavedChanges` will be `true` if `lastChangeTimestamp > lastExportTimestamp`

**Usage**: Call after any state mutation (onboard, offboard, reallocate, etc.)

---

### `hasUnsavedChanges(): boolean`

Checks if user has unsaved changes since last export.

**Parameters**: None

**Returns**: `boolean` - `true` if `lastChangeTimestamp > lastExportTimestamp`, `false` otherwise

**Throws**: Never throws

**Side Effects**: None (read-only)

**Preconditions**: None

**Postconditions**: Returns current unsaved changes status

---

### `markStateExported(): void`

Marks that state has been exported (call after successful export).

**Parameters**: None

**Returns**: `void`

**Throws**: Never throws

**Side Effects**:
- Updates `ChangeTracker.lastExportTimestamp` to current time
- Stores updated ChangeTracker in localStorage

**Preconditions**: None

**Postconditions**:
- `ChangeTracker.lastExportTimestamp` updated
- `ChangeTracker.hasUnsavedChanges` will be `false`

**Usage**: Called automatically by sharing functions on success

---

## Export Reminder Functions

### `setupExportReminder(): void`

Sets up beforeunload event listener to warn user before closing if unsaved changes exist.

**Parameters**: None

**Returns**: `void`

**Throws**: Never throws

**Side Effects**:
- Registers `beforeunload` event listener
- Browser will show native confirmation dialog if user tries to close with unsaved changes

**Preconditions**: None

**Postconditions**:
- `beforeunload` listener registered
- Reminder will trigger on window close if `hasUnsavedChanges() === true`

**Usage**: Call once during application initialization

---

### `removeExportReminder(): void`

Removes beforeunload event listener (e.g., if user disables reminders).

**Parameters**: None

**Returns**: `void`

**Throws**: Never throws

**Side Effects**: Removes `beforeunload` event listener

**Preconditions**: `setupExportReminder()` must have been called

**Postconditions**: Reminder no longer triggers on window close

---

## Import Guidance Functions

### `shouldShowImportGuidance(): boolean`

Determines if import guidance should be displayed to user.

**Parameters**: None

**Returns**: `boolean` - `true` if guidance should be shown, `false` otherwise

**Throws**: Never throws

**Side Effects**: None (read-only)

**Preconditions**: None

**Postconditions**: Returns whether to show guidance based on `ImportGuidanceState`

**Logic**:
- Returns `true` if `hasImportedData === false` AND `guidanceDismissed === false`
- Returns `false` otherwise

---

### `showImportGuidance(): void`

Displays import guidance UI to user.

**Parameters**: None

**Returns**: `void`

**Throws**: Never throws

**Side Effects**:
- Displays guidance UI element on main screen
- Updates `ImportGuidanceState.lastGuidanceShown` to current time

**Preconditions**: None

**Postconditions**:
- Guidance UI visible to user
- `lastGuidanceShown` timestamp updated

---

### `dismissImportGuidance(): void`

Marks import guidance as dismissed by user.

**Parameters**: None

**Returns**: `void`

**Throws**: Never throws

**Side Effects**:
- Sets `ImportGuidanceState.guidanceDismissed = true`
- Hides guidance UI
- Stores updated state in localStorage

**Preconditions**: Guidance must be currently displayed

**Postconditions**:
- Guidance UI hidden
- Guidance will not be shown again unless state is reset

---

### `markDataImported(): void`

Marks that user has successfully imported data.

**Parameters**: None

**Returns**: `void`

**Throws**: Never throws

**Side Effects**:
- Sets `ImportGuidanceState.hasImportedData = true`
- Hides guidance UI if currently displayed
- Stores updated state in localStorage

**Preconditions**: Import operation must have completed successfully

**Postconditions**:
- `hasImportedData = true`
- Guidance will not be shown in future sessions

---

## Cross-Browser Sync Functions (Future Enhancement)

### `syncStateAcrossTabs(): Promise<void>`

Synchronizes state across browser tabs using storage event.

**Parameters**: None

**Returns**: `Promise<void>`

**Throws**:
- `Error` if sync fails due to storage limitations
- `Error` if state conflict cannot be resolved

**Side Effects**:
- Listens for `storage` events from other tabs
- Updates local state when changes detected in other tabs
- Broadcasts local changes to other tabs

**Preconditions**:
- Multiple tabs of same application must be open
- localStorage must be available

**Postconditions**:
- State synchronized across all open tabs
- `SyncMetadata.lastSyncTimestamp` updated

**Note**: This is a future enhancement. Initial implementation focuses on manual export/import for cross-browser scenarios.

---

## Error Types

### `SharingError`

Base error class for sharing operations.

**Properties**:
- `message` (string): Human-readable error message
- `method` (SharingMethod): Sharing method that failed
- `cause` (Error | null): Underlying error if any

---

### `StateTooLargeError extends SharingError`

Thrown when state exceeds size limits for URL sharing.

**Properties**:
- `size` (number): Actual state size in bytes
- `maxSize` (number): Maximum allowed size in bytes
- `suggestedMethod` (SharingMethod): Alternative method to use (typically "file")

---

### `ClipboardUnavailableError extends SharingError`

Thrown when Clipboard API is unavailable.

**Properties**:
- `reason` (string): Reason for unavailability (e.g., "not_secure_context", "permission_denied")
