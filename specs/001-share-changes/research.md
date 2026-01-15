# Research: Share Changes with Ambassadors

**Feature**: Share Changes with Ambassadors  
**Date**: 2026-01-14  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. Multiple Sharing Methods

**Question**: How to implement file download, URL-based sharing, and copy-paste functionality for state export?

**Decision**: Use browser-native APIs for each method:
- **File Download**: Continue using existing `Blob` + `URL.createObjectURL()` approach (already implemented)
- **URL-based Sharing**: Use `data:` URLs with Base64 encoding for small states (<2MB), with fallback to file download for larger states
- **Copy-paste**: Use Clipboard API (`navigator.clipboard.writeText()`) to copy JSON string directly to clipboard

**Rationale**: 
- Browser-native APIs are well-supported, accessible, and require no external dependencies
- `data:` URLs work well for sharing via messaging/email and can be opened directly in browser
- Clipboard API provides seamless copy-paste experience
- File download remains the most reliable method for larger states

**Alternatives Considered**:
- **Cloud storage integration** (Google Drive, Dropbox): Adds complexity and requires OAuth, not needed for current use case
- **QR code generation**: Could be useful but adds dependency, can be added later if needed
- **Email integration**: Browser `mailto:` links are unreliable, file attachment via email client is better handled by user

**Implementation Notes**:
- URL length limits: Most browsers support URLs up to 2MB, but some email clients truncate at 65KB. For states >1MB, recommend file download.
- Clipboard API requires HTTPS or localhost (secure context). Fallback to legacy `document.execCommand('copy')` for older browsers.
- Base64 encoding increases size by ~33%, so effective limit is ~1.5MB for URL sharing.

---

### 2. Cross-Browser State Synchronization

**Question**: How to synchronize state across multiple browsers for the same user?

**Decision**: Use localStorage with a sync service pattern:
- **Primary Storage**: Continue using localStorage (existing)
- **Sync Mechanism**: Implement a lightweight sync service using localStorage change detection and cross-tab communication via `storage` event
- **Conflict Resolution**: Last-write-wins with timestamp-based conflict detection
- **Offline Support**: Queue sync operations when offline, sync when connectivity restored

**Rationale**:
- localStorage is already in use and works well for current state size
- `storage` event allows cross-tab communication within same browser
- For cross-browser sync (Chrome ↔ Firefox), we need a shared storage mechanism
- IndexedDB could be used but adds complexity; localStorage is sufficient for current scale
- **Note**: True cross-browser sync (different browsers) requires a backend service, which is out of scope. This feature focuses on same-browser, different-tab sync, with clear messaging that cross-browser sync requires manual export/import.

**Alternatives Considered**:
- **IndexedDB**: More powerful but adds complexity; localStorage is sufficient for current state sizes
- **Backend sync service**: Would enable true cross-browser sync but requires infrastructure and authentication
- **WebRTC peer-to-peer**: Overkill for this use case, adds significant complexity
- **Service Worker + Background Sync**: Good for offline queuing but adds complexity; localStorage + storage event is simpler

**Implementation Notes**:
- `storage` event only fires in other tabs/windows, not the current one
- Need to track "last sync timestamp" to detect conflicts
- For cross-browser scenarios (Chrome ↔ Firefox), provide clear UI messaging that manual export/import is required
- Consider future enhancement: optional cloud sync service for true cross-browser support

---

### 3. Change Tracking for Export Reminders

**Question**: How to detect when user has unsaved changes and trigger export reminder before window close?

**Decision**: Implement change tracking system:
- **Change Detection**: Track "last export timestamp" and compare with "last change timestamp"
- **Change Events**: Hook into existing state mutation functions (onboard, offboard, reallocate, etc.) to update change timestamp
- **Reminder Trigger**: Use `beforeunload` event to show browser's native confirmation dialog when unsaved changes detected
- **Change State**: Store change tracking metadata in localStorage alongside application state

**Rationale**:
- `beforeunload` event is the standard way to warn users before leaving a page
- Browser's native dialog is accessible and familiar to users
- Tracking timestamps is lightweight and doesn't require complex diff algorithms
- Can be extended later to show more detailed change summaries if needed

**Alternatives Considered**:
- **Deep diff algorithms**: Too complex and performance-intensive for this use case
- **Custom modal dialogs**: Less accessible than browser's native dialog, requires more code
- **Auto-save on every change**: Would eliminate need for reminders but changes user workflow significantly
- **Change count tracking**: Simpler than timestamps but less informative; timestamps provide better UX

**Implementation Notes**:
- `beforeunload` event has limitations: custom messages are ignored by modern browsers for security reasons
- Must set `event.returnValue` to trigger browser's native dialog
- Change tracking should be lightweight - just update a timestamp, not store full change history
- Consider showing a visual indicator (e.g., "Unsaved changes" badge) in addition to beforeunload reminder

---

### 4. User-Friendly Import Experience

**Question**: How to make the import process accessible and clear for less technical users?

**Decision**: Implement progressive disclosure with clear visual guidance:
- **Empty State UI**: Show prominent, friendly guidance when no data is loaded
- **Step-by-step Instructions**: Visual guide with numbered steps and icons
- **Error Messages**: Plain language error messages with actionable next steps
- **Success Feedback**: Clear confirmation with summary of what was imported
- **Multiple Import Methods**: Support drag-and-drop in addition to file picker

**Rationale**:
- Progressive disclosure reduces cognitive load - show guidance when needed, hide when not
- Visual instructions (icons, numbered steps) are more accessible than text-only
- Plain language errors reduce frustration and support burden
- Drag-and-drop is more intuitive for many users than file picker
- Success feedback builds confidence and confirms the action worked

**Alternatives Considered**:
- **Wizard-style multi-step dialog**: Too complex for a simple import operation
- **Video tutorials**: Helpful but requires external hosting and maintenance
- **Tooltips only**: Not discoverable enough for less technical users
- **Auto-detect shared files**: Would require file system access or drag-and-drop, which we're already supporting

**Implementation Notes**:
- Use ARIA labels and roles for accessibility
- Ensure all instructions are keyboard accessible
- Test with screen readers
- Use Australian English for all user-facing text
- Consider adding a "Skip this step" option for experienced users

---

## Technology Choices Summary

| Technology | Choice | Rationale |
|------------|--------|-----------|
| File Download | Blob + URL.createObjectURL | Existing, reliable, well-supported |
| URL Sharing | data: URLs with Base64 | Native, no dependencies, works in messaging apps |
| Copy-paste | Clipboard API | Native, accessible, modern browsers |
| Cross-browser Sync | localStorage + storage event | Simple, works for same-browser tabs; manual export/import for cross-browser |
| Change Tracking | Timestamp comparison | Lightweight, sufficient for reminder needs |
| Export Reminder | beforeunload event | Standard, accessible, browser-native |
| Import UI | Progressive disclosure + visual guides | Accessible, reduces cognitive load |

## Dependencies

**No new external dependencies required** - all functionality uses browser-native APIs:
- Clipboard API (navigator.clipboard)
- URL API (URL.createObjectURL, data: URLs)
- Storage API (localStorage, storage event)
- DOM Events (beforeunload, drag-and-drop)

## Open Questions Resolved

1. ✅ **Sharing methods**: All three methods (file, URL, copy-paste) will be implemented
2. ✅ **Cross-browser sync**: Focus on same-browser tab sync; cross-browser requires manual export/import (clearly communicated in UI)
3. ✅ **Change tracking**: Timestamp-based approach is sufficient
4. ✅ **Import UI**: Progressive disclosure with visual guidance is the right approach

## Future Enhancements (Out of Scope)

- Cloud-based sync service for true cross-browser synchronization
- QR code generation for easy mobile sharing
- Change history/diff viewing
- Auto-save functionality
- Collaborative editing (real-time sync)
