Status: ready-for-agent

# Tune webpack dev config

## What to build

Improve local dev server responsiveness: enable webpack caching and use a lighter `devtool` setting for day-to-day development.

## Acceptance criteria

- [ ] `cache: true` in `webpack.config.js`
- [ ] `devtool` changed to `eval-cheap-module-source-map` (or documented alternative)
- [ ] `pnpm start` still serves a working app on port 8081
- [ ] README or CONTEXT notes trade-off if full source maps are needed for debugging

## Blocked by

None — can start immediately
