---
status: accepted
---

# Renovate for dependency updates (replacing Dependabot)

Dependabot’s npm ecosystem does not refresh `aube-lock.yaml`. PRs that only touched `package.json` left frozen `aube ci` installs failing or stale, so automatic updates were unreliable for this aube-managed project. We want scheduled updates with a seven-day cooling period, supply-chain controls preserved, automerge when CI is green (including majors), and one local command for within-range bumps.

## Decision

1. **Mend Renovate (hosted)** owns npm, Docker, and GitHub Actions updates via [johnsyweb/renovate-config](https://github.com/johnsyweb/renovate-config) (extends jdx’s preset).
2. **aube-lock workflow** on `renovate/**` regenerates `aube-lock.yaml`, runs `./script/cibuild`, and publishes Check Runs on the final HEAD so automerge does not need a GitHub App (plain `GITHUB_TOKEN` commits do not retrigger workflows).
3. **Renovate membership** for which repos the Mend app can access is declared in [johnsyweb/github-infra](https://github.com/johnsyweb/github-infra).
4. **Atomic cutover** — remove `.github/dependabot.yml` and `dependabot-auto-merge.yml` in the same change as Renovate lands.
5. **Cooling** — Renovate `minimumReleaseAge: 7 days`; aube `minimumReleaseAge: 10080` (minutes) so local and CI match.
6. **Automerge** — Renovate platform automerge for all update types after green checks; majors stay in separate PRs.
7. **Commits** — Conventional Commits `chore(deps): …` for commitlint / semantic-release calm.
8. **Local** — `mise run update-deps` runs `aube outdated` then `aube update` (within ranges). `mise run update` remains “refresh after git pull”.
9. **allowBuilds** — fail closed; human review when a new lifecycle script appears.
10. **aube pin** — bump to `1.40.0` with the pilot (mise could not install `2.6.1` due to attestation identity drift toward `aubepkg/aube`).
11. **Repair stale Dependabot state** — Dependabot had advanced `package.json` (including `typescript` ^7) without refreshing `aube-lock.yaml`. Pin `typescript` to `~6.0.3` (compatible with current `ts-jest`) and regenerate the lock under aube 1.40.0 so frozen CI is truthful again.
12. **Unfixable advisories** — `aube audit --ignore-unfixable` so CI fails only when an upgrade path exists.

## Considered options

**Keep Dependabot + companion lock regen (rejected)** — less aligned with jdx’s path; Dependabot still does not understand aube.

**Self-hosted Renovate for postUpgradeTasks (rejected)** — more moving parts; jdx uses hosted Renovate + separate lock workflow.

**aube-lock GitHub App to retrigger CI (rejected)** — works, but is another identity to provision; Check Runs on the final SHA after in-job verify achieve the same automerge outcome as infrastructure-as-code in the workflow.

**Automerge minors only (rejected)** — upstream versioning is inconsistent; if CI is green, deliver.

## Consequences

- Install the Renovate GitHub App once (selected repos); keep membership in sync via github-infra.
- First success criterion: one full Friday 17:00 Melbourne cycle with open → lock regen → `renovate-verify` (and mirrored checks) green → automerge.
- Fleet rollout and hybrid migration rules live in [johnsyweb/renovate-config](https://github.com/johnsyweb/renovate-config).
