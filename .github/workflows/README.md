# GitHub Actions Workflows

## CI/CD (ci-cd.yml)

Single workflow for validation, build, and deployment with caching and parallelism.

**Triggers:** Push and pull requests to `main`.

### Jobs

0. **verify-workflows** checks that every `uses:` reference in `.github/workflows/` is pinned to a 40-character commit SHA that exists on GitHub (`./script/verify-github-action-pins`). This job uses only `actions/checkout` (no cache) so invalid pins fail fast.
1. **lint**, **test**, and **audit** run in parallel (each calls `./script/…` after `./script/ci-install`).
2. **build** runs after all three pass; uploads `dist` artifact (retention 1 day).
3. **map-dom-budget** smoke test runs after build (`./script/smoke`).
4. **release** (on qualifying pushes to `main`) runs semantic-release, `./script/screenshots`, and `./script/build`.
5. **deploy-pages-*** jobs deploy `dist` to GitHub Pages.

### Tool versions and caching

- **mise** (`jdx/mise-action@v4` with `install: true`) reads `.tool-versions` and `mise.toml`, installing Node.js and aube.
- **Trust in CI:** the workflow sets `MISE_TRUSTED_CONFIG_PATHS` to the workspace so jobs can run `mise run …` without an interactive prompt. Locally, contributors should run `mise trust` only after reading `mise.toml` and the scripts it references (see README Getting started).
- **Caching:** `actions/cache@v4.2.0` (commit-pinned) on `~/.local/share/aube/store`, keyed on `aube-lock.yaml`.
- **Scripts:** CI jobs delegate to normalised scripts under `script/` (see README Getting started).
- **Dependencies:** `./script/ci-install` runs `aube ci` with `PUPPETEER_SKIP_DOWNLOAD=true` and `puppeteer.config.cjs` (`skipDownload: true`) so Puppeteer's postinstall does not download Chrome during lint, test, audit, or build — including inside aube's jailed builds, where environment variables are not always visible to lifecycle scripts. Browser jobs call `./script/install-chrome-for-puppeteer` or install system Chrome before screenshots.

### GitHub Action pinning

Every workflow `uses:` line must reference a **full 40-character commit SHA**, with the human-readable tag in a trailing comment (for example `actions/checkout@df4cb1c… # v6`). Tag or branch refs (`@v4`, `@main`) are rejected by `./script/verify-github-action-pins`. The verifier uses the public GitHub API (and `GH_TOKEN` when available).

When adding or bumping an action:

1. Resolve the commit SHA for the tag:
   ```bash
   gh api repos/actions/cache/git/ref/tags/v4.2.0 --jq '.object.sha'
   ```
   For annotated tags, follow `.object.sha` to the commit if needed:
   ```bash
   gh api repos/actions/cache/commits/$(gh api repos/actions/cache/git/ref/tags/v4.2.0 -q .object.sha) --jq .sha
   ```
2. Update the workflow with `owner/repo@<sha> # vX.Y.Z`.
3. Run `mise run verify-action-pins` (also included in `mise run cibuild`).

[Dependabot](https://docs.github.com/en/code-security/dependabot) (`github-actions` ecosystem in `.github/dependabot.yml`) opens weekly PRs to refresh pins; merge those after CI passes.

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
mise run cibuild   # verify action pins, lint, test, audit, build, smoke in sequence
```
