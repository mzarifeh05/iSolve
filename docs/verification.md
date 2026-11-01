# Static single-page verification

Checked on November 1, 2026, from the outer `iSolve` repository.

- The production Vite build passed. One application script and one stylesheet are emitted; there is no backend or administration bundle.
- **9 unit/content checks passed**, including all 24 unique photo hashes, actual dimensions of every WebP/JPEG variant, uncropped framing, six-photo pagination, four current team members, supplied destinations, bilingual fallback and actual zero-alpha pixels in the shared logo.
- Video checks validate both MP4 files' complete top-level boxes, fast-start metadata before media, measured bytes, preserved full source duration, H.264/AAC codec reports and working WebP/JPEG posters. Both source clips are compressed from 67,339,049 to 3,924,617 bytes total.
- **17 Chrome browser checks passed; 1 skipped.** The skip is the desktop duplicate of the mobile-only network test; the mobile test passed. Tests use the production build on desktop and phones, plus 820-pixel tablet and 320-pixel narrow layouts.
- Both videos were actually decoded and played in desktop and mobile Chrome. Tests check no MP4 requests before pressing play, native controls, real dimensions/durations, pause-others behavior, pausing offscreen, and recovery after a simulated failed load. The exact motto and translated clip copy are checked in Arabic and English.
- Gallery checks cover all 24 photos, new images loading on the first page, All pagination 6/6/6/6, Training 6/1, ZCC 6/6, Club Moments 5, deferred metadata/full-image loading, filters, uncropped portraits, RTL keys, Escape, focus trapping/restoration, scroll locking and stable layout.
- Browser checks also verify the six sections in order, anchor navigation beneath the sticky header, six direct Google Form buttons (none in About or Team), Arabic-first RTL and remembered English, four equal team cards, portraits, header/footer logos, social links, FAQ interaction and old bookmark redirects. Thursday details remain in both languages.
- Desktop/mobile session-highlight screenshots were visually inspected. Gallery photos receive only orientation and image optimization; video source content and original files remain unchanged, apart from removing empty side bars in the prepared second clip.
- `npm run assets:check` passed for **all 222 public files**, with no missing or unused assets. Original source photos/videos stay outside the repository. FFmpeg tools and source videos are not added as dependencies or shipped in the project.
- Source/dependency configuration remains static: no database, environment variables, authentication, administrator operations or React Router. Browser checks found no Supabase/Auth/REST requests. The original outer Git repository and GitHub remote remain intact.

No dependencies changed in this update. The previous production audit reported zero advisories; the existing development-tooling audit recorded five moderate ESLint/minimatch findings. No forced downgrade or major override was applied.

Registration destinations and new-tab behavior are checked; no Google Form response was submitted. Changes are local. GitHub push and Render deployment are separate from these checks. See [deployment](render-deployment.md) and [measured media](gallery-assets.md).
