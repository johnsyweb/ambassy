# Research: State Persistence and Sharing

**Feature**: State Persistence and Sharing  
**Date**: 2026-01-07  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. Browser localStorage API Capabilities and Limitations

**Decision**: Use browser localStorage API for persistence with sessionStorage as fallback

**Rationale**: 
- localStorage is widely supported in modern browsers (IE8+, all modern browsers)
- Provides persistence across browser sessions (unlike sessionStorage)
- No additional dependencies required
- Storage limit typically 5-10MB per domain (sufficient for CSV data)
- Synchronous API is acceptable for this use case (data operations are not blocking)

**Alternatives Considered**:
- IndexedDB: More complex API, overkill for simple key-value storage needs
- WebSQL: Deprecated, not recommended
- Server-side storage: Out of scope per specification, adds complexity and infrastructure requirements

**Implementation Notes**:
- Use try-catch blocks to handle localStorage quota exceeded errors
- Detect private browsing mode (localStorage may throw errors) and fall back to sessionStorage
- Use consistent key naming convention: `ambassy:${dataType}` (e.g., `ambassy:eventAmbassadors`)

### 2. File Format for Export/Import

**Decision**: Use JSON file format for exported state files

**Rationale**:
- JSON is human-readable and can be inspected by users
- Native browser support (JSON.parse/JSON.stringify)
- No additional parsing libraries required
- Standard format that works across browsers and devices
- Can include metadata (version, timestamp) for validation

**Alternatives Considered**:
- CSV format: Would require re-parsing, loses structure of Maps and nested data
- Binary format: Not human-readable, requires custom parsing, unnecessary complexity
- Compressed JSON: Adds complexity, file size not a concern for typical data volumes

**File Structure**:
```json
{
  "version": "1.0.0",
  "exportedAt": "2026-01-07T12:00:00Z",
  "data": {
    "eventAmbassadors": [...],
    "eventTeams": [...],
    "regionalAmbassadors": [...],
    "changesLog": [...]
  }
}
```

### 3. Storage Key Naming Convention

**Decision**: Use prefixed keys: `ambassy:${dataType}`

**Rationale**:
- Prevents conflicts with other applications using same localStorage
- Makes it easy to identify and clear Ambassy-specific data
- Consistent with existing codebase patterns
- Allows for future namespacing if needed

**Key Names**:
- `ambassy:eventAmbassadors`
- `ambassy:eventTeams`
- `ambassy:regionalAmbassadors`
- `ambassy:changesLog`
- `ambassy:version` (for format versioning)

### 4. Error Handling Strategy

**Decision**: Graceful degradation with user notification

**Rationale**:
- Users should be informed when persistence is unavailable
- Application should continue to function (fallback to sessionStorage)
- Clear error messages help users understand limitations
- Prevents silent failures that confuse users

**Error Scenarios**:
1. localStorage quota exceeded: Warn user, continue with sessionStorage
2. Private browsing mode: Inform user persistence unavailable, use sessionStorage
3. Invalid import file: Show clear error message, retain existing state
4. Corrupted localStorage data: Attempt recovery, fallback to empty state

### 5. Multi-Tab Synchronisation

**Decision**: Use storage event API to detect changes across tabs

**Rationale**:
- Browser's storage event fires when localStorage changes in other tabs
- Allows UI updates when state changes in another tab
- Prevents data conflicts by showing latest state
- No complex synchronisation logic needed for single-user use case

**Implementation**:
- Listen for `storage` event on window
- Refresh UI when storage changes detected
- Show notification to user if changes detected from another tab

### 6. Data Migration Strategy

**Decision**: Migrate existing sessionStorage data to localStorage on first load

**Rationale**:
- Seamless transition for existing users
- No data loss during feature rollout
- One-time migration, then use localStorage going forward
- Backward compatible with existing code

**Migration Process**:
1. Check if localStorage has data (already migrated)
2. If not, check sessionStorage for existing data
3. Copy sessionStorage data to localStorage
4. Clear sessionStorage (optional, can keep for fallback)

### 7. Export/Import UI Placement

**Decision**: Add export/import buttons to existing upload section

**Rationale**:
- Logical grouping with data management functions
- Consistent with existing UI patterns
- Easy to discover alongside upload functionality
- Keyboard accessible (following constitution requirements)

**UI Elements**:
- Export button: "Export State" (downloads JSON file)
- Import button: "Import State" (opens file picker)
- Both buttons keyboard accessible (tab navigation, Enter/Space activation)

## Best Practices Identified

1. **Storage Operations**: Always wrap localStorage operations in try-catch blocks
2. **Data Validation**: Validate imported data structure before applying
3. **Versioning**: Include version in exported files for future compatibility
4. **User Feedback**: Provide clear success/error messages for export/import operations
5. **Performance**: Batch localStorage operations where possible to reduce overhead
6. **Testing**: Mock localStorage in tests to avoid test pollution

## Dependencies

- No new npm packages required
- Browser APIs used: localStorage, File API, Blob API, URL.createObjectURL
- Existing dependencies remain unchanged

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| localStorage quota exceeded | Medium | Detect and warn user, fallback to sessionStorage |
| Private browsing mode | Low | Detect and inform user, use sessionStorage |
| Corrupted localStorage data | Low | Validate on load, reset if corrupted |
| Import file format changes | Low | Version checking, clear error messages |
| Multi-tab conflicts | Low | Use storage events, show notifications |

## Conclusion

All research questions resolved. Implementation approach is straightforward using native browser APIs. No external dependencies required. Ready to proceed to Phase 1 design.

