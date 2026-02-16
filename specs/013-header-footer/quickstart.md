# Quickstart: Header and Footer with Shared Palette and Breadcrumbs

**Feature**: 013-header-footer  
**Date**: 2026-02-17

## Overview

Ambassy uses the same header and footer approach as eventuate, foretoken, and pr-by-pt:

- **Header**: Skip link, breadcrumb (johnsy.com → parkrun utilities → Ambassy), app title, subtitle, and primary actions (e.g. Add Prospect).
- **Footer**: Single paragraph with version (changelog link), author, GitHub, and license.
- **Palette**: Parkrun colours via CSS variables (aubergine, apricot, white, etc.).
- **Typography**: Atkinson Hyperlegible with standard fallbacks.
- **Layout**: Full-width breakout for header/footer when embedded; main content in `<main id="content">` for skip-link target.

## User Guide

### Skip Link

- **Keyboard**: Press Tab once after load; the first focusable element is “Skip to main content”. Activate it to move focus to the main content and skip the header.
- **Mouse**: Skip link is off-screen until focused; use Tab to focus it if needed.

### Breadcrumb

- **Purpose**: Shows where Ambassy sits in the site (johnsy.com → parkrun utilities → Ambassy).
- **Links**: “johnsy.com” and “parkrun utilities” open in the same tab (site navigation). “Ambassy” is the current page and is not a link.

### Header Actions

- **Add Prospect**: Same behaviour as before; the button lives in the header for quick access. Fully keyboard accessible (Tab, Enter/Space).

### Footer

- **Version**: Links to the project’s CHANGELOG (e.g. on GitHub).
- **Author**: Pete Johns, with link to website and GitHub handle @johnsyweb.
- **License**: MIT; not officially associated with parkrun; written by parkrun volunteers for parkrun volunteers.
- **Links**: Open in a new tab with `rel="noopener noreferrer"`.

## Developer Guide

### Files to Modify

- **`public/index.html`**: Add skip link, `<header>` (breadcrumb + title + actions), wrap main content in `<main id="content">`, add `<footer>` with single paragraph.
- **`public/style.css`**: Add `:root` parkrun variables, `.skip-link`, `.breadcrumbs`, header and footer styles, full-width breakout for header/footer. Ensure body uses Atkinson Hyperlegible and fallbacks.

### Reference Implementations

- **Breadcrumb + skip link + palette**: `../eventuate/docs/style.css`, `../eventuate/docs/_layouts/default.html`
- **Header/footer structure**: `../foretoken/src/App.tsx`, `../foretoken/src/App.css`
- **Full-width breakout**: eventuate `#header`, `#footer` in `docs/style.css`

### Testing

- **Skip link**: Assert presence, `href="#content"`, and that `<main id="content">` exists; optionally assert visibility on focus.
- **Breadcrumb**: Assert `<nav aria-label="Breadcrumb">`, two links with correct `href`s, and `<span aria-current="page">Ambassy</span>`.
- **Footer**: Assert one paragraph, required links with `target="_blank"` and `rel="noopener noreferrer"`.
- **Palette**: Header/footer and breadcrumb use `var(--parkrun-aubergine)` and `var(--parkrun-apricot)` (or equivalent).

### Theme Colour

Update `<meta name="theme-color">` in `public/index.html` to parkrun aubergine (`#4c1a57`) so browser chrome matches the header.

## Checklist (Implementation)

- [ ] `:root` parkrun variables in `public/style.css`
- [ ] Skip link first in body; links to `#content`; off-screen until focus
- [ ] `<main id="content">` wraps existing content
- [ ] `<header>` with breadcrumb nav, h1, subtitle, Add Prospect button
- [ ] `<footer>` with single paragraph (version, author, GitHub, license)
- [ ] All external footer links: `target="_blank"` and `rel="noopener noreferrer"`
- [ ] Full-width breakout CSS for header and footer
- [ ] Atkinson Hyperlegible (and fallbacks) applied
- [ ] theme-color meta set to `#4c1a57`
