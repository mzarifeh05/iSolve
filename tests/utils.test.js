import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { localized, safeUrl, imageUrl, validGoogleFormUrl, validWhatsappUrl, initials } from '../src/lib/utils.js';
import { initialContent } from '../src/data/initialContent.js';

test('bilingual names and biographies gracefully fall back', () => {
  assert.equal(localized({ name_en: 'Leena Aburahmeh', name_ar: '' }, 'name', 'ar'), 'Leena Aburahmeh');
  assert.equal(localized({ bio_en: '', bio_ar: 'أهلًا بك' }, 'bio', 'en'), 'أهلًا بك');
  assert.equal(localized(null, 'name', 'ar'), '');
  assert.equal(initials('Mohammed Zarifeh'), 'MZ');
});
test('web links and bundled images reject unsafe protocols and traversal', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,x', '/relative', 'https://user:pass@example.com']) assert.equal(safeUrl(url), '');
  assert.equal(imageUrl('/assets/team/leena-aburahmeh.png'), '/assets/team/leena-aburahmeh.png');
  for (const url of ['/assets/team/../../secret.jpg', '/assets/team/image.svg', '//example.com/image.png']) assert.equal(imageUrl(url), '');
});
test('Google Forms and WhatsApp invites require the expected secure hosts', () => {
  assert.equal(validGoogleFormUrl('https://forms.gle/AbC123'), true);
  assert.equal(validGoogleFormUrl('https://docs.google.com/forms/d/e/AbC123/viewform?embedded=true', true), true);
  assert.equal(validGoogleFormUrl('https://docs.google.com/forms/d/e/AbC123/viewform', true), false);
  for (const url of ['https://docs.google.com.evil.test/forms/d/e/id/viewform', 'http://forms.gle/AbC', 'https://example.com']) assert.equal(validGoogleFormUrl(url), false);
  assert.equal(validWhatsappUrl('https://chat.whatsapp.com/AbCdEfGh12345678'), true);
  for (const url of ['', 'https://chat.whatsapp.com.evil.test/AbCdEfGh1234', 'http://chat.whatsapp.com/AbCdEfGh1234', 'https://wa.me/123']) assert.equal(validWhatsappUrl(url), false);
});
test('form embeds reject duplicate keys, including encoded duplicate keys', () => {
  const base = 'https://docs.google.com/forms/d/e/AbC123/viewform';
  for (const query of ['embedded=true&embedded=false', 'embedded=false&embedded=true', 'embedded=true&embedded=true', 'embedded&embedded=true', '%65mbedded=true&embedded=true']) {
    assert.equal(validGoogleFormUrl(`${base}?${query}`, true), false);
  }
  assert.equal(validGoogleFormUrl(`${base}?%65mbedded=tr%75e`, true), true);
});
test('URL normalization handles secure host aliases while preserving social queries', () => {
  assert.equal(safeUrl('https://CHAT.WHATSAPP.COM:443/InviteAbc123'), 'https://chat.whatsapp.com/InviteAbc123');
  const form = 'https://DOCS.GOOGLE.COM:443/forms/d/e/AbC123/viewform?embedded=true';
  assert.equal(validGoogleFormUrl(form, true), true);
  assert.equal(safeUrl(form), 'https://docs.google.com/forms/d/e/AbC123/viewform?embedded=true');
  assert.equal(safeUrl(initialContent.settings.facebook_url), initialContent.settings.facebook_url);
});
test('verified initial content has all supplied portraits and no invented registration', () => {
  assert.deepEqual(initialContent.trainers.map(member => member.name_en), ['Mohammed Zarifeh', 'Leena Aburahmeh', 'Yomna Aljabiri', 'Hala Darwish', 'Rakan Alqhaiwi']);
  assert.equal(new Set(initialContent.trainers.map(member => member.role_en)).size, 1);
  assert.equal(new Set(initialContent.trainers.map(member => member.photo_url)).size, 5);
  for (const member of initialContent.trainers) assert.ok(existsSync(new URL(`../public${member.photo_url}`, import.meta.url)));
  assert.equal(initialContent.settings.registration_open, true);
  assert.ok(validGoogleFormUrl(initialContent.settings.registration_url));
  assert.equal(initialContent.settings.whatsapp_url, null);
  assert.equal(initialContent.settings.instagram_url, 'https://www.instagram.com/iteamzuj/');
  assert.equal(initialContent.faqs.length, 5);
});
