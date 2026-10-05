---
version: 1
slug: "vehicle"
primary_target: "vehicle"
related_targets: []
---

# Surface brief: Vehicle page

Mode: Operate. Mobile-first; desktop uses a sidebar, tabs, a properties rail and master-detail panes.

## Scope and task
The complete record of one vehicle. The owner is at a petrol pump, a service centre, or being asked for a document. They come for one of five jobs: see what needs attention (Overview), find a document (Glovebox), check or prepare for service (Service), note or review a problem (Issues), log or read the odometer (Odometer).

## Content and sections
Identity header: vehicle photo, make, model, variant, plate, registration date, fuel type, current odometer, plus facts that come from the RC.
- Overview: Pit Board, the attention list, a "coming up" list of dated items, and identity details (a properties rail on desktop, a collapsed "Details" section on phones).
- Glovebox: document rows sorted by urgency, History group for older renewals, full-screen viewer.
- Service: a top block answering "last service, where, what's next" with distance and date, a Workshop list of items to raise, then the logbook timeline.
- Issues: a quick-add field, open issues, resolved issues collapsed, and the Workshop list view.
- Odometer: current reading at Figure XL, Add reading, history rows with the delta since the previous reading. No chart.

## Direction contract
THESIS: One vehicle, one coherent record, opened like a logbook. It refuses five unrelated dashboard modules; the identity header and the Pit Board tie every section together, and the sections read as chapters of the same book.
OWN-WORLD: The Garage world: Concrete ground, Tyre ink, Petrol for action, status words for state, Geist plus Barlow Semi Condensed figures, hairlines not boxes, plate chip as identity. Document thumbnails at 2px as paper; the logbook's odometer margin is the page's recognisable detail.
STORY: The owner understands the vehicle's standing in a glance, reaches any document in two taps, goes to the workshop knowing what was last done and what to raise, and logs a reading or an issue without friction.
FIRST VIEWPORT: Phone, 390 wide. A full-bleed photo (or paint-colour field) at about 220px, the make in Label, the model in Display, the variant in Asphalt, the plate chip beside the current odometer in Figure XL's smaller sibling. Under it the Pit Board sentence at 26/30. The sticky header condenses to the plate and model on scroll. The five-tab bar and the docked Add button anchor the bottom. Desktop: a header strip with the photo beside the identity, then tabs, the main column and a 320px properties rail.
FORM: Pinned by the user, so no direction roll was run. Concept seed key b257424e was printed by an unscoped seed run and does not bind this surface.
SIGNATURE MOVE: The Pit Board, plus the odometer figure ticking to its new value and the Glovebox list dropping in like a compartment.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Whether the Workshop list is a mode of Issues or a share-able view; it is a presentation of existing data, not a new data type.
- Document viewer rendering of PDFs on phones (native versus rendered pages) belongs to implementation.
- Offline marking on queued items depends on the offline decision in PRODUCT.md.
