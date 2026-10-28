import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft,ChevronRight,X,Expand,RefreshCw,ImageOff } from 'lucide-react';
import { galleryCategories,loadGallery,galleryLightbox,renewGalleryThumbnails } from '../lib/gallery.js';
import { localized } from '../lib/utils.js';
import './gallery.css';

export function GalleryPicture({photo,onOpen}) {
  const {t,i18n}=useTranslation('gallery');
  const [failed,setFailed]=useState(false);
  const [retry,setRetry]=useState(0);
  const [renewed,setRenewed]=useState(null);
  const images=renewed||photo.variants.thumbnails;
  const fallback=images.find(image=>image.width>=640)||images.at(-1);
  const caption=localized(photo,'caption',i18n.language);
  return <article className="gallery-card"><div className="gallery-frame">
    {failed ? <div className="gallery-image-error"><ImageOff aria-hidden="true"/><p>{t('imageError')}</p><button onClick={async()=>{try{setRenewed(await renewGalleryThumbnails(photo));setFailed(false);setRetry(value=>value+1);}catch{setFailed(true);}}}>{t('retry')}</button></div> : <button className="gallery-open" onClick={onOpen} aria-label={t('open',{caption})} aria-haspopup="dialog">
      <picture key={`${photo.id}-${retry}`}><source type="image/webp" srcSet={images.map(image=>`${image.url||image.path} ${image.width}w`).join(',')} sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) calc((100vw - 84px) / 2), (max-width: 1296px) calc((100vw - 132px) / 3), 388px"/>
        <img src={fallback.fallback_url||fallback.fallback_path} srcSet={images.map(image=>`${image.fallback_url||image.fallback_path} ${image.width}w`).join(',')} sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) calc((100vw - 84px) / 2), (max-width: 1296px) calc((100vw - 132px) / 3), 388px" width={fallback.width} height={fallback.height} alt={localized(photo,'alt',i18n.language)} loading="lazy" decoding="async" style={{objectFit:photo.fit||'contain',objectPosition:`${photo.focal_x??50}% ${photo.focal_y??50}%`}} onError={()=>setFailed(true)}/></picture><span className="gallery-expand" aria-hidden="true"><Expand size={18}/></span>
    </button>}
  </div><div className="gallery-caption"><span className={`gallery-category category-${photo.category}`}>{t(photo.category)}</span><h3>{caption}</h3></div></article>;
}

function Lightbox({photo,index,onClose,onPrevious,onNext,canPrevious,canNext,busy}) {
  const {t,i18n}=useTranslation('gallery');
  const dialog=useRef(null);
  const [state,setState]=useState({id:null,image:null,error:false});
  const [revision,setRevision]=useState(0);
  useEffect(()=>{
    const node=dialog.current;
    const focused=document.activeElement;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    node.showModal();
    return ()=>{node.close();document.body.style.overflow=overflow;focused?.focus({preventScroll:true});};
  },[]);
  useEffect(()=>{
    let active=true;
    galleryLightbox(photo).then(image=>{if(active)setState({id:photo.id,image,error:false});}).catch(()=>{if(active)setState({id:photo.id,image:null,error:true});});
    return ()=>{active=false;};
  },[photo,revision]);
  const ready=state.id===photo.id;
  function keyDown(event){
    if(busy&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();return;}
    if(event.key==='ArrowRight'){event.preventDefault();if(i18n.dir()==='rtl'){if(canPrevious)onPrevious();}else if(canNext)onNext();}
    if(event.key==='ArrowLeft'){event.preventDefault();if(i18n.dir()==='rtl'){if(canNext)onNext();}else if(canPrevious)onPrevious();}
    if(event.key==='Tab'){
      const controls=[...dialog.current.querySelectorAll('button:not(:disabled),a[href]')];
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
  }
  return <dialog ref={dialog} className="gallery-lightbox" aria-label={t('viewer')} aria-describedby="gallery-lightbox-caption" onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===event.currentTarget)onClose();}} onKeyDown={keyDown}>
    <div className="lightbox-content"><div className="lightbox-toolbar"><span>{t('position',{number:(index+1).toLocaleString(i18n.language)})}</span><button className="lightbox-close" onClick={onClose} aria-label={t('close')} autoFocus><X/></button></div>
      <div className="lightbox-image-frame">{!ready ? <p role="status">{t('loading')}</p> : state.error ? <div role="alert"><p>{t('imageError')}</p><button className="button light" onClick={()=>{setState({id:null,image:null,error:false});setRevision(value=>value+1);}}>{t('retry')}</button></div> : <picture><source type="image/webp" srcSet={state.image.url}/><img src={state.image.fallback_url} width={state.image.width} height={state.image.height} alt={localized(photo,'alt',i18n.language)} decoding="async" onError={()=>setState({id:photo.id,image:null,error:true})}/></picture>}</div>
      <div className="lightbox-bottom"><div><span className="gallery-category">{t(photo.category)}</span><p id="gallery-lightbox-caption">{localized(photo,'caption',i18n.language)}</p></div><div className="lightbox-navigation"><button onClick={onPrevious} disabled={!canPrevious||busy} aria-label={t('previous')}><ChevronLeft className="directional"/></button><button onClick={onNext} disabled={!canNext||busy} aria-label={t('next')}><ChevronRight className="directional"/></button></div></div>
    </div>
  </dialog>;
}

export default function Gallery(){
  const {t}=useTranslation('gallery');
  const section=useRef(null);
  const [active,setActive]=useState(false);
  const [category,setCategory]=useState('all');
  const [state,setState]=useState({items:[],hasMore:false,nextOffset:0,loading:true,error:false});
  const [revision,setRevision]=useState(0);
  const [selected,setSelected]=useState(null);
  const request=useRef(0);
  const loadingPage=useRef(false);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setActive(true);observer.disconnect();}},{rootMargin:'450px'});
    observer.observe(section.current);return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if(!active)return;
    const id=++request.current;
    let current=true;
    loadGallery({category}).then(page=>{if(current&&id===request.current)setState({...page,loading:false,error:false});}).catch(()=>{if(current&&id===request.current)setState({items:[],hasMore:false,nextOffset:0,loading:false,error:true});});
    return ()=>{current=false;};
  },[active,category,revision]);
  function filter(value){setCategory(value);setSelected(null);setState({items:[],hasMore:false,nextOffset:0,loading:true,error:false});if(category===value)setRevision(value=>value+1);}
  async function more(){
    if(loadingPage.current)return 0;
    loadingPage.current=true;
    const id=request.current;
    setState(previous=>({...previous,loading:true,error:false}));
    try{const page=await loadGallery({category,offset:state.nextOffset});if(id===request.current){setState(previous=>({...page,items:[...previous.items,...page.items],loading:false,error:false}));return page.items.length;}}
    catch{if(id===request.current)setState(previous=>({...previous,loading:false,error:true}));}finally{loadingPage.current=false;}return 0;
  }
  return <section ref={section} className="section gallery-section" aria-labelledby="gallery-title"><div className="container"><div className="section-heading"><div><p className="eyebrow">{t('eyebrow')}</p><h2 id="gallery-title">{t('title')}</h2><p>{t('intro')}</p></div></div>
    <div className="gallery-filters" role="group" aria-label={t('filters')}>{galleryCategories.map(value=><button key={value} aria-pressed={category===value} onClick={()=>filter(value)}>{t(value)}</button>)}</div>
    <div className="gallery-grid" aria-busy={state.loading}>{state.items.map((photo,index)=><GalleryPicture key={photo.id} photo={photo} onOpen={()=>setSelected(index)}/>)}{state.loading&&!state.items.length&&[0,1,2,3,4,5].map(value=><div className="gallery-skeleton" key={value} aria-hidden="true"><div/><span/><span/></div>)}</div>
    {state.error&&<div className="gallery-status" role="alert"><p>{t('loadError')}</p><button className="button secondary" onClick={()=>state.items.length?more():setRevision(value=>value+1)}><RefreshCw size={16}/>{t('retry')}</button></div>}
    {!state.loading&&!state.error&&!state.items.length&&active&&<p className="gallery-status">{t('empty')}</p>}
    {state.loading&&<p role="status" className="gallery-status">{t('loading')}</p>}
    {state.hasMore&&!state.error&&<div className="gallery-more"><button className="button secondary" onClick={more} disabled={state.loading}>{state.loading?t('loading'):t('more')}</button></div>}
    {selected!==null&&state.items[selected]&&<Lightbox photo={state.items[selected]} index={selected} onClose={()=>setSelected(null)} onPrevious={()=>setSelected(value=>Math.max(0,value-1))} onNext={async()=>{if(selected+1<state.items.length)setSelected(selected+1);else if(state.hasMore&&await more())setSelected(selected+1);}} canPrevious={selected>0} canNext={selected+1<state.items.length||state.hasMore} busy={state.loading}/>}
  </div></section>;
}
