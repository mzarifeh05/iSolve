# Real photo gallery

Home includes the gallery before the final registration call to action. No public page was added. The initial collection has 16 unique photos, four filters including All, and six-entry pages (6, 6, 4). The sticker appears once; the optional duplicate copy is never listed. Both differently named `during session` photos remain. The category is labeled ZCC Contest (Zaytoonah Coding Contest). All three winner captions say “Celebrating the winners,” with no standings; previous-edition recognition is separate. Unknown dates are null.

## Prepared assets and local mode

The supplied originals remain outside the repository. `scripts/gallery-catalog.mjs` maps source filenames to descriptive slugs, bilingual captions/visual alt text, category, framing and manual order. `scripts/gallery-import-manifest.json` maps SHA-256 content hashes and deterministic record IDs to all variant paths/dimensions. It is a preparation/import artifact, never imported by frontend JavaScript.

To regenerate once, from the project directory:

```powershell
npm run gallery:prepare -- 'C:\Users\Mohammed Zarifeh\Desktop\ZCC\Facebook Post'
```

The Sharp script applies orientation, strips camera metadata, writes WebP/JPEG thumbnails at 320/640/960 pixels wide without upscaling, and full-view images with a longest edge at most 1920. Files use source-content hashes in their paths. It writes per-category static metadata pages under `public/gallery-data/v1/`. Public code fetches only the selected six-entry metadata page as the section approaches view. Filters reset pagination and fetch that category; it does not first fetch an all-photo manifest. Larger images are requested only when opened. No paid image transformation service is required.

The shipped no-credentials mode publishes the verified photos as static assets. All 16 are intentionally published. It is not a database fallback: configured API errors show retry states. When either Supabase build variable is present, the production build removes bundled gallery assets/metadata from **dist only**, so those copies cannot bypass private storage policies after an admin unpublishes an imported record. Keep preparation assets in the source checkout for import.

## Connect and import into Supabase

1. Apply the three initial migrations in the README if starting a new database.
2. Apply `supabase/migrations/202610290001_gallery.sql`, `202610290002_registration.sql`, and `202610290003_gallery_copy.sql` in order. They add the gallery, registration link, and current wording without rewriting earlier migrations. Existing installations apply only unapplied migrations. The copy migration also updates records imported before the wording change.
3. In a trusted terminal process, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the project URL and its administrative import key. Do not put this secret in frontend files, `VITE_*`, command arguments, Git, or browser storage. The script reads environment values only and never prints them.
4. Run `npm run gallery:import` from this project. It checks existing paths and content hashes, uploads only missing optimized variants, and creates only missing records. Re-running preserves later admin edits and does not duplicate records/files. A partial run can be resumed. It never uploads camera originals.
5. Remove the administrative import key from the terminal environment when finished. Configure only the browser-safe URL/publishable key for the application, then rebuild and deploy.

No Supabase credentials were supplied during this implementation. The prepared static gallery is working; the live database has **not** been populated.

## Administration

After the trusted admin membership setup in the README, `/admin` → Photo gallery supports adding/replacing photos, captions and alt descriptions in Arabic/English, category, optional event labels/date, numeric display order, fit/focal position, publishing and confirmed deletion. The list fetches six records at a time, including drafts only for approved admins. Numeric ordering plus UUID gives a stable public ordering even when orders match.

Browser uploads accept decoded JPEG/PNG/WebP files up to 25 MiB. The browser creates optimized WebP/JPEG variants once before upload, never on public visits. Source hashes prevent duplicate entries. Replacement saves the new metadata before cleaning up old variants; save failure attempts upload cleanup. The private bucket accepts only WebP/JPEG variants up to 5 MiB each.

Every gallery table has RLS. Public queries read only published records. Storage SELECT policies check that a requested variant belongs to published metadata; admin membership gates all writes and draft reads. A technical admin role is independent of any visible team label. Signed URLs last one hour; an already issued URL may remain usable until expiry after unpublishing. Bundled profile portraits are separate from private gallery uploads.

The demo dashboard is visibly read-only and does not save or upload.

## Verification

`npm test` verifies the 16 unique hashes, intended order/category mapping, both session photos, one sticker, exact prepared dimensions, no upscaling, and category/page splits. `npm run test:e2e` after a build verifies Arabic/English, desktop/mobile/tablet framing, 6/6/4, filters, lightbox focus/RTL keys/Escape/scroll lock, and deferred network requests under mobile throttling. See [measured sizes](gallery-assets.md).

Run `supabase/tests/security.sql` and `supabase/tests/gallery-security.sql` as database owner in an isolated configured database after migrations. Each rolls back its fixtures. Both passed locally in PGlite with minimal Supabase Auth/Storage scaffolds. This checks SQL/RLS behavior; live Auth, signed URL HTTP responses, bucket limits, and real admin uploads still require configured Supabase verification.
