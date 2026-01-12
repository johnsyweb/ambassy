# API Contracts: Prospective Events

## Overview

Contracts for importing, processing, and managing prospective events with hierarchical ambassador relationships.

## Core Functions

### CSV Import & Parsing

#### `parseProspectiveEventsCSV(content: string): ProspectiveEvent[]`
**Purpose**: Parse CSV content into prospective event objects with comprehensive prospect tracking data.

**Input**:
```typescript
content: string // Raw CSV content with format: Prospect Event,Country,State,Prospect ED/s,EA,Date Made Contact,Course Found,Landowner Permission,Funding Confirmed,Edit
```

**Output**:
```typescript
ProspectiveEvent[]
```

**Behavior**:
- Parses prospect event details including all status flags and metadata
- Handles various data types (dates, booleans, text)
- Generates unique IDs for each prospective event
- Sets initial status to 'pending' for geocoding and matching
- Validates CSV structure and provides detailed error information

**Error Handling**:
- Throws `CSVParseError` for malformed CSV structure
- Throws `ValidationError` for missing required columns or invalid data types
- Throws `DateParseError` for invalid date formats

#### `importProspectiveEvents(file: File): Promise<ImportResult>`
**Purpose**: High-level import function handling file upload through complete processing pipeline.

**Input**:
```typescript
file: File // CSV file uploaded by user
```

**Output**:
```typescript
interface ImportResult {
  success: boolean;
  events: ProspectiveEvent[];
  errors: string[];
  warnings: string[];
}
```

**Behavior**:
- Reads file content
- Parses CSV
- Attempts geocoding for events with sufficient location data
- Matches ambassadors against existing data
- Returns comprehensive result with success/failure details

### Ambassador Matching

#### `matchProspectiveEventAmbassadors(events: ProspectiveEvent[], existingEAs: EventAmbassadorMap): MatchResult`
**Purpose**: Match prospective event ambassador names against existing Event Ambassador data.

**Input**:
```typescript
events: ProspectiveEvent[]
existingEAs: EventAmbassadorMap
```

**Output**:
```typescript
interface MatchResult {
  matched: ProspectiveEvent[];
  unmatched: ProspectiveEvent[];
  ambiguous: Array<{event: ProspectiveEvent, candidates: string[]}>;
}
```

**Behavior**:
- Attempts fuzzy matching for EA names without spaces
- Validates EA existence in existing ambassador data
- Returns categorized results for user resolution

**Matching Algorithm**:
1. Exact match attempt (case-insensitive)
2. Fuzzy match with Levenshtein distance ≤ 2
3. Space normalization (remove spaces for comparison)
4. Prefix/suffix matching for common name variations

### Geocoding

#### `geocodeProspectiveEvents(events: ProspectiveEvent[]): Promise<GeocodeResult>`
**Purpose**: Attempt to resolve coordinates for prospective events using available location data.

**Input**:
```typescript
events: ProspectiveEvent[]
```

**Output**:
```typescript
interface GeocodeResult {
  geocoded: ProspectiveEvent[];
  failed: ProspectiveEvent[];
  ambiguous: Array<{event: ProspectiveEvent, suggestions: GeocodeSuggestion[]}>;
}

interface GeocodeSuggestion {
  address: string;
  coordinates: [number, number];
  confidence: number;
}
```

**Behavior**:
- Uses state/region information for geocoding
- Falls back to RA/EA location hints
- Provides multiple suggestions for ambiguous results
- Updates event status accordingly

### Data Management

#### `saveProspectiveEvents(events: ProspectiveEvent[]): Promise<void>`
**Purpose**: Persist prospective events to localStorage with proper relationships.

**Input**:
```typescript
events: ProspectiveEvent[]
```

**Output**:
```typescript
Promise<void>
```

**Behavior**:
- Serializes prospective events
- Updates existing RA/EA records with prospective event references
- Maintains data consistency across all related structures

#### `loadProspectiveEvents(): Promise<ProspectiveEvent[]>`
**Purpose**: Load prospective events from storage with relationship resolution.

**Input**: None

**Output**:
```typescript
Promise<ProspectiveEvent[]>
```

**Behavior**:
- Deserializes stored prospective events
- Resolves ambassador relationships
- Validates data integrity
- Returns fully hydrated objects

## UI Contracts

### Import Dialog

#### `showProspectiveEventsImportDialog(): Promise<ImportResult>`
**Purpose**: Display file upload dialog and handle import workflow.

**Behavior**:
- Shows file picker for CSV files
- Displays progress during processing
- Shows results with success/error breakdown
- Provides options to review issues

### Resolution Dialog

#### `showProspectiveEventResolutionDialog(event: ProspectiveEvent, issues: string[]): Promise<ResolutionResult>`
**Purpose**: Handle resolution of issues with individual prospective events.

**Input**:
```typescript
event: ProspectiveEvent
issues: string[] // List of issues to resolve
```

**Output**:
```typescript
interface ResolutionResult {
  resolved: boolean;
  event: ProspectiveEvent;
  actions: ResolutionAction[];
}

interface ResolutionAction {
  type: 'geocoded' | 'ambassador_assigned' | 'skipped';
  details: string;
}
```

**Behavior**:
- Presents issues in clear, actionable format
- Integrates with existing geocoding and allocation workflows
- Allows partial resolution (some issues fixed, others deferred)

## Error Contracts

### Error Types

```typescript
class ProspectiveEventsError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly event?: ProspectiveEvent
  ) {
    super(message);
  }
}

class CSVParseError extends ProspectiveEventsError {
  constructor(message: string, public readonly row?: number) {
    super(message, 'CSV_PARSE_ERROR');
  }
}

class GeocodingError extends ProspectiveEventsError {
  constructor(message: string, event: ProspectiveEvent) {
    super(message, 'GEOCODING_ERROR', event);
  }
}

class AmbassadorMatchError extends ProspectiveEventsError {
  constructor(message: string, event: ProspectiveEvent) {
    super(message, 'AMBASSADOR_MATCH_ERROR', event);
  }
}
```

## Integration Contracts

### Issues System Extension

**Extends existing Issues system**:
- New issue type: `'prospective_event'`
- Resolution methods: `'geocode'`, `'assign_ambassador'`, `'skip'`
- Integration with existing Issues tab and resolution workflows

### Event Team Allocation Integration

**Reuses existing allocation workflow**:
- When EA cannot be matched, redirect to Event Team allocation
- Pre-populate allocation dialog with prospective event context
- Update prospective event status upon successful allocation