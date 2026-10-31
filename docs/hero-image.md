# Hero and favicon assets

The hero now uses the user's supplied `hero section image.png`, without generative changes. Optimized WebP/JPEG variants are 768 × 432, 1280 × 720, and 1672 × 941, with WebP sizes 51,288 / 101,894 / 145,744 bytes. Paths are versioned under `public/assets/hero-isolve-5a702a65e237-*`; `src/data/hero.js` supplies responsive sources. CSS blends the white canvas into the existing palette. This branding artwork is kept separate from the real photo gallery.

Transparent logo: `public/assets/isolve-logo-transparent.png`. Browser icons: `public/favicon-32.png`, `favicon-64.png`, `favicon-180.png`, and `favicon-512.png`. The old generic SVG icon was removed.

The transparent iSolve logo is now used in both navigation and footer. Its prepared PNG is resized to 698 pixels wide for small-screen and desktop display; the footer iTeam PNG is resized to 440 pixels wide. Both retain transparency and proportions. This asset preparation changes no logo text or design; the supplied originals remain untouched outside the project.

The built-in imagegen tool extracted the central iSolve sticker from the original poster. Sharp trimmed transparent margins and made the final icon sizes. Final extraction prompt:

> Use case: background-extraction. Edit the supplied iSolve Coding Club poster. Extract ONLY the central white-outlined iSolve Coding Club sticker logo including its coding brackets, version 1 text, Coding Club text and small by:iTeam mark. Remove the entire blue-green rectangular poster background, organic background shapes and bottom-left social icons/handle. Preserve the original central logo's exact proportions, colors, typography, spelling, internal white background, and white sticker outline. No redraw, no new text, no new icon, no shadows. Return a tightly framed logo cutout on a genuinely transparent background with small even transparent margins. This is for an existing brand website favicon and brand asset.
