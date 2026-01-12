# Implementation Plan: Event Team Reallocation

**Branch**: `003-event-team-reallocation` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-event-team-reallocation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable users to select an Event Team from the Event Teams table and reallocate it to another Event Ambassador. The application prioritises potential recipients based on their available capacity and the geographic proximity of events they already support to the event being reallocated. This feature leverages existing reallocation scoring logic (`suggestEventReallocation`) and assignment functionality (`assignEventToAmbassador`) to provide a streamlined UI workflow for reallocating individual events.

## Technical Context

**Language/Version**: TypeScript (strict mode enabled)  
**Primary Dependencies**: 
- Leaflet (map rendering)
- PapaParse (CSV parsing)
- Existing modules: `assignEventToAmbassador`, `suggestEventReallocation`, `calculateGeographicProximityScore`, `checkEventAmbassadorCapacity`

**Storage**: Browser localStorage/sessionStorage (via existing `persistState` utilities)  
**Testing**: Jest (unit tests, integration tests)  
**Target Platform**: Modern web browsers (ES6+)  
**Project Type**: Single-page web application  
**Performance Goals**: 
- UI interactions should feel responsive (<100ms perceived latency)
- Suggestion calculation should complete in <500ms for typical datasets (<100 ambassadors)
- Map updates should be smooth (60fps)

**Constraints**: 
- Must maintain keyboard accessibility (all interactions keyboard-controllable)
- Must use Australian English for user-facing text
- Must integrate with existing table-map navigation feature
- Must preserve existing logging and persistence mechanisms
- Must follow existing code structure (models/, actions/, utils/)

**Scale/Scope**: 
- Typical dataset: 50-200 Event Ambassadors, 500-2000 Event Teams
- Single user workflow (no concurrent editing)
- Feature adds one new UI action (reallocation button/dialog) to Event Teams table

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Quality Gates
✅ **PASS**: Code will be formatted with Prettier, pass ESLint, pass TypeScript type checking, and all tests must pass before commit.

### II. Test-Driven Development
✅ **PASS**: Tests will be written for all new functions. Tests will test production code directly (no test environment checks). Functions will maintain low cyclomatic complexity.

### III. Atomic Commits with Semantic Messages
✅ **PASS**: Each change will be committed atomically with Conventional Commits format messages.

### IV. Single Responsibility & Clean Architecture
✅ **PASS**: Feature will follow existing code structure:
- `src/actions/reallocateEventTeam.ts` - Core reallocation action
- `src/actions/showReallocationDialog.ts` - UI dialog management
- `src/models/ReallocationState.ts` - Selection state model (if needed)
- Tests alongside source files

### V. Accessibility & User Experience
✅ **PASS**: All interactions will be keyboard accessible. UI will be clean and professional. Australian English will be used.

### VI. Open Source Preference
✅ **PASS**: Feature uses existing open source libraries (no new dependencies required).

### VII. Documentation Currency
✅ **PASS**: README will be updated if feature affects setup or usage.

### VIII. Production/Test Parity
✅ **PASS**: Code will behave identically in production and test environments.

### IX. Twelve-Factor App Principles
✅ **PASS**: Feature follows existing application patterns (stateless, configuration via environment variables where applicable).

**Constitution Check Result**: ✅ **ALL GATES PASS**

## Project Structure

### Documentation (this feature)

```text
specs/003-event-team-reallocation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── reallocation-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── actions/
│   ├── reallocateEventTeam.ts          # Core reallocation action
│   ├── reallocateEventTeam.test.ts     # Tests for reallocation
│   ├── showReallocationDialog.ts       # UI dialog management
│   └── showReallocationDialog.test.ts  # Tests for dialog
├── models/
│   └── ReallocationState.ts            # Selection state (if needed)
└── utils/
    └── (no new utilities - uses existing)

src/actions/populateEventTeamsTable.ts   # Modified to add reallocation button/action
public/index.html                         # Modified to add reallocation dialog HTML
public/style.css                          # Modified to add dialog styles
```

**Structure Decision**: Single project structure. Feature adds new action modules following existing patterns. UI components (dialog) follow existing modal dialog pattern (similar to reallocation dialog used in offboarding). No new utilities required - leverages existing `suggestEventReallocation`, `assignEventToAmbassador`, and storage utilities.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution checks pass.
