---
status: accepted
---

# Ambassador visit history via userscript

REAs need **last ambassador visit** (who and when) on Event Teams rows, derived from parkrun profile visit history. Ambassy is a static client-side app; parkrun profiles are on per-country domains with bot protection, so the browser cannot fetch profiles directly.

We import **finishes only** (profile `/all/` runs table) for v1. Volunteer roles are deferred. Domain terms: `CONTEXT.md`.

## Decision

1. **parkrunnerId** optional on EA and REA; stored as digits only; displayed with `A` prefix in the UI; profile URLs use digits only; set via ambassadors UI or CSV (`parkrunner ID`); blank CSV cell preserves session value; changes logged.
2. **Userscript** (`script/ambassy-finish-export.user.js`) with dual `@match`: all `events.json` country profile URLs + Ambassy origin(s). Parses `/all/` table (not paginated); extracts event slug from result links and finish date from `format-date`; reads optional `parkrunProfileDisplayName` from the first profile `h2`, stripping a trailing `(A\d+)` suffix (schema v1).
3. **Handoff:** parkrun page → Tampermonkey `GM_setValue` → Ambassy `@match` bridge writes `ambassy:pendingFinishImport` to `localStorage` and dispatches `ambassy-finish-import-ready` on page load and when the Ambassy tab becomes visible or gains focus. Clipboard JSON import as fallback. An already-open Ambassy tab also processes pending imports on cross-tab `storage`, `visibilitychange`, and `window` `focus` (see **Finish import activation** in `CONTEXT.md`).
4. **Import:** match slug to `events.json` `eventname`; discard unmatched. Merge per ambassador keeping latest ISO date per event. Unknown parkrunner ID prompts REA to assign EA/REA then import; when the profile display name matches exactly one allocation name after normalised full-string equality, pre-select that ambassador in the dialog (REA still confirms). Pending import remains in `localStorage` until import succeeds; cancel on the assign dialog does not discard it but suppresses further auto-prompt until the REA resumes (main-page banner or Visit history import control). **Dismiss** on the banner clears pending.
5. **Last ambassador visit:** max finish date across **all** EAs and REAs with imported history; show all names tied on that date; **N/A** when unknown. Display e.g. `Alex Sample; Kim Example — 13 Jun 2026` on Event Teams.
6. **Install and update URL:** canonical `@downloadURL`, `@updateURL`, and the Visit history install button use raw GitHub `main` (`raw.githubusercontent.com/johnsyweb/ambassy/.../public/script/ambassy-finish-export.user.js`) so Tampermonkey recognises the source. Local development overrides the install button to the dev-server copy on `localhost` / `127.0.0.1`. The script remains deployed on johnsy.com as a backwards-compatible mirror for older installs.

## Considered options

**Server-side scrape (rejected)** — needs backend; conflicts with gh-pages architecture and parkrun bot checks.

**Clipboard-only handoff (rejected)** — works but extra steps; localStorage bridge via userscript is smoother for REAs.

**Assigned ambassadors only (rejected)** — misses oversight visits by ambassadors not allocated to that event.

**Store unmatched finishes (rejected)** — clutters cache; REA only cares about events in `events.json`.

## Consequences

- Finish cache in `localStorage` separate from ambassador maps; keyed by `ea:name` / `rea:name`.
- Event Teams table gains **Last ambassador visit** column; README documents userscript install.
