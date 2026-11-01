import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {localized,initials} from '../src/lib/utils.js';
import {members,faqs,registrationUrl,socialLinks} from '../src/data/siteContent.js';

test('bilingual text falls back when a translation is missing',()=>{
  assert.equal(localized({name_en:'Hello',name_ar:'أهلًا'},'name','ar'),'أهلًا');
  assert.equal(localized({name_en:'Hello',name_ar:' '},'name','ar'),'Hello');
  assert.equal(localized({answer_ar:'إجابة'},'answer','en'),'إجابة');
  assert.equal(localized(null,'name'),'');
  assert.equal(initials('Mohammed Zarifeh'),'MZ');
});
test('all six current members retain their names and available portraits',()=>{
  assert.deepEqual(members.map(member=>member.name_en),['Mohammed Zarifeh','Leena Aburahmeh','Hala Darwish','Rakan Alqhaiwi','Leen Zirieni','Rayan Odah']);
  assert.equal(new Set(members.map(member=>member.photo_url)).size,6);
  for(const member of members)assert.ok(existsSync(new URL(`../public${member.photo_url}`,import.meta.url)));
  assert.ok(existsSync(new URL('../public/assets/isolve-logo-transparent.png',import.meta.url)));
});
test('registration and contact destinations remain exactly the supplied links',()=>{
  assert.equal(registrationUrl,'https://docs.google.com/forms/d/e/1FAIpQLSfmiIE9gbBjrtwJJZUyu-Xt3sixIKz4x4dWZQuTbxZttrMG7A/viewform?usp=sharing&ouid=101765325223954785073');
  assert.deepEqual(socialLinks.map(link=>link.url),['https://www.instagram.com/iteamzuj/','https://www.facebook.com/search/top?q=iteam%20-%20zuj','https://www.linkedin.com/company/iteamzuj/posts/?feedView=all']);
  assert.equal(faqs.length,6);
  assert.match(faqs.find(faq=>faq.id==='weekly-gathering').answer_en,/every Thursday in the university labs/);
  assert.ok(faqs.every(faq=>faq.question_en&&faq.question_ar&&faq.answer_en&&faq.answer_ar));
  assert.doesNotMatch(faqs.at(-1).answer_en,/Join page/);
});
test('the shared navigation/footer logo has an actual transparent background',async()=>{
  const logo=sharp(fileURLToPath(new URL('../public/assets/isolve-logo-transparent.png',import.meta.url)));
  const metadata=await logo.metadata(),stats=await logo.stats();
  assert.equal(metadata.hasAlpha,true);assert.equal(stats.channels.at(-1).min,0);assert.equal(stats.channels.at(-1).max,255);
  assert.ok(metadata.width>=400);
});
