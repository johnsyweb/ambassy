---
status: accepted
---

# Ambassador name filter with filtered map view

REAs need to focus on one ambassador across tables and map without retyping on every tab. v1 adds a shared **ambassador name filter** (see `CONTEXT.md`) above the data tabs for Event Teams, Event Ambassadors, Regional Ambassadors, and Prospects.

## Decision

1. **One shared filter** persists across tab switches and page reload (`sessionStorage`); Purge clears it.
2. **Matching** is case-insensitive substring on allocation-related ambassador columns per tab; not Last ambassador visit or Event Directors.
3. **Filtered map view** when the filter is non-empty: markers for matching allocations and prospects only; hide unallocated parkrun markers; draw REA territory polygons only where that REA has at least one visible allocated event. Voronoi cache is not invalidated or recomputed.
4. **UI**: labelled field, Clear control, live row count; `/` focuses filter (when not in a text field), Escape clears when filter has focus.
5. **Free text only** in v1 — no autocomplete or dropdown.

## Considered options

**Tables only (rejected)** — map still shows full territory; conflicts with “focus my attention”.

**Per-tab filters (rejected)** — REAs switch tabs to follow one ambassador; retyping is friction.

**Dim non-matching polygons (rejected)** — visual clutter; hiding non-matching territories is clearer.

**localStorage persistence (rejected)** — stale filter on a later visit is confusing; session storage survives reload within the same working session.

## Consequences

- Filter state is separate from Share/Open exports.
- Map redraw logic must respect filter without touching Voronoi cache invalidation rules.
- Changes log and Issues remain unfiltered until a future need is established.
