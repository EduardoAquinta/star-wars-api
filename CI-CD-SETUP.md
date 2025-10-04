# CI/CD Setup Guide

This project uses GitHub Actions for continuous integration and continuous deployment.

## Overview

The CI/CD pipeline automatically runs on:
- **Push** to `main` or `develop` branches
- **Pull Requests** targeting `main` or `develop` branches

## Pipeline Jobs

### 1. Backend Tests (`backend-tests`)
- Runs Jest unit tests with coverage
- **Coverage requirement**: 75% branches, 66% functions, 92% statements, 92% lines
- Uploads coverage to Codecov (optional)
- **Runtime**: ~30-60 seconds

### 2. Frontend Tests (`frontend-tests`)
- Runs Cucumber E2E tests with Puppeteer
- Starts the application server
- Runs 11 scenarios with 55 steps
- Uploads HTML test report as artifact
- **Runtime**: ~30-60 seconds

### 3. Code Quality (`code-quality`)
- Runs `npm audit` to check for security vulnerabilities
- Continues even if vulnerabilities are found (non-blocking)
- **Runtime**: ~10-20 seconds

### 4. Build Validation (`build`)
- Verifies the application builds and starts successfully
- Tests HTTP endpoint accessibility
- Only runs if backend and frontend tests pass
- **Runtime**: ~20-30 seconds

### 5. CI Success (`ci-success`)
- Summary job that runs if all checks pass
- Provides success confirmation

## GitHub Actions Free Tier

GitHub Actions provides:
- **2,000 minutes/month** for private repositories (free)
- **Unlimited minutes** for public repositories (free)

Our pipeline uses approximately:
- **~2-3 minutes per run**
- Estimated runs per month (assuming 100 commits): **200-300 minutes**
- **Well within free tier limits** ✅

## Setup Instructions

### 1. Push to GitHub

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/star-wars-api.git
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Actions

GitHub Actions is enabled by default. Once you push, the workflow will run automatically.

### 3. View Pipeline Status

- Go to your GitHub repository
- Click on the **Actions** tab
- You'll see all workflow runs and their status

### 4. Branch Protection (Optional but Recommended)

Set up branch protection rules to require CI checks before merging:

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select status checks:
     - `Backend Unit Tests (Jest)`
     - `Frontend E2E Tests (Cucumber)`
     - `Code Quality Checks`
     - `Build Validation`

### 5. Add Status Badge (Optional)

Add a badge to your README to show build status:

```markdown
[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/star-wars-api/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/star-wars-api/actions/workflows/ci.yml)
```

## Workflow File Location

`.github/workflows/ci.yml`

## Understanding the Pipeline

### On Push to Main/Develop

```
┌─────────────────────────────────────────┐
│  Push to main/develop                   │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ Backend Tests │   │Frontend Tests │
└───────┬───────┘   └───────┬───────┘
        │                   │
        └─────────┬─────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ Code Quality  │   │Build Validation│
└───────┬───────┘   └───────┬───────┘
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
        ┌─────────────────┐
        │   CI Success    │
        └─────────────────┘
```

### On Pull Request

Same workflow runs on PR commits. Status checks appear on the PR page.

## Local Testing

Before pushing, you can test locally:

```bash
# Run backend tests
npm test

# Run frontend tests
npm run test:cucumber

# Run all tests
npm run test:all

# Check for vulnerabilities
npm audit
```

## Troubleshooting

### Pipeline Fails on Backend Tests

- Check test coverage thresholds in `package.json`
- Run `npm test` locally to reproduce
- Review failed test output in Actions logs

### Pipeline Fails on Frontend Tests

- Ensure application starts successfully
- Check if port 3000 is available
- Run `npm run test:cucumber` locally
- Review Cucumber report artifact in Actions

### Pipeline Times Out

- Default timeout is 6 hours (GitHub Actions limit)
- Our pipeline should complete in 2-3 minutes
- If timing out, check for infinite loops or hanging processes

### Chromium Dependencies Error

The workflow installs required dependencies for Puppeteer automatically:
```yaml
- name: Install Chromium dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y libnss3 libatk-bridge2.0-0 ...
```

If this fails, the dependency list may need updating.

## Cost Optimization

To minimize GitHub Actions usage:

1. **Use Pull Requests**: Only run on important branches
2. **Skip CI**: Add `[skip ci]` to commit message to skip pipeline
3. **Conditional Jobs**: Use `if` conditions to skip unnecessary jobs
4. **Cache Dependencies**: We cache `node_modules` with `actions/setup-node@v4`

## Monitoring Usage

Track your GitHub Actions usage:
1. Go to **Settings** → **Billing**
2. Click on **Usage this month**
3. View Actions minutes used

## Advanced: Adding Codecov Integration

To get code coverage reports:

1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Get your upload token
4. Add to GitHub Secrets: `CODECOV_TOKEN`
5. The workflow will automatically upload coverage

## CI/CD Best Practices

✅ **We follow:**
- Fast feedback (2-3 minute pipeline)
- Parallel job execution
- Clear job names and descriptions
- Artifact uploads for debugging
- Security scanning with npm audit
- Coverage tracking

## Future Enhancements

Consider adding:
- **Deployment automation** to AWS when merging to main
- **Slack/Discord notifications** on build failure
- **Dependabot** for automated dependency updates
- **Scheduled runs** for nightly builds
- **Performance testing** with Lighthouse CI
- **Docker image builds** and pushes

## Support

If you encounter issues with the CI/CD pipeline:
1. Check the Actions tab for error details
2. Review the job logs
3. Run tests locally to reproduce
4. Check GitHub Actions status: https://www.githubstatus.com/
