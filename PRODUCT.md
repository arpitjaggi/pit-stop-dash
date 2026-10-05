# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Mobile-first. The phone is the primary experience; desktop is an expanded version of the same product, not the origin of the design. Whether the web app is installable (PWA) is part of the stack decision.

## Stack

Not final. Direction set by the user: as little backend setup, administration and maintenance as possible. This is a personal product, not a high-scale SaaS platform.

The user wants:
- simple deployment, a managed database, managed file and document storage, easy-to-maintain authentication, automatic backups where available, simple environment configuration, a clean data model that can grow;
- no complicated backend architecture, no multiple independently deployed services, no self-hosted infrastructure, no Kubernetes, no queues unless genuinely necessary, no microservices, no infrastructure needing regular manual maintenance.

Room must remain for later OCR and document extraction, notifications, SMS alerts, and AI-assisted document parsing. None of them are built now.

Recommended architecture (pending the user's confirmation): one front-end deployment plus one managed backend-as-a-service providing relational Postgres, authentication, and private file storage (Supabase is the leading candidate), with no custom server of our own. Future extraction and alerts would hang off the same platform's serverless functions and scheduled jobs. Earlier "plain static HTML/CSS/JS" and "browser-only storage" recommendations are withdrawn: they cannot hold documents and photos reliably across devices.

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

## Open Decisions

Unresolved product facts. Resolve these before building; do not guess them silently.

1. **Backend platform.** Confirm the recommended managed backend-as-a-service approach (see Stack) before building.
2. **Offline and poor-connectivity behaviour.** Petrol pumps, basements and service centres often have poor signal. Must documents and the open-issues list be available offline, and must readings logged offline sync later? Decides whether this is an installable offline-capable web app or a plain mobile website.
3. **Access and sharing.** Single user only, or should a family member be able to view the same garage? Authentication method (email link, Google sign-in, phone OTP).
4. **Fuel type list.** Confirm the list (Petrol, Diesel, CNG, Petrol+CNG, EV, Hybrid, others).
5. **Registration number handling.** Validation and formatting, uniqueness, vehicles without a registration yet, and BH-series numbers.
6. **Insurance model.** Which policy types and terms to represent (for example third-party only, comprehensive, standalone own damage, multi-year terms) and which dates matter.
7. **Service interval model.** Assumed: per vehicle by distance and by time, whichever comes first, with a sensible default for new vehicles; some two-wheelers may use different patterns.
8. **"Due soon" thresholds.** How early a date or reading counts as upcoming. Assumed: sensible defaults, adjustable.
9. **Document renewals and history.** Assumed: older insurance and PUC documents kept as history, with the latest valid one shown as current.
10. **Warranty expiry.** Date, kilometres, or whichever comes first.
11. **Known issue lifecycle.** Assumed: open and resolved, linkable to the service record where it was fixed.
12. **Service record versus odometer reading.** Assumed: a service record's odometer also appears in the reading history without double entry.
13. **Vehicle image.** Owner-uploaded photo with a graceful fallback when none exists, never a fake 3D render.
14. **Currency, units, and formats.** Assumed km, INR, Indian number grouping and DD/MM/YYYY dates.
15. **Initial data.** No real vehicles or documents exist yet; any seed or demo data must be clearly marked as sample.

## Brand Commitments

- Name: "Pit Stop Dash". The quirk comes from the owner being an F1 fan.
- The F1 influence lives in subtle details, naming, composition, and micro-interactions. It must not look like an F1 website, racing game, or motorsport dashboard.
- Intended personality: premium, personal, practical, automotive, slightly quirky, calm, well organised, fast, information-rich without being overwhelming. It should feel like someone who loves cars cared about it, not like an AI generated a dashboard.

Visual direction volunteered by the user, recorded as binding (not yet expanded into a visual world):

- **"Bold Linear."** Linear is the strongest reference for information hierarchy, layout discipline, navigation, typography, spacing, density, subtle surfaces, borders, interaction quality, and overall polish. Pit Stop Dash must not look like Linear.
- Compared with Linear it should have: stronger typographic hierarchy, more prominent vehicle imagery, more confident section headings, slightly more visual contrast, and a little more personality. Automotive character comes from composition and micro-interactions rather than gimmicky graphics. Boldness comes from typography, spacing, scale, contrast and composition, not decoration.
- Summary: Linear's product discipline plus premium automotive product design plus subtle F1 personality.
- Avoid: corporate fleet-management aesthetics, generic SaaS dashboards, excessive charts, excessive rounded cards, every element inside a floating card, giant dashboard KPI cards, purple or blue AI gradients, glassmorphism, fake automotive 3D graphics, racing-game graphics, fake telemetry screens, carbon-fibre textures, checkered flags, and excessive red or orange automotive clichés (including red used simply because of motorsport).
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
