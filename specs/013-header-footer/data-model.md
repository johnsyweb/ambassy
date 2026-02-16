# Data Model: Header and Footer with Shared Palette and Breadcrumbs

**Feature**: 013-header-footer  
**Date**: 2026-02-17  
**Phase**: 1 — Design & Contracts

## Overview

This feature is presentational only. It does not introduce new domain entities, state machines, or persistent data. The “model” is the documented UI structure and the shared CSS custom properties used for styling.

## CSS Custom Properties (:root)

Header and footer styling must use the following variables, defined in global CSS (e.g. `public/style.css`).

| Variable | Value | Use |
|----------|--------|-----|
| `--parkrun-aubergine` | `#4c1a57` | Header and footer background |
| `--parkrun-apricot` | `#f7a541` | Links, emphasis, breadcrumb links, skip-link background (focus) |
| `--parkrun-white` | `#ffffff` | Header/footer text, current breadcrumb item |
| `--parkrun-black` | `#000000` | Not used in header/footer; available for body if needed |
| `--parkrun-grey` | `#666666` | Optional secondary text |
| `--parkrun-light-grey` | `#f5f5f5` | Optional page background |

**Validation**: All header and footer colours must reference these variables (or the same hex values) so the app can be rethemed consistently. Existing map/table colours (e.g. from `src/actions/colorPalette.ts`) are unchanged.

## UI Structure (Document Order)

No new TypeScript models or state. The document structure is:

1. **Skip link** — First focusable element; `href` points to main content (e.g. `#content`).
2. **Header** — Contains:
   - Breadcrumb `<nav>` (johnsy.com → parkrun utilities → Ambassy).
   - Title block (h1 “Ambassy”, subtitle paragraph).
   - Actions (e.g. “Add Prospect” button).
3. **Main** — Wraps existing content; has `id="content"` for skip link target.
4. **Footer** — Single paragraph: version (changelog link), author (website), GitHub, license text.

**Relationships**: None. No foreign keys or references. Layout is flexbox so footer stays at bottom when content is short.

## State Transitions

None. Header and footer are static content. No client-side state for this feature beyond existing app behaviour (e.g. Add Prospect button still wired to existing handlers).

## Out of Scope for Data Model

- Map or table data structures
- User preferences for header/footer visibility
- Dynamic breadcrumb segments (future sub-pages would extend the trail)
