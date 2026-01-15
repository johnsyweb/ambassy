# Implementation Plan: Map Event Allocation

**Branch**: `010-map-event-allocation` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-map-event-allocation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable users to select unallocated events from the map interface and allocate them to Event Ambassadors. The system will automatically determine the supporting Regional Ambassador based on the EA's hierarchy. Event Directors and complete event information will be displayed in the Event Teams table, and the map view will update immediately after allocation.

**Technical Approach**: Extend existing map marker click handlers to detect unallocated events (events in `eventDetails` but not in `eventTeamsTableData`), show an allocation dialog similar to existing reallocation dialogs, use `assignEventToAmbassador` for allocation, update `extractEventTeamsTableData` to include newly allocated events, and refresh map markers to reflect the new allocation.

## Technical Context

**Language/Version**: TypeScript (strict mode enabled)  
**Primary Dependencies**: Leaflet (map rendering), d3-geo-voronoi (polygon calculations), DOM APIs  
**Storage**: Browser localStorage (via existing `persistState` functions)  
**Testing**: Jest  
**Target Platform**: Modern web browsers (ES6+)  
**Project Type**: Single-page web application  
**Performance Goals**: Map updates within 1 second of allocation completion (per SC-003), allocation completion in under 30 seconds (per SC-001)  
**Constraints**: Must maintain existing map performance, keyboard accessibility required for all interactions, Australian English for user-facing text  
**Scale/Scope**: Handle hundreds of events on map, support multiple concurrent allocations (though single-user application)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality Gates
- ✅ **Code Formatting**: Prettier configured and enforced
- ✅ **Linting**: ESLint configured with zero errors/warnings requirement
- ✅ **Type Checking**: TypeScript strict mode enabled
- ✅ **Testing**: Jest framework in place, TDD required
- ✅ **Disused Code**: Must be removed immediately
- ✅ **Commented-Out Code**: Prohibited

### Test-Driven Development
- ✅ Tests must be written for production code
- ✅ Tests must not check for test environment
- ✅ Functions must have low cyclomatic complexity
- ✅ Tests must not pollute console

### Atomic Commits
- ✅ Semantic commit messages required (Conventional Commits)
- ✅ Each commit must be complete and working

### Single Responsibility & Clean Architecture
- ✅ Path aliases required (`@actions/*`, `@models/*`, etc.)
- ✅ Clear separation: models, actions, parsers, types, utils
- ✅ Comments avoided where code can be self-documenting

### Accessibility & User Experience
- ✅ Keyboard accessibility required for all interactions
- ✅ Australian English for user-facing text
- ✅ Clean, consistent, accessible, professional UI

### Open Source Preference
- ✅ Using Leaflet (open source) for mapping
- ✅ Using d3-geo-voronoi (open source) for polygons

### Documentation Currency
- ✅ README must remain up-to-date

### Production/Test Parity
- ✅ Code must behave identically in production and test

### Twelve-Factor App Principles
- ✅ Configuration via environment variables (where applicable)
- ✅ Stateless processes
- ✅ Logs as event streams (changes log)

**Gate Status**: ✅ **PASS** - All constitution requirements are met. No violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/010-map-event-allocation/
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
│   ├── assignEventToAmbassador.ts      # Existing: core allocation logic
│   ├── populateMap.ts                  # Existing: map rendering, needs extension for unallocated events
│   ├── populateEventTeamsTable.ts      # Existing: table display, needs update for new allocations
│   ├── tableMapNavigation.ts           # Existing: map click handlers, needs extension
│   ├── showReallocationDialog.ts       # Existing: dialog pattern to reuse
│   └── allocateEventFromMap.ts         # NEW: handle unallocated event allocation
├── models/
│   ├── EventDetails.ts                 # Existing: event data structure
│   ├── EventTeam.ts                    # Existing: event team data (includes eventDirectors)
│   ├── EventTeamsTableData.ts          # Existing: table data structure
│   ├── EventTeamsTable.ts              # Existing: extractEventTeamsTableData function
│   ├── EventAmbassador.ts              # Existing: EA data structure
│   ├── RegionalAmbassador.ts           # Existing: REA data structure
│   └── SelectionState.ts               # Existing: selection state management
└── utils/
    ├── regions.ts                       # Existing: getRegionalAmbassadorForEventAmbassador
    └── mapNavigation.ts                # Existing: map highlighting utilities

tests/
└── (mirrors src/ structure)
```

**Structure Decision**: Single-page web application structure. All code in `src/` with clear separation by responsibility (actions, models, utils). Tests mirror source structure. No new major dependencies required - extending existing functionality.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. All changes extend existing patterns and maintain constitution compliance.

## Phase 0: Research Complete

**Status**: ✅ Complete

All research tasks completed. See [research.md](./research.md) for detailed findings.

**Key Decisions**:
- Unallocated events identified by absence from `eventTeamsTableData`
- Reuse `showReallocationDialog` pattern for allocation dialog
- Event Directors displayed using existing `EventTeam` model
- Map updates via full `populateMap` refresh
- REA assignment via existing `getRegionalAmbassadorForEventAmbassador` utility

## Phase 1: Design Complete

**Status**: ✅ Complete

**Generated Artifacts**:
- ✅ [data-model.md](./data-model.md) - Data structures and relationships
- ✅ [contracts/allocation-contracts.md](./contracts/allocation-contracts.md) - Function contracts
- ✅ [quickstart.md](./quickstart.md) - Developer quickstart guide

**Key Design Decisions**:
- New function: `allocateEventFromMap` for handling allocation
- New function: `showEventAllocationDialog` (or extend existing dialog)
- Extend: `selectMapEvent` to detect unallocated events
- No new data structures required
- Reuse existing patterns throughout

## Phase 2: Implementation Planning

**Status**: Ready for `/speckit.tasks`

Implementation plan is complete. Ready to generate detailed task list via `/speckit.tasks` command.

**Next Steps**:
1. Run `/speckit.tasks` to generate detailed, dependency-ordered task list
2. Begin implementation following TDD principles
3. Ensure all quality gates pass before commits
