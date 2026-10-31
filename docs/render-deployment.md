# Deploy the static iSolve page on Render

The application lives directly in `C:\Users\Mohammed Zarifeh\Desktop\iSolve`. It needs **no environment variables or backend setup**. Registration opens the club's existing Google Form.

## Push your changes

From the outer repository folder:

```powershell
Set-Location -LiteralPath 'C:\Users\Mohammed Zarifeh\Desktop\iSolve'
git status
git add -A
git diff --cached --stat
git commit -m "Make iSolve a static single-page website"
git push origin main
```

If you already have a Render Static Site connected to `mzarifeh05/iSolve` on `main`, a push deploys when auto-deploy is enabled. Otherwise use Manual Deploy > Deploy latest commit.

## Create a new Static Site

1. Open [Render](https://dashboard.render.com/) and select **New > Static Site**.
2. Connect GitHub and choose `mzarifeh05/iSolve`.
3. Set the following values:

| Setting | Value |
| --- | --- |
| Name | `isolve-coding-club` or another available name |
| Branch | `main` |
| Root Directory | Leave blank |
| Build Command | `npm ci --include=dev && npm run build` |
| Publish Directory | `dist` |
| Start Command | None |
| Environment variables | None |

4. `.node-version` selects Node.js 24.22.1. Remove an old `NODE_VERSION` override, or match it to this version.
5. Click **Create Static Site** and wait for deployment. Open the assigned `onrender.com` URL.
6. Under **Redirects/Rewrites**, add `/*` → `/index.html` with action **Rewrite**. This lets old `/about`, `/team`, and `/join` bookmarks open the same page and scroll to the corresponding section. Normal navigation uses `#about`, `#team`, `#moments`, `#registration`, and `#faq`.

If old Supabase or demo variables exist in Render, remove them: this version does not use them. No migrations, accounts, API keys, or gallery imports are needed. `npm run deploy` was removed; Render builds the site directly from GitHub.

These settings follow [Render Static Sites](https://render.com/docs/static-sites), [rewrites](https://render.com/docs/redirects-rewrites), and [Node version selection](https://render.com/docs/node-version).

## Optional Blueprint setup

The root `render.yaml` declares the Static Site, build command, publish directory, and rewrite. Choose **New > Blueprint** to apply that file instead of creating a manual service. Do not create a second service if you already have one. Merely committing `render.yaml` does not apply its routing rule to a manually created Static Site. See [Render's Blueprint reference](https://render.com/docs/blueprint-spec).

## Check after deployment

Open a fresh browser window and confirm Arabic/RTL, then switch to English and refresh. Scroll through the sections in order, check the mobile menu, and confirm the header registration button remains visible. All registration buttons should open the same Google Form. Check the team portraits, gallery filters, all 20 photos through Show more, the full-image viewer, and the FAQ accordion. No sign-in or administration interface should appear.

Future content changes happen in the repository and require another build/deploy. Refer to the main README for the content files.
