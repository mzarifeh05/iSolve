import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {sessionVideos} from '../src/data/sessionVideos.js';

test('both real session clips have web-ready MP4s, full duration and working posters',async()=>{
  const report=JSON.parse(await readFile(new URL('../docs/session-video-report.json',import.meta.url),'utf8'));
  assert.equal(sessionVideos.length,2);
  assert.equal(new Set(sessionVideos.map(clip=>clip.src)).size,2);
  for(const clip of sessionVideos){
    const measured=report.find(row=>row.id===clip.id);
    assert.ok(clip.title_en&&clip.title_ar&&clip.description_en&&clip.description_ar);
    assert.equal(clip.duration,measured.source_duration);
    assert.equal(measured.video_codec,'h264');assert.equal(measured.audio_codec,'aac');
    const buffer=await readFile(new URL(`../public${clip.src}`,import.meta.url));
    assert.equal(buffer.length,measured.bytes);
    assert.ok(buffer.length<measured.source_bytes/4);
    const boxes=[];
    for(let offset=0;offset<buffer.length;){
      const size=buffer.readUInt32BE(offset);
      assert.ok(size>=8&&offset+size<=buffer.length,'MP4 top-level box is complete');
      boxes.push(buffer.toString('ascii',offset+4,offset+8));offset+=size;
    }
    assert.ok(boxes.includes('ftyp')&&boxes.includes('moov')&&boxes.includes('mdat'));
    assert.ok(boxes.indexOf('moov')<boxes.indexOf('mdat'),'fast-start metadata precedes media');
    for(const filename of [clip.poster,clip.posterFallback]){
      const poster=await sharp(await readFile(new URL(`../public${filename}`,import.meta.url))).metadata();
      assert.equal(poster.width,480);
      assert.ok(Math.abs(poster.width/poster.height-clip.width/clip.height)<.002);
    }
  }
});
