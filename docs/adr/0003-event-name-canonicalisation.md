---
status: accepted
---

# Event name canonicalisation against events.json

Ambassador CSVs often spell the same live parkrun differently from `events.json` — for example `"Albert, Melbourne"` in an Event Ambassadors export versus `"Albert Melbourne"` as `EventShortName`. The app then flags **Missing Coordinates** even though the event exists with valid coordinates, because allocation keys no longer match map lookups (`eventDetails.get(allocationName)`).

We **rewrite allocation names to the canonical `EventShortName` from `events.json`** when there is exactly one unambiguous match under exact or strict normalised equality. This runs at **CSV import** and on **session load** (after `events.json` is available), before issue detection. Domain terms: `CONTEXT.md`.

## Decision

1. **Mechanism:** rewrite names in Event Ambassadors (`events[]`) and Event Teams (map keys) to the matched canonical `EventShortName`. Do **not** add alias entries to `eventDetailsMap`.
2. **When:** CSV import and session load — before `detectIssues` and derived table data.
3. **Match rule:** exact case-insensitive match, or strict normalised equality after enhanced normalisation (apostrophes, parentheticals, whitespace, comma↔space, diacritic folding, trailing ` parkrun` suffix). When the full name does not match, try the segment before the first comma (location disambiguation, e.g. `Hamilton Park, Gore` → `Hamilton Park`). **No** fuzzy or substring matching.
4. **Ambiguity:** canonicalise only when exactly one live parkrun in `events.json` matches. Prospective names, closed events, and typos with no single match stay as unresolved issues for manual 🔧 Resolve.
5. **Logging:** one Changes log entry per rename; separate log entry when deduplicating duplicate allocations on the same EA after canonicalisation.
6. **Event Teams collision:** when two map keys collapse to one canonical name, merge `eventDirectors` (deduped). For conflicting `eventAmbassador` values, prefer the owner from the Event Ambassadors CSV.
7. **Persistence:** persist corrected `eventAmbassadors`, `eventTeams`, and Changes log immediately after session-load migration; re-initialise the change tracker as **saved** (no beforeunload prompt from migration alone).

## Considered options

**Alias entry in `eventDetailsMap` (rejected)**  
Manual 🔧 Resolve already copies coordinates under the allocation key. Works for the Issues tab but leaves two names for one event unless every caller uses normalised lookup. Rejected in favour of fixing the allocation key at source.

**Canonicalise allocation names at CSV import only (rejected)**  
Does not fix names already in sessionStorage until the user re-uploads CSVs.

**Issue detection with silent map alias, no allocation rewrite (rejected)**  
Hides the issue without aligning Event Ambassadors, Event Teams, and map lookups on one key.

**Auto-match using `searchEvents` substring/`includes` normalised phase (rejected)**  
Risk of false positives (e.g. short names matching longer event names). Strict normalised equality only.

**Dedupe duplicate allocations silently (rejected)**  
Duplicate removal after canonicalisation is logged so REAs can audit spreadsheet double-entry.

## Consequences

- Implement `findCanonicalEventShortName()` and `canonicaliseAllocationNames()`; extend `normalizeEventName()` for comma↔space equivalence, diacritic folding, and trailing ` parkrun` suffix stripping; comma-prefix fallback in `findCanonicalEventShortName()`.
- Wire into `uploadCSV` and app startup before `extractEventTeamsTableData`.
- Add tests for comma variants (Albert Melbourne), dedupe logging, Event Teams director merge, and idempotent second load.
- Manual resolve for `found_in_events_json` remains for names that fail strict canonicalisation (typos, genuine missing events).
