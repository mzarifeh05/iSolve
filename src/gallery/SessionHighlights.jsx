import {useEffect,useRef,useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Play,Quote,RefreshCw} from 'lucide-react';
import {sessionVideos} from '../data/sessionVideos.js';
import {localized} from '../lib/utils.js';

function SessionVideo({clip}){
  const {t,i18n}=useTranslation('gallery');
  const [requested,setRequested]=useState(false);
  const [failed,setFailed]=useState(false);
  const video=useRef(null);
  const title=localized(clip,'title',i18n.language);
  const descriptionId=`${clip.id}-description`;
  useEffect(()=>{
    const player=video.current;
    if(!player)return;
    const observer=new IntersectionObserver(entries=>{
      if(entries.every(entry=>!entry.isIntersecting))player.pause();
    });
    observer.observe(player);
    return ()=>observer.disconnect();
  },[requested,failed]);
  function pauseOthers(event){
    document.querySelectorAll('#moments video').forEach(player=>{if(player!==event.currentTarget)player.pause();});
  }
  return <article className="session-video-card">
    <div className="session-video-frame">
      {failed?<div className="session-video-error" role="alert"><p>{t('videoError')}</p><button className="button light small" onClick={()=>{setRequested(false);setFailed(false);}}><RefreshCw size={16} aria-hidden="true"/>{t('retry')}</button><a href={clip.src} target="_blank" rel="noopener noreferrer">{t('openVideo')}</a></div>
        :requested?<video ref={video} controls autoPlay playsInline preload="none" poster={clip.poster} width={clip.width} height={clip.height} aria-label={title} aria-describedby={descriptionId} onPlay={pauseOthers} onError={()=>setFailed(true)}><source src={clip.src} type="video/mp4"/><a href={clip.src}>{t('openVideo')}</a></video>
          :<button className="session-video-preview" onClick={()=>setRequested(true)} aria-label={t('play',{title})} aria-describedby={descriptionId}>
            <picture><source type="image/webp" srcSet={clip.poster}/><img src={clip.posterFallback} width="480" height={Math.round(480*clip.height/clip.width)} alt="" loading="lazy" decoding="async"/></picture>
            <span className="session-play-icon" aria-hidden="true"><Play size={28} fill="currentColor"/></span>
            <span className="session-video-label" aria-hidden="true">{t('watchClip')}<span dir="ltr">0:{Math.round(clip.duration).toString().padStart(2,'0')}</span></span>
          </button>}
    </div>
    <div className="session-video-caption"><h3>{title}</h3><p id={descriptionId}>{localized(clip,'description',i18n.language)}</p></div>
  </article>;
}

export default function SessionHighlights(){
  const {t}=useTranslation('gallery');
  return <div className="session-highlights" aria-labelledby="session-highlights-title">
    <div className="session-highlights-heading"><h3 id="session-highlights-title">{t('sessionTitle')}</h3><p>{t('sessionNote')}</p></div>
    <div className="session-showcase">
      <aside className="community-motto" aria-label={t('mottoLabel')}>
        <div className="motto-brand"><img src="/assets/iteam-logo.png" alt="iTeam" width="440" height="211" loading="lazy"/><span>{t('mottoLabel')}</span></div>
        <Quote className="motto-mark" size={40} aria-hidden="true"/>
        <blockquote lang="en" dir="ltr"><span>Once you're iTeam,</span>{' '}<span>You're always iTeam</span></blockquote>
        <p>{t('mottoNote')}</p>
        <span className="motto-code" aria-hidden="true">{'< learn. solve. belong. />'}</span>
      </aside>
      {sessionVideos.map(clip=><SessionVideo key={clip.id} clip={clip}/>)}
    </div>
  </div>;
}
