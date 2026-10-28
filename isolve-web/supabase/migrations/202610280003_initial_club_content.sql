-- Initial factual content supplied by the user; no biographies or expertise invented.
-- Names retain their supplied spelling in both languages until translations are supplied.
begin;

insert into public.trainers(id, name_en, name_ar, role_en, role_ar, bio_en, bio_ar,
  photo_url, published, sort_order)
values
  ('b8fa15c8-6a34-40fb-a019-2246b2cfce01', 'Mohammed Zarifeh', 'Mohammed Zarifeh', 'Team Member', 'عضو الفريق', '', '', '/assets/team/mohammed-zarifeh.jpg', true, 0),
  ('b8fa15c8-6a34-40fb-a019-2246b2cfce02', 'Leena Aburahmeh', 'Leena Aburahmeh', 'Team Member', 'عضو الفريق', '', '', '/assets/team/leena-aburahmeh.png', true, 1),
  ('b8fa15c8-6a34-40fb-a019-2246b2cfce03', 'Yomna Aljabiri', 'Yomna Aljabiri', 'Team Member', 'عضو الفريق', '', '', '/assets/team/yomna-aljabiri.png', true, 2),
  ('b8fa15c8-6a34-40fb-a019-2246b2cfce04', 'Hala Darwish', 'Hala Darwish', 'Team Member', 'عضو الفريق', '', '', '/assets/team/hala-darwish.png', true, 3),
  ('b8fa15c8-6a34-40fb-a019-2246b2cfce05', 'Rakan Alqhaiwi', 'Rakan Alqhaiwi', 'Team Member', 'عضو الفريق', '', '', '/assets/team/rakan-alqhaiwi.png', true, 4);

insert into public.faqs(id, question_en, question_ar, answer_en, answer_ar, sort_order, published)
values
  ('b8fa15c8-6a34-40fb-a019-2246b2cfce11', 'Can I join if I am new to programming?', 'هل يمكنني الانضمام إذا كنت جديداً في البرمجة؟',
    'Yes. Beginners are welcome, and you do not need any programming competition experience. Bring your curiosity and willingness to learn.',
    'بالتأكيد! نرحب بالمبتدئين، ولا تحتاج إلى خبرة في مسابقات البرمجة. يكفي فضولك واستعدادك للتعلّم.', 0, true),
  ('b8fa15c8-6a34-40fb-a019-2246b2cfce12', 'Do I need to know a lot about coding?', 'هل أحتاج إلى معرفة كبيرة بالبرمجة؟',
    'You do not need advanced knowledge. We learn new ideas, look at examples, and ask questions together. Experienced students are welcome too.',
    'لا تحتاج إلى معرفة متقدمة. نتعلّم أفكاراً جديدة، ونفهم الأمثلة، ونسأل معاً. ونرحب أيضاً بالطلبة ذوي الخبرة.', 1, true),
  ('b8fa15c8-6a34-40fb-a019-2246b2cfce13', 'Will we work together?', 'هل نعمل معاً؟',
    'Yes. We practice in teams, share ideas, and discuss different ways to solve a problem. You can learn from others and help them learn too.',
    'نعم! نتدرّب ضمن فرق، ونتبادل الأفكار، ونناقش طرقاً مختلفة لحل المشكلة. تتعلّم من زملائك وتساعدهم على التعلّم أيضاً.', 2, true),
  ('b8fa15c8-6a34-40fb-a019-2246b2cfce14', 'How do I prepare, and where are announcements shared?', 'كيف أستعد، وأين أجد الإعلانات؟',
    'Bring your questions and be ready to take part. Current announcements and any preparation details are shared through the club’s WhatsApp groups.',
    'جهّز أسئلتك واستعد للمشاركة. نشارك الإعلانات الحالية وأي تفاصيل للتحضير عبر مجموعات النادي على WhatsApp.', 3, true),
  ('b8fa15c8-6a34-40fb-a019-2246b2cfce15', 'How do I join?', 'كيف أنضم؟',
    'Use the club’s Google Form when registration is open. The Join page will show the form link when it is available.',
    'استخدم نموذج Google الخاص بالنادي عندما يكون التسجيل مفتوحاً. ستجد رابط النموذج في صفحة الانضمام عند توفره.', 4, true);

update public.site_settings set
  instagram_url = 'https://www.instagram.com/iteamzuj/',
  facebook_url = 'https://www.facebook.com/search/top?q=iteam%20-%20zuj',
  linkedin_url = 'https://www.linkedin.com/company/iteamzuj/posts/?feedView=all'
where id = 1;

commit;
