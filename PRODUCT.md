# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: the user left the choice to me. Not yet final. My earlier recommendation of plain static HTML/CSS/JS predates the requirement to store uploaded document files and vehicle photos, which constrains storage (see "Open Decisions"). Decide the stack together with the storage and device-access decisions before any build starts.

## Users

A single owner (the builder), managing their own personal vehicles. This is personal vehicle ownership, not commercial fleet management. They open the product to answer one question: "What do I need to know or do about my car?" Typical moments: checking what is expiring or due, noting a problem as soon as it is noticed, logging an odometer reading, preparing for a workshop visit, and finding a document copy (RC, insurance, PUC) when it is needed.

## Product Purpose

Pit Stop Dash is a personal digital garage: everything the owner needs to know about their vehicles, in one place. It keeps the important information of vehicle ownership together (identity, documents, service history, known issues, odometer history, and upcoming or expired obligations) and surfaces what needs attention.

Success: the owner never misses an insurance or PUC expiry or a service due date, never forgets a problem noticed weeks earlier when the car finally reaches the workshop, and can find any vehicle document in seconds.

## Positioning

A personal garage, not a fleet tool and not a generic vehicle-tracking SaaS. Its distinguishing claims:

- It is organised around "what do I need to know or do?" rather than around displaying data.
- Known issues are captured when noticed and resurface when preparing for the next service.
- Each vehicle has a Glovebox for its documents, designed so that document intelligence (extracting data from an uploaded RC, insurance or PUC) can be added later.
- Service intervals are configured per vehicle, never one universal schedule.
- The name and personality carry a subtle F1 flavour from an owner who loves cars.

## Operating Context

Single owner, multiple vehicles. Cars are the confirmed case; CNG documents imply some vehicles are CNG-fitted, and PUC implies India. Records come from real-world paperwork: RC, insurance policy, PUC certificate, warranty and extended-warranty documents, accessory warranties, CNG certificates, workshop job cards. Status is driven by dates (document expiry, service due date) and by odometer (service due at a reading). The owner typically sits with the car or at the workshop when adding a reading, an issue, or a service record.

## Capabilities and Constraints

### MVP scope (build only this)

1. **Garage (homepage, "My Garage"):** all vehicles shown as individual tiles. Each tile identifies the vehicle quickly and carries: vehicle image, make and model, registration number, current odometer, status or attention indicators, and potentially the next important upcoming item. Clicking a tile opens that vehicle's page.
2. **Vehicle page:** a dedicated page per vehicle. The top establishes identity: make, model, variant, registration number, registration date, fuel type, current odometer, vehicle image, and other useful information that comes from vehicle documents (RC).
3. **Glovebox:** the vehicle's digital document compartment. Holds copies of RC, insurance, PUC, warranty and extended-warranty documents, accessory warranties, CNG certificates and documents for applicable vehicles, and other vehicle-specific certificates. Metadata per document where possible: document type, issue date, expiry date, issuing organisation, relevant vehicle, upload date.
4. **Service Records:** mostly structured text and data. Per record: service date, workshop or location, odometer at service, service type, work performed, cost (optional), problems identified, problems to address at the next service, notes. The vehicle clearly shows last service, next service due, next due date, and next due odometer reading. Service intervals are configurable per vehicle; no hard-coded universal interval.
5. **Known Issues:** a simple, quick way to add and keep issues per vehicle (for example: AC making a strange noise, brake pads need inspection, rear tyre slowly losing pressure, minor body damage, rattle from the dashboard). They must be visible when preparing for the next service, so a noticed problem is not forgotten.
6. **Odometer:** readings tracked over time. Add a reading with date, odometer value, and optional note or source. Keep it simple; this is not telemetry or analytics.
7. **Attention surface:** important upcoming or expired items (insurance, PUC, service due) are shown clearly, per vehicle and across the garage.

### Explicitly out of scope for MVP

- V2 features, including SMS or text alerts and notifications. They should not shape the MVP architecture more than necessary.
- Advanced OCR or document extraction. For the MVP, only shape the experience and data so the capability can be added cleanly later: documents and vehicle identity carry structured metadata fields, and a future extraction step can fill them.
- Charts and analytics beyond what is needed to act, running-cost calculation, mileage analytics, commercial or fleet features.

### Design implications of the scope

- Vehicle identity fields largely come from the RC; in the MVP they are entered by hand but modelled as document-derived.
- Current odometer is the latest recorded reading (a service record's odometer is also a reading).
- Next service due is computed from the vehicle's own configured interval, by date and by odometer.

## Open Decisions

Unresolved product facts. Resolve these before building; do not guess them silently.

1. **Where data and uploaded files live, and on which devices.** Document files and photos cannot sensibly live in a plain static page's storage alone. Options: local-only in the browser (private, single device, can be lost), a small backend with file storage (multi-device, needs hosting), or a hybrid. This also decides the stack.
2. **Device and context of use.** Desktop, phone, or both. Likely phone at the workshop or car; this changes priorities.
3. **Privacy and access.** RC and insurance documents contain personal data. Does the app need a login, or is a private single-user deployment enough?
4. **Which vehicle types.** Cars only, or also two-wheelers? Affects fuel types, document types, and service patterns.
5. **Service interval model.** Per vehicle by distance, by time, or whichever comes first (the usual workshop rule). Assumed: both, whichever comes first, configurable per vehicle.
6. **"Due soon" thresholds.** How many days or kilometres before a date or reading counts as upcoming versus expired. Assumed: configurable with sensible defaults.
7. **Odometer unit and locale.** Assumed km, INR, India-format dates. Unconfirmed.
8. **Document renewals and history.** Insurance and PUC renew repeatedly. Keep old versions as history with one current document per type? Assumed: yes, the latest valid is "current", the older ones are kept.
9. **Warranty expiry.** Warranties often expire by date or by kilometres, whichever comes first. Should warranties support both?
10. **Known issue lifecycle.** Open and resolved states, and whether resolving links an issue to the service record where it was fixed. Assumed: open and resolved, linkable to a service record.
11. **Service record versus odometer reading.** A service record carries an odometer value; assumed it also appears in the odometer history without manual double entry.
12. **Vehicle image.** Owner-uploaded photo per vehicle, with a graceful fallback when none exists (never a fake 3D render).
13. **Initial data.** Real vehicles and documents are not yet available; any seed or demo data must be clearly marked sample data.

## Brand Commitments

- Name: "Pit Stop Dash". The quirk comes from the owner being an F1 fan.
- The F1 influence lives in subtle details, naming and interaction personality. It must not look like an F1 website, racing game, or motorsport dashboard.
- Intended personality: premium, personal, practical, automotive, slightly quirky, calm, well organised, fast, information-rich without being overwhelming. It should feel designed by a person who loves cars, not generated from a "car dashboard UI" prompt.
- The homepage should feel like "My Garage" rather than a corporate fleet dashboard.
- Binding avoid-list volunteered by the user (recorded as given, not expanded): corporate fleet-management aesthetics, generic SaaS dashboards, excessive charts, excessive rounded cards, purple or blue AI gradients, glassmorphism, fake automotive 3D graphics, racing-game UI, excessive carbon-fibre textures, checkered flags everywhere, and overuse of red simply because of motorsport.

## Evidence on Hand

None. The repository holds only a README with the project name. No real vehicles, documents, photos, or workshop records exist in it. Future work must not fabricate vehicles, registration numbers, policy numbers, or records, and any sample data must be labelled as sample.

## Product Principles

- **What do I need to know or do?** Every piece of information has a reason to exist. Action and attention outrank displaying data for its own sake.
- **Clarity and usefulness over feature count.** MVP means the six listed capabilities done well, nothing more.
- **Capture fast, surface later.** Adding an issue, a reading, or a service record must be quick, and what was captured must resurface when it matters (before a service, before an expiry).
- **Per-vehicle truth.** Intervals, documents, and status belong to each vehicle; nothing is hard-coded universally.
- **Built to learn from documents later.** Metadata is structured so that document intelligence can fill it in the future without reworking the product.
- **Quirk, not costume.** The F1 character shows in small details and wording, never as motorsport theming.

## Accessibility & Inclusion

No product-specific requirement established. Status must not rely on colour alone, since expiry and attention states are the product's core signal.
