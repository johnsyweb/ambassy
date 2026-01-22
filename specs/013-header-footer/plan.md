# Implementation Plan: Header and Footer with MD4 Color Scheme

**Feature**: 013-header-footer  
**Date**: 2026-01-18  
**Status**: Draft

## Summary

This feature adds a header and footer to Ambassy, similar to the Foretoken app structure, but using the MD4 color scheme. The header will contain app branding and action buttons (including moving the "Add Prospect" button from the main content area). The footer will display version information, author credits, and license information.

## Technical Context

### Current Structure

- **HTML**: Single-page application with `#content` (introduction) and `#ambassy` (main app) sections
- **Buttons**: Currently grouped in a flex container within `#ambassy` div (line 340-351)
- **Styling**: Uses `style.css` with existing color scheme
- **Color Palette**: MD4 palette defined in `src/actions/colorPalette.ts` (94 colors)
- **Layout**: No header/footer currently; content flows naturally

### Target Structure

- **Header**: Fixed or natural scroll, contains title, subtitle, and primary action buttons
- **Footer**: Sticky to bottom, contains version, author, license info
- **Main Content**: Wrapped in flex container to ensure footer stays at bottom
- **Colors**: MD4 palette colors (`#0d2b33` header, `#30403d` footer, `#3d9df2` links, `#ffcc00` emphasis)

## Constitution Compliance

- **Single Responsibility**: Header handles branding/navigation, footer handles metadata
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation, proper contrast
- **Australian English**: All text uses Australian English
- **Keyboard Accessible**: All interactive elements keyboard accessible
- **Clean UI**: Professional, consistent, accessible interface
- **No Test Environment Checks**: Tests will test production code

## Project Structure

### Files to Modify

1. **`public/index.html`**
   - Add `<header>` element with branding and buttons
   - Add `<footer>` element with metadata
   - Wrap main content in flex container
   - Move "Add Prospect" button to header (or keep in both places initially)
   - Adjust layout structure

2. **`public/style.css`**
   - Add header styles (MD4 color `#0d2b33`)
   - Add footer styles (MD4 color `#30403d`)
   - Add layout styles (flexbox for sticky footer)
   - Add responsive styles (mobile breakpoints)
   - Add button styles for header actions
   - Ensure proper z-index for dialogs

### Files to Create

None - all changes are to existing HTML/CSS files.

### Dependencies

- MD4 color palette from `src/actions/colorPalette.ts` (for reference, colors are hardcoded in CSS)
- Existing button functionality (no changes to JavaScript)
- Existing dialog z-index system (may need adjustment)

## Research Decisions

### Header Behavior

**Decision**: Header scrolls naturally with content (not fixed)
**Rationale**: 
- Simpler implementation
- Better mobile experience (fixed headers can be problematic on mobile)
- Matches Foretoken pattern
- Can be changed to fixed later if needed

### Button Placement

**Decision**: Move "Add Prospect" button to header, keep other buttons in main content area
**Rationale**:
- "Add Prospect" is a primary action that benefits from prominent placement
- Other buttons (Share, Import, Add EA/REA, Configure, Purge) are secondary actions
- Keeps header clean and focused
- Can add more buttons to header later if needed

### Color Selection from MD4 Palette

**Decision**: Use specific colors from MD4 palette:
- Header: `#0d2b33` (deep teal-blue, index 13)
- Footer: `#30403d` (dark green-grey, index 12)
- Links: `#3d9df2` (bright blue, index 3)
- Emphasis: `#ffcc00` (bright yellow, index 2)

**Rationale**:
- Dark colors provide good contrast for white text
- Accent colors are vibrant and accessible
- Colors are distinct from existing UI elements
- All colors exist in the MD4 palette

### Version Information

**Decision**: Read version from `package.json` at build time or hardcode
**Rationale**: 
- Simple approach: hardcode version in HTML initially
- Can be enhanced later to read from package.json if needed
- Foretoken uses package.json import (React), but we're vanilla JS

## Design Artifacts

### Header Structure
```html
<header class="app-header">
  <div class="header-content">
    <div class="header-title">
      <h1>Ambassy</h1>
      <p>A tool for parkrun Regional Event Ambassadors</p>
    </div>
    <div class="header-actions">
      <button type="button" id="addProspectButton">📍 Add Prospect</button>
    </div>
  </div>
</header>
```

### Footer Structure
```html
<footer class="app-footer">
  <p>
    <strong>Ambassy</strong>
    <a href="https://github.com/johnsyweb/ambassy/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer">v1.0.0</a>
    by
    <a href="https://www.johnsy.com" target="_blank" rel="noopener noreferrer">Pete Johns</a>
    (
    <a href="https://github.com/johnsyweb" target="_blank" rel="noopener noreferrer">@johnsyweb</a>
    )
  </p>
  <p>
    Licensed under MIT. Not officially associated with parkrun. Written by
    parkrun volunteers for parkrun volunteers.
  </p>
</footer>
```

### Layout Structure
```html
<body>
  <header class="app-header">...</header>
  <main class="app-main">
    <div id="content">...</div>
    <div id="ambassy">...</div>
  </main>
  <footer class="app-footer">...</footer>
</body>
```

## Implementation Approach

### Phase 1: HTML Structure
1. Add `<header>` element before main content
2. Add `<footer>` element after main content
3. Wrap main content in `<main>` element
4. Move "Add Prospect" button to header (keep ID the same for JS compatibility)
5. Adjust existing button container in `#ambassy` (remove "Add Prospect" button)

### Phase 2: CSS Styling
1. Add header styles (background, text, layout, responsive)
2. Add footer styles (background, text, links, responsive)
3. Add layout styles (flexbox for sticky footer)
4. Add button styles for header actions
5. Ensure proper spacing and padding
6. Add responsive breakpoints (768px, 480px)

### Phase 3: Integration
1. Verify existing JavaScript still works (button IDs unchanged)
2. Test dialogs display correctly (z-index)
3. Test responsive behavior
4. Verify accessibility (keyboard navigation, screen readers)

### Phase 4: Testing
1. Visual testing on desktop, tablet, mobile
2. Accessibility testing (keyboard, screen reader)
3. Cross-browser testing
4. Verify all existing functionality still works

## Testing Strategy

### Unit Tests
- Not applicable (HTML/CSS changes only)

### Integration Tests
- Verify header renders with correct content
- Verify footer renders with correct content
- Verify "Add Prospect" button in header triggers existing functionality
- Verify layout doesn't break existing features

### Visual/Manual Tests
- Header displays correctly on page load
- Footer displays correctly at bottom
- Responsive behavior on mobile/tablet
- Color scheme matches MD4 palette
- Links in footer are functional
- Keyboard navigation works
- Screen reader announces header/footer correctly

## Risks and Mitigations

### Risk 1: Breaking Existing Functionality
**Mitigation**: Keep button IDs the same, test all existing features after changes

### Risk 2: Dialog Z-Index Issues
**Mitigation**: Ensure dialogs have higher z-index than header/footer (currently 1000, header/footer should be lower)

### Risk 3: Mobile Layout Issues
**Mitigation**: Test thoroughly on mobile devices, use mobile-first responsive design

### Risk 4: Color Contrast Accessibility
**Mitigation**: Verify contrast ratios meet WCAG AA standards (white on `#0d2b33` and `#30403d`)

## Success Criteria

- ✅ Header displays with MD4 color scheme and correct branding
- ✅ Footer displays with MD4 color scheme and correct metadata
- ✅ "Add Prospect" button works from header location
- ✅ Footer links are functional and secure
- ✅ Layout integrates seamlessly with existing features
- ✅ Responsive design works on mobile, tablet, and desktop
- ✅ Accessibility requirements met (keyboard navigation, ARIA, contrast)
- ✅ All existing tests pass
- ✅ Code follows project Constitution and coding standards
