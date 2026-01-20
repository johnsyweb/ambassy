# Implementation Plan: Add Prospect by Address

**Branch**: `011-add-prospect-by-address` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-add-prospect-by-address/spec.md`

## Summary

This feature enables Regional Event Ambassadors (REAs) to add new prospective events by entering an address. The system automatically geocodes the address, infers the country from coordinates, and uses existing allocation algorithms to suggest appropriate Event Ambassadors (EAs). REAs can select from suggestions or manually choose an EA, and the prospect is immediately created, persisted, and displayed in the Prospects table and map view.

**Technical Approach**: Extend existing dialog patterns (`showAddressDialog`, `showEventAllocationDialog`) to create a new `showAddProspectDialog` function. Leverage existing geocoding utilities (`geocodeAddress`), country inference (`getCountryCodeFromCoordinate`), and allocation algorithms (`suggestEventAllocation`). Integrate with existing prospect persistence and display mechanisms.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode enabled)  
**Primary Dependencies**: 
- Leaflet (map rendering)
- Nominatim (geocoding service via existing `geocodeAddress` utility)
- Existing allocation algorithms (`suggestEventAllocation` from `actions/suggestEventAllocation`)
- Existing prospect persistence (`persistProspectiveEvents`, `loadProspectiveEvents`)

**Storage**: Browser localStorage (via existing prospect persistence mechanisms)  
**Testing**: Jest with jsdom environment  
**Target Platform**: Modern web browsers (ES6+)  
**Project Type**: Single-page web application  
**Performance Goals**: 
- Geocoding completes within 3 seconds (SC-003)
- Allocation suggestions displayed within 3 seconds of geocoding (SC-003)
- Prospect appears in table/map within 1 second of creation (SC-005)
- Complete prospect creation workflow under 2 minutes (SC-001)

**Constraints**: 
- Must work offline (geocoding requires network, but manual coordinate entry provides fallback)
- Must handle geocoding failures gracefully (FR-013, FR-014)
- Must maintain keyboard accessibility (Constitution V)
- Must use Australian English for all text (Constitution V)

**Scale/Scope**: 
- Single-user application (no concurrent editing concerns)
- Typical usage: 1-10 prospects added per session
- No rate limiting concerns for single-user geocoding requests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality Gates (I)
- ✅ Code formatting: Prettier configured
- ✅ Linting: ESLint configured with zero-tolerance policy
- ✅ Type checking: TypeScript strict mode enabled
- ✅ Tests: Jest configured, TDD required
- ✅ Disused code: Must be removed immediately
- ✅ Commented-out code: Prohibited

### Test-Driven Development (II)
- ✅ Tests required for all production code
- ✅ Tests must test production code directly (no test environment checks)
- ✅ Low cyclomatic complexity required
- ✅ High test coverage required
- ✅ Tests must not pollute console

### Atomic Commits (III)
- ✅ Semantic commit messages required (Conventional Commits)
- ✅ Each commit must be atomic and complete

### Single Responsibility (IV)
- ✅ Each component must have single responsibility
- ✅ Code layout: models, actions, parsers, types, utils
- ✅ Comments avoided (prefer self-documenting code)
- ✅ Import path aliases mandatory (`@actions/*`, `@models/*`, etc.)

### Accessibility & UX (V)
- ✅ All user inputs keyboard accessible
- ✅ Clean, consistent, accessible, professional UI
- ✅ Australian English for user-facing text

### Open Source Preference (VI)
- ✅ Using existing open source libraries (Nominatim, Leaflet)
- ✅ No new dependencies required

### Documentation Currency (VII)
- ✅ README must remain up-to-date

### Production/Test Parity (VIII)
- ✅ Code behaves identically in production and test
- ✅ No environment-specific code branches

### Twelve-Factor App (IX)
- ✅ Configuration via environment variables (if needed)
- ✅ Stateless processes
- ✅ Disposability
- ✅ Development/production parity
- ✅ Logs as event streams

**Gate Status**: ✅ **PASS** - All constitution requirements satisfied. No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/011-add-prospect-by-address/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── actions/
│   ├── showAddProspectDialog.ts        # NEW: Main dialog function
│   ├── showAddProspectDialog.test.ts   # NEW: Tests for dialog
│   ├── createProspectFromAddress.ts    # NEW: Core prospect creation logic
│   ├── createProspectFromAddress.test.ts # NEW: Tests for creation logic
│   ├── suggestEventAllocation.ts       # EXISTING: Used for EA suggestions
│   ├── persistProspectiveEvents.ts     # EXISTING: Used for persistence
│   └── populateProspectsTable.ts       # EXISTING: Used for table refresh
├── models/
│   ├── ProspectiveEvent.ts             # EXISTING: Data model
│   └── ReallocationSuggestion.ts       # EXISTING: Used for suggestions
├── utils/
│   ├── geocoding.ts                    # EXISTING: Geocoding utilities
│   └── country.ts                      # EXISTING: Country inference
└── index.ts                            # MODIFIED: Add button handler

public/
└── index.html                           # MODIFIED: Add "Add Prospect" button
```

**Structure Decision**: Single-page web application structure. New functionality extends existing patterns:
- Dialog functions in `src/actions/` following `showAddressDialog`, `showEventAllocationDialog` patterns
- Core business logic in separate action files for testability
- Integration with existing prospect persistence and display mechanisms
- Button added to main toolbar in `public/index.html` alongside existing "Add" buttons

## Complexity Tracking

> **No violations detected - all constitution requirements satisfied**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

---

## Phase 0: Outline & Research

### Research Tasks

1. **Dialog Pattern Analysis**: Review existing dialog implementations (`showAddressDialog`, `showEventAllocationDialog`, `showReallocationDialog`) to understand:
   - DOM manipulation patterns
   - Event handling patterns
   - Accessibility patterns (ARIA attributes, keyboard navigation)
   - Loading state management
   - Error handling patterns

2. **Geocoding Integration**: Review existing `geocodeAddress` utility to understand:
   - Error handling patterns
   - Rate limiting considerations (Nominatim)
   - Coordinate format handling
   - Manual coordinate entry patterns

3. **Allocation Algorithm Integration**: Review `suggestEventAllocation` to understand:
   - Input requirements (event name vs coordinates)
   - Return format (`ReallocationSuggestion[]`)
   - How to adapt for prospect coordinates (prospect has no event name initially)

4. **Prospect Creation Pattern**: Review existing prospect creation/import patterns to understand:
   - ID generation (`generateProspectiveEventId`)
   - Default value handling
   - Validation requirements
   - Persistence flow

5. **UI Integration Patterns**: Review how existing dialogs integrate with:
   - Button setup in `index.ts`
   - Table refresh mechanisms
   - Map update mechanisms
   - Change tracking/logging

### Research Findings

✅ **Complete** - See [research.md](./research.md) for detailed findings.

**Key Decisions**:
1. Follow existing dialog patterns for consistency
2. Use existing geocoding utility with error handling
3. Create temporary EventDetails entry to reuse allocation algorithm
4. Follow existing prospect creation patterns (ID generation, validation)
5. Integrate with existing refresh and tracking mechanisms
6. Use existing country inference function
7. Implement automatic geocoding with debouncing
8. Implement automatic re-geocoding on address change

---

## Phase 1: Design & Contracts

✅ **Complete** - All design artifacts generated.

### Data Model

✅ **Complete** - See [data-model.md](./data-model.md)

**Key Entities**:
- `ProspectiveEvent` (existing, extended usage)
- Field population rules defined
- Validation rules documented
- State transitions documented

### API Contracts

✅ **Complete** - See [contracts/add-prospect-contracts.md](./contracts/add-prospect-contracts.md)

**Core Functions**:
- `showAddProspectDialog` - Main dialog function
- `createProspectFromAddress` - Core creation logic
- `generateProspectAllocationSuggestions` - EA suggestion generation
- `inferCountryFromCoordinates` - Country inference helper

### Quickstart Guide

✅ **Complete** - See [quickstart.md](./quickstart.md)

**Includes**:
- User flow overview
- Basic implementation examples
- Key integration points
- Error handling patterns
- Testing guidance
- Common patterns

---

## Phase 2: Implementation Tasks

*To be generated by `/speckit.tasks` command*
