# GitHub Actions Workflows

## CI/CD (ci-cd.yml)

Single workflow for validation, build, and deployment with caching and parallelism.

**Triggers:** Push and pull requests to `main`.

### Jobs

1. **lint**, **test**, and **audit** run in parallel (aube store cache, Node and aube from `.tool-versions`).
2. **build** runs after all three pass; uploads `dist` artifact (retention 1 day).
3. **map-dom-budget** smoke test runs after build.
4. **release** (on qualifying pushes to `main`) runs semantic-release, generates screenshots, and uploads a release build artifact.
5. **deploy-pages-*** jobs deploy `dist` to GitHub Pages.

### Tool versions and caching

- **mise** (`jdx/mise-action@v4` with `install: true`) reads `.tool-versions` and installs Node.js and aube, so CI uses the same versions as local dev.
- **Caching:** `actions/cache@v4` on `~/.local/share/aube/store`, keyed on `aube-lock.yaml`.
- **Security:** `aube audit --audit-level moderate` fails the workflow on moderate-or-higher CVEs. Installs use `aube ci` with `paranoid: true` from `aube-workspace.yaml`.

### Concurrency

- `concurrency: group: pages` so only one Pages deployment runs at a time.

### Screenshots

- Generated during the release job (not a separate workflow). No screenshot commits back to the repo; the deployed site includes fresh screenshots each time.

## Prerequisites

- [mise](https://mise.jdx.dev/) with `.tool-versions` pinning Node and aube
- `aube-workspace.yaml` with paranoid security settings
- `puppeteer` in devDependencies
- `screenshots` script in package.json

## Local

```bash
mise install
aube install
aube run lint
aube test
aube run build
aube run screenshots   # optional: update public/screenshot.png and public/ambassy-social-preview.png
```
