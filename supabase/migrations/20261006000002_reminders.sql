-- Safe to run more than once.
-- Reminders: one settings row per user, a log of what was sent, and the query the daily job uses.
-- Sending happens in the Edge Functions (supabase/functions); this file only holds the data.
-- Nothing here is writable by the browser except the user's own preferences.

create table if not exists public.reminder_settings (
  user_id                 uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  email_enabled           boolean not null default true,
  telegram_enabled        boolean not null default true,
  -- Days before the expiry date to remind on. 0 is the day itself.
  lead_days               integer[] not null default '{30,7,1,0}',
  -- Set by the Telegram bot when the user opens the link we gave them; never by the browser.
  telegram_chat_id        bigint,
  telegram_link_token     text,
  telegram_link_expires_at timestamptz,
  -- Throttles the "Send a test message" button; only the Edge Function writes it.
  last_test_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (cardinality(lead_days) between 1 and 7),
  check (lead_days <@ array[0, 1, 3, 7, 14, 30, 60])
);
alter table public.reminder_settings
  add column if not exists last_test_at timestamptz;
alter table public.reminder_settings
  add column if not exists telegram_connected boolean generated always as (telegram_chat_id is not null) stored;

drop trigger if exists reminder_settings_updated on public.reminder_settings;
create trigger reminder_settings_updated before update on public.reminder_settings
  for each row execute function public.set_updated_at();

-- What was sent. One row per document, expiry date, lead time and channel, so a reminder never
-- repeats, and a renewed document (a new expiry date) starts fresh.
create table if not exists public.reminder_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  document_id  uuid not null references public.documents (id) on delete cascade,
  expires_on   date not null,
  lead_days    integer not null,
  channel      text not null check (channel in ('email', 'telegram')),
  sent_at      timestamptz not null default now(),
  unique (document_id, expires_on, lead_days, channel)
);

alter table public.reminder_settings enable row level security;
alter table public.reminder_log enable row level security;

drop policy if exists "owner reads own settings" on public.reminder_settings;
create policy "owner reads own settings" on public.reminder_settings
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "owner adds own settings" on public.reminder_settings;
create policy "owner adds own settings" on public.reminder_settings
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "owner changes own settings" on public.reminder_settings;
create policy "owner changes own settings" on public.reminder_settings
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "owner reads own log" on public.reminder_log;
create policy "owner reads own log" on public.reminder_log
  for select to authenticated using (user_id = (select auth.uid()));

-- The browser may read the preferences and the connected flag, and change preferences only.
-- The chat id and the link token are invisible to it.
revoke all on public.reminder_settings, public.reminder_log from anon, authenticated;
grant select (user_id, email_enabled, telegram_enabled, lead_days, telegram_connected, updated_at)
  on public.reminder_settings to authenticated;
grant insert (email_enabled, telegram_enabled, lead_days) on public.reminder_settings to authenticated;
grant update (email_enabled, telegram_enabled, lead_days) on public.reminder_settings to authenticated;
grant select on public.reminder_log to authenticated;

-- Start linking Telegram: returns a one-time code to put in the bot's start link. Valid 15 minutes.
create or replace function public.start_telegram_link() returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := auth.uid();
  token text := replace(gen_random_uuid()::text, '-', '');
begin
  if uid is null then raise exception 'Not signed in'; end if;
  -- Linking Telegram must not quietly switch email on, so a new row starts with email off.
  insert into public.reminder_settings (user_id, email_enabled, telegram_link_token, telegram_link_expires_at)
  values (uid, false, token, now() + interval '15 minutes')
  on conflict (user_id) do update
    set telegram_link_token = excluded.telegram_link_token,
        telegram_link_expires_at = excluded.telegram_link_expires_at;
  return token;
end;
$$;

create or replace function public.disconnect_telegram() returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.reminder_settings
     set telegram_chat_id = null, telegram_link_token = null, telegram_link_expires_at = null
   where user_id = auth.uid();
end;
$$;

revoke execute on function public.start_telegram_link(), public.disconnect_telegram() from public, anon;
grant execute on function public.start_telegram_link(), public.disconnect_telegram() to authenticated;

-- What the daily job should send today. Only the latest insurance, PUC and CNG certificate of each
-- vehicle count (when two share an expiry date, one of them). For each, the reminder is the tightest lead time the document has reached (so a
-- missed day is caught up, and nothing is sent twice). Expired documents are the app's job to show.
create or replace function public.due_reminders(
  on_date date default ((now() at time zone 'Asia/Kolkata')::date)
) returns table (
  user_id uuid, document_id uuid, doc_type public.document_type, expires_on date, lead_days integer,
  days_left integer, channel text, email text, telegram_chat_id bigint, vehicle_name text, registration_number text
)
language sql stable security definer set search_path = public, pg_temp as $$
  select d.user_id, d.id, d.doc_type, d.expires_on, b.lead, (d.expires_on - on_date), c.channel,
         u.email::text, s.telegram_chat_id, v.make || ' ' || v.model, v.registration_number
    from public.documents d
    join public.vehicles v on v.id = d.vehicle_id and v.user_id = d.user_id
    join public.reminder_settings s on s.user_id = d.user_id
    join auth.users u on u.id = d.user_id
   cross join lateral (select min(l) as lead from unnest(s.lead_days) as l where l >= (d.expires_on - on_date)) b
   cross join lateral (values ('email'), ('telegram')) as c(channel)
   where d.doc_type in ('insurance', 'puc', 'cng_certificate')
     and d.expires_on is not null
     and d.expires_on >= on_date
     and b.lead is not null
     and not exists (
       select 1 from public.documents n
        where n.vehicle_id = d.vehicle_id and n.user_id = d.user_id
          and n.doc_type = d.doc_type
          and (n.expires_on > d.expires_on or (n.expires_on = d.expires_on and n.id > d.id)))
     and ((c.channel = 'email' and s.email_enabled and u.email is not null)
       or (c.channel = 'telegram' and s.telegram_enabled and s.telegram_chat_id is not null))
     and not exists (
       select 1 from public.reminder_log l
        where l.document_id = d.id and l.expires_on = d.expires_on
          and l.lead_days = b.lead and l.channel = c.channel);
$$;

revoke execute on function public.due_reminders(date) from public, anon, authenticated;
grant execute on function public.due_reminders(date) to service_role;

notify pgrst, 'reload schema';
