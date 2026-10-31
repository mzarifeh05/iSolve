# Gallery assets and measured sizes

There are 20 distinct supplied real photos, with WebP and JPEG versions of three thumbnails plus one full-view image each: 160 prepared files. Source photos are unchanged and remain outside the repository.

Total prepared image bytes: 11,014,488 (10.50 MiB). The browser does not download this entire collection on page load. Category metadata is paginated in batches of six, responsive thumbnails load lazily, and full images load only when opened.

| Photo | 320 WebP | 640 WebP | 960 WebP | Full WebP | Full dimensions | Full JPEG |
| --- | --- | --- | --- | --- | --- | --- |
| teamwork-in-the-lab | 10.8 KiB | 26.9 KiB | 42.9 KiB | 81.9 KiB | 1620 × 1080 | 130.6 KiB |
| learning-session-group | 12.2 KiB | 33.2 KiB | 60.8 KiB | 169.4 KiB | 1920 × 1280 | 235.9 KiB |
| following-along | 21.5 KiB | 68.0 KiB | 135.1 KiB | 171.5 KiB | 1080 × 810 | 175.9 KiB |
| zcc-community | 16.5 KiB | 49.0 KiB | 99.9 KiB | 314.5 KiB | 1920 × 1280 | 376.1 KiB |
| zcc-team-problems | 13.3 KiB | 32.1 KiB | 55.8 KiB | 134.4 KiB | 1920 × 1280 | 202.6 KiB |
| zcc-first-place | 9.9 KiB | 24.0 KiB | 43.0 KiB | 108.1 KiB | 1920 × 1280 | 167.0 KiB |
| zcc-second-place | 10.4 KiB | 26.2 KiB | 45.3 KiB | 109.3 KiB | 1920 × 1280 | 171.3 KiB |
| zcc-third-place | 10.2 KiB | 24.5 KiB | 43.0 KiB | 106.4 KiB | 1920 × 1280 | 163.1 KiB |
| session-audience | 14.3 KiB | 43.8 KiB | 75.7 KiB | 154.9 KiB | 1620 × 1080 | 199.5 KiB |
| zcc-organizer-support | 10.4 KiB | 24.5 KiB | 39.5 KiB | 102.7 KiB | 1920 × 1280 | 166.4 KiB |
| zcc-friendly-moment | 15.5 KiB | 42.1 KiB | 84.6 KiB | 128.0 KiB | 1280 × 1920 | 177.0 KiB |
| zcc-participant-photo | 13.4 KiB | 38.3 KiB | 67.0 KiB | 194.0 KiB | 1920 × 1280 | 260.0 KiB |
| previous-edition-recognition-a | 11.9 KiB | 30.8 KiB | 56.7 KiB | 151.9 KiB | 1920 × 1280 | 215.6 KiB |
| previous-edition-recognition-b | 11.2 KiB | 29.0 KiB | 50.5 KiB | 126.0 KiB | 1920 × 1280 | 191.9 KiB |
| previous-edition-recognition-c | 9.8 KiB | 24.7 KiB | 42.1 KiB | 109.4 KiB | 1920 × 1280 | 165.7 KiB |
| isolve-stickers | 4.8 KiB | 11.9 KiB | 19.1 KiB | 38.7 KiB | 1620 × 1080 | 73.4 KiB |
| zcc-before-the-start | 12.8 KiB | 34.5 KiB | 58.6 KiB | 157.4 KiB | 1920 × 1280 | 228.9 KiB |
| zcc-solving-side-by-side | 6.6 KiB | 13.9 KiB | 22.1 KiB | 52.2 KiB | 1920 × 1280 | 92.1 KiB |
| zcc-working-through-ideas | 10.5 KiB | 24.9 KiB | 43.5 KiB | 63.7 KiB | 1280 × 1920 | 110.0 KiB |
| zcc-thinking-together | 10.6 KiB | 24.4 KiB | 40.6 KiB | 94.7 KiB | 1920 × 1280 | 151.4 KiB |

Every prepared WebP/JPEG dimension is checked against the manifest by `npm test`; no file is upscaled and full views have a longest edge of at most 1920 pixels. Orientation is applied before resizing. All thumbnails use contain framing, preserving entire groups and portrait compositions.

The four added ZCC Contest photos are `zcc-before-the-start`, `zcc-solving-side-by-side`, `zcc-working-through-ideas`, and `zcc-thinking-together`. ZCC means Zaytoonah Coding Contest.

The source mapping is in `scripts/gallery-manifest.json`; numerical thumbnail/lightbox data is also in `docs/gallery-image-report.json`. Neither preparation manifest is imported into frontend JavaScript.

Browser verification covers metadata deferred until the section approaches view, All pagination 6/6/6/2, category queries, uncropped portrait display, all four new photos, keyboard/focus behavior, and a mobile network check. See [verification notes](verification.md).
