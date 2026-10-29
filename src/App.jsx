import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Menu, X, Globe2, Instagram, Github, Linkedin, Mail } from 'lucide-react';
import { ContentProvider, useContent } from './components/ContentProvider.jsx';
import { isDemo } from './lib/supabase.js';
import { safeUrl } from './lib/utils.js';
import { Home, About, Team, Join, NotFound } from './pages/index.jsx';
const Admin = lazy(() => import('./admin/Admin.jsx'));

const links = [['/', 'home'], ['/about', 'about'], ['/team', 'team'], ['/join', 'join']];

function Brand() {
  const { t } = useTranslation('shell');
  return <Link to="/" className="brand" aria-label="iSolve"><img src="/assets/isolve-art.jpg" width="40" height="50" alt="" /><span><strong dir="ltr">iSolve<span className="brand-dot">.</span></strong><small>{t('club')}</small></span></Link>;
}

function Header() {
  const { t, i18n } = useTranslation('shell');
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);
  const menuRef = useRef(null);
  const close = () => setOpen(false);
  const handleKey = event => {
    if (event.key === 'Escape' && open) { close(); menuButton.current?.focus(); }
    if (event.key === 'Tab' && open) {
      const focusable = menuRef.current?.querySelectorAll('a,button');
      const first = focusable?.[0]; const last = focusable?.[focusable.length - 1];
      if (!event.shiftKey && document.activeElement === menuButton.current) { event.preventDefault(); first?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); menuButton.current?.focus(); }
      else if (event.shiftKey && document.activeElement === menuButton.current) { event.preventDefault(); last?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); menuButton.current?.focus(); }
    }
  };
  return <header className="site-header" onKeyDown={handleKey}><div className="container header-inner">
    <Brand />
    <nav className={`main-nav ${open ? 'is-open' : ''}`} id="main-navigation" aria-label={t('explore')} ref={menuRef}>
      {links.map(([path,key]) => <NavLink key={path} to={path} end={path === '/'} onClick={close}>{t(key)}</NavLink>)}
    </nav>
    <div className="header-actions"><button className="language-switch" onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')} aria-label={t('language')}><Globe2 size={16} /><span lang={i18n.language === 'en' ? 'ar' : 'en'}>{i18n.language === 'en' ? 'العربية' : 'English'}</span></button><Link to="/join" className="button primary header-join">{t('join')}<ArrowUpRight size={16}/></Link><button ref={menuButton} className="menu-toggle icon-button" aria-expanded={open} aria-controls="main-navigation" aria-label={t(open ? 'closeMenu' : 'openMenu')} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div>
  </div></header>;
}

function Footer() {
  const { t } = useTranslation('shell'); const { data } = useContent();
  const settings = data.settings || {};
  const socials = [['instagram_url','Instagram',Instagram],['github_url','GitHub',Github],['linkedin_url','LinkedIn',Linkedin],['facebook_url','Facebook',Globe2]];
  return <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><Brand/><p>{t('tagline')}</p><p className="muted">{t('footnote')}</p><div className="parent-brand"><img src="/assets/iteam-logo.png" width="110" height="51" loading="lazy" alt="iTeam"/><span>{t('initiative')}</span></div></div><div><h2>{t('explore')}</h2><div className="footer-links">{links.map(([path,key]) => <Link key={path} to={path}>{t(key)}</Link>)}</div></div><div><h2>{t('connect')}</h2><p>{t('university')}</p><div className="footer-socials">{socials.map(([field,label,Icon]) => safeUrl(settings[field]) ? <a href={safeUrl(settings[field])} key={field} aria-label={label} target="_blank" rel="noopener noreferrer"><Icon size={19}/></a> : null)}{settings.contact_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contact_email) && <a href={`mailto:${settings.contact_email}`} aria-label={settings.contact_email}><Mail size={19}/></a>}</div><Link to="/admin" className="admin-link">{t('admin')}<ArrowUpRight size={14}/></Link></div></div><div className="container footer-bottom"><span>{t('rights')}</span><span className="footer-code" aria-hidden="true">&lt; iSolve /&gt;</span></div></footer>;
}

function PageEffects() {
  const { pathname } = useLocation(); const { t, i18n } = useTranslation('shell');
  useEffect(() => {
    const segment = pathname.split('/')[1];
    const key = ({'':'home',about:'about',team:'team',join:'join',admin:'admin'})[segment] || 'missing';
    document.title = `${t(`titles.${key}`)} | iSolve`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('description'));
  }, [pathname,t,i18n.language]);
  useEffect(() => { window.scrollTo(0,0); document.querySelector('main')?.focus({preventScroll:true}); }, [pathname]);
  return null;
}

function ErrorFallback() {
  const {t} = useTranslation('shell');
  return <main className="container section data-state"><h1>{t('errorTitle')}</h1><p>{t('errorNote')}</p><button className="button primary" onClick={() => window.location.reload()}>{t('reload')}</button></main>;
}
class ErrorBoundary extends Component {
  state = {failed:false};
  static getDerivedStateFromError() {return {failed:true};}
  render() { return this.state.failed ? <ErrorFallback/> : this.props.children; }
}

export default function App() {
  const {t} = useTranslation('shell');
  return <ErrorBoundary><ContentProvider><a className="skip-link" href="#main-content">{t('skip')}</a>{isDemo && <div className="demo-banner" role="status"><strong>{t('demo')}</strong><span>{t('demoNote')}</span></div>}<Header/><PageEffects/><main id="main-content" tabIndex={-1}><Suspense fallback={<div className="container section" role="status">{t('loading')}</div>}><Routes><Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/team" element={<Team/>}/><Route path="/join" element={<Join/>}/><Route path="/admin/*" element={<Admin/>}/><Route path="*" element={<NotFound/>}/></Routes></Suspense></main><Footer/></ContentProvider></ErrorBoundary>;
}
