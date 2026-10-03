---
status: accepted
---

# Renovate for dependency updates (replacing Dependabot)

Dependabot’s npm ecosystem does not refresh `aube-lock.yaml`. PRs that only touched `package.json` left frozen `aube ci` installs failing or stale, so automatic updates were unreliable for this aube-managed project. We want scheduled updates with a seven-day cooling period, supply-chain controls preserved, automerge when CI is green (including majors), and one local command for within-range bumps.

## Decision

1. **Mend Renovate (hosted)** owns npm, Docker, and GitHub Actions updates via [johnsyweb/renovate-config](https://github.com/johnsyweb/renovate-config) (extends jdx’s preset).
2. **aube-lock workflow** on `renovate/**` regenerates `aube-lock.yaml` after Renovate pushes (wrapper pinned to johnsyweb/renovate-config → jdx implementation).
3. **Atomic cutover** — remove `.github/dependabot.yml` and `dependabot-auto-merge.yml` in the same change as Renovate lands.
4. **Cooling** — Renovate `minimumReleaseAge: 7 days`; aube `minimumReleaseAge: 10080` (minutes) so local and CI match.
5. **Automerge** — Renovate platform automerge for all update types after green CI; majors stay in separate PRs.
6. **Commits** — Conventional Commits `chore(deps): …` for commitlint / semantic-release calm.
7. **Local** — `mise run update-deps` runs `aube outdated` then `aube update` (within ranges). `mise run update` remains “refresh after git pull”.
8. **allowBuilds** — fail closed; human review when a new lifecycle script appears.
9. **aube pin** — bump to `1.40.0` with the pilot (mise could not install `2.6.1` due to attestation identity drift toward `aubepkg/aube`).
10. **Repair stale Dependabot state** — Dependabot had advanced `package.json` (including `typescript` ^7) without refreshing `aube-lock.yaml`. Pin `typescript` to `~6.0.3` (compatible with current `ts-jest`) and regenerate the lock under aube 1.40.0 so frozen CI is truthful again.

## Considered options

**Keep Dependabot + companion lock regen (rejected)** — less aligned with jdx’s path; Dependabot still does not understand aube.

**Self-hosted Renovate for postUpgradeTasks (rejected)** — more moving parts; jdx uses hosted Renovate + separate lock workflow.

**Automerge minors only (rejected)** — upstream versioning is inconsistent; if CI is green, deliver.

## Consequences

- Install the Renovate GitHub App on this repository; optional aube-lock GitHub App secrets retrigger CI after lock commits.
- First success criterion: one full Friday 17:00 Melbourne cycle with open → lock regen → green CI → automerge.
- Fleet rollout and hybrid migration rules live in [johnsyweb/renovate-config](https://github.com/johnsyweb/renovate-config).
