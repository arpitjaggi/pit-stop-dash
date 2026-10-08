// Receives messages sent to the Telegram bot. Its one job is linking: the app gives the user a link
// like https://t.me/<bot>?start=<code>; opening it sends "/start <code>" here, and we store the chat.
//
// Secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET. Register the webhook once (see README):
//   curl "https://api.telegram.org/bot$TOKEN/setWebhook" -d url=<function url> -d secret_token=<secret>

import { createClient } from 'npm:@supabase/supabase-js@2';

const env = (k: string) => Deno.env.get(k) ?? '';

async function reply(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${env('TELEGRAM_BOT_TOKEN')}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

function sameSecret(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  if (!sameSecret(req.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? '', env('TELEGRAM_WEBHOOK_SECRET'))) {
    return new Response('Forbidden', { status: 403 });
  }
  const update = await req.json().catch(() => null);
  const msg = update?.message;
  const chatId: number | undefined = msg?.chat?.id;
  const text: string = (msg?.text ?? '').trim();
  if (!chatId || msg?.chat?.type !== 'private') return new Response('ok');

  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

  const start = /^\/start(?:@\w+)?\s+([a-f0-9]{32})$/i.exec(text);
  if (start) {
    const { data } = await admin
      .from('reminder_settings')
      .update({ telegram_chat_id: chatId, telegram_link_token: null, telegram_link_expires_at: null })
      .eq('telegram_link_token', start[1].toLowerCase())
      .gt('telegram_link_expires_at', new Date().toISOString())
      .select('user_id');
    await reply(
      chatId,
      data && data.length > 0
        ? 'Connected. Reminders for your insurance, PUC and CNG test dates will arrive here. Send /stop to disconnect.'
        : 'That link has expired. Open Pit Stop, go to Reminders, and connect again.',
    );
  } else if (/^\/stop\b/i.test(text)) {
    await admin.from('reminder_settings').update({ telegram_chat_id: null }).eq('telegram_chat_id', chatId);
    await reply(chatId, 'Disconnected. You will not get reminders here any more.');
  } else {
    await reply(chatId, 'Open Pit Stop, go to Reminders, and choose Connect Telegram to link this chat.');
  }
  return new Response('ok');
});
