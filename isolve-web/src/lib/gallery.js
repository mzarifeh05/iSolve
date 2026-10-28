import { supabase, isDemo, isInitialContent, configurationError } from './supabase.js';
import { checkAdmin } from './content.js';

export const GALLERY_PAGE_SIZE = 6;
export const galleryCategories = ['all','training','zcc','moments'];
const bucket = 'gallery-photos';
const columns = 'id,slug,content_hash,variants,caption_en,caption_ar,alt_en,alt_ar,category,event_label_en,event_label_ar,event_date,sort_order,published,fit,focal_x,focal_y';
function failure(code) { const error = new Error(code); error.code = code; throw error; }
function checked(result) { if (result.error) throw result.error; return result.data; }
async function editable() {
  if (isDemo) failure('DEMO_READ_ONLY');
  if (!supabase || configurationError) failure('CONFIGURATION');
  if (!(await checkAdmin())) failure('FORBIDDEN');
  return supabase;
}
async function signedPaths(paths) {
  if (!supabase) failure('CONFIGURATION');
  const rows = checked(await supabase.storage.from(bucket).createSignedUrls([...new Set(paths)],3600));
  if (rows.some(row => row.error || !row.signedUrl)) failure('GALLERY_IMAGE');
  return Object.fromEntries(rows.map(row => [row.path,row.signedUrl]));
}

/** Fetch only one category/batch; never include lightbox downloads in a page load. */
export async function loadGallery({category='all',offset=0,admin=false}={}) {
  if (!galleryCategories.includes(category) || !Number.isInteger(offset) || offset<0) failure('INVALID_GALLERY');
  let page;
  if (isDemo || (isInitialContent && !admin)) {
    const response=await fetch(`/gallery-data/v1/${category}-${offset}.json`);
    if (!response.ok) failure('GALLERY_LOAD');
    page=await response.json();
  } else {
    if (!supabase || configurationError) failure('CONFIGURATION');
    if (admin && !(await checkAdmin())) failure('FORBIDDEN');
    let query=supabase.from('gallery_photos').select(columns,{count:'exact'}).order('sort_order').order('id');
    if (!admin) query=query.eq('published',true);
    if (category!=='all') query=query.eq('category',category);
    const result=await query.range(offset,offset+GALLERY_PAGE_SIZE-1);
    const items=checked(result);
    page={items,hasMore:offset+items.length<(result.count??offset+items.length),nextOffset:offset+items.length};
  }
  const paths=page.items.flatMap(row=>row.variants.thumbnails.flatMap(image=>[image.path,image.fallback_path])).filter(value=>!value.startsWith('/assets/'));
  const urls=paths.length ? await signedPaths(paths) : {};
  return {...page,items:page.items.map(row=>({...row,variants:{...row.variants,thumbnails:row.variants.thumbnails.map(image=>({...image,url:urls[image.path]||image.path,fallback_url:urls[image.fallback_path]||image.fallback_path}))}}))};
}

export async function galleryLightbox(photo) {
  const image=photo.variants.lightbox;
  if (image.path.startsWith('/assets/gallery/')) return {...image,url:image.path,fallback_url:image.fallback_path};
  const urls=await signedPaths([image.path,image.fallback_path]);
  return {...image,url:urls[image.path],fallback_url:urls[image.fallback_path]};
}

export async function renewGalleryThumbnails(photo) {
  const images=photo.variants.thumbnails;
  const paths=images.flatMap(image=>[image.path,image.fallback_path]).filter(path=>!path.startsWith('/assets/'));
  const urls=paths.length?await signedPaths(paths):{};
  return images.map(image=>({...image,url:urls[image.path]||image.path,fallback_url:urls[image.fallback_path]||image.fallback_path}));
}

export async function saveGalleryPhoto(record) {
  const db=await editable();
  const fields=['id','slug','content_hash','variants','caption_en','caption_ar','alt_en','alt_ar','category','event_label_en','event_label_ar','event_date','sort_order','published','fit','focal_x','focal_y'];
  const data=Object.fromEntries(fields.filter(key=>record[key]!==undefined).map(key=>[key,record[key]]));
  if (!data.id) delete data.id;
  if (!data.event_date) data.event_date=null;
  // Derived signed URLs are view data, never durable metadata.
  data.variants=JSON.parse(JSON.stringify(data.variants));
  for (const variant of [...data.variants.thumbnails,data.variants.lightbox]) { delete variant.url; delete variant.fallback_url; }
  return checked(await db.from('gallery_photos').upsert(data).select().single());
}

export async function removeGalleryAssets(variants) {
  const db=await editable();
  const paths=[...variants.thumbnails,variants.lightbox].flatMap(image=>[image.path,image.fallback_path]).filter(path=>!path.startsWith('/assets/'));
  if (paths.length) checked(await db.storage.from(bucket).remove([...new Set(paths)]));
}
export async function deleteGalleryPhoto(photo) {
  const db=await editable();
  const rows=checked(await db.from('gallery_photos').delete().eq('id',photo.id).select('id'));
  if (rows.length!==1) failure('FORBIDDEN');
  try { await removeGalleryAssets(photo.variants); } catch { failure('GALLERY_CLEANUP'); }
}

/** Generate variants once on upload, keeping camera files out of public storage. */
export async function uploadGalleryPhoto(file) {
  const db=await editable();
  if (!['image/jpeg','image/png','image/webp'].includes(file?.type)) failure('IMAGE_TYPE');
  if (!file.size || file.size>25*1024*1024) failure('GALLERY_SIZE');
  const bytes=await file.arrayBuffer();
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  const exists=checked(await db.from('gallery_photos').select('id').eq('content_hash',hash).maybeSingle());
  if (exists) failure('GALLERY_DUPLICATE');
  let bitmap;
  try { bitmap=await createImageBitmap(file,{imageOrientation:'from-image'}); } catch { failure('IMAGE_TYPE'); }
  const slug=file.name.replace(/\.[^.]+$/,'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64)||'club-photo';
  const uploaded=[];
  async function variant(maxWidth,maxHeight,suffix) {
    const scale=Math.min(1,maxWidth/bitmap.width,maxHeight/bitmap.height);
    const width=Math.round(bitmap.width*scale),height=Math.round(bitmap.height*scale);
    const canvas=document.createElement('canvas'); canvas.width=width;canvas.height=height;
    const context=canvas.getContext('2d');context.fillStyle='#f4f4ee';context.fillRect(0,0,width,height);context.drawImage(bitmap,0,0,width,height);
    const blob=type=>new Promise(resolve=>canvas.toBlob(resolve,type,.85));
    const webp=await blob('image/webp'),jpg=await blob('image/jpeg');
    if (!webp || webp.type!=='image/webp' || !jpg) failure('GALLERY_FORMAT');
    const path=`gallery/${hash}/${slug}-${suffix}.webp`,fallback_path=`gallery/${hash}/${slug}-${suffix}.jpg`;
    for (const [name,data] of [[path,webp],[fallback_path,jpg]]) {
      const result=await db.storage.from(bucket).upload(name,data,{contentType:data.type,cacheControl:'31536000',upsert:true});checked(result);uploaded.push(name);
    }
    return {path,fallback_path,width,height,bytes:webp.size,fallback_bytes:jpg.size};
  }
  try {
    const thumbnails=[];
    for (const width of [320,640,960].filter(width=>width<=bitmap.width)) thumbnails.push(await variant(width,Infinity,width));
    if (!thumbnails.length) thumbnails.push(await variant(bitmap.width,Infinity,bitmap.width));
    const lightbox=await variant(1920,1920,'full');
    return {slug,content_hash:hash,variants:{thumbnails,lightbox}};
  } catch(error) { if(uploaded.length) await db.storage.from(bucket).remove(uploaded);throw error; }
  finally {bitmap.close();}
}
