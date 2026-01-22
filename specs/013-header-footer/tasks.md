# Implementation Tasks: Header and Footer with MD4 Color Scheme

**Feature**: 013-header-footer  
**Status**: Draft

## Phase 1: HTML Structure

### Header Implementation
- [x] T010 [US1] Add `<header>` element to `public/index.html` before main content
  - Include `class="app-header"` and semantic structure
  - Add header content div with `class="header-content"`
  - Add title section with `class="header-title"` containing h1 and p
- [x] T011 [US1] Add header actions section with `class="header-actions"`
  - Move "Add Prospect" button from `#ambassy` section to header
  - Keep button ID `addProspectButton` for JavaScript compatibility
- [x] T012 [US1] Remove "Add Prospect" button from existing button group in `#ambassy` section
  - Button is currently at line 346 in index.html
  - Ensure no duplicate buttons remain

### Footer Implementation
- [x] T020 [US2] Add `<footer>` element to `public/index.html` after main content
  - Include `class="app-footer"` and semantic structure
  - Add version information with link to changelog
  - Add author information with links to website and GitHub
  - Add license information paragraph
- [x] T021 [US2] Ensure all footer links have proper attributes
  - `target="_blank"` for external links
  - `rel="noopener noreferrer"` for security
  - Proper href URLs

### Layout Structure
- [x] T030 [US3] Wrap main content in `<main>` element
  - Wrap both `#content` and `#ambassy` divs
  - Add `class="app-main"` for styling
- [x] T031 [US3] Ensure body uses flexbox layout for sticky footer
  - Add flexbox styles to body
  - Ensure footer stays at bottom on short pages

## Phase 2: CSS Styling

### Header Styles
- [x] T040 [US1] Add header CSS styles to `public/style.css`
  - Background color: `#0d2b33` (MD4 deep teal-blue)
  - Text color: white (`#ffffff`)
  - Padding: `1rem`
  - Box shadow for depth
- [x] T041 [US1] Add header content layout styles
  - Flexbox layout with space-between
  - Max-width container (e.g., 1400px) with margin auto
  - Title section on left, actions on right
- [x] T042 [US1] Add header typography styles
  - h1: `1.75rem`, bold, margin-bottom `0.25rem`
  - p: `0.9rem`, opacity `0.95`
- [x] T043 [US1] Add header button styles
  - Background: `rgba(255, 255, 255, 0.2)`
  - Border: `1px solid rgba(255, 255, 255, 0.3)`
  - Border radius: `6px`
  - Padding: `0.5rem 1rem`
  - Hover and focus states
  - Transition effects

### Footer Styles
- [x] T050 [US2] Add footer CSS styles to `public/style.css`
  - Background color: `#30403d` (MD4 dark green-grey)
  - Text color: white (`#ffffff`)
  - Padding: `1.5rem 1rem`
  - Text align: center
  - Font size: `0.875rem`
- [x] T051 [US2] Add footer link styles
  - Link color: `#3d9df2` (MD4 bright blue)
  - Hover state with opacity change
  - Text decoration on hover
- [x] T052 [US2] Add footer emphasis styles
  - Strong tags use `#ffcc00` (MD4 bright yellow)
  - Font weight: `600`
- [x] T053 [US2] Add footer paragraph spacing
  - Margin: `0.5rem 0`
  - Line height: `1.5`

### Layout Styles
- [x] T060 [US3] Add body flexbox layout styles
  - `display: flex`
  - `flex-direction: column`
  - `min-height: 100vh`
- [x] T061 [US3] Add main content area styles
  - `flex: 1` to take available space
  - Appropriate padding
  - Max-width container if needed
- [x] T062 [US3] Ensure footer stays at bottom
  - `margin-top: auto` on footer
  - Verify on pages with varying content height

### Responsive Design
- [x] T070 [US1, US2, US3] Add mobile responsive styles for header
  - Breakpoint: `768px` (tablet) and `480px` (mobile)
  - Stack header content vertically on mobile
  - Center align on mobile
  - Adjust font sizes
- [x] T071 [US1, US2, US3] Add mobile responsive styles for footer
  - Reduce padding on mobile (`1rem`)
  - Reduce font size on mobile (`0.8rem`)
  - Adjust paragraph margins
- [x] T072 [US1, US2, US3] Add mobile responsive styles for main content
  - Adjust padding on mobile
  - Ensure proper spacing

## Phase 3: Integration and Testing

### Functionality Verification
- [x] T080 [US3] Verify "Add Prospect" button functionality
  - Button in header triggers existing JavaScript
  - Dialog opens correctly
  - No duplicate functionality
- [x] T081 [US3] Verify existing features still work
  - Map displays correctly
  - Tables display correctly
  - Dialogs display with correct z-index
  - All buttons function correctly
- [x] T082 [US3] Verify layout doesn't break existing UI
  - Introduction section displays correctly
  - Map container has proper spacing
  - Tabs and tables have proper spacing

### Accessibility
- [x] T090 [US1, US2] Verify keyboard navigation
  - Tab order is logical
  - All interactive elements are focusable
  - Focus indicators are visible
  - Enter/Space activate buttons
- [x] T091 [US1, US2] Verify ARIA and semantic HTML
  - Header uses `<header>` element
  - Footer uses `<footer>` element
  - Proper heading hierarchy (h1 in header)
  - ARIA labels where needed
- [x] T092 [US1, US2] Verify color contrast
  - White text on `#0d2b33` meets WCAG AA (4.5:1)
  - White text on `#30403d` meets WCAG AA (4.5:1)
  - Link colors have sufficient contrast

### Visual Testing
- [x] T100 [US1, US2, US3] Test on desktop browsers
  - Chrome, Firefox, Safari, Edge
  - Verify header displays correctly
  - Verify footer displays correctly
  - Verify layout is correct
- [x] T101 [US1, US2, US3] Test on tablet (768px breakpoint)
  - Verify responsive layout
  - Verify header stacks correctly
  - Verify footer adapts
- [x] T102 [US1, US2, US3] Test on mobile (480px breakpoint)
  - Verify responsive layout
  - Verify touch targets are adequate
  - Verify text is readable

## Phase 4: Polish

### Code Quality
- [x] T110 [P] Run linting and fix any issues
- [x] T111 [P] Verify HTML is valid (W3C validator)
- [x] T112 [P] Verify CSS is valid (W3C validator)
- [x] T113 [P] Remove any unused styles or markup

### Documentation
- [ ] T120 [P] Update README if needed (layout changes)
- [x] T121 [P] Add comments to CSS for MD4 color references
- [x] T122 [P] Document any layout decisions in code comments

### Final Checks
- [x] T130 [P] Verify all existing tests pass
- [x] T131 [P] Manual smoke test of all major features
- [x] T132 [P] Verify no console errors
- [x] T133 [P] Verify performance is acceptable (no layout shifts)

---

## Dependencies & Execution Order

- **Phase 1 (HTML Structure)** must complete before Phase 2 (CSS Styling)
- **Phase 2 (CSS Styling)** must complete before Phase 3 (Integration)
- **Phase 3 (Integration)** must complete before Phase 4 (Polish)

Within each phase:
- Header implementation (T010-T012) can be done in parallel with Footer implementation (T020-T021)
- Layout structure (T030-T031) should be done after header/footer HTML
- CSS styling can be done incrementally (header, then footer, then layout)
- Responsive styles should be added after base styles
