# Implementation Plan: Event Team Reallocation

**Branch**: `003-event-team-reallocation` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-event-team-reallocation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable users to select an Event Team from the Event Teams table and reallocate it to another Event Ambassador. The application prioritises potential recipients based on total allocation count (live + prospect events, with 0 = highest priority) and geographic proximity (distance to nearest supported event as tiebreaker). The reallocation dialog displays comprehensive context including live/prospect event counts, supporting REA name, and distance to nearest event. This feature extends existing reallocation scoring logic and dialog UI to support enhanced context display.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode enabled)  
**Primary Dependencies**: 
- Leaflet 1.9.4 (map rendering and geographic calculations)
- Existing modules: `assignEventToAmbassador`, `suggestEventReallocation`, `calculateGeographicProximityScore`, `checkEventAmbassadorCapacity`, `showReallocationDialog`

**Storage**: Browser localStorage/sessionStorage (via existing `persistState` utilities)  
**Testing**: Jest 30.2.0 with ts-jest, jest-environment-jsdom  
**Target Platform**: Modern web browsers (ES6+, Chrome, Firefox, Safari, Edge)  
**Project Type**: Single-page web application  
**Performance Goals**: 
- UI interactions should feel responsive (<100ms perceived latency)
- Suggestion calculation should complete in <500ms for typical datasets (<100 ambassadors)
- Map updates should be smooth (60fps)

**Constraints**: 
- Must maintain keyboard accessibility (all interactions keyboard-controllable)
- Must use Australian English for all user-facing text
- Must integrate with existing table-map navigation feature
- Must preserve existing logging and persistence mechanisms
- Must handle edge cases: EAs with no events, EAs with no REA assignment

**Scale/Scope**: 
- Typical dataset: <100 Event Ambassadors, <200 events
- Dialog displays top 5 suggestions plus "Other" dropdown
- Must handle up to 200 events for performance testing

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality Gates ✅
- **Code Formatting**: Prettier configured, will be applied before commit
- **Linting**: ESLint configured with TypeScript support, will pass before commit
- **Type Checking**: TypeScript strict mode enabled, will pass before commit
- **Tests**: Jest configured, tests will be written following TDD principles
- **Disused Code**: Will be removed immediately

### Test-Driven Development ✅
- Tests will be written for all production code
- Tests will test production code directly (no test environment checks)
- Functions will have low cyclomatic complexity
- Tests will not pollute console

### Atomic Commits ✅
- Each change will be committed atomically with semantic commit messages
- Commits will follow Conventional Commits specification

### Single Responsibility & Clean Architecture ✅
- Each component has single responsibility:
  - `ReallocationSuggestion` model: Data structure only
  - `suggestEventReallocation()`: Scoring logic only
  - `showReallocationDialog()`: UI rendering only
  - `assignEventToAmbassador()`: Assignment logic only
- Code follows existing structure: models/, actions/, utils/
- Comments avoided in favor of self-documenting code

### Accessibility & User Experience ✅
- All interactions keyboard accessible (Tab, Enter, Arrow keys)
- Dialog supports keyboard navigation
- Screen reader compatible (ARIA attributes)
- Australian English for user-facing text
- Clear visual feedback for selections

### Open Source Preference ✅
- Using Leaflet (open source map library)
- No custom geographic calculation needed

### Documentation Currency ✅
- README will be updated if setup/usage changes
- Feature documentation in quickstart.md

### Production/Test Parity ✅
- Code behaves identically in production and test
- No environment-specific branches
- Tests exercise same code paths as production

**Status**: ✅ All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-event-team-reallocation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command) - COMPLETE
├── data-model.md        # Phase 1 output (/speckit.plan command) - COMPLETE
├── quickstart.md        # Phase 1 output (/speckit.plan command) - COMPLETE
├── contracts/           # Phase 1 output (/speckit.plan command) - COMPLETE
│   └── reallocation-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan) - COMPLETE
```

### Source Code (repository root)

```text
src/
├── models/
│   └── ReallocationSuggestion.ts    # Extended with liveEventsCount, prospectEventsCount
├── actions/
│   ├── suggestReallocation.ts        # Extended to calculate and include live/prospect counts
│   ├── showReallocationDialog.ts     # Extended to display enhanced context
│   ├── assignEventToAmbassador.ts    # Core assignment logic (existing)
│   └── reallocateEventTeam.ts        # Reallocation coordination (may need updates)
└── utils/
    └── geography.ts                  # Distance calculations (existing)

tests/
└── (tests co-located with source files)
    └── actions/
        ├── suggestReallocation.test.ts
        └── showReallocationDialog.test.ts
```

**Structure Decision**: Single project structure following existing codebase layout. Models in `src/models/`, action logic in `src/actions/`, utilities in `src/utils/`. Tests co-located with source files using `.test.ts` suffix.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution gates pass.
