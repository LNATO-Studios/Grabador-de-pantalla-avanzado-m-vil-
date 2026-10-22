---
name: devops-best-practices
description: Best practices for DevOps: GitHub Actions workflows, scripts, CI/CD, secrets, security, caching, and release automation.
---

# DevOps Best Practices

## General principles
- Automate everything reproducible; keep scripts idempotent and POSIX-friendly.
- Prefer declarative workflows (YAML) over ad-hoc manual steps; version control all config.
- Fail fast: lint, test, build in that order; cache dependencies.
- Keep pipelines minimal and observable: clear step names, artifacts, and status badges.

## GitHub Actions
- Pin actions to full commit SHAs or trusted version tags; avoid `@main`/`@latest`.
- Use least-privilege `permissions:` at workflow and job level; default `contents: read`.
- Use environments with protection rules for deploys; require approvals.
- Store secrets in GitHub Secrets; never echo them; mask with `::add-mask::`.
- Avoid script injection: don't interpolate untrusted input into `run:`; use env vars and `github.event` carefully.
- Use `concurrency` groups to cancel stale runs.
- Cache with `actions/cache` keyed by lockfiles; restore-keys fallback.
- Use matrix builds for multi-platform/version; limit matrix size.
- Artifacts: upload build outputs with retention; download in deploy jobs.
- Reusable workflows/composite actions for DRY; keep them in separate repo when shared.
- Use `workflow_dispatch` for manual runs; `pull_request` for PR checks.

## Scripts
- Shebang `#!/usr/bin/env bash`; `set -euo pipefail`.
- Quote variables; use arrays for argument lists; avoid `eval`.
- Make scripts executable and documented (usage, exit codes).
- Validate inputs; provide `--dry-run` where applicable.
- Log to stderr; keep stdout machine-readable.
- Avoid hardcoding paths; use relative/`$GITHUB_WORKSPACE`.
- Clean up temp files with traps.

## Security
- Scan dependencies (Dependabot/Snyk/CodeQL); run SAST in CI.
- Sign releases and artifacts; use SBOM.
- Protect default branch; require PR reviews and status checks.
- Rotate tokens; use OIDC for cloud auth instead of long-lived secrets.
- Limit third-party action usage; review permissions.

## Release and deployment
- Semantic versioning; automated changelog from conventional commits.
- Build once, deploy many; promote immutable artifacts.
- Health checks/smoke tests post-deploy; rollback plan.
- Feature flags for gradual rollout.

## Observability
- Upload test results and coverage; publish metrics.
- Notify on failure (Slack/Teams) with context.
- Keep logs concise; avoid printing secrets.

## Anti-patterns
- Committing secrets or tokens.
- `permissions: write-all`.
- Unpinned actions from untrusted sources.
- Long-running steps without timeout.
- Manual steps not codified.
