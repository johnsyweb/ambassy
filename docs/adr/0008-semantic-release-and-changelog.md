---
status: accepted
---

# Semantic release and changelog

Ambassy is deployed to GitHub Pages on every merge to `main`. Version numbers and release history must stay accurate without manual bumping, and the footer must link to the changelog for the deployed version.

Domain terms: **App version**, **Changelog** in `CONTEXT.md`.

## Decision

1. **semantic-release on `main`** — after lint, test, and build pass, analyse conventional commits, generate `CHANGELOG.md`, bump `package.json`, create a git tag, publish a GitHub Release, and commit release assets back to `main`.
2. **Release then deploy** — deploy GitHub Pages from a post-release build so the footer shows the new version. Matches eventuate and foretoken.
3. **First release from full history** — no manual bootstrap; semantic-release derives the initial version from existing conventional commits on `main`.
4. **Footer version injection** — `public/index.html` holds placeholders (`__APP_VERSION__`, `__CHANGELOG_URL__`); `script/inject-app-version.cjs` reads `package.json` after webpack and writes the deployed `dist/index.html`. Changelog URL is tag-pinned: `…/blob/vX.Y.Z/CHANGELOG.md`.
5. **Docs-only skip** — skip semantic-release when a push to `main` changes only `docs/`, `specs/`, `CONTEXT.md`, `README.md`, or `.github/`. Still deploy Pages from the CI build artefact (footer version unchanged).
6. **commitlint** — enforce conventional commits locally (husky) and in CI on pull requests and `main` pushes.
7. **`script/release`** — `@semantic-release/exec` prepare step updates `package.json` to `${nextRelease.version}` before the git commit.

## Considered options

**Manual version bumps (rejected)** — error-prone; footer and `CHANGELOG.md` drift from reality.

**Deploy before release (rejected)** — footer would show the previous version until the next deploy.

**Always link changelog on `main` (rejected)** — tag-pinned URL matches the deployed version string.

## Consequences

- CI needs `contents: write` for semantic-release commits and tags.
- `map-dom-budget` still gates deploy; release job rebuilds with screenshots before upload.
- Contributors must use conventional commit messages (`feat:`, `fix:`, etc.).
- README documents the release workflow.
