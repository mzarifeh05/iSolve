// Verified initial information supplied by the user. This matches the initial
// migration, and is used without Supabase only when BOTH settings are absent.
// A configured database failure must never fall back to these records.
const members = [
  ['b8fa15c8-6a34-40fb-a019-2246b2cfce01', 'Mohammed Zarifeh', 'mohammed-zarifeh.jpg'],
  ['b8fa15c8-6a34-40fb-a019-2246b2cfce02', 'Leena Aburahmeh', 'leena-aburahmeh.png'],
  ['b8fa15c8-6a34-40fb-a019-2246b2cfce03', 'Yomna Aljabiri', 'yomna-aljabiri.png'],
  ['b8fa15c8-6a34-40fb-a019-2246b2cfce04', 'Hala Darwish', 'hala-darwish.png'],
  ['b8fa15c8-6a34-40fb-a019-2246b2cfce05', 'Rakan Alqhaiwi', 'rakan-alqhaiwi.png'],
];

export const initialContent = {
  trainers: members.map(([id, name, photo], index) => ({
    id, name_en: name, name_ar: name, role_en: 'Team Member', role_ar: 'عضو الفريق',
    bio_en: '', bio_ar: '', photo_url: `/assets/team/${photo}`, photo_path: null,
    codeforces_url: null, github_url: null, linkedin_url: null,
    published: true, sort_order: index,
  })),
  faqs: [
    { id: 'b8fa15c8-6a34-40fb-a019-2246b2cfce11', question_en: 'Can I join if I am new to programming?', question_ar: 'هل يمكنني الانضمام إذا كنت جديداً في البرمجة؟', answer_en: 'Yes. Beginners are welcome, and you do not need any programming competition experience. Bring your curiosity and willingness to learn.', answer_ar: 'بالتأكيد! نرحب بالمبتدئين، ولا تحتاج إلى خبرة في مسابقات البرمجة. يكفي فضولك واستعدادك للتعلّم.', sort_order: 0, published: true },
    { id: 'b8fa15c8-6a34-40fb-a019-2246b2cfce12', question_en: 'Do I need to know a lot about coding?', question_ar: 'هل أحتاج إلى معرفة كبيرة بالبرمجة؟', answer_en: 'You do not need advanced knowledge. We learn new ideas, look at examples, and ask questions together. Experienced students are welcome too.', answer_ar: 'لا تحتاج إلى معرفة متقدمة. نتعلّم أفكاراً جديدة، ونفهم الأمثلة، ونسأل معاً. ونرحب أيضاً بالطلبة ذوي الخبرة.', sort_order: 1, published: true },
    { id: 'b8fa15c8-6a34-40fb-a019-2246b2cfce13', question_en: 'Will we work together?', question_ar: 'هل نعمل معاً؟', answer_en: 'Yes. We practice in teams, share ideas, and discuss different ways to solve a problem. You can learn from others and help them learn too.', answer_ar: 'نعم! نتدرّب ضمن فرق، ونتبادل الأفكار، ونناقش طرقاً مختلفة لحل المشكلة. تتعلّم من زملائك وتساعدهم على التعلّم أيضاً.', sort_order: 2, published: true },
    { id: 'b8fa15c8-6a34-40fb-a019-2246b2cfce14', question_en: 'How do I prepare, and where are announcements shared?', question_ar: 'كيف أستعد، وأين أجد الإعلانات؟', answer_en: 'Bring your questions and be ready to take part. Current announcements and any preparation details are shared through the club’s WhatsApp groups.', answer_ar: 'جهّز أسئلتك واستعد للمشاركة. نشارك الإعلانات الحالية وأي تفاصيل للتحضير عبر مجموعات النادي على WhatsApp.', sort_order: 3, published: true },
    { id: 'b8fa15c8-6a34-40fb-a019-2246b2cfce15', question_en: 'How do I join?', question_ar: 'كيف أنضم؟', answer_en: 'Use the club’s Google Form when registration is open. The Join page will show the form link when it is available.', answer_ar: 'استخدم نموذج Google الخاص بالنادي عندما يكون التسجيل مفتوحاً. ستجد رابط النموذج في صفحة الانضمام عند توفره.', sort_order: 4, published: true },
  ],
  settings: {
    id: 1, registration_open: true, registration_url: 'https://docs.google.com/forms/d/e/1FAIpQLSfmiIE9gbBjrtwJJZUyu-Xt3sixIKz4x4dWZQuTbxZttrMG7A/viewform?usp=sharing&ouid=101765325223954785073', registration_embed_url: null,
    contact_email: null, whatsapp_url: null, github_url: null,
    instagram_url: 'https://www.instagram.com/iteamzuj/',
    facebook_url: 'https://www.facebook.com/search/top?q=iteam%20-%20zuj',
    linkedin_url: 'https://www.linkedin.com/company/iteamzuj/posts/?feedView=all',
  },
};
