# Data Model: Share Changes with Ambassadors

**Feature**: Share Changes with Ambassadors  
**Date**: 2026-01-14  
**Phase**: 1 - Design & Contracts

## Entities

### ChangeTracker

Tracks whether the user has unsaved changes since last export, used for export reminders.

**Fields**:
- `lastExportTimestamp` (number, required): Unix timestamp (milliseconds) of last successful export
- `lastChangeTimestamp` (number, required): Unix timestamp (milliseconds) of last state change
- `hasUnsavedChanges` (boolean, computed): `lastChangeTimestamp > lastExportTimestamp`

**Relationships**: Independent entity, stored in localStorage

**Validation Rules**:
- `lastExportTimestamp` must be valid timestamp (positive number)
- `lastChangeTimestamp` must be valid timestamp (positive number)
- If either timestamp is missing, treat as "never exported" or "no changes" respectively

**State Transitions**:
- **Initial State**: `lastExportTimestamp = 0`, `lastChangeTimestamp = 0` → `hasUnsavedChanges = false`
- **After Change**: `lastChangeTimestamp` updated to current time → `hasUnsavedChanges = true`
- **After Export**: `lastExportTimestamp` updated to current time → `hasUnsavedChanges = false`

---

### SharingMethod

Enumeration of available sharing methods.

**Values**:
- `"file"`: File download (existing functionality)
- `"url"`: URL-based sharing (data: URL)
- `"clipboard"`: Copy to clipboard

**Usage**: Used to specify which sharing method user selected

---

### ShareStateResult

Result of a sharing operation.

**Fields**:
- `method` (SharingMethod, required): Method used for sharing
- `success` (boolean, required): Whether sharing succeeded
- `data` (string | Blob | null, optional): Shared data (URL string for URL method, Blob for file, null for clipboard)
- `error` (string | null, optional): Error message if sharing failed
- `timestamp` (number, required): Unix timestamp when sharing occurred

**Relationships**: Returned by sharing functions

**Validation Rules**:
- If `success = true`, `error` must be null
- If `success = false`, `error` must be non-empty string
- `data` format depends on `method`:
  - `method = "url"`: `data` is string (data: URL)
  - `method = "file"`: `data` is Blob
  - `method = "clipboard"`: `data` is null (already copied)

---

### SyncMetadata

Metadata for cross-browser/tab synchronization.

**Fields**:
- `lastSyncTimestamp` (number, required): Unix timestamp of last successful sync
- `syncId` (string, required): Unique identifier for this sync session (UUID)
- `version` (string, required): Application state version (e.g., "1.0.0")
- `checksum` (string, optional): Hash of state for conflict detection (future enhancement)

**Relationships**: Stored alongside ApplicationState in localStorage

**Validation Rules**:
- `lastSyncTimestamp` must be valid timestamp
- `syncId` must be valid UUID format
- `version` must match ApplicationState version format

**State Transitions**:
- **On State Change**: `lastSyncTimestamp` updated, `syncId` regenerated
- **On Sync**: `lastSyncTimestamp` updated from remote, `syncId` updated if conflict detected

---

### ImportGuidanceState

Tracks whether user needs import guidance displayed.

**Fields**:
- `hasImportedData` (boolean, required): Whether user has successfully imported data at least once
- `lastGuidanceShown` (number, optional): Unix timestamp when guidance was last shown
- `guidanceDismissed` (boolean, required): Whether user has dismissed the guidance

**Relationships**: Stored in localStorage

**Validation Rules**:
- `hasImportedData` defaults to `false` on first visit
- `guidanceDismissed` defaults to `false`
- If `hasImportedData = true`, guidance should not be shown

**State Transitions**:
- **On Successful Import**: `hasImportedData = true`, `guidanceDismissed = false`
- **On Guidance Dismissal**: `guidanceDismissed = true`, `lastGuidanceShown = current time`
- **On Data Purge**: `hasImportedData = false`, `guidanceDismissed = false` (reset)

---

### ApplicationState (Existing - Enhanced)

**Note**: ApplicationState already exists. This feature adds:
- Sync metadata (optional field)
- Export timestamp tracking (already has `exportedAt`, will be used for change tracking)

**Existing Fields** (from `src/models/ApplicationState.ts`):
- `version` (string, required)
- `exportedAt` (string, required): ISO 8601 timestamp
- `data` (ApplicationStateData, required)

**New Considerations**:
- `exportedAt` will be used to update `ChangeTracker.lastExportTimestamp`
- Future: Could add optional `syncMetadata` field for cross-browser sync

---

## Relationships

```
ChangeTracker (independent)
    └─> Tracks changes relative to ApplicationState.exportedAt

ApplicationState
    ├─> exportedAt used by ChangeTracker
    └─> (future) syncMetadata for cross-browser sync

ShareStateResult
    └─> Generated from ApplicationState export

ImportGuidanceState (independent)
    └─> Controls UI display based on ApplicationState presence
```

## Storage Strategy

- **ChangeTracker**: Stored in localStorage key `"changeTracker"`
- **SyncMetadata**: Stored in localStorage key `"syncMetadata"` (future)
- **ImportGuidanceState**: Stored in localStorage key `"importGuidanceState"`
- **ApplicationState**: Already stored via existing persistence layer

## Validation Rules Summary

1. **ChangeTracker**: Timestamps must be valid numbers, `lastChangeTimestamp >= lastExportTimestamp` after changes
2. **ShareStateResult**: Success/error must be consistent, data format must match method
3. **SyncMetadata**: All fields required, syncId must be UUID format
4. **ImportGuidanceState**: Boolean flags must be consistent (can't have `hasImportedData = true` and show guidance)

## Migration Considerations

- **Existing Users**: On first load with new code, initialize `ChangeTracker` with `lastExportTimestamp = 0`, `lastChangeTimestamp = 0`
- **Import Guidance**: Existing users who have data should have `hasImportedData = true` set automatically
- **Backward Compatibility**: All new entities are optional/additive - existing functionality continues to work
