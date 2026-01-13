# Storage Function Contracts

**Feature**: State Persistence and Sharing  
**Date**: 2026-01-07  
**Type**: Function Contracts

## Storage Abstraction Layer

### `saveToStorage(key: string, value: unknown): boolean`

Saves data to persistent storage (localStorage with sessionStorage fallback).

**Parameters**:
- `key` (string): Storage key (will be prefixed with "ambassy:")
- `value` (unknown): Data to store (will be JSON stringified)

**Returns**: `boolean` - true if save successful, false otherwise

**Throws**: Never throws, returns false on error

**Side Effects**: Writes to localStorage (or sessionStorage if localStorage unavailable)

**Preconditions**:
- `key` must be non-empty string
- `value` must be JSON-serializable

**Postconditions**:
- Data persisted to storage if successful
- Returns false if storage unavailable or quota exceeded

---

### `loadFromStorage<T>(key: string): T | null`

Loads data from persistent storage.

**Parameters**:
- `key` (string): Storage key (will be prefixed with "ambassy:")
- `T`: Type parameter for return type

**Returns**: `T | null` - Parsed data or null if not found/invalid

**Throws**: Never throws, returns null on error

**Side Effects**: Reads from localStorage (or sessionStorage if localStorage unavailable)

**Preconditions**:
- `key` must be non-empty string

**Postconditions**:
- Returns parsed data if found and valid
- Returns null if not found or invalid JSON

---

### `isStorageAvailable(): boolean`

Checks if persistent storage (localStorage) is available.

**Parameters**: None

**Returns**: `boolean` - true if localStorage available, false otherwise

**Throws**: Never throws

**Side Effects**: Tests localStorage write capability

**Preconditions**: None

**Postconditions**:
- Returns true if localStorage can be written to
- Returns false if localStorage unavailable (private browsing, disabled, etc.)

---

## State Persistence Functions

### `persistEventAmbassadors(eventAmbassadors: EventAmbassadorMap): void`

Persists Event Ambassadors data to storage.

**Parameters**:
- `eventAmbassadors` (EventAmbassadorMap): Map of event ambassadors

**Returns**: `void`

**Throws**: Never throws (errors handled internally)

**Side Effects**: Writes to storage, may show user notification if storage unavailable

**Preconditions**:
- `eventAmbassadors` must be valid Map

**Postconditions**:
- Data persisted to storage if available
- User notified if persistence failed

---

### `persistEventTeams(eventTeams: EventTeamMap): void`

Persists Event Teams data to storage.

**Parameters**:
- `eventTeams` (EventTeamMap): Map of event teams

**Returns**: `void`

**Throws**: Never throws (errors handled internally)

**Side Effects**: Writes to storage, may show user notification if storage unavailable

**Preconditions**:
- `eventTeams` must be valid Map

**Postconditions**:
- Data persisted to storage if available
- User notified if persistence failed

---

### `persistRegionalAmbassadors(regionalAmbassadors: RegionalAmbassadorMap): void`

Persists Regional Ambassadors data to storage.

**Parameters**:
- `regionalAmbassadors` (RegionalAmbassadorMap): Map of regional ambassadors

**Returns**: `void`

**Throws**: Never throws (errors handled internally)

**Side Effects**: Writes to storage, may show user notification if storage unavailable

**Preconditions**:
- `regionalAmbassadors` must be valid Map

**Postconditions**:
- Data persisted to storage if available
- User notified if persistence failed

---

### `persistChangesLog(changesLog: LogEntry[]): void`

Persists changes log to storage.

**Parameters**:
- `changesLog` (LogEntry[]): Array of log entries

**Returns**: `void`

**Throws**: Never throws (errors handled internally)

**Side Effects**: Writes to storage, may show user notification if storage unavailable

**Preconditions**:
- `changesLog` must be valid array

**Postconditions**:
- Data persisted to storage if available
- User notified if persistence failed

---

### `restoreApplicationState(): ApplicationState | null`

Restores complete application state from storage.

**Parameters**: None

**Returns**: `ApplicationState | null` - Restored state or null if not found/invalid

**Throws**: Never throws, returns null on error

**Side Effects**: Reads from storage

**Preconditions**: None

**Postconditions**:
- Returns complete state if all data found and valid
- Returns null if data incomplete or invalid
- Performs migration from sessionStorage if needed

---

## Export Functions

### `exportApplicationState(): Blob`

Exports current application state as a downloadable file.

**Parameters**: None

**Returns**: `Blob` - JSON file blob ready for download

**Throws**: May throw if state data invalid or incomplete

**Side Effects**: Reads from storage, creates blob

**Preconditions**:
- Application must have valid state data loaded

**Postconditions**:
- Returns blob containing valid JSON state file
- Throws if required data missing

---

### `downloadStateFile(blob: Blob, filename: string): void`

Triggers browser download of state file.

**Parameters**:
- `blob` (Blob): File blob to download
- `filename` (string): Suggested filename (e.g., "ambassy-state-2026-01-07.json")

**Returns**: `void`

**Throws**: Never throws

**Side Effects**: Triggers browser download

**Preconditions**:
- `blob` must be valid Blob
- `filename` must be non-empty string

**Postconditions**:
- File download initiated in browser

---

## Import Functions

### `validateStateFile(file: File): Promise<ApplicationState>`

Validates and parses imported state file.

**Parameters**:
- `file` (File): File object from file input

**Returns**: `Promise<ApplicationState>` - Parsed and validated state

**Throws**: Throws error if file invalid, malformed, or incompatible version

**Side Effects**: Reads file contents

**Preconditions**:
- `file` must be valid File object
- File must be JSON format

**Postconditions**:
- Returns validated ApplicationState if file valid
- Throws descriptive error if validation fails

**Error Types**:
- `InvalidFileFormatError`: File is not valid JSON
- `MissingFieldError`: Required fields missing
- `VersionMismatchError`: File version incompatible
- `InvalidDataError`: Data structure invalid

---

### `importApplicationState(state: ApplicationState): void`

Imports validated state into application.

**Parameters**:
- `state` (ApplicationState): Validated application state

**Returns**: `void`

**Throws**: Never throws (errors handled internally)

**Side Effects**: Writes to storage, updates UI

**Preconditions**:
- `state` must be validated ApplicationState
- User must have confirmed import (if existing data present)

**Postconditions**:
- All state data persisted to storage
- UI updated to reflect imported state
- User notified of success or failure

---

## Migration Functions

### `migrateFromSessionStorage(): void`

Migrates existing sessionStorage data to localStorage.

**Parameters**: None

**Returns**: `void`

**Throws**: Never throws (errors handled internally)

**Side Effects**: Reads from sessionStorage, writes to localStorage

**Preconditions**: None

**Postconditions**:
- Data copied from sessionStorage to localStorage if found
- No-op if localStorage already has data or sessionStorage empty

