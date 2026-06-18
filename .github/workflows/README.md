# GitHub Actions Workflows

## CI/CD (ci-cd.yml)

Single workflow for validation, build, and deployment with caching and parallelism.

**Triggers:** Push and pull requests to `main`.

### Jobs

1. **lint**, **test**, and **audit** run in parallel (each calls `./script/…` after `aube ci`).
2. **build** runs after all three pass; uploads `dist` artifact (retention 1 day).
3. **map-dom-budget** smoke test runs after build (`./script/smoke`).
4. **release** (on qualifying pushes to `main`) runs semantic-release, `./script/screenshots`, and `./script/build`.
5. **deploy-pages-*** jobs deploy `dist` to GitHub Pages.

### Tool versions and caching

- **mise** (`jdx/mise-action@v4` with `install: true`) reads `.tool-versions` and `mise.toml`, installing Node.js and aube.
- **Trust in CI:** the workflow sets `MISE_TRUSTED_CONFIG_PATHS` to the workspace so jobs can run `mise run …` without an interactive prompt. Locally, contributors should run `mise trust` only after reading `mise.toml` and the scripts it references (see README Getting started).
- **Caching:** `actions/cache@v4` on `~/.local/share/aube/store`, keyed on `aube-lock.yaml`.
- **Scripts:** CI jobs delegate to normalised scripts under `script/` (see README Getting started).

### Concurrency

- `concurrency: group: pages` so only one Pages deployment runs at a time.

### Screenshots

- Generated during the release job (not a separate workflow). No screenshot commits back to the repo; the deployed site includes fresh screenshots each time.

## Prerequisites

- [mise](https://mise.jdx.dev/) with `.tool-versions` pinning Node and aube
- `mise.toml` tasks wrapping `script/` lifecycle scripts
- `aube-workspace.yaml` with paranoid security settings
- `puppeteer` in devDependencies

## Local

```bash
mise run setup
mise run lint
mise run test
mise run build
mise run cibuild   # lint, test, audit, build, smoke in sequence
```
