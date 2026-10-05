---
version: 1
slug: "garage"
primary_target: "garage"
related_targets: []
---

# Surface brief: Garage (homepage)

Mode: Operate. Mobile-first; desktop is the expanded version of the same surface.

## Scope and task
The owner opens "My Garage" to see every vehicle at once and know which one needs them. Frequent, quick, often one-handed, outdoors. Success: within two seconds they can identify each vehicle and see which has something to act on; one tap opens a vehicle.

## Content on the surface
Per vehicle: photo (or paint-colour fallback), make and model, plate, current odometer, Pit Board sentence (most urgent item, else All clear with the next upcoming item), attention mark. Above the vehicles, only when something needs action: a one-line "Needs you" summary with a count that expands to the cross-vehicle attention list. Quick Log (add reading or issue) reachable from here.

## Direction contract
THESIS: The Garage is the vehicles, not a dashboard about them. It refuses the category default of a header of KPI tiles over a grid of rounded cards; the photographs are the page and the one thing each owes the owner is a sentence.
OWN-WORLD: Concrete ground (#F4F5F2), Tyre ink, one Petrol accent for actions, status words in moss, amber or vermilion. Geist for voice, Barlow Semi Condensed for the odometer figure and the plate chip. Hairlines instead of boxes, 0px radius on full-bleed photos, 4px plate chip. Recognisable with content removed by its edge-to-edge photographs, hairline rhythm and plate chips.
STORY: The owner understands in one scroll which vehicle needs what, trusts that nothing is hiding, and opens the one that matters or logs a reading without leaving the screen.
FIRST VIEWPORT: Phone, 390 wide. A slim header, "My Garage" at Section scale with a quiet search icon and the add-vehicle action. If anything needs action, a one-line summary beneath it. Then the first vehicle bay: a full-bleed 16:10 photograph, below it the model name, the plate chip left and the odometer in Figure M right, then the Pit Board sentence with its status mark. The top of the second bay peeks in below to signal that the garage continues. The docked Add button sits bottom-right above the safe area. Desktop: sidebar plus a three-to-four-column grid of bays at the same anatomy.
FORM: Pinned by the user ("Bold Linear" plus the references and avoid-list in PRODUCT.md), so no direction roll was run. Concept seed key b257424e was printed by an unscoped seed run and does not bind this surface.
SIGNATURE MOVE: The Pit Board sentence on every bay, plus the press-settle interaction on the photograph.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Bay order: manual order versus most-urgent-first (leaning manual and stable, with the Needs you summary doing the sorting work).
- Whether the Garage needs search before the owner has about six vehicles.
- Real vehicle photographs; until then the paint-colour fallback is the default state.
