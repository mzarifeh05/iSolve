import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { loadContent } from '../lib/content.js';

const ContentContext = createContext(null);
const initialData = { trainers: [], faqs: [], settings: {} };

export function ContentProvider({ children }) {
  const [state, setState] = useState({ data: initialData, loading: true, error: null });
  const [revision, setRevision] = useState(0);
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  const lastLoaded = useRef(0);
  const retry = useCallback(() => {
    setState(previous => ({ ...previous, loading: true, error: null }));
    setRevision(value => value + 1);
  }, []);
  useEffect(() => {
    if (previousPath.current.startsWith('/admin') && !pathname.startsWith('/admin')) retry();
    previousPath.current = pathname;
  }, [pathname, retry]);
  useEffect(() => {
    // Renew one-hour photo URLs before expiry, including after a sleeping tab resumes.
    const renew = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastLoaded.current > 45 * 60 * 1000) retry();
    };
    const timer = window.setInterval(renew, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', renew);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', renew); };
  }, [retry]);
  useEffect(() => {
    let active = true;
    loadContent().then(data => {
      if (active) { lastLoaded.current = Date.now(); setState({ data, loading: false, error: null }); }
    }).catch(error => {
      if (active) setState({ data: initialData, loading: false, error });
    });
    return () => { active = false; };
  }, [revision]);
  return <ContentContext.Provider value={{ ...state, retry }}>{children}</ContentContext.Provider>;
}

export function useContent() { return useContext(ContentContext); }
