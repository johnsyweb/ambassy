# Implementation Plan: Ambassador Capacity Management and Lifecycle

**Branch**: `001-ambassador-capacity-management` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ambassador-capacity-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature adds comprehensive ambassador lifecycle management to the Ambassy application, enabling onboarding and offboarding of Event Ambassadors and Regional Ambassadors with intelligent capacity checking and reallocation suggestions. The system will calculate capacity based on configurable limits, flag ambassadors who are under or over capacity, and provide reallocation suggestions that consider multiple allocation principles: capacity availability, regional alignment, geographic proximity, and conflict avoidance. Capacity limits are configurable and persist across sessions. 

**Critical Offboarding Requirements**: The offboarding process must ensure complete data integrity by validating that all allocations can be reallocated BEFORE allowing offboarding to start. Once offboarding completes, the system must automatically clean up all references: remove Event Ambassadors from Regional Ambassadors' supportsEAs lists, update Event Teams table references, remove visual representations from the map view, and ensure offboarded ambassadors only appear in the changes log. The implementation leverages existing data structures and geographic data while adding new models for capacity configuration and reallocation suggestions.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode enabled, ES6 target)

**Primary Dependencies**: 
- No new external dependencies required
- Uses existing leaflet (map visualization)
- Uses existing d3-geo-voronoi (geographic calculations)
- Uses existing localStorage API (persistence)
- May use haversine formula or similar for distance calculations (can implement directly or use lightweight library)

**Storage**: 
- Browser localStorage API (for capacity limit configuration)
- Existing application state persistence (for ambassador data)
- No database required (client-side only)

**Testing**: Jest 30.2.0 with ts-jest 29.4.5, jsdom environment

**Target Platform**: Modern web browsers (ES6+), client-side only application

**Project Type**: Single-page web application

**Performance Goals**: 
- Capacity checking completes in under 100ms for all ambassadors
- Reallocation suggestion generation completes in under 2 seconds for typical scenarios (up to 50 events, 20 ambassadors)
- Onboarding/offboarding operations complete in under 1 second
- UI updates reflect capacity status within 1 second of data changes

**Constraints**: 
- Must maintain existing data structures (EventAmbassador, RegionalAmbassador interfaces)
- Must work with existing geographic data (EventDetails with coordinates)
- Must integrate with existing changes log functionality
- Must preserve backward compatibility with existing CSV upload functionality
- Geographic calculations must handle missing or invalid coordinate data gracefully
- Region assignment may need manual input or derivation from existing data
- **Offboarding validation**: Must validate that all allocations can be reallocated before allowing offboarding to start
- **Complete cleanup**: Must automatically remove all references to offboarded ambassadors (REA's supportsEAs, Event Teams table, map view) except changes log
- **Data integrity**: Must prevent partial offboarding - all allocations must be reallocated before ambassador removal

**Scale/Scope**: 
- Typical usage: 20-50 Event Ambassadors, 5-10 Regional Ambassadors, 100-200 events
- Capacity limits: Configurable per ambassador type (defaults: EA 2-9 events, REA 3-10 EAs)
- Reallocation suggestions: Must handle up to 20 events being reallocated simultaneously
- Geographic calculations: Must handle Victoria region (approximately 227,000 km²)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality Gates (NON-NEGOTIABLE)
- ✅ Code MUST be formatted with Prettier - Will use existing Prettier configuration
- ✅ Code MUST pass ESLint linting - Will use existing ESLint configuration
- ✅ Code MUST pass TypeScript type checking - Will use strict TypeScript mode
- ✅ All tests MUST pass - Will write comprehensive tests for all new functionality
- ✅ Disused code MUST be removed - Will remove any temporary code after implementation

### Test-Driven Development
- ✅ Tests MUST be written for production code - Will write tests first following TDD
- ✅ Tests MUST NOT check for test environment - Tests will test production code directly
- ✅ Functions MUST have low cyclomatic complexity - Will break complex reallocation logic into smaller functions
- ✅ Tests MUST NOT pollute console - Will ensure test output is clean

### Atomic Commits with Semantic Messages
- ✅ Each change MUST be committed atomically - Will commit feature incrementally by user story
- ✅ Commit messages MUST follow Conventional Commits - Will use "feat:", "fix:", "refactor:" prefixes

### Single Responsibility & Clean Architecture
- ✅ Each component MUST have single responsibility - Will create focused functions for capacity checking, reallocation, onboarding, offboarding
- ✅ Code layout MUST follow current structure - Will add new files to `src/actions/`, `src/models/`, `src/utils/` as appropriate

### Accessibility & User Experience
- ✅ Every user input MUST be controllable from keyboard - All new UI elements will be keyboard accessible
- ✅ UI MUST be clean, consistent, accessible - Will follow existing UI patterns
- ✅ Use Australian English - Will use Australian English for all user-facing text

### Open Source Preference
- ✅ Favour open source libraries - Will use existing libraries, implement distance calculations directly if needed (haversine formula is simple)

### Documentation Currency
- ✅ README MUST remain up-to-date - Will update README with new features and usage instructions

**Gate Status**: ✅ ALL GATES PASS - No violations identified. Implementation aligns with all constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-ambassador-capacity-management/
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
├── models/
│   ├── CapacityLimits.ts          # NEW: Capacity limit configuration model
│   ├── CapacityStatus.ts           # NEW: Capacity status enum/types
│   ├── ReallocationSuggestion.ts  # NEW: Reallocation suggestion model
│   ├── Region.ts                   # NEW: Region assignment model
│   └── [existing models...]
├── actions/
│   ├── onboardAmbassador.ts        # NEW: Onboarding functionality
│   ├── offboardAmbassador.ts      # NEW: Offboarding functionality with validation and cleanup
│   ├── checkCapacity.ts           # NEW: Capacity checking logic
│   ├── suggestReallocation.ts    # NEW: Reallocation suggestion engine
│   ├── configureCapacityLimits.ts # NEW: Capacity limit configuration
│   ├── validateOffboarding.ts    # NEW: Pre-offboarding validation (ensures all allocations can be reallocated)
│   └── [existing actions...]
├── utils/
│   ├── geography.ts                # NEW: Geographic distance calculations
│   ├── regions.ts                  # NEW: Region assignment logic
│   └── [existing utils...]
└── [existing files...]

public/
└── index.html                      # MODIFY: Add UI for onboarding, offboarding, capacity display, configuration
```

**Structure Decision**: Single project structure maintained. New functionality added to existing `src/actions/`, `src/models/`, and `src/utils/` directories following current patterns. UI modifications extend existing HTML structure.

## Implementation Details

### Offboarding Validation and Cleanup

The offboarding process requires strict validation and complete cleanup to ensure data integrity:

1. **Pre-offboarding Validation** (`validateOffboarding.ts`):
   - Validate that all Event Ambassador's events can be reallocated to existing ambassadors
   - Validate that all Regional Ambassador's Event Ambassadors can be reallocated to existing Regional Ambassadors
   - Block offboarding if validation fails (no recipient specified or recipient doesn't exist)
   - Provide clear error messages indicating which allocations cannot be reallocated

2. **Automatic Cleanup During Offboarding** (`offboardAmbassador.ts`):
   - **Event Ambassador offboarding**:
     - Reallocate all events to recipient (or block if no recipient)
     - Remove Event Ambassador from all Regional Ambassadors' `supportsEAs` lists
     - Update Event Teams table to show new Event Ambassador assignments
     - Remove Event Ambassador from `eventAmbassadors` map
     - Persist changes to localStorage
   - **Regional Ambassador offboarding**:
     - Reallocate all Event Ambassadors to recipient (or block if no recipient)
     - Update Event Teams table to show new Regional Ambassador assignments
     - Remove Regional Ambassador from `regionalAmbassadors` map
     - Persist changes to localStorage

3. **UI Cleanup** (`refreshUI.ts`, `populateAmbassadorsTable.ts`, `populateMap.ts`):
   - Event Ambassadors table: Only display ambassadors present in `eventAmbassadors` map
   - Regional Ambassadors table: Only display ambassadors present in `regionalAmbassadors` map
   - Event Teams table: Derived from `eventTeamsTableData` which is built from current ambassador maps
   - Map view: Derived from `eventTeamsTableData` - automatically excludes offboarded ambassadors
   - Changes log: Continues to show offboarded ambassadors in historical entries

4. **Validation Flow**:
   - User clicks "Offboard" button
   - System validates that ambassador has allocations
   - If allocations exist, system requires user to specify recipient (or blocks if no suitable recipients)
   - System validates recipient exists and can accept allocations
   - Only after validation passes, offboarding proceeds with automatic cleanup
   - UI refreshes automatically to reflect changes

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. Implementation follows existing patterns and adds focused functionality without architectural changes. The validation and cleanup logic is straightforward and follows single responsibility principle.
