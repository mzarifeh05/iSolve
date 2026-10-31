import { Component, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp, Menu, X, Globe2, Instagram, Linkedin, Facebook } from 'lucide-react';
import Landing from './pages/Landing.jsx';
import RegistrationButton from './components/RegistrationButton.jsx';
import { socialLinks } from './data/siteContent.js';

const links=['about','team','moments','registration','faq'];
function Brand(){
  const {t}=useTranslation('shell');
  return <a href="#home" className="brand" aria-label={`iSolve · ${t('backTop')}`}><img src="/assets/isolve-logo-transparent.png" width="349" height="140" alt="iSolve Coding Club"/></a>;
}
function Header(){
  const {t,i18n}=useTranslation('shell');
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState('home');
  const menuButton=useRef(null),menuRef=useRef(null);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id);
    },{rootMargin:'-100px 0px -55% 0px'});
    for(const id of ['home',...links]){const node=document.getElementById(id);if(node)observer.observe(node);}
    return()=>observer.disconnect();
  },[]);
  function keyDown(event){
    if(!open)return;
    if(event.key==='Escape'){setOpen(false);menuButton.current?.focus();}
    if(event.key==='Tab'){
      const items=menuRef.current?.querySelectorAll('a');const first=items?.[0],last=items?.[items.length-1];
      if(!event.shiftKey&&document.activeElement===menuButton.current){event.preventDefault();first?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();menuButton.current?.focus();}
      else if(event.shiftKey&&document.activeElement===menuButton.current){event.preventDefault();last?.focus();}
      else if(event.shiftKey&&document.activeElement===first){event.preventDefault();menuButton.current?.focus();}
    }
  }
  function navigate(id){setOpen(false);requestAnimationFrame(()=>document.getElementById(id)?.focus({preventScroll:true}));}
  return <header className="site-header" onKeyDown={keyDown}><div className="container header-inner">
    <Brand/>
    <nav ref={menuRef} id="main-navigation" className={`main-nav ${open?'is-open':''}`} aria-label={t('explore')}>
      {links.map(id=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined} onClick={()=>navigate(id)}>{t(id)}</a>)}
    </nav>
    <div className="header-actions"><button className="language-switch" onClick={()=>i18n.changeLanguage(i18n.language==='en'?'ar':'en')} aria-label={t('language')}><Globe2 size={17} aria-hidden="true"/><span lang={i18n.language==='en'?'ar':'en'}>{i18n.language==='en'?'عربي':'EN'}</span></button><RegistrationButton className="header-register"/><button ref={menuButton} className="menu-toggle icon-button" aria-expanded={open} aria-controls="main-navigation" aria-label={t(open?'closeMenu':'openMenu')} onClick={()=>setOpen(value=>!value)}>{open?<X aria-hidden="true"/>:<Menu aria-hidden="true"/>}</button></div>
  </div></header>;
}
function Footer(){
  const {t}=useTranslation('shell');const icons={Instagram,Facebook,LinkedIn:Linkedin};
  return <footer className="site-footer"><div className="container footer-grid">
    <div className="footer-brand"><Brand/><p>{t('tagline')}</p><p className="muted">{t('footnote')}</p><div className="parent-brand"><img src="/assets/iteam-logo.png" width="110" height="51" loading="lazy" alt="iTeam"/><span>{t('initiative')}</span></div></div>
    <div><h2>{t('explore')}</h2><div className="footer-links">{links.map(id=><a key={id} href={`#${id}`}>{t(id)}</a>)}</div></div>
    <div><h2>{t('connect')}</h2><p>{t('university')}</p><div className="footer-socials">{socialLinks.map(({name,url})=>{const Icon=icons[name];return <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} · ${t('external')}`}><Icon size={20} aria-hidden="true"/></a>;})}</div><RegistrationButton/></div>
  </div><div className="container footer-bottom"><span>{t('rights')}</span><a href="#home" className="text-link">{t('backTop')}<ArrowUp size={16} aria-hidden="true"/></a></div></footer>;
}
function PageEffects(){
  const {t,i18n}=useTranslation('shell');
  useEffect(()=>{document.title=t('title');document.querySelector('meta[name="description"]')?.setAttribute('content',t('description'));},[t,i18n.language]);
  useEffect(()=>{
    // Old bookmarks lead to their section on the single landing page.
    const previous={'/about':'about','/team':'team','/join':'registration'}[window.location.pathname.replace(/\/$/,'')];
    if(window.location.pathname!=='/')window.history.replaceState(null,'',`/${previous?`#${previous}`:window.location.hash}`);
    if(window.location.hash){let id;try{id=decodeURIComponent(window.location.hash.slice(1));}catch{return;}requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:'instant'}));}
  },[]);
  return null;
}
function ErrorFallback(){const {t}=useTranslation('shell');return <main className="container section"><h1>{t('errorTitle')}</h1><p>{t('errorNote')}</p><button className="button primary" onClick={()=>window.location.reload()}>{t('reload')}</button></main>;}
class ErrorBoundary extends Component{state={failed:false};static getDerivedStateFromError(){return{failed:true};}render(){return this.state.failed?<ErrorFallback/>:this.props.children;}}
export default function App(){
  const {t}=useTranslation('shell');
  return <ErrorBoundary><a href="#main-content" className="skip-link">{t('skip')}</a><Header/><PageEffects/><main id="main-content" tabIndex={-1}><Landing/></main><Footer/><a className="back-to-top icon-button" href="#home" aria-label={t('backTop')}><ArrowUp size={20} aria-hidden="true"/></a></ErrorBoundary>;
}
