# Static iSolve Moments media

iSolve Moments contains **24 distinct real photos and two real session videos** supplied by the user. A featured row presents the iTeam motto beside two portrait video previews. The four newest session photos lead the gallery; the earlier 20 photos retain their relative order.

Four photo filters cover All, Training, ZCC Contest, and Club Moments. ZCC means **Zaytoonah Coding Contest** (مسابقة الزيتونة للبرمجة). All three winner captions say “Celebrating the winners,” without standings.

## Prepare photos

1. Add the exact filename and bilingual caption/visual alt text to `scripts/gallery-catalog.mjs`. Give each photo a stable slug and choose `training`, `zcc`, or `moments`.
2. Keep original photos outside `public`. Multiple source directories are supported; pass all directories needed by the catalog.
3. From the repository root, run:

```powershell
npm run gallery:prepare -- 'C:\Users\Mohammed Zarifeh\Desktop\ZCC\Facebook Post' 'C:\Users\Mohammed Zarifeh\Desktop\temp'
```

4. Run `npm test`, `npm run assets:check`, build, and check the gallery. Commit generated assets and metadata with the catalog changes.

Sharp applies image orientation and strips camera metadata. It creates WebP/JPEG thumbnails at 320, 640, and 960 pixels wide without upscaling. Full-view images have a longest edge of at most 1920 pixels. Existing immutable variants are reused when the source hash and slug match and all variants exist. Originals remain unchanged.

The script writes `public/assets/gallery/<source-hash>/`, six-photo metadata pages under `public/gallery-data/v1/`, a source mapping in `scripts/gallery-manifest.json`, and sizes in `docs/gallery-image-report.json`. Content hashes prevent duplicate catalog entries.

The newest photos are `focusing to find the solution.JPG`, `gropu picture for trainees and trainers.JPG`, `trainees during practical application with orgnizers guide.JPG`, and `trainees.JPG`.

## Prepare session videos

The source clips are `explaining during sessions.mp4` and `trainee during practical solution.mp4` in the user's `Desktop\temp` folder. Both are shown in full, with their original audio re-encoded to AAC. Only the verified empty black side bars in the second source are removed; the complete recorded portrait frame is preserved.

For future changes, edit the source list and bilingual copy in `scripts/prepare-session-videos.mjs`. With FFmpeg and FFprobe available locally:

```powershell
npm run videos:prepare -- 'C:\Users\Mohammed Zarifeh\Desktop\temp'
```

Optional second and third arguments specify the full paths to the FFmpeg and FFprobe executables. These tools are needed only to regenerate clips locally; Render builds use the prepared committed assets.

Preparation creates H.264/AAC MP4s, max width 720 pixels without upscaling, 30 fps, yuv420p, CRF 24, and fast-start metadata. It strips source metadata and creates WebP/JPEG poster frames. Outputs are `public/assets/sessions/`, `src/data/sessionVideos.js`, and `docs/session-video-report.json`. Full duration, MP4 structure, codec reports, compression and poster dimensions are checked by `npm test`.

## Loading and accessibility

Photo metadata waits until Moments approaches the viewport. All has four batches of six; Training has 6 + 1, ZCC has 6 + 6, and Club Moments has five photos. Filters fetch only their category. The full preparation manifest is never bundled into frontend JavaScript.

All photo thumbnails reserve a 3:2 frame and use contain framing. Portraits and entire groups remain uncropped. Responsive thumbnails load lazily; full images load only when opened in the lightbox. The viewer supports RTL arrow keys, Escape, trapped/restored focus, and scroll locking. Load failures offer retry controls.

Session clips show lightweight lazy-loaded posters and accessible play buttons. No video element or MP4 request exists until a visitor presses play. The player then offers native controls, inline playback and fullscreen support, with a bilingual title and visual description. Starting another clip pauses the previous one; leaving the viewport also pauses playback. A failed load offers retry and a direct video link. The exact English iTeam motto is marked `lang="en"` and `dir="ltr"` within both language layouts.

All media ship with the static site. No backend, database, environment variables or external video service is required. To remove a photo or clip, update its catalog, regenerate data, and remove only its verified generated assets. Keep user originals and unrelated files. `npm run assets:check` detects missing and unused public files.

See [measured media sizes](gallery-assets.md) and [verification](verification.md).
