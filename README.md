# Ambassy

## Introduction

This is a project written by a parkrun Regional Event Ambassador (REA) to save some time and effort. A Regional Event Ambassador (REA) is a parkrun volunteer who supports more than one Event Ambassador (EA). An Event Ambassador is a parkrun volunteer who supports more than one Event Team. An Event Team is responsible for the care and delivery of a single parkrun Event an a weekly basis. An event team is comprised of one or two Event Directors (ED) plus some Run Directors (RD) -- these are also parkrun volunteers.

parkrun has many _events_ around the world, which are listed at <http://images.parkrun.com/events.json>. Event Ambassadors may also support "prospects". A prospect is an event that has not yet started and is not yet listed by parkrun.

We'll keep a table of these and their allocated Event Ambassadors in a CSV file.
We'll keep a table of Event Ambassador event allocations in a separate CSV file.
A third CSV file will keep a table of Regional Event Ambassadors and the Event Ambassadors they support.
These CSV files will remain private and will be uploaded via the /upload page.

We are not concerned with all parkrun events globally, just those within the care of the Regional Event Ambassadors listed.

Some notes about parkrun volunteers. They each have a "home" parkrun Event (e.g. "Coburg") and a parkrun ID, which is an "A" followed by a number (e.g. "A1001388"). We'll keep these next to their names in the spreadsheet. An ED can also be an EA, but cannot support the Event Team of which they are a part.

## A concept map of the entities described above

```mermaid
graph TD
    REA[Regional Event Ambassador] -->|supports| EA[Event Ambassador]
    EA -->|supports| ET[Event Team]
    ET -->|responsible for| PE[parkrun Event]
    ET -->|comprised of| ED[Event Director]
    ET -->|comprised of| RD[Run Director]
    EA -->|supports| P[Prospect]

    subgraph CSV Files
        CSV1[Table of Prospects and their allocated Event Ambassadors]
        CSV2[Table of Event Ambassador event allocations]
        CSV3[Table of Regional Event Ambassadors and the Event Ambassadors they support]
    end

    REA -->|listed in| CSV3
    EA -->|listed in| CSV1
    EA -->|listed in| CSV2

    subgraph parkrun Volunteers
        PV1[Home parkrun Event]
        PV2[parkrun ID]
    end

    PV1 -->|e.g.| Coburg
    PV2 -->|e.g.| A1001388
    ED -->|can also be| EA
    ED -->|cannot support| ET
```

## What this project will do

- Render a map, showing the locations of each of the parkrun volunteers identified and their allocations
- Make recommendations as to which EAs are best-placed to support local events and prospects
- Make recommendations as to which REAs are best-placed to support local EAs

## How it will work

This project is written in TypeScript, has unit tests, and the map will be displayed in any modern web browser.

## State Persistence and Sharing

Ambassy automatically persists your uploaded CSV data to browser local storage, so you don't need to re-upload files every time you visit the application. Your data persists across browser sessions.

### Exporting State

Click the "Export State" button to download your current application state as a JSON file. This file contains all your uploaded data (Event Ambassadors, Event Teams, Regional Ambassadors, and changes log) and can be shared with other ambassadors or parkrun staff.

### Importing State

Click the "Import State" button to load a previously exported state file. This allows you to:
- Share your data with other users
- Restore your data on a different device or browser
- Load data shared by other ambassadors

**Note**: Importing will replace your current data. You'll be asked to confirm before importing if you have existing data.

## Ambassador Capacity Management

Ambassy provides tools for managing ambassador capacity and lifecycle:

### Onboarding Ambassadors

- **Add Event Ambassador**: Click "Add Event Ambassador" to add a new Event Ambassador to the system
- **Add Regional Ambassador**: Click "Add Regional Ambassador" to add a new Regional Ambassador to the system
- New ambassadors start with no assigned events/EAs and can be assigned as needed

### Capacity Checking

The system automatically checks ambassador capacity against configurable limits:
- **Event Ambassadors**: Preferred range is 2-9 events (configurable)
- **Regional Ambassadors**: Preferred range is 3-10 Event Ambassadors (configurable)
- Capacity status is displayed with emoji indicators:
  - ⬇️ Under capacity (below minimum)
  - ✅ Within capacity (within preferred range)
  - ⚠️ Over capacity (above maximum)

### Offboarding Ambassadors

When an ambassador leaves or changes roles:
- Click the "Offboard" button next to their name in the ambassador tables
- The system suggests reallocation recipients based on:
  - Available capacity
  - Regional alignment (same Regional Ambassador)
  - Geographic proximity
  - Conflict avoidance
- You can reallocate events/EAs to different recipients individually
- All changes are automatically logged and the UI updates immediately

### Configuring Capacity Limits

- Click "Configure Capacity Limits" to adjust preferred capacity ranges
- Limits persist across sessions and are included in exported state
- Changes immediately update all ambassador capacity statuses

## Development with Speckit

This project uses [Speckit](https://speckit.org/) (Spec Kit) for specification-driven development. Speckit helps ensure that features are well-specified before implementation, reducing errors and improving code quality.

### Getting Started with Speckit

Speckit is already installed and configured for this project. The Specify CLI tool is available via `uv`.

### Using Speckit Commands

Speckit provides several slash commands that you can use in your AI assistant (Cursor):

- `/speckit.constitution` - Establish project principles
- `/speckit.specify` - Create baseline specification for a new feature
- `/speckit.clarify` - Ask structured questions to clarify ambiguous requirements
- `/speckit.plan` - Create implementation plan from specification
- `/speckit.checklist` - Generate quality checklists
- `/speckit.tasks` - Generate actionable tasks from plan
- `/speckit.analyze` - Cross-artifact consistency & alignment report
- `/speckit.implement` - Execute implementation tasks

### Workflow

The typical Speckit workflow follows these phases:

1. **Foundation**: Establish project principles and create specifications
2. **Clarification**: Resolve ambiguities in requirements
3. **Planning**: Choose tech stack and architecture
4. **Tasks**: Break down into actionable items
5. **Implementation**: Generate working code

For more information, see the [Speckit documentation](https://speckit.org/).
