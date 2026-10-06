// Sends the reminders that are due. Two ways in:
//   1. The daily schedule, with the header x-cron-secret (see supabase/cron/reminders.sql).
//   2. A signed-in user pressing "Send a test", with their own session token and {"test": true}.
//
// Secrets (supabase secrets set ...): CRON_SECRET, TELEGRAM_BOT_TOKEN, RESEND_API_KEY,
// REMINDER_FROM_EMAIL, APP_URL. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided.

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { istDate, reminderMessage, testMessage, type Message, type ReminderDoc } from '../_shared/messages.ts';

const env = (k: string) => Deno.env.get(k) ?? '';
const APP_URL = env('APP_URL') || 'http://localhost:5173';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function sameSecret(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

type Sent = { ok: true } | { ok: false; error: string; blocked?: boolean };

async function sendEmail(to: string, m: Message): Promise<Sent> {
  const key = env('RESEND_API_KEY');
  const from = env('REMINDER_FROM_EMAIL');
  if (!key || !from) return { ok: false, error: 'Email is not set up on the server.' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject: m.subject, text: m.text, html: m.html }),
  });
  if (res.ok) return { ok: true };
  return { ok: false, error: `Email provider said ${res.status}.` };
}

async function sendTelegram(chatId: number, m: Message): Promise<Sent> {
  const token = env('TELEGRAM_BOT_TOKEN');
  if (!token) return { ok: false, error: 'Telegram is not set up on the server.' };
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: m.text, disable_web_page_preview: true }),
  });
  if (res.ok) return { ok: true };
  // 403 means the user blocked or removed the bot: stop trying until they connect again.
  return { ok: false, error: `Telegram said ${res.status}.`, blocked: res.status === 403 };
}

async function runDaily(admin: SupabaseClient) {
  const onDate = istDate();
  const { data, error } = await admin.rpc('due_reminders', { on_date: onDate });
  if (error) return { ok: false, error: error.message };
  const rows = (data ?? []) as Array<{
    user_id: string; document_id: string; doc_type: ReminderDoc; expires_on: string; lead_days: number; days_left: number;
    channel: 'email' | 'telegram'; email: string | null; telegram_chat_id: number | null; vehicle_name: string; registration_number: string | null;
  }>;
  let sent = 0;
  let failed = 0;
  for (const r of rows) {
    const m = reminderMessage({
      vehicleName: r.vehicle_name, registration: r.registration_number, docType: r.doc_type,
      daysLeft: r.days_left, expiresOn: r.expires_on, appUrl: APP_URL,
    });
    const result = r.channel === 'email'
      ? r.email ? await sendEmail(r.email, m) : ({ ok: false, error: 'No email' } as Sent)
      : r.telegram_chat_id ? await sendTelegram(r.telegram_chat_id, m) : ({ ok: false, error: 'No chat' } as Sent);
    if (result.ok) {
      sent++;
      await admin.from('reminder_log').upsert(
        { user_id: r.user_id, document_id: r.document_id, expires_on: r.expires_on, lead_days: r.lead_days, channel: r.channel },
        { onConflict: 'document_id,expires_on,lead_days,channel', ignoreDuplicates: true },
      );
    } else {
      failed++;
      console.error('reminder failed', r.channel, result.error);
      if (!result.ok && result.blocked) {
        await admin.from('reminder_settings').update({ telegram_chat_id: null }).eq('user_id', r.user_id);
      }
    }
  }
  return { ok: true, date: onDate, due: rows.length, sent, failed };
}

async function runTest(admin: SupabaseClient, user: { id: string; email?: string | null }) {
  const { data } = await admin
    .from('reminder_settings')
    .select('email_enabled, telegram_enabled, telegram_chat_id')
    .eq('user_id', user.id)
    .maybeSingle();
  const m = testMessage(APP_URL);
  const out: Record<string, string> = {};
  if (!data?.email_enabled || !user.email) out.email = 'off';
  else {
    const r = await sendEmail(user.email, m);
    out.email = r.ok ? 'sent' : r.error;
  }
  if (!data?.telegram_enabled) out.telegram = 'off';
  else if (!data.telegram_chat_id) out.telegram = 'not connected';
  else {
    const r = await sendTelegram(data.telegram_chat_id, m);
    out.telegram = r.ok ? 'sent' : r.error;
  }
  return { ok: true, ...out };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

  if (sameSecret(req.headers.get('x-cron-secret') ?? '', env('CRON_SECRET'))) {
    return json(await runDaily(admin));
  }

  const bearer = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (bearer) {
    const { data } = await admin.auth.getUser(bearer);
    const body = await req.json().catch(() => ({}));
    if (data.user && body?.test === true) return json(await runTest(admin, data.user));
  }
  return json({ error: 'Not allowed' }, 401);
});
