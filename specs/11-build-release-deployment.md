# 11 — Build, Release and Deployment

## npm scripts

| Script               | Command                                                | Purpose                                           |
| -------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| `generate:changelog` | `node scripts/generate-changelog.js`                   | Version and in-app changelog from `CHANGELOG.md`  |
| `dev`                | `npm run generate:changelog && vite`                   | Development server on port 3000                   |
| `build`              | `npm run generate:changelog && vite build`             | Production build to `dist/` (with service worker) |
| `preview`            | `vite preview`                                         | Serve the production build locally                |
| `lint`               | `eslint .`                                             |                                                   |
| `format`             | `prettier --write .`                                   |                                                   |
| `format:check`       | `prettier --check .`                                   |                                                   |
| `test`               | `npm run generate:changelog && vitest run`             | Run all tests once                                |
| `test:watch`         | `npm run generate:changelog && vitest`                 |                                                   |
| `check`              | `npm run lint && npm run format:check && npm run test` | Local quality gate                                |

`package.json` declares `"type": "module"`, `"license": "MIT"` and `"engines": { "node": ">=22.12.0" }`.

## Versioning

- [Semantic Versioning](https://semver.org/): new feature → minor, fix → patch.
- `CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/): `## [X.Y.Z] - YYYY-MM-DD` sections, newest first, with `### Added`, `### Changed`, `### Fixed`, `### Removed`, `### Deprecated`, `### Security` subsections, written for users.
- The first version found in `CHANGELOG.md` **is** the application version ([ADR-05](09-constraints-and-decisions.md)). Documentation-only changes do not need a new version.
- Commit messages follow Conventional Commits with the version for releases, e.g. `feat: v1.5.0 random draw with slot-machine name reel`, `fix: v1.4.3 …`, `docs: …`, `chore: …`.

## Release procedure

1. Add the `CHANGELOG.md` entry.
2. Run `npm run check` and `npm run build`.
3. Commit (including the regenerated `package.json` and `src/changelog.js`).
4. Create an annotated tag `vX.Y.Z` on the release commit.
5. Push `main` and the tag.

## Continuous deployment

Workflow `.github/workflows/deploy.yml` ("Deploy to GitHub Pages"):

- Triggers: push to `main`, manual `workflow_dispatch` (on a branch or a tag).
- Permissions: `contents: read`, `pages: write`, `id-token: write`; concurrency group `pages`, cancelling in-progress runs.
- **build** job (ubuntu-latest): checkout → setup Node 24 with npm cache → `npm ci` → `npm run lint` → `npm run format:check` → `npm test` → `npm run build` → upload `./dist` as Pages artifact.
- **deploy** job: needs build; environment `github-pages`; `actions/deploy-pages`.
- The `github-pages` environment allows deployments from branch `main` and tags `v*` only.

## Rollback

Run the workflow manually on a release tag (Actions → Deploy to GitHub Pages → Run workflow → Tags → `vX.Y.Z`). Rules:

- Only tagged versions can be redeployed; the next push to `main` redeploys `main`.
- Never roll back below **v1.4.0** (no service worker before; devices would stay on the cached version).
- Local data is kept (compatible formats, [NFR-DAT-04](06-non-functional-requirements.md)).
- For a permanent rollback, `git revert` the faulty commits on `main` instead.

The user-facing procedure is documented in `docs/how-to/deploy-and-rollback.md`.
