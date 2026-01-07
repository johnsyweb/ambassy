# Implementation Plan: Ambassador Capacity Management and Lifecycle

**Branch**: `001-ambassador-capacity-management` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ambassador-capacity-management/spec.md`

## Summary

This feature enables onboarding and offboarding of Event Ambassadors and Regional Ambassadors, with capacity checking and intelligent reallocation suggestions. The system tracks ambassador capacity against configurable limits, flags ambassadors who are under or over capacity, and provides reallocation suggestions during offboarding that consider capacity availability, regional alignment (determined dynamically from supportsEAs relationship), geographic proximity, and conflict avoidance.

**Technical Approach**: Extend existing TypeScript web application with new models (CapacityStatus, CapacityLimits, ReallocationSuggestion), utility functions for geographic calculations and capacity checking, and UI components for onboarding/offboarding workflows. Region determination is dynamic based on which Regional Ambassador supports each Event Ambassador (via supportsEAs relationship), not stored as a separate field.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode enabled)

**Primary Dependencies**: 
- Existing: Leaflet (map visualization), d3-geo-voronoi (regional polygons), PapaParse (CSV parsing)
- New: None required - using native JavaScript/TypeScript for geographic calculations (Haversine formula)

**Storage**: localStorage (browser-based persistence, already implemented)

**Testing**: Jest 30.2.0 with jest-environment-jsdom for browser API simulation

**Target Platform**: Modern web browsers (ES6+)

**Project Type**: Single-page web application

**Performance Goals**: 
- Capacity status calculation: < 100ms for 100 ambassadors
- Reallocation suggestions: < 500ms for 50 potential recipients
- UI updates: < 1 second for full refresh

**Constraints**: 
- Must work offline (localStorage-based)
- Must maintain backward compatibility with existing data structures
- All user inputs must be keyboard accessible
- Australian English for all user-facing text

**Scale/Scope**: 
- Typical usage: 50-200 Event Ambassadors, 5-15 Regional Ambassadors, 100-300 events
- Capacity limits: Configurable per ambassador type (Event/Regional)
- Reallocation suggestions: Up to 10 suggestions per offboarding action

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality Gates (I)
✅ **PASS**: All code will be formatted with Prettier, linted with ESLint, type-checked with TypeScript, and tested with Jest before commit.

### Test-Driven Development (II)
✅ **PASS**: Tests will be written first (TDD), test production code directly, maintain high coverage, and not pollute console. Tests will not be skipped without explicit confirmation.

### Atomic Commits (III)
✅ **PASS**: Each change will be committed atomically with semantic commit messages following Conventional Commits.

### Single Responsibility & Clean Architecture (IV)
✅ **PASS**: Code follows existing structure (models, actions, parsers, utils). Self-documenting code preferred over comments.

### Accessibility & UX (V)
✅ **PASS**: All UI elements will be keyboard accessible. Australian English for user-facing text.

### Open Source Preference (VI)
✅ **PASS**: Using existing open source libraries (Leaflet, d3-geo-voronoi). Geographic calculations implemented natively (no new dependencies).

### Documentation Currency (VII)
✅ **PASS**: README will be updated with new features. Documentation reflects current state.

### Production/Test Parity (VIII)
✅ **PASS**: Code behaves identically in production and test. No environment-specific branches.

### Twelve-Factor App Principles (IX)
✅ **PASS**: Configuration via localStorage (client-side equivalent of environment variables), stateless processes, disposability, development/production parity.

**GATE STATUS**: ✅ **ALL GATES PASS**

## Project Structure

### Documentation (this feature)

```text
specs/001-ambassador-capacity-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── onboarding-contracts.md
│   ├── capacity-contracts.md
│   ├── offboarding-contracts.md
│   └── reallocation-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── models/
│   ├── CapacityStatus.ts          # NEW: Enum for capacity status (WITHIN/UNDER/OVER)
│   ├── CapacityLimits.ts          # NEW: Interface for configurable limits
│   ├── ReallocationSuggestion.ts  # NEW: Interface for reallocation suggestions
│   ├── EventAmbassador.ts         # EXTENDED: Added capacityStatus, conflicts fields
│   ├── RegionalAmbassador.ts      # EXTENDED: Added capacityStatus, conflicts fields
│   └── [existing models...]
├── actions/
│   ├── onboardAmbassador.ts       # NEW: Onboarding logic
│   ├── offboardAmbassador.ts     # NEW: Offboarding logic with reallocation
│   ├── checkCapacity.ts          # NEW: Capacity checking and status calculation
│   ├── suggestReallocation.ts    # NEW: Reallocation suggestion algorithm
│   ├── configureCapacityLimits.ts # NEW: Capacity limits configuration
│   ├── assignEventToAmbassador.ts # NEW: Event assignment logic
│   └── [existing actions...]
├── utils/
│   ├── geography.ts               # NEW: Haversine formula for distance calculations
│   └── [existing utils...]
└── index.ts                        # MODIFIED: UI integration for new features

tests/
└── [mirrors src/ structure with .test.ts files]
```

**Structure Decision**: Single-page web application structure maintained. New functionality added as extensions to existing models and new action files following established patterns. No architectural changes required.

## Implementation Details

### Region Determination (Clarified 2026-01-09)

**Critical Update**: Region is determined dynamically from the `supportsEAs` relationship, not stored as a separate field. Two Event Ambassadors are in the "same region" if they are both supported by the same Regional Ambassador (i.e., both appear in the same Regional Ambassador's `supportsEAs` list).

**Impact on Implementation**:
- Remove `region` field from `EventAmbassador` and `RegionalAmbassador` interfaces (if present)
- Update `suggestReallocation.ts` to determine region dynamically by finding which Regional Ambassador supports each Event Ambassador
- Update `calculateReallocationScore` to use dynamic region lookup instead of stored region field
- Remove `Region` enum and `regions.ts` utility (if region assignment logic exists)

### Capacity Checking Flow

1. Load capacity limits from localStorage (defaults if not configured)
2. Calculate capacity status for each ambassador based on current allocations
3. Update `capacityStatus` field on ambassador objects
4. Display status in UI with emoji indicators (⬇️ under, ✅ within, ⚠️ over)

### Reallocation Scoring Algorithm

Multi-factor scoring system with weighted factors:
- **Capacity** (30% weight): Available capacity, within limits preferred
- **Region** (30% weight): Same Regional Ambassador preferred (determined dynamically)
- **Proximity** (30% weight): Geographic proximity to existing events
- **Conflicts** (10% weight): Penalty for conflicts of interest

### Offboarding Validation

Before offboarding starts:
1. Validate all events/EAs can be reallocated to existing ambassadors
2. Block offboarding if validation fails
3. After validation passes, prompt user for recipient per event/EA
4. Complete offboarding with automatic cleanup:
   - Remove ambassador from all data structures
   - Remove from Regional Ambassador's `supportsEAs` list (if EA)
   - Update Event Teams table
   - Refresh map view
   - Log changes

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all gates pass.
