---
name: Pit Stop Dash
description: A beautifully designed digital garage for Indian vehicle owners. Linear's discipline, a confident automotive voice, and a quiet F1 wink.
---

<!-- SEED: established with the user before implementation; re-run /impeccable document once there's code to capture the actual tokens and components. -->

# Design System: Pit Stop Dash

Every value below is a proposed seed value, chosen with reasoning and checked for contrast, but not yet proven in a build. The first build is allowed to move a value when a screen proves it wrong; it is not allowed to move a principle without asking.

## Overview

**Creative North Star: The Well-Kept Garage.** The product should feel like the garage of someone who loves their cars and keeps a good logbook: orderly, a little proud, nothing in the wrong place, and every drawer opens at once. It is a working tool first (Operate mode), so the world lends four things only: type, palette, density and one signature move. It never supplies the layout, navigation model or controls, which stay as standard and legible as the best tools in the category.

**"Bold Linear", defined.** Take Linear's discipline: strict hierarchy, hairline borders, flat quiet surfaces, tight spacing, fast and exact interactions. Then turn four things up: type scale (louder headings, instrument-sized numerals), contrast (true ink on a tinted ground), vehicle imagery (the vehicles are the hero objects, full-bleed on phones), and personality (microcopy and motion, never ornament). Boldness comes from typography, spacing, scale, contrast and composition, not decoration.

**Where each reference lends something (principles only, nothing copied).**
- *Linear:* hierarchy, navigation, density, hairline surfaces, the list-plus-properties-rail structure of a detail view.
- *Raycast:* a command palette, compact actions, keyboard-first flows, a utility with a sense of humour.
- *My Porsche:* the single vehicle as the hero of its own page, and plain maintenance status.
- *Turo:* managing several vehicles, each with its own record and practical to-dos.
These were studied from general knowledge of the products, not from a live inspection of them.

**Physical scene, which forces light by default.** The owner is on a phone, one-handed, in direct Indian sunlight at a petrol pump or in the glare of a workshop forecourt. Dark interfaces wash out in sun, so **light is the default theme**. A full dark theme follows the system setting, for the garage at night and for desktop evenings. Both ship; neither is an afterthought.

**Signature move: the Pit Board.** Every vehicle carries one sentence of plain-language verdict, set at display scale, the way a pit board gives a driver the one thing to know this lap: "Insurance expires in 18 days." or "All clear. Service in 2,340 km." It leads each vehicle tile and each vehicle page. It is the product's thesis, "what do I need to know or do?", made typographic.

**Supporting identity primitive: the Plate.** The registration number is the vehicle's real-world identity in India, so it is set as a plate-form chip with plate-style lettering. It is how a vehicle is named in the switcher, the command palette, toasts and document headers. Beyond that it is the only place a lettered "object" appears; no other element imitates a physical thing.

**Imagery stance.** Real photographs the owner uploads, shown large and uncropped as far as the frame allows. No renders, no cut-outs, no stock cars, no 3D. A vehicle with no photo falls back to a flat field of its paint colour (the owner picks a swatch) with the model name set large on it, which is honest and distinctive rather than a placeholder silhouette.

**Motion grammar.** Fast and exact (120 to 220 ms, ease-out, no bounce). Four deliberate moments: the odometer figure ticks to its new value when a reading is logged; the Glovebox list drops in as if a compartment opened; a pressed vehicle image settles slightly (a 1.5% scale) before navigating; the Pit Board sentence cross-fades when its verdict changes. Everything respects reduced-motion by becoming instant.

**Voice (lives in the design because status language is part of the interface).** Plain, specific, present tense, in the owner's units. "Insurance expires in 18 days", "Service due in 740 km", "PUC expired 3 days ago". Never "18D", never "92%", never database field names. The F1 flavour is a seasoning with a rule: at most one wink per screen, and never inside a warning. Examples of the allowed register: "Green flag" as an optional label for All clear, "Pit window opens at 48,420 km", "Filed in the Glovebox", "Empty garage. Wheel something in."

**The Freshness Rule.** A distance statement is only as true as the last odometer reading. When the latest reading is older than a threshold (set during implementation), distance-based lines say so: "About 740 km to service, going by your reading on 14 Sep", with a one-tap "Update odometer".

## Colors

**Strategy: Restrained shell, committed jobs.** One brand colour, a tinted neutral ground, and three status colours. Each colour has exactly one job, and no colour is decorative. Paint colour appears only inside vehicle imagery.

All pairs below meet WCAG AA for their use (ratios measured against the stated ground).

### Light theme (default)

- **Concrete** (#F4F5F2): the canvas. A cool green-grey tinted toward garage concrete, never cream, never pure white.
- **Chalk** (#FFFFFF): raised surfaces only: sheets, popovers, inputs, document previews.
- **Slab** (#E9ECE6): sunk wells and pressed states.
- **Seam** (#DFE2DC): hairline dividers. **Seam Strong** (#C3C8BF): quiet outlines on non-interactive objects.
- **Control Edge** (#7F877F): the border of inputs and secondary buttons (3.7:1 on Chalk, 3.4:1 on Concrete, as required for control boundaries).
- **Tyre** (#111613): primary text and plate lettering (16.7:1 on Concrete).
- **Asphalt** (#454D47): secondary text (8.0:1).
- **Gravel** (#646C66): tertiary text, timestamps, captions (4.95:1 on Concrete, 4.5:1 on Slab; never below 13px).
- **Petrol** (#0F4A47): the single brand colour. Primary buttons, links, selection, focus ring, the active tab. White on Petrol is 10.0:1. **Petrol Deep** (#0A3836) is its pressed state; **Petrol Wash** (#DCEBE8) its selected-row tint.
- **Status.** Always paired with words, never colour alone:
  - **Clear** moss (#2A7048, wash #E1F0E6).
  - **Due soon** amber (text #8A4F00, mark #D98A00, wash #FBE7BF).
  - **Expired or overdue** vermilion (#B83220, wash #FBE3DE). The only red in the product, reserved for genuinely expired or overdue, and used as text and a small mark, not as a field.
  - **Unknown or no record** Gravel text with a hollow mark.

### Dark theme (follows system)

Concrete becomes **Garage Night** (#0D1110); surfaces step lighter by lightness, not shadow: Surface (#141A18), Raised (#1C2421); Seam (#26302C); Control Edge (#6B756E); text Ink (#ECEFEA), Ink-2 (#A5AEA7), Ink-3 (#8A948D). Petrol lifts to **Petrol Lit** (#58C2B8), and a primary button becomes Petrol Lit with text #06201E (8.0:1). Status: moss #5CC48A, amber #F0B050, vermilion #FF7A63. No neon, no glow.

**The One Job Rule.** Petrol marks what you can act on. Status colours mark state. Paint colour lives in vehicle imagery. Plate colours live in the plate chip. If a colour is doing a second job, it is wrong.

**The Quiet Red Rule.** Red appears only when something is actually expired or overdue. Nothing in the product is red for being automotive, urgent-looking, or branded.

## Typography

Two faces, one job each. Both are free, self-hostable families; loading strategy and exact subsetting are [to be resolved during implementation].

- **Geist** (variable) is the voice: headings, UI, body. It is a clean workhorse with a confident bold, set with tight tracking at display sizes for the Linear discipline.
- **Barlow Semi Condensed** is the instrument: every number that reads as a reading (odometer, distances remaining) and the registration plate. Barlow is drawn from highway signage and number plates, so the face already belongs to the subject. It appears only on figures and plates, never on prose, and never in all-caps shouting.

Latin script only for the MVP. Hindi or other Indian-language UI is an open question (see flags).

| Role | Face | Mobile | Desktop | Use |
|---|---|---|---|---|
| Display | Geist 700, tracking -0.025em | 34/36 | 44/46 | Vehicle model on its page |
| Pit Board | Geist 650, tracking -0.02em | 26/30 | 32/36 | The one-sentence verdict |
| Section | Geist 700, tracking -0.02em | 24/28 | 26/30 | Glovebox, Service, Issues, Odometer: confident, not small caps labels |
| Title | Geist 600 | 17/22 | 15/20 | Row titles, document names |
| Body | Geist 400 | 16/24 | 14/20 | Text and inputs (16px on phones prevents input zoom) |
| Label | Geist 500 | 13/16 | 12/16 | Field labels, metadata (never below 12px) |
| Figure XL | Barlow Semi Condensed 600, tabular | 56/52 | 72/64 | Current odometer |
| Figure M | Barlow Semi Condensed 600, tabular | 28/28 | 24/24 | Distances and readings in lists and tiles |
| Plate | Barlow Semi Condensed 600, +0.08em | 16/16 | 15/15 | Registration number |

Tabular lining figures are required so readings align and tick cleanly (verify the font feature at build). Indian digit grouping is used throughout: 1,24,560 km, formatted with the en-IN locale. Dates are written with the month as a word ("23 Oct 2026") so day-month order can never be misread.

**The Sentence Rule.** Section headings are real words at real size. Small uppercase tracked labels are not used as headings anywhere.

**The Instrument Rule.** If a number is a reading of the vehicle (distance, odometer), it is set in the figure face. If it is a count or a date inside prose, it is body text.

## Layout

Operate mode: a clean aligned grid, consistent spacing, a real type scale. The signature move adds to that cleanliness; it never replaces it.

**Spacing.** 4px base unit. Steps: 2, 4, 8, 12, 16, 24, 32, 48, 72. Phone gutter 16px. Vertical rhythm: more space above a heading than below it (typically 40 above, 12 below).

**Surface logic.** The page is the canvas. Content sits directly on it as rows separated by hairlines. Floating containers are reserved for things that are literally raised: sheets, popovers, menus. A vehicle is not a card.

**Mobile first (designed first, not collapsed from desktop).**
- *Garage:* a single column of full-bleed vehicle "bays". Each bay is the photograph edge to edge, then the model name, the plate, the odometer figure and the Pit Board sentence beneath, set on the canvas and separated from the next bay by a hairline. No box, no shadow.
- *Vehicle context:* a compact sticky header (plate chip plus model; tap it to switch vehicle in a bottom sheet), a **bottom tab bar** with five destinations in the thumb zone: Overview, Glovebox, Service, Issues, Odometer. The full names are used on wider screens; "Service" and "Issues" are the phone labels.
- *Add:* one context-aware **Add** button docked above the tab bar, bottom-right. On Overview it opens the Quick Log sheet (Odometer reading, Issue, Document, Service record, in that order of speed). On a tab it does that tab's obvious thing.
- *Sheets over pages:* adding a reading, an issue or a document happens in a bottom sheet with smart defaults (today's date, last reading as a placeholder, last-used vehicle), so common actions are three taps or fewer.
- *No horizontal scrolling,* ever. Table-like data is rebuilt as stacked rows with a leading figure.
- *Touch targets* are 44px minimum, spacing between them 8px minimum.

**Desktop (a first-class product, not stretched mobile).** The same product, expanded by structure rather than size.
- A **left sidebar** (248px): My Garage, then every vehicle as its plate chip plus model, so vehicle switching is one click or one key. Linear's navigation discipline, our content.
- A **command palette** on ⌘K / Ctrl+K: go to a vehicle, open a document, add a reading to a named vehicle, jump to a tab. Plus single-key shortcuts for tabs and Add, shown in menus and tooltips.
- The vehicle page uses a **main column plus a properties rail** (Linear's issue detail structure): the main column (reading width up to 760px) carries the section; the 320px rail carries identity facts, status, and service interval settings, shown at 1280px and above.
- **Glovebox and Service become master-detail:** the list at left, a live preview or the full record at right, so documents and service entries are read without leaving the list.
- Tabs sit horizontally under the vehicle header; sheets become popovers or centred dialogs; density tightens (control height 32px, body 14px).
- The Garage is a grid of bays at stable aspect ratios, three to four across, never oversized cards.

**Breakpoints (directional).** Under 640: phone layout. 640 to 1023: two-column bays, sidebar collapsed to an icon rail. 1024 and up: sidebar plus content. 1280 and up: properties rail visible.

**Information priority on every screen.** (1) What needs attention, in the Pit Board. (2) The most recent facts the owner needs to act (odometer, last service). (3) The records, for lookup. (4) Detail and history, behind a tap.

## Elevation & Depth

Flat, hairline-driven. Depth is tonal first, a shadow only when something truly floats.

- **Level 0, Canvas:** Concrete. All rows, bays and sections.
- **Level 1, Surface:** Chalk with a 1px Seam border. Inputs, document previews, inline panels.
- **Level 2, Raised:** popovers and menus: a single ambient shadow (0 8px 24px at 12% Tyre) plus the 1px Seam hairline.
- **Level 3, Sheet:** bottom sheets and dialogs: a scrim (Tyre at 40%) and a soft upward shadow (0 -8px 32px at 14% Tyre).
- **Dark theme:** no shadows; steps in lightness plus the 1px line.

**The Hairline Rule.** Structure is made with 1px Seam lines, not boxes. If a section needs a box to be understood, its hierarchy is wrong.

No glassmorphism and no backdrop blur. No gradients; the only translucent layer is the sheet scrim.

## Shapes

Modest, exact, consistent. Large radii read as consumer-soft; none appear.

- **0px** on full-bleed phone vehicle photographs and document viewers (edge to edge).
- **2px** document thumbnails, so they read as paper.
- **4px** the plate chip and desktop vehicle photographs.
- **6px** buttons, inputs, tags, menu items.
- **8px** popovers and menus.
- **14px** top corners of bottom sheets only.
- **Full round** only for the 8px status mark. There are no pill buttons, no pill filters, no pill-shaped status badges.

Borders are 1px. Focus is a 2px Petrol ring with 2px offset (Petrol Lit in dark theme), visible on every interactive element, always.

## Components

These are directional behaviours for the first build, not a finished library. The library stays small and reusable: nothing here is for one screen only.

- **Vehicle bay.** Photograph (16:10 on phones, full-bleed), model name in Pit Board-weight type beneath it, the plate chip, Figure M odometer, and the Pit Board sentence in one line or two. A small status mark leads the sentence. No box, no shadow, a hairline below. Pressed state: the photograph settles by 1.5% and the row takes a Slab tint. With no photo: a flat paint-colour field with the model name set large, and no silhouette.
- **Plate chip.** 4px radius, 1.5px Tyre border, white ground, registration set in the Plate style and grouped by its parts ("KA 01 AB 1234"). Single line by default. A two-line variant for two-wheelers and a plate-colour variant by registration category (for example electric vehicles) are open refinements to verify against real plates.
- **Status indicator.** An 8px round mark plus words, in the status colour, as a line of text, never a pill: "● Insurance expires in 18 days". Colour is never the only signal; the words and the position carry the meaning.
- **Pit Board.** The verdict sentence at Pit Board scale. Shows the single most urgent item; below it, a quiet "+2 more" opens the full attention list. When all is well it reads "All clear" with the next upcoming item as a secondary line.
- **Document row (Glovebox).** A 40×52 thumbnail of the first page (2px radius), the document type as the title, the issuer and validity as the secondary line, the status sentence on the right, and a chevron. Sorted by urgency, then by type. Current documents on top, older renewals in a collapsed "History" group. Tapping opens a full-screen viewer with pinch zoom, Share and Download as large targets. Each field carries a small provenance marker ("From the document" or "Entered by you") so extraction can later fill fields without confusing the owner. The Glovebox section opens with the compartment motion.
- **Timeline entry (Service Records, the logbook).** A left margin carries the odometer reading in Figure M with the date beneath it; a thin vertical rail joins entries; the right column holds workshop, service type, and a collapsed "Work done"; problems found and "Carry to next service" items appear as short lines. No cards. The block above the timeline answers the three questions directly: last service (when, where), next due (at what reading and by what date), and what to take up with the workshop.
- **Issue row.** A single line of text, "Noticed 3 weeks ago", an optional photo thumbnail, and a quiet "Will come up at next service" marker. Add takes one field. A **Workshop list** view shows only the open issues in large type for use at the service desk.
- **Odometer row.** Date, reading in Figure M, the change since the previous reading ("+312 km in 9 days") and an optional note or source. No chart in the MVP.
- **Buttons.** Primary: Petrol fill, white text, 6px radius, 44px tall on phones and 32px on desktop. Secondary: Chalk fill with a Control Edge border. Ghost: text only, Petrol. Destructive: text in vermilion that asks for confirmation. One primary per view. The docked Add button is the one place a primary button floats.
- **Inputs.** 44px tall on phones (32px desktop), 6px radius, Control Edge border, labels above (never floating), 16px text. Numeric fields use the numeric keypad and show the last value as a placeholder. Dates default to today and open the native picker. Errors name the fix ("Reading is lower than the last one, 45,210 km") in vermilion text beneath the field.
- **Bottom sheet.** Grabber, 14px top corners, a title, the form, and one primary action at the bottom within thumb reach. Dismiss by swipe, scrim tap or Escape.
- **Vehicle switcher.** On phones, a sheet listing each vehicle as plate chip plus model plus its Pit Board in one line. On desktop, the sidebar and the command palette.
- **Command palette (desktop).** A centred 8px-radius panel, a single input, grouped results (Vehicles, Documents, Actions), keyboard-only navigable, with shortcut hints at the right.
- **Empty states.** Short, specific and a little wry, each with one action: "Empty garage. Wheel something in." with Add a vehicle; Glovebox: "Nothing in the Glovebox yet." with Upload a document; Issues: "Nothing nagging you." with Add an issue. No illustrations.
- **Toasts.** One line at the bottom, above the tab bar, 3 seconds, with Undo where reversible: "Logged. 45,210 km." "Filed in the Glovebox." "Noted. It'll be on the list for your next service."
- **Sync state (conditional on the offline decision).** If offline use is confirmed: a quiet "Saved on this phone, will sync" mark on queued items and a thin offline indicator in the header. The language stays plain.
- **Icons.** One family at 20px with a 1.5px stroke and square-ish joins to match the plate and the grid (a library such as Phosphor Regular is the working assumption) [to be resolved during implementation]. Document types use typographic monograms (RC, INS, PUC) set in the plate style rather than icons.

## Do's and Don'ts

**Do**
- **Do** make the vehicles the largest, first, most visual objects on the Garage.
- **Do** write status as a sentence in the owner's units, and show a date or reading beside a relative phrase on detail screens.
- **Do** give every colour exactly one job.
- **Do** let structure come from type scale, spacing and hairlines.
- **Do** keep common actions to three taps or fewer and reachable by the thumb.
- **Do** keep the F1 reference to naming, microcopy and motion, at most one wink per screen.
- **Do** design the phone layout first, then re-compose, not enlarge, for desktop.

**Don't**
- **Don't** look like Linear, a fleet-management product, a finance or analytics dashboard, an F1 website, a racing game or a telemetry screen.
- **Don't** put elements in floating, rounded cards; do not stack big KPI tiles; do not add charts for their own sake.
- **Don't** use purple or blue AI gradients, glassmorphism, fake 3D vehicle art, carbon-fibre texture or checkered flags.
- **Don't** use red for being automotive or urgent-looking. Red means expired or overdue, and only that.
- **Don't** use abbreviations or percentages where a sentence will do ("18D", "92%").
- **Don't** put a table that scrolls sideways on a phone.
- **Don't** rely on colour alone for any status.
- **Don't** show a lie: a stale distance without its freshness, or sample data that is not labelled as sample.
