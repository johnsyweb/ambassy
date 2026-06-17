Status: done

# Replace internal prospect status labels with plain language

## Parent

`.scratch/territory-map-ux/PRD.md`

## What to build

Prospective event **internal processing status** (`ambassadorMatchStatus`: `pending`, `matched`, `unmatched`) is shown verbatim or via misleading labels in the UI. REAs report that **"Status: matched"** (and the **Ambassador Match** column showing "✅ Success") makes no sense.

Replace user-facing copy with plain language about **Event Ambassador assignment**, not import pipeline jargon. Keep internal enum values in the data model; change presentation only.

Known surfaces today:

- Voronoi prospect territory tooltip: `Status: matched` (raw enum) in `populateMap.ts`
- Prospects table **Ambassador Match** column: uses shared `getStatusText()` which maps `matched` → "✅ Success" (same label as geocoding success)
- Any other prospect tooltip or table cell surfacing `ambassadorMatchStatus` or `geocodingStatus` without REA-facing labels

## Proposed user-facing language

| Internal | Show REA instead |
|----------|------------------|
| `matched` | Event Ambassador assigned (or show EA name only — column may be redundant) |
| `unmatched` | No Event Ambassador assigned |
| `pending` | Event Ambassador not yet matched (import) |

Separate geocoding status labels from ambassador assignment labels — do not reuse one `getStatusText()` for both.

## Acceptance criteria

- [ ] No user-facing UI shows raw `pending` / `matched` / `unmatched` strings
- [ ] Voronoi prospect tooltips use the same readable fields as prospect map marker tooltips (or omit status when EA name is already shown)
- [ ] Prospects table **Ambassador Match** column header and values are understandable to an REA (consider renaming column or removing if redundant with EA column)
- [ ] Geocoding status and ambassador assignment status use distinct label helpers
- [ ] Tests updated; full test suite passes

## Blocked by

None — can start immediately

## Notes

Quick win; independent of other territory-map-ux slices. May overlap issue 04 if tooltip copy is centralised in `formatProspectMapTooltip`.
