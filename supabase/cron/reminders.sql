-- Run once in the Supabase SQL editor (not a migration: it needs your project's address and a secret).
-- Calls the send-reminders function every day at 9:00 in India (03:30 UTC).
--
-- Before running:
--   1. supabase secrets set CRON_SECRET=<a long random string>   (same value as below)
--   2. Replace YOUR_PROJECT_REF and YOUR_CRON_SECRET.
-- The schedule needs the pg_cron and pg_net extensions: Dashboard > Database > Extensions.

select vault.create_secret('YOUR_CRON_SECRET', 'reminder_cron_secret');

select cron.schedule(
  'send-reminders-daily',
  '30 3 * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'reminder_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- To stop it:  select cron.unschedule('send-reminders-daily');
