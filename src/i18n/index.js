import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.js';
import ar from './ar.js';
import { galleryTranslations } from '../gallery/translations.js';

const shell = {
  en: {
    about:'About',team:'Our team',moments:'iSolve moments',registration:'Registration',faq:'FAQ',register:'Register now',
    initiative:'An iTeam initiative at ZUJ.',university:'Al-Zaytoonah University of Jordan',
    tagline:'Every idea starts with curiosity.',footnote:'A place to learn, try, and figure things out together.',
    explore:'Explore iSolve',connect:'Stay connected',rights:'iSolve Coding Club · An iTeam initiative.',
    skip:'Skip to content',openMenu:'Open navigation',closeMenu:'Close navigation',language:'Switch to Arabic',backTop:'Back to top',
    external:'Opens in a new tab',title:'Learn, try, and solve together | iSolve',
    description:'New to programming? You are welcome here. Learn, practise, and solve together at iSolve Coding Club, by iTeam at Al-Zaytoonah University of Jordan.',
    errorTitle:'Something went wrong',errorNote:'Please reload the page and try again.',reload:'Reload page',
  },
  ar: {
    about:'عن النادي',team:'فريقنا',moments:'لحظات iSolve',registration:'التسجيل',faq:'الأسئلة الشائعة',register:'سجّل الآن',
    initiative:'إحدى مبادرات iTeam في جامعة الزيتونة الأردنية.',university:'جامعة الزيتونة الأردنية',
    tagline:'كل فكرة تبدأ بفضول.',footnote:'مساحة نتعلّم فيها ونجرب ونصل إلى الحل معًا.',
    explore:'استكشف iSolve',connect:'لنبقَ على تواصل',rights:'نادي iSolve للبرمجة · إحدى مبادرات iTeam.',
    skip:'انتقل إلى المحتوى',openMenu:'افتح قائمة التنقل',closeMenu:'أغلق قائمة التنقل',language:'التبديل إلى الإنجليزية',backTop:'العودة إلى الأعلى',
    external:'يفتح في علامة تبويب جديدة',title:'نتعلّم ونجرب ونحلّ معًا | iSolve',
    description:'جديد في البرمجة؟ أهلًا بك! نتعلّم ونتدرّب ونحلّ معًا في نادي iSolve، إحدى مبادرات iTeam في جامعة الزيتونة الأردنية.',
    errorTitle:'حدث خطأ',errorNote:'أعد تحميل الصفحة وحاول مرة أخرى.',reload:'أعد تحميل الصفحة',
  },
};

let language='ar';
try { const saved=localStorage.getItem('isolve-language');if(saved==='en'||saved==='ar')language=saved; } catch { /* Switching also works without storage. */ }
function applyLanguage(lng){document.documentElement.lang=lng==='en'?'en':'ar';document.documentElement.dir=lng==='en'?'ltr':'rtl';}
applyLanguage(language);
i18n.use(initReactI18next).init({
  resources:{en:{public:en,shell:shell.en,gallery:galleryTranslations.en},ar:{public:ar,shell:shell.ar,gallery:galleryTranslations.ar}},
  lng:language,fallbackLng:'ar',defaultNS:'public',interpolation:{escapeValue:false},returnNull:false,
});
i18n.on('languageChanged',lng=>{applyLanguage(lng);try{localStorage.setItem('isolve-language',lng==='en'?'en':'ar');}catch{/* Language still changes. */}});
export default i18n;
