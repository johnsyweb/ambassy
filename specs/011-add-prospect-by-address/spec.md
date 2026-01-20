# Feature Specification: Add Prospect by Address

**Feature Branch**: `011-add-prospect-by-address`  
**Created**: 2026-01-18  
**Status**: Clarified  
**Input**: User description: "From time to time Head Office will want to know who they should assign a new prospect to. Let's create a way for an REA to add a new prospect based on its address, and assign it to the appropriate EA using existing algorithms."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - REA Adds New Prospect with Address (Priority: P1)

A Regional Event Ambassador (REA) needs to add a new prospective event when Head Office asks who should be assigned to a new prospect. The REA enters the prospect's address, and the system automatically geocodes the location and suggests the most appropriate Event Ambassador (EA) based on existing allocation algorithms.

**Why this priority**: This is the core functionality - without this, the feature cannot deliver value. It enables REAs to quickly add prospects and get allocation recommendations.

**Independent Test**: Can be fully tested by an REA entering an address, verifying geocoding succeeds, and confirming allocation suggestions are generated. This delivers immediate value by providing allocation recommendations.

**Acceptance Scenarios**:

1. **Given** an REA is viewing the Ambassy application, **When** they click the "Add Prospect" button in the main toolbar, **Then** a dialog appears with required fields (prospect name, address, state) and optional fields (Event Director, date made contact, status flags)
2. **Given** an REA has opened the add prospect dialog, **When** they enter a prospect name, address (any level of detail), and state, **Then** the system automatically triggers geocoding, displays a loading indicator, geocodes the address, infers country from coordinates, and displays allocation suggestions
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
- What happens when user changes address after geocoding completes? → System should automatically re-geocode and update allocation suggestions to reflect the new address
- How does system handle addresses with minimal detail (e.g., only city name)? → System accepts any level of address detail and attempts geocoding; if geocoding fails, user can enter coordinates manually
- What happens if country cannot be inferred from coordinates? → System should use default/unknown country code (0) and allow prospect creation to proceed

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an "Add Prospect" button in the main toolbar alongside "Add Event Ambassador" and "Add Regional Ambassador" buttons
- **FR-002**: System MUST display a dialog or form for entering prospect details including required fields (prospect name, address (accepts any level of detail), and state) and optional fields (Event Director, date made contact, course found, landowner permission, funding confirmed)
- **FR-003**: System MUST geocode the entered address to obtain coordinates using existing geocoding infrastructure (accepts any level of address detail from full street address to city/state/country)
- **FR-003b**: System MUST trigger geocoding automatically when both address and state fields are filled (on field blur or after short delay)
- **FR-003c**: System MUST re-geocode automatically when address field changes after initial geocoding (update allocation suggestions dynamically)
- **FR-003d**: System MUST display a loading indicator with clear message (e.g., "Geocoding address...") during geocoding and disable form submission until geocoding completes
- **FR-003a**: System MUST automatically infer country from geocoded coordinates using existing `getCountryCodeFromCoordinate` function
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
- **FR-017**: System MUST validate that state is provided before creating the prospect
- **FR-018**: System MUST validate that either address geocoding succeeds or manual coordinates are provided before creating the prospect
- **FR-019**: System MUST log the prospect creation in the changes log with appropriate details (prospect name, assigned EA, REA who created it)

### Key Entities *(include if feature involves data)*

- **ProspectiveEvent**: Represents the new prospect being created. Key attributes: prospect name (required), address (required, for geocoding, accepts any level of detail), state (required, user-entered), country (inferred from coordinates), coordinates (from geocoding), assigned EA, inherited REA, geocoding status, creation timestamp. Optional attributes that can be provided at creation: prospectEDs (Event Director), dateMadeContact, courseFound, landownerPermission, fundingConfirmed
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

- REAs have access to prospect addresses from Head Office requests (addresses may be at any level of detail - from full street addresses to city/state/country)
- Existing geocoding infrastructure (Nominatim) will continue to be available and reliable
- Existing allocation algorithms (suggestEventAllocation) are appropriate for prospect assignment
- REAs have sufficient knowledge to validate allocation suggestions or select appropriate EAs manually
- REAs know the state/region for prospects they are adding
- Prospect name, address (any level of detail), and state are the minimum required information to create a prospect
- Country can be reliably inferred from geocoded coordinates using existing `getCountryCodeFromCoordinate` function
- REAs may optionally provide additional prospect details (Event Director, status flags, dates) at creation time through the dialog, but these are not required and can be added or updated later through existing prospect editing functionality
- The feature integrates with existing Prospects tab and table display functionality
- Manual coordinate entry is acceptable fallback when geocoding fails

## Dependencies

- Existing ProspectiveEvent data model and persistence (from 007-prospective-events)
- Existing geocoding utilities (geocodeAddress from utils/geocoding)
- Existing country inference utilities (getCountryCodeFromCoordinate from models/country)
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

## Clarifications

### Session 2026-01-18

- **Q1: Country and State Collection** → **Answer: B** - Infer country from geocoded coordinates using existing `getCountryCodeFromCoordinate` function, ask user to enter state. Country will be automatically determined from coordinates after geocoding succeeds. State must be entered by the REA as it cannot be reliably inferred from coordinates alone.

- **Q2: Button Location** → **Answer: B** - Place "Add Prospect" button in the main toolbar alongside "Add Event Ambassador" and "Add Regional Ambassador" buttons. This ensures maximum discoverability and consistency with other "Add" actions in the application.

- **Q3: Address Detail Level** → **Answer: C** - System accepts any level of address detail that REAs provide. The geocoding service (Nominatim) will attempt to geocode whatever address information is provided, whether it's a full street address, city/state/country, or any other format. This provides maximum flexibility for REAs who may receive varying levels of address detail from Head Office.

- **Q4: Default Values for Optional ProspectiveEvent Fields** → **Answer: C** - Dialog prompts user to optionally fill in additional fields (Event Director, status flags, dates) before creating the prospect. These fields are optional but can be provided at creation time rather than requiring later editing.

- **Q5: Loading State During Geocoding** → **Answer: A** - Show loading indicator with clear message (e.g., "Geocoding address...") and disable form submission until geocoding completes. This provides clear feedback to users and prevents duplicate geocoding requests.

- **Q6: Geocoding Trigger Timing** → **Answer: B** - Trigger geocoding automatically when address and state fields are both filled (on blur or after short delay). This provides immediate feedback without requiring an extra button click, improving user experience.

- **Q7: Re-geocoding When Address Changes** → **Answer: A** - Re-geocode automatically when address field changes after initial geocoding. This keeps allocation suggestions current and avoids stale data, ensuring suggestions always reflect the most recent address entered.
