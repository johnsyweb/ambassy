# Implementation Plan: Ambassador Capacity Management and Lifecycle

**Branch**: `001-ambassador-capacity-management` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ambassador-capacity-management/spec.md`

## Summary

Enable onboarding and offboarding of Event Ambassadors and Regional Ambassadors with intelligent capacity checking and reallocation suggestions. The system provides configurable capacity limits, visual capacity status indicators, and streamlined offboarding workflows that log each reassignment separately and provide clickable suggestion buttons for easy selection. Reallocation suggestions consider capacity availability, regional alignment (determined dynamically from supportsEAs), geographic proximity, and conflict avoidance.

## Technical Context

**Language/Version**: TypeScript 5.9.3  
**Primary Dependencies**: Existing project dependencies (no new external dependencies required)  
**Storage**: localStorage (browser API) for persistence  
**Testing**: Jest 30.2.0 with ts-jest 29.4.5, jsdom environment  
**Target Platform**: Modern web browsers (ES6+ support)  
**Project Type**: Single-page web application  
**Performance Goals**: 
- Onboarding actions complete in <30 seconds (SC-001, SC-002)
- Capacity status visible within 1 second (SC-004)
- Offboarding with suggestions in <2 minutes (SC-005, SC-006)
- Selection per event/EA in <10 seconds (SC-018)
**Constraints**: 
- Must work offline (localStorage-based)
- Must be keyboard accessible (constitution requirement)
- Must use Australian English for all user-facing text
**Scale/Scope**: 
- Typical usage: 50-200 events, 10-30 Event Ambassadors, 3-5 Regional Ambassadors
- Capacity limits: Configurable, default EA: 2-9 events, REA: 3-10 EAs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality Gates
- ✅ **Prettier formatting**: Code will be formatted with Prettier before commit
- ✅ **ESLint linting**: Code will pass ESLint checks before commit
- ✅ **TypeScript type checking**: Code will pass `tsc --noEmit` before commit
- ✅ **Tests pass**: All tests must pass before commit
- ✅ **Disused code removal**: Unused code will be removed immediately

### Test-Driven Development
- ✅ **Tests written first**: Tests will be written before implementation (TDD)
- ✅ **Production code testing**: Tests test production code directly, no test environment checks
- ✅ **High coverage**: Functions will have high test coverage
- ✅ **No test skipping**: Tests will not be skipped without explicit confirmation

### Atomic Commits
- ✅ **Semantic commits**: Commits follow Conventional Commits specification
- ✅ **Atomic changes**: Each commit represents a complete, working change

### Single Responsibility & Clean Architecture
- ✅ **Single responsibility**: Each component has a single responsibility
- ✅ **Self-documenting code**: Code avoids comments, uses clear naming and dedicated functions
- ✅ **Current structure**: Follows existing code layout (models, actions, parsers, utils)

### Accessibility & User Experience
- ✅ **Keyboard accessible**: All user inputs controllable from keyboard (clickable buttons support keyboard navigation)
- ✅ **Clean UI**: Professional, consistent interface
- ✅ **Australian English**: All user-facing text uses Australian English

### Open Source Preference
- ✅ **No new dependencies**: Uses existing project dependencies, no new external libraries required

### Documentation Currency
- ✅ **README updated**: README will be updated with new features

**Status**: All gates pass. Implementation can proceed.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: Single-page web application structure maintained. New functionality added as extensions to existing models and new action files following established patterns. No architectural changes required.

### Key Files Modified/Created

**New Files**:
- `src/models/CapacityStatus.ts` - Enum for capacity status
- `src/models/CapacityLimits.ts` - Interface for configurable limits
- `src/models/ReallocationSuggestion.ts` - Interface for reallocation suggestions
- `src/actions/onboardAmbassador.ts` - Onboarding logic
- `src/actions/offboardAmbassador.ts` - Offboarding logic (updated for separate logging)
- `src/actions/checkCapacity.ts` - Capacity checking logic
- `src/actions/suggestReallocation.ts` - Reallocation suggestion algorithm
- `src/actions/configureCapacityLimits.ts` - Capacity limits configuration
- `src/utils/geography.ts` - Haversine formula for distance calculations
- `src/utils/regions.ts` - Dynamic region determination helpers
- `src/actions/populateAmbassadorsTable.ts` - Ambassador table display

**Modified Files**:
- `src/models/EventAmbassador.ts` - Added `capacityStatus` and `conflicts` fields
- `src/models/RegionalAmbassador.ts` - Added `capacityStatus` and `conflicts` fields (removed `region` field)
- `src/models/LogEntry.ts` - Existing interface supports separate log entries
- `src/actions/offboardAmbassador.ts` - Updated to log each reassignment separately (FR-036)
- `src/index.ts` - Updated offboarding UI to use clickable suggestion buttons with dropdown fallback (FR-037)
- `public/index.html` - Added UI elements for onboarding, offboarding, capacity configuration, and suggestion buttons
- `src/actions/populateAmbassadorsTable.ts` - Added capacity status display and offboard buttons

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
