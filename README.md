# Husky + Commitlint + Semantic Release

Automated commit validation and versioning workflow using industry-standard tools.

## Benefits

- **Husky + Commitlint**: Industry standard, actively maintained, works seamlessly with modern JavaScript tooling
- **Native GitHub Actions**: No third-party actions needed, uses built-in `GITHUB_TOKEN` for security
- **Semantic Release**: Fully automated versioning based on conventional commits, generates changelogs, and creates GitHub releases

## Objectives

- **Automated CHANGELOG.md**: Create a CHANGELOG.md that contains commits by type, links to commits and comparisons organized by date, and updated on each release
- **Semantic Versioning**: Follow Semantic Versioning (i.e., MAJOR.MINOR.PATCH) when a PR is merged into main - find the last tag, review commits since last release, and determine version bump
- **Custom labels/scopes**: A commit should include a known custom label `feat(api):` when creating a commit message. Any unknown label will be rejected by default, forcing a clean message

## Getting Started

Fork this repository to use it as a template for your project, or follow the Quick Start guide below to add these tools to an existing project.

## Quick Start

```bash
# Install dependencies
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional semantic-release @semantic-release/changelog @semantic-release/git

# Initialize Husky
npx husky init

# Remove default pre-commit hook (optional)
rm .husky/pre-commit

# Create commit-msg hook
echo "npm run commitlint \${1}" > .husky/commit-msg

# Add scripts to package.json
npm pkg set scripts.commitlint="commitlint --edit"
npm pkg set scripts.prepare="husky"
```

## Configuration Files

### commitlint.config.js

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
    // Require scope to be present
    "scope-empty": [2, "never"],
    // Enforce specific scopes (your custom labels)
    // Scope must be one of the listed values
    "scope-enum": [
      2,
      "always",
      [
        // Add your custom labels here!
        "api",
        "web",
        "backend",
        "front-end",
      ],
    ],
  },
};
```

### .releaserc.json

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md"
      }
    ],
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json", "package-lock.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```

### .github/workflows/release.yml

```yaml
name: Release

on:
  pull_request:
    types: [closed]
    branches:
      - main
  workflow_dispatch: # Allow manual triggers

permissions:
  contents: read

jobs:
  release:
    # Only run if PR was actually merged (not just closed)
    if: github.event.pull_request.merged == true
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      id-token: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          ref: main # Ensure we're on main branch

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "lts/*"

      - name: Install dependencies
        run: npm install # Can use npm clean-install if package-lock.json is included

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release
```

## Commit Message Format

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>
```

### Required Scopes

All commits must include a scope from this list, defined in the `commitlint.config.js` scope-enum list:

- `api`
- `web`
- `backend`
- `front-end`

### Valid Types

- `feat`: A new feature (triggers minor version bump)
- `fix`: A bug fix (triggers patch version bump)
- `docs`: Documentation changes
- `style`: Code style changes (formatting, whitespace)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

### Examples

**Valid commits:**

```bash
feat(web): add welcome screen with animations
fix(api): resolve credit card validation issue
docs(front-end): update API documentation
refactor(backend): improve button component accessibility
perf(api): optimize database queries
```

**Invalid commits:**

```bash
feat: add welcome screen (missing scope)
feat(random): add feature (invalid scope)
feat(FrontEnd): add feature (wrong case - use kebab-case)
```

## Demo Workflow

### Step 1: Create Feature Branch

```bash
# Start from dev
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/welcome-screen

# Make changes
echo "const WelcomeScreen = () => {};" > WelcomeScreen.js
git add WelcomeScreen.js

# Commit with REQUIRED scope
git commit -m "feat(web): add welcome screen with animations"

# Push feature branch
git push origin feature/welcome-screen
```

### Step 2: Merge Feature into Dev

```bash
# Create PR: feature/welcome-screen → dev
# After approval and merge, no release is created
# Dev is for integration only
```

### Step 3: Merge Dev into Main (Creates Release)

```bash
# Create PR: dev → main
# Title: "Release v1.x.x" or "Merge dev for production release"
#
# When squashing, write a comprehensive commit message with scope:
# feat(web): add complete check-in experience
#
# - Welcome screen with animations
# - User identification flow
# - Confirmation screen
#
# After approval and merge...
```

**Result:** 🎉 GitHub Actions automatically:

- Analyzes all commits since last release
- Determines version bump (feat = minor, fix = patch)
- Creates/updates CHANGELOG.md in repository
- Commits CHANGELOG.md back to main branch
- Creates GitHub Release with notes
- Tags the release in Git

### Step 4: Verify Release

1. Go to **Actions** tab → See "Release" workflow running
2. Go to **Releases** tab → See new release created
3. Check repository → CHANGELOG.md file created/updated
4. Check commits → Automated commit: `chore(release): 1.0.0 [skip ci]`
5. Version follows semantic versioning based on commits

## Branch Protection Setup

Protect your branches to enforce the workflow:

### Protect Main Branch

**Settings** → **Branches** → **Add branch protection rule**

Branch name pattern: `main`

**Enable:**

- ✅ **Require a pull request before merging**
  - Require approvals: 1 (or more)
- ✅ **Require status checks to pass before merging**
  - Add status checks if you have CI tests
- ✅ **Require conversation resolution before merging**
- ✅ **Do not allow bypassing the above settings** (recommended)
- ❌ **Allow force pushes** (keep disabled)
- ❌ **Allow deletions** (keep disabled)

## Troubleshooting

### Hooks not triggering

```bash
# Reinstall hooks
npx husky install
```

### Missing test script error

```bash
# Remove default pre-commit hook
rm .husky/pre-commit
```

### Semantic-release not creating releases

- Ensure you're pushing to the `main` branch
- Check GitHub Actions tab for errors
- Verify `GITHUB_TOKEN` has proper permissions
- Make sure at least one commit follows conventional format

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
