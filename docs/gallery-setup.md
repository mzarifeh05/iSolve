# Static photo gallery

The single page's **iSolve Moments** section contains 20 distinct real photos supplied by the user. Four filters cover All, Training, ZCC Contest, and Club Moments. ZCC stands for **Zaytoonah Coding Contest** (مسابقة الزيتونة للبرمجة). All three winner captions say “Celebrating the winners,” without standings.

## Update photos

1. Add the exact filename and bilingual caption/visual alt text to `scripts/gallery-catalog.mjs`. Give each photo a unique, stable slug and choose `training`, `zcc`, or `moments`.
2. Keep the source photos in a local directory outside `public`. The current originals are in the user's `Desktop\ZCC\Facebook Post` folder.
3. From the repository root, run:

```powershell
npm run gallery:prepare -- 'C:\Users\Mohammed Zarifeh\Desktop\ZCC\Facebook Post'
```

4. Run `npm test`, build, and check the gallery. Commit the generated files with the catalog changes and redeploy.

The Sharp preparation script applies image orientation and strips camera metadata. It creates WebP/JPEG thumbnails at 320, 640, and 960 pixels wide without upscaling. Full-view images have a longest edge of at most 1920 pixels. The originals remain unchanged. Existing immutable variants are reused when the source hash and slug match and all variants exist.

The script writes assets under `public/assets/gallery/<source-hash>/`, category/page metadata under `public/gallery-data/v1/`, a source mapping in `scripts/gallery-manifest.json`, and measured sizes in `docs/gallery-image-report.json`. File hashes prevent duplicate catalog entries. Both differently named session photos are retained, and the sticker appears once.

The four latest additions are:

- `participants pictures before contest starts.JPG`
- `participants solving in zcc (2).JPG`
- `participants solving in zcc.JPG`
- `participatns thinking in zcc.JPG`

## Loading and accessibility

The browser fetches the first six-photo metadata page only as the gallery approaches view. Show more loads the remaining batches: **6 / 6 / 6 / 2** for All; ZCC has 12 photos in two batches. Training and Club Moments have four each. Filters fetch only their own category. The full preparation manifest is never imported by the frontend bundle.

Thumbnails reserve a 3:2 frame and show each entire photo. Portraits and group photos remain uncropped. Responsive `srcset` chooses a thumbnail size for the device; full images load only when opened in the lightbox. The viewer supports previous/next, RTL arrow keys, Escape, trapped keyboard focus, focus restoration, and scroll locking. Load failures offer retry controls.

There are no administrator actions, upload endpoint, database records, signed URLs, or external image storage. The optimized files ship with the static site. To remove a photo, update the catalog and regenerate the metadata; if you also need to stop serving its previously published assets, remove its verified hash folder from `public/assets/gallery` before rebuilding. Do not delete unrelated assets or source originals.

See [measured image sizes](gallery-assets.md) and [verification](verification.md).
