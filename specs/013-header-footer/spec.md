# Feature Specification: Header and Footer with Shared Palette and Breadcrumbs

**Feature Branch**: `013-header-footer`  
**Created**: 2026-01-18  
**Status**: Complete  
**Input**: User request: "Oh, I like it, especially with the buttons in the top bar. Let's build this as 013."

## Overview

Add a header and footer to Ambassy using the same palette and breadcrumb approach as eventuate, foretoken, and pr-by-pt. The header will include a breadcrumb nav, app title, subtitle, and action buttons. The footer will include version information, author credits, and license information.

## Clarifications

### Session 2026-01-18

- Q: Should the header be fixed at the top or scroll naturally with page content? → A: Header scrolls naturally with page content (Option B)

### Session 2026-02-17

- Q: Should Ambassy use the same colour palette as eventuate, foretoken, and pr-by-pt for header/footer, or keep MD4? → A: Use parkrun palette for header/footer (Option A) so all four apps share the same palette
- Q: Should Ambassy include a skip link (e.g. "Skip to main content") like eventuate/pr-by-pt? → A: Yes, include skip link with same pattern as eventuate/pr-by-pt (Option A)
- Q: Should the spec require full-width breakout for header/footer (like eventuate docs) so they span viewport when embedded? → A: Yes, specify full-width breakout (Option A)
- Q: Should header/footer (or app) use Atkinson Hyperlegible to match eventuate, foretoken, pr-by-pt? → A: Yes, use Atkinson Hyperlegible with same fallback stack (Option A)
- Q: Footer: one paragraph (foretoken/pr-by-pt) or two (eventuate with "Hosted by GitHub")? → A: Single paragraph — version, author, license only (Option B)

## Design Inspiration

Eventuate, foretoken, and pr-by-pt share:
- A header with breadcrumb nav (johnsy.com → parkrun utilities → app name), app name, subtitle, and action buttons
- A footer with version, author, and license information
- The same parkrun colour palette: CSS variables in `:root` (e.g. `--parkrun-aubergine: #4c1a57`, `--parkrun-apricot: #f7a541`, `--parkrun-white`, `--parkrun-black`, `--parkrun-grey`, `--parkrun-light-grey`)

Ambassy will use the same palette and breadcrumb approach:
- Header: aubergine background, white text; breadcrumb pill with apricot links
- Footer: aubergine background, white text, apricot for links and emphasis

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Header with App Branding and Actions (Priority: P1)

A user viewing Ambassy should see a clear header at the top of the page that identifies the application and provides quick access to primary actions.

**Why this priority**: The header provides visual branding, improves navigation, and makes primary actions more discoverable. It establishes a professional appearance consistent with modern web applications.

**Independent Test**: Can be fully tested by verifying the header appears on page load, displays correct branding, and action buttons are functional and accessible.

**Acceptance Scenarios**:

1. **Given** a user loads Ambassy, **When** the page renders, **Then** a header is visible at the top with "Ambassy" as the title and "A tool for parkrun Regional Event Ambassadors" as the subtitle
2. **Given** the header is displayed, **When** the user views it, **Then** a breadcrumb nav is present with links to johnsy.com and parkrun utilities, and "Ambassy" as the current page (same approach as eventuate, foretoken, pr-by-pt)
3. **Given** the header is displayed, **When** the user views it, **Then** it uses the shared parkrun palette (aubergine background, white text)
4. **Given** the header contains action buttons, **When** the user views it, **Then** the "📍 Add Prospect" button is visible and accessible
5. **Given** action buttons in the header, **When** the user interacts with them, **Then** they are keyboard accessible (Tab navigation, Enter/Space activation)
6. **Given** the header is displayed, **When** the user views it on mobile, **Then** it adapts responsively (stacked layout, appropriate sizing)
7. **Given** the page has loaded, **When** a keyboard user focuses the first focusable element (skip link), **Then** "Skip to main content" is visible and activates the main content target

---

### User Story 2 - Footer with Metadata (Priority: P1)

A user viewing Ambassy should see a footer at the bottom of the page that provides version information, author credits, and license information.

**Why this priority**: The footer provides transparency about the application's version, authorship, and licensing. It's a standard web pattern that users expect and helps establish trust.

**Independent Test**: Can be fully tested by verifying the footer appears at the bottom, displays correct information, and links are functional.

**Acceptance Scenarios**:

1. **Given** a user loads Ambassy, **When** the page renders, **Then** a footer is visible at the bottom with version, author, and license information
2. **Given** the footer is displayed, **When** the user views it, **Then** it uses the shared parkrun palette (aubergine background, white text, apricot for links and emphasis)
3. **Given** the footer contains links, **When** the user views it, **Then** links to GitHub, author website, and changelog are present and functional
4. **Given** footer links, **When** the user interacts with them, **Then** they are keyboard accessible and open in new tabs with appropriate security attributes
5. **Given** the footer is displayed, **When** the user views it on mobile, **Then** it adapts responsively (appropriate font sizing, padding)

---

### User Story 3 - Layout Structure (Priority: P1)

The header and footer should integrate seamlessly with the existing Ambassy layout without breaking current functionality.

**Why this priority**: The new header and footer must not disrupt existing features like the map, tables, dialogs, or introduction section. The layout should maintain proper spacing and scrolling behavior.

**Independent Test**: Can be fully tested by verifying all existing features work correctly with the new header/footer, and the layout maintains proper structure.

**Acceptance Scenarios**:

1. **Given** the header and footer are added, **When** the page loads, **Then** the existing introduction section and map/table views remain functional
2. **Given** the new layout structure, **When** content is displayed, **Then** the main content area has appropriate padding and doesn't overlap with header/footer
3. **Given** the page has scrollable content, **When** the user scrolls, **Then** the header scrolls naturally with the page content
4. **Given** dialogs are opened, **When** they appear, **Then** they display correctly above the header/footer with proper z-index
5. **Given** the layout is viewed on different screen sizes, **When** the viewport changes, **Then** the header, footer, and content adapt responsively

---

## Technical Requirements

### Header Requirements

- **Background color**: `var(--parkrun-aubergine)` (`#4c1a57`) — same as eventuate, foretoken, pr-by-pt
- **Text color**: `var(--parkrun-white)` (`#ffffff`)
- **Content**:
  - Breadcrumb nav: `johnsy.com` → `parkrun utilities` → `Ambassy` (current page), with `aria-label="Breadcrumb"`, separators `aria-hidden="true"`, current page `aria-current="page"`
  - App title: "Ambassy"
  - Subtitle: "A tool for parkrun Regional Event Ambassadors"
  - Action buttons: "📍 Add Prospect" (existing functionality), potentially other actions
- **Layout**: Flexbox with title on left, actions on right
- **Responsive**: Stack vertically on mobile, horizontal on desktop
- **Accessibility**: Proper heading hierarchy, ARIA labels, keyboard navigation

### Footer Requirements

- **Background color**: `var(--parkrun-aubergine)` — same as header and other apps
- **Text color**: `var(--parkrun-white)`
- **Link and emphasis color**: `var(--parkrun-apricot)` for links and version/app name
- **Content**: Single paragraph (foretoken/pr-by-pt style), containing:
  - App name and version (link to changelog)
  - Author: "Pete Johns" (link to website)
  - GitHub handle: "@johnsyweb" (link to GitHub)
  - License: "Licensed under MIT. Not officially associated with parkrun. Written by parkrun volunteers for parkrun volunteers."
- **Layout**: Centred text, one paragraph only (no second "Hosted by" / tech line)
- **Responsive**: Appropriate font sizing and padding on mobile
- **Accessibility**: Proper link attributes (`target="_blank"`, `rel="noopener noreferrer"`)

### Layout Integration

- Use flexbox layout to ensure footer stays at bottom
- Header scrolls naturally with page content (not fixed)
- Main content area should have appropriate padding to avoid overlap
- Existing dialogs should maintain proper z-index above header/footer
- Introduction section should integrate smoothly with new layout
- **Full-width breakout**: Header and footer must span full viewport when the app is inside a constrained wrapper (e.g. embedded on johnsy.com). Use the same pattern as eventuate docs: `width: 100vw`, `position: relative`, `left: 50%`, `margin-left: -50vw`, `margin-right: -50vw`, `box-sizing: border-box` so header/footer break out of a centred content column.

### Color Scheme

Header and footer must use the same parkrun palette as eventuate, foretoken, and pr-by-pt. Define in `:root` (e.g. in global CSS):
- `--parkrun-aubergine: #4c1a57` (header/footer background)
- `--parkrun-apricot: #f7a541` (links, emphasis, breadcrumb links)
- `--parkrun-white: #ffffff`
- `--parkrun-black: #000000`
- `--parkrun-grey: #666666`
- `--parkrun-light-grey: #f5f5f5`

Existing map/table colours (e.g. from `src/actions/colorPalette.ts`) are unchanged.

### Accessibility

- **Skip link**: Include a "Skip to main content" link (same pattern as eventuate/pr-by-pt): off-screen until focused, apricot background, links to main content id; keyboard users can bypass header
- Semantic HTML (`<header>`, `<footer>`, `<nav>`)
- Proper heading hierarchy
- ARIA labels where appropriate
- Keyboard navigation support
- Focus indicators
- Color contrast ratios meet WCAG AA standards

### Typography

- Use **Atkinson Hyperlegible** as the primary font for the app (including header and footer), with the same fallback stack as eventuate, foretoken, and pr-by-pt (e.g. `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, sans-serif). Ensures visual and accessibility consistency across the four apps.

### Responsive Design

- Mobile-first approach
- Breakpoints: 768px (tablet), 480px (mobile)
- Header stacks vertically on mobile
- Footer text adjusts size on mobile
- Touch-friendly button sizes

---

## Out of Scope

- Changing existing color schemes in tables, maps, or dialogs (only header/footer use the shared parkrun palette)
- Adding new functionality to action buttons (only moving existing "Add Prospect" button)
- Modifying existing introduction section content (only layout integration)
- Dark mode support (can be added later if needed)
- User preferences for header/footer visibility

---

## Success Criteria

- ✅ Header displays with shared parkrun palette and correct branding (including breadcrumb)
- ✅ Footer displays with shared parkrun palette and correct metadata
- ✅ Action buttons in header are functional and accessible
- ✅ Footer links are functional and secure
- ✅ Layout integrates seamlessly with existing features
- ✅ Responsive design works on mobile, tablet, and desktop
- ✅ Accessibility requirements met (keyboard navigation, ARIA, contrast)
- ✅ All existing tests pass
- ✅ Code follows project Constitution and coding standards
