# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Mobile-first. The phone is the primary experience; desktop is an expanded version of the same product, not the origin of the design. Whether the web app is installable (PWA) is part of the stack decision.

## Stack

Decided and built: Vite + React + TypeScript front end (mobile-first, installable manifest), plain CSS with design tokens, and **Supabase** as the whole backend: managed Postgres with row-level security (per-user isolation from day one), Supabase Auth (email and password, plus an email sign-in link), and private Supabase Storage buckets for documents and photos served through signed URLs. No server of our own, no queues, one static deployment. Future OCR, notifications and SMS hang off the same platform (Edge Functions, scheduled jobs); none is built. See README.md for setup and the decisions taken along the way.

## Users

A single owner (the builder), managing their own personal vehicles in India: cars, SUVs, motorcycles, scooters, and other two-wheelers. This is personal vehicle ownership, not commercial fleet management.

The owner uses the product mainly when physically around their vehicles: at a petrol pump, at a service centre, checking a document, or needing a fact quickly. They are usually on their phone, often one-handed, sometimes with poor connectivity. Their core question is "What do I need to know or do about my vehicle?"

## Product Purpose

Pit Stop Dash is a personal digital garage: everything the owner needs to know about their vehicles, in one place. It keeps the important information of vehicle ownership together (identity, documents, service history, known issues, odometer history, and upcoming or expired obligations) and surfaces what needs attention.

Success: the owner never misses an insurance or PUC expiry or a service due date, never forgets a problem noticed weeks earlier when the vehicle reaches the workshop, can pull up any document in seconds on a phone, and can log an odometer reading or an issue in a few taps.

## Positioning

A personal garage that understands Indian vehicle ownership, not a fleet tool and not a generic vehicle-tracking SaaS. Its distinguishing claims:

- It is organised around "what do I need to know or do?" rather than around displaying data.
- India-first and two-wheeler-first-class: Indian documents, terminology, fuel types and registration numbers are native concepts, and nothing assumes every vehicle is a car.
- Known issues are captured when noticed and resurface when preparing for the next service.
- Each vehicle has a Glovebox for its documents, built so that document intelligence can be added later.
- Service intervals are configured per vehicle, never one universal schedule.
- It is designed phone-first for use at the vehicle, then expanded properly for desktop.
- A subtle F1 flavour comes from an owner who loves cars.

## Operating Context

Single owner, multiple vehicles of mixed types. Records come from real Indian paperwork: RC, insurance policy, PUC certificate, warranty and extended-warranty documents, accessory warranties, CNG certificates, workshop job cards. Status is driven by dates (document expiry, service due date) and by odometer (service due at a reading).

The registration number is the vehicle's principal identifier in daily life and on every document.

Typical moments: standing at a petrol pump to log a reading; at the service centre needing the open issue list and the last service; being asked for the insurance or RC copy; noticing a rattle and wanting to note it before forgetting; checking what is about to expire. At a desk, the owner uses a larger screen for review, bulk document upload, and tidying records.

## Capabilities and Constraints

### MVP scope (build only this)

1. **Garage (homepage, "My Garage"):** all vehicles as individual tiles. Each tile identifies the vehicle quickly and carries: vehicle image, make and model, registration number, current odometer, status or attention indicators, and potentially the next important upcoming item. Opening a tile opens that vehicle's page. It should feel like a garage, not a corporate fleet dashboard.
2. **Vehicle page:** a dedicated page per vehicle. Its top establishes identity: make, model, variant, registration number, registration date, fuel type, current odometer, vehicle image, and other useful information from documents (RC).
3. **Glovebox:** the vehicle's digital document compartment: RC, insurance, PUC, warranty, extended warranty, accessory warranties, CNG certificates and documents where applicable, other vehicle-specific certificates. Metadata where possible: document type, issue date, expiry date, issuing organisation, relevant vehicle, upload date.
4. **Service Records:** mostly structured text and data. Per record: service date, workshop or location, odometer at service, service type, work performed, cost (optional), problems identified, problems to address at the next service, notes. The vehicle clearly shows last service, next service due, next due date, and next due odometer reading. Service intervals are configurable per vehicle.
5. **Known Issues:** a quick way to add and keep issues per vehicle (AC making a strange noise, brake pads need inspection, rear tyre slowly losing pressure, minor body damage, dashboard rattle). Visible when preparing for the next service.
6. **Odometer:** readings over time. Add a reading with date, odometer value, optional note or source. Simple; not telemetry or analytics.
7. **Attention surface:** important upcoming or expired items (insurance, PUC, service due), per vehicle and across the garage.

### Explicitly out of scope for MVP

- V2 features, including SMS or text alerts and notifications.
- Advanced OCR and document extraction. For the MVP, only shape the experience and data so that extraction can later populate vehicle and document metadata cleanly.
- Charts and analytics beyond what is needed to act, running-cost calculation, mileage analytics, commercial or fleet features.
- A huge automotive database. The product does not ship a catalogue of makes, models, and specs.

### Mobile-first requirements

- Mobile information architecture and interactions are designed deliberately first, then desktop is designed as an expanded version of the same product, not a stretched mobile layout. Do not design a desktop dashboard and then make it responsive.
- Important information is scannable immediately.
- Common actions are reachable one-handed where practical.
- Vehicle switching is easy.
- Uploading documents and photos is frictionless.
- Adding an odometer reading or an issue takes very few steps.
- Document viewing works extremely well on a phone.
- No dense tables that need horizontal scrolling.
- Bottom sheets, drawers, contextual actions and other mobile patterns are used where they genuinely improve the experience.

### Desktop requirements

- First-class product, not a stretched mobile layout.
- Extra space is used for better hierarchy and side-by-side information, not bigger cards.
- Navigation, vehicle switching, and document and service workflows must be excellent with mouse and keyboard.

### India-first requirements

- **Vehicle types:** cars, SUVs, motorcycles, scooters, and other two-wheelers are first-class; other personal vehicles possible later. The model must not assume car-only attributes.
- **Fuel types:** Petrol, Diesel, CNG, EV, and other sensible Indian-market options (for example bi-fuel petrol and CNG, and hybrids). The exact list is an open decision.
- **Registration number:** an important identifier, treated as a first-class field. Handling of formats (standard state series, Bharat series, temporary or missing registration on a new purchase) is an open decision.
- **Documents as first-class concepts:** Registration Certificate (RC), Insurance, PUC, CNG certificate and documents, Warranty, Extended warranty, Accessory warranty, other vehicle-specific certificates.
- **Insurance terminology and workflows must stay flexible,** not one fixed policy shape.
- **Odometer terminology** must read naturally for cars and two-wheelers.
- **Service patterns differ** between cars and two-wheelers; intervals are configurable per vehicle.
- **Tyres, battery, engine and oil information** must not be assumed to exist identically across vehicle types.
- Assumed and not yet confirmed: kilometres, rupees, Indian date and number formatting.

### Data model philosophy

- A sensible common vehicle model plus vehicle-type-specific fields where needed; not a rigid schema assuming every vehicle has the same attributes.
- Common: make, model, variant, registration number, fuel type, odometer, purchase date, registration date.
- Potentially vehicle-specific: engine capacity, battery capacity, CNG kit information, transmission, number of wheels, tyre information, EV-specific information.
- Documents carry structured metadata (type, issue date, expiry date, issuing organisation, vehicle, upload date) and are modelled so that extracted values can be written into them later.
- Service intervals belong to each vehicle.
- The data model should be clean and able to grow, without pre-building V2 systems.

### Design implications of the scope

- Vehicle identity fields largely come from the RC; in the MVP they are entered by hand but modelled as document-derived.
- Current odometer is the latest recorded reading.
- Next service due is computed from the vehicle's own configured interval, by date and by odometer.

## Decisions

Resolved by the owner's build brief:
- **Backend:** managed Supabase (above).
- **Device:** phone first, desktop as an expanded version of the same product.
- **Vehicle types:** cars, SUVs, motorcycles, scooters, other two-wheelers, other.
- **Fuel types:** Petrol, Diesel, CNG, Petrol + CNG, Electric, Hybrid, Other.
- **Locale:** kilometres, rupees, Indian digit grouping, dates written with a spelled-out month.
- **Access:** private, per-user data; personal use first, multi-user ready. No social login.
- **Documents:** RC, Insurance, PUC, Warranty, Extended warranty, Accessory warranty, CNG certificate, Other; each shows whether a field is "From the document" or "Entered by you".
- **Pit Board priority:** expired or overdue first, then important upcoming expiry, then service due, then open issues, then a calm all-clear. Distance claims honour the Freshness Rule.

Decided by the builder and documented in README.md (change on request): registration and variant are optional at creation; service intervals default by vehicle type and are editable per vehicle (whichever of km or months comes first); no schedule until a first service is logged; "address next time" lines become open issues; a service record's odometer is also logged as a reading; lapsed warranties are "Ended", not alarming; older insurance, PUC, RC and CNG documents move to History.

Still open:
1. **Offline and poor connectivity.** Not built. Pages need a connection; unsent entries are not queued.
2. **Sharing.** Single owner for now; the data model is ready for more users but there is no invitation or shared-garage flow.
3. **Insurance terms.** Policy type and term are not modelled beyond the dates, issuer and policy number.
4. **Warranty by distance.** Warranties expire by date only.
5. **Reminders.** Out of scope for the MVP (V2 alerts).

## Brand Commitments

- Name: "Pit Stop Dash". The quirk comes from the owner being an F1 fan.
- The F1 influence lives in subtle details, naming, composition, and micro-interactions. It must not look like an F1 website, racing game, or motorsport dashboard.
- Intended personality: premium, personal, practical, automotive, slightly quirky, calm, well organised, fast, information-rich without being overwhelming. It should feel like someone who loves cars cared about it, not like an AI generated a dashboard.

Visual direction, revised by the owner on 6 Oct 2026 after seeing the first build ("too bland"), recorded as binding:

- **Vibrant, warm and confident, in light and dark modes.** The Linear-style restraint is retired. The references the owner supplied (a car-rental tablet UI with a warm ground, saffron-yellow action colour and a dark detail panel; a row of cards where each car owns a large disc of its own paint colour; a car-health phone app) set the mood: colour with a job, soft rounded cards, big friendly type, dark panels for the key action.
- **Each vehicle owns its colour.** The vehicle's paint colour is its identity across its screens.
- **No gradients, no glow.** Flat colour only. Explicitly rejected: lavender/blue AI gradients, glassmorphism, soft glows (the health-app reference's gradients were the thing to avoid).
- Still binding from earlier: not an F1 website, racing game or telemetry screen; no carbon fibre or checkered flags; no stock or fake vehicle imagery (photos are the owner's own); the F1 influence stays in naming, microcopy and motion, at most one wink per screen and never inside a warning.
- Name and personality are unchanged: "Pit Stop Dash"; personal, practical, calm, well organised, a little quirky.
- Light and dark are both first-class; the owner can choose Light, Dark or follow the system.
- The homepage feels like "My Garage", not a fleet dashboard.

## Evidence on Hand

None. The repository holds only a README with the project name. No real vehicles, documents, photos, or workshop records exist in it. Future work must not fabricate vehicles, registration numbers, policy numbers, or records, and any sample data must be labelled as sample.

## Product Principles

- **What do I need to know or do?** Every piece of information has a reason to exist. Action and attention outrank displaying data for its own sake.
- **Phone first, at the vehicle.** The primary moment is standing next to the vehicle with one hand free; desktop expands the same product rather than originating it.
- **India is the product, not a locale setting.** Indian documents, terminology, and two-wheelers are native concepts.
- **Capture fast, surface later.** Adding an issue, a reading, or a service record takes few steps, and what was captured resurfaces when it matters.
- **Clarity over feature count.** The MVP is the listed capabilities done well, nothing more, and the backend stays boring and low-maintenance.
- **Per-vehicle truth.** Intervals, documents, attributes, and status belong to each vehicle; nothing is hard-coded universally across vehicle types.
- **Built to learn from documents later.** Metadata is structured so extraction can fill it in without reworking the product.

## Accessibility & Inclusion

No product-specific requirement established. Status must not rely on colour alone, since expiry and attention states are the product's core signal. Phone use in bright outdoor light (petrol pumps) and one-handed use argue for strong contrast and generous touch targets.
