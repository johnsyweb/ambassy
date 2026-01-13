<!--
Sync Impact Report:
Version change: 1.2.0 → 1.3.0 (added explicit linting error prevention and CI enforcement)
Modified principles: 
  - I. Quality Gates - Added explicit linting requirements (zero errors, fix errors in modified files, CI enforcement)
  - Pre-Commit Checklist - Made mandatory, added requirement to fix all lint errors in modified files
  - Pre-Push Checklist - Added CI verification requirement
  - Code Review Requirements - Added CI passing requirement and lint error fixing requirement
Added sections: 
  - Linting Requirements (in Quality Gates)
  - CI Enforcement (in Quality Gates)
  - Automated Enforcement (in Quality Gates)
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section exists and aligns
  ✅ spec-template.md - No constitution-specific constraints, aligns with quality requirements
  ✅ tasks-template.md - Aligns with test-first and quality requirements
Follow-up TODOs: None
-->

# Ambassy Constitution

## Core Principles

### I. Quality Gates (NON-NEGOTIABLE)

All code MUST pass quality gates before commit:
- Code MUST be formatted with Prettier
- Code MUST pass ESLint linting (zero errors, zero warnings)
- Code MUST pass TypeScript type checking
- All tests MUST pass
- Disused code MUST be removed immediately

**Linting Requirements**:
- When modifying a file, ALL linting errors in that file MUST be fixed, even if they existed before your changes
- New code MUST NOT introduce any linting errors or warnings
- Linting errors MUST be fixed before committing, not deferred
- The codebase MUST maintain zero linting errors at all times

**CI Enforcement**:
- CI MUST run linting, type checking, tests, and build on every push and pull request
- CI MUST fail (block merge) if any quality gate fails
- Pull requests MUST NOT be merged if CI fails
- The main branch MUST always pass all quality gates

Code MUST NOT be pushed to any remote repository if there are build failures or linting errors. All quality gates MUST pass before pushing commits to shared branches (including main, feature branches, or any remote repository).

**Automated Enforcement** (Recommended):
- Pre-commit hooks SHOULD be configured to run linting and type checking before allowing commits
- If pre-commit hooks are not configured, developers MUST manually run the Pre-Commit Checklist before every commit
- The Pre-Commit Checklist is NOT optional - it is the minimum requirement for every commit

**Rationale**: Prevents technical debt accumulation and ensures consistent code quality across the codebase. These gates are automated and non-negotiable to maintain project health. Prohibiting pushes with build failures prevents broken code from entering shared repositories, protecting the entire team from build breakage and ensuring the main branch always remains in a deployable state. Requiring fixes to existing lint errors in modified files prevents technical debt from accumulating and ensures the codebase quality improves over time rather than degrading.

### II. Test-Driven Development

Tests MUST be written for production code. Tests MUST NOT check whether code is running in a test environment - tests MUST test production code directly. Functions MUST have low cyclomatic complexity and high test coverage. Tests MUST NOT pollute the console. Tests MUST NOT be skipped without explicit confirmation from the project maintainer.

**Rationale**: Ensures reliable, maintainable code with confidence in changes. Testing production code directly prevents test-specific code paths that diverge from production behaviour. Skipping tests without approval risks introducing regressions and technical debt.

### III. Atomic Commits with Semantic Messages

Each change MUST be committed atomically with a meaningful, semantic commit message following Conventional Commits specification (<https://www.conventionalcommits.org/en/v1.0.0/>). Each commit MUST represent a complete, working change.

**Rationale**: Enables clear project history, easier debugging, and automated version management. Atomic commits make it easier to understand what changed and why.

### IV. Single Responsibility & Clean Architecture

Each component MUST have a single responsibility. Code layout MUST follow current structure with clear separation: models, actions, parsers, types, and utils. Comments MUST be avoided where code can be made self-documenting through clear naming, dedicated functions, or named variables. Comments are a failure to express intent clearly in code and often become outdated or misleading.

**Rationale**: Maintains code clarity and makes the codebase easier to understand, test, and modify. Single responsibility reduces coupling and increases cohesion. Self-documenting code eliminates the need for comments that can become lies when code evolves but comments don't. See <https://johnsy.com/blog/2012/10/31/comments-are-lies/> for rationale.

### V. Accessibility & User Experience

Every user input MUST be controllable from the keyboard. The user interface MUST be clean, consistent, accessible, and professional. Use Australian English for all user-facing text.

**Rationale**: Ensures the application is usable by all users, including those using assistive technologies. Professional UI builds trust and improves user satisfaction.

### VI. Open Source Preference

Favour free and open source libraries over implementing logic that requires custom testing and debugging. When choosing dependencies, prefer well-maintained open source solutions.

**Rationale**: Reduces maintenance burden, leverages community expertise, and ensures transparency. Open source libraries are typically well-tested and documented.

### VII. Documentation Currency

The README MUST remain up-to-date at all times. Documentation MUST reflect the current state of the project, including setup instructions, dependencies, and usage examples.

**Rationale**: Accurate documentation reduces onboarding time and prevents confusion. Outdated documentation is worse than no documentation.

### VIII. Production/Test Parity

Code MUST behave identically in production and test environments. Environment-specific behaviour MUST be achieved through configuration, not code branches. Tests MUST exercise the same code paths that run in production.

**Rationale**: Eliminates "works on my machine" problems and ensures tests accurately reflect production behaviour. Configuration-based differences are explicit and testable, while code branches create hidden divergence.

### IX. Twelve-Factor App Principles

The application MUST follow the Twelve-Factor App methodology (<https://12factor.net/>) where applicable:
- Configuration via environment variables
- Stateless processes
- Disposability (fast startup and graceful shutdown)
- Development/production parity
- Logs as event streams
- Admin processes as one-off processes

**Rationale**: Twelve-Factor principles ensure applications are portable, scalable, and maintainable. They promote best practices for modern application development and deployment.

## Technology Standards

**Language**: TypeScript (strict mode enabled)

**Package Manager**: pnpm

**Testing Framework**: Jest

**Build Tool**: Webpack

**Code Quality**: ESLint + Prettier

**Target Platform**: Modern web browsers (ES6+)

**Project Type**: Single-page web application

## Development Workflow

### Pre-Commit Checklist

Before every commit, developers MUST:

1. Run `pnpm run lint:fix` to format and fix linting issues
2. Run `pnpm run lint` to verify all linting passes (zero errors, zero warnings)
3. Fix ALL linting errors in any files you modified, even if the errors existed before your changes
4. Run `tsc --noEmit` to verify TypeScript type checking passes
5. Run `pnpm test` to verify all tests pass
6. Verify README is updated if changes affect setup or usage
7. Remove any disused code
8. Ensure commit message follows Conventional Commits format

**This checklist is MANDATORY, not optional.** If pre-commit hooks are not configured, developers MUST manually verify each step before committing. Skipping this checklist violates the constitution and risks introducing technical debt.

### Pre-Push Checklist

Before every push to a remote repository, developers MUST:

1. Verify all quality gates pass (linting with zero errors/warnings, type checking, tests)
2. Verify the build completes successfully (`pnpm run build` or equivalent)
3. Ensure no build failures or linting errors exist in the current branch
4. Confirm all commits in the push follow Conventional Commits format
5. Verify that CI will pass by running the same checks locally that CI runs

**Enforcement**: 
- If any build failure or linting error is detected, the push MUST be aborted until all issues are resolved
- Broken builds or linting errors MUST NOT enter shared repositories
- If CI fails after pushing, the issues MUST be fixed immediately and pushed in a new commit
- Pull requests with failing CI MUST NOT be merged until CI passes

### Code Review Requirements

All changes MUST:

- Pass all quality gates (linting with zero errors/warnings, type checking, tests, build)
- Have passing CI before merge (CI failure blocks merge)
- Fix ALL linting errors in files modified, even if errors existed before
- Follow single responsibility principle
- Include appropriate tests
- Maintain or improve test coverage
- Not introduce console pollution in tests
- Not skip tests without explicit approval
- Behave identically in production and test environments
- Be keyboard accessible (for UI changes)
- Use Australian English (for user-facing text)

**CI Status**: Pull requests MUST NOT be merged if CI is failing. All CI checks (linting, type checking, tests, build) MUST pass before merge approval.

### Feature Development Process

1. Use `/speckit.specify` to create feature specification
2. Use `/speckit.plan` to create implementation plan
3. Use `/speckit.tasks` to generate actionable tasks
4. Implement following TDD principles
5. Ensure all quality gates pass
6. Update README if needed
7. Commit with semantic message

## Governance

This constitution supersedes all other development practices. All code changes MUST comply with these principles.

**Amendment Procedure**: Constitution amendments require:
- Documentation of the change rationale
- Update to affected templates and documentation
- Version bump following semantic versioning
- Update to this governance section if amendment process changes

**Versioning Policy**: Constitution versions follow semantic versioning:
- **MAJOR**: Backward incompatible principle removals or redefinitions
- **MINOR**: New principle added or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, typo fixes

**Compliance Review**: All pull requests and code reviews MUST verify compliance with constitution principles. Non-compliance MUST be addressed before merge.

**Runtime Guidance**: See `README.md` for project setup, development workflow, and usage instructions.

**Version**: 1.3.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-13
