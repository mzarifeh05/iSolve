import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.js';
import ar from './ar.js';
import { adminTranslations } from '../admin/translations.js';
import { galleryTranslations } from '../gallery/translations.js';

const shell = {
  en: {
    home: 'Home', about: 'About', team: 'Team', join: 'Join the Club', club: 'Coding Club',
    initiative: 'An iTeam initiative at ZUJ.', university: 'Al-Zaytoonah University of Jordan',
    tagline: 'Every idea starts with curiosity.', footnote: 'A place to learn, try, and figure things out together.',
    explore: 'Explore', connect: 'Find us here', admin: 'Club administration', rights: 'iSolve Coding Club · An iTeam initiative.',
    skip: 'Skip to content', openMenu: 'Open navigation', closeMenu: 'Close navigation', language: 'Switch to Arabic',
    demo: 'Demo mode', demoNote: 'Read-only preview · No changes are stored', loading: 'Loading…',
    errorTitle: 'Something went wrong', errorNote: 'Please reload the page and try again.', reload: 'Reload page',
    titles: { home: 'Learn, try, and solve together', about: 'About iSolve', team: 'Meet the Team', join: 'Join iSolve', admin: 'Club Administration', missing: 'Page not found' },
    description: 'New to programming? You are welcome here. Learn how to break a problem into simple steps and solve it with others at iSolve, by iTeam at Al-Zaytoonah University of Jordan.',
  },
  ar: {
    home: 'الرئيسية', about: 'عن النادي', team: 'الفريق', join: 'انضم إلى النادي', club: 'نادي البرمجة',
    initiative: 'إحدى مبادرات iTeam في جامعة الزيتونة الأردنية.', university: 'جامعة الزيتونة الأردنية',
    tagline: 'كل فكرة تبدأ بفضول.', footnote: 'مساحة نتعلم فيها ونجرب ونصل إلى الحل معًا.',
    explore: 'استكشف', connect: 'تواصل معنا', admin: 'إدارة الموقع', rights: 'نادي iSolve للبرمجة · إحدى مبادرات iTeam.',
    skip: 'انتقل إلى المحتوى', openMenu: 'افتح قائمة التنقل', closeMenu: 'أغلق قائمة التنقل', language: 'التبديل إلى الإنجليزية',
    demo: 'وضع العرض التجريبي', demoNote: 'معاينة للقراءة فقط · لا تُحفظ التغييرات', loading: 'جارٍ التحميل…',
    errorTitle: 'حدث خطأ', errorNote: 'أعد تحميل الصفحة وحاول مرة أخرى.', reload: 'أعد تحميل الصفحة',
    titles: { home: 'نتعلم ونجرب ونحل معًا', about: 'عن iSolve', team: 'تعرّف إلى الفريق', join: 'انضم إلى iSolve', admin: 'إدارة الموقع', missing: 'الصفحة غير موجودة' },
    description: 'جديد في البرمجة؟ أهلًا بك! نتعلم كيف نقسم المسألة إلى خطوات بسيطة ونصل إلى الحل معًا في نادي iSolve، إحدى مبادرات iTeam في جامعة الزيتونة الأردنية.',
  },
};

let language = 'ar';
try {
  const saved = localStorage.getItem('isolve-language');
  if (saved === 'en' || saved === 'ar') language = saved;
} catch { /* Arabic remains the default when storage is unavailable. */ }
function applyLanguage(lng) {
  document.documentElement.lang = lng === 'en' ? 'en' : 'ar';
  document.documentElement.dir = lng === 'en' ? 'ltr' : 'rtl';
}
applyLanguage(language);
i18n.use(initReactI18next).init({
  resources: { en: { public: en, shell: shell.en, admin: adminTranslations.en, gallery: galleryTranslations.en }, ar: { public: ar, shell: shell.ar, admin: adminTranslations.ar, gallery: galleryTranslations.ar } },
  lng: language, fallbackLng: 'ar', defaultNS: 'public', interpolation: { escapeValue: false }, returnNull: false,
});
i18n.on('languageChanged', lng => {
  applyLanguage(lng);
  try { localStorage.setItem('isolve-language', lng === 'en' ? 'en' : 'ar'); } catch { /* Switching still works without persistence. */ }
});
export default i18n;
