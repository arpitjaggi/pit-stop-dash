export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
/** Set VITE_DEMO=true to skip the sign-in gate and use the in-browser demo adapter. */
export const demoForced = import.meta.env.VITE_DEMO === 'true';
