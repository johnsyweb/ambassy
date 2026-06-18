---
status: accepted
---

# aube with paranoid mode for package management

Ambassy depends on a large npm dependency tree for build, test, release, and screenshot automation. Supply-chain attacks on package registries and install-time lifecycle scripts are a meaningful risk for a project that runs headless browsers in CI and publishes static assets to GitHub Pages. We moved from pnpm to [aube](https://aube.en.dev/) with strict install-time protections rather than continuing with a conventional package manager alone.

## Decision

1. **aube as the sole package manager** — native `aube-lock.yaml` (imported from the former pnpm lock); retire `pnpm-lock.yaml`. Atomic cutover across local dev, CI, Husky hooks, Dockerfile, and docs.
2. **`paranoid: true`** in `aube-workspace.yaml` — jailed builds, strict store integrity, strict dependency-build review, OSV malicious-package checks, and a hard 24-hour minimum release age.
3. **Explicit build approval** — dependency lifecycle scripts run only when listed in `allowBuilds` after review (`aube approve-builds` during migration; committed map in `aube-workspace.yaml`).
4. **Release-age gate escape hatch** — accept the 24-hour gate by default; add packages to `minimumReleaseAgeExclude` in a deliberate PR when an emergency security bump cannot wait.
5. **CVE audit in CI** — dedicated job running `aube audit --audit-level moderate` (fail on moderate, high, and critical; ignore low).
6. **Version pinning** — `aube` in `.tool-versions`, `packageManager: "aube@…"` in `package.json`, and `packageManagerStrictVersion: true` so version mismatches fail loudly.
7. **CI bootstrap via mise** — `jdx/mise-action` installs Node and aube from `.tool-versions`; cache the aube store keyed on `aube-lock.yaml`; frozen installs via `aube ci`.
8. **Docker** — install a pinned aube release binary in the image (no mise in the container); same version as `packageManager`.

## Considered options

**Keep `pnpm-lock.yaml` with aube as installer (rejected)** — lockfile name and semantics still say pnpm after leaving pnpm; weakens the “one toolchain” story.

**Phased cutover (CI-first or dev-first) (rejected)** — mixed package managers defeat paranoid guarantees and confuse contributors until cutover completes.

**aube without paranoid mode (rejected)** — faster installs but no jailed builds, no strict build review, and weaker protection against freshly published malicious packages.

**Pre-emptive `minimumReleaseAgeExclude` for core packages (rejected)** — weakens the age gate for the packages attackers target most often.

**Wait 24 hours for every emergency bump, no exclude list (rejected)** — leaves no practical path during an active CVE when a patched release is younger than the gate.

**Audit at all severities or install-time checks only (rejected)** — low-severity noise in transitive dev dependencies is common; install-time OSV checks do not catch CVEs disclosed after the lockfile was committed.

**Pre-seed or bulk-approve `allowBuilds` without review (rejected)** — misses transitive native builds and bypasses the sniff warnings meant to inform approval.

**mise inside Docker (rejected)** — unnecessary image complexity when a pinned release binary suffices.

## Consequences

- Contributors need [mise](https://mise.jdx.dev/) and run `aube install` / `aube ci`; README documents commands (`aube test`, `aube run build`, etc.).
- CI can fail on moderate-or-higher CVEs even when the lockfile is unchanged; fixing may require dependency updates or `overrides` in `aube-workspace.yaml`.
- New or updated dependencies with lifecycle scripts require an explicit `allowBuilds` entry before CI passes under `strictDepBuilds`.
- Paranoid mode may refuse known-malicious packages at install time (for example, the npm `fs` polyfill was removed in favour of Node’s built-in module).
- Emergency dependency bumps within the release-age window need a visible exclude commit; remove or revisit once versions age out.
- See `.github/workflows/README.md` for CI job layout; operational detail stays out of this ADR.
