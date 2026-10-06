# Pit Stop: Vehicle Management Portal. Roadmap

Written 6 Oct 2026, after the Paint Shop redesign and the step-by-step Add vehicle flow.
This covers the seven changes requested after the redesign. Each is checked against the
product rules in `PRODUCT.md`, then sequenced.

## Verdicts at a glance

| # | Request | Verdict | Size | Cost to run | Phase |
|---|---|---|---|---|---|
| 1 | Rename to "Pit Stop: Vehicle Management Portal"; chequered flag as the icon everywhere | Straightforward. Reverses an earlier "no chequered flags" rule, as you asked | S | Free | 1 |
| 2 | HSRP-style number plates, with colours (green for EV) | Straightforward. Needs one new field: how the vehicle is used | S–M | Free | 1 |
| 4 | Spacing problem in the Glovebox header | Bug. **Fixed in this change** | XS | Free | Done |
| 7 | Theme in Ferrari scarlet | Doable. One real design risk: red is also our "overdue" colour (see below) | M | Free | 1 |
| 6 | Alerts for PUC, insurance, CNG hydro-test | Doable and free via Telegram plus email. SMS is the wrong tool in India (see below) | M–L | Free at personal scale | 2 |
| 5 | Read documents and fill the fields | Doable in tiers: free and private first, AI only with consent | L | Free for digital PDFs; per-use cost for AI | 3 |
| 3 | Fetch make and model details from the web | The riskiest. No free official Indian source exists. Recommended as a bundled list first, then AI lookup with sources | M–L | Bundled list free; AI lookup per-use | 4 |

Order is by value over effort. Reminders (6) pay off most, because the dates are already in
the Glovebox. Document reading (5) removes the most typing. Web lookup (3) saves the least
and is the shakiest on data quality, so it goes last.

---

## Phase 1. Identity and look (items 1, 2, 4, 7)

One working session. No new services.

### 1. Name and chequered flag
- Full name **Pit Stop: Vehicle Management Portal** on the sign-in screen, browser tab title,
  PWA manifest name, README, `PRODUCT.md` and `DESIGN.md`.
- The sidebar and phone header use **Pit Stop** with the longer name as a quiet second line,
  because the full name is too long for a 264px sidebar and a home-screen label.
- One authored chequered-flag SVG, used for the favicon, the sidebar and sign-in mark, the PWA
  icons (192, 512, maskable, plus an Apple touch icon, rendered to PNG from the same SVG) and
  the loading state.
- Rule update in `PRODUCT.md`: the chequered flag is the **logomark only**. No flag patterns,
  stripes or backgrounds, and never inside a warning. "No racing-game UI" still stands.

### 2. HSRP plates
Vehicles get a new `plate_use` field: private, commercial or self-drive rental. EV is already
known from fuel type. Colours follow the usual Indian scheme ([Wikipedia](https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_India), [Zurich Kotak](https://www.zurichkotak.com/knowledge-center/rto/types-of-number-plates-in-india)):

| Use | Plate | Characters |
|---|---|---|
| Private | White | Black |
| Commercial | Yellow | Black |
| Private EV | Green | White |
| Commercial EV | Green | Yellow |
| Self-drive rental | Black | Yellow |

- The plate keeps its real colours in light and dark themes, because it is a physical object.
- HSRP details drawn in CSS and SVG: the blue "IND" strip with a chakra mark on the left, a
  rounded border and a condensed numeral face. Two-wheelers get the two-line rear-plate layout.
  Check the exact proportions against the Motor Vehicles Rules before building.
- Needs a small migration (`plate_use` enum, default private), a field in the Add and Edit
  flow on the registration step, and updates to the Plate component and its tests.

### 4. Spacing (done)
In the Glovebox, the title row sat flush against the first document row. The title row now has
space below it. Fixed in `pages.css`.

### 7. Scarlet theme
- Brand moves from saffron to a Ferrari-style scarlet around `#DC0000`–`#E10600`. White text
  on it passes AA at about 5:1. Ink text on it fails (about 3.7:1), so primary buttons switch to
  white labels.
- The warm paper ground stays. Scarlet on cream is close to Ferrari's own cream interiors, and
  it keeps the app from turning into a red wall. A Modena-style yellow stays as a small second
  accent for count chips and the dark-mode focus ring.
- Light and dark both get new tokens. The Pit Board panel stays ink.
- **The risk:** "overdue" is also red. With a scarlet brand, red stops meaning "act now" on its
  own. Plan: overdue keeps its words (our rule is that words carry meaning), gains a warning
  icon, and moves to a deeper crimson that does not match the brand button. I will check the
  Garage and Pit Board screens side by side before locking it.
- Each vehicle's own paint disc is untouched, so a red car still shows red.

---

## Phase 2. Reminders (item 6)

**Short answer: Telegram bot plus email, with an in-app "due soon" list. Not SMS.**

| Channel | Cost | Verdict |
|---|---|---|
| Telegram bot | Free, no per-message fee ([Telegram](https://core.telegram.org/bots/faq)) | **Primary.** Reaches your phone instantly. You link once with a deep link |
| Email via Resend | Free tier of 3,000 emails a month, 100 a day ([Resend](https://resend.com/blog/new-free-tier)) | **Backup.** Also works for anyone without Telegram |
| Web push (PWA) | Free | Optional later. iPhone only works once the app is added to the home screen |
| WhatsApp | Business-started messages are chargeable, reported at about ₹0.145 each in India from 1 Oct 2026 ([AiSensy](https://m.aisensy.com/blog/whatsapp-pricing-update-october-2026/)). Also needs Meta business verification | Later, if you want it and accept the cost |
| SMS | India needs DLT registration of the sender and every template, and gateways charge per message | Skip. No genuinely free route |

What gets reminded:
- **Insurance** and **PUC**: the expiry dates already in the Glovebox.
- **CNG hydro-test**: every 3 years, counted from the date stamped on the cylinder, by a
  PESO-approved centre ([Free Press Journal](https://www.freepressjournal.in/business/cng-hydro-testing-made-mandatory), [IOAGPL](https://ioagpl.com/hydro-testing/)).
  The `cng_certificate` document type already exists with an expiry date, so this needs no new
  data. The Add flow should offer to set it when the fuel is CNG or Petrol + CNG.

How it works:
1. A scheduled database job runs once a day at 9am IST and finds items due in 30, 7 and 1
   days, and on the day.
2. A Supabase Edge Function sends them and records what was sent, so nothing repeats.
3. Settings: choose channels, turn each kind of reminder on or off, quiet snooze for a vehicle.
4. Tone follows the app: one plain sentence, for example "Swift: insurance expires in 7 days."
   Include an action link. No F1 jokes inside warnings.

New tables: `notification_channels` and `notification_log`. Row-level security applies as
everywhere else. The Telegram bot token lives in Edge Function secrets, never in the browser.
Supabase scheduled jobs and Edge Functions are within free-plan limits at this scale
([Supabase limits](https://supabase.com/docs/guides/functions/limits)); confirm the scheduler
extension is on for your project.

---

## Phase 3. Read documents and fill the fields (item 5)

Three tiers, tried in order. Anything extracted goes to a **review screen** first. Nothing is
saved without your tap, and existing values are shown beside the new ones.

1. **Digital PDFs, free and private.** Insurance policies and PUC certificates usually arrive as
   text PDFs. The app already ships `pdfjs-dist`, so text is read in the browser and nothing
   leaves your device. Many insurer PDFs are password-protected, so the flow asks for the
   password and does not store it.
2. **Photos and scans, free.** In-browser OCR (Tesseract). Works on clean, flat scans and is
   unreliable on glossy RC cards and angled photos. Marked as lower confidence.
3. **AI vision, optional.** A Supabase Edge Function sends the file to a vision model and gets
   structured fields back. Most accurate, costs per document, and sends the file to a third
   party. It needs your explicit opt-in, a plain explanation of what is sent, and a monthly cap.

Fields by document:
- **RC:** registration number, make and model, fuel, registration date, engine cc, colour.
- **Insurance:** insurer, policy number, issue date, expiry date.
- **PUC:** certificate number, test date, valid-until date.
- **CNG certificate:** test date, next due date.

Privacy decisions:
- RC cards and policies contain addresses, owner names and chassis numbers. Only the fields
  above are kept. The full text is not stored anywhere.
- Files stay in the private storage bucket. The extraction function does not log content.
- A future DigiLocker route is possible, but its API is aimed at registered organisations, not
  individuals. Treat it as a later investigation.

Each extracted value carries a confidence level. Low-confidence values are left blank on the
review screen, not guessed.

---

## Phase 4. Fetch make and model details (item 3)

There is no free official API for Indian make and model specifications. Registration-number
lookups depend on paid third-party services of uncertain legality, and scraping car portals
breaks their terms. So the plan is two layers:

1. **Bundled list.** A curated JSON of makes, models, variants, engine, fuel options and
   transmission for the vehicles Indians actually own, starting with about 30 makes. Free,
   offline, instant. It replaces the current make suggestions and fills fields on selection.
   Grows through releases. Wikipedia and Wikidata can seed it, with attribution.
2. **AI lookup with sources.** If the model is not in the list, the user taps "Look this up".
   An Edge Function asks a model with web search for specifications and returns suggestions,
   each with the source link. The user confirms each field, and anything unsourced is dropped.
   Costs per lookup, so it needs an API key and a per-user daily limit.

Not recommended: VAHAN or registration-number lookups through paid resellers, and scraping.

---

## Decisions I have made, and what I need from you

**Defaults I will use unless you say otherwise**
- Telegram plus email for reminders. WhatsApp and SMS are not built.
- Photo OCR is Tesseract. AI vision is off until you opt in.
- "Pit Stop" for short labels, the full name in titles and sign-in.
- The chequered flag is a logomark only.

**Two things only you can decide**
1. **Budget for the AI-based pieces (Phases 3 and 4).** They need an Anthropic API key held in
   Supabase secrets and cost a small amount per use. Are you happy to supply one, with a
   monthly cap? If not, the free tiers (bundled list, digital PDFs, Tesseract) still ship.
2. **How red should "overdue" be.** Once the brand is scarlet, I plan an icon and a deeper
   crimson for overdue. If you would rather overdue shifted to a different colour entirely, say so before Phase 1.

## Housekeeping that sits alongside
- Sign-up showed "Failed to fetch" on your machine. Still open. Check `VITE_SUPABASE_URL`,
  and blockers in the browser.
- Do not run `supabase db push`. Your migrations were applied outside the CLI history.
- Every new table or column ships as a numbered migration, idempotent, with tests in
  `supabase/tests`.
- After each phase: type check, unit tests, end-to-end run, and a refreshed `DESIGN.md`.
