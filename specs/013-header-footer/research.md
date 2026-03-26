# Research: Header and Footer with Shared Palette and Breadcrumbs

**Feature**: 013-header-footer  
**Date**: 2026-02-17  
**Phase**: 0 — Outline & Research

## Overview

All design decisions were resolved via spec clarifications (Session 2026-02-17). This document records the chosen approach and rationale so the implementation matches eventuate, foretoken, and pr-by-pt.

---

## 1. Colour Palette

**Decision**: Use the parkrun colour palette for header and footer (same as eventuate, foretoken, pr-by-pt).

**Rationale**: User requirement to “use the same palette” across the four apps. Shared palette improves consistency and reduces cognitive load when switching between tools.

**Implementation**: Define CSS custom properties in `:root` (e.g. in `public/style.css`):
- `--parkrun-aubergine: #4c1a57` (header/footer background)
- `--parkrun-apricot: #f7a541` (links, emphasis, breadcrumb links)
- `--parkrun-white: #ffffff`, `--parkrun-black: #000000`, `--parkrun-grey: #666666`, `--parkrun-light-grey: #f5f5f5`

**Alternatives considered**: Keeping MD4 for Ambassy only was rejected so all four apps share one palette.

---

## 2. Breadcrumb Approach

**Decision**: Add a breadcrumb nav in the header with trail: johnsy.com → parkrun utilities → Ambassy (current page). Use the same structure and styling as eventuate, foretoken, and pr-by-pt.

**Rationale**: Spec requires “same breadcrumb approach”. Sibling apps use `<nav class="breadcrumbs" aria-label="Breadcrumb">`, `/` separators with `aria-hidden="true"`, and current page with `aria-current="page"`. Breadcrumb pill uses semi-transparent background and accent (apricot) links.

**Implementation**: In `public/index.html`, inside `<header>`, add `<nav class="breadcrumbs" aria-label="Breadcrumb">` with:
- `<a href="https://www.johnsy.com/">johnsy.com</a>`
- `<span aria-hidden="true">/</span>`
- `<a href="https://www.johnsy.com/parkrun-utilities/">parkrun utilities</a>`
- `<span aria-hidden="true">/</span>`
- `<span aria-current="page">Ambassy</span>`

In `public/style.css`, add `.breadcrumbs` styles matching eventuate/pr-by-pt (flex, gap, pill background `rgba(255,255,255,0.12)`, apricot links, current page white/bold).

**Alternatives considered**: Omitting breadcrumbs was rejected; sub-page breadcrumb segments deferred (single-page app).

---

## 3. Skip Link

**Decision**: Include a “Skip to main content” link with the same pattern as eventuate and pr-by-pt.

**Rationale**: Accessibility and consistency. Off-screen until focused, then visible; apricot background; `href` targets main content (e.g. `#content` or `id` on `<main>`).

**Implementation**: First focusable element in document; `position: absolute; transform: translateY(-200%);` (or equivalent) until `:focus`/`:focus-visible`; link to `<main id="content">`. Match eventuate/pr-by-pt CSS for `.skip-link`.

**Alternatives considered**: No skip link was rejected for consistency and WCAG alignment.

---

## 4. Full-Width Breakout

**Decision**: Apply full-width breakout to header and footer so they span the viewport when the app is embedded in a constrained wrapper (e.g. on johnsy.com).

**Rationale**: Spec clarification (Option A). Matches eventuate docs pattern so header/footer are not limited by a centred content column.

**Implementation**: In CSS, for header and footer (or shared class):
- `width: 100vw; position: relative; left: 50%; margin-left: -50vw; margin-right: -50vw; box-sizing: border-box;`

**Alternatives considered**: Omitting breakout was rejected so embedded layout is supported from day one.

---

## 5. Typography

**Decision**: Use Atkinson Hyperlegible as the primary font for the app (including header and footer), with the same fallback stack as eventuate, foretoken, and pr-by-pt.

**Rationale**: Spec clarification (Option A). Ambassy already loads Atkinson Hyperlegible in `index.html`; body font in `style.css` already references it. Ensure header/footer inherit and fallback stack matches (e.g. `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, sans-serif).

**Implementation**: No new font loading; confirm `body` (or global) `font-family` includes `"Atkinson Hyperlegible"` and the standard fallbacks. No change to `src/` required.

**Alternatives considered**: Leaving font unspecified was rejected for consistency across the four apps.

---

## 6. Footer Structure

**Decision**: Single paragraph only (foretoken/pr-by-pt style): version, author, license. No second paragraph (e.g. “Hosted by GitHub”).

**Rationale**: Spec clarification (Option B). Ambassy is a standalone app like foretoken/pr-by-pt; the extra line is more relevant to Jekyll-hosted docs (eventuate).

**Implementation**: One `<p>` in footer containing app name + version link, author link, GitHub link, and license text. Centred. No second `<p>`.

**Alternatives considered**: Two paragraphs (eventuate-style) was rejected.

---

## Summary Table

| Topic           | Decision                          | Source        |
|----------------|------------------------------------|---------------|
| Palette        | parkrun CSS variables in `:root`   | Clarification |
| Breadcrumb     | Same structure + pill styling      | Spec + apps   |
| Skip link      | Yes, same pattern as eventuate    | Clarification |
| Full-width     | Yes, breakout CSS                  | Clarification |
| Font           | Atkinson Hyperlegible + fallbacks  | Clarification |
| Footer         | Single paragraph                   | Clarification |

All NEEDS CLARIFICATION items are resolved. Proceed to Phase 1.
