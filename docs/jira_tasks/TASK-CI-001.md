# TASK-CI-001: Enable Manual Workflow Dispatch on GitHub Pages Deployment

## 1. Objective
Enable manual triggering of the GitHub Pages deployment workflow directly from the GitHub Actions web interface by adding `workflow_dispatch:` to `.github/workflows/deploy.yml`.

## 2. Technical Scope
File: `.github/workflows/deploy.yml`
Add `workflow_dispatch:` under the `on:` trigger list:
```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:
```

## 3. Acceptance Criteria
1. [x] YAML syntax is valid.
2. [x] Pushing to GitHub triggers automatic deployment and enables the "Run workflow" button in the UI.
