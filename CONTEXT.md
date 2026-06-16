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
