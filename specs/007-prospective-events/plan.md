# Implementation Plan: Prospective Events

**Branch**: `007-prospective-events` | **Date**: January 13, 2026 | **Spec**: [link to spec.md]
**Input**: Feature specification from `/specs/007-prospective-events/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a comprehensive prospective events management system that allows ambassadors to import, track, and manage potential future parkrun events. The system handles CSV import with complex data types, ambassador allocation with inheritance, and full UI integration across dedicated prospects tab, EA table, and map layers. Prospects count towards EA allocation limits and can be reallocated using existing workflows.

## Technical Context

**Language/Version**: TypeScript 5.x, ES2020
**Primary Dependencies**: D3.js (existing), Leaflet (existing), Jest (testing)
**Storage**: localStorage (existing patterns), CSV parsing
**Testing**: Jest with existing test patterns
**Target Platform**: Web browser (existing)
**Project Type**: Web application (existing structure)
**Performance Goals**: Import <5s for typical CSV sizes, geocoding <2s per request
**Constraints**: Must integrate with existing ambassador/event data models, allocation system, and UI workflows
**Scale/Scope**: Handle CSVs with 100-1000 prospective events, allocation impact tracking, multi-tab UI integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Single Responsibility**: Each component handles one aspect (parsing, geocoding, matching, allocation)
- ✅ **Test Coverage**: New functionality will have comprehensive unit and integration tests
- ✅ **Clean Code**: Follow existing patterns and conventions for data models and actions
- ✅ **User Experience**: Keyboard accessible, clear error messages, consistent with existing workflows
- ✅ **Performance**: Efficient processing without blocking UI, reuse existing geocoding infrastructure
- ✅ **Integration**: Seamless integration with existing Issues, allocation, and ambassador systems

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
│   ├── ProspectiveEvent.ts         # New: Prospective event data model with allocation impact
│   └── ProspectiveEventList.ts     # New: Collection management with allocation tracking
├── actions/
│   ├── importProspectiveEvents.ts          # New: CSV import and processing pipeline
│   ├── parseProspectiveEventsCSV.ts        # New: CSV parsing with data type handling
│   ├── matchProspectiveEventAmbassadors.ts # New: EA matching with REA inheritance
│   ├── allocateProspectToAmbassador.ts     # New: Allocation with impact tracking
│   ├── geocodeProspectiveEvents.ts         # New: Coordinate resolution
│   ├── populateProspectsTab.ts             # New: Dedicated prospects management
│   ├── addProspectsToMapLayers.ts          # New: Map integration with markers
│   └── addProspectsToEATable.ts            # New: EA table integration
├── parsers/
│   └── parseProspectiveEvents.ts   # New: CSV structure parsing with validation
├── types/
│   └── ProspectiveEventTypes.ts    # New: TypeScript interfaces and contracts
└── utils/
    └── prospectValidation.ts       # New: Prospect data validation and business rules

tests/
├── unit/
│   ├── importProspectiveEvents.test.ts
│   ├── parseProspectiveEventsCSV.test.ts
│   ├── matchProspectiveEventAmbassadors.test.ts
│   └── allocateProspectToAmbassador.test.ts
├── integration/
│   └── prospectiveEventsWorkflow.test.ts
└── e2e/
    └── prospectManagement.test.ts
```

**Structure Decision**: Extends existing project patterns while adding comprehensive allocation tracking and deep UI integration. New components integrate with existing ambassador, event, and allocation systems. Testing includes unit, integration, and end-to-end coverage for critical allocation and UI workflows.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Deep integration with allocation system | Prospects must count towards EA allocation limits and be reallocated using existing workflows | Separate allocation system would duplicate logic and break consistency |
| Multi-tab UI integration | Prospects must appear in dedicated tab, EA table, and all map layers | Single-tab approach would limit discoverability and workflow efficiency |
| Complex CSV parsing | CSV contains mixed data types (strings, dates, booleans) requiring robust parsing | Simple string splitting would fail on date/boolean validation |
| REA inheritance logic | Prospects inherit REA from EA automatically, requiring relationship tracking | Manual REA assignment would be error-prone and inconsistent |