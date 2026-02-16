# Contracts: Header and Footer (DOM & Accessibility)

**Feature**: 013-header-footer  
**Date**: 2026-02-17  
**Phase**: 1 — Design & Contracts

This document defines the DOM structure and accessibility contracts for the header, footer, skip link, and breadcrumb. Tests and implementation must satisfy these contracts.

---

## 1. Skip Link

### DOM

- **Element**: `<a>` with class or id that styles it as the skip link (e.g. `class="skip-link"`).
- **Position**: First focusable element in the document (typically first child of `<body>` or direct after `<body>`).
- **Content**: Visible text “Skip to main content” (Australian English).
- **Attribute**: `href` must point to the main content target (e.g. `#content`).

### Accessibility

- **Focus**: Link must be visually off-screen until it receives focus (e.g. `transform: translateY(-200%)`), then visible (e.g. `:focus` / `:focus-visible` restores position).
- **Keyboard**: Must be reachable with Tab (first tab stop) and activatable with Enter.
- **Target**: The target of `href` (e.g. `<main id="content">`) must exist so focus moves to main content when the link is activated.

### Contract (testable)

- There is exactly one element with the skip-link class (or equivalent) that is an `<a>`.
- The `<a>` has `href` value ending with `#content` (or the agreed main content id).
- The document contains an element with that id (e.g. `<main id="content">`).
- When the skip link is focused, it is visible (not clipped or off-screen in a way that fails WCAG).

---

## 2. Breadcrumb Navigation

### DOM

- **Container**: `<nav>` with `aria-label="Breadcrumb"` and class for styling (e.g. `class="breadcrumbs"`).
- **Trail**: In order:
  1. Link: “johnsy.com”, `href="https://www.johnsy.com/"`
  2. Separator: `<span aria-hidden="true">/</span>`
  3. Link: “parkrun utilities”, `href="https://www.johnsy.com/parkrun-utilities/"`
  4. Separator: `<span aria-hidden="true">/</span>`
  5. Current page: `<span aria-current="page">Ambassy</span>` (no link).

### Accessibility

- **Semantics**: `<nav>` with `aria-label="Breadcrumb"`.
- **Current page**: Current segment must have `aria-current="page"`.
- **Decorative separators**: Separators must have `aria-hidden="true"`.
- **Keyboard**: All links in the breadcrumb must be focusable and activatable with Enter.

### Contract (testable)

- There is exactly one `<nav>` with `aria-label="Breadcrumb"`.
- The nav contains two `<a>` elements (johnsy.com, parkrun utilities) and one `<span aria-current="page">` with text “Ambassy”.
- The first link has `href="https://www.johnsy.com/"`; the second has `href="https://www.johnsy.com/parkrun-utilities/"`.
- All separator spans have `aria-hidden="true"`.

---

## 3. Header

### DOM

- **Element**: `<header>` (semantic).
- **Contents** (order): Breadcrumb nav (see §2), then title block (e.g. h1 “Ambassy”, subtitle “A tool for parkrun Regional Event Ambassadors”), then actions (e.g. “Add Prospect” button with existing id `addProspectButton` for JS).
- **Styling**: Background `var(--parkrun-aubergine)` (or `#4c1a57`), text `var(--parkrun-white)`.

### Full-Width Breakout

- When the app is inside a constrained wrapper, header (and footer) must span full viewport width. CSS must include the breakout pattern (e.g. `width: 100vw; position: relative; left: 50%; margin-left: -50vw; margin-right: -50vw; box-sizing: border-box`).

### Accessibility

- **Heading**: Exactly one `<h1>` with text “Ambassy”.
- **Actions**: Buttons must be keyboard focusable and activatable (Tab, Enter/Space).
- **Contrast**: Background and text must meet WCAG AA.

### Contract (testable)

- There is exactly one `<header>`.
- The header contains an `<h1>` with text “Ambassy” and a subtitle containing “Regional Event Ambassadors”.
- The header contains a button or link that represents “Add Prospect” (e.g. id `addProspectButton` or accessible name).
- Header background uses `--parkrun-aubergine` or `#4c1a57`.

---

## 4. Footer

### DOM

- **Element**: `<footer>` (semantic).
- **Content**: Single paragraph only. Must include:
  - App name and version as a link to changelog (e.g. GitHub CHANGELOG.md).
  - Author “Pete Johns” with link to website (e.g. https://www.johnsy.com).
  - GitHub handle “@johnsyweb” with link to GitHub (e.g. https://github.com/johnsyweb).
  - License text: “Licensed under MIT. Not officially associated with parkrun. Written by parkrun volunteers for parkrun volunteers.”
- **Styling**: Background `var(--parkrun-aubergine)`, text `var(--parkrun-white)`, links `var(--parkrun-apricot)`.

### Links

- All external links must have `target="_blank"` and `rel="noopener noreferrer"`.

### Accessibility

- Links must be keyboard focusable and activatable.
- Contrast for text and links must meet WCAG AA.

### Contract (testable)

- There is exactly one `<footer>`.
- The footer contains exactly one `<p>` (no second paragraph).
- The footer includes at least one link to a changelog (e.g. CHANGELOG.md), one to author website, and one to GitHub.
- All footer links that open externally have `target="_blank"` and `rel="noopener noreferrer"`.
- Footer background uses `--parkrun-aubergine` or `#4c1a57`; link colour uses `--parkrun-apricot` or `#f7a541`.

---

## 5. Main Content Target

### DOM

- **Element**: `<main>` with `id="content"` (or the id used by the skip link).
- **Contents**: Existing app content (introduction, map, tables, etc.). No structural change beyond wrapping if needed.

### Contract (testable)

- There is exactly one `<main>` with `id="content"` (or the id referenced by the skip link `href`).

---

## 6. Colour Variables (:root)

The following variables must be defined in the stylesheet used by the page (e.g. `public/style.css`):

- `--parkrun-aubergine: #4c1a57`
- `--parkrun-apricot: #f7a541`
- `--parkrun-white: #ffffff`
- `--parkrun-black: #000000`
- `--parkrun-grey: #666666`
- `--parkrun-light-grey: #f5f5f5`

Contract (testable): Either in a test that parses CSS, or by visual/regression tests that assert header/footer and breadcrumb use these values. Implementation must not use different hex values for header/footer background or breadcrumb/link accent.
