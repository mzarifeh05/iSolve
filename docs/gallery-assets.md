# Moments media and measured sizes

There are 24 distinct supplied real photos, with WebP and JPEG versions of three thumbnails and one full-view image each: 192 prepared image files. Source originals remain unchanged outside the repository.

Total prepared photo bytes: 13,317,795 (12.70 MiB). The browser loads metadata in batches of six, selects responsive lazy thumbnails, and requests full images only when opened.

| Photo | 320 WebP | 640 WebP | 960 WebP | Full WebP | Full dimensions | Full JPEG |
| --- | --- | --- | --- | --- | --- | --- |
| finding-the-solution | 11.3 KiB | 28.8 KiB | 52.1 KiB | 63.8 KiB | 1080 x 1620 | 104.5 KiB |
| trainees-and-trainers | 15.2 KiB | 46.6 KiB | 91.5 KiB | 272.5 KiB | 1920 x 1440 | 334.1 KiB |
| guided-practice | 10.1 KiB | 26.9 KiB | 44.1 KiB | 82.9 KiB | 1620 x 1080 | 130.9 KiB |
| ideas-in-the-room | 13.0 KiB | 33.9 KiB | 55.5 KiB | 108.7 KiB | 1620 x 1080 | 161.3 KiB |
| teamwork-in-the-lab | 10.8 KiB | 26.9 KiB | 42.9 KiB | 81.9 KiB | 1620 x 1080 | 130.6 KiB |
| learning-session-group | 12.2 KiB | 33.2 KiB | 60.8 KiB | 169.4 KiB | 1920 x 1280 | 235.9 KiB |
| following-along | 21.5 KiB | 68.0 KiB | 135.1 KiB | 171.5 KiB | 1080 x 810 | 175.9 KiB |
| zcc-community | 16.5 KiB | 49.0 KiB | 99.9 KiB | 314.5 KiB | 1920 x 1280 | 376.1 KiB |
| zcc-team-problems | 13.3 KiB | 32.1 KiB | 55.8 KiB | 134.4 KiB | 1920 x 1280 | 202.6 KiB |
| zcc-first-place | 9.9 KiB | 24.0 KiB | 43.0 KiB | 108.1 KiB | 1920 x 1280 | 167.0 KiB |
| zcc-second-place | 10.4 KiB | 26.2 KiB | 45.3 KiB | 109.3 KiB | 1920 x 1280 | 171.3 KiB |
| zcc-third-place | 10.2 KiB | 24.5 KiB | 43.0 KiB | 106.4 KiB | 1920 x 1280 | 163.1 KiB |
| session-audience | 14.3 KiB | 43.8 KiB | 75.7 KiB | 154.9 KiB | 1620 x 1080 | 199.5 KiB |
| zcc-organizer-support | 10.4 KiB | 24.5 KiB | 39.5 KiB | 102.7 KiB | 1920 x 1280 | 166.4 KiB |
| zcc-friendly-moment | 15.5 KiB | 42.1 KiB | 84.6 KiB | 128.0 KiB | 1280 x 1920 | 177.0 KiB |
| zcc-participant-photo | 13.4 KiB | 38.3 KiB | 67.0 KiB | 194.0 KiB | 1920 x 1280 | 260.0 KiB |
| previous-edition-recognition-a | 11.9 KiB | 30.8 KiB | 56.7 KiB | 151.9 KiB | 1920 x 1280 | 215.6 KiB |
| previous-edition-recognition-b | 11.2 KiB | 29.0 KiB | 50.5 KiB | 126.0 KiB | 1920 x 1280 | 191.9 KiB |
| previous-edition-recognition-c | 9.8 KiB | 24.7 KiB | 42.1 KiB | 109.4 KiB | 1920 x 1280 | 165.7 KiB |
| isolve-stickers | 4.8 KiB | 11.9 KiB | 19.1 KiB | 38.7 KiB | 1620 x 1080 | 73.4 KiB |
| zcc-before-the-start | 12.8 KiB | 34.5 KiB | 58.6 KiB | 157.4 KiB | 1920 x 1280 | 228.9 KiB |
| zcc-solving-side-by-side | 6.6 KiB | 13.9 KiB | 22.1 KiB | 52.2 KiB | 1920 x 1280 | 92.1 KiB |
| zcc-working-through-ideas | 10.5 KiB | 24.9 KiB | 43.5 KiB | 63.7 KiB | 1280 x 1920 | 110.0 KiB |
| zcc-thinking-together | 10.6 KiB | 24.4 KiB | 40.6 KiB | 94.7 KiB | 1920 x 1280 | 151.4 KiB |

Every prepared WebP/JPEG dimension is checked against the manifest by npm test. Images are not upscaled; full views have a longest edge of at most 1920 pixels. Contain framing preserves entire groups and portrait compositions.

The four newest session photos appear first. All has 6/6/6/6 pagination; Training has seven, ZCC Contest twelve, and Club Moments five. ZCC means Zaytoonah Coding Contest.

## Session videos

The two source clips total 67,339,049 bytes; prepared MP4s total 3,924,617 bytes, a 94.2% reduction. Full duration is preserved, with original audio re-encoded to AAC. H.264/yuv420p video and fast-start metadata support browser playback. The second source has empty black side bars, removed from the prepared copy without cropping its actual portrait footage.

| Source clip | Original bytes | MP4 bytes | Video dimensions | Duration | Poster WebP |
| --- | --- | --- | --- | --- | --- |
| explaining during sessions.mp4 | 24,944,330 | 1,361,847 | 720 x 1280 | 9.77 s | 17.6 KiB |
| trainee during practical solution.mp4 | 42,394,719 | 2,562,770 | 608 x 1080 | 16.33 s | 41.7 KiB |

Posters come from real video frames and have WebP/JPEG variants. MP4 files are requested only after pressing play; posters load lazily. Native playback controls, pause-others, pause-offscreen, errors and retry are covered by browser checks. The clips and motto remain independent of photo filters.

The photo source mapping is in scripts/gallery-manifest.json, and video source hashes/sizes are in docs/session-video-report.json. Preparation manifests are not imported into frontend JavaScript.

See [preparation](gallery-setup.md) and [verification](verification.md).
