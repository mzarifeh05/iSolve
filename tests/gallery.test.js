import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {loadGallery} from '../src/lib/gallery.js';
const manifest=JSON.parse(await readFile(new URL('../scripts/gallery-manifest.json',import.meta.url),'utf8'));

test('the gallery leads with four new session photos and retains the full original collection',()=>{
  const rows=manifest.records;
  assert.equal(rows.length,24);assert.equal(new Set(rows.map(row=>row.content_hash)).size,24);
  assert.deepEqual(rows.slice(0,4).map(row=>row.source_filename),['focusing to find the solution.JPG','gropu picture for trainees and trainers.JPG','trainees during practical application with orgnizers guide.JPG','trainees.JPG']);
  assert.deepEqual(rows.slice(4,7).map(row=>row.source_filename),['teams solving together.JPG','session group pic.JPG','during session.jpeg']);
  assert.deepEqual(rows.slice(-4).map(row=>row.source_filename),['participants pictures before contest starts.JPG','participants solving in zcc (2).JPG','participants solving in zcc.JPG','participatns thinking in zcc.JPG']);
  assert.ok(rows.slice(-4).every(row=>row.category==='zcc'));
  assert.equal(rows.filter(row=>row.source_filename.startsWith('club sticker')).length,1);
  for(const row of rows){assert.equal(row.fit,'contain');assert.ok(row.alt_en&&row.alt_ar);}
  for(const row of rows.filter(row=>/^zcc-(first|second|third)-place$/.test(row.slug)))assert.equal(row.caption_en,'Celebrating the winners');
});
test('every actual WebP and JPEG variant preserves orientation and respects its size bounds',async()=>{
  for(const row of manifest.records){
    assert.deepEqual(row.variants.thumbnails.map(image=>image.width),[320,640,960]);
    for(const image of [...row.variants.thumbnails,row.variants.lightbox]){
      for(const filename of [image.path,image.fallback_path]){
        const info=await sharp(fileURLToPath(new URL(`../public${filename}`,import.meta.url))).metadata();
        assert.equal(info.width,image.width);assert.equal(info.height,image.height);assert.ok(image.width<=row.source_width&&image.height<=row.source_height);
      }
    }
    assert.ok(Math.max(row.variants.lightbox.width,row.variants.lightbox.height)<=1920);
  }
});
test('metadata pagination contains all 24 photos exactly once and category pages remain separate',async()=>{
  const ids=[];
  for(const [offset,count] of [[0,6],[6,6],[12,6],[18,6]]){
    const data=JSON.parse(await readFile(new URL(`../public/gallery-data/v1/all-${offset}.json`,import.meta.url),'utf8'));
    assert.equal(data.items.length,count);assert.equal(data.hasMore,offset!==18);assert.equal(data.nextOffset,offset+count);ids.push(...data.items.map(row=>row.id));
  }
  assert.equal(new Set(ids).size,24);
  for(const [category,total] of [['training',7],['zcc',12],['moments',5]]){
    let count=0;
    for(let offset=0;offset<total;offset+=6){
      const data=JSON.parse(await readFile(new URL(`../public/gallery-data/v1/${category}-${offset}.json`,import.meta.url),'utf8'));
      assert.ok(data.items.every(row=>row.category===category));assert.ok(data.items.length<=6);count+=data.items.length;
    }
    assert.equal(count,total);
  }
});
test('gallery rejects invalid categories and page offsets before making requests',async()=>{
  for(const options of [{category:'../private'},{offset:-1},{offset:1},{offset:1.2}])await assert.rejects(loadGallery(options),/Invalid gallery/);
});
