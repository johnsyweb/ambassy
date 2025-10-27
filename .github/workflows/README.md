# GitHub Actions Workflows

This document describes the GitHub Actions workflows for CI, screenshot generation, and deployment.

## Workflow Chain

The workflows are chained together to avoid duplication:

1. **CI** - Runs tests, linting, and build on every push and pull request
2. **Screenshots** - Only runs after CI succeeds on main branch pushes
3. **Deploy** - Only runs after Screenshots completes successfully

## Files

### 1. `.github/workflows/CI.yml`

CI workflow that runs on every push and pull request to main.

**Steps:**

1. Checks out the code
2. Sets up Node.js and pnpm
3. Installs dependencies
4. Runs tests
5. Runs linting
6. Builds the project

### 2. `.github/workflows/screenshots.yml`

Automatically generates screenshots after CI succeeds on main branch pushes.

**Steps:**

1. Checks out the code
2. Sets up Node.js using the version from `.tool-versions`
3. Installs pnpm and dependencies
4. Builds the project
5. Installs Chrome dependencies (for Puppeteer)
6. Generates screenshots using `pnpm screenshots`
7. Commits and pushes updated screenshots back to the repository

**Requirements:**

- Requires `contents: write` permission to commit screenshots back to the repo
- Only runs after CI workflow succeeds
- Can also be triggered manually via workflow_dispatch

### 3. `.github/workflows/deploy.yml`

Deploys the built project to GitHub Pages after Screenshots completes.

**Steps:**

1. Checks out the code
2. Sets up Node.js and pnpm
3. Installs dependencies
4. Builds the project
5. Deploys to GitHub Pages

**Requirements:**

- Only runs after Screenshots workflow completes successfully
- Requires `contents: write` permission to deploy to GitHub Pages

### 4. `.tool-versions`

Specifies Node.js version 20 for GitHub Actions to use.

### 5. `script/generate-screenshots.ts`

Screenshot generation script that:

- Starts a local dev server
- Launches a headless browser using Puppeteer
- Captures screenshots at different viewport sizes
- Stops the dev server after completion
- Detects CI environment and adjusts browser settings accordingly

**Screenshots Generated:**

- `public/screenshot.png` (1200x800)
- `public/ambassy-social-preview.png` (1200x630)

## Prerequisites

All dependencies are already in place:

- ✅ `puppeteer` installed in `devDependencies`
- ✅ `ts-node` installed in `dependencies`
- ✅ Screenshot script created in `script/generate-screenshots.ts`
- ✅ `screenshots` script added to `package.json`
- ✅ GitHub Actions workflow files created

## Usage

### Local Screenshot Generation

```bash
pnpm screenshots
```

### CI Screenshot Generation

The GitHub Actions workflow will automatically:

1. Run on every push to the `main` branch
2. Build the project
3. Start a dev server
4. Generate screenshots
5. Commit and push the updated screenshots back to the repository

## Notes

- Screenshots are committed with `[skip ci]` to prevent infinite loops
- The workflow uses `PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome` in CI
- Uses Xvfb for headless browser display in CI
- Dev server runs on `http://localhost:8081/` by default
