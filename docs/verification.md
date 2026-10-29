# Verification after moving the application

Checked on October 29, 2026, from the outer `iSolve` repository.

- Preserved the existing `.git`, `main` branch, history, and GitHub origin (`https://github.com/mzarifeh05/iSolve`). No submodules or additional `.git` files/directories remain inside the project. The generated gh-pages cache was moved to `C:\Users\Mohammed Zarifeh\AppData\Local\Temp\isolve-gh-pages-cache-20261029` so its disposable repository is outside the project.
- Removed the empty nested application directory after moving all application files to the root. Dependencies, assets, scripts, and tests resolve from the new location.
- Clean `npm ci --include=dev` with Node.js 24.22.1 completed successfully; npm reported zero vulnerabilities.
- ESLint, all 9 unit/content tests, and the production Vite build passed with Node.js 24.22.1. Build filenames matched the earlier build, including the main application bundle, after the move.
- Full Chrome Playwright suite: **17 passed, 1 skipped**. The skipped case is the desktop copy of the mobile-only network measurement; the mobile measurement passed. Coverage includes Arabic-first RTL, English persistence, all public pages, equal team cards and loaded portraits, phone navigation, registration/contact URLs, retired route 404s, gallery pagination/filtering, full-image requests, uncropped portrait framing, keyboard/focus behavior, layout stability, throttled mobile loading, and production/demo configuration behavior.
- All six database migrations and both SQL permission suites passed in local PGlite with minimal Supabase Auth/Storage schema scaffolds. This checks PostgreSQL roles, RLS, private draft access, administrator operations, and URL constraints.
- Added `.node-version`, `render.yaml`, and [Render deployment instructions](render-deployment.md), including the SPA rewrite.

No real Supabase credentials are configured. Live authentication, signed image URLs, administrator saves, and uploads need verification after connecting a real Supabase project. Registration-button URLs are covered by browser tests; this check did not submit a Google Form. GitHub push and Render deployment are left for the steps in the deployment guide.
