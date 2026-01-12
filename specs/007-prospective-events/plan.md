# Implementation Plan: Prospective Events

**Branch**: `007-prospective-events` | **Date**: January 13, 2026 | **Spec**: [link to spec.md]
**Input**: Feature specification from `/specs/007-prospective-events/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a feature to import and manage "Prospective Events" - potential future parkrun events that ambassadors can track and plan for. The system will parse hierarchical RA→EA relationships from CSV, attempt geocoding, and provide resolution workflows for issues.

## Technical Context

**Language/Version**: TypeScript 5.x, ES2020
**Primary Dependencies**: D3.js (existing), Leaflet (existing), Jest (testing)
**Storage**: localStorage (existing patterns), CSV parsing
**Testing**: Jest with existing test patterns
**Target Platform**: Web browser (existing)
**Project Type**: Web application (existing structure)
**Performance Goals**: Import <5s for typical CSV sizes, geocoding <2s per request
**Constraints**: Must integrate with existing ambassador/event data models
**Scale/Scope**: Handle CSVs with 100-1000 prospective events

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Single Responsibility**: Each component handles one aspect (parsing, geocoding, matching)
- ✅ **Test Coverage**: New functionality will have comprehensive tests
- ✅ **Clean Code**: Follow existing patterns and conventions
- ✅ **User Experience**: Keyboard accessible, clear error messages
- ✅ **Performance**: Efficient processing without blocking UI

## Project Structure

### Documentation (this feature)

```text
specs/007-prospective-events/
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
│   ├── ProspectiveEvent.ts     # New: Prospective event data model
│   └── ProspectiveEventList.ts # New: Collection management
├── actions/
│   ├── importProspectiveEvents.ts      # New: CSV import logic
│   ├── parseProspectiveEventsCSV.ts    # New: CSV parsing
│   ├── matchProspectiveAmbassadors.ts  # New: EA/RA name matching
│   ├── geocodeProspectiveEvents.ts     # New: Coordinate resolution
│   └── populateProspectiveEventsTable.ts # New: UI table population
├── parsers/
│   └── parseProspectiveEvents.ts # New: CSV structure parsing
└── types/
    └── ProspectiveEventTypes.ts # New: TypeScript interfaces

tests/
├── unit/
│   ├── importProspectiveEvents.test.ts
│   ├── parseProspectiveEventsCSV.test.ts
│   └── matchProspectiveAmbassadors.test.ts
└── integration/
    └── prospectiveEventsWorkflow.test.ts
```

**Structure Decision**: Follows existing project patterns with new models, actions, and parsers in appropriate directories. Testing follows established Jest patterns with unit and integration test separation.