# Implementation Plan: Table-Map Navigation Integration

**Branch**: `002-table-map-navigation` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-table-map-navigation/spec.md`

## Summary

Enable bidirectional navigation between tables and map view. When a user selects a row in any table (Event Teams, Event Ambassadors, or Regional Ambassadors), the corresponding events are highlighted and centered on the map. When a user selects an event marker on the map, the corresponding row in the Event Teams table is highlighted if that tab is visible.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)  
**Primary Dependencies**: 
- Leaflet 1.9.4 (map library)
- d3-geo-voronoi 2.1.0 (geographic calculations)
- DOM APIs (table manipulation)

**Storage**: N/A (client-side state only)  
**Testing**: Jest 30.2.0 with ts-jest 29.4.5, jsdom environment  
**Target Platform**: Modern web browsers (ES6+)  
**Project Type**: Single-page web application  
**Performance Goals**: 
- Selection changes update UI within 100ms
- Smooth map animations (60fps)
- No performance degradation with 1000+ events

**Constraints**: 
- Must work with keyboard-only navigation
- Must be accessible (screen reader compatible)
- Must maintain existing table and map functionality
- Must work across tab switches

**Scale/Scope**: 
- 3 tables (Event Teams, Event Ambassadors, Regional Ambassadors)
- 1 map view
- Up to 1000+ events
- Multiple simultaneous highlights possible

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality Gates
✅ **Prettier formatting**: Will be enforced via pre-commit  
✅ **ESLint linting**: Will be enforced via pre-commit  
✅ **TypeScript type checking**: Strict mode enabled, will be enforced  
✅ **Tests passing**: TDD approach, tests written first  
✅ **No disused code**: Will be removed immediately

### Test-Driven Development
✅ **Tests for production code**: Tests will test actual DOM interactions and map behavior  
✅ **No test environment checks**: Tests will use jsdom to simulate browser environment  
✅ **Low cyclomatic complexity**: Functions will be focused and single-purpose  
✅ **High test coverage**: All selection and navigation logic will be tested  
✅ **No console pollution**: Tests will be clean

### Atomic Commits
✅ **Semantic commit messages**: Will follow Conventional Commits format  
✅ **Complete changes**: Each feature increment will be complete and working

### Single Responsibility
✅ **Component separation**: 
- Table selection logic separate from map highlighting
- Map event handling separate from table updates
- State management separate from UI updates

### Accessibility
✅ **Keyboard navigation**: All selection will work with keyboard (arrow keys, Enter, Tab)  
✅ **Screen reader support**: ARIA attributes and announcements for selection changes  
✅ **Focus management**: Proper focus handling when switching between table and map

### Open Source Preference
✅ **Using existing libraries**: Leaflet for map, no custom map implementation needed

### Documentation
✅ **README updates**: Will document new navigation features

### Production/Test Parity
✅ **Same code paths**: Tests will use same DOM APIs and Leaflet APIs as production

**GATE STATUS**: ✅ PASS - All constitution requirements can be met

## Project Structure

### Documentation (this feature)

```text
specs/002-table-map-navigation/
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
│   ├── populateMap.ts              # Existing - will be extended with highlighting
│   ├── populateEventTeamsTable.ts  # Existing - will add row selection
│   ├── populateAmbassadorsTable.ts  # Existing - will add row selection
│   └── tableMapNavigation.ts        # NEW - coordination logic
├── models/
│   └── SelectionState.ts           # NEW - selection state model
├── utils/
│   └── mapNavigation.ts            # NEW - map centering/zooming utilities
└── index.ts                         # Existing - will wire up navigation

tests/
└── (mirrors src structure)
```

**Structure Decision**: Single project structure. New files will be added to existing `src/actions/` and `src/models/` directories. Navigation coordination logic will be in a new `tableMapNavigation.ts` file to maintain single responsibility.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified.

## Phase 0: Research & Design Decisions

### Research Tasks

1. **Leaflet marker highlighting patterns**
   - Research: How to highlight markers in Leaflet (change style, add to highlight layer)
   - Decision needed: Best approach for visual highlighting (color change, border, icon change)

2. **Leaflet map centering/zooming patterns**
   - Research: How to center on single point vs bounding box for multiple points
   - Decision needed: Animation options, zoom level calculation

3. **Table row selection patterns**
   - Research: Best practices for table row selection (click handlers, keyboard navigation)
   - Decision needed: Visual highlighting approach (CSS class, inline styles)

4. **Bidirectional state synchronization**
   - Research: Patterns for keeping table and map state in sync
   - Decision needed: Centralized state vs event-driven updates

5. **Accessibility for map-table navigation**
   - Research: ARIA patterns for map markers and table navigation
   - Decision needed: Screen reader announcements, focus management

6. **Performance with large datasets**
   - Research: Leaflet performance with 1000+ markers
   - Decision needed: Marker clustering vs individual markers, highlight layer optimization

### Key Design Decisions Needed

- **Highlighting visual style**: Color change, border, or icon overlay?
- **Map zoom strategy**: Fixed zoom level or calculate to fit all highlighted events?
- **State management**: Centralized selection state or event-driven?
- **Multiple selection**: Allow multiple table rows selected simultaneously?
- **Tab switching behavior**: Persist selection when switching tabs?

## Phase 1: Data Model & Contracts

### Data Model

**SelectionState** (new model):
- `selectedEventShortName: string | null` - Currently selected event (from Event Teams table or map)
- `selectedEventAmbassador: string | null` - Currently selected EA (from EA table)
- `selectedRegionalAmbassador: string | null` - Currently selected REA (from REA table)
- `highlightedEvents: Set<string>` - Set of event short names to highlight on map
- `activeTab: string` - Currently visible tab name

**Map Marker Reference** (extend existing):
- Store marker references keyed by event short name in `populateMap.ts`
- Allow lookup of markers for highlighting

### API Contracts

**Table Selection API**:
- `selectEventTeamRow(eventShortName: string): void` - Select row in Event Teams table
- `selectEventAmbassadorRow(ambassadorName: string): void` - Select row in EA table
- `selectRegionalAmbassadorRow(ambassadorName: string): void` - Select row in REA table
- `clearSelection(): void` - Clear all selections

**Map Highlighting API**:
- `highlightEvents(eventShortNames: string[]): void` - Highlight events on map
- `centerOnEvents(eventShortNames: string[]): void` - Center/zoom map to show events
- `clearMapHighlights(): void` - Clear all map highlights

**Map Event Selection API**:
- `onMapEventClick(eventShortName: string): void` - Handle event marker click
- `onMapEventKeyPress(eventShortName: string, key: string): void` - Handle keyboard on map

**Table Highlighting API**:
- `highlightTableRow(tableId: string, eventShortName: string): void` - Highlight row in table
- `scrollToTableRow(tableId: string, eventShortName: string): void` - Scroll table to show row
- `clearTableHighlights(tableId: string): void` - Clear highlights in table

## Phase 2: Implementation Strategy

### Implementation Order

1. **Foundation**: Selection state model and basic coordination
2. **Event Teams ↔ Map**: Bidirectional navigation (simplest case)
3. **Event Ambassador → Map**: Select EA, highlight all their events
4. **Regional Ambassador → Map**: Select REA, highlight all supported EA events
5. **Accessibility**: Keyboard navigation and screen reader support
6. **Polish**: Animations, performance optimization

### Key Implementation Details

**Marker Storage**: 
- Store marker references in a Map<string, L.CircleMarker> keyed by event short name
- Update when map is repopulated

**Selection State**:
- Centralized state object accessible to both table and map code
- Event-driven updates (table selection triggers map update, map click triggers table update)

**Visual Highlighting**:
- Table rows: Add/remove CSS class for selected state
- Map markers: Change marker style (radius, color, or add highlight layer)

**Map Centering**:
- Single event: Use `map.setView()` with event coordinates
- Multiple events: Calculate bounding box, use `map.fitBounds()`

**Tab Awareness**:
- Check if target table tab is visible before highlighting
- Store selection state, apply when tab becomes visible

## Dependencies

### External Dependencies
- Leaflet (already in use)
- No new dependencies required

### Internal Dependencies
- `populateMap.ts` - Map rendering
- `populateEventTeamsTable.ts` - Event Teams table
- `populateAmbassadorsTable.ts` - EA and REA tables
- `refreshUI.ts` - UI refresh coordination

## Risks & Mitigations

**Risk**: Performance degradation with many highlighted markers  
**Mitigation**: Use highlight layer group, batch style updates, test with 1000+ events

**Risk**: Complex state synchronization  
**Mitigation**: Centralized state object, clear event flow, comprehensive tests

**Risk**: Accessibility gaps  
**Mitigation**: Follow ARIA patterns, test with screen readers, keyboard-only testing

**Risk**: Breaking existing functionality  
**Mitigation**: TDD approach, comprehensive tests, incremental implementation

## Success Metrics

- ✅ Users can click table row → map highlights and centers
- ✅ Users can click map marker → table row highlights
- ✅ Keyboard navigation works for all interactions
- ✅ Performance remains smooth with 1000+ events
- ✅ All existing functionality continues to work
- ✅ Screen reader users can navigate effectively

