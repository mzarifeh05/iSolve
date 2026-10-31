# Static single-page verification

Checked on October 31, 2026, from the outer `iSolve` repository.

- ESLint passed. The production Vite build passed with one application script and one stylesheet; no administration bundle is emitted.
- **8 unit/content checks passed**, including every gallery WebP/JPEG variant's real dimensions, 20 unique source hashes, all four added photos, stable 6/6/6/2 pagination, supplied team names and destinations, bilingual fallback, and actual zero-alpha pixels in the shared transparent logo.
- **13 Chrome browser checks passed; 1 skipped.** The skip is the desktop duplicate of the mobile-only network check; the mobile check passed. Tests run against the production build at desktop and phone sizes and also exercise 820-pixel tablet and 320-pixel narrow layouts.
- Browser checks verify the six main sections in the requested order, native anchor navigation with correct sticky-header clearance, persistent registration access, six buttons pointing to the exact supplied Google Form (none in About or Team), Arabic-first RTL and remembered English, four equal team cards and working portraits including Rakan's updated JPEG, header/footer logo loading, footer social links, FAQ interaction, and old bookmark redirects. Thursday gathering details appear in both languages.
- Gallery checks cover deferred six-photo metadata pages, filters, all 20 entries, actual loading of the four new photos, full images on demand, uncropped portraits, keyboard arrows in RTL, Escape, focus trapping/restoration, scroll locking, and stable frame layout.
- The shared logo, favicon sizes, and hero artwork were refreshed to remove the version label using the built-in image tool. These raster edits were inspected visually. The actual transparent logo alpha is verified by a unit check. Real gallery photos and Rakan's supplied photo receive only image optimization.
- `npm run assets:check` verifies that every public file is referenced by source or gallery metadata and that referenced files exist. All 183 public files passed; no missing or unused public assets remain. Superseded images and legacy helpers were removed. Original external source photos remain untouched.
- Source and dependency checks found no Supabase client, authentication, administrator operations, SQL migrations, upload/import command, environment-variable requirements, or React Router dependency. Browser checks found no Supabase/Auth/REST requests.
- Only the original outer `.git` directory remains inside the project. The GitHub remote/history were preserved.

The production dependency audit reported zero advisories. The full development-tooling audit reports five moderate findings in the existing ESLint/minimatch dependency chain; no forced downgrade or major override was applied. These are development tools and are not part of the browser bundle.

Registration links and their new-tab behavior are checked; no Google Form response was submitted. GitHub push and Render deployment are separate from these local checks. See [deployment instructions](render-deployment.md) and [measured assets](gallery-assets.md).
