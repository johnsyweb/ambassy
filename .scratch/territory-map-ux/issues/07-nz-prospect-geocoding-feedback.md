Status: done

# NZ prospect geocoding feedback and suggestions

## Parent

`.scratch/territory-map-ux/PRD.md`

## What to build

When geocoding a prospective event address in **Add Prospect**, improve feedback for ambiguous addresses (especially New Zealand):

- Show **multiple Nominatim suggestions** (same pattern as **Places** in **Find on Map**) when geocoding fails or the result does not match the entered state/region
- Surface **clear failure messages** when no places are found
- Include **state/region in the place search query** (e.g. address + `NZ` → bias toward New Zealand)
- **Reorder fields:** State/Region **before** Address (after Prospect Name)

**Out of scope:** Set Location dialog, CSV import, live-event address dialog.

## Grill decisions

| Decision | Choice |
|----------|--------|
| When to show Places | When `geocodeAddress` throws **or** inferred country ≠ expected country from State/Region |
| State/Region → country | Lookup: AU states → `AU`; `NZ` / `New Zealand` → `NZ`; UK nations/regions → `GB`; IE counties → `IE`; unknown → skip mismatch check |
| Field order | Prospect Name → **State/Region** → **Address** |
| Places vs manual coords | Show **Places first**; manual coordinates **only when Places returns zero** results |
| Pick a place | Update **Address** to full Nominatim label; set coords; continue allocation-suggestion flow |
| Success path | Unchanged when single-result geocode succeeds **and** country matches (or state unmapped) |

## Agent brief

**Category:** enhancement  
**Summary:** Add Prospect shows Nominatim **Places** pick list (like Find on Map) when geocoding fails or country mismatches State/Region.

**Current behaviour:**

- Add Prospect requires address + state/region but geocodes **address only** (`limit=1`).
- Example: `main st, hamilton` + state `NZ` resolves to Cincinnati, Ohio — or lands on **Enter Coordinates Manually** on failure.
- `searchPlaces()` (territory map search) already returns up to 5 labelled Nominatim results.

**Desired behaviour:**

1. **Field order:** Prospect Name → State/Region → Address (location-from-map note stays with address).
2. After debounced geocode (address blur / input, both fields filled):
   - Try single-result `geocodeAddress(address)`.
   - Infer country from coords; compare to **expected country** from State/Region lookup.
   - If geocode succeeds **and** countries match (or state unmapped) → existing allocation-suggestion flow (no regression).
   - If geocode throws **or** country mismatch → call `searchPlaces(buildPlaceQuery(address, state))` and show a **Places** section (reuse Find on Map list styling / keyboard patterns where practical).
3. **Places section:** labelled options; keyboard-selectable. Picking one sets coords, **replaces Address with full Nominatim label**, infers country, shows allocation suggestions. Hide error/retry noise once Places shown.
4. If Places returns **zero** results → show actionable message + **Enter Coordinates Manually** (existing fallback).
5. Manual coordinates unchanged when reached.

**Key interfaces:**

- New helper: `inferExpectedCountryCodeFromStateRegion(state: string): string | null` — returns ISO codes (`AU`, `NZ`, `GB`, `IE`) or `null` when unknown.
- New helper: `buildPlaceSearchQuery(address: string, state: string): string` — e.g. `"main st, hamilton"` + `"NZ"` → `"main st, hamilton, New Zealand"` (map known codes to country names for Nominatim).
- `showAddProspectDialog` — reorder fields; branch geocode flow; Places UI container; place-pick handler.
- `searchPlaces()` from `@utils/geocoding` — reuse as-is.
- Tests in `showAddProspectDialog.test.ts` — country mismatch triggers Places; place pick updates address; manual coords only when Places empty.

**Acceptance criteria:**

- [ ] Field order: Prospect Name → State/Region → Address
- [ ] `main st, hamilton` + `NZ` shows NZ Places (Hamilton, Waikato), not immediate manual coordinates
- [ ] Country mismatch (e.g. US coords, state `NZ`) triggers Places, not silent wrong-country success
- [ ] Picking a place updates Address to Nominatim label and shows allocation suggestions
- [ ] Manual coordinates appear only when Places returns zero results
- [ ] Successful AU geocode with matching state (e.g. VIC) unchanged
- [ ] Keyboard: Places options focusable and activatable
- [ ] Tests updated; full test suite passes

**Out of scope:**

- Set Location dialog, CSV import, live-event address dialog
- Changing territory map search behaviour
- Replacing single-result geocode on the happy path

## Blocked by

None

## Notes

Domain: Add Prospect workflow. See `CONTEXT.md` if updated during implementation.

Reporter example: address `main st, hamilton`, state `NZ` → should offer Hamilton, Waikato places.
