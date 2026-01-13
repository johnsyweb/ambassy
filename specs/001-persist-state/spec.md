# Feature Specification: State Persistence and Sharing

**Feature Branch**: `001-persist-state`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "Uploading all of the ambassdor and event information each time I hit https://johnsy.com/ambassy/ is a pain. Let's persist our state to local storage and make it easy to share that state with other ambassadors and parkrun staff."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic State Persistence (Priority: P1)

As a Regional Event Ambassador, I want my uploaded CSV data to persist across browser sessions so that I don't have to re-upload files every time I visit the application.

**Why this priority**: This is the core problem - users currently lose all data when they close their browser. This story delivers immediate value by eliminating the need to re-upload files on every visit.

**Independent Test**: Can be fully tested by uploading CSV files, closing the browser, reopening the application, and verifying all data is still present without re-uploading. This delivers the primary value of eliminating repetitive file uploads.

**Acceptance Scenarios**:

1. **Given** a user has uploaded Event Ambassadors, Event Teams, and Regional Ambassadors CSV files, **When** the user closes the browser and reopens the application, **Then** all uploaded data is automatically restored and displayed without requiring file re-upload
2. **Given** a user has made changes to event allocations (recorded in the changes log), **When** the user closes the browser and reopens the application, **Then** the changes log is preserved and displayed
3. **Given** a user has uploaded CSV files, **When** the user navigates away and returns to the application later, **Then** the application automatically loads the persisted data and displays the map and tables

---

### User Story 2 - Export State for Sharing (Priority: P2)

As a Regional Event Ambassador, I want to export my current state as a shareable file so that I can send it to other ambassadors or parkrun staff for review or collaboration.

**Why this priority**: Enables collaboration and data sharing, which is valuable for coordination between ambassadors and with parkrun staff. This story builds on P1 by adding sharing capability.

**Independent Test**: Can be fully tested by clicking an export button, downloading a file, and verifying the file contains all current state data in a format that can be shared. This delivers value by enabling data sharing without requiring recipients to have the original CSV files.

**Acceptance Scenarios**:

1. **Given** a user has uploaded all required CSV files and the application is displaying data, **When** the user clicks an export button, **Then** a file is downloaded containing all current state data (Event Ambassadors, Event Teams, Regional Ambassadors, and changes log)
2. **Given** a user has made changes to event allocations, **When** the user exports state, **Then** the exported file includes the complete changes log with all modifications
3. **Given** a user exports state, **When** the user opens the exported file, **Then** the file format is human-readable or clearly documented so recipients understand what data is included

---

### User Story 3 - Import Shared State (Priority: P3)

As a Regional Event Ambassador or parkrun staff member, I want to import a shared state file so that I can view or work with data shared by another ambassador without needing the original CSV files.

**Why this priority**: Completes the sharing workflow by allowing recipients to load shared data. This story enables full collaboration but depends on P2 being available first.

**Independent Test**: Can be fully tested by importing an exported state file and verifying all data (Event Ambassadors, Event Teams, Regional Ambassadors, changes log) is correctly loaded and displayed. This delivers value by enabling seamless data transfer between users.

**Acceptance Scenarios**:

1. **Given** a user has received a shared state file from another ambassador, **When** the user imports the file through the application interface, **Then** all data from the shared file is loaded and displayed (map, tables, changes log)
2. **Given** a user imports a shared state file, **When** the imported data replaces existing data, **Then** the user is notified that existing data will be replaced and can confirm or cancel the import
3. **Given** a user attempts to import an invalid or corrupted state file, **When** the import fails, **Then** the user receives a clear error message explaining what went wrong and the application retains its previous state

---

### Edge Cases

- What happens when localStorage is full or unavailable (e.g., private browsing mode)? The application should gracefully handle this and inform the user that persistence is not available, falling back to sessionStorage behaviour
- How does the system handle importing a state file that is missing required data (e.g., only Event Ambassadors but not Event Teams)? The application should validate completeness and either reject incomplete imports or clearly indicate what data is missing
- What happens when a user exports state, then makes changes, then imports an older exported file? The import should replace current state, and the user should be warned about data loss
- How does the system handle state files from different application versions? The application should validate file format compatibility and handle version mismatches gracefully
- What happens when multiple browser tabs are open with the same application? State changes in one tab should be reflected in other tabs, or users should be warned about potential conflicts

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automatically persist all uploaded CSV data (Event Ambassadors, Event Teams, Regional Ambassadors) to browser local storage when files are uploaded
- **FR-002**: System MUST automatically persist the changes log to browser local storage whenever changes are made
- **FR-003**: System MUST automatically restore persisted data from local storage when the application loads, if persisted data exists
- **FR-004**: System MUST provide an export function that generates a file containing all current state data (Event Ambassadors, Event Teams, Regional Ambassadors, changes log)
- **FR-005**: System MUST provide an import function that allows users to load state from an exported file
- **FR-006**: System MUST validate imported state files to ensure they contain required data and are in the correct format
- **FR-007**: System MUST notify users before replacing existing data during import, allowing them to confirm or cancel
- **FR-008**: System MUST handle local storage unavailability gracefully (e.g., private browsing mode) by informing users and falling back to session-only storage
- **FR-009**: System MUST preserve data integrity - exported and imported state must contain identical data to the original state
- **FR-010**: System MUST provide clear error messages when import fails due to invalid file format, missing data, or corruption

### Key Entities *(include if feature involves data)*

- **Application State**: Represents the complete current state of the application, including Event Ambassadors mapping, Event Teams mapping, Regional Ambassadors mapping, and changes log entries
- **Exported State File**: A file format containing serialised application state that can be shared between users and imported back into the application
- **Local Storage**: Browser storage mechanism that persists data across browser sessions until explicitly cleared

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can return to the application after closing their browser and see all previously uploaded data without re-uploading files (100% of persisted data restored)
- **SC-002**: Users can export their complete state in under 5 seconds from clicking export to file download completion
- **SC-003**: Users can import a shared state file and have all data loaded and displayed in under 10 seconds from file selection to map/table display
- **SC-004**: 95% of users successfully export and share state files without encountering errors
- **SC-005**: Import validation successfully rejects invalid files 100% of the time, preventing data corruption
- **SC-006**: State persistence reduces the time to resume work from 2-5 minutes (re-uploading files) to under 10 seconds (automatic restoration)

## Assumptions

- Users have modern browsers that support localStorage API
- Exported state files will be shared via email, file sharing services, or direct file transfer (not through a server)
- State files may be shared between different browsers and devices
- Users may want to maintain separate state files for different regions or time periods
- The current CSV file format and data structure will remain stable for exported/imported state
- Users understand that exported state files contain the same data as their uploaded CSV files, just in a different format

## Dependencies

- Existing CSV upload functionality must continue to work
- Existing data models (EventAmbassador, EventTeam, RegionalAmbassador, LogEntry) must remain compatible
- Existing UI components (map, tables, upload interface) must work with persisted data

## Out of Scope

- Server-side storage or synchronisation
- Multi-user real-time collaboration
- Version control or history tracking of state changes
- Automatic backup to cloud services
- Encryption or password protection of exported files
- Merging multiple state files (import replaces, does not merge)
