<!--
Sync Impact Report:
Version change: N/A → 1.0.0 (initial constitution)
Modified principles: N/A (new file)
Added sections: Core Principles, Quality Gates, Development Workflow, Governance
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
- Code MUST pass ESLint linting
- Code MUST pass TypeScript type checking
- All tests MUST pass
- Disused code MUST be removed immediately

**Rationale**: Prevents technical debt accumulation and ensures consistent code quality across the codebase. These gates are automated and non-negotiable to maintain project health.

### II. Test-Driven Development

Tests MUST be written for production code. Tests MUST NOT check whether code is running in a test environment - tests MUST test production code directly. Functions MUST have low cyclomatic complexity and high test coverage. Tests MUST NOT pollute the console.

**Rationale**: Ensures reliable, maintainable code with confidence in changes. Testing production code directly prevents test-specific code paths that diverge from production behaviour.

### III. Atomic Commits with Semantic Messages

Each change MUST be committed atomically with a meaningful, semantic commit message following Conventional Commits specification (<https://www.conventionalcommits.org/en/v1.0.0/>). Each commit MUST represent a complete, working change.

**Rationale**: Enables clear project history, easier debugging, and automated version management. Atomic commits make it easier to understand what changed and why.

### IV. Single Responsibility & Clean Architecture

Each component MUST have a single responsibility. Code layout MUST follow current structure with clear separation: models, actions, parsers, types, and utils. Prefer dedicated functions or named variables over explanatory comments.

**Rationale**: Maintains code clarity and makes the codebase easier to understand, test, and modify. Single responsibility reduces coupling and increases cohesion.

### V. Accessibility & User Experience

Every user input MUST be controllable from the keyboard. The user interface MUST be clean, consistent, accessible, and professional. Use Australian English for all user-facing text.

**Rationale**: Ensures the application is usable by all users, including those using assistive technologies. Professional UI builds trust and improves user satisfaction.

### VI. Open Source Preference

Favour free and open source libraries over implementing logic that requires custom testing and debugging. When choosing dependencies, prefer well-maintained open source solutions.

**Rationale**: Reduces maintenance burden, leverages community expertise, and ensures transparency. Open source libraries are typically well-tested and documented.

### VII. Documentation Currency

The README MUST remain up-to-date at all times. Documentation MUST reflect the current state of the project, including setup instructions, dependencies, and usage examples.

**Rationale**: Accurate documentation reduces onboarding time and prevents confusion. Outdated documentation is worse than no documentation.

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
2. Run `pnpm run lint` to verify all linting passes
3. Run `tsc --noEmit` to verify TypeScript type checking passes
4. Run `pnpm test` to verify all tests pass
5. Verify README is updated if changes affect setup or usage
6. Remove any disused code
7. Ensure commit message follows Conventional Commits format

### Code Review Requirements

All changes MUST:

- Pass all quality gates
- Follow single responsibility principle
- Include appropriate tests
- Maintain or improve test coverage
- Not introduce console pollution in tests
- Be keyboard accessible (for UI changes)
- Use Australian English (for user-facing text)

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

**Version**: 1.0.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-07
