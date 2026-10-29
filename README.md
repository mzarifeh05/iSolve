# iSolve Coding Club

A beginner-friendly, bilingual React/Vite website for iSolve, an iTeam club at Al-Zaytoonah University of Jordan. The four public pages are Home, About, Team, and Join. Arabic is the first-visit default; an explicitly selected language is remembered. Supabase provides optional live content, administrator authentication, and private image storage. Joining uses Google Forms, with no student accounts or separate registration database.

## Local setup

The application is directly in the outer `iSolve` GitHub repository; run commands here, without entering a nested application folder. Render uses Node.js 24.22.1 from `.node-version`.

```sh
npm ci --include=dev
npm run dev
```

Open Vite's printed Local URL. With **both Supabase configuration values absent**, public pages show the verified, bundled initial information in `src/data/initialContent.js`: the five supplied team members and photos, beginner FAQs, supplied contact links, and the supplied Google Form registration link. All members have the same general role and equal presentation. Names preserve the supplied spelling in both languages; biographies and expertise remain blank until confirmed. Manual ordering controls display order only.

This initial information is read-only. It is a deliberate unconfigured state, not sample data. A partial/invalid configuration or a configured database error produces an error/retry state; it never substitutes bundled content. The admin area shows configuration instructions until Supabase is connected. It never pretends to save local changes.

An explicit read-only preview is also available through `npm run dev:demo`; it visibly identifies demo mode and uses the same supplied information. Demo is disabled for production builds.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development; uses live Supabase when configured |
| `npm run dev:demo` | Explicit read-only demo preview |
| `npm run lint` | ESLint source checks |
| `npm test` | Focused utility/configuration checks |
| `npm run test:e2e` | Playwright browser verification after `npm run build` (requires Chrome) |
| `npm run build` | Production static build in `dist/` |
| `npm run preview` | Serve the latest production build locally |

## Connect Supabase

1. Create a **new** Supabase project. Copy `.env.example` to `.env.local`, then replace the URL and publishable-key placeholders with your project's actual values. Never put a database password, service-role key, secret key, or admin password in frontend files.
2. Apply these migrations in order through the trusted SQL editor as database owner, or use the Supabase CLI after linking the project:
   - `supabase/migrations/202610280001_club_schema.sql`
   - `supabase/migrations/202610280002_trainer_storage.sql`
   - `supabase/migrations/202610280003_initial_club_content.sql`
   - `supabase/migrations/202610290001_gallery.sql`
   - `supabase/migrations/202610290002_registration.sql`
   - `supabase/migrations/202610290003_gallery_copy.sql`
3. Disable public signups in Authentication settings. Create administrator users through the trusted Authentication → Users dashboard workflow and set their passwords through its invitation/setup flow.
4. Grant private administrator membership with the SQL below.
5. Restart Vite, open `/admin`, sign in, and edit actual club content. The initial migration supplies the same five team members, photos, FAQs, and contact links as the bundled mode. The new registration migration enables the supplied form.

The first three are simplified initial migrations for this site's **undeployed database**. The later migrations add the gallery, registration settings, and current gallery wording; existing installations apply only unapplied forward migrations. Do not apply them to an unrelated database or to a database with a previously applied version of this schema. Do not run them twice through the SQL editor; the CLI records migration versions. Put future live-schema changes in new migrations.

### First administrator

Copy the user's exact UUID from Authentication → Users and run this only in the **trusted Supabase SQL editor as database owner**:

```sql
insert into public.admin_members(user_id)
values ('REPLACE_WITH_AUTH_USER_UUID'::uuid)
on conflict (user_id) do nothing;
```

To revoke membership, use that trusted editor:

```sql
delete from public.admin_members
where user_id = 'REPLACE_WITH_AUTH_USER_UUID'::uuid;
```

Signing in alone grants no administrator access. Public team titles and editable Auth metadata do not affect authorization. `admin_members` has RLS and no client grants/policies; there is no public admin registration or membership editor. Never expose service-role credentials to work around a failing permission check.

## Content and permissions

The remaining tables are `trainers`, `faqs`, `gallery_photos`, `site_settings`, and protected `admin_members`. Every exposed table enables Row Level Security. Visitors and signed-in non-admins can read published team/FAQ/gallery records and public settings. Only privately approved administrators can create, edit, publish, delete, or reorder content.

The admin dashboard manages team profiles/photos, the photo gallery, FAQs, registration settings, and contact links. Use the ordering controls for team members and FAQs; order does not imply a hierarchy. Keep the same general public role for all members. Short biographies are optional; add only confirmed information. Introductory copy and general page text live in `src/i18n` translation files. Bilingual database fields fall back to the other language when a translation is absent.

### Photos

Supplied photos are bundled at `public/assets/team/`. Initial `photo_url` values use only those relative paths. The shared `imageUrl()` helper and database constraint also permit absolute HTTP(S) image URLs. Other relative paths, traversal, and SVG paths are rejected.

Admin replacements use the **private** `trainer-photos` bucket, restricted to JPEG/PNG/WebP and 3 MiB. Browser checks additionally validate file type, size, and basic file signatures. Only approved administrators may upload, replace, or delete objects. Public users can request a signed URL only for a file referenced by a published member. Draft and orphaned files remain private.

Signed URLs expire after one hour and are renewed through content refresh. A previously issued URL remains valid until expiry after unpublishing, so this feature is for public profile photos. Durable `photo_path` values are stored; signed URLs are generated when reading. Replacement saves the new record before removing the old file. Missing/inaccessible photos fall back to initials without discarding successfully fetched club content. Database-query errors remain visible.

## Registration and contact links

In Admin → Settings, enter the club's actual Google Form response URL, such as `https://docs.google.com/forms/d/e/FORM_ID/viewform` or its `https://forms.gle/...` short link, then enable registration. An optional form embed must use the HTTPS Google Forms embed URL with `embedded=true`. The direct Google Form button remains available with the iframe. The supplied iSolve 2026/2027 Google Form is configured. The response page was checked in Chrome (HTTP 200, form visible); no registration was submitted.

Announcements and current details are shared through the club's WhatsApp groups. No schedule, location, or group invite is invented. `whatsapp_url` is optional and accepts only an HTTPS `chat.whatsapp.com` group invite. A syntactically valid invite still needs to be checked in WhatsApp before publishing. No WhatsApp button appears until a valid invite is configured.

The user supplied these editable contact defaults:

- [Instagram](https://www.instagram.com/iteamzuj/)
- [Facebook](https://www.facebook.com/search/top?q=iteam%20-%20zuj)
- [LinkedIn](https://www.linkedin.com/company/iteamzuj/posts/?feedView=all)

No email, phone number, additional social account, or WhatsApp invite is provided. Leave unavailable fields blank. Google Form and invite validation checks allowed hosts/paths; it cannot confirm ownership, audience restrictions, or whether responses/invites remain open. Test the actual links when configured.

## Production deployment

For Render, follow the [step-by-step deployment guide](docs/render-deployment.md). The root `render.yaml` also supports Blueprint deployment, including the required React Router rewrite. With manual Static Site setup, leave Root Directory blank, build with `npm ci --include=dev && npm run build`, publish `dist`, and add the rewrite in the dashboard.

```sh
npm run lint
npm test
npm run build
```

Deploy `dist/` to a static SPA host. For live content, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the **build environment** and rebuild. Vite embeds these browser-safe values; changing runtime variables on a static host does not update the bundle. Leave both absent to publish the verified initial-information site with read-only administration and the supplied form link. A partial configuration deliberately shows a configuration error. Production always disables demo.

React Router history routes require serving `index.html` for URLs that do not match a real static file:

- Netlify/Cloudflare Pages: `public/_redirects` is copied to `dist` with `/* /index.html 200`.
- Vercel: add `{"rewrites":[{"source":"/((?!assets/).*)","destination":"/index.html"}]}` in `vercel.json`.
- Nginx: use `try_files $uri $uri/ /index.html;` in the site's location block.
- Sites: preserve the registered project ID in `.openai/hosting.json`; its static directory is `dist`.

Refresh `/about`, `/team`, `/join`, `/admin`, and an unknown route after deployment. Unknown or retired URLs should show the useful 404 page.

## Verification and configuration still required

`supabase/tests/security.sql` is a rollback-only integration suite for an isolated configured database after all migrations. It uses actual `anon` and `authenticated` roles/JWT claims to check published/draft visibility, blocked non-admin edits, ignored editable metadata, protected membership, administrator content changes, private draft photos, storage writes, and link constraints. Fixtures roll back.

The current migrations and suite were run successfully with local PGlite PostgreSQL and minimal Supabase Auth/Storage schema scaffolds. This verifies SQL and PostgreSQL role/RLS behavior, not a live project's Auth API, upload service, signed-URL HTTP responses, or bucket service limits. No Supabase credentials were supplied, so live sign-in, actual administrator saves, and real uploads require verification after setup. The Google Form response page is reachable. No WhatsApp invite was supplied. Actual form submission and account restrictions were not tested.

Completed checks include ESLint, a production build, nine utility/content tests, and seventeen Chrome browser checks covering all four public pages on desktop/phone, Arabic-first RTL, English switching and persistence, equal team cards and loaded portraits, exact configured contacts, registration links, retired URLs, production content, and the reduced read-only demo dashboard. No page errors or horizontal overflow were found. Browser tests require Google Chrome (or a changed Playwright channel) and a prior `npm run build`.

Before enabling live content, check approved-admin sign-in, non-admin denial, profile/FAQ create/edit/publish/delete/reorder, image replacement/removal and invalid-file rejection, and real Google Form availability. The optional WhatsApp invite still needs to be supplied if desired. Social links preserve the exact URLs supplied by the user; external account availability was not independently verified.

The hero now uses the supplied iSolve artwork, optimized and blended with the site palette. The favicon uses a background-extracted iSolve logo. Team and gallery photos are the supplied real originals, compressed without generative changes. See [asset notes](docs/hero-image.md).

Official references: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), and [Vite environment variables](https://vite.dev/guide/env-and-mode).

## Gallery import and measured image sizes

The Home gallery contains 16 unique photos, category filters, six-photo pagination, and an accessible uncropped lightbox. Prepared static assets work without credentials. A live Supabase gallery has not been imported. Follow [gallery setup and idempotent import](docs/gallery-setup.md) and review [measured variants and verification](docs/gallery-assets.md).
