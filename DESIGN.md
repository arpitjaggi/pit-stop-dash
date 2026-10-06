---
name: "Pit Stop: Vehicle Management Portal"
description: A personal digital garage under a chequered-flag logomark in scarlet, where every vehicle wears its own paint, one ink panel says what to do, and yellow means look here.
colors:
  brand: "#dc0000"
  brand-dark: "#e5231c"
  brand-press: "#b80000"
  brand-press-dark: "#c91a14"
  brand-wash: "#ffe4e0"
  brand-wash-dark: "#3f1512"
  on-brand: "#ffffff"
  accent: "#ffd21f"
  on-accent: "#17140f"
  paper: "#f2eee6"
  paper-dark: "#12100d"
  card: "#ffffff"
  card-dark: "#1d1a16"
  well: "#f8f5ef"
  well-dark: "#26221d"
  sunk: "#ece7dc"
  sunk-dark: "#171512"
  line: "#e4ded2"
  line-dark: "#2e2a24"
  line-strong: "#d3cbbb"
  line-strong-dark: "#433d34"
  edge: "#8a8272"
  edge-dark: "#7d7567"
  ink: "#17140f"
  ink-dark: "#f6f1e8"
  ink-2: "#4b463d"
  ink-2-dark: "#c4bcad"
  ink-3: "#665f52"
  ink-3-dark: "#a0988a"
  focus: "#17140f"
  focus-dark: "#ffd21f"
  panel: "#1b1814"
  panel-dark: "#0a0908"
  on-panel: "#ffffff"
  on-panel-2: "#cfc7b8"
  panel-line: "#3a352d"
  panel-line-dark: "#4a4439"
  panel-clear: "#7ee2a8"
  panel-soon: "#f2b66b"
  panel-overdue: "#ffd21f"
  clear: "#067647"
  clear-dark: "#6edba0"
  clear-mark: "#12b76a"
  clear-mark-dark: "#6edba0"
  clear-wash: "#d9f5e4"
  clear-wash-dark: "#123626"
  soon: "#7a4a00"
  soon-dark: "#f2b66b"
  soon-mark: "#c77d00"
  soon-mark-dark: "#f2b66b"
  soon-wash: "#fff0c2"
  soon-wash-dark: "#33270a"
  overdue: "#17140f"
  overdue-dark: "#ffd21f"
  overdue-mark: "#f5b800"
  overdue-mark-dark: "#ffd21f"
  overdue-wash: "#ffd93d"
  overdue-wash-dark: "#ffd21f"
  danger: "#b42318"
  danger-dark: "#ff9a8c"
  danger-wash: "#ffe1dd"
  danger-wash-dark: "#3f1814"
  plate-private: "#ffffff"
  plate-commercial: "#f7c600"
  plate-ev: "#0a6b36"
  plate-ev-edge: "#064d26"
  plate-rental: "#17140f"
  plate-ind-strip: "#1b3a8a"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: "2.5rem"
    letterSpacing: "-0.035em"
  pit-board:
    fontFamily: "Bricolage Grotesque Variable, Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.025em"
  section:
    fontFamily: "Bricolage Grotesque Variable, Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "1.75rem"
    letterSpacing: "-0.03em"
  make:
    fontFamily: "Bricolage Grotesque Variable, Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 300
    lineHeight: "1.25rem"
    letterSpacing: "-0.01em"
  model:
    fontFamily: "Bricolage Grotesque Variable, Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 9.5vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: "1.375rem"
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  label:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: "1rem"
  figure-xl:
    fontFamily: "Barlow Semi Condensed, Barlow Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 600
    lineHeight: "3.5rem"
    letterSpacing: "0"
    fontFeature: "'tnum' 1, 'lnum' 1"
  figure-m:
    fontFamily: "Barlow Semi Condensed, Barlow Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "0"
    fontFeature: "'tnum' 1, 'lnum' 1"
  plate:
    fontFamily: "Barlow Semi Condensed, Barlow Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  doc: "6px"
  plate: "6px"
  control: "14px"
  inner: "16px"
  popover: "18px"
  card: "24px"
  sheet: "28px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  huge: "72px"
  gutter: "16px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.brand-press}"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-docked-add:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.popover}"
    padding: "0 22px 0 18px"
    height: "54px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  pit-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.on-panel}"
    rounded: "{rounded.card}"
    padding: "24px"
  tab-pill:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    padding: "0 14px"
    height: "42px"
  tab-pill-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
  tab-count:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.full}"
    height: "22px"
  status-strip:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inner}"
    padding: "12px 16px"
  status-strip-overdue:
    backgroundColor: "{colors.overdue-wash}"
    textColor: "{colors.ink}"
  plate-private:
    backgroundColor: "{colors.plate-private}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    height: "34px"
  plate-commercial:
    backgroundColor: "{colors.plate-commercial}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    height: "34px"
  plate-ev:
    backgroundColor: "{colors.plate-ev}"
    textColor: "{colors.on-panel}"
    rounded: "{rounded.plate}"
    height: "34px"
  plate-ev-commercial:
    backgroundColor: "{colors.plate-ev}"
    textColor: "{colors.accent}"
    rounded: "{rounded.plate}"
    height: "34px"
  plate-rental:
    backgroundColor: "{colors.plate-rental}"
    textColor: "{colors.accent}"
    rounded: "{rounded.plate}"
    height: "34px"
  switch-on:
    backgroundColor: "{colors.brand}"
    rounded: "{rounded.full}"
    width: "52px"
    height: "32px"
  wizard-segment-current:
    backgroundColor: "{colors.brand}"
    rounded: "{rounded.full}"
    height: "6px"
---

# Design System: Pit Stop: Vehicle Management Portal

## Overview

**Creative North Star: "The Pit Wall"**

A personal garage run from the pit wall: a warm paper ground, white rounded cards, one ink Pit Board that says what to do next, and a scarlet brand that acts. Every vehicle still wears its own paint as a large flat disc over a pale tint of the same colour, so the owner recognises their vehicles by colour before reading a word, then reads one plain sentence each. The chequered-flag logomark is the only place the motorsport world shows up as an image.

Colour has one job each. Scarlet acts and selects, the ink panel instructs, yellow means look at this (counts, warnings, dark-mode focus), green means clear, and a vehicle's paint identifies it. Red is deliberately kept off due dates: an overdue item is a warning octagon on a solid yellow tile, soon is an amber clock, clear is a green tick, and red is spent only on failed forms and destructive actions.

The system is phone-first and warm, confident rather than clinical. Desktop re-composes the same surfaces (sidebar, stage and ink panel side by side, properties rail, master-detail panes) instead of enlarging them. Light, Dark and System are all first-class. Fills are flat: no gradient and no glow, apart from the mask fade at the edges of the scrolling tab strip.

**Key Characteristics:**
- Warm paper ground, white cards at 24px radius, ink text, soft low shadows in light and hairline rings in dark.
- Scarlet (#dc0000) for actions and selection with white text; yellow (#ffd21f) for counts, warnings and dark-mode focus with ink text.
- One ink Pit Board panel per vehicle holding the verdict sentence and its single action.
- Status is a shape plus words: octagon on yellow tile, clock, tick. Colour reinforces and never carries it alone.
- Each vehicle's own paint: flat disc over a pale oklch tint, or the owner's photo.
- HSRP registration plates in true colours by use, with a blue IND strip, stacked on two lines for two-wheelers.
- Pill section tabs with an ink active pill, a five-step Add vehicle wizard, a pill switch, and a Reminders sheet.

## Colors

A warm paper-and-ink palette with a scarlet voice, a yellow attention colour, a green clear state and each vehicle's own paint as a guest. Light values are the base keys; dark counterparts are the `-dark` keys and mirror the same roles.

### Primary
- **Scarlet** (#dc0000, dark #e5231c; pressed #b80000, dark #c91a14; wash #ffe4e0, dark #3f1512): fills primary buttons, the docked Add button, selected choice chips, the switch when on, the current wizard segment, the selected command-palette row, text selection, action-row icon discs and the underline under text links and ghost buttons. Text on it is always white (5.5:1). It is also the logomark's tile. It never marks a due date or a warning.

### Secondary
- **Modena Yellow** (#ffd21f; ink text on it 13:1): tab count badges, numbered workshop markers, the toast Undo link, the pit panel link underline, the overdue status tile in the dark theme, and the focus ring in dark. Identical in both themes.

### Neutral
- **Paper** (#f2eee6; dark #12100d): page ground and sticky bars.
- **Card White** (#ffffff; dark #1d1a16): cards, sheets, inputs, secondary buttons.
- **Well** (#f8f5ef; dark #26221d): quiet wells inside a card, action rows, neutral status strips.
- **Sunk** (#ece7dc; dark #171512): pressed states, tab hover, segmented and switch tracks, skeletons, image ground before load.
- **Seam** (#e4ded2; dark #2e2a24) and **Seam Strong** (#d3cbbb; dark #433d34): row dividers and control borders. **Control Edge** (#8a8272; dark #7d7567) is the 3:1 border for check boxes, the switch track and control hover.
- **Ink** (#17140f; dark #f6f1e8), **Ink 2** (#4b463d; dark #c4bcad), **Ink 3** (#665f52; dark #a0988a): primary, secondary and lowest-contrast text. The focus ring is ink in light and yellow in dark.

### Pit Board
- **Panel Ink** (#1b1814; dark #0a0908), white text, secondary text #cfc7b8, border #3a352d (dark #4a4439). Panel-safe status text: clear #7ee2a8, soon #f2b66b, overdue #ffd21f, the same in both themes.

### Status
- **Overdue**: solid yellow wash (#ffd93d; dark #ffd21f) behind a warning octagon, words in ink (dark: yellow on dark surfaces), mark #f5b800.
- **Soon**: text #7a4a00 (dark #f2b66b), amber clock #c77d00, pale yellow wash #fff0c2 (dark #33270a).
- **Clear**: text #067647 (dark #6edba0), green tick #12b76a, wash #d9f5e4 (dark #123626).
- **Error and destructive only**: #b42318 (dark #ff9a8c), wash #ffe1dd (dark #3f1814). Failed fields, error notices, delete buttons.

### Plates
- Private white #ffffff with ink letters; commercial yellow #f7c600; EV green #0a6b36 with white letters (edge #064d26); EV commercial the same green with yellow letters; rental black #17140f with yellow letters. The IND strip is blue #1b3a8a with a white chakra. Plates keep these colours in both themes.

### Vehicle Paint
- Set per vehicle from its own hex (`--vc`). The tint is the paint mixed into the card colour in oklch at 34% (44% in dark); the disc is the paint at full strength. Text on a paint disc is ink or white by luminance.

### Named Rules
**The One Job Rule.** Scarlet acts and selects. Yellow says look. Ink panels instruct. Green says clear. Paint identifies a vehicle. A colour doing a second job is wrong.

**The Red Is For Errors Rule.** Red appears as a failure or a delete, never as a due date, overdue state or warning. Overdue is yellow with an octagon.

**The Shape Carries It Rule.** Overdue and soon are both yellow family, so they differ by shape and words: octagon on a solid tile, plain clock, tick. Status is never colour alone.

**The Paint Is Theirs Rule.** A vehicle's colour appears only as its tint and disc, plus the small swatch and thumbnail. It never leaks into buttons, text or status.

## Typography

**Display Font:** Bricolage Grotesque Variable (fallback Geist Variable, system sans)
**Body Font:** Geist Variable (fallback ui-sans-serif, system-ui, Segoe UI, Roboto)
**Figure/Plate Font:** Barlow Semi Condensed 600/700 (fallback Barlow Fallback: Arial Narrow or Roboto Condensed at 88% size-adjust)

**Character:** Bricolage gives a friendly, slightly quirky shop-sign voice at heading sizes with tight negative tracking; Geist stays neutral for reading; Barlow's condensed tabular figures read like instrument faces and registration plates.

### Hierarchy
Sizes are phone values; desktop (min 1024px, fine pointer) steps body down and display up.
- **Display** (700, 2.5rem/2.5rem, -0.035em; desktop 3.25rem): vehicle model on its page. Garage title is 2.25rem (desktop 2.75rem).
- **Pit Board** (600, 1.625rem/2rem; desktop 1.875rem; long sentences 1.25rem/1.75rem): the one-sentence verdict on the ink panel.
- **Section** (700, 1.5rem/1.75rem, -0.03em): real-word section headings.
- **Make / Model** (300 at 1rem over 700 at clamp(2rem, 9.5vw, 2.5rem), -0.04em): vehicle names on the paint stage.
- **Title** (600, 1.0625rem/1.375rem; desktop 0.9375rem): row and document titles.
- **Body** (400, 1rem/1.5rem; desktop 0.875rem/1.25rem): prose and inputs (16px on phones so iOS does not zoom).
- **Label** (500, 0.8125rem/1rem; desktop 0.75rem): field labels and metadata. Sentence case.
- **Figures** (Barlow 600, tabular lining numerals): XL 3.75rem (desktop 4.75rem) for the odometer, M 1.75rem, S 1.25rem; units in Geist 0.8125rem Ink 3.
- **Plate** (Barlow 600, 0.08em tracking): 0.9375 / 1.125 / 1.5rem on 26 / 34 / 42px plates.

### Named Rules
**The Instrument Rule.** A reading of the vehicle (odometer, plate, kilometre figure) is set in Barlow with tabular lining figures. A count or date inside prose is body text.

**The Make-Light Rule.** Wherever make and model appear as a pair in display type, the make is weight 300 and the model weight 700.

## Layout

Phone is a single column with a 16px gutter (24px on desktop). Spacing is a 4px base: 2, 4, 8, 12, 16, 24, 32, 48, 72. Controls are 48px tall on touch and 36px on desktop with a fine pointer; the minimum tap target is 44px (36px on desktop).

Garage: a stack of vehicle cards on phones, an auto-fill grid with 320px minimum columns on desktop (max width 1320px). Vehicle page: a sticky 56px bar, a stage card with the ink Pit Board directly below, a sticky pill tab strip, then white section cards. At 1024px a 264px sidebar appears, the stage and Pit Board sit side by side (1.1fr / 1fr), and a 320px sticky properties rail joins the Overview. Past the Overview the header collapses to one strip. Documents and Service become master-detail panes. Sheets (including Reminders) are bottom sheets on phones and centred dialogs from 640px (520px wide, 720px tall variant). The Add vehicle wizard is a full-height column on phones with a sticky action bar, and a 720px centred column on desktop.

Cards stack with 16px between them and are never nested inside other cards.

## Elevation & Depth

Depth is tonal first, shadow second. Light cards lift with a soft two-layer shadow; dark drops shadows for a 1px hairline ring.

### Shadow Vocabulary
- **Card** (`0 1px 2px rgb(23 20 15 / 0.05), 0 10px 28px rgb(23 20 15 / 0.07)`; dark `0 0 0 1px line`): every white card.
- **Pop** (`0 12px 36px rgb(23 20 15 / 0.18)`; dark `0 0 0 1px line-strong, 0 16px 40px rgb(0 0 0 / 0.5)`): command palette, desktop dialogs, toasts, docked Add.
- **Sheet** (`0 -12px 40px rgb(23 20 15 / 0.2)`; dark `0 0 0 1px line-strong`): phone bottom sheets.
- Scrim is `rgb(23 20 15 / 0.45)` (dark `rgb(0 0 0 / 0.62)`).

### Named Rules
**The Flat Colour Rule.** Fills are flat. No gradients, glows, blurs or glass. The single exception is the mask-image fade on the scrolling tab strip, which reveals clipped tabs and paints nothing.

**The Soft Shadow Rule.** Shadows are low, diffuse and ink-tinted. Never hard offset, never coloured.

## Shapes

Soft and rounded, in a clear ladder: 24px cards and desktop dialogs, 28px sheet top corners, 18px popovers and the docked Add, 16px inner wells, rows, status strips and thumbnails, 14px controls (buttons, inputs, sidebar items), 6px plates and document thumbnails, and full pills for tabs, chips, the segmented control, the switch, wizard segments and icon buttons. Vehicle thumbnails without a photo are circles. Check boxes are 9px-radius squares. The logomark is a 16/64 rounded tile. The paint disc is a true circle partly clipped by the stage edge (54% wide, offset right and above; 62% on the hero). Borders are 1.5px on controls, 1px for dividers. Focus is a 3px ring with 2px offset on every interactive element.

## Components

### Buttons
- **Shape:** 14px radius, 48px tall (36px desktop), 24px side padding (16px desktop), weight 650, 1.5px border.
- **Primary:** scarlet fill, white text; hover #b80000; press scales to 0.98. Disabled turns sunk with Ink 3 text.
- **Secondary:** white fill, strong seam border, ink text; hover border goes ink.
- **Dark:** ink fill, card-coloured text.
- **Ghost / link:** ink text with a 2 to 3px scarlet underline; hover fills with scarlet wash.
- **Danger:** error-red text on card; hover fills the error wash.
- **Docked Add:** the single floating action on phones, 54px, 18px radius, scarlet, bottom-right, pop shadow.

### Pit Board (signature)
The ink panel (24px radius, 24px padding, 1px panel border) holds the verdict sentence in display type with a status mark in the panel-safe colour, and at most one action. Links in it are white with a yellow underline. One per vehicle page; in the collapsed strip it shrinks to 18px radius and a 1rem sentence.

### Status Marks (signature)
A line is a mark plus a sentence. Overdue: warning octagon on a 1.5em solid yellow tile (0.4em radius), words weight 700. Soon: amber clock, 1.25em. Clear: green filled tick, 1.2em. Neutral: hollow ring. The strip variant fills the width with the status wash, 16px radius, weight 600; info uses the scarlet wash.

### HSRP Plate (signature)
A plate with a blue IND strip (chakra, and the letters IND from the 34px size up), then the registration in Barlow with 0.08em tracking. Tone follows use and fuel: private white, commercial yellow, EV green, EV commercial green with yellow letters, rental black with yellow letters. Two-wheelers set the number on two lines (52px and 64px at the two larger sizes). Heights 22 (sidebar), 26, 34, 42px; 6px radius, 1.5px edge; a hairline ring appears in dark.

### Paint Stage (signature)
Vehicle imagery is the owner's photo (cover-fit, fades in) or a paint stage: pale oklch tint, flat disc, make over model in the Make-Light pairing. Thumbnails are a full paint circle with a monogram in Barlow. 16:9 on garage cards, 2:1 hero on phones, 16:9 on desktop.

### Logomark
The chequered flag on a scarlet 16/64 rounded tile (white pole, 4-column by 3-row ink and white squares). It is the app's only logo: sidebar brand, sign-in and demo gate, favicon and app icons. It is used as a logo only, never as a pattern, divider, background or status mark.

### Cards / Containers
- **Corner Style:** 24px. **Background:** white (dark #1d1a16). **Shadow:** Card. **Padding:** 24px, 16px between stacked cards. Rows use 1px seam dividers, minimum 56px tall (48px desktop).

### Tabs
Pill section tabs on the paper ground: 42px tall (38px desktop), 14px side padding, weight 650, Ink 2 text; hover fills sunk; the active pill is ink with card-coloured text. Count badges are yellow with ink text. The strip scrolls horizontally with snap and a mask fade at clipped edges.

### Inputs / Fields
- **Style:** white, 1.5px strong-seam border, 14px radius, 48px tall, label above in 0.8125rem weight 600 Ink 2.
- **Focus:** 3px focus ring and ink border. **Error:** error-red border and message. Figure inputs (odometer) use Barlow at 2.5rem; plate inputs use Barlow, uppercase, 0.08em tracking.
- **Choice chips:** full pill, strong-seam border; checked is scarlet with white text and an ink border. The grid variant uses 16px-radius tiles with a display-font label.

### Switch
A 52 by 32px pill: sunk track with a Control Edge border and an ink thumb; checked is a scarlet track with a white thumb that travels 20px. Focus is a 3px ring at 3px offset; busy dims it to 60%.

### Add Vehicle Wizard
Five steps. A progress bar of five 6px pill segments (done ink, current scarlet, upcoming sunk), a "Step n of 5" count in Ink 3, a display-font step title, a panel that slides in 18px from the direction of travel, and a sticky bottom action bar with a flexing scarlet Next. Reduced motion swaps the slide for a 120ms fade. The registration step previews the live plate.

### Reminders Sheet
A standard sheet of 16px-radius well rows (64px minimum): icon, title and subtitle, and a switch at the end, followed by a short list of upcoming dates in Geist with figures in Barlow.

### Navigation
Sidebar items are 40px, 14px radius; current page is ink with card-coloured text; vehicles list a 10px paint swatch, name and plate with a status mark. Command palette: 640px, 24px radius; the selected row is scarlet. Theme control is a pill segmented control (Light, Dark, System); the active segment is ink.

### Theming
Light, Dark and System. Choosing Light or Dark sets `data-theme` on the root; System follows the device. The browser theme-color is #F2EEE6 in light and #12100D in dark. Motion uses one ease (`cubic-bezier(0.22, 1, 0.36, 1)`), 140ms on controls, 280ms sheets; reduced motion drops movement and keeps a short fade.

## Do's and Don'ts

### Do:
- **Do** give each colour one job: scarlet acts, yellow says look, ink panel instructs, green says clear, paint identifies.
- **Do** put the Pit Board sentence in the ink panel with at most one action.
- **Do** write status as words with a shape: octagon on a solid yellow tile for overdue, amber clock for soon, green tick for clear.
- **Do** reserve red (#b42318, dark #ff9a8c) for failed forms and destructive actions.
- **Do** show registration numbers as HSRP plates in their true colours, two lines on two-wheelers.
- **Do** give a vehicle with no photo its paint stage: pale oklch tint plus a flat disc, make light over model bold.
- **Do** put white text on scarlet and ink text on yellow; set readings and plates in Barlow with tabular lining figures.
- **Do** design light and dark together; verify every new surface in both themes.
- **Do** keep cards at 24px, controls at 14px, tabs and chips as pills.
- **Do** use the owner's own photographs for imagery.
- **Do** allow the F1 influence only in naming, microcopy and motion, at most one wink per screen.

### Don't:
- **Don't** use purple or blue AI gradients, glows or any gradient fill; the tab-strip scroll-fade mask is the only gradient and it paints nothing.
- **Don't** use glassmorphism, backdrop blur or translucent panels.
- **Don't** build a racing-game or telemetry UI: no carbon fibre, no speedometer dials, no chequered patterns.
- **Don't** use stock, rendered or silhouette vehicle imagery; a vehicle is a photo or its paint stage.
- **Don't** use the chequered flag for anything but the logo.
- **Don't** put an F1 wink inside a warning, overdue or error state.
- **Don't** use red for a due date, overdue or soon state.
- **Don't** let status rely on colour alone, or let vehicle paint colour buttons, text or status.
- **Don't** nest cards inside cards or stack KPI tiles.
- **Don't** use hard offset shadows or coloured shadows.
- **Don't** use small uppercase tracked labels as headings; headings are real words in sentence case.
