# Feature Specification: Header and Footer with MD4 Color Scheme

**Feature Branch**: `013-header-footer`  
**Created**: 2026-01-18  
**Status**: Complete  
**Input**: User request: "Oh, I like it, especially with the buttons in the top bar. Let's build this as 013."

## Overview

Add a header and footer to Ambassy similar to the Foretoken app structure, but using the MD4 color scheme instead of parkrun brand colors. The header will include the app title, subtitle, and action buttons. The footer will include version information, author credits, and license information.

## Clarifications

### Session 2026-01-18

- Q: Should the header be fixed at the top or scroll naturally with page content? → A: Header scrolls naturally with page content (Option B)

## Design Inspiration

Based on the Foretoken app (`../foretoken/`), which has:
- A header with app name, subtitle, and action buttons
- A footer with version, author, and license information
- parkrun brand colors (aubergine `#4c1a57`)

This feature will adapt that structure using MD4 colors:
- Header: `#0d2b33` (deep teal-blue from MD4 palette)
- Footer: `#30403d` (dark green-grey from MD4 palette)
- Accent colors: `#3d9df2` (bright blue) for links, `#ffcc00` (bright yellow) for emphasis

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Header with App Branding and Actions (Priority: P1)

A user viewing Ambassy should see a clear header at the top of the page that identifies the application and provides quick access to primary actions.

**Why this priority**: The header provides visual branding, improves navigation, and makes primary actions more discoverable. It establishes a professional appearance consistent with modern web applications.

**Independent Test**: Can be fully tested by verifying the header appears on page load, displays correct branding, and action buttons are functional and accessible.

**Acceptance Scenarios**:

1. **Given** a user loads Ambassy, **When** the page renders, **Then** a header is visible at the top with "Ambassy" as the title and "A tool for parkrun Regional Event Ambassadors" as the subtitle
2. **Given** the header is displayed, **When** the user views it, **Then** it uses the MD4 color scheme (`#0d2b33` background, white text)
3. **Given** the header contains action buttons, **When** the user views it, **Then** the "📍 Add Prospect" button is visible and accessible
4. **Given** action buttons in the header, **When** the user interacts with them, **Then** they are keyboard accessible (Tab navigation, Enter/Space activation)
5. **Given** the header is displayed, **When** the user views it on mobile, **Then** it adapts responsively (stacked layout, appropriate sizing)

---

### User Story 2 - Footer with Metadata (Priority: P1)

A user viewing Ambassy should see a footer at the bottom of the page that provides version information, author credits, and license information.

**Why this priority**: The footer provides transparency about the application's version, authorship, and licensing. It's a standard web pattern that users expect and helps establish trust.

**Independent Test**: Can be fully tested by verifying the footer appears at the bottom, displays correct information, and links are functional.

**Acceptance Scenarios**:

1. **Given** a user loads Ambassy, **When** the page renders, **Then** a footer is visible at the bottom with version, author, and license information
2. **Given** the footer is displayed, **When** the user views it, **Then** it uses the MD4 color scheme (`#30403d` background, white text, `#3d9df2` for links, `#ffcc00` for emphasis)
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

- **Background color**: `#0d2b33` (MD4 deep teal-blue)
- **Text color**: White (`#ffffff`)
- **Content**: 
  - App title: "Ambassy"
  - Subtitle: "A tool for parkrun Regional Event Ambassadors"
  - Action buttons: "📍 Add Prospect" (existing functionality), potentially other actions
- **Layout**: Flexbox with title on left, actions on right
- **Responsive**: Stack vertically on mobile, horizontal on desktop
- **Accessibility**: Proper heading hierarchy, ARIA labels, keyboard navigation

### Footer Requirements

- **Background color**: `#30403d` (MD4 dark green-grey)
- **Text color**: White (`#ffffff`)
- **Link color**: `#3d9df2` (MD4 bright blue)
- **Emphasis color**: `#ffcc00` (MD4 bright yellow) for version/app name
- **Content**:
  - App name and version (link to changelog)
  - Author: "Pete Johns" (link to website)
  - GitHub handle: "@johnsyweb" (link to GitHub)
  - License: "Licensed under MIT. Not officially associated with parkrun. Written by parkrun volunteers for parkrun volunteers."
- **Layout**: Centered text, multiple paragraphs
- **Responsive**: Appropriate font sizing and padding on mobile
- **Accessibility**: Proper link attributes (`target="_blank"`, `rel="noopener noreferrer"`)

### Layout Integration

- Use flexbox layout to ensure footer stays at bottom
- Header scrolls naturally with page content (not fixed)
- Main content area should have appropriate padding to avoid overlap
- Existing dialogs should maintain proper z-index above header/footer
- Introduction section should integrate smoothly with new layout

### Color Scheme

All colors must come from the MD4 palette defined in `src/actions/colorPalette.ts`:
- Primary header: `#0d2b33`
- Primary footer: `#30403d`
- Accent (links): `#3d9df2`
- Accent (emphasis): `#ffcc00`

### Accessibility

- Semantic HTML (`<header>`, `<footer>`, `<nav>`)
- Proper heading hierarchy
- ARIA labels where appropriate
- Keyboard navigation support
- Focus indicators
- Color contrast ratios meet WCAG AA standards

### Responsive Design

- Mobile-first approach
- Breakpoints: 768px (tablet), 480px (mobile)
- Header stacks vertically on mobile
- Footer text adjusts size on mobile
- Touch-friendly button sizes

---

## Out of Scope

- Changing existing color schemes in tables, maps, or dialogs (only header/footer use MD4)
- Adding new functionality to action buttons (only moving existing "Add Prospect" button)
- Modifying existing introduction section content (only layout integration)
- Dark mode support (can be added later if needed)
- User preferences for header/footer visibility

---

## Success Criteria

- ✅ Header displays with MD4 color scheme and correct branding
- ✅ Footer displays with MD4 color scheme and correct metadata
- ✅ Action buttons in header are functional and accessible
- ✅ Footer links are functional and secure
- ✅ Layout integrates seamlessly with existing features
- ✅ Responsive design works on mobile, tablet, and desktop
- ✅ Accessibility requirements met (keyboard navigation, ARIA, contrast)
- ✅ All existing tests pass
- ✅ Code follows project Constitution and coding standards
