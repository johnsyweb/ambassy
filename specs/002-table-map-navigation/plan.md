# Implementation Plan: Table-Map Navigation Integration

**Branch**: `002-table-map-navigation` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-table-map-navigation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable bidirectional navigation between tables and map view. Users can select rows in tables to highlight and center events on the map, and click map markers to highlight corresponding table rows. Implementation uses centralized selection state management with event-driven updates, separate Leaflet highlight layer for map markers, and CSS class-based highlighting for table rows.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode enabled)  
**Primary Dependencies**: Leaflet 1.9.4 (map library), DOM APIs (table/map interactions)  
**Storage**: N/A (ephemeral UI state, no persistence)  
**Testing**: Jest 30.2.0 with ts-jest, jest-environment-jsdom  
**Target Platform**: Modern web browsers (ES6+, Chrome, Firefox, Safari, Edge)  
**Project Type**: Single-page web application  
**Performance Goals**: Selection changes update UI within 100ms, smooth animations, handle up to 200 events  
**Constraints**: <100ms UI update latency, keyboard accessible, screen reader compatible, smooth animations  
**Scale/Scope**: Up to 200 events for performance testing, 3 table types (Event Teams, Event Ambassadors, Regional Ambassadors)

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
  - `SelectionState` model: State management only
  - `tableMapNavigation.ts`: Navigation coordination logic
  - `mapNavigation.ts`: Map-specific utilities
  - Table population functions: Extended with selection handlers
- Code follows existing structure: models/, actions/, utils/
- Comments avoided in favor of self-documenting code

### Accessibility & User Experience ✅
- All interactions keyboard accessible (arrow keys, Enter, Tab)
- Screen reader announcements via aria-live regions
- ARIA attributes: `aria-selected`, `role="button"`, `aria-label`
- Visual highlighting: Background color + border for clear feedback
- Australian English for user-facing text

### Open Source Preference ✅
- Using Leaflet (open source map library)
- No custom map implementation needed

### Documentation Currency ✅
- README will be updated if setup/usage changes
- Feature documentation in quickstart.md

### Production/Test Parity ✅
- Code behaves identically in production and test
- No environment-specific branches
- Tests exercise same code paths as production

### Twelve-Factor App Principles ✅
- Configuration via environment variables (if needed)
- Stateless UI state (ephemeral selection state)
- Development/production parity maintained

**Status**: ✅ All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-table-map-navigation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command) - COMPLETE
├── data-model.md        # Phase 1 output (/speckit.plan command) - COMPLETE
├── quickstart.md        # Phase 1 output (/speckit.plan command) - COMPLETE
├── contracts/           # Phase 1 output (/speckit.plan command) - COMPLETE
│   └── navigation-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan) - COMPLETE
```

### Source Code (repository root)

```text
src/
├── models/
│   └── SelectionState.ts          # Selection state model
├── actions/
│   ├── tableMapNavigation.ts      # Navigation coordination logic
│   ├── populateMap.ts             # Extended with marker storage
│   ├── populateEventTeamsTable.ts # Extended with row selection
│   └── populateAmbassadorsTable.ts # Extended with row selection
├── utils/
│   └── mapNavigation.ts           # Map centering/zooming utilities
└── index.ts                        # Integration and initialization

tests/
└── (tests co-located with source files)
    └── actions/
        └── tableMapNavigation.test.ts
```

**Structure Decision**: Single project structure following existing codebase layout. Models in `src/models/`, action logic in `src/actions/`, utilities in `src/utils/`. Tests co-located with source files using `.test.ts` suffix.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution gates pass.
