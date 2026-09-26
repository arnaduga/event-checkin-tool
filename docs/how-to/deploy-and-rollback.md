# Deploy a Release and Roll Back

This guide explains how a new version is published to GitHub Pages, and how to redeploy a previous version if something goes wrong.

The application is served from `https://event.zgur.net/` by the **Deploy to GitHub Pages** workflow (`.github/workflows/deploy.yml`).

## Publish a new version

1. Add an entry at the top of `CHANGELOG.md` with the new version number (`## [X.Y.Z] - YYYY-MM-DD`). This is the only place where the version is set; `package.json` and the in-app changelog are updated from it on the next `dev`, `build` or `test` run.
2. Run the checks locally:

   ```bash
   npm run check   # lint + formatting check + tests
   npm run build
   ```

3. Commit the changes, including the regenerated `package.json` and `src/changelog.js`.
4. Tag the release commit with an annotated tag matching the version:

   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   ```

5. Push the branch and the tag:

   ```bash
   git push origin main vX.Y.Z
   ```

The push to `main` starts the workflow: lint, formatting check, tests, build, then deployment. If any step fails, nothing is deployed and the previous version stays online.

Tagging every release is what makes it possible to redeploy it later.

## Roll back to a previous version

1. On GitHub, open **Actions** → **Deploy to GitHub Pages**.
2. Click **Run workflow**.
3. In **Use workflow from**, open the **Tags** tab and select the version to deploy (e.g. `v1.4.1`).
4. Click **Run workflow**.

The selected version is built from its own source code (and its own version of the workflow) and deployed. `main` is not modified.

To go forward again, run the workflow on a more recent tag, or on `main`.

### Rules and limits

- **Only tagged versions can be redeployed.** The `github-pages` environment accepts deployments from the `main` branch and from tags matching `v*`. Any other branch or tag is refused.
- **The next push to `main` overrides a rollback.** Every push to `main` deploys `main` automatically. While a rolled-back version must stay online, do not push to `main`.
- **Do not roll back below v1.4.0.** Offline support (PWA service worker) was introduced in v1.4.0. Older builds have no service worker file, so devices that already opened a PWA version cannot update: they keep showing the cached version until their browser data is cleared. Rolling back between versions from v1.4.0 onwards is safe: each deployment updates devices automatically on their next visit with network.
- **Participant data is kept.** Data lives in each browser's `localStorage`, not on the server, and its format is compatible across 1.4.x versions in both directions. Fields unknown to an older version (e.g. `absent`) are ignored by it.

## Alternative: revert on `main`

If the rolled-back state should become permanent, revert the faulty commits on `main` instead:

```bash
git revert --no-edit <last-good-commit>..HEAD
git push origin main
```

This keeps the history and deploys the reverted code through the normal workflow, including lint and tests.

## Check what is online

The deployed version is shown in the Settings panel (version link at the bottom). From a terminal:

```bash
curl -sL https://event.zgur.net/ | grep -oE 'assets/index-[^"]+\.js'
# then search that file for the version number
```

The workflow runs, with the commit or tag each one deployed, are listed in **Actions** → **Deploy to GitHub Pages**.
