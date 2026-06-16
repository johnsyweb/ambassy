Status: done

# Tune webpack dev config

## What to build

Improve local dev server responsiveness: enable webpack caching and use a lighter `devtool` setting for day-to-day development.

## Acceptance criteria

- [x] `cache: true` in `webpack.config.js`
- [x] `devtool` changed to `eval-cheap-module-source-map` (or documented alternative)
- [x] `pnpm start` still serves a working app on port 8081
- [x] README or CONTEXT notes trade-off if full source maps are needed for debugging

## Blocked by

None — can start immediately
