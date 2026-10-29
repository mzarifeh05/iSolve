// Trusted local import only. Credentials are read from environment, never VITE_*.
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const url=process.env.SUPABASE_URL;
const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!secret) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the trusted process environment. Do not use VITE_* for the secret.');
const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const manifest=JSON.parse(await readFile('scripts/gallery-import-manifest.json','utf8'));
let inserted=0,existing=0,uploaded=0;
for(const original of manifest.records){
  const record=structuredClone(original);
  delete record.source_width;delete record.source_height;delete record.source_filename;
  for(const image of [...record.variants.thumbnails,record.variants.lightbox]){
    for(const field of ['path','fallback_path']){
      const localPath=path.join('public',image[field]);
      const storagePath=image[field].replace(/^\/assets\/gallery\//,'gallery/');
      const folder=storagePath.slice(0,storagePath.lastIndexOf('/')),name=storagePath.split('/').at(-1);
      const listing=await db.storage.from('gallery-photos').list(folder,{limit:100});
      if(listing.error) throw listing.error;
      if(!listing.data.some(row=>row.name===name)){
        const result=await db.storage.from('gallery-photos').upload(storagePath,await readFile(localPath),{contentType:field==='path'?'image/webp':'image/jpeg',cacheControl:'31536000',upsert:false});
        if(result.error) throw result.error;uploaded++;
      }
      image[field]=storagePath;
    }
  }
  const found=await db.from('gallery_photos').select('id').eq('content_hash',record.content_hash).maybeSingle();
  if(found.error) throw found.error;
  if(found.data){existing++;continue;} // Preserve later administrator caption/order edits.
  const result=await db.from('gallery_photos').insert(record);
  if(result.error) throw result.error;inserted++;
}
console.log(JSON.stringify({inserted,existing,uploaded}));
