# GitHub Actions Workflows

## CI/CD (ci-cd.yml)

Single workflow for validation, build, and deployment with caching and parallelism.

**Triggers:** Push and pull requests to `main`.

### Jobs

1. **lint** and **test** run in parallel (pnpm cache, Node from `.tool-versions`).
2. **build** runs after both pass; uploads `dist` artifact (retention 1 day).
3. **deploy** runs only on push to `main` after build succeeds:
   - Checkout, install deps, build
   - Install Chrome, generate screenshots (`pnpm screenshots`) into `public/`
   - Build again so `dist` includes updated screenshots
   - Deploy `dist` to GitHub Pages

### Tool versions and caching

- **mise** (`jdx/mise-action@v3` with `install: true`) reads `.tool-versions` and installs Node.js and pnpm, so CI uses the same versions as local dev.
- **Caching:** `actions/setup-node@v4` with `cache: pnpm` so dependency installs are fast on all jobs.

### Concurrency

- `concurrency: group: pages` so only one Pages deployment runs at a time.

### Screenshots

- Generated during the deploy job (not a separate workflow). No screenshot commits back to the repo; the deployed site includes fresh screenshots each time.

## Prerequisites

- `.tool-versions` (mise format) for Node and pnpm versions; CI uses mise so versions match dev.
- `puppeteer` in devDependencies
- `screenshots` script in package.json

## Local

```bash
pnpm install
pnpm run lint
pnpm test
pnpm run build
pnpm screenshots   # optional: update public/screenshot.png and public/ambassy-social-preview.png
```
