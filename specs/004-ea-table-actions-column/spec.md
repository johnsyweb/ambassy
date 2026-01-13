# Feature Specification: Event Ambassadors Table Actions Column

**Feature ID**: `004-ea-table-actions-column`  
**Date**: 2026-01-08  
**Status**: Clarified

## Summary

Reorganize the Event Ambassadors table to consolidate action buttons (Offboard and Reallocate) into a dedicated Actions column with icons and text labels.

## User Stories

### US1: Consolidated Actions Column
**As a** user managing Event Ambassadors  
**I want to** see all action buttons in a dedicated Actions column  
**So that** I can easily find and use all available actions for each ambassador

**Acceptance Criteria:**
- Actions column exists in Event Ambassadors table header
- Both Offboard and Reallocate buttons are located in the Actions column
- Buttons are displayed side-by-side horizontally
- Buttons include icons and text labels
- Buttons have appropriate spacing between them

## Functional Requirements

### FR-001: Actions Column Structure
- Actions column must be the rightmost column in the Event Ambassadors table
- Column header must display "Actions"
- All action buttons for each row must be contained within this column

### FR-002: Button Layout
- Offboard and Reallocate buttons must be displayed side-by-side horizontally
- Buttons must have a small gap (4-8px) between them
- Buttons must be aligned consistently across all rows

### FR-003: Button Icons and Labels
- Reallocate button must display 🤝🏼 icon followed by "Reallocate" text
- Offboard button must display 🚪 icon followed by "Offboard" text
- Icons and text must be displayed together (not icon-only)
- Buttons must maintain existing functionality and event handlers

### FR-004: Button Removal from Name Column
- Offboard button must be removed from the Name column
- Name column must only display the ambassador name and color indicator
- No action buttons should remain in the Name column

## Technical Requirements

### TR-001: Icon Implementation
- Icons must use Unicode/Emoji characters (🤝🏼 and 🚪)
- Icons must be accessible via aria-label attributes
- Icons must render consistently across browsers

### TR-002: Styling
- Buttons must maintain existing styling (padding, font size, cursor)
- Button spacing must be implemented via CSS gap or margin
- Buttons must be responsive and maintain usability on smaller screens

### TR-003: Accessibility
- All buttons must have appropriate aria-label attributes
- Buttons must be keyboard accessible (Tab navigation, Enter/Space activation)
- Button tooltips must be preserved for additional context

## Non-Functional Requirements

### NFR-001: User Experience
- Visual layout must be clean and organized
- Buttons must be easy to identify and click
- Actions column must not significantly increase table width

### NFR-002: Consistency
- Actions column pattern should be consistent with Event Teams table Actions column
- Button styling should match existing button styles in the application

## Edge Cases

### EC-001: Empty Actions
- If no actions are available for a row, Actions column cell should be empty (not display placeholder)

### EC-002: Long Ambassador Names
- Actions column width should remain consistent regardless of name length
- Buttons should not wrap to multiple lines

## Clarifications

### Session 2026-01-08

- Q: What icon style should we use for the action buttons? → A: Unicode/Emoji icons — 🤝🏼 for Reallocate, 🚪 for Offboard
- Q: How should the two action buttons be arranged in the Actions column? → A: Side-by-side horizontal layout (buttons next to each other)
- Q: Should the buttons display text labels alongside the icons, or icon-only? → A: Icon + text labels (🤝🏼 Reallocate, 🚪 Offboard)
- Q: What spacing should be used between the two buttons in the Actions column? → A: Small gap (4-8px) between buttons
- Q: The Offboard button is currently in the Name column next to the ambassador name. Should it be moved to the Actions column with the Reallocate button? → A: Move Offboard button to Actions column (both buttons together)

## Success Criteria

- All action buttons are consolidated in the Actions column
- Buttons display with appropriate icons and text labels
- Table layout is clean and organized
- All existing functionality is preserved
- Accessibility requirements are maintained
