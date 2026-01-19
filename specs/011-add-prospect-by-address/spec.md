# Feature Specification: Add Prospect by Address

**Feature Branch**: `011-add-prospect-by-address`  
**Created**: 2026-01-18  
**Status**: Draft  
**Input**: User description: "From time to time Head Office will want to know who they should assign a new prospect to. Let's create a way for an REA to add a new prospect based on its address, and assign it to the appropriate EA using existing algorithms."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - REA Adds New Prospect with Address (Priority: P1)

A Regional Event Ambassador (REA) needs to add a new prospective event when Head Office asks who should be assigned to a new prospect. The REA enters the prospect's address, and the system automatically geocodes the location and suggests the most appropriate Event Ambassador (EA) based on existing allocation algorithms.

**Why this priority**: This is the core functionality - without this, the feature cannot deliver value. It enables REAs to quickly add prospects and get allocation recommendations.

**Independent Test**: Can be fully tested by an REA entering an address, verifying geocoding succeeds, and confirming allocation suggestions are generated. This delivers immediate value by providing allocation recommendations.

**Acceptance Scenarios**:

1. **Given** an REA is viewing the Ambassy application, **When** they click a button to add a new prospect, **Then** a dialog appears with fields for prospect name and address
2. **Given** an REA has opened the add prospect dialog, **When** they enter a valid address and prospect name, **Then** the system geocodes the address and displays allocation suggestions
3. **Given** geocoding has succeeded and allocation suggestions are displayed, **When** the REA selects a suggested EA, **Then** the prospect is created and assigned to that EA
4. **Given** a prospect has been created and assigned, **When** the REA views the prospects table, **Then** the new prospect appears in the list with the assigned EA
5. **Given** a prospect has been created, **When** the REA views the map, **Then** the prospect appears on the map with appropriate markers

---

### User Story 2 - Handle Geocoding Failures (Priority: P2)

When an address cannot be geocoded successfully, the system provides clear feedback and allows the REA to either retry with a different address or manually enter coordinates.

**Why this priority**: Geocoding failures are common in real-world usage. Handling them gracefully ensures the feature remains usable even when addresses are ambiguous or incomplete.

**Independent Test**: Can be tested by entering an invalid or ambiguous address and verifying the system handles the failure appropriately, allowing the user to continue.

**Acceptance Scenarios**:

1. **Given** an REA enters an address that cannot be geocoded, **When** geocoding fails, **Then** the system displays an error message with options to retry or enter coordinates manually
2. **Given** geocoding has failed, **When** the REA chooses to enter coordinates manually, **Then** the system accepts coordinate input and proceeds with allocation suggestions
3. **Given** geocoding has failed, **When** the REA chooses to retry with a different address, **Then** the dialog allows them to modify the address and attempt geocoding again

---

### User Story 3 - Manual EA Selection (Priority: P2)

Even when allocation suggestions are provided, REAs may need to override the suggestion and manually select a different EA based on their knowledge or Head Office requirements.

**Why this priority**: REAs have domain knowledge that algorithms may not capture. Allowing manual override ensures the feature supports real-world decision-making.

**Independent Test**: Can be tested by viewing allocation suggestions and then selecting a different EA from the full list of available EAs, verifying the prospect is assigned to the manually selected EA.

**Acceptance Scenarios**:

1. **Given** allocation suggestions are displayed, **When** the REA clicks "Other" or "Select Different EA", **Then** a dropdown or list appears showing all available EAs
2. **Given** the full EA list is displayed, **When** the REA selects an EA that was not in the suggestions, **Then** the prospect is created and assigned to the selected EA
3. **Given** a prospect has been assigned to a manually selected EA, **When** viewing the prospect details, **Then** the assigned EA is displayed correctly

---

### Edge Cases

- What happens when no EAs exist in the system? → System should display appropriate message and prevent prospect creation
- How does system handle addresses that geocode to locations outside all EA territories? → System should still provide suggestions based on nearest events and capacity
- What happens if all EAs are at maximum capacity? → System should still provide suggestions but include warnings about capacity limits
- How does system handle duplicate prospect names? → System should allow duplicates but may warn if a prospect with the same name already exists
- What happens if geocoding service is unavailable? → System should display error and allow manual coordinate entry
- How does system handle addresses that geocode to multiple possible locations? → System should use the first result or allow user to select from multiple options

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a way for REAs to initiate adding a new prospect (e.g., button or menu option)
- **FR-002**: System MUST display a dialog or form for entering prospect details including prospect name and address
- **FR-003**: System MUST geocode the entered address to obtain coordinates using existing geocoding infrastructure
- **FR-004**: System MUST use existing allocation algorithms (from suggestEventAllocation) to generate EA assignment suggestions based on the geocoded coordinates
- **FR-005**: System MUST display allocation suggestions showing top 3-5 recommended EAs with reasons (capacity, geographic proximity, etc.)
- **FR-006**: System MUST allow REA to select a suggested EA or choose "Other" to manually select from all available EAs
- **FR-007**: System MUST create a new ProspectiveEvent with the entered details, geocoded coordinates, and assigned EA
- **FR-008**: System MUST automatically assign the Regional Ambassador (REA) based on the selected EA's REA relationship
- **FR-009**: System MUST update the assigned EA's allocation count to include the new prospect
- **FR-010**: System MUST persist the new prospect to storage using existing prospect persistence mechanisms
- **FR-011**: System MUST display the new prospect in the Prospects table immediately after creation
- **FR-012**: System MUST display the new prospect on the map with appropriate markers
- **FR-013**: System MUST handle geocoding failures gracefully with clear error messages and options to retry or enter coordinates manually
- **FR-014**: System MUST allow manual coordinate entry when geocoding fails or when REA prefers manual entry
- **FR-015**: System MUST validate that at least one EA exists before allowing prospect creation
- **FR-016**: System MUST validate that prospect name is provided before creating the prospect
- **FR-017**: System MUST validate that either address geocoding succeeds or manual coordinates are provided before creating the prospect
- **FR-018**: System MUST log the prospect creation in the changes log with appropriate details (prospect name, assigned EA, REA who created it)

### Key Entities *(include if feature involves data)*

- **ProspectiveEvent**: Represents the new prospect being created. Key attributes: prospect name, address (for geocoding), coordinates (from geocoding), assigned EA, inherited REA, geocoding status, creation timestamp
- **EventAmbassador**: The EA to whom the prospect is assigned. Allocation count must be updated to include the new prospect
- **RegionalAmbassador**: The REA who creates the prospect and the REA who inherits it through the assigned EA's relationship
- **GeocodingResult**: Result of address geocoding including coordinates and status (success/failure)
- **AllocationSuggestion**: Suggested EA assignments generated by existing allocation algorithms, including reasons and warnings

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: REAs can add a new prospect with address in under 2 minutes from initiation to completion
- **SC-002**: Geocoding succeeds for at least 90% of valid addresses entered by REAs
- **SC-003**: Allocation suggestions are generated and displayed within 3 seconds of successful geocoding
- **SC-004**: 95% of prospects created through this feature are successfully assigned to an EA without requiring manual intervention beyond selection
- **SC-005**: New prospects appear in the Prospects table and map view immediately after creation (within 1 second)
- **SC-006**: REAs can successfully create prospects even when geocoding fails by using manual coordinate entry
- **SC-007**: All created prospects are correctly persisted and remain available across browser sessions
- **SC-008**: Prospect allocations correctly update EA allocation counts and are reflected in capacity calculations

## Assumptions

- REAs have access to prospect addresses from Head Office requests
- Existing geocoding infrastructure (Nominatim) will continue to be available and reliable
- Existing allocation algorithms (suggestEventAllocation) are appropriate for prospect assignment
- REAs have sufficient knowledge to validate allocation suggestions or select appropriate EAs manually
- Prospect name and address are the minimum required information to create a prospect
- Other prospect details (Event Director, status flags, dates) can be added or updated later through existing prospect editing functionality
- The feature integrates with existing Prospects tab and table display functionality
- Manual coordinate entry is acceptable fallback when geocoding fails

## Dependencies

- Existing ProspectiveEvent data model and persistence (from 007-prospective-events)
- Existing geocoding utilities (geocodeAddress from utils/geocoding)
- Existing allocation algorithms (suggestEventAllocation from actions/suggestEventAllocation)
- Existing prospect assignment and reallocation workflows
- Existing Prospects table and map display functionality
- Existing EA and REA data structures and relationships

## Out of Scope

- Bulk import of prospects (handled by 007-prospective-events CSV import)
- Editing prospect details after creation (handled by existing prospect editing functionality)
- Automatic prospect assignment without REA confirmation (REA must always confirm the assignment)
- Integration with external Head Office systems or APIs
- Prospect status tracking beyond basic creation (status flags can be updated through existing editing)
- Prospect deletion or removal workflows
