---
status: accepted
---

# EA home parkrun in allocation scoring

Event Ambassadors often volunteer regularly at a **home parkrun** that is not one of their allocated events. Allocation suggestions previously ranked recipients by allocation count and distance to **existing allocations** only — so an EA whose home parkrun was near a candidate event could rank below another EA who already held the nearby allocation.

We store an optional **home parkrun** per EA (independent metadata) and apply a **distance-decaying bonus** when scoring allocation and reallocation suggestions for live events and prospects. Domain terms: `CONTEXT.md`.

## Decision

1. **Metadata:** at most one optional `homeParkrun` (`EventShortName` from `events.json`) per EA; not required to be an allocated event.
2. **Set how:** Event Ambassadors table column with event search UI; optional CSV column `EA's Home parkrun` on the first row per EA. Blank CSV cell on re-import preserves the existing session value.
3. **Scoring:** bonus decays from **+500 at 0 km** to **0 at 50 km+** between the candidate event (or prospect coordinates) and the EA's home parkrun. Allocation proximity bonus remains capped at **+100** — home geography outranks allocation proximity.
4. **Scope:** `suggestEventAllocation`, `suggestEventReallocation`, prospect allocation, and prospect reallocation. Not REA/EA bulk offboarding flows.
5. **Capacity:** home bonus applies even when the EA is over capacity; capacity warnings remain.
6. **Audit:** every home parkrun set, change, or clear is logged in the Changes log.
7. **Invalid values:** UI selects only valid events from `events.json`; CSV values are canonicalised on load — unresolved or missing coordinates produce no bonus and a Changes log warning.

## Considered options

**Home must be an allocated event (rejected)**  
Fails the David/Jamestown scenario where home parkrun differs from operational allocations.

**Home bonus equal to allocation proximity (+100 cap) (rejected)**  
Does not prioritise David over Edna when Edna already holds the nearby allocation.

**Binary 50 km threshold (rejected)**  
Accepted decay 0–50 km for smoother ranking among nearby EAs.

**Exclude over-capacity EAs from home-boosted ranking (rejected)**  
REA should see the geographically ideal EA first, with warnings, and decide.

## Consequences

- Add `homeParkrun` to `EventAmbassador`; shared `calculateHomeParkrunBonus()` in scoring paths.
- Extend `parseEventAmbassadors`, `uploadCSV` merge, Ambassadors table UI, and session canonicalisation.
- Regression test: David (home Jamestown) ranks above Edna (holds Jamestown allocation) for a new event near Jamestown.
