# Pit Stop: Vehicle Management Portal

A personal digital garage. Everything you need to know about your vehicles, in one place: documents in a Glovebox, a service logbook, known issues to tell the workshop, odometer readings, and one plain sentence per vehicle (the Pit Board) saying what needs you right now.

Built for vehicles in India: cars, SUVs, motorcycles, scooters and other two-wheelers. Registration number as the everyday identifier, RC / insurance / PUC / CNG as first-class documents, kilometres, rupees, Indian digit grouping.

Product truth lives in [`PRODUCT.md`](PRODUCT.md), the visual system in [`DESIGN.md`](DESIGN.md), and the first-surface direction contracts in `.impeccable/surfaces/`.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| App | Vite, React 19, TypeScript, React Router, TanStack Query | One static front end, fast loads, nothing to operate. Mobile-first PWA manifest. |
| Backend | **Supabase** (managed Postgres, Auth, Storage) | Everything a personal app needs from one managed service. No server of our own, no queues, no second deployment. |
| Data isolation | Postgres row-level security, `user_id` on every row | Per-user privacy from day one; multi-user later costs nothing. |
| Files | Private Supabase Storage buckets, signed URLs | Documents and photos never touch a local disk and are never public. |
| Styling | Plain CSS with design tokens | No runtime, no framework to maintain. Fonts (Geist, Barlow Semi Condensed) are self-hosted. |
| PDFs | pdf.js, loaded only when a PDF is opened | Good phone viewing without weighing down first load. |

Reminders run on the same platform (Edge Functions and a scheduled job); see below. Document reading is next on the [roadmap](ROADMAP.md), and documents already carry an `extracted_fields` list so extracted values can be marked "From the document" versus "Entered by you".

## Run it locally

```bash
npm install
npm run dev
```

With no Supabase variables set, the app shows a "No backend connected" screen with an **Explore the demo** button. Demo mode runs entirely in your browser (IndexedDB) on invented sample data and says so on every screen. It is never used for a real account.

### Connect a real backend

1. Create a project at [supabase.com](https://supabase.com) (the free tier is fine to start).
2. Create the schema. Either paste the files in `supabase/migrations/` into the SQL editor in order, or use the Supabase CLI: `supabase link --project-ref <ref> && supabase db push`.
3. **Authentication → Providers → Email** is on by default. For a personal app you may turn off "Confirm email" so password sign-up works instantly; otherwise the app asks you to confirm by email. Add your site URL (and `http://localhost:5173`) under **Authentication → URL Configuration**.
4. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings → API). The anon key is safe in the browser: row-level security does the protecting.
5. `npm run dev`, create an account, add your first vehicle.

### Reminders (optional, free)

The app can message you before insurance, PUC or a CNG hydro-test runs out, by email and Telegram. It needs the third and fourth migrations applied, two Edge Functions, a few secrets and a daily schedule. Everything below is free at personal scale.

1. **Migrations.** Apply `20261006000001_plate_use.sql` and `20261006000002_reminders.sql` the same way as the first two.
2. **Telegram bot.** In Telegram, message [@BotFather](https://t.me/BotFather), send `/newbot`, and keep the token and the bot's username. Put the username (without the @) in `.env.local` as `VITE_TELEGRAM_BOT_USERNAME`.
3. **Email.** Make a free [Resend](https://resend.com) account and an API key. Without a verified domain, Resend only delivers to your own sign-up address, from `onboarding@resend.dev`, which is enough for a personal app.
4. **Secrets.** Choose two long random strings (for `CRON_SECRET` and `TELEGRAM_WEBHOOK_SECRET`), then:

   ```bash
   supabase secrets set CRON_SECRET=... TELEGRAM_WEBHOOK_SECRET=... TELEGRAM_BOT_TOKEN=... \
     RESEND_API_KEY=... REMINDER_FROM_EMAIL="Pit Stop <onboarding@resend.dev>" APP_URL=https://your-site
   ```

5. **Deploy the functions.** `supabase functions deploy send-reminders telegram-webhook` (or paste each `index.ts` and `_shared/messages.ts` into the dashboard's Edge Functions editor).
6. **Point Telegram at the bot function** (once):

   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -d url=https://<project-ref>.supabase.co/functions/v1/telegram-webhook \
     -d secret_token=<TELEGRAM_WEBHOOK_SECRET>
   ```

7. **Schedule it.** Edit and run `supabase/cron/reminders.sql` in the SQL editor. It calls the function every day at 9:00 India time.
8. In the app: **Account → Reminders**, connect Telegram, and press **Send a test message**.

What is sent: for the latest insurance, PUC and CNG certificate of each vehicle, one message at each chosen lead time (30, 14, 7 or 1 day before, or on the day). If a day is missed the reminder is caught up, and nothing is sent twice. SMS and WhatsApp are not built: SMS in India needs sender registration with no free route, and WhatsApp business messages are paid.

### Reading documents

Uploading an insurance policy, PUC, CNG certificate or RC reads it on your device and fills in the issuer, number and dates for you to check. An RC also offers to update the vehicle (make, model, fuel, engine, registration number and date, colour), and **Add a vehicle** can start from an RC.

- **PDFs with text** (most insurer and parivahan downloads) are read directly. Locked PDFs ask for the password, which is used once and never stored. Insurers usually use your date of birth or registration number.
- **Photos and scanned PDFs** go through Tesseract OCR in a background worker. The engine and English data are copied from `node_modules` into `public/ocr/` by `scripts/copy-ocr.mjs` (run automatically before `dev`, `build` and after `install`), so nothing is fetched from a CDN and it works offline. About 21 MB of static files, loaded only when a photo is read.
- Nothing leaves the device. The owner's name, address, chassis and engine numbers are never picked out or stored. Every suggestion is shown for you to check; nothing is saved without your tap, and fields filled from the file are marked "From the document" in the viewer.
- OCR on a photo is far less reliable than on a text PDF, especially glossy RC cards and angled shots. A flat, well-lit photo helps. An AI reader for hard photos is not built: it would send the file to a third party and cost money per use.

### Deploy

`npm run build` produces a static site in `dist/`. Host it anywhere that serves static files with a single-page-app fallback to `index.html` (Vercel, Netlify, Cloudflare Pages). Set the same two environment variables in the host.

### Backups

Supabase takes automatic daily backups on paid plans. On the free tier there are none, so schedule your own export (Dashboard → Database → Backups, or `supabase db dump`) and download the `documents` bucket occasionally.

## Checks

```bash
npm run typecheck
npm test                 # domain logic (Pit Board, service due, freshness rule) and the Supabase adapter
npm run verify:schema    # applies the migrations to a throwaway local Postgres and asserts triggers + RLS
node scripts/e2e.mjs     # browser end-to-end flows in demo mode (dev server running with VITE_DEMO=true)
```

`verify:schema` needs Postgres server binaries (`initdb`, `pg_ctl`) on the machine; it stands in for the parts of Supabase the schema depends on and never touches a real project.

## Data model

`vehicles` (common fields as columns, `plate_use` for the HSRP plate colour, type-specific ones optional: engine cc, battery kWh, CNG kit, wheels; per-vehicle service interval in km and months; a trigger-maintained current odometer), `odometer_readings`, `service_records`, `issues`, `documents`, plus `reminder_settings` and `reminder_log` for reminders. Every child row references its vehicle through a composite key `(vehicle_id, user_id)`, so a row can never point at someone else's vehicle. Users are Supabase's `auth.users`.

## Decisions made without asking

- **Light theme by default** (outdoor use), dark follows the system.
- **Vehicle page navigation on phones** is a scrolling section strip under a compact header, not a bottom tab bar, with one docked **Add** button. (This replaces the five-tab bar first drawn in `DESIGN.md`.)
- **Registration number is optional** at creation so a new purchase awaiting registration can still be added. Variant is optional too.
- **Service intervals** start from a default by vehicle type (10,000 km / 12 months for four-wheelers, 5,000 km / 6 months for two-wheelers) and are editable per vehicle. "Next service" is whichever of the km or date limit arrives first.
- **No service logged yet means no schedule**; the app does not guess a baseline.
- **"To address next time" lines on a service record become open issues**, so there is one list of things to tell the workshop. Editing the record later does not change that list.
- **A service record's odometer is also logged as an odometer reading**, so there is no double entry.
- **A lapsed warranty is not a problem.** Warranty types show "Ended" quietly instead of "Expired".
- **Older insurance / PUC / RC / CNG documents move to History** once a newer one exists; warranties stay individually listed.
- **Freshness Rule:** an odometer reading older than 21 days makes distance claims say "about" and name the reading's date, and the app offers a one-tap odometer update.
- **Document upload limit** is 15 MB; images are resized in the browser (2400 px, with a thumbnail) before upload, vehicle photos to 1440 px.
- **Auth:** email and password, plus an email sign-in link. No social login.
