/** Prefer the requested text translation, then the other language. */
export function localized(record, field, language = 'en') {
  if (!record) return '';
  const preferred = language.startsWith('ar') ? 'ar' : 'en';
  const value = record[`${field}_${preferred}`];
  const fallback = record[`${field}_${preferred === 'ar' ? 'en' : 'ar'}`];
  return typeof value === 'string' && value.trim()
    ? value : (typeof fallback === 'string' ? fallback : '');
}

/** Only absolute web links are allowed in user-managed public content. */
export function safeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value.trim());
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

/** Photos may use a supplied bundled team asset, or an absolute web URL. */
export function imageUrl(value) {
  if (typeof value !== 'string') return '';
  const url = value.trim();
  return /^\/assets\/team\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpe?g|png|webp)$/.test(url) ? url : safeUrl(url);
}

/** Accept only an HTTPS WhatsApp group invite, never an invented contact link. */
export function validWhatsappUrl(value) {
  if (!safeUrl(value)) return false;
  const url = new URL(value);
  return url.protocol === 'https:' && url.hostname === 'chat.whatsapp.com'
    && /^\/[A-Za-z0-9]{8,64}\/?$/.test(url.pathname) && !url.hash;
}

/** Restrict registration to Google Forms; embeds must use Google's embed URL. */
export function validGoogleFormUrl(value, embed = false) {
  if (!safeUrl(value)) return false;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hash) return false;
  if (!embed && url.hostname === 'forms.gle') return /^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname);
  const formPath = /^\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?[A-Za-z0-9_-]+\/viewform\/?$/;
  const embeddedValues = url.searchParams.getAll('embedded');
  return url.hostname === 'docs.google.com' && formPath.test(url.pathname)
    && (!embed || (embeddedValues.length === 1 && embeddedValues[0] === 'true'));
}

export function initials(name = '') {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => [...part][0]).join('');
}
