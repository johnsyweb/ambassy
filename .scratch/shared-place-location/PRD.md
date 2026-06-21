# Shared place location search

## Problem

Reset Location and Issues address resolution still use single-shot geocode buttons and `alert()` feedback, while Add Prospect has search-first Photon, Places pick list, manual coordinates, and inline status. REAs get inconsistent UX and Reset Location misses country/state bias.

## Goal

One shared place-location module powers Add Prospect, prospect location reset, and issue address resolution — same Photon queue/cache (ADR 0010), same field order (State/Region → Address), same Places list and inline errors.

## Decisions (grill)

| # | Decision |
|---|----------|
| 1 | Search-first Photon (`searchPlaces`, limit 5) |
| 2 | Reset Location keeps browser geolocation → `"manual"` |
| 3 | Reset Location: editable state, pre-filled from prospect |
| 4 | Save coords + state + country (country inferred from coordinates) |
| 5 | Reset Location: immediate save on success |
| 6 | `geocodingStatus`: Photon → `"success"`; manual coords + GPS → `"manual"` |
| 7 | Extract shared `bindPlaceLocationSearch` module |
| 8 | Field order: State/Region → Address |
| 9 | Scope: Reset Location + Issues address dialog (+ refactor Add Prospect) |
| 10 | Issues: place pick sets preview; **Resolve** commits with URL |
| 11 | Issues state: editable, pre-filled EA → REA → blank |
| 12 | No manual coords in Issues dialog (map pin remains manual path) |
| 13 | Resolve uses picked coordinates — no second Photon call |
| 14 | Inline feedback only — no success/error `alert()` |

## Out of scope

- CSV import geocoding (batch, no dialog)
- Territory map search behaviour
- Server-side geocoding proxy
