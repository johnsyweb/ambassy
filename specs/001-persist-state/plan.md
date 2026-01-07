# Implementation Plan: State Persistence and Sharing

**Branch**: `001-persist-state` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-persist-state/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature adds persistent state management to the Ambassy application, migrating from sessionStorage to localStorage for data persistence across browser sessions. Additionally, it provides export and import functionality to enable sharing of application state between users. The implementation will leverage the browser's localStorage API for persistence and JSON file format for state sharing, maintaining compatibility with existing data models and UI components.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode enabled, ES6 target)

**Primary Dependencies**: 
- papaparse (CSV parsing - existing)
- leaflet (map rendering - existing)
- d3-geo-voronoi (Voronoi calculations - existing)
- No new dependencies required for localStorage (native browser API)

**Storage**: 
- Browser localStorage API (persistent across sessions)
- Browser sessionStorage API (fallback for private browsing mode)
- JSON file format for export/import

**Testing**: Jest 30.2.0 with ts-jest 29.4.5

**Target Platform**: Modern web browsers (ES6+), client-side only application

**Project Type**: Single-page web application

**Performance Goals**: 
- Export operation completes in under 5 seconds (SC-002)
- Import operation completes in under 10 seconds (SC-003)
- State restoration on page load completes in under 10 seconds (SC-006)

**Constraints**: 
- Must work in browsers that support localStorage API
- Must gracefully handle localStorage unavailability (private browsing mode)
- Must maintain backward compatibility with existing CSV upload functionality
- Must preserve data integrity during export/import operations
- File size constraints: localStorage typically limited to 5-10MB per domain

**Scale/Scope**: 
- Single user per browser instance
- State files shared between users via file transfer (email, file sharing services)
- No server-side storage or synchronisation required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality Gates (NON-NEGOTIABLE)
- ✅ Code MUST be formatted with Prettier - Will use existing Prettier configuration
- ✅ Code MUST pass ESLint linting - Will use existing ESLint configuration
- ✅ Code MUST pass TypeScript type checking - Will use strict TypeScript mode
- ✅ All tests MUST pass - Will write tests for all new functionality
- ✅ Disused code MUST be removed - Will remove sessionStorage usage where replaced by localStorage

### Test-Driven Development
- ✅ Tests MUST be written for production code - Will write unit tests for storage functions, export/import functions
- ✅ Tests MUST NOT check for test environment - Tests will test production code directly
- ✅ Functions MUST have low cyclomatic complexity - Will keep functions focused and simple
- ✅ Tests MUST NOT pollute console - Will ensure test output is clean

### Atomic Commits with Semantic Messages
- ✅ Each change MUST be committed atomically - Will commit feature incrementally
- ✅ Commit messages MUST follow Conventional Commits - Will use "feat:" prefix

### Single Responsibility & Clean Architecture
- ✅ Each component MUST have single responsibility - Will create separate modules for:
  - State persistence (localStorage operations)
  - State export (file generation)
  - State import (file parsing and validation)
- ✅ Code layout MUST follow current structure - Will add to existing `src/actions/` and `src/models/` directories

### Accessibility & User Experience
- ✅ Every user input MUST be controllable from keyboard - Export/import buttons will be keyboard accessible
- ✅ UI MUST be clean, consistent, accessible - Will follow existing UI patterns
- ✅ Use Australian English - Will use Australian English for all user-facing text

### Open Source Preference
- ✅ Favour open source libraries - Using native browser APIs (localStorage, File API) - no new dependencies needed

### Documentation Currency
- ✅ README MUST remain up-to-date - Will update README with export/import instructions

**Gate Status**: ✅ ALL GATES PASS - No violations identified. Implementation aligns with all constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-persist-state/
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
│   ├── persistState.ts          # NEW: localStorage persistence operations
│   ├── exportState.ts           # NEW: State export functionality
│   ├── importState.ts           # NEW: State import functionality
│   ├── uploadCSV.ts             # MODIFY: Change sessionStorage to localStorage
│   └── [existing actions...]
├── models/
│   ├── ApplicationState.ts      # NEW: Type definition for complete application state
│   └── [existing models...]
├── parsers/
│   └── [existing parsers...]    # MODIFY: Update to use localStorage instead of sessionStorage
├── types/
│   └── [existing types...]
├── utils/
│   └── storage.ts               # NEW: Storage abstraction layer (localStorage with fallback)
└── index.ts                     # MODIFY: Update to use localStorage, add export/import UI

tests/
└── [test files mirroring src structure]
```

**Structure Decision**: Single project structure maintained. New functionality added to existing `src/actions/` directory following current patterns. Storage abstraction added to `src/utils/` for reusability. New `ApplicationState` model created to represent complete state for export/import operations.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. Implementation follows existing patterns and adds minimal complexity.
