# Data Model: State Persistence and Sharing

**Feature**: State Persistence and Sharing  
**Date**: 2026-01-07  
**Phase**: 1 - Design & Contracts

## Entities

### ApplicationState

Represents the complete state of the Ambassy application that can be persisted and shared.

**Fields**:
- `version` (string, required): Format version for compatibility checking (e.g., "1.0.0")
- `exportedAt` (string, required): ISO 8601 timestamp of when state was exported
- `data` (ApplicationStateData, required): The actual application data

**Relationships**: Contains all other entities

**Validation Rules**:
- `version` must match current supported version format
- `exportedAt` must be valid ISO 8601 timestamp
- `data` must contain all required fields (eventAmbassadors, eventTeams, regionalAmbassadors, changesLog)

### ApplicationStateData

Container for all application data entities.

**Fields**:
- `eventAmbassadors` (Array<[string, EventAmbassador]>, required): Array of [key, value] tuples representing EventAmbassadorMap
- `eventTeams` (Array<[string, EventTeam]>, required): Array of [key, value] tuples representing EventTeamMap
- `regionalAmbassadors` (Array<[string, RegionalAmbassador]>, required): Array of [key, value] tuples representing RegionalAmbassadorMap
- `changesLog` (LogEntry[], required): Array of change log entries

**Relationships**: Contains EventAmbassador, EventTeam, RegionalAmbassador, and LogEntry entities

**Validation Rules**:
- All arrays must be present (can be empty arrays)
- eventAmbassadors, eventTeams, regionalAmbassadors must be arrays of tuples
- changesLog must be array of LogEntry objects

### EventAmbassador (Existing)

**Fields**:
- `name` (string, required): Event Ambassador name
- `events` (string[], required): Array of event names this ambassador supports

**Validation Rules**:
- `name` must be non-empty string
- `events` must be array (can be empty)

### EventTeam (Existing)

**Fields**:
- `eventShortName` (string, required): Short name identifier for the event
- `eventAmbassador` (string, required): Name of the Event Ambassador supporting this team
- `eventDirectors` (string[], required): Array of Event Director names

**Validation Rules**:
- `eventShortName` must be non-empty string
- `eventAmbassador` must be non-empty string
- `eventDirectors` must be array (can be empty)

### RegionalAmbassador (Existing)

**Fields**:
- `name` (string, required): Regional Ambassador name
- `state` (string, required): Australian state or region
- `supportsEAs` (string[], required): Array of Event Ambassador names this REA supports

**Validation Rules**:
- `name` must be non-empty string
- `state` must be non-empty string
- `supportsEAs` must be array (can be empty)

### LogEntry (Existing)

**Fields**:
- `type` (string, required): Type of change (e.g., "EA Change")
- `event` (string, required): Event name affected
- `oldValue` (string, required): Previous value
- `newValue` (string, required): New value
- `timestamp` (number, required): Unix timestamp in milliseconds

**Validation Rules**:
- `type` must be non-empty string
- `event` must be non-empty string
- `timestamp` must be positive number

## State Transitions

### Persistence Flow

1. **Upload CSV** → Parse and validate → Store in localStorage → Update UI
2. **Make Change** → Update data model → Persist to localStorage → Update UI
3. **Page Load** → Check localStorage → Restore data → Update UI

### Export Flow

1. **User clicks Export** → Collect all state from localStorage → Validate completeness → Serialize to JSON → Create Blob → Trigger download

### Import Flow

1. **User selects file** → Read file → Parse JSON → Validate structure → Validate data → Confirm replacement → Store in localStorage → Update UI

## Storage Schema

### localStorage Keys

- `ambassy:eventAmbassadors`: JSON string of Array<[string, EventAmbassador]>
- `ambassy:eventTeams`: JSON string of Array<[string, EventTeam]>
- `ambassy:regionalAmbassadors`: JSON string of Array<[string, RegionalAmbassador]>
- `ambassy:changesLog`: JSON string of LogEntry[]
- `ambassy:version`: String version identifier (e.g., "1.0.0")

### Serialization Format

**Map Serialization**: Maps are serialized as arrays of [key, value] tuples to preserve key-value relationships:
```typescript
// Map<string, EventAmbassador> becomes:
[["key1", {name: "...", events: [...]}], ["key2", {...}]]
```

**Deserialization**: Arrays are converted back to Maps:
```typescript
// Array becomes Map<string, EventAmbassador>
new Map<string, EventAmbassador>(arrayOfTuples)
```

## Validation Rules Summary

### Import Validation

1. **File Format**: Must be valid JSON
2. **Structure**: Must have `version`, `exportedAt`, and `data` fields
3. **Version**: Must match supported version (currently "1.0.0")
4. **Data Completeness**: Must have all required data arrays (can be empty)
5. **Data Types**: Each entity must match expected interface
6. **Required Fields**: All required fields in entities must be present and non-empty where specified

### Persistence Validation

1. **Storage Availability**: Check localStorage availability before writing
2. **Data Integrity**: Validate data before storing
3. **Quota**: Handle quota exceeded errors gracefully

## Error States

### Invalid Import File

- **Cause**: Malformed JSON, missing fields, wrong version, invalid data types
- **Handling**: Show error message, retain existing state, allow user to try again

### Storage Unavailable

- **Cause**: Private browsing mode, quota exceeded, disabled storage
- **Handling**: Fall back to sessionStorage, inform user of limitation

### Corrupted Storage

- **Cause**: Invalid JSON in localStorage, missing keys, type mismatches
- **Handling**: Attempt recovery, reset to empty state if recovery fails, inform user

