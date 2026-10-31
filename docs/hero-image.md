# Hero, logo, favicon, and portrait assets

The shared iSolve logo, favicons, and the logo embedded in the hero artwork have been edited to remove the old “version 1” label. The built-in `image_gen` tool was used for those two raster edits, followed by Sharp resizing/compression. No fallback CLI or API credentials were used. The edited images were inspected visually.

The real gallery photos are unchanged apart from optimization. Rakan's current portrait comes from the user-supplied `C:\Users\Mohammed Zarifeh\Desktop\Rakan.jpeg`, rotated according to its metadata, resized without upscaling, and JPEG-compressed. It was not generatively edited.

## Final website files

| Asset | Saved path | Dimensions / bytes |
| --- | --- | --- |
| Shared transparent logo | `public/assets/isolve-logo-transparent.png` | 698 × 279; 165,508 bytes; actual transparent alpha |
| Hero WebP, small | `public/assets/hero-isolve-235581d96d4b-768.webp` | 768 × 432; 50,514 bytes |
| Hero WebP, medium | `public/assets/hero-isolve-235581d96d4b-1280.webp` | 1280 × 720; 97,788 bytes |
| Hero WebP, large | `public/assets/hero-isolve-235581d96d4b-1672.webp` | 1672 × 941; 138,188 bytes |
| Hero JPEG fallbacks | Same three hero stems with `.jpg` | Used in `src/data/hero.js` |
| Browser icons | `public/favicon-32.png`, `public/favicon-64.png`, `public/favicon-180.png` | Transparent 32, 64, and 180 pixel squares |
| Rakan portrait | `public/assets/team/rakan-alqhaiwi.jpg` | 840 × 1187; 150,734 bytes |

The favicon links include a revision query so browsers can refresh the updated artwork. The unused 512-pixel icon, old portrait, superseded hero variants, unused poster, and palette reference image were removed.

## Final logo edit prompt

Use case: precise-object-edit. Asset type: existing iSolve Coding Club transparent logo for website navigation, footer, and favicons. Primary request: remove ONLY the small text 'version 1' and its short underline above the letters lve. Fill that tiny area with the same plain white sticker interior. Keep the exact iSolve wordmark, lettering shapes, Coding Club lettering, coding brackets, by:iTeam mark, original colors, proportions, white sticker background and outline, and composition unchanged. Do not redesign, retype, shift, add or remove anything else. The background outside the sticker must be genuinely transparent with clean alpha edges; preserve transparency. Return the full logo at high quality. No extra text, no version label, no shadow, no rectangular background.

## Final hero edit prompt

Use case: precise-object-edit. Asset type: supplied website hero artwork. Remove ONLY the tiny text 'version 1' and its short underline within the iSolve logo on the blue banner, above the letters lve. Replace those pixels with matching plain white sticker interior. Preserve every other detail of the artwork: exact overall wide 1672:941 composition, the three students' faces and hair and clothing and poses, computer and code, balloons and colors, iSolve lettering and Coding Club lettering and by:iTeam logo, the blue backdrop, the white and light blue right side, all lighting and framing. Make no other change. Do not replace or redesign the logo, people, or composition. No new text, no watermark.

## Reproduce responsive variants

The built-in edit masters remain at their default generated-image locations outside the project:

- Logo: `C:\Users\Mohammed Zarifeh\.codex\generated_images\01a18424-48df-7e00-99c7-1e7eaaf0e628\exec-1157a0f5-7f07-420e-8a90-bf60844c387d.png`
- Hero: `C:\Users\Mohammed Zarifeh\.codex\generated_images\01a18424-48df-7e00-99c7-1e7eaaf0e628\exec-2e7c52bc-270a-4870-85b8-463d76f887ef.png`

From the project directory, run `node scripts/prepare-brand-assets.mjs "EDITED_HERO_FILE" "EDITED_TRANSPARENT_LOGO_FILE"` using those files, or future approved replacement artwork. The optional third argument is an iTeam logo source. This prepares responsive hero images, the shared logo, and the three used favicon sizes. It does not create new AI edits.

If preparing different hero artwork, remove its superseded variants after checking that `src/data/hero.js` points to the replacement. Run `npm run assets:check` to find unused or missing public files before rebuilding. External originals and generated masters are preserved; the browser consumes only the optimized files inside this repository.
