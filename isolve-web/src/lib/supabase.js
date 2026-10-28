import { createClient } from '@supabase/supabase-js';

// Demo is opt-in, and is never enabled by a production build.
export const isDemo = import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true' && import.meta.env.MODE !== 'production';
const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
// Public pages may show verified bundled information only when BOTH are absent.
// Partial configuration and configured database failures never use that mode.
export const isInitialContent = !isDemo && !projectUrl && !publishableKey;
let validProjectUrl = false;
try { validProjectUrl = Boolean(projectUrl && new URL(projectUrl).protocol === 'https:'); } catch { /* configuration is reported below */ }

export const configurationError = !isDemo && (!validProjectUrl || !publishableKey)
  ? 'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, apply the Supabase migrations, and restart the application.'
  : null;

export const supabase = !isDemo && validProjectUrl && publishableKey
  ? createClient(projectUrl, publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;
