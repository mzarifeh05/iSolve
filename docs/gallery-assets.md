# Gallery preparation report

16 unique real photos; the sticker is referenced once. The duplicate sticker copy mentioned in the brief is excluded from the catalog; that extra copy was not present in the supplied directory. The two during-session files are distinct and both included. All dates remain unset.

Each photo has 320/640/960-width WebP and JPEG thumbnails, and a WebP/JPEG full-composition image capped at a 1920-pixel longest edge. No output upscales. EXIF orientation is applied; metadata is stripped. All grid defaults use contain to preserve groups, recipients, and the portrait.

WebP thumbnails: 4.8–135.1 KiB each; total 1686.0 KiB across all 48 variants. Full WebP images: 38.7–314.5 KiB. All 128 prepared WebP/JPEG files total about 8.85 MiB.

| Photo | Thumbnail WebP KiB (320 / 640 / 960) | Full dimensions | Full WebP KiB | Full JPEG KiB |
|---|---|---|---|---|
| teamwork-in-the-lab | 10.8 / 26.9 / 42.9 | 1620 × 1080 | 81.9 | 130.6 |
| learning-session-group | 12.2 / 33.2 / 60.8 | 1920 × 1280 | 169.4 | 235.9 |
| following-along | 21.5 / 68.0 / 135.1 | 1080 × 810 | 171.5 | 175.9 |
| zcc-community | 16.5 / 49.0 / 99.9 | 1920 × 1280 | 314.5 | 376.1 |
| zcc-team-problems | 13.3 / 32.1 / 55.8 | 1920 × 1280 | 134.4 | 202.6 |
| zcc-first-place | 9.9 / 24.0 / 43.0 | 1920 × 1280 | 108.1 | 167.0 |
| zcc-second-place | 10.4 / 26.2 / 45.3 | 1920 × 1280 | 109.3 | 171.3 |
| zcc-third-place | 10.2 / 24.5 / 43.0 | 1920 × 1280 | 106.4 | 163.1 |
| session-audience | 14.3 / 43.8 / 75.7 | 1620 × 1080 | 154.9 | 199.5 |
| zcc-organizer-support | 10.4 / 24.5 / 39.5 | 1920 × 1280 | 102.7 | 166.4 |
| zcc-friendly-moment | 15.5 / 42.1 / 84.6 | 1280 × 1920 | 128.0 | 177.0 |
| zcc-participant-photo | 13.4 / 38.3 / 67.0 | 1920 × 1280 | 194.0 | 260.0 |
| previous-edition-recognition-a | 11.9 / 30.8 / 56.7 | 1920 × 1280 | 151.9 | 215.6 |
| previous-edition-recognition-b | 11.2 / 29.0 / 50.5 | 1920 × 1280 | 126.0 | 191.9 |
| previous-edition-recognition-c | 9.8 / 24.7 / 42.1 | 1920 × 1280 | 109.4 | 165.7 |
| isolve-stickers | 4.8 / 11.9 / 19.1 | 1620 × 1080 | 38.7 | 73.4 |

Exact byte counts and source mapping: gallery-image-report.json and ../scripts/gallery-import-manifest.json.

Chrome mobile network check passed at 120 ms latency and 180,000 bytes/s download throughput: gallery image requests used 320/640/960 variants; no unopened full images or unrequested later metadata pages downloaded. Desktop/mobile filters and 6/6/4 pagination passed. Tablet frames stayed at 3:2; portrait lightbox remained uncropped. Gallery-related layout shift stayed below 0.02 in the framing check.

Supabase was not configured. No live database import, Auth save, or Storage upload is claimed. See gallery-setup.md.
