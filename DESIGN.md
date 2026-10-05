---
name: Pit Stop Dash
description: A beautifully designed digital garage for Indian vehicle owners. Linear's discipline, a confident automotive voice, and a quiet F1 wink.
colors:
  concrete: "#f4f5f2"
  chalk: "#ffffff"
  slab: "#e9ece6"
  seam: "#dfe2dc"
  seam-strong: "#c3c8bf"
  control-edge: "#7f877f"
  tyre: "#111613"
  asphalt: "#454d47"
  gravel: "#5e665f"
  petrol: "#0f4a47"
  petrol-deep: "#0a3836"
  petrol-wash: "#dcebe8"
  clear: "#2a7048"
  clear-wash: "#e1f0e6"
  soon: "#8a4f00"
  soon-mark: "#d98a00"
  soon-wash: "#fbe7bf"
  overdue: "#b83220"
  overdue-wash: "#fbe3de"
  garage-night: "#0d1110"
  night-surface: "#141a18"
  night-raised: "#1c2421"
  night-seam: "#26302c"
  night-ink: "#ecefea"
  petrol-lit: "#58c2b8"
typography:
  display:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 700
    lineHeight: "2.25rem"
    letterSpacing: "-0.025em"
  pit-board:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 650
    lineHeight: "2rem"
    letterSpacing: "-0.02em"
  section:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "1.75rem"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: "1.375rem"
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  label:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: "1rem"
  figure-xl:
    fontFamily: "Barlow Semi Condensed, Barlow Fallback, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 600
    lineHeight: "3.25rem"
    fontFeature: "'tnum' 1, 'lnum' 1"
  figure-m:
    fontFamily: "Barlow Semi Condensed, Barlow Fallback, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    fontFeature: "'tnum' 1, 'lnum' 1"
  plate:
    fontFamily: "Barlow Semi Condensed, Barlow Fallback, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  doc: "2px"
  plate: "4px"
  control: "6px"
  popover: "8px"
  sheet: "14px"
spacing:
  "0": "2px"
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "72px"
components:
  button-primary:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.petrol-deep}"
  button-secondary:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.tyre}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-ghost:
    textColor: "{colors.petrol}"
    rounded: "{rounded.control}"
    padding: "0 8px"
  button-danger:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.overdue}"
    rounded: "{rounded.control}"
  button-docked-add:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.control}"
    padding: "0 18px 0 14px"
    height: "48px"
  input:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.tyre}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "44px"
  plate-chip:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.tyre}"
    typography: "{typography.plate}"
    rounded: "{rounded.plate}"
    height: "32px"
  sheet:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.tyre}"
    rounded: "{rounded.sheet}"
  selected-row:
    backgroundColor: "{colors.petrol-wash}"
    textColor: "{colors.tyre}"
---

# Design System: Pit Stop Dash

Every value below was read from the shipped stylesheets and components (`src/styles/*.css`, `src/features/*`, `src/ui/*`, `src/lib/colour.ts`). Where the build moved a seed value, the build is recorded here.

## Overview

**Creative North Star: The Well-Kept Garage.** The product feels like the garage of someone who loves their cars and keeps a good logbook: orderly, a little proud, nothing in the wrong place, and every drawer opens at once. It is a working tool first (Operate mode), so the world lends four things only: type, palette, density and one signature move. It never supplies the layout, navigation model or controls, which stay as standard and legible as the best tools in the category.

**"Bold Linear", defined.** Linear's discipline (strict hierarchy, hairline borders, flat quiet surfaces, tight spacing, fast and exact interactions) with four things turned up: type scale (louder headings, instrument-sized numerals), contrast (true ink on a tinted ground), vehicle imagery (the vehicle is the hero, full-bleed on phones), and personality (microcopy, never ornament). Boldness comes from typography, spacing, scale, contrast and composition, not decoration.

**Light by default, dark by system.** The owner is on a phone in direct sun, so light is the default theme. A tuned dark theme follows the system setting; it is a re-lit palette, not an inversion. Both ship.

**Signature move: the Pit Board.** Each vehicle carries one sentence of verdict at display scale, leading each bay and each vehicle page. It is the one thing to know this lap, made typographic. The press-settle on a bay photograph is its physical companion.

**Supporting primitive: the Plate.** The registration number is set as a plate chip in plate lettering. It names a vehicle in the sidebar, switcher, palette, toasts and document headers. No other element imitates a physical object.

**Key Characteristics:**
- Flat, hairline-driven, content directly on the canvas; no cards.
- One brand colour (Petrol), three status colours, a green-grey tinted neutral ground.
- Geist for voice, Barlow Semi Condensed only for readings and plates.
- Photographs edge to edge on phones; an owner-chosen, calmed paint field when there is no photo.
- Phone designed first; desktop re-composes with a sidebar, palette, properties rail and master-detail panes.

## Colors

A restrained shell with committed jobs: one brand colour, a cool concrete neutral set, three status colours. Paint colour appears only inside vehicle imagery.

### Primary
- **Petrol** (#0f4a47): the one brand colour. Primary buttons, links, selection, the focus ring, the active-tab underline, the docked Add button. **Petrol Deep** (#0a3836) is the pressed and hover state; **Petrol Wash** (#dcebe8) is the selected-row, active-pane and current-sidebar tint.

### Neutral
- **Concrete** (#f4f5f2): the canvas, cool and green-grey, never cream, never pure white.
- **Chalk** (#ffffff): raised surfaces only: sheets, popovers, inputs, secondary buttons, document paper.
- **Slab** (#e9ece6): sunk wells, hover rows, pressed states, loading skeletons.
- **Seam** (#dfe2dc): hairline dividers. **Seam Strong** (#c3c8bf): outlines on non-interactive objects and document edges.
- **Control Edge** (#7f877f): the border of inputs, choice faces and secondary buttons.
- **Tyre** (#111613): primary text, plate lettering and the toast ground.
- **Asphalt** (#454d47): secondary text.
- **Gravel** (#5e665f): tertiary text, timestamps, captions, placeholders. Darkened from the seed (#646c66) so it clears 4.5:1 on Petrol Wash and Slab selected states.

### Status
Status is always paired with words, never colour alone.
- **Clear** moss (#2a7048, wash #e1f0e6): a mark only; the sentence stays ink.
- **Due soon** amber (text #8a4f00, mark #d98a00, wash #fbe7bf): coloured sentence text and mark.
- **Overdue** vermilion (#b83220, wash #fbe3de): coloured sentence text and mark; also error text and the destructive label.
- **Info** is an ink mark with an ink sentence. **Neutral** is Asphalt text with a hollow ring mark.

### Dark theme (follows system)
Concrete becomes **Garage Night** (#0d1110); surfaces step lighter, not shadowed: Surface (#141a18), Sunk (#1c2421), Seam (#26302c), Seam Strong (#34403b), Control Edge (#6b756e). Ink (#ecefea), Ink-2 (#a5aea7), Ink-3 (#8a948d). Petrol lifts to **Petrol Lit** (#58c2b8) with pressed #7ad3ca, wash #12302d, and button text #06201e. Status: moss #5cc48a, amber #f0b050, vermilion #ff7a63. No neon, no glow.

### Named Rules
**The One Job Rule.** Petrol marks what you can act on. Status colours mark state. Paint colour lives in vehicle imagery. Plate colours live in the plate chip. A colour doing a second job is wrong.

**The Quiet Red Rule.** Red appears only when something is expired or overdue (or an input error). Nothing is red for being automotive or urgent-looking.

**The Sentence-Only Rule.** Colour reaches the words of a status sentence only for soon and overdue. Clear, info and neutral sentences stay ink (or Asphalt) and carry their state in the 8px mark.

**The Calmed Paint Rule.** A paint field never outshouts a status colour: its saturation is capped at 30% in code, hue and lightness kept.

## Typography

**UI Font:** Geist Variable (with ui-sans-serif, system-ui, Segoe UI, Roboto)
**Figure Font:** Barlow Semi Condensed 500/600/700 (with a size-adjusted Arial Narrow / Roboto Condensed fallback)

**Character:** Geist is the confident workhorse voice, tight-tracked at display sizes. Barlow, drawn from highway signage and number plates, is the instrument: it sets readings and plates and never prose. Latin script only.

### Hierarchy
Phone size first, then the desktop value at 1024px and above with a fine pointer.
- **Display** (700, 34/36, -0.025em; desktop 44/46): vehicle model on its page.
- **Pit Board** (650, 26/30, -0.02em; desktop 32/40): the one-sentence verdict. Long sentences step down to 20/28 (desktop 22/30).
- **Section** (700, 24/28, -0.02em; desktop 26/30): section headings in real words.
- **Title** (600, 17/22; desktop 15/20): row titles, document names.
- **Body** (400, 16/24; desktop 14/20): text and inputs (16px on phones prevents input zoom).
- **Label** (500, 13/16; desktop 12/16): field labels, metadata.
- **Figure XL** (Barlow 600, tabular lining, 56/52; desktop 72/64): the current odometer.
- **Figure M** (Barlow 600, 28/28; desktop 24/24) and **Figure S** (20/20): readings in lists, tiles, logbook margin. A small Geist unit ("km") follows in Gravel.
- **Plate** (Barlow 600, +0.08em): 15px, 17px and 22px by chip size.

Numbers use Indian digit grouping (en-IN). Dates carry the month as a word.

### Named Rules
**The Sentence Rule.** Section headings are real words at real size. Small uppercase tracked labels are not used as headings.

**The Instrument Rule.** A number that is a reading of the vehicle is set in the figure face. A count or date inside prose is body text.

## Layout

Operate mode: a clean aligned grid, consistent spacing, a real type scale.

**Spacing.** 4px base. Steps 2, 4, 8, 12, 16, 24, 32, 48, 72. Phone gutter 16px (24px on desktop). Blocks are separated by 32px; touch targets are 44px (32px on fine-pointer desktop).

**Surface logic.** The page is the canvas. Content sits directly on it as rows separated by 1px hairlines, rows at least 56px (44px desktop). Floating containers are reserved for sheets, popovers, menus and the palette. A vehicle is not a card.

**Phone (under 1024px, designed first).**
- *Garage:* a single column of full-bleed 16:10 bays: photograph, then model (24/28), make, the plate chip left and Figure M odometer right, then the Pit Board sentence at 20/26. Hairline between bays. An optional one-line "Needs you" fold sits above the first bay.
- *Vehicle page:* a 56px sticky compact header (back, plate chip plus model that opens the vehicle switcher), then the identity block and Pit Board, then a sticky segmented strip of five labels (Overview, Glovebox, Service, Issues, Odometer) with a 2px Petrol underline on the current one. The five labels fit at 390px; on narrower phones the strip scrolls with a right-edge fade. It is not a bottom tab bar.
- *Docked Add:* one 48px Petrol button fixed bottom-right whose label follows the tab: Add (Overview), Upload (Glovebox), Log service (Service), Add issue (Issues), Add reading (Odometer). Actions it covers are hidden on phone (`desktop-only`). Pages reserve 96px of bottom padding.
- *Sheets over pages:* adding happens in a bottom sheet; from 640px it becomes a centred dialog (520px, 720px for tall ones).
- No-photo vehicles on phones show a 104px paint band carrying only the model name; the hero carries an underlined "Add a photo" text link.
- No horizontal scrolling of content.

**Desktop (1024px and up with a fine pointer).**
- A 248px sticky **sidebar**: brand, a search field showing the palette shortcut, My Garage, then each vehicle as name plus plate chip with a status dot for soon or overdue.
- A **command palette** (Ctrl/Cmd+K), 640px wide, ranked search with grouped results. Outside the palette, single keys: g (garage), a (add), 1 to 5 (sections). Hints appear in the palette footer only.
- Vehicle page max 1320px: a 320px photo beside identity and Pit Board; below, tabs and the main column (Overview capped at 760px) with a 300px **properties rail** at 1280px and above (a collapsed Details block on narrower widths).
- On sub-tabs the identity collapses to a **one-line strip** (112px photo, 28px model, smaller Pit Board; variant, fuel and actions hidden).
- **Glovebox** is master-detail (360px list, live document pane, sticky); **Service** splits the logbook and the selected record into two equal columns.
- The Garage is an auto-fill grid of bays, minimum 300px, 48px by 32px gaps. Density tightens: body 14px, control 32px, buttons 13px.

## Elevation & Depth

Flat and hairline-driven; depth is tonal first, with a shadow only where something truly floats. There are no gradients for decoration (the only gradient is the mask that fades the right end of the section strip), no glass and no blur.

### Shadow Vocabulary
- **Pop** (`box-shadow: 0 8px 24px rgb(17 22 19 / 0.12)`): popovers, the palette, centred dialogs, toasts, the docked Add button.
- **Sheet** (`box-shadow: 0 -8px 32px rgb(17 22 19 / 0.14)`): phone bottom sheets, over a scrim of Tyre at 40%.
- **Dark theme:** both shadows become a 1px line ring; the scrim is 60% black.
- **Light paint edge:** a no-photo field with light paint gets an inset 1px Seam Strong so it keeps an edge.
- **Selected swatch:** a 2px canvas gap plus a 2px Petrol ring.

### Named Rules
**The Hairline Rule.** Structure is made with 1px Seam lines, not boxes. If a section needs a box to be understood, its hierarchy is wrong.

## Shapes

Modest, exact, consistent. Large radii read as consumer-soft; none appear.

- **0px** full-bleed phone photographs, paint bands, and the phone document viewer screen.
- **2px** document thumbnails and the document paper, so they read as paper.
- **4px** plate chip, desktop photographs, count badges, swatches, skeleton bars, checkboxes on issues.
- **6px** buttons, inputs, choice faces, menu items, toasts.
- **8px** popovers, the palette, centred dialogs.
- **14px** top corners of phone bottom sheets only.
- **Round** only for the 8px status mark and sidebar dot. No pill buttons, filters or badges.

Borders are 1px (plate 1.5px Tyre). Focus is a 2px Petrol ring, 2px offset (Petrol Lit in dark), on every interactive element; inputs draw it flush.

## Components

### Buttons
- **Shape:** 6px radius, 15px type at 600 (13px on desktop), 44px tall on phones, 32px on desktop.
- **Primary:** Petrol fill, white text, 16px side padding; hover Petrol Deep. One per view. Disabled turns Slab with Gravel text.
- **Secondary:** Chalk fill, Control Edge border, hover Slab.
- **Ghost / link:** Petrol text; links are underlined with 1px weight. **Danger:** vermilion text on Chalk with Control Edge border, hover overdue wash.
- **Docked Add:** the one floating primary: 48px, 16px/650 label with a plus, Pop shadow, scales to 97% when pressed.

### Plate chip
White ground, 1.5px Tyre border, 4px radius, Barlow 600 with +0.08em tracking, one line. Heights 26 / 32 / 40px (sm, md, lg) with 15 / 17 / 22px lettering; the dense sidebar uses 22px (collapsing to 18px beneath a vehicle name). It stays white-and-black in dark theme, like a real plate. No two-line two-wheeler plate and no plate-colour variants were built.

### Status line
An 8px round mark plus words, as a line of text, never a pill. Only soon and overdue colour the sentence; dates after it stay Gravel. A "+N more" or, on the vehicle page, "and N more things" trailer sits in Gravel at a smaller size.

### Pit Board
The verdict sentence at Pit Board scale, with one action button beneath it (for example "Upload the new PUC"). Other obligations are counted only in "and N more things"; long sentences step down to the smaller size. A sentence links to the tab it concerns.

### Vehicle bay and imagery
Photograph at 16:10, model, make, plate and odometer, Pit Board line. Pressed, the photograph settles to 98.5% scale. No box, no shadow. With no photo: a field of the owner's paint with saturation capped at 30%, make (80% opacity) and model set large at the bottom-left in black or white by lightness; on phones a 104px band with the model only.

### Rows, logbook and documents
Rows are hairline-separated with a Slab hover and a Petrol Wash active state. A document row is a 40x52 thumbnail (2px, monogram fallback), type as title, validity as secondary, status on the right. The logbook puts the odometer reading and date in a right-aligned margin, a 1px rail with a hollow 9px node, then workshop text with carry-forward lines; no cards. Opening a document on phones slides a full screen in from the right; on desktop it fills the sticky pane.

### Inputs and choices
44px (32px desktop), 6px radius, Control Edge border, labels above, 16px text on phones. Focus draws a 2px Petrol outline. Errors are vermilion text beneath the field plus a vermilion border. Figure and plate inputs use Barlow at 36px / 24px. Choices are radios drawn as chips, rows or a two-column grid; checked uses Petrol Wash with a Petrol inset ring.

### Bottom sheet and toast
Sheet: grabber, title, scrolling body, a footer with the primary action over a hairline; Escape, scrim or drag dismiss. A toast is a Tyre bar (inverted in dark) above the docked button, with an underlined Undo.

### Command palette and sidebar
The palette is a centred 8px-radius panel with a 52px input, grouped results (selected row in Petrol Wash), and a footer of shortcut hints in small keycaps. The sidebar items are 32px with a Petrol Wash current state.

### Motion
Fast and exact, ease-out (cubic-bezier 0.22, 1, 0.36, 1), no bounce. Implemented: bottom-sheet rise (260ms) and dialog entry, toast arrival (240ms), the phone document screen sliding in (220ms), the bay press-settle (150ms), disclosure caret rotation (150ms), image fade-in (250ms), 120ms colour transitions on controls. Under reduced motion, movement is dropped and a 120ms fade remains; the spinner breathes in opacity instead of rotating.

### Icons
Phosphor Regular, one family. Document types use typographic monograms in plate-style lettering.

## Do's and Don'ts

### Do:
- **Do** make the vehicle the largest, first, most visual object on the Garage.
- **Do** write status as a sentence, colouring the words only for soon (amber) and overdue (vermilion).
- **Do** give every colour exactly one job.
- **Do** build structure from type scale, spacing and 1px hairlines.
- **Do** keep the Pit Board to one sentence with at most one action button.
- **Do** set readings in Barlow with tabular lining figures.
- **Do** design the phone first, then re-compose, not enlarge, for desktop.
- **Do** keep Gravel (#5e665f) as the lowest-contrast text, and 13px (12px on desktop) as the smallest.

### Don't:
- **Don't** put vehicles in floating, rounded cards or stack KPI tiles.
- **Don't** use a bottom tab bar for sections; the strip under the header does that job.
- **Don't** use red for anything but expired, overdue or an input error.
- **Don't** use gradients, glass, blur, fake 3D, carbon texture or checkered flags as decoration.
- **Don't** let a paint field exceed 30% saturation.
- **Don't** use pill shapes, or a radius above 14px.
- **Don't** rely on colour alone for any status.
- **Don't** use abbreviations or percentages where a sentence will do.
- **Don't** claim motion the build lacks (odometer ticking, Glovebox drop-in, Pit Board cross-fade).
