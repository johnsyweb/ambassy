# Tasks: Header and Footer with Shared Palette and Breadcrumbs

**Input**: Design documents from `/specs/013-header-footer/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No separate test tasks requested; acceptance scenarios in spec and contracts define testable behaviour. Existing tests must pass (Success Criteria).

**Organization**: Tasks grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- All tasks include exact file paths

## Path Conventions

- **Single project**: `public/` for HTML and CSS; no new `src/` files (plan.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: parkrun palette available for all user stories

- [x] T001 Add parkrun `:root` CSS variables (--parkrun-aubergine, --parkrun-apricot, --parkrun-white, --parkrun-black, --parkrun-grey, --parkrun-light-grey) to public/style.css per spec and data-model.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Layout and skip-link target so US1 (header with skip link) can be completed

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Ensure body in public/style.css uses display:flex, flex-direction:column, min-height:100vh for sticky footer per plan
- [x] T003 [P] Ensure an element with id="content" exists in public/index.html for skip link target (e.g. on <main> or inner wrapper per contracts/header-footer-contracts.md)

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 — Header with App Branding and Actions (Priority: P1) — MVP

**Goal**: User sees a header with breadcrumb, title, subtitle, and primary actions (e.g. Add Prospect); shared parkrun palette; skip link for keyboard users; responsive header.

**Independent Test**: Header visible on load with correct branding; breadcrumb present (johnsy.com → parkrun utilities → Ambassy); skip link first focusable and targets main content; Add Prospect and other action buttons visible and keyboard accessible; header stacks on mobile.

### Implementation for User Story 1

- [x] T004 [US1] Add skip link as first child of body: `<a class="skip-link" href="#content">Skip to main content</a>` in public/index.html
- [x] T005 [US1] Add .skip-link styles (off-screen until :focus/:focus-visible, apricot background, per eventuate/pr-by-pt) to public/style.css per contracts/header-footer-contracts.md
- [x] T006 [US1] Add `<nav class="breadcrumbs" aria-label="Breadcrumb">` as first child of `<header>` in public/index.html with trail: johnsy.com link, separator, parkrun utilities link, separator, `<span aria-current="page">Ambassy</span>` per contracts
- [x] T007 [US1] Add .breadcrumbs styles (pill, apricot links, current page white) to public/style.css per research.md and eventuate/foretoken pattern
- [x] T008 [US1] Update header styles in public/style.css to use var(--parkrun-aubergine) background and var(--parkrun-white) text; ensure flexbox layout (title left, actions right)
- [x] T009 [US1] Add header responsive styles in public/style.css (stack vertically on mobile at 768px/480px breakpoints per spec)

**Checkpoint**: User Story 1 complete — header with breadcrumb, skip link, and actions; parkrun palette; responsive.

---

## Phase 4: User Story 2 — Footer with Metadata (Priority: P1)

**Goal**: User sees a footer with version, author, and license in one paragraph; parkrun palette; links open in new tab with security attributes.

**Independent Test**: Footer visible at bottom; single paragraph with changelog link, author link, GitHub link, license text; links have target="_blank" and rel="noopener noreferrer"; keyboard accessible.

### Implementation for User Story 2

- [x] T010 [US2] Update footer content in public/index.html to single paragraph: version (link to changelog), author Pete Johns (link to website), @johnsyweb (link to GitHub), license text per spec
- [x] T011 [US2] Add target="_blank" and rel="noopener noreferrer" to all footer external links in public/index.html
- [x] T012 [US2] Update footer styles in public/style.css to use var(--parkrun-aubergine), var(--parkrun-white), var(--parkrun-apricot) for links; centred text; single paragraph layout

**Checkpoint**: User Story 2 complete — footer with correct content and secure links.

---

## Phase 5: User Story 3 — Layout Structure (Priority: P1)

**Goal**: Header and footer integrate with existing layout; full-width breakout when embedded; main content padding; dialogs above header/footer; responsive.

**Independent Test**: Introduction and map/table views still work; main content has padding; header scrolls with page; dialogs display above header/footer; layout adapts to viewport.

### Implementation for User Story 3

- [x] T013 [US3] Add full-width breakout CSS for header and footer in public/style.css (width:100vw; position:relative; left:50%; margin-left:-50vw; margin-right:-50vw; box-sizing:border-box) per spec
- [x] T014 [US3] Add main content area padding in public/style.css so content does not overlap header/footer
- [x] T015 [US3] Ensure dialogs in public/index.html or public/style.css have z-index above header/footer (e.g. 1000+) per spec
- [x] T016 [US3] Add or verify responsive layout for header, footer, and content in public/style.css at 768px and 480px per spec

**Checkpoint**: All three user stories complete — layout integrated and responsive.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Theme, typography, and quality gates

- [x] T017 [P] Set theme-color meta to #4c1a57 in public/index.html per quickstart.md
- [x] T018 Ensure body font-family in public/style.css includes Atkinson Hyperlegible and fallback stack (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif) per spec
- [x] T019 Run pnpm run lint and pnpm test; fix any regressions (Success Criteria: all existing tests pass)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 — header, skip link, breadcrumb
- **Phase 4 (US2)**: Depends on Phase 2 — footer (can run in parallel with US1 after Phase 2 if desired)
- **Phase 5 (US3)**: Depends on Phase 3 and 4 — layout integration
- **Phase 6 (Polish)**: Depends on Phase 5

### User Story Dependencies

- **US1 (Header)**: After Phase 2 — no dependency on US2/US3
- **US2 (Footer)**: After Phase 2 — no dependency on US1/US3
- **US3 (Layout)**: After US1 and US2 — full-width breakout and padding apply to header/footer from US1/US2

### Within Each User Story

- HTML structure before CSS (e.g. T004 before T005, T006 before T007)
- Story checkpoint before moving to next

### Parallel Opportunities

- T002 and T003 (Phase 2) — different files
- T017 (Phase 6) — single-file change
- After Phase 2, US1 and US2 can be implemented in parallel (different sections of index.html and style.css)

---

## Parallel Example: After Phase 2

```text
# Option A: Sequential by story
T004 → T005 → T006 → T007 → T008 → T009   (US1)
T010 → T011 → T012                         (US2)
T013 → T014 → T015 → T016                  (US3)

# Option B: US1 and US2 in parallel (different files/sections)
Developer A: T004, T005, T006, T007, T008, T009 (US1)
Developer B: T010, T011, T012 (US2)
Then: T013–T016 (US3), then T017–T019 (Polish)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: T001 (palette)
2. Complete Phase 2: T002, T003 (layout + content target)
3. Complete Phase 3: T004–T009 (header, skip link, breadcrumb)
4. **STOP and VALIDATE**: Manual check — header, breadcrumb, skip link, actions
5. Then add US2 (footer) and US3 (layout), then Polish

### Incremental Delivery

1. Phase 1 + 2 → palette and layout ready
2. Phase 3 (US1) → Header with breadcrumb and skip link (MVP)
3. Phase 4 (US2) → Footer
4. Phase 5 (US3) → Full-width breakout and responsive
5. Phase 6 → theme-color, typography, lint/test

---

## Notes

- [P] = different files or no dependencies; safe to run in parallel
- [USn] = task belongs to that user story for traceability
- No new `src/` files; all changes in public/index.html and public/style.css
- Commit after each task or logical group; conventional commits
- README: update only if setup or usage changes (spec says keep up-to-date)
