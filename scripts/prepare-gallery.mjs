import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog } from './gallery-catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceDir = process.argv[2];
if (!sourceDir) throw new Error('Usage: npm run gallery:prepare -- "ABSOLUTE_PHOTO_DIRECTORY"');
const output = path.join(root, 'public/assets/gallery');
const metadataDir = path.join(root, 'public/gallery-data/v1');
await mkdir(output, { recursive: true });
await mkdir(metadataDir, { recursive: true });
const seen = new Map();
const records = [];
const mapping = [];
for (const [sort_order, item] of catalog.entries()) {
  const input = await readFile(path.join(sourceDir, item.source));
  const hash = createHash('sha256').update(input).digest('hex');
  if (seen.has(hash)) { mapping.push({ source: item.source, duplicate_of: seen.get(hash) }); continue; }
  seen.set(hash, item.source);
  const image = sharp(input).rotate();
  const meta = await image.metadata();
  const portrait = [5,6,7,8].includes(meta.orientation);
  const sourceWidth = portrait ? meta.height : meta.width;
  const sourceHeight = portrait ? meta.width : meta.height;
  const folder = path.join(output, hash);
  await mkdir(folder, { recursive: true });
  const variants = { thumbnails: [] };
  async function variant(width, suffix, maxHeight) {
    const resized = image.clone().resize({ width, height: maxHeight, fit: 'inside', withoutEnlargement: true });
    const stem = `${item.slug}-${suffix}`;
    const webp = await resized.clone().webp({ quality: 84, effort: 5 }).toBuffer({ resolveWithObject: true });
    const jpg = await resized.clone().jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    const imagePath = `/assets/gallery/${hash}/${stem}.webp`;
    const fallbackPath = `/assets/gallery/${hash}/${stem}.jpg`;
    await Promise.all([writeFile(path.join(folder, `${stem}.webp`), webp.data), writeFile(path.join(folder, `${stem}.jpg`), jpg)]);
    return { path: imagePath, fallback_path: fallbackPath, width: webp.info.width, height: webp.info.height, bytes: webp.data.length, fallback_bytes: jpg.length };
  }
  for (const width of [320,640,960].filter(width => width <= sourceWidth)) variants.thumbnails.push(await variant(width, width));
  if (!variants.thumbnails.length) variants.thumbnails.push(await variant(sourceWidth, sourceWidth));
  variants.lightbox = await variant(1920, 'full', 1920);
  const uuid = `${hash.slice(0,8)}-${hash.slice(8,12)}-5${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
  const { source, ...content } = item;
  const record = { ...content, id: uuid, content_hash: hash, source_filename: source, source_width: sourceWidth, source_height: sourceHeight, sort_order, variants };
  records.push(record); mapping.push({ source, id: uuid, content_hash: hash, slug: item.slug });
}
// Detect duplicate attachments by file contents, including the optional sticker copy.
for (const filename of (await readdir(sourceDir)).filter(name => /^club sticker image(?:\(1\))?\.jpg$/i.test(name))) {
  if (mapping.some(row => row.source === filename)) continue;
  const hash = createHash('sha256').update(await readFile(path.join(sourceDir, filename))).digest('hex');
  if (seen.has(hash)) mapping.push({ source: filename, duplicate_of: seen.get(hash), content_hash: hash });
}
for (const category of ['all','training','zcc','moments']) {
  const categoryRecords = records.filter(row => row.published && (category === 'all' || row.category === category));
  for (let offset = 0; offset < Math.max(1,categoryRecords.length); offset += 6) {
    const items = categoryRecords.slice(offset,offset + 6).map(({ source_filename: _source, content_hash: _hash, source_width: _w, source_height: _h, ...record }) => record);
    await writeFile(path.join(metadataDir, `${category}-${offset}.json`), JSON.stringify({ items, hasMore: offset + 6 < categoryRecords.length, nextOffset: offset + items.length }));
  }
}
await writeFile(path.join(root,'scripts/gallery-import-manifest.json'), JSON.stringify({ version:1, records, mapping },null,2));
const sizes = records.flatMap(row => row.variants.thumbnails.map(variant => variant.bytes));
const report = { unique_photos:records.length, thumbnail_widths:[320,640,960], thumbnail_webp_bytes:{ min:Math.min(...sizes),max:Math.max(...sizes),total:sizes.reduce((a,b)=>a+b,0) }, lightbox_webp_bytes:records.map(row=>({slug:row.slug,width:row.variants.lightbox.width,height:row.variants.lightbox.height,bytes:row.variants.lightbox.bytes})), source_mapping:mapping };
await writeFile(path.join(root,'docs/gallery-image-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({unique_photos:records.length,thumbnail_webp_bytes:report.thumbnail_webp_bytes,duplicates:mapping.filter(row=>row.duplicate_of)}));
