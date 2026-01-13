# Implementation Plan: Event History Links

**Branch**: `001-event-history-links` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-event-history-links/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add hyperlinks to event names in the Event Ambassador tab that open each event's parkrun event history page in a new browser tab. Links are constructed using per-country domains from the countries data (loaded from events.json) and the event's short name, following the pattern `https://<country-domain>/<eventShortName>/results/eventhistory/`. The feature must gracefully handle missing domain data and maintain keyboard accessibility.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode enabled)  
**Primary Dependencies**: DOM APIs, no new external dependencies required  
**Storage**: N/A (uses existing EventDetailsMap and CountryMap from localStorage cache)  
**Testing**: Jest 30.2.0 with jsdom environment  
**Target Platform**: Modern web browsers (ES6+)  
**Project Type**: Single-page web application  
**Performance Goals**: Link generation should not impact table rendering performance (< 50ms for typical ambassador with 10 events)  
**Constraints**: Must not break existing table functionality, must handle missing country data gracefully, must be keyboard accessible  
**Scale/Scope**: Typical Event Ambassador has 1-15 live event allocations; supports all countries in events.json

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality Gates (NON-NEGOTIABLE)
- ✅ Code MUST be formatted with Prettier - Will use existing Prettier configuration
- ✅ Code MUST pass ESLint linting - Will use existing ESLint configuration, zero errors/warnings
- ✅ Code MUST pass TypeScript type checking - Will use strict TypeScript mode
- ✅ All tests MUST pass - Will write tests for link generation and URL construction
- ✅ Disused code MUST be removed - No code removal required
- ✅ Commented-out code MUST NOT exist - Will not introduce commented code

### Test-Driven Development
- ✅ Tests MUST be written for production code - Will write unit tests for URL construction and integration tests for table rendering
- ✅ Tests MUST NOT check for test environment - Tests will test production code directly
- ✅ Functions MUST have low cyclomatic complexity - Link generation will be a simple utility function
- ✅ Tests MUST NOT pollute console - Will ensure clean test output

### Atomic Commits with Semantic Messages
- ✅ Each change MUST be committed atomically - Will commit feature incrementally
- ✅ Commit messages MUST follow Conventional Commits - Will use "feat:" prefix

### Single Responsibility & Clean Architecture
- ✅ Each component MUST have single responsibility - Will create separate utility function for URL construction
- ✅ Code layout MUST follow current structure - Will add to existing `src/actions/populateAmbassadorsTable.ts` and `src/utils/` if needed

### Accessibility & User Experience
- ✅ Every user input MUST be controllable from keyboard - Links will be keyboard accessible with proper focus states
- ✅ UI MUST be clean, consistent, accessible - Will follow existing link styling patterns

## Project Structure

### Documentation (this feature)

```text
specs/001-event-history-links/
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
│   └── populateAmbassadorsTable.ts  # Modify to add links to event names
├── utils/
│   └── eventHistoryUrl.ts           # New utility for URL construction
├── models/
│   ├── EventDetails.ts              # Already has countrycode property
│   └── country.ts                   # Already has CountryMap with url property
└── tests/
    └── actions/
        └── populateAmbassadorsTable.test.ts  # Update/add tests for links
```

**Structure Decision**: Single project structure. Feature adds minimal code: a utility function for URL construction and modifications to existing table population function. No new models or services required.

## Complexity Tracking

> **No violations detected - all constitution requirements can be met with simple implementation**
