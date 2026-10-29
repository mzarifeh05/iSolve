import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowUpRight, Lightbulb, Users, Code2, Check, Github, Linkedin, BookOpen, Heart, MessageCircle, ChevronDown, RefreshCw, Instagram, Facebook, Mail } from 'lucide-react';
import { useContent } from '../components/ContentProvider.jsx';
import { localized, safeUrl, imageUrl, validGoogleFormUrl, validWhatsappUrl, initials } from '../lib/utils.js';
import Gallery from '../gallery/Gallery.jsx';
import { heroImages } from '../data/hero.js';

function Heading({ eyebrow, title, description, children }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{description && <p>{description}</p>}</div>{children}</div>;
}

function Intro({ name }) {
  const { t } = useTranslation();
  return <div className="page-intro container"><p className="eyebrow">{t(`${name}.eyebrow`)}</p><h1>{t(`${name}.title`)}</h1><p>{t(`${name}.intro`)}</p></div>;
}

function DataState({ loading, error, retry }) {
  const { t } = useTranslation();
  if (loading) return <p role="status" className="data-state">{t('common.loading')}</p>;
  if (error) return <div role="alert" className="data-state error-state"><p>{t(error.code === 'CONFIGURATION' ? 'common.configuration' : 'common.error')}</p><button className="button secondary small" onClick={retry}><RefreshCw size={15} aria-hidden="true" />{t('common.retry')}</button></div>;
  return null;
}

function External({ url, className = 'text-link', children, label }) {
  const { t } = useTranslation();
  const href = safeUrl(url);
  if (!href) return null;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={label ? `${label} · ${t('common.external')}` : undefined}>{children}<span className="sr-only"> ({t('common.external')})</span></a>;
}

function TrainerCard({ trainer }) {
  const { t, i18n } = useTranslation();
  const [failedPhoto, setFailedPhoto] = useState('');
  const name = localized(trainer, 'name', i18n.language);
  const photoUrl = imageUrl(trainer.photo_url);
  const bio = localized(trainer, 'bio', i18n.language);
  return <article className="trainer-card"><div className="trainer-photo-wrap">{photoUrl && failedPhoto !== photoUrl ? <img className="trainer-photo" src={photoUrl} onError={() => setFailedPhoto(photoUrl)} alt={t('team.photoAlt', { name })} width="420" height="500" loading="lazy" /> : <div className="avatar" aria-hidden="true">{initials(name)}</div>}</div><div className="trainer-body"><p className="trainer-role">{t('team.role')}</p><h3>{name}</h3>{bio && <p className="trainer-bio">{bio}</p>}<div className="social-links"><External url={trainer.codeforces_url} label={`${name} · Codeforces`}><Code2 size={17} aria-hidden="true" /><bdi>Codeforces</bdi></External><External url={trainer.github_url} label={`${name} · GitHub`}><Github size={17} aria-hidden="true" /><bdi>GitHub</bdi></External><External url={trainer.linkedin_url} label={`${name} · LinkedIn`}><Linkedin size={17} aria-hidden="true" /><bdi>LinkedIn</bdi></External></div></div></article>;
}

function TeamCards() {
  const { t } = useTranslation();
  const { data, loading, error, retry } = useContent();
  const trainers = [...(data?.trainers || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  if (loading || error) return <DataState loading={loading} error={error} retry={retry} />;
  return trainers.length ? <div className="team-grid">{trainers.map(trainer => <TrainerCard key={trainer.id} trainer={trainer} />)}</div> : <div className="empty-state"><Users size={28} aria-hidden="true" /><h3>{t('team.emptyTitle')}</h3><p>{t('team.emptyText')}</p></div>;
}

function Cycle() {
  const { t } = useTranslation();
  const icons = [Lightbulb, BookOpen, Users, MessageCircle];
  return <div className="cycle-grid">{['learn', 'examples', 'practice', 'share'].map((step, index) => { const Icon = icons[index]; return <article className="cycle-card" key={step}><div className="cycle-card-top"><span className="cycle-icon"><Icon size={25} strokeWidth={1.7} aria-hidden="true" /></span><span className="step-number" aria-hidden="true">0{index + 1}</span></div><h3>{t(`cycle.${step}`)}</h3><p>{t(`cycle.${step}Text`)}</p></article>; })}</div>;
}

export function Home() {
  const { t } = useTranslation();
  const hero=heroImages.at(-1);
  return <>
    <section className="hero-shell"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" />{t('home.eyebrow')}</p><h1 className="hero-title"><span>{t('home.line1')}</span><span className="accent">{t('home.line2')}</span><span className="orange-accent">{t('home.line3')}</span></h1><p className="hero-description">{t('home.description')}</p><div className="hero-actions"><Link className="button primary" to="/join">{t('home.join')}<ArrowUpRight className="directional" size={20} aria-hidden="true" /></Link><Link className="button secondary" to="/about">{t('home.about')}<ArrowRight className="directional" size={18} aria-hidden="true" /></Link></div><p className="hero-note"><span className="note-check"><Check size={14} aria-hidden="true" /></span>{t('home.note')}</p></div><div className="hero-visual"><span className="visual-corner corner-one" aria-hidden="true">{'{'}</span><span className="visual-corner corner-two" aria-hidden="true">{'}'}</span><figure className="competition-photo"><picture><source type="image/webp" srcSet={heroImages.map(image=>`${image.src} ${image.width}w`).join(',')} sizes="(max-width: 700px) 100vw, 55vw"/><img src={hero.fallback} srcSet={heroImages.map(image=>`${image.fallback} ${image.width}w`).join(',')} sizes="(max-width: 700px) 100vw, 55vw" width={hero.width} height={hero.height} alt={t('home.imageAlt')} fetchPriority="high" /></picture><figcaption>{t('home.imageCaption')}</figcaption></figure><div className="hero-sticker"><span className="sticker-icon"><Lightbulb size={25} aria-hidden="true" /></span><div><strong>{t('home.sticker')}</strong><span>{t('home.stickerNote')}</span></div></div><div className="hero-parent"><img src="/assets/iteam-logo.png" width="110" height="51" alt="iTeam" /></div></div></div></section>
    <section className="section cycle-section"><div className="container"><Heading eyebrow={t('home.cycleEyebrow')} title={t('home.cycleTitle')} description={t('home.cycleDescription')} /><Cycle /></div></section>
    <section className="section mission-section"><div className="container mission-grid"><div className="mission-visual" aria-hidden="true"><span className="mission-bracket">{'{'}</span><div className="mission-ideas"><span><Lightbulb size={19} />{t('home.missionVisual1')}</span><span><Users size={19} />{t('home.missionVisual2')}</span><span><Code2 size={19} />{t('home.missionVisual3')}</span></div><span className="mission-bracket">{'}'}</span></div><div><p className="eyebrow">{t('home.missionEyebrow')}</p><h2>{t('home.missionTitle')}</h2><p>{t('home.missionDescription')}</p><Link to="/about" className="text-link">{t('home.missionLink')}<ArrowRight size={18} className="directional" aria-hidden="true" /></Link></div></div></section>
    <section className="section container team-preview"><Heading eyebrow={t('home.teamEyebrow')} title={t('home.teamTitle')} description={t('home.teamDescription')}><Link to="/team" className="text-link section-link">{t('home.teamLink')}<ArrowRight className="directional" size={18} aria-hidden="true" /></Link></Heading><TeamCards /></section>
    <Gallery /><section className="section container"><div className="cta-panel"><div><p className="eyebrow">{t('home.ctaEyebrow')}</p><h2>{t('home.ctaTitle')}</h2><p>{t('home.ctaDescription')}</p></div><Link to="/join" className="button light">{t('home.ctaButton')}<ArrowUpRight className="directional" size={20} aria-hidden="true" /></Link><span className="cta-brackets" dir="ltr" aria-hidden="true">{'</>'}</span></div></section>
  </>;
}

export function About() {
  const { t } = useTranslation();
  const icons = [Lightbulb, Users, Heart, MessageCircle];
  return <><Intro name="about" /><section className="section container about-grid"><article className="about-panel"><span className="about-icon"><Lightbulb size={28} aria-hidden="true" /></span><h2>{t('about.thinkingTitle')}</h2><p>{t('about.thinkingText')}</p></article><article className="about-panel"><span className="about-icon"><Users size={28} aria-hidden="true" /></span><h2>{t('about.challengesTitle')}</h2><p>{t('about.challengesText')}</p></article><article className="about-panel about-welcome"><span className="about-icon"><Heart size={28} aria-hidden="true" /></span><h2>{t('about.welcomeTitle')}</h2><p>{t('about.welcomeText')}</p></article></section><section className="section mission-section"><div className="container about-purpose"><article><p className="eyebrow">{'01 /'}</p><h2>{t('about.mission')}</h2><p>{t('about.missionText')}</p></article><article><p className="eyebrow">{'02 /'}</p><h2>{t('about.vision')}</h2><p>{t('about.visionText')}</p></article></div></section><section className="section container"><Heading eyebrow={t('about.valuesEyebrow')} title={t('about.valuesTitle')} /><div className="values-grid">{['curiosity', 'teamwork', 'practice', 'sharing'].map((value, index) => { const Icon = icons[index]; return <article className="value-card" key={value}><Icon size={26} aria-hidden="true" /><h3>{t(`about.${value}`)}</h3><p>{t(`about.${value}Text`)}</p></article>; })}</div></section><section className="section container"><div className="updates-panel"><div><MessageCircle size={30} aria-hidden="true" /><h2>{t('about.updatesTitle')}</h2><p>{t('about.updatesText')}</p></div><Link to="/join" className="button primary">{t('about.join')}<ArrowUpRight size={19} className="directional" aria-hidden="true" /></Link></div></section></>;
}

export function Team() {
  return <><Intro name="team" /><section className="section container listing-section"><TeamCards /></section></>;
}

function ContactLinks({ settings }) {
  const { t } = useTranslation();
  const socials = [['instagram_url', 'instagram', Instagram], ['facebook_url', 'facebook', Facebook], ['linkedin_url', 'linkedin', Linkedin], ['github_url', 'github', Github]];
  const whatsapp = validWhatsappUrl(settings.whatsapp_url) ? safeUrl(settings.whatsapp_url) : '';
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contact_email || '') ? settings.contact_email : '';
  return <div className="contact-panel"><p className="eyebrow">{t('join.contactEyebrow')}</p><h2>{t('join.contactTitle')}</h2><p>{t('join.contactText')}</p><div className="contact-links">{socials.map(([field, key, Icon]) => <External key={field} url={settings[field]} className="contact-link"><Icon size={19} aria-hidden="true" /><bdi>{t(`join.${key}`)}</bdi><ArrowUpRight size={16} className="directional" aria-hidden="true" /></External>)}{email && <a className="contact-link" href={`mailto:${email}`}><Mail size={19} aria-hidden="true" />{t('common.email')}</a>}</div><div className="whatsapp-note"><MessageCircle size={24} aria-hidden="true" /><div><p>{t('join.whatsappText')}</p>{whatsapp ? <External url={whatsapp}>{t('join.whatsappButton')}<ArrowUpRight size={17} className="directional" aria-hidden="true" /></External> : <p className="muted">{t('join.whatsappNoLink')}</p>}</div></div></div>;
}

export function Join() {
  const { t, i18n } = useTranslation();
  const { data, loading, error, retry } = useContent();
  const settings = data?.settings || {};
  const registrationUrl = settings.registration_open && validGoogleFormUrl(settings.registration_url) ? safeUrl(settings.registration_url) : '';
  const embedUrl = registrationUrl && validGoogleFormUrl(settings.registration_embed_url, true) ? safeUrl(settings.registration_embed_url) : '';
  return <><Intro name="join" /><section className="section container listing-section"><div className="join-grid"><div className="join-panel"><span className="join-icon"><Code2 size={31} aria-hidden="true" /></span><h2>{t('join.panelTitle')}</h2><p>{t('join.panelText')}</p>{loading || error ? <DataState loading={loading} error={error} retry={retry} /> : registrationUrl ? <><External url={registrationUrl} className="button primary">{t('join.open')}<ArrowUpRight size={18} className="directional" aria-hidden="true" /></External><p className="form-notice">{t('join.externalNotice')}</p></> : <div className="registration-closed"><span className="status-dot" /><strong>{t('join.closedTitle')}</strong><p>{t('join.closedText')}</p></div>}</div><div className="join-expect"><p className="eyebrow" dir="ltr">{'< hello, world / >'}</p><h2>{t('join.expectTitle')}</h2><ul className="expect-list">{t('join.expectations', { returnObjects: true }).map(expectation => <li key={expectation}><Check size={19} aria-hidden="true" /><span>{expectation}</span></li>)}</ul></div></div>{embedUrl && <div className="form-embed"><iframe src={embedUrl} title={t('join.embedTitle')} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /><p>{t('join.formLoading')}</p></div>}</section><section className="section faq-section"><div className="container faq-layout"><div><p className="eyebrow">{t('join.faqEyebrow')}</p><h2>{t('join.faqTitle')}</h2><span className="faq-symbol" aria-hidden="true">?</span></div><div className="faq-list">{loading || error ? <DataState loading={loading} error={error} retry={retry} /> : data?.faqs?.length ? data.faqs.map(faq => <details key={faq.id}><summary>{localized(faq, 'question', i18n.language)}<ChevronDown size={19} aria-hidden="true" /></summary><p>{localized(faq, 'answer', i18n.language)}</p></details>) : <p>{t('join.noFaq')}</p>}</div></div></section><section className="section container">{loading || error ? <DataState loading={loading} error={error} retry={retry} /> : <ContactLinks settings={settings} />}</section></>;
}

export function NotFound() {
  const { t } = useTranslation();
  return <section className="section container not-found"><span className="not-found-code" aria-hidden="true">{'{ 404 }'}</span><p className="eyebrow">{t('notFound.eyebrow')}</p><h1>{t('notFound.title')}</h1><p>{t('notFound.description')}</p><Link to="/" className="button primary">{t('notFound.button')}<ArrowRight size={18} className="directional" aria-hidden="true" /></Link></section>;
}
