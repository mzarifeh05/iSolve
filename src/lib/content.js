import { supabase, isDemo, isInitialContent, configurationError } from './supabase';
import { demoContent } from '../data/demo';
import { initialContent } from '../data/initialContent';
import { imageUrl, safeUrl, validGoogleFormUrl, validWhatsappUrl } from './utils';

const PHOTO_BUCKET = 'trainer-photos';
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const fields = {
  trainers: ['id', 'name_en', 'name_ar', 'role_en', 'role_ar', 'bio_en', 'bio_ar', 'photo_url', 'photo_path', 'codeforces_url', 'github_url', 'linkedin_url', 'published', 'sort_order'],
  faqs: ['id', 'question_en', 'question_ar', 'answer_en', 'answer_ar', 'published', 'sort_order'],
  site_settings: ['id', 'registration_open', 'registration_url', 'registration_embed_url', 'contact_email', 'instagram_url', 'facebook_url', 'linkedin_url', 'github_url', 'whatsapp_url'],
};

function fail(code, message) { const error = new Error(message); error.code = code; throw error; }
function client() {
  if (isDemo) fail('DEMO_READ_ONLY', 'Demo content is read-only. Connect Supabase to save changes.');
  if (!supabase || configurationError) fail('CONFIGURATION', configurationError || 'Supabase is not configured.');
  return supabase;
}
function check(result) { if (result.error) throw result.error; return result.data; }
function clean(table, record) {
  if (!fields[table]) fail('INVALID_TABLE', 'This content type is not editable.');
  const value = Object.fromEntries(fields[table].filter(key => record[key] !== undefined).map(key => [key, record[key]]));
  if (!value.id) delete value.id;
  for (const [key, url] of Object.entries(value)) {
    if (key.endsWith('_url')) {
      const valid = key === 'photo_url' ? imageUrl(url) : safeUrl(url);
      if (url && !valid) fail('INVALID_URL', 'Use an absolute HTTP or HTTPS link, or a supplied team photo path.');
      value[key] = valid || null;
      if (valid && ['registration_url', 'registration_embed_url'].includes(key)) {
        const formUrl = new URL(valid);
        // Canonicalize encoded query keys/values before applying SQL constraints.
        // Social/profile queries retain the representation returned by safeUrl.
        formUrl.search = formUrl.searchParams.toString();
        value[key] = formUrl.href;
      }
    }
  }
  if (table === 'trainers' && 'photo_path' in value) {
    value.photo_path = value.photo_path?.trim() || null;
    if (value.photo_path) value.photo_url = null;
  }
  if (table === 'site_settings') {
    if ('contact_email' in value) value.contact_email = value.contact_email?.trim() || null;
    if (value.registration_url && !validGoogleFormUrl(value.registration_url)) fail('INVALID_FORM', 'Use a valid HTTPS Google Form link.');
    if (value.registration_embed_url && !validGoogleFormUrl(value.registration_embed_url, true)) fail('INVALID_FORM', 'Use a Google Forms embed URL with embedded=true.');
    if (value.whatsapp_url && !validWhatsappUrl(value.whatsapp_url)) fail('INVALID_WHATSAPP', 'Use an HTTPS chat.whatsapp.com group invite link.');
    if (value.registration_open && !value.registration_url) fail('INVALID_FORM', 'Set a Google Form link before opening registration.');
    value.id = 1;
  }
  return value;
}

export async function checkAdmin() {
  if (isDemo || !supabase || configurationError) return false;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session) return false;
  return check(await supabase.rpc('is_admin')) === true;
}

export async function loadContent({ admin = false } = {}) {
  if (isDemo) return structuredClone(demoContent);
  if (isInitialContent && !admin) return structuredClone(initialContent);
  const db = client();
  if (admin && !(await checkAdmin())) fail('FORBIDDEN', 'Only approved club administrators can manage content.');
  const publicOnly = query => admin ? query : query.eq('published', true);
  const results = await Promise.all([
    publicOnly(db.from('trainers').select('*')).order('sort_order').order('created_at'),
    publicOnly(db.from('faqs').select('*')).order('sort_order').order('created_at'),
    db.from('site_settings').select('*').eq('id', 1).single(),
  ]);
  const [trainerRows, faqs, settings] = results.map(check);
  const trainers = await Promise.all(trainerRows.map(async trainer => {
    if (!trainer.photo_path) return trainer;
    // A private bucket applies storage SELECT policies when signing. Anonymous users
    // can sign only a photo referenced by a published trainer; admins can sign drafts.
    try {
      const photo = check(await db.storage.from(PHOTO_BUCKET).createSignedUrl(trainer.photo_path, 3600));
      return { ...trainer, photo_url: photo.signedUrl };
    } catch {
      // A removed/inaccessible image should use initials without discarding the
      // successfully loaded club records. Table-query failures still propagate.
      return { ...trainer, photo_url: null, photo_error: true };
    }
  }));
  return { trainers, faqs, settings };
}

export async function saveRecord(table, record) {
  if (!['trainers', 'faqs'].includes(table)) fail('INVALID_TABLE', 'This content type is not editable here.');
  return check(await client().from(table).upsert(clean(table, record)).select().single());
}

export async function deleteRecord(table, id) {
  if (!['trainers', 'faqs'].includes(table)) fail('INVALID_TABLE', 'This content type cannot be deleted.');
  const deleted = check(await client().from(table).delete().eq('id', id).select('id'));
  if (deleted.length !== 1) fail('FORBIDDEN', 'No record was deleted. Check your administrator access and refresh.');
}

export async function saveSettings(record) {
  return check(await client().from('site_settings').upsert(clean('site_settings', record)).select().single());
}

export async function uploadTrainerPhoto(file) {
  const db = client();
  const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  if (!file || !extensions[file.type]) fail('IMAGE_TYPE', 'Choose a JPEG, PNG, or WebP image.');
  if (!file.size || file.size > MAX_PHOTO_BYTES) fail('IMAGE_SIZE', 'Images must be smaller than 3 MB.');
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const hasSignature = (file.type === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    || (file.type === 'image/png' && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte))
    || (file.type === 'image/webp' && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP');
  if (!hasSignature) fail('IMAGE_TYPE', 'The file contents must match the image type.');
  const photo_path = `trainers/${crypto.randomUUID()}.${extensions[file.type]}`;
  check(await db.storage.from(PHOTO_BUCKET).upload(photo_path, file, { contentType: file.type, cacheControl: '3600', upsert: false }));
  try {
    const signed = check(await db.storage.from(PHOTO_BUCKET).createSignedUrl(photo_path, 3600));
    return { photo_path, photo_url: signed.signedUrl };
  } catch (error) {
    await db.storage.from(PHOTO_BUCKET).remove([photo_path]);
    throw error;
  }
}

export async function removeTrainerPhoto(path) {
  if (!path) return;
  if (!/^trainers\/[a-f0-9-]+\.(jpg|png|webp)$/.test(path)) fail('IMAGE_TYPE', 'Invalid trainer photo path.');
  check(await client().storage.from(PHOTO_BUCKET).remove([path]));
}
