# Ambassy

A tool for parkrun Regional Event Ambassadors to manage event allocations, prospective events, and ambassador capacity across a geographic territory.

## Language

**Regional Event Ambassador (REA)**:
The ambassador responsible for a geographic region, supporting one or more Event Ambassadors.
_Avoid_: Regional Ambassador, RA

**Event Ambassador (EA)**:
The ambassador allocated to support one or more live parkrun events.
_Avoid_: Ambassador (alone, when EA is meant)

**Home parkrun**:
The live parkrun where an Event Ambassador regularly volunteers in a personal capacity. At most one per EA; optional. Does not need to be one of their allocated events. Must be a live parkrun in `events.json` with valid coordinates to influence allocation recommendations. Set by the REA via the Event Ambassadors UI or CSV.
_Avoid_: Home event (ambiguous), base event

**Allocation**:
The assignment of a live parkrun event to an Event Ambassador (and, by hierarchy, a Regional Event Ambassador).
_Avoid_: Assignment (except in UI copy where already established)

**Canonical event name**:
The `EventShortName` from `events.json` used as the allocation key once an imported or stored name is matched to a live parkrun event.
_Avoid_: Normalised name (too vague), official name

**Event name canonicalisation**:
Rewriting an allocation's event name to the canonical event name when it matches exactly one live parkrun in `events.json` under exact or strict normalised equality (e.g. comma vs space variants, macron differences, trailing ` parkrun` suffix, or `EventShortName, location` CSV disambiguation). Substring or fuzzy matches do not qualify. Logged in the Changes log; does not apply to prospective events or names with no unambiguous match.
_Avoid_: Auto-resolve (implies manual issue workflow), alias entry

**REA territory polygon**:
The visible map region showing which geographic area an allocated event's Regional Event Ambassador is considered to cover. Computed as that event's cell in a spherical Voronoi diagram among defined sites, coloured by REA.
_Avoid_: Voronoi layer (alone — too vague), catchment area, service envelope

**Constraining site**:
An unallocated parkrun included in the Voronoi calculation to shape boundaries but not rendered as a visible polygon.
_Avoid_: Boundary point, sentinel

**Unallocated parkrun**:
Any event in `events.json` that has no ambassador allocation in Ambassy and has valid coordinates. Includes 5k and junior series. Always a constraining site, never a visible polygon.
_Avoid_: Unassigned event (ambiguous with never-allocated vs offboarded)

**Prospective event (Voronoi)**:
A not-yet-live event in Ambassy's pipeline. Contributes to the Voronoi diagram as a visible site only when it has valid coordinates and an assigned Event Ambassador.
_Avoid_: Prospect (alone in map context)

**Prospect map marker**:
The diamond marker on the territory map for a geocoded prospective event. Shape distinguishes it from live event circle markers. Border colour is the assigned Event Ambassador's colour; three internal segments encode **prospect launch readiness** — filled with the EA colour when confirmed, light grey when not. Tooltip lists all three readiness flags explicitly, alongside event name, ambassador, and location.
_Avoid_: Prospect pin, pipeline marker

**Prospect launch readiness**:
The three boolean launch-pipeline flags on a prospective event: course found, landowner permission, and funding confirmed. Shown per-flag in the Prospects table and as three segments on the prospect map marker — top, bottom-left, and bottom-right respectively.
_Avoid_: Launch status (too vague), readiness score

**Prospect map legend**:
The dismissable **Marker legend** panel on the territory map that explains how to read live vs prospective event markers and prospect launch readiness segment fills. Covers marker shape and segment meaning only — not Event Ambassador border colour (which matches live event markers) and not unallocated parkrun markers. Appears automatically when prospective event markers are visible unless the REA has dismissed it for the session. A **Show marker legend** control in the same map corner restores it after dismiss; legend and restore control share the same visibility gate (prospective overlay on and at least one visible prospect marker). Both states clear on Purge.
_Avoid_: Map key, territory map legend (too broad)

**Voronoi site**:
Any point that competes in the REA territory Voronoi diagram. Site types:

- **Allocated live events** — visible REA territory polygons
- **Unallocated parkruns** — constraining sites only (any series in `events.json`, valid coordinates)
- **Prospective events** — visible REA territory polygons when assigned to an EA and coordinates are valid; excluded otherwise
  _Avoid_: Voronoi point, diagram node

**Voronoi scope**:
Global and static. All allocated events and all unallocated parkruns in `events.json` are Voronoi sites. The diagram is computed once per allocation change, not per pan or zoom.
_Avoid_: Viewport-scoped sites, regional Voronoi

**Voronoi cache**:
The global Voronoi cell rings are computed when site data changes and stored in memory. Pan and zoom re-clip and redraw from the cache without recomputing the diagram.
_Avoid_: Full recompute on pan, bounding box invalidation

**Voronoi cache invalidation**:
The cache is invalidated only when Voronoi sites change: allocations, `events.json` updates, prospective event add/move/remove, or coordinate fixes affecting site positions. UI-only refreshes (sort, selection, tab switch) do not invalidate.
_Avoid_: Invalidate on every refreshUI, invalidate on pan/zoom

**Spherical Voronoi**:
The global diagram is computed on the sphere using `d3-geo-voronoi`. Site coordinates are longitude/latitude; cell boundaries follow great circles.
_Avoid_: Planar Voronoi, Mercator Voronoi, pixel-space Voronoi

**Viewport clip**:
The portion of a REA territory polygon drawn on the map is limited to the currently visible map bounds. Pan and zoom re-clip; they do not recompute the Voronoi diagram.
_Avoid_: Bounding box sentinel, allocation bounds

**Viewport polygon clip**:
After the global Voronoi cell is computed, its ring is intersected with the current map bounds and only the visible portion is drawn. A territory that extends beyond the screen is truncated at the viewport edge.
_Avoid_: All-or-nothing bounds check, full-ring draw

**Undrawable territory**:
An allocated event whose REA territory polygon cannot be computed or clipped to a renderable shape. The event marker and tooltip still appear; no polygon is drawn and no user-facing error is shown.
_Avoid_: Fallback envelope, territory issue

**Drawable territory**:
A computed REA territory cell ring that passes validation: the allocated event site lies inside the polygon (point-in-polygon), and the ring is locally sensible (e.g. longitude span within limits).
_Avoid_: Bounding-box-only check, drawable if longitude range contains site

**Raw cell fallback**:
When local territory ring extraction fails drawable validation but the raw global Voronoi cell ring passes, the raw ring is used. Preserves global spherical compute; may draw a wrapped path (e.g. through the Indian Ocean) so the site remains inside the polygon.
_Avoid_: Meridian-box repair, planar Voronoi fallback

**Antimeridian (deferred)**:
REA territory polygons that cross ±180° longitude are out of scope until allocations span the Pacific. Current regions (UK, Australia, SE Asia, Japan, NZ) do not require antimeridian splitting.
_Avoid_: Pacific-centred longitude, date-line split (until needed)

**Territory edge rendering**:
Clipped cell rings are drawn with Leaflet straight lat/lng segments (`L.polygon`). Great-circle subdivision is out of scope until visual inaccuracy is observed at REA working zoom levels.
_Avoid_: Geodesic polygon, great-circle densification

**parkrunner ID**:
The identifier for a parkrun volunteer. Ambassy stores the numeric portion only (e.g. `1001388`) and displays it with an `A` prefix in the UI (e.g. `A1001388`). Profile URLs use the numeric portion (e.g. `…/parkrunner/1001388/all/`). Optional metadata on an Event Ambassador or Regional Event Ambassador, set by the REA via the ambassadors UI or CSV. Used to link to that person's profile and to import their visit history into Ambassy. If visit history arrives for an unknown ID, Ambassy prompts the REA to assign it to an ambassador before importing.
_Avoid_: parkrun ID (ambiguous with event id), athlete ID

**parkrun profile display name**:
The volunteer name shown on a parkrun profile page (e.g. `Alex SAMPLE` beside the parkrunner ID). The finish-export userscript reads the first `h2` on the profile `/all/` page and strips a trailing `(A\d+)` parenthetical. Exported with visit history as optional `parkrunProfileDisplayName` on finish-import schema v1; not an allocation key. Used to pre-select an ambassador in the assign-before-import dialog when it matches exactly one allocation name after **normalised full-string equality** (case-fold and collapse whitespace); e.g. `Alex SAMPLE` matches `Alex Sample`, but `Sam TAYLOR` does not match `Samuel Taylor`. Shown for context when there is no match or more than one match; the REA always confirms before import.
_Avoid_: Ambassador name (ambiguous with EA/REA allocation names), parkrun name

**Finish import activation**:
When Ambassy checks for a pending finish import in `localStorage`: on the `ambassy-finish-import-ready` custom event (after the userscript bridge writes storage), on the cross-tab `storage` event when another tab writes the pending key, and when the document becomes visible or the window gains focus (so an already-open Ambassy tab picks up an export without reload). All paths call the same import handler. The pending payload stays in `localStorage` until import completes successfully; cancelling the assign-before-import dialog does not discard it. After cancel, auto-prompt is suppressed until the REA explicitly resumes via a main-page banner (**Resume** / **Dismiss**) or the Visit history **Import visit history from clipboard** control (which also processes pending `localStorage` when present). On Ambassy pages the finish-export userscript runs the Tampermonkey → `localStorage` bridge on load and when the tab becomes visible or the window gains focus.
_Avoid_: Polling, full page reload required

**Ambassador visit history**:
The set of dates on which a given ambassador (EA or REA with a parkrunner ID) **finished** (ran as a participant) at a live parkrun event, imported from the runs table on their parkrun profile `/all/` tab and cached in Ambassy. Only finishes that match a live event in `events.json` are kept; others are discarded on import. Re-import **merges** with existing cache, keeping the latest finish date per event for that ambassador. Volunteer-only roles are out of scope until parkrun exposes them in a form Ambassy can import.
_Avoid_: Run history (implies volunteering), attendance record, visit (ambiguous with volunteer)

**Last ambassador visit**:
For a given live event, the most recent **finish** among all Event Ambassadors and Regional Event Ambassadors in Ambassy with imported history — not only those assigned to that event. Recorded as **who** (one or more ambassador names if tied on the same date) and **when** (finish date). Shown on the Event Teams tab when known; **Not imported** when no visit history has been imported yet; **No visit on record** when history exists but no qualifying finish is on record for that event.
_Avoid_: Last EA visit (too narrow), last allocation visit

**parkrun country domain**:
The per-country website host for a parkrun territory (e.g. `www.parkrun.com.au`, `www.parkrun.co.uk`), from `events.json` countries data. parkrun profiles and event URLs use the domain of the event's country; the finish-import userscript must support all domains present in that data.
_Avoid_: TLD (too vague), parkrun URL (ambiguous with images.parkrun.com)

**Ambassador name filter**:
A shared free-text control above the data tabs. Case-insensitive substring match against ambassador allocation columns on the active tab: Event Teams (REA or EA), Event Ambassadors (EA name or supporting REA), Regional Ambassadors (REA name or any supported EA), Prospects (assigned EA or that EA's REA). Persists across page reload in session storage; cleared on Purge. Out of scope for v1: Changes log, Issues, Last ambassador visit, and Event Director columns. Free text only (no autocomplete or dropdown).
_Avoid_: Search (too generic), table search

**Filtered map view**:
The map presentation when an ambassador name filter is active. Allocated event markers and prospect markers follow the same matching rules as Event Teams and Prospects respectively; unallocated parkrun markers are hidden. REA territory polygons are drawn only for Regional Event Ambassadors with at least one visible allocated event. The Voronoi diagram is not recomputed — only which markers and polygons are shown changes.
_Avoid_: clipped Voronoi

**Territory map search**:
A map control for finding and flying to a live event, prospective event, or town or place by name. Searches the full local catalogue and geocodes places via Nominatim; navigation only — it does not replace or override the ambassador name filter. Selecting a result pans and zooms the map even when the ambassador filter would hide that marker; matching suggestions and a post-selection status message may note when the target is hidden by the filter. Suggestions are grouped by live events, prospective events, and places. Selecting a live or prospective result syncs the relevant data tab when a row exists. Selecting a place drops a **temporary place pin** on the map, cleared on the next search selection or map click. Creating a prospective event from a place pin is a separate workflow.
_Avoid_: Search (too generic), ambassador name filter

**Temporary place pin**:
A short-lived map marker dropped when the REA selects a place from territory map search. Shows where the geocoded town or place is; removed on the next search selection or map click. Not a prospective event or live event marker.
_Avoid_: place marker, search pin

**Territory map**:
The main Ambassy map showing live event markers, prospective event markers, viewport unallocated parkrun markers, and REA territory polygons. Primary audience is the Regional Event Ambassador scanning allocation and launch pipeline across Event Ambassadors in a region. The layer control exposes each marker kind and territory polygons as separate toggles. When prospective event markers are visible, the **prospect map legend** may appear.
_Avoid_: Territory manager (not a defined role), allocation map

**Territory map overlay**:
A togglable marker or polygon group on the territory map layer control. **Live events**, **Prospective events**, and **Unallocated parkruns** are separate marker overlays; **Regional Event Ambassador** territory polygons are a separate overlay. All three marker overlays default to visible until the REA toggles them off. Overlay visibility persists in session storage for the working session (cleared on Purge), like the ambassador name filter — not in state export/import.
_Avoid_: Event Markers (retired combined overlay), map layer (too vague)

**Live events map overlay**:
The territory map overlay for allocated live event circle markers only.
_Avoid_: Live event markers (ambiguous with unallocated), allocated layer

**Prospective events map overlay**:
The territory map overlay for geocoded prospective event diamond markers only. When this overlay is off or no prospect markers would render, the prospect map legend is hidden.
_Avoid_: Prospect layer, pipeline overlay

**Unallocated parkruns map overlay**:
The territory map overlay for viewport unallocated parkrun circle markers — click-to-allocate hints for catalogue parkruns with no Event Ambassador allocation in Ambassy.
_Avoid_: Unallocated events, viewport layer

**Territory map marker zoom scale**:
How territory map event markers grow when the REA zooms in past region overview, up to a capped maximum at street-level zoom. At region overview zoom and below, markers stay at their baseline size. Applies to allocated live events, prospective events, and viewport unallocated events; table–map selection highlights on live events track the allocated marker size.
_Avoid_: Responsive markers (too vague), pin scaling

**State export**:
A single JSON file containing all Ambassy data that cannot be recovered from parkrun alone: allocations, ambassadors, prospective events, capacity limits, changes log, manually resolved event coordinates, parkrunner IDs, and visit histories.
_Avoid_: Share, backup, partial export

**State export exclusions**:
Data deliberately omitted from a state export because it is re-fetchable or ephemeral: the `events.json` catalogue cache, pending visit import payloads, and session-only UI state (e.g. ambassador name filter).
_Avoid_: Optional export, slim export

**State import**:
Loading a state export file to replace all persisted Ambassy data in the export scope on this device. If local data exists or there are unsaved changes, the user must confirm before the replace proceeds.
_Avoid_: Open saved state, merge import, partial import

**State export schema**:
The JSON `version` field on a state export file. New exports use `2.0.0` (full local state). Import accepts `2.0.0` and legacy `1.0.0`; missing fields in older files default to empty.
_Avoid_: Share format, URL-encoded state

**State export action**:
A single header control that immediately downloads the current state as a JSON file (e.g. `ambassy-state-2026-06-16.json`) with no intermediate dialog. Successful export marks local state as saved for the unsaved-changes reminder.
_Avoid_: Share dialog, URL export, clipboard export

**State import action**:
Loading a state export file via the **Import** header control (system file picker) or by dragging a `.json` file onto the page. URL query parameters and clipboard paste are not supported for state import.
_Avoid_: Open saved state, share URL, paste state JSON

**App version**:
The semver shown in the footer (e.g. `v1.2.3`), linked to that release’s changelog. Bumped automatically on `main` from conventional commits; not edited by hand in the UI.
_Avoid_: Build number, package.json (implementation detail)

**Changelog**:
The version history of Ambassy changes, generated from conventional commits. Linked from the footer app version.
_Avoid_: Release notes (GitHub-only), git log
