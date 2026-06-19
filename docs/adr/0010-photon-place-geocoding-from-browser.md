---
status: accepted
---

# Photon for browser place geocoding

Ambassy runs as static assets on GitHub Pages. REAs geocode prospect addresses, resolve issue coordinates, and search the territory map by place name — all from the browser. Direct calls to OpenStreetMap’s Nominatim service caused production failures: CORS blocks, HTTP 429 rate limits, and no shared throttling across features.

## Decision

1. **Replace Nominatim with Photon** — all browser place geocoding uses [`photon.komoot.io`](https://photon.komoot.io/) (OpenStreetMap data, CORS-friendly public API).
2. **No server-side proxy** — the app remains file-only static hosting; geocoding stays client-side.
3. **Single module** — `src/utils/geocoding.ts` owns place search, address geocoding, and prospective-event geocoding. `src/utils/geography.ts` keeps Haversine distance helpers only.
4. **Global request queue** — at most one Photon request per second across the whole app.
5. **In-memory cache** — normalised query keys; successful results cached until page reload or Purge; empty results cached ~5 minutes; errors not cached.
6. **Search-first UX** — Add Prospect and territory map search call `searchPlaces` (limit 5) rather than geocode-then-search double requests.
7. **Recoverable errors** — HTTP 429 and network failures surface `PlaceGeocodingUnavailableError` with a clear message; manual coordinates and local catalogue matches still work.

## Considered options

**Keep Nominatim from the browser (rejected)** — strict usage policy, CORS friction, and 429s under normal REA use.

**Server-side geocoding proxy (rejected)** — requires backend infrastructure incompatible with GitHub Pages-only deployment.

**Per-feature debounce only, no global queue (rejected)** — Add Prospect, territory map search, and bulk import could still burst past provider limits.

**Persistent cache (localStorage / IndexedDB) (rejected)** — privacy and stale-data risk outweigh benefit; Purge already clears session state via reload.

## Consequences

- Privacy/README and CONTEXT name Photon explicitly; Nominatim is historical only.
- Tests mock Photon GeoJSON; queue and cache behaviour covered in `geocoding.test.ts`.
- Bulk import geocoding is slower (1 req/s) but predictable and polite to the public API.
