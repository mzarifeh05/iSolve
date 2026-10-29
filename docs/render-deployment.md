# Deploy iSolve on Render

The application now lives directly in `C:\Users\Mohammed Zarifeh\Desktop\iSolve`, alongside its original GitHub `.git` directory. Its remote remains `https://github.com/mzarifeh05/iSolve`, on branch `main`. There is no nested application repository or Git submodule. The old generated gh-pages cache was moved outside the project to the Windows temporary directory; it is not part of the source or deployment. See [completed verification and its limits](verification.md).

## 1. Choose whether you need live administration

You can deploy the current public website immediately without Supabase. Leave **both** `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` unset. Home, About, Team, Join, the 16-photo gallery, bilingual content, supplied contacts, and the registration form link all work from the prepared content. `/admin` explains that Supabase needs configuration; it cannot save changes in this mode. Update source files and redeploy to change bundled content.

For administrator sign-in, editable content, and new image uploads, complete the Supabase steps in section 5 **before** adding those two variables to Render. A partially configured database does not fall back to bundled content. A live-content build deliberately removes static gallery copies, so import the gallery first.

The supplied Google Form link is already configured. No additional registration backend is needed. A WhatsApp invitation remains optional; no button appears until a valid invitation is supplied.

## 2. Push the new root layout to GitHub

Open PowerShell in the outer directory and review the changed files:

```powershell
Set-Location -LiteralPath 'C:\Users\Mohammed Zarifeh\Desktop\iSolve'
git status
git add -A
git diff --cached --stat
git commit -m "Move app to repository root and prepare Render deployment"
git push origin main
```

The moves normally appear as renames after staging. `.gitignore` excludes `node_modules`, `dist`, local environment files, test outputs, and Sites runtime files. Keep `.env.example`, `.env.demo`, and `.env.production`: they contain placeholders or mode flags, not credentials. Do not commit an actual `.env.local`.

The local migration does not itself push GitHub changes or create a Render service. Verify that GitHub now shows `package.json`, `src`, `public`, and `render.yaml` at the repository root.

## 3. Create a Render Static Site

1. Sign in to [Render](https://dashboard.render.com/) and choose **New > Static Site**.
2. Connect GitHub and select **mzarifeh05/iSolve**. Grant Render access to that repository if prompted.
3. Enter these settings:

| Setting | Value |
| --- | --- |
| Name | `isolve-coding-club`, or another available name |
| Branch | `main` |
| Root Directory | Leave blank (repository root) |
| Build Command | `npm ci --include=dev && npm run build` |
| Publish Directory | `dist` |
| Start Command | None; Static Sites do not use one |
| Environment variables | None for the bundled public site |

4. `.node-version` selects Node.js **24.22.1**. If an existing Render service has a `NODE_VERSION` override, remove it or set it to `24.22.1`, because that override takes precedence.
5. Click **Create Static Site** and wait for the deployment to finish. Render assigns the actual `https://<name>.onrender.com` address; the requested name might be unavailable.
6. Open the site's **Redirects/Rewrites** settings and add:

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

7. Save the rule. This allows direct visits and refreshes at `/about`, `/team`, `/join`, and `/admin`. Render serves existing assets normally. The existing `_redirects` file is for other hosts; use Render's own rule here.

These settings follow [Render Static Sites](https://render.com/docs/static-sites), [rewrites](https://render.com/docs/redirects-rewrites), and [Node version selection](https://render.com/docs/node-version).

### Optional: use the included Blueprint instead

Choose **New > Blueprint**, connect the same repository and `main` branch, and apply the root `render.yaml`. It declares the Static Site, build command, publish directory, and rewrite together. Use this instead of creating a second manual service. Simply having `render.yaml` in the repository does not apply its rewrite to a manually created Static Site. See [Render's Blueprint reference](https://render.com/docs/blueprint-spec).

## 4. Verify the deployed website

1. Open Home in a fresh browser context: Arabic and RTL should be the default. Switch to English, refresh, and confirm it persists.
2. Visit and refresh `/about`, `/team`, and `/join` directly. Confirm all five team portraits load and the registration button opens the supplied Google Form.
3. Scroll to the Home gallery. Check its category filters, Show more, full image viewer, keyboard navigation, and closing with Escape. Confirm the category reads **ZCC Contest** and the winner captions read **Celebrating the winners** in English.
4. Check the phone navigation and browser tab icon. An unknown route should display the website's 404 page.
5. Without Supabase, `/admin` should display the setup message. With Supabase, verify approved-admin sign-in, content saves, publishing, and photo upload/replacement; a signed-in non-admin must be denied.

Future pushes to the linked branch deploy automatically when auto-deploy is enabled. Change that setting in Render if you prefer manual deployments. A custom domain can be connected later in the site's Settings; it is not required for the first deployment.

## 5. Optional: configure Supabase for the admin dashboard

1. Create a Supabase project. Follow [the main README](../README.md#connect-supabase) and apply all **six** SQL migrations in filename order from `supabase/migrations`. The README lists each file. For an existing database, apply only migrations that have not already been applied.
2. In Supabase Authentication, disable public signups and create your administrator account through the trusted Users dashboard. Copy its user UUID and grant membership in the SQL editor:

```sql
insert into public.admin_members(user_id)
values ('REPLACE_WITH_AUTH_USER_UUID'::uuid)
on conflict (user_id) do nothing;
```

3. Import the prepared real gallery using [the gallery import instructions](gallery-setup.md#connect-and-import-into-supabase). In a trusted **local** terminal, provide `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as process environment variables, then run `npm run gallery:import`. Remove the import secret from that terminal environment afterward. This is a one-time, resumable task; do not add it to the Render build command or expose its key to the browser.
4. In Render's **Environment** settings, add only these browser-safe build values:

| Key | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Your actual `https://<project>.supabase.co` URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your project's publishable key |

5. Save and rebuild/redeploy the Static Site. Vite embeds these values at **build time**; changing them requires a new build. Do not copy the placeholders from `.env.example` into Render. Do not set `VITE_DEMO_MODE=true` for production; demo remains disabled by the application in production builds.
6. In Supabase **Authentication > URL Configuration**, set **Site URL** to your actual Render URL (or custom domain) and add the exact URLs used by any invitation/password-reset redirect flows to **Redirect URLs**. Update them when changing the domain. This site currently signs administrators in with email and password; it does not implement a dedicated password-reset page. See [Supabase redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls).
7. Verify actual sign-in, permissions, published gallery visibility, and uploads against the live project. The local SQL checks use Supabase schema scaffolds, so they do not replace testing live Auth/Storage services.

Never place a service-role key, Supabase secret key, database password, or administrator password in `VITE_*` variables or frontend files. The public URL and publishable key are intended for browser use; database and storage RLS enforce access. See [Supabase API keys](https://supabase.com/docs/guides/api/api-keys) and [Vite environment variables](https://vite.dev/guide/env-and-mode).

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Build cannot find `package.json` | Push the root-layout changes and leave Render Root Directory blank. |
| Build cannot find Vite or Sharp | Use the documented command with `npm ci --include=dev`. |
| A nested URL returns Render's 404 | Add `/*` → `/index.html` with action **Rewrite**, not Redirect. |
| Public pages show a configuration error | Supply both real Supabase values after setup, or remove both and rebuild for bundled content. |
| Live gallery is empty | Apply gallery migrations and run the local gallery import against the same Supabase project. |
| Admin signs in but is denied | Add the exact Auth user UUID to `admin_members` through the trusted SQL editor. |
| Changed environment values have no effect | Trigger a new build/deployment; the frontend bundle already contains the previous values. |

