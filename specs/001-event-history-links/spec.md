# Feature Specification: Event History Links

**Feature Branch**: `001-event-history-links`  
**Created**: 2026-01-14  
**Status**: Draft  
**Input**: User description: "I'd like to specify a new feature… I want to be able to go from an ambassador's live event allocations on the Event Ambassador tab and open browser tabs on that event's evvent history page. E.g. https://www.parkrun.com.au/albertmelbourne/results/eventhistory/"

## Clarifications

### Session 2026-01-14

- Q: Which EventDetails property should be used for the URL path segment? → A: Use `eventname` property (e.g., "kirkdalereserve"), not `EventShortName` (e.g., "Kirkdale Reserve"). The `eventname` is the URL-friendly identifier used in parkrun URLs.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open event history from Event Ambassador tab (Priority: P1)

As an Event Ambassador reviewing my live event allocations, I want each allocated event name on the Event Ambassador tab to be a hyperlink that opens the event’s parkrun event history page in a new browser tab, so I can quickly review historical results for my assigned events.

**Why this priority**: Direct access to history is the core value of the feature.

**Independent Test**: With an Event Ambassador who has at least one live event allocation, clicking the event name opens the correct event history page in a new tab using the per-country domain and event's `eventname` property (e.g., "kirkdalereserve") from EventDetails data.

**Acceptance Scenarios**:

1. **Given** the Event Ambassador tab is visible and shows a live event allocation, **When** the user clicks the event name, **Then** a new tab opens to the event’s history URL using that event’s country-specific domain and short name with `/results/eventhistory/`.
2. **Given** an event belongs to a country with a different domain (e.g., parkrun.co.uk vs parkrun.com.au), **When** the user clicks the event name, **Then** the link uses the correct country domain and the event’s short name in the path.

---

### User Story 2 - Graceful handling when domain data is missing (Priority: P2)

As an Event Ambassador, if domain data for an event is missing or invalid, I want a clear, non-breaking fallback so the UI remains usable and I understand why the link is unavailable.

**Why this priority**: Prevents broken UX and confusion when data is incomplete.

**Independent Test**: Remove or corrupt the country domain for an event; the UI should disable the link or show a tooltip/message explaining the missing domain without throwing errors.

**Acceptance Scenarios**:

1. **Given** an event is missing country domain info, **When** the event row renders, **Then** the link is disabled or replaced with explanatory text/tooltip indicating the missing domain.
2. **Given** an event has malformed domain data, **When** the link is activated, **Then** the system avoids navigation and surfaces a user-friendly message without console errors.

---

### Edge Cases

- Missing or null country/domain data for an event.
- Missing or malformed `eventname` property that would create an invalid URL.
- User opens multiple event history links rapidly (multiple tabs).
- Event Ambassador has zero live event allocations (no links rendered).
- Accessibility: keyboard activation of links and visible focus states.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each live event allocation listed for an Event Ambassador on the Event Ambassador tab MUST render the event name as a hyperlink to that event’s history page.
- **FR-002**: The hyperlink MUST be constructed using the event’s country-specific domain from `events.json` and the event short name, in the form `https://<country-domain>/<eventShortName>/results/eventhistory/`.
- **FR-003**: Links MUST open in a new browser tab or window to avoid losing the current context.
- **FR-004**: If country domain data is missing or invalid, the UI MUST gracefully disable or replace the link with an explanatory message/tooltip and MUST NOT throw errors.
- **FR-005**: Keyboard users MUST be able to focus and activate the event history links.
- **FR-006**: The feature MUST not alter existing sorting, filtering, or reallocation behaviors on the Event Ambassador tab.

### Key Entities *(include if feature involves data)*

- **Event**: `eventname` property (e.g., "kirkdalereserve"), country code/domain (from `events.json`), live allocation status.
- **Event Ambassador Allocation**: mapping between an Event Ambassador and their live events displayed on the Event Ambassador tab.
- **Country Domain Mapping**: lookup from `events.json` providing per-country base URLs for event history links.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of live event hyperlinks on the Event Ambassador tab resolve to the correct country-specific event history URL using the event’s short name.
- **SC-002**: 0 broken links or navigation errors observed during exploratory testing across at least 10 events spanning 3+ country domains.
- **SC-003**: 100% keyboard accessibility for the new links (focusable and activatable via keyboard).
- **SC-004**: Missing/invalid domain data results in a visible, user-friendly fallback with no console errors in 100% of such cases.
# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]  
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
