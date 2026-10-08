export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
/** The Telegram bot that sends reminders (its username, without the @). Optional: email works without it. */
export const TELEGRAM_BOT = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined;
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
/** Set VITE_DEMO=true to skip the sign-in gate and use the in-browser demo adapter. */
export const demoForced = import.meta.env.VITE_DEMO === 'true';
