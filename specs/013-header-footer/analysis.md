# Project Analysis: Consistency (013-header-footer)

**Feature**: Header and Footer with Shared Palette and Breadcrumbs  
**Branch**: 013-header-footer  
**Date**: 2026-02-17  
**Scope**: Spec, plan, tasks, contracts, data-model, research, quickstart vs. current implementation (`public/index.html`, `public/style.css`)

---

## 1. Document-to-Document Consistency

### Spec ↔ Plan ↔ Tasks ↔ Contracts ↔ Data-Model ↔ Research ↔ Quickstart

| Area | Status | Notes |
|------|--------|--------|
| Palette | ✅ Consistent | All specify parkrun `:root` variables (aubergine, apricot, white, etc.); no MD4 in design docs |
| Breadcrumb | ✅ Consistent | All specify nav with johnsy.com → parkrun utilities → Ambassy; ARIA and structure aligned |
| Skip link | ✅ Consistent | All specify first focusable element, href="#content", off-screen until focus |
| Footer | ✅ Consistent | Single paragraph; version, author, GitHub, license; links target="_blank" rel="noopener noreferrer" |
| Full-width breakout | ✅ Consistent | Spec, plan, tasks, contracts all require breakout pattern for header/footer |
| Typography | ✅ Consistent | Atkinson Hyperlegible + fallback stack |
| theme-color | ✅ Consistent | quickstart and tasks say #4c1a57 (parkrun aubergine) |

**Verdict**: Design documents are internally consistent. No conflicts between spec, plan, tasks, contracts, data-model, research, or quickstart.

---

## 2. Implementation vs. Design (Gaps and Conflicts)

### 2.1 Colour palette

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| `:root` parkrun variables (e.g. --parkrun-aubergine, --parkrun-apricot) | Not present; style.css uses MD4 comments and hardcoded #0d2b33, #30403d, #3d9df2, #ffcc00 | ❌ **Gap** |
| Header background parkrun aubergine (#4c1a57) | .app-header uses #0d2b33 (MD4) | ❌ **Conflict** |
| Footer background parkrun aubergine | .app-footer uses #30403d (MD4) | ❌ **Conflict** |
| Footer/link accent parkrun apricot (#f7a541) | .app-footer a uses #3d9df2 (MD4 blue); .app-footer strong uses #ffcc00 (MD4 yellow) | ❌ **Conflict** |

**Action**: T001 (add `:root` variables) and T008/T012 (switch header/footer to `var(--parkrun-*)`) resolve this.

---

### 2.2 Skip link

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Skip link as first focusable element in body | No skip link in index.html | ❌ **Missing** |
| Text "Skip to main content", href="#content" | N/A | ❌ **Missing** |
| Off-screen until :focus/:focus-visible; apricot background | N/A | ❌ **Missing** |

**Action**: T004 (add skip link in index.html), T005 (add .skip-link styles).

---

### 2.3 Breadcrumb

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| `<nav class="breadcrumbs" aria-label="Breadcrumb">` as first child of `<header>` | Header has no breadcrumb; first child is .header-content | ❌ **Missing** |
| Trail: johnsy.com → parkrun utilities → Ambassy (aria-current="page") | N/A | ❌ **Missing** |
| .breadcrumbs pill styling (apricot links, etc.) | No .breadcrumbs in style.css | ❌ **Missing** |

**Action**: T006 (add breadcrumb nav in index.html), T007 (add .breadcrumbs styles).

---

### 2.4 Header structure and styles

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Header contains breadcrumb, then title, then actions | Header has title + actions only | ⚠️ **Partial** (missing breadcrumb) |
| parkrun aubergine/white | Uses MD4 #0d2b33 and #ffffff | ❌ **Conflict** (colour only) |
| Flexbox, title left / actions right | Present | ✅ OK |
| Responsive stack on mobile | Present at 768px | ✅ OK |

**Action**: T006 (breadcrumb), T008 (switch to var(--parkrun-aubergine), var(--parkrun-white)).

---

### 2.5 Footer structure and styles

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Single paragraph only | Two paragraphs (version/author/GitHub; then license) | ❌ **Conflict** |
| Version, author, GitHub, license in one paragraph | Content present but split into two `<p>` | ❌ **Conflict** |
| target="_blank" rel="noopener noreferrer" on external links | Present on footer links | ✅ OK |
| parkrun aubergine background, apricot links | MD4 #30403d, #3d9df2, #ffcc00 | ❌ **Conflict** |

**Action**: T010 (single paragraph with all content), T011 (links already have attributes), T012 (footer styles to parkrun variables).

---

### 2.6 Layout and full-width breakout

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Body flex, column, min-height 100vh | Present | ✅ OK |
| Element with id="content" for skip link | `<div id="content">` inside main | ✅ OK |
| Full-width breakout for header/footer | No 100vw / margin-left -50vw pattern in style.css | ❌ **Missing** |
| Main content padding to avoid overlap | .app-main padding: 0 | ⚠️ **Partial** (may need padding per T014) |
| Dialogs z-index above header/footer | Dialogs use z-index: 1000 | ✅ OK |

**Action**: T013 (full-width breakout), T014 (main content padding), T015 (verify z-index).

---

### 2.7 theme-color and typography

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| theme-color meta #4c1a57 (parkrun aubergine) | theme-color #0d2b33 (MD4) in index.html | ❌ **Conflict** |
| Body font Atkinson Hyperlegible + fallback stack | "Atkinson Hyperlegible", Verdana, serif | ⚠️ **Partial** (fallbacks differ; spec: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif) |

**Action**: T017 (theme-color to #4c1a57), T018 (align body font-family with spec fallbacks).

---

## 3. Task Coverage vs. Gaps

| Gap / Conflict | Covered by task(s) |
|----------------|--------------------|
| No :root parkrun variables | T001 |
| No skip link | T004, T005 |
| No breadcrumb | T006, T007 |
| Header/footer MD4 colours | T008, T012 |
| Footer two paragraphs | T010 |
| No full-width breakout | T013 |
| theme-color MD4 | T017 |
| Body font fallbacks | T018 |

All identified implementation gaps are covered by tasks. No missing tasks for consistency.

---

## 4. Constitution and Quality

- **Single responsibility**: Header/footer are presentational; changes confined to public/. ✅  
- **Lint/format**: Not run in this analysis; T019 requires `pnpm run lint` and `pnpm test`.  
- **Australian English**: Spec and contracts use "Licensed", "Centred"; implementation uses "Licensed". ✅  

---

## 5. Summary and Recommendations

### Consistency summary

| Category | Status |
|----------|--------|
| Design docs (spec, plan, tasks, contracts, data-model, research, quickstart) | ✅ Consistent |
| Implementation vs. design | ❌ Multiple gaps and conflicts (palette, skip link, breadcrumb, footer structure, full-width breakout, theme-color, font fallbacks) |

### Root cause

Implementation was done against an earlier spec (MD4 colour scheme, no breadcrumb, no skip link, two footer paragraphs). The spec was later updated (Session 2026-02-17) to parkrun palette, breadcrumb, skip link, single footer paragraph, and full-width breakout. Code was not updated to match.

### Recommendations

1. **Execute tasks in order** (Phase 1 → 2 → 3 → 4 → 5 → 6) so implementation is brought in line with the current spec and contracts.
2. **T001 first**: Add `:root` parkrun variables, then replace all header/footer MD4 hex values with `var(--parkrun-*)` (T008, T012) and remove MD4 comments from style.css.
3. **Footer content (T010)**: Merge the two footer paragraphs into one so the DOM matches the spec and contracts (single paragraph).
4. **Re-run this analysis** after implementation (or after each phase) to confirm no remaining gaps.

### Suggested next step

Proceed with **Implement Project** (e.g. `/speckit.implement`) starting with Phase 1 (T001), then Phase 2 (T002, T003), then Phase 3 (T004–T009), to align the app with the current design.
