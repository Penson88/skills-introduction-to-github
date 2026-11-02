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

GitHub subsequently triggered its native **pages build and deployment** workflow. Its public run record confirmed **WORKFLOW_RUN_STATUS_COMPLETED / WORKFLOW_RUN_CONCLUSION_SUCCESS** in 50 seconds, with the deployment URL:

**https://penson88.github.io/skills-introduction-to-github/**

Deployment evidence: https://github.com/Penson88/skills-introduction-to-github/actions/runs/41351581837

No manual Pages activation is pending. The GitHub-reported deployment succeeded. Direct HTTP/browser validation of the public site from this executor remains blocked by the active network policy for `penson88.github.io`; local production-subpath browser checks passed with no failed assets or JavaScript errors. `api.github.com` is also still blocked in the running revision despite the saved allowlist draft. The deployment result was read through GitHub's permitted public workflow HTML, without bypassing the proxy or extracting credentials.

## Full-reservoir layer update: 2026-11-01

Source implementation: `827de99ff9dc7ac53947f505fd97752f863df538`.
Published website build: `f48751a88862ec725affaf8a65f09ce455937705`.
GitHub reported **Success** for https://github.com/Penson88/skills-introduction-to-github/actions/runs/41354110508 and linked https://penson88.github.io/skills-introduction-to-github/ .

The release opens at the full-reservoir study window and includes direct layer buttons, dated habitation filtering, source-located WRI dam information and a guarded actual-observation playback mechanism. Production-subpath browser checks passed without failed resources or JavaScript page errors. Current shipped `research.json` still has zero water observations and zero dated habitation records; the animation is therefore disabled on real site data. Synthetic tests do not populate the public map. Source acquisition remains blocked until the saved official-source network configuration is applied.

## Selected local position · 2 November 2026

The user supplied latitude **30.825152**, longitude **110.999284**. Source commit: `6a81ae0`. Static Pages commit: `d5ae105f3cb150f1df6176f5e4b84f2ae984ec70`.
GitHub Pages confirmed **completed / success**: https://github.com/Penson88/skills-introduction-to-github/actions/runs/41371946414 . The same public site now opens at the user-selected point and restricts navigation to the nearby local area. Header reset and guided views stay local. The production-browser check measured a 0.5-pixel center error before and after reset, without JavaScript errors. The marker is a user-supplied navigation point, not a sourced historic habitation feature or a verified street survey.
