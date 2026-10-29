import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase, isDemo, configurationError } from '../lib/supabase';
import { checkAdmin, deleteRecord, loadContent, removeTrainerPhoto, saveRecord, saveSettings, uploadTrainerPhoto } from '../lib/content';
import { imageUrl, initials, localized, safeUrl, validGoogleFormUrl, validWhatsappUrl } from '../lib/utils';
import './admin.css';
import GalleryManager from './GalleryManager.jsx';

const tabs = ['trainers', 'faqs', 'gallery', 'settings'];
const singular = { trainers: 'trainer', faqs: 'faq' };
const translatable = {
  trainers: [['name', 'name'], ['bio', 'bio', true]],
  faqs: [['question', 'question'], ['answer', 'answer', true]],
};
const emptyRecord = {
  trainers: { name_en: '', name_ar: '', role_en: 'Team Member', role_ar: 'عضو في الفريق', bio_en: '', bio_ar: '', photo_url: null, photo_path: null, codeforces_url: '', github_url: '', linkedin_url: '', published: false, sort_order: 0 },
  faqs: { question_en: '', question_ar: '', answer_en: '', answer_ar: '', published: false, sort_order: 0 },
};

function errorKey(error, fallback) {
  return ({ IMAGE_TYPE: 'imageType', IMAGE_SIZE: 'imageSize', INVALID_URL: 'invalidUrl', INVALID_FORM: 'invalidForm', INVALID_WHATSAPP: 'invalidWhatsapp', CONFIGURATION: 'configuration', DEMO_READ_ONLY: 'demo', FORBIDDEN: 'denied' })[error?.code] || fallback;
}

export default function Admin() {
  const { t, i18n } = useTranslation('admin');
  const [access, setAccess] = useState(isDemo ? 'demo' : configurationError ? 'configuration' : 'checking');
  const [tab, setTab] = useState('trainers');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const deleteDialog = useRef(null);
  const readOnly = access === 'demo';
  const language = i18n.resolvedLanguage || i18n.language;

  useEffect(() => {
    if (!supabase || isDemo) return undefined;
    let active = true;
    let request = 0;
    const resolveAccess = async (session) => {
      const current = ++request;
      if (!session) { if (active) setAccess('signedOut'); return; }
      if (active) setAccess('checking');
      try {
        const allowed = await checkAdmin();
        if (active && current === request) setAccess(allowed ? 'admin' : 'denied');
      } catch { if (active && current === request) setAccess('accessError'); }
    };
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) { if (active) setAccess('accessError'); } else resolveAccess(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Leave the auth callback before making a database request.
      setTimeout(() => { if (active) resolveAccess(session); }, 0);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try { setContent(await loadContent({ admin: !isDemo })); }
    catch { setLoadError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (access === 'admin' || access === 'demo') refresh();
    else setContent(null);
  }, [access, refresh]);

  useEffect(() => {
    const dialog = deleteDialog.current;
    if (deleting && dialog && !dialog.open) dialog.showModal();
  }, [deleting]);

  const nameOf = (record) => localized(record, tab === 'trainers' ? 'name' : 'question', language) || t('unknown');

  async function signOut() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setNotice({ kind: 'error', key: 'signOutFailed' });
      else { setEditor(null); setNotice(null); setAccess('signedOut'); }
    } catch { setNotice({ kind: 'error', key: 'signOutFailed' }); }
    finally { setBusy(false); }
  }

  async function togglePublish(record) {
    setBusy(true); setNotice(null);
    try {
      await saveRecord(tab, { ...record, published: !record.published });
      await refresh(); setNotice({ kind: 'success', key: 'saved' });
    } catch (error) { setNotice({ kind: 'error', key: errorKey(error, 'saveFailed') }); }
    finally { setBusy(false); }
  }

  async function reorder(index, direction) {
    const rows = content[tab];
    const next = index + direction;
    if (next < 0 || next >= rows.length) return;
    setBusy(true); setNotice(null);
    try {
      // Normalize orders so pre-existing equal values also remain reorderable.
      const ordered = [...rows];
      [ordered[index], ordered[next]] = [ordered[next], ordered[index]];
      for (let i = 0; i < ordered.length; i += 1) {
        if (ordered[i].sort_order !== i) await saveRecord(tab, { ...ordered[i], sort_order: i });
      }
      await refresh(); setNotice({ kind: 'success', key: 'saved' });
    } catch (error) { await refresh(); setNotice({ kind: 'error', key: errorKey(error, 'saveFailed') }); }
    finally { setBusy(false); }
  }

  async function confirmDelete() {
    const record = deleting;
    setBusy(true); setNotice(null);
    try {
      await deleteRecord(tab, record.id);
      setDeleting(null);
      setNotice({ kind: 'success', key: 'deleted' });
      if (tab === 'trainers' && record.photo_path) {
        try { await removeTrainerPhoto(record.photo_path); }
        catch { setNotice({ kind: 'error', key: 'photoCleanup' }); }
      }
      await refresh();
    } catch (error) { setDeleting(null); setNotice({ kind: 'error', key: errorKey(error, 'deleteFailed') }); }
    finally { setBusy(false); }
  }

  function selectTab(value) { setTab(value); setEditor(null); setNotice(null); }

  return <div className="admin-page container">
    <div className="admin-heading"><div><p className="eyebrow">{t('eyebrow')}</p><h1>{t('title')}</h1><p>{t('intro')}</p></div><div className="admin-heading-actions"><Link to="/" className="admin-button">{t('openSite')} <span aria-hidden="true">↗</span></Link>{(access === 'admin' || access === 'denied' || access === 'accessError') && <button className="admin-button" disabled={busy} onClick={signOut}>{t('signOut')}</button>}</div></div>
    {notice && <div className={`admin-notice ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>{t(notice.key)}</div>}
    {access === 'checking' && <p role="status">{t('checking')}</p>}
    {access === 'configuration' && <div className="admin-state"><span aria-hidden="true">⌘</span><h2>{t('configurationTitle')}</h2><p>{t('configuration')}</p></div>}
    {access === 'denied' && <div className="admin-state"><span aria-hidden="true">⌁</span><h2>{t('deniedTitle')}</h2><p>{t('denied')}</p></div>}
    {access === 'accessError' && <div className="admin-state" role="alert"><h2>{t('loadFailed')}</h2><button className="admin-button" onClick={async () => { setAccess('checking'); try { setAccess(await checkAdmin() ? 'admin' : 'denied'); } catch { setAccess('accessError'); } }}>{t('retry')}</button></div>}
    {access === 'signedOut' && <SignIn onError={(key) => setNotice({ kind: 'error', key })} onBegin={() => setNotice(null)} />}
    {(access === 'admin' || readOnly) && <>
      {readOnly && <aside className="admin-demo"><strong>{t('demoTitle')}</strong><p>{t('demo')}</p></aside>}
      <nav className="admin-tabs" aria-label={t('allContent')}>{tabs.map((value) => <button key={value} aria-current={tab === value ? 'page' : undefined} onClick={() => selectTab(value)}>{t(value)}{content && !['settings','gallery'].includes(value) && <span>{content[value].length.toLocaleString(language)}</span>}</button>)}</nav>
      {loading && <p className="admin-loading" role="status">{t('loading')}</p>}
      {loadError && <div className="admin-state" role="alert"><p>{t('loadFailed')}</p><button className="admin-button" onClick={refresh}>{t('retry')}</button></div>}
      {!loading && !loadError && content && <>
        {tab === 'gallery' ? <GalleryManager readOnly={readOnly}/> : tab === 'settings' ? <SettingsForm key={content.settings?.updated_at || 'settings'} record={content.settings || { id: 1 }} readOnly={readOnly} onSaved={async () => { await refresh(); setNotice({ kind: 'success', key: 'saved' }); }} /> : editor ? <RecordForm key={`${tab}-${editor.id || 'new'}`} table={tab} record={editor} readOnly={readOnly} onCancel={() => setEditor(null)} onSaved={async (warning) => { setEditor(null); await refresh(); setNotice({ kind: warning ? 'error' : 'success', key: warning || 'saved' }); }} /> : <section aria-label={t('listLabel', { entity: t(tab) })}>
          <div className="admin-section-heading"><h2>{t(tab)}</h2><button className="admin-button primary" onClick={() => setEditor({ ...emptyRecord[tab], sort_order: content[tab].length })}>{t('new', { entity: t(singular[tab]) })} <span aria-hidden="true">＋</span></button></div>
          {!content[tab].length ? <div className="admin-empty"><span aria-hidden="true">＋</span><p>{t('empty')}</p></div> : <div className="admin-records">{content[tab].map((record, index) => <article className="admin-record" key={record.id}>
            {tab === 'trainers' && <AdminPhoto src={record.photo_url} name={nameOf(record)} />}
            <div className="admin-record-copy"><h3>{nameOf(record)}</h3><p>{tab === 'trainers' ? t('teamRole') : localized(record, 'answer', language)}</p></div>
            <span className={`admin-badge ${record.published ? 'published' : ''}`}>{t(record.published ? 'published' : 'draft')}</span>
            <div className="admin-row-actions"><div className="admin-reorder"><button aria-label={t('moveUp', { name: nameOf(record) })} disabled={readOnly || busy || index === 0} onClick={() => reorder(index, -1)}>↑</button><button aria-label={t('moveDown', { name: nameOf(record) })} disabled={readOnly || busy || index === content[tab].length - 1} onClick={() => reorder(index, 1)}>↓</button></div><button className="admin-button small" disabled={busy} onClick={() => setEditor(record)}>{t('edit')}</button><button className="admin-button small" disabled={readOnly || busy} onClick={() => togglePublish(record)}>{t(record.published ? 'unpublish' : 'publish')}</button><button className="admin-button small danger" disabled={readOnly || busy} onClick={() => setDeleting(record)}>{t('remove')}</button></div>
          </article>)}</div>}
        </section>}
      </>}
    </>}
    {deleting && <dialog ref={deleteDialog} className="admin-dialog" aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={(event) => { event.preventDefault(); if (!busy) setDeleting(null); }}><h2 id="delete-title">{t('deleteTitle')}</h2><p id="delete-description">{t('deleteDescription', { name: nameOf(deleting) })}</p><div className="admin-form-actions"><button className="admin-button" disabled={busy} onClick={() => setDeleting(null)} autoFocus>{t('cancel')}</button><button className="admin-button danger solid" disabled={busy} onClick={confirmDelete}>{t(busy ? 'deleting' : 'confirmDelete')}</button></div></dialog>}
  </div>;
}

function SignIn({ onError, onBegin }) {
  const { t } = useTranslation('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    onBegin();
    if (!email.trim() || !password) { onError('required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { onError('invalidEmail'); return; }
    setBusy(true);
    try { const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); if (error) onError('signInFailed'); }
    catch { onError('signInFailed'); }
    finally { setBusy(false); }
  }
  return <form className="admin-signin" onSubmit={submit} noValidate><span className="admin-signin-mark" aria-hidden="true">{'</>'}</span><h2>{t('signInTitle')}</h2><p>{t('signInIntro')}</p><label>{t('email')}<input dir="ltr" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={busy} /></label><label>{t('password')}<input dir="ltr" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={busy} /></label><button className="admin-button primary" disabled={busy}>{t(busy ? 'signingIn' : 'signIn')}</button></form>;
}

function TextField({ label, value, onChange, multiline = false, hint, ...props }) {
  const Input = multiline ? 'textarea' : 'input';
  return <label className={multiline ? 'admin-field wide' : 'admin-field'}>{label}<Input value={value ?? ''} onChange={(event) => onChange(event.target.value)} {...props} />{hint && <small>{hint}</small>}</label>;
}

function AdminPhoto({ src, name, alt = '', preview = false }) {
  const [failedSource, setFailedSource] = useState(null);
  const size = preview ? 100 : 48;
  const className = preview ? 'admin-photo-preview' : 'admin-avatar';
  const safeSource = src?.startsWith('blob:') ? src : imageUrl(src);
  if (safeSource && failedSource !== safeSource) return <img className={className} src={safeSource} alt={alt} width={size} height={size} loading="lazy" onError={() => setFailedSource(safeSource)} />;
  return <span className={`${className} admin-photo-fallback`} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>{initials(name) || '</>'}</span>;
}

function RecordForm({ table, record, readOnly, onCancel, onSaved }) {
  const { t, i18n } = useTranslation('admin');
  const [values, setValues] = useState(() => ({ ...emptyRecord[table], ...record }));
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef(null);
  const change = (field, value) => setValues((previous) => ({ ...previous, [field]: value }));
  useEffect(() => {
    if (!file) { setPreview(''); return undefined; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  function selectPhoto(event) {
    const selected = event.target.files?.[0];
    if (!selected) { setFile(null); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) { setError('imageType'); event.target.value = ''; return; }
    if (selected.size > 3 * 1024 * 1024) { setError('imageSize'); event.target.value = ''; return; }
    setError(''); setFile(selected); setRemovePhoto(false);
  }

  async function submit(event) {
    event.preventDefault(); setError('');
    if (readOnly) { setError('demo'); return; }
    const payload = { ...values };
    const requiredFields = translatable[table].filter(([field]) => table !== 'trainers' || field === 'name').map(([field]) => field);
    if (requiredFields.some((field) => !String(payload[`${field}_en`] || '').trim() && !String(payload[`${field}_ar`] || '').trim())) { setError('required'); return; }
    for (const [field, value] of Object.entries(payload)) {
      if (field.endsWith('_url') && value && !(field === 'photo_url' ? imageUrl(value) : safeUrl(value))) { setError('invalidUrl'); return; }
    }
    if ('sort_order' in payload && (!Number.isInteger(Number(payload.sort_order)) || Number(payload.sort_order) < 0 || Number(payload.sort_order) > 10000)) { setError('invalidOrder'); return; }
    if ('sort_order' in payload) payload.sort_order = Number(payload.sort_order);
    if (table === 'trainers') {
      if (!payload.photo_path) payload.photo_path = null;
      payload.role_en = 'Team Member'; payload.role_ar = 'عضو في الفريق';
    }
    let uploaded;
    let persisted = false;
    setBusy(true);
    try {
      if (table === 'trainers' && file) { uploaded = await uploadTrainerPhoto(file); Object.assign(payload, uploaded); }
      else if (table === 'trainers' && removePhoto) { payload.photo_url = null; payload.photo_path = null; }
      await saveRecord(table, payload);
      persisted = true;
      let warning;
      if (table === 'trainers' && record.photo_path && (uploaded || removePhoto)) {
        try { await removeTrainerPhoto(record.photo_path); } catch { warning = 'photoCleanup'; }
      }
      await onSaved(warning);
    } catch (failure) {
      if (uploaded && !persisted) { try { await removeTrainerPhoto(uploaded.photo_path); } catch { /* The orphan can be removed by an administrator in Storage. */ } }
      setError(errorKey(failure, 'saveFailed'));
    } finally { setBusy(false); }
  }

  return <form className="admin-editor" onSubmit={submit} noValidate aria-label={t('formLabel', { entity: t(singular[table]) })}>
    <div className="admin-section-heading"><h2>{t(record.id ? 'editing' : 'creating', { entity: t(singular[table]) })}</h2><button type="button" className="admin-button" onClick={onCancel} disabled={busy}>{t('cancel')}</button></div>
    {error && <div ref={errorRef} tabIndex="-1" className="admin-notice error" role="alert">{t(error)}</div>}
    <p className="admin-hint">{t('translationHint')}</p>
    <fieldset disabled={busy}>
      <div className="admin-language-columns">{((i18n.resolvedLanguage || i18n.language).startsWith('ar') ? ['ar', 'en'] : ['en', 'ar']).map((language) => <div key={language} className="admin-language-panel"><h3>{t(language === 'en' ? 'english' : 'arabic')}</h3>{translatable[table].map(([field, label, multiline]) => <TextField key={field} label={`${t(label)}${table !== 'trainers' || field === 'name' ? ' *' : ` (${t('optional')})`}`} value={values[`${field}_${language}`]} onChange={(value) => change(`${field}_${language}`, value)} multiline={multiline} rows={4} dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} />)}</div>)}</div>
      <div className="admin-fields">
        <TextField type="number" min="0" max="10000" step="1" label={t('sortOrder')} hint={t('sortHint')} value={values.sort_order} onChange={(value) => change('sort_order', value)} />
        {table === 'trainers' && <><div className="admin-field wide admin-photo-field"><label>{t('photo')}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} disabled={readOnly} /></label><small>{t('photoHint')}</small>{(preview || (values.photo_url && !removePhoto)) && <AdminPhoto src={preview || values.photo_url} name={localized(values, 'name', i18n.resolvedLanguage || i18n.language)} alt={t(preview ? 'selectedPhoto' : 'trainerPhoto')} preview />}{(values.photo_url || values.photo_path) && <label className="admin-check"><input type="checkbox" checked={removePhoto} onChange={(e) => { setRemovePhoto(e.target.checked); if (e.target.checked) setFile(null); }} />{t('removePhoto')}</label>}</div>{[['codeforces_url', 'codeforces'], ['github_url', 'github'], ['linkedin_url', 'linkedin']].map(([field, label]) => <TextField key={field} type="url" dir="ltr" label={`${t(label)} (${t('optional')})`} value={values[field]} onChange={(value) => change(field, value)} />)}</>}
      </div>
      <label className="admin-check admin-publish-check"><input type="checkbox" checked={values.published} onChange={(e) => change('published', e.target.checked)} />{t('isPublished')}</label>
    </fieldset>
    <div className="admin-form-actions"><button type="button" className="admin-button" disabled={busy} onClick={onCancel}>{t('cancel')}</button><button className="admin-button primary" disabled={readOnly || busy}>{t(readOnly ? 'previewOnly' : busy ? 'saving' : 'save')}</button></div>
  </form>;
}

function SettingsForm({ record, readOnly, onSaved }) {
  const { t } = useTranslation('admin');
  const [values, setValues] = useState({ registration_open: false, registration_url: '', registration_embed_url: '', contact_email: '', instagram_url: '', facebook_url: '', linkedin_url: '', github_url: '', whatsapp_url: '', ...record });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = (field, value) => setValues((previous) => ({ ...previous, [field]: value }));
  async function submit(event) {
    event.preventDefault(); setError('');
    if (readOnly) { setError('demo'); return; }
    if ((values.registration_url && !validGoogleFormUrl(values.registration_url)) || (values.registration_embed_url && !validGoogleFormUrl(values.registration_embed_url, true))) { setError('invalidForm'); return; }
    if (values.whatsapp_url && !validWhatsappUrl(values.whatsapp_url)) { setError('invalidWhatsapp'); return; }
    for (const field of ['instagram_url', 'facebook_url', 'linkedin_url', 'github_url']) if (values[field] && !safeUrl(values[field])) { setError('invalidUrl'); return; }
    if (values.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact_email.trim())) { setError('invalidEmail'); return; }
    setBusy(true);
    try { await saveSettings({ ...values, contact_email: values.contact_email?.trim() || null }); await onSaved(); }
    catch (failure) { setError(errorKey(failure, 'saveFailed')); }
    finally { setBusy(false); }
  }
  return <form className="admin-editor" onSubmit={submit} noValidate>
    <div className="admin-section-heading"><h2>{t('settings')}</h2></div>
    {error && <div className="admin-notice error" role="alert">{t(error)}</div>}
    <fieldset disabled={busy}><h3>{t('registrationHeading')}</h3><p className="admin-hint">{t('registrationHint')}</p><label className="admin-check"><input type="checkbox" checked={values.registration_open} onChange={(e) => change('registration_open', e.target.checked)} />{t('registrationOpen')}</label><div className="admin-fields"><TextField type="url" dir="ltr" label={t('registrationUrl')} value={values.registration_url} onChange={(value) => change('registration_url', value)} /><TextField type="url" dir="ltr" label={t('embedUrl')} hint={t('embedHint')} value={values.registration_embed_url} onChange={(value) => change('registration_embed_url', value)} /></div><hr /><h3>{t('contactHeading')}</h3><p className="admin-hint">{t('contactHint')}</p><div className="admin-fields"><TextField type="email" dir="ltr" label={t('contactEmail')} value={values.contact_email} onChange={(value) => change('contact_email', value)} />{[['instagram_url', 'instagram'], ['facebook_url', 'facebook'], ['linkedin_url', 'linkedin'], ['github_url', 'github']].map(([field, label]) => <TextField key={field} type="url" dir="ltr" label={t(label)} value={values[field]} onChange={(value) => change(field, value)} />)}<TextField type="url" dir="ltr" label={t('whatsapp')} hint={t('whatsappHint')} value={values.whatsapp_url} onChange={(value) => change('whatsapp_url', value)} /></div></fieldset>
    <div className="admin-form-actions"><button className="admin-button primary" disabled={readOnly || busy}>{t(readOnly ? 'previewOnly' : busy ? 'saving' : 'save')}</button></div>
  </form>;
}
