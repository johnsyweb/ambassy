# Prospective Events Feature Specification

## Overview

Implement a feature to import and manage "Prospective Events" (also called "Prospects") - potential future parkrun events that ambassadors can track and plan for.

## Requirements

### Functional Requirements

1. **Import CSV File**
   - Allow users to import a CSV file containing prospective events
   - CSV format: `Prospect Event,Country,State,Prospect ED/s,EA,Date Made Contact,Course Found,Landowner Permission,Funding Confirmed,Edit`
   - Parse prospect event details including status flags and contact information
   - Handle various data types (dates, booleans, text)

2. **Data Processing**
   - Extract prospective event information from CSV
   - Attempt to geocode coordinates using available location information (Country, State)
   - Match EA names against existing ambassadors (handle names without spaces)
   - Validate and process status fields (Course Found, Landowner Permission, Funding Confirmed)

3. **Issue Resolution**
   - Identify prospective events that cannot be fully processed
   - Handle geocoding failures for location resolution
   - If EA cannot be found, allow user to allocate using existing Event Team allocation method
   - Provide manual editing capabilities for prospect details

4. **UI Integration**
   - Add import button/functionality to the main interface
   - Display prospective events in tabular format with status indicators
   - Show resolution status and allow user intervention
   - Provide editing capabilities for prospect details

### Technical Requirements

1. **Data Model**
   - New `ProspectiveEvent` entity with comprehensive prospect tracking
   - Link to existing EA structures
   - Store geocoding status, coordinates, and prospect-specific metadata

2. **CSV Parsing**
   - Handle complex CSV structure with multiple data types
   - Validate data integrity and required fields
   - Parse dates, booleans, and text fields appropriately
   - Provide meaningful error messages for malformed data

3. **Geocoding Integration**
   - Reuse existing geocoding infrastructure
   - Use Country/State information for location resolution
   - Handle partial information gracefully
   - Cache geocoding results

4. **Ambassador Matching**
   - Fuzzy matching for EA names without spaces
   - Validate EA relationships
   - Handle unmatched EAs through allocation workflow

## Sample Data

```
Prospect Event,Country,State,Prospect ED/s,EA,Date Made Contact,Course Found,Landowner Permission,Funding Confirmed,Edit
Botanical Gardens,Australia,VIC,John Smith,Jane Doe,2024-01-15,true,false,true,
City Park,Australia,NSW,Mary Johnson,John Smith,2024-02-01,false,true,false,
Lake Reserve,Australia,QLD,Robert Brown,Sarah Wilson,2024-01-20,true,true,true,
```

## Acceptance Criteria

- [ ] Can import prospective events CSV file with correct column structure
- [ ] Prospect event details parsed and stored correctly
- [ ] Status fields (Course Found, Landowner Permission, Funding Confirmed) processed appropriately
- [ ] EA names matched against existing ambassadors with fuzzy matching
- [ ] Geocoding attempted using Country/State information
- [ ] Unresolvable issues presented to user for manual resolution
- [ ] Integration with existing Event Team allocation workflow
- [ ] Data persisted across sessions with proper validation