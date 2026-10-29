import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const [heroFile,logoFile] = process.argv.slice(2);
if (!heroFile || !logoFile) throw new Error('Provide the supplied hero image and extracted transparent logo.');
const bytes = await readFile(heroFile);
const hash = createHash('sha256').update(bytes).digest('hex').slice(0,12);
const image = sharp(bytes).rotate();
const meta = await image.metadata();
const variants=[];
for (const width of [768,1280,meta.width].filter((value,index,array)=>value<=meta.width&&array.indexOf(value)===index)) {
  const stem=`hero-isolve-${hash}-${width}`;
  const webp=await image.clone().resize({width,withoutEnlargement:true}).webp({quality:88}).toBuffer({resolveWithObject:true});
  const jpg=await image.clone().resize({width,withoutEnlargement:true}).jpeg({quality:87,mozjpeg:true}).toBuffer();
  await writeFile(path.join('public/assets',`${stem}.webp`),webp.data);
  await writeFile(path.join('public/assets',`${stem}.jpg`),jpg);
  variants.push({width:webp.info.width,height:webp.info.height,src:`/assets/${stem}.webp`,fallback:`/assets/${stem}.jpg`,bytes:webp.data.length});
}
await writeFile('src/data/hero.js',`// Prepared from the user's supplied hero image.\nexport const heroImages = ${JSON.stringify(variants,null,2)};\n`);
await sharp(logoFile).trim().png().toFile('public/assets/isolve-logo-transparent.png');
for (const size of [32,64,180,512]) await sharp(logoFile).trim().resize(size,size,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(`public/favicon-${size}.png`);
console.log(JSON.stringify({hero:variants,favicon_sizes:[32,64,180,512]}));
