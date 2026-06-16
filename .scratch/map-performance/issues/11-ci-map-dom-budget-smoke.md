Status: ready-for-agent

# CI smoke test for map DOM budget

## What to build

Puppeteer smoke script (CI or pre-push) that loads sample CSVs and asserts map DOM stays within a budget — catching regressions like global unallocated markers.

## Acceptance criteria

- [ ] Script loads `localhost` or built `dist` with bundled sample CSVs
- [ ] Asserts Leaflet path/marker count below threshold (e.g. < 500 with sample data)
- [ ] Asserts DOM node count below threshold
- [ ] Wired into CI or documented in README for local perf checks

## Blocked by

- `.scratch/map-performance/issues/01-hide-global-unallocated-markers.md`
