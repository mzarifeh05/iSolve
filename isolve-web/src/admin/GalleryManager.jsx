import {useEffect,useRef,useState} from 'react';
import {useTranslation} from 'react-i18next';
import {loadGallery,saveGalleryPhoto,deleteGalleryPhoto,uploadGalleryPhoto,removeGalleryAssets} from '../lib/gallery.js';
import {localized} from '../lib/utils.js';
import '../gallery/gallery.css';

const blank={caption_en:'',caption_ar:'',alt_en:'',alt_ar:'',event_label_en:'',event_label_ar:'',event_date:'',category:'training',sort_order:0,published:false,fit:'contain',focal_x:50,focal_y:50};
function errorText(error){return ({GALLERY_DUPLICATE:'duplicate','23505':'duplicate',GALLERY_CLEANUP:'cleanup',IMAGE_TYPE:'invalidImage',GALLERY_SIZE:'size',GALLERY_FORMAT:'format',DEMO_READ_ONLY:'readOnly'})[error?.code]||'failed';}

export default function GalleryManager({readOnly}){
  const {t,i18n}=useTranslation('gallery');
  const [page,setPage]=useState({items:[],hasMore:false,nextOffset:0});
  const [loading,setLoading]=useState(true),[revision,setRevision]=useState(0),[notice,setNotice]=useState('');
  const [editor,setEditor]=useState(null),[busy,setBusy]=useState(false),[deleting,setDeleting]=useState(null);
  const dialog=useRef(null);
  useEffect(()=>{let active=true;loadGallery({admin:true}).then(data=>{if(active){setPage(data);setLoading(false);}}).catch(()=>{if(active){setNotice('loadError');setLoading(false);}});return()=>{active=false;};},[revision]);
  useEffect(()=>{if(deleting)dialog.current?.showModal();},[deleting]);
  function refresh(message){setEditor(null);setNotice(message);setLoading(true);setRevision(value=>value+1);}
  async function more(){setLoading(true);try{const data=await loadGallery({admin:true,offset:page.nextOffset});setPage(previous=>({...data,items:[...previous.items,...data.items]}));}catch{setNotice('loadError');}finally{setLoading(false);}}
  async function toggle(photo){setBusy(true);try{await saveGalleryPhoto({...photo,published:!photo.published});refresh('saved');}catch(error){setNotice(errorText(error));}finally{setBusy(false);}}
  async function remove(){setBusy(true);try{await deleteGalleryPhoto(deleting);setDeleting(null);refresh('deleted');}catch(error){setDeleting(null);refresh(errorText(error));}finally{setBusy(false);}}
  return <section className="admin-gallery">{notice&&<div className="admin-notice" role="status">{t(notice)}</div>}{editor ? <GalleryEditor key={editor.id||'new'} photo={editor} readOnly={readOnly} onCancel={()=>setEditor(null)} onSaved={refresh}/> : <>
    <div className="admin-section-heading"><h2>{t('manage')}</h2><button className="admin-button primary" onClick={()=>setEditor({...blank,sort_order:page.items.length})}>{t('add')}</button></div>
    {loading&&!page.items.length&&<p role="status">{t('loading')}</p>}
    <div className="admin-records">{page.items.map(photo=><article className="admin-record" key={photo.id}><img className="admin-gallery-thumb" src={photo.variants.thumbnails[0].url||photo.variants.thumbnails[0].path} width="96" height="64" alt="" loading="lazy"/><div className="admin-record-copy"><h3>{localized(photo,'caption',i18n.language)}</h3><p>{t(photo.category)} · {photo.sort_order.toLocaleString(i18n.language)}</p></div><span className="admin-badge">{t(photo.published?'published':'draft')}</span><div className="admin-row-actions"><button className="admin-button small" onClick={()=>setEditor(photo)} disabled={busy}>{t('edit')}</button><button className="admin-button small" onClick={()=>toggle(photo)} disabled={readOnly||busy}>{t(photo.published?'unpublish':'publish')}</button><button className="admin-button small danger" onClick={()=>setDeleting(photo)} disabled={readOnly||busy}>{t('remove')}</button></div></article>)}</div>
    {page.hasMore&&<button className="admin-button" onClick={more} disabled={loading}>{t(loading?'loading':'more')}</button>}{notice==='loadError'&&<button className="admin-button" onClick={()=>refresh('')}>{t('retry')}</button>}
  </>}
  {deleting&&<dialog ref={dialog} className="admin-dialog" aria-label={t('confirm')} onCancel={event=>{event.preventDefault();if(!busy)setDeleting(null);}}><h2>{t('confirm')}</h2><p>{localized(deleting,'caption',i18n.language)}</p><div className="admin-form-actions"><button className="admin-button" autoFocus onClick={()=>setDeleting(null)} disabled={busy}>{t('cancel')}</button><button className="admin-button danger" onClick={remove} disabled={busy||readOnly}>{t('remove')}</button></div></dialog>}</section>;
}

function GalleryEditor({photo,readOnly,onCancel,onSaved}){
  const {t,i18n}=useTranslation('gallery');
  const [values,setValues]=useState({...blank,...photo}),[file,setFile]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const change=(field,value)=>setValues(previous=>({...previous,[field]:value}));
  async function submit(event){
    event.preventDefault();setError('');
    if(readOnly){setError('readOnly');return;}
    if((!values.id&&!file)||!['caption','alt'].every(field=>values[`${field}_en`]?.trim()||values[`${field}_ar`]?.trim())){setError('required');return;}
    if(!['sort_order','focal_x','focal_y'].every(field=>Number.isInteger(Number(values[field]))&&Number(values[field])>=0&&Number(values[field])<=(field==='sort_order'?1000000:100))){setError('invalid');return;}
    const data={...values,sort_order:Number(values.sort_order),focal_x:Number(values.focal_x),focal_y:Number(values.focal_y)};
    let uploaded,persisted=false;setBusy(true);
    try{
      if(file){uploaded=await uploadGalleryPhoto(file);Object.assign(data,uploaded);}
      await saveGalleryPhoto(data);persisted=true;
      let message='saved';if(uploaded&&photo.variants){try{await removeGalleryAssets(photo.variants);}catch{message='cleanup';}}
      onSaved(message);
    }catch(failure){if(uploaded&&!persisted&&failure.code!=='23505'){try{await removeGalleryAssets(uploaded.variants);}catch{/* Retry cleanup in Storage. */}}setError(errorText(failure));}finally{setBusy(false);}
  }
  return <form className="admin-editor" onSubmit={submit}><div className="admin-section-heading"><h2>{t(photo.id?'edit':'add')}</h2><button type="button" className="admin-button" onClick={onCancel} disabled={busy}>{t('cancel')}</button></div>{error&&<p className="admin-notice error" role="alert">{t(error)}</p>}<p className="admin-hint">{t('languageHint')}</p>
    <fieldset disabled={busy}><label className="admin-field">{t(photo.id?'replace':'file')}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={readOnly} onChange={event=>setFile(event.target.files?.[0]||null)}/><small>{t('fileHint')}</small></label>
    <div className="admin-language-columns">{(i18n.dir()==='rtl'?['ar','en']:['en','ar']).map(language=><div className="admin-language-panel" key={language}><h3>{t(language==='ar'?'arabic':'english')}</h3>{['caption','alt','event_label'].map(field=><label className="admin-field" key={field}>{t(field==='event_label'?'event':field)}<textarea rows="3" lang={language} dir={language==='ar'?'rtl':'ltr'} value={values[`${field}_${language}`]} onChange={event=>change(`${field}_${language}`,event.target.value)}/></label>)}</div>)}</div>
    <div className="admin-fields"><label className="admin-field">{t('category')}<select value={values.category} onChange={event=>change('category',event.target.value)}>{['training','zcc','moments'].map(value=><option key={value} value={value}>{t(value)}</option>)}</select></label><label className="admin-field">{t('order')}<input type="number" min="0" max="1000000" step="1" value={values.sort_order} onChange={event=>change('sort_order',event.target.value)}/></label><label className="admin-field">{t('date')}<input type="date" dir="ltr" value={values.event_date||''} onChange={event=>change('event_date',event.target.value)}/><small>{t('unknown')}</small></label><label className="admin-field">{t('fit')}<select value={values.fit} onChange={event=>change('fit',event.target.value)}><option value="contain">{t('contain')}</option><option value="cover">{t('cover')}</option></select></label>{['focal_x','focal_y'].map(field=><label className="admin-field" key={field}>{t(field==='focal_x'?'focalX':'focalY')}<input type="number" min="0" max="100" step="1" value={values[field]} onChange={event=>change(field,event.target.value)}/></label>)}</div>
    <label className="admin-check"><input type="checkbox" checked={values.published} onChange={event=>change('published',event.target.checked)}/>{t('publish')}</label></fieldset>
    <div className="admin-form-actions">{busy&&<p role="status">{t('processing')}</p>}<button className="admin-button primary" disabled={readOnly||busy}>{t(readOnly?'readOnly':'save')}</button></div>
  </form>;
}
