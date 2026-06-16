# Contributing

This is a personal portfolio repository. It is open source so the code can be read; outside
contributions are welcome but not expected. The notes below describe how the project is developed.

## Getting started

See the Getting Started section of the [README](README.md) for installing Bun, the pinned Node
version, and dependencies, and for running the site in development.

## Workflow

Development is trunk-based. `main` is protected and is never pushed to directly; every change lands
through a pull request that passes continuous integration before it merges. Branches are short-lived.

A typical change:

```bash
git switch -c short-description
# make the change
git commit -am "feat: short description"
git push -u origin HEAD
gh pr create --fill
gh pr merge --auto --squash --delete-branch
```

The last command queues the pull request to merge as soon as the build is green, then deletes the
branch.

## Before you push

Continuous integration runs linting, type checking, unit and component tests, an accessibility scan,
end-to-end and cross-framework visual tests. To catch the common failures locally first:

```bash
bun run lint        # Biome; use lint:fix to apply formatting
bun run typecheck
bun run test:unit
```

Formatting is enforced by Biome, so a formatting difference will fail the build. Running `bun run
lint` before pushing avoids it.

## Commits

Commit messages are semantic and written on a single line, for example `chore(ci): pin action
digests`. Avoid multi-line, generated-looking summaries.

## Dependencies and security

Dependency updates and supply-chain practices are documented in
[`docs/dependencies-and-security.md`](docs/dependencies-and-security.md). In short: prefer few,
well-justified dependencies, and pin any new GitHub Action or container image by commit digest.
