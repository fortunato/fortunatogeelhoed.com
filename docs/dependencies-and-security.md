# Dependencies and security

How dependency updates and supply-chain security are set up in this repository, and how to work with
them day to day. For why these choices were made, see [`decisions.md`](decisions.md).

## Dependency updates (Renovate)

Renovate is installed as a GitHub App and reads its configuration from
[`.github/renovate.json`](../.github/renovate.json) on the default branch. It opens grouped update
pull requests on a weekly schedule and tracks everything pending in a single dependency dashboard
issue, which is also where an update can be requested on demand.

Grouping and merge behavior:

- Patch and minor updates are grouped into one pull request and merged automatically once checks
  pass.
- Lockfile maintenance refreshes `bun.lock` on a schedule and merges automatically.
- GitHub Actions digest updates are grouped and merged automatically.
- Major upgrades to React, Vue, and Angular are grouped on their own and require manual review.

Automatic merges use GitHub's native auto-merge, so they only complete after the required continuous
integration check is green.

## Pinned Actions and images

Third-party GitHub Actions and container base images are pinned to full commit digests, with the
version in a trailing comment:

```yaml
uses: actions/checkout@<40-char-sha> # v4.3.1
```

Renovate keeps these digests current. When adding a new Action or image, pin it the same way rather
than using a floating tag.

## Security scanning

- CodeQL ([`.github/workflows/codeql.yml`](../.github/workflows/codeql.yml)) runs static analysis on
  pushes to `main`, on pull requests, and on a weekly schedule. Findings appear in the repository's
  Security tab.
- OpenSSF Scorecard ([`.github/workflows/scorecard.yml`](../.github/workflows/scorecard.yml)) scores
  the supply-chain posture and publishes the result, shown as a badge in the README.
- Dependabot alerts are left on as a passive backstop for vulnerability advisories. Dependabot's own
  update pull requests are disabled so they do not duplicate Renovate.

## Reporting a vulnerability

Security issues are reported privately through GitHub's vulnerability reporting, as described in
[`SECURITY.md`](../SECURITY.md).
