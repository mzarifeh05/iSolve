import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const manifest=JSON.parse(await readFile(new URL('../scripts/gallery-import-manifest.json',import.meta.url),'utf8'));
test('the gallery contains exactly 16 distinct original photos in the requested order',()=>{
  const rows=manifest.records;
  assert.equal(rows.length,16);assert.equal(new Set(rows.map(row=>row.content_hash)).size,16);
  assert.deepEqual(rows.slice(0,6).map(row=>row.source_filename),['teams solving together.JPG','session group pic.JPG','during session.jpeg','group picture from zcc.JPG','teams solving in zcc.JPG','winners in zcc 1st.JPG']);
  assert.deepEqual(rows.slice(5,8).map(row=>row.slug),['zcc-first-place','zcc-second-place','zcc-third-place']);
  assert.ok(rows.some(row=>row.source_filename==='during session.JPG'));
  assert.ok(rows.some(row=>row.source_filename==='during session.jpeg'));
  assert.equal(rows.filter(row=>row.source_filename.startsWith('club sticker')).length,1);
  for(const row of rows){assert.equal(row.event_date,null);assert.equal(row.fit,'contain');assert.ok(row.alt_en&&row.alt_ar);}
  for(const row of rows.filter(row=>row.source_filename.startsWith('most solved')))assert.equal(row.category,'moments');
});
test('every actual variant respects requested dimensions and is smaller than camera originals',async()=>{
  for(const row of manifest.records){
    assert.deepEqual(row.variants.thumbnails.map(image=>image.width),[320,640,960]);
    for(const image of [...row.variants.thumbnails,row.variants.lightbox]){
      const info=await sharp(fileURLToPath(new URL(`../public${image.path}`,import.meta.url))).metadata();
      assert.equal(info.width,image.width);assert.equal(info.height,image.height);assert.ok(image.width<=row.source_width&&image.height<=row.source_height);
    }
    assert.ok(Math.max(row.variants.lightbox.width,row.variants.lightbox.height)<=1920);
  }
});
test('static metadata is split by category and six-photo pages',async()=>{
  for(const [offset,count] of [[0,6],[6,6],[12,4]]){
    const data=JSON.parse(await readFile(new URL(`../public/gallery-data/v1/all-${offset}.json`,import.meta.url),'utf8'));
    assert.equal(data.items.length,count);assert.equal(data.hasMore,offset!==12);
  }
  for(const category of ['training','zcc','moments']){
    const data=JSON.parse(await readFile(new URL(`../public/gallery-data/v1/${category}-0.json`,import.meta.url),'utf8'));
    assert.ok(data.items.every(row=>row.category===category));assert.ok(data.items.length<=6);
  }
});
