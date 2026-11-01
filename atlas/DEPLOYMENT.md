# GitHub Pages deployment

Target repository: `Penson88/skills-introduction-to-github`.

- Source branch: `submerged-geographies` (keeps the existing course `main` unchanged).
- Website branch: `gh-pages`, containing only the production build, geographic assets and `.nojekyll`.
- Expected project address after Pages is enabled and its build succeeds: `https://penson88.github.io/skills-introduction-to-github/`. This address is **not evidence of an active deployment**; check the actual Pages configuration and HTTP response.

Resource URLs now resolve relative to the published document, so the geographic map works under a GitHub project path as well as at a domain root. No custom domain is configured and no paid services are needed.

## Build and publish updates

```sh
cd atlas
npm ci
npm test
npm run build
bash scripts/publish_pages.sh
```

The publisher uses the existing HTTPS Git authentication, a temporary Git index and `git commit-tree`. It leaves the source worktree/index untouched, reads and preserves the previous remote website commit, and uses an ordinary non-forced push. A concurrent update is rejected rather than overwritten. Run with a normal Git author identity configured. No credential values are written into the build or script. Only the `dist/` directory is published.

For the first publication, use GitHub repository **Settings → Pages → Build and deployment → Deploy from a branch → gh-pages → / (root) → Save**. If existing settings already configure another live site, review them before replacing it. GitHub generates the site asynchronously; a successful Git push is not proof that the public site is available.

To verify: read the Pages URL from repository settings/API, request its HTML and `data/research.json`, check actual JS/CSS responses, then open it in a WebGL-capable browser and enter the Three Gorges. Keep the explicit evidence-gap notices: the bundled atlas has no verified historic water masks, affected-settlement dataset or DEM.

From this cloud environment, GitHub administration and HTTP validation need `api.github.com` and `penson88.github.io` in the active network policy, not merely a saved draft. Git repository access does not establish Pages administration scope. If the API reports insufficient permission, enable the first Pages publication in the repository UI; do not paste tokens into chat.

## Publication attempt: 2026-11-01

Confirmed remote source commit: `57aedc07de367dde4c1e7b792d9f6e6675ae07e2` on `submerged-geographies`.
Confirmed remote static site commit: `f7f95e35eee9f4f6cf063ec5f99ab37957da5928` on `gh-pages`.
The ordinary Git pushes succeeded and both refs were independently read back with `git ls-remote`.
No existing Pages branch was overwritten. Course `main` remains unchanged.

Pages activation and public HTTP availability remain unconfirmed. Both `api.github.com` and `penson88.github.io` were still denied by the active proxy policy after the allowlist was saved to the environment draft. The running environment still reported revision 1 with no custom allowed hosts. Saving that draft does not apply it. To finish without changing the cloud runtime, open the repository Pages settings and select **Deploy from a branch / gh-pages / (root)**, then save. Only the repository owner/admin can complete a UI-only setting when the agent cannot reach the administrative API. Do not treat the expected website URL as verified live until GitHub completes its Pages build.
