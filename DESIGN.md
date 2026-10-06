---
name: Pit Stop Dash
description: A personal digital garage in a paint shop's colours, where every vehicle wears its own paint and one ink panel says what to do.
colors:
  brand: "#ffc53d"
  brand-press: "#f2b21f"
  brand-wash: "#fff1cc"
  brand-wash-dark: "#3a2f10"
  on-brand: "#17140f"
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
  focus-dark: "#ffc53d"
  panel: "#1b1814"
  panel-dark: "#0a0908"
  on-panel: "#ffffff"
  on-panel-2: "#cfc7b8"
  panel-line: "#3a352d"
  panel-line-dark: "#4a4439"
  panel-clear: "#7ee2a8"
  panel-soon: "#ffd166"
  panel-overdue: "#ff9a8c"
  clear: "#067647"
  clear-dark: "#6edba0"
  clear-mark: "#12b76a"
  clear-wash: "#d9f5e4"
  clear-wash-dark: "#123626"
  soon: "#8a4b05"
  soon-dark: "#ffc764"
  soon-mark: "#f79009"
  soon-wash: "#ffeab8"
  soon-wash-dark: "#3a2b0a"
  overdue: "#b42318"
  overdue-dark: "#ff9a8c"
  overdue-mark: "#d92d20"
  overdue-wash: "#ffe1dd"
  overdue-wash-dark: "#3f1814"
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
    rounded: "18px"
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
  status-strip:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inner}"
    padding: "12px 16px"
  plate-chip:
    backgroundColor: "#ffffff"
    textColor: "#17140f"
    rounded: "{rounded.plate}"
    padding: "0 8px"
    height: "34px"
---

# Design System: Pit Stop Dash

## Overview

**Creative North Star: "The Paint Shop"**

A personal garage that feels like a paint shop's colour wall: warm paper underfoot, white rounded cards, ink for everything that must be read, and each vehicle wearing its own paint as a large flat disc over a pale tint of the same colour. Colour has one job each. Saffron acts and selects, the ink panel instructs, vivid washes with words report status, and a vehicle's paint identifies it. The owner recognises their cars by colour before reading a word, then reads one plain sentence per vehicle.

The system is phone-first and warm, confident rather than clinical. Desktop re-composes the same surfaces (sidebar, side-by-side stage and ink panel, properties rail, master-detail panes) instead of enlarging them. Light, Dark and System are all first-class; the dark theme is warm charcoal with lifted cards and the same saffron.

It is flat colour throughout. No gradient, no glow, no glass. The only gradient in the build is a functional scroll-fade mask on the vehicle tab strip.

**Key Characteristics:**
- Warm paper ground, white cards at 24px radius, ink text, soft low shadows in light and hairline rings in dark.
- One brand colour (saffron #ffc53d) for actions and selection; ink text on it.
- One ink "pit panel" per vehicle holding the Pit Board sentence and its single action.
- Status is a vivid wash plus words and a mark; colour never carries it alone.
- Each vehicle's own paint: flat disc over a pale oklch tint, with no photo; the owner's photo when there is one.
- Bricolage Grotesque for display (make light, model bold), Geist for body, Barlow Semi Condensed for figures and plates.
- Pill-shaped section tabs; the active pill is ink.

## Colors

A warm, paper-and-ink palette with one saffron voice, three status hues, and the vehicle's own colour as a guest. Values below are light; dark counterparts are in the frontmatter (`-dark` keys) and mirror the same roles.

### Primary
- **Saffron** (#ffc53d, pressed #f2b21f, wash #fff1cc / dark wash #3a2f10): fills primary buttons, the docked Add button, selected choice chips, count badges, the selected command-palette row, the numbered workshop markers and the brand mark. Text on it is always ink (#17140f, 11.6:1). Identical in dark. Also the underline under text links and ghost buttons, and the focus ring in dark (#ffc53d).

### Neutral
- **Paper** (#f2eee6; dark #12100d): the page ground and sticky bars.
- **Card White** (#ffffff; dark #1d1a16): cards, sheets, inputs, secondary buttons.
- **Well** (#f8f5ef; dark #26221d): quiet wells inside a card, action rows, status strips with no state.
- **Sunk** (#ece7dc; dark #171512): pressed states, hover on tabs, segmented-control track, skeletons, the image background before load.
- **Seam** (#e4ded2; dark #2e2a24) and **Seam Strong** (#d3cbbb; dark #433d34): row dividers and control borders. **Control Edge** (#8a8272; dark #7d7567) is the 3:1 border for check boxes and control hover.
- **Ink** (#17140f; dark #f6f1e8), **Ink 2** (#4b463d; dark #c4bcad), **Ink 3** (#665f52; dark #a0988a): primary, secondary and lowest-contrast text. Focus ring is ink in light, saffron in dark.

### Pit Panel
- **Panel Ink** (#1b1814; dark #0a0908), text white, secondary text #cfc7b8, border #3a352d (dark #4a4439). Panel-safe status text: green #7ee2a8, amber #ffd166, red #ff9a8c, the same in both themes.

### Status
- **Clear** (text #067647, mark #12b76a, wash #d9f5e4; dark #6edba0 / #6edba0 / #123626).
- **Soon** (text #8a4b05, mark #f79009, wash #ffeab8; dark #ffc764 / #ffc764 / #3a2b0a).
- **Overdue** (text #b42318, mark #d92d20, wash #ffe1dd; dark #ff9a8c / #ff9a8c / #3f1814).

### Vehicle Paint
- Set per vehicle from its own hex (`--vc`). Card tint is the paint mixed into the card colour in oklch at 34% (44% in dark); the disc is the paint at full strength. Text on a paint disc is ink or white, chosen by luminance.

### Named Rules
**The One Job Rule.** Saffron acts and selects. Ink panels instruct. Washes and marks report status. Paint identifies a vehicle. A colour doing a second job is wrong.

**The Words Carry It Rule.** Status is always a sentence plus a mark; the wash reinforces. Never colour alone.

**The Paint Is Theirs Rule.** A vehicle's colour appears only as its tint and disc (plus the small swatch and thumbnail). It never leaks into buttons, text or status.

## Typography

**Display Font:** Bricolage Grotesque Variable (fallback Geist Variable, system sans)
**Body Font:** Geist Variable (fallback ui-sans-serif, system-ui, Segoe UI, Roboto)
**Figure/Plate Font:** Barlow Semi Condensed 500/600/700 (fallback Barlow Fallback: Arial Narrow at 88% size-adjust)

**Character:** Bricolage brings the friendly, slightly quirky shop-sign voice at heading sizes with tight negative tracking; Geist stays neutral for reading; Barlow's condensed tabular figures read like instrument faces and registration plates.

### Hierarchy
Sizes are phone values; desktop (min 1024px, fine pointer) steps them down for body and up for display.
- **Display** (700, 2.5rem, 1; desktop 3.25rem, tracking -0.035em): vehicle model on its page.
- **Pit Board** (600, 1.625rem/2rem; desktop 1.875rem; long sentences 1.25rem/1.75rem): the one-sentence verdict, on the ink panel.
- **Section** (700, 1.5rem/1.75rem, -0.03em): real-word section headings.
- **Stage make / model** (300 at 1rem over 700 at clamp(2rem, 9.5vw, 2.5rem), -0.04em): make light, model bold, on the paint stage and vehicle names.
- **Title** (600, 1.0625rem/1.375rem; desktop 0.9375rem): row and document titles.
- **Body** (400, 1rem/1.5rem; desktop 0.875rem/1.25rem): prose and inputs (16px on phones so iOS does not zoom).
- **Label** (500, 0.8125rem/1rem; desktop 0.75rem): field labels, metadata. Sentence case, never uppercase.
- **Figures** (Barlow 600, tabular lining numerals): XL 3.75rem (desktop 4.75rem) for the current odometer, M 1.75rem, S 1.25rem; units in Geist 0.8125rem Ink 3.
- **Plate** (Barlow 600, 0.08em tracking): 0.9375 / 1.125 / 1.5rem in 26 / 34 / 42px chips.

### Named Rules
**The Instrument Rule.** A reading of the vehicle (odometer, plate, a kilometre figure) is set in Barlow with tabular lining figures. A count or date inside prose is body text.

**The Make-Light Rule.** Wherever make and model appear as a pair in display type, the make is weight 300 and the model weight 700.

## Layout

Phone is a single column with a 16px gutter (24px on desktop). Spacing is a 4px base: 2, 4, 8, 12, 16, 24, 32, 48, 72. Controls are 48px tall on touch and 36px on desktop; the minimum tap target is 44px (36px on desktop).

Garage: a stack of vehicle cards on phones, an auto-fill grid with 320px minimum columns on desktop (max width 1320px). Vehicle page: a sticky 56px header, a stage card with the ink panel directly below, a sticky pill tab strip, then white section cards. At 1024px a 264px sidebar appears, the stage and ink panel sit side by side (1.1fr / 1fr), and a 320px sticky properties rail joins the Overview. Past the Overview the header collapses to a single strip. Documents and Service become master-detail panes. Sheets are bottom sheets on phones and centred dialogs from 640px (520px wide, 720px for tall).

Cards stack with 16px between them and are never nested inside other cards.

## Elevation & Depth

Depth is tonal first, shadow second. Light theme cards lift with a soft two-layer shadow; dark theme drops shadows and uses a 1px hairline ring instead.

### Shadow Vocabulary
- **Card** (`0 1px 2px rgb(23 20 15 / 0.05), 0 10px 28px rgb(23 20 15 / 0.07)`; dark `0 0 0 1px line`): every white card.
- **Pop** (`0 12px 36px rgb(23 20 15 / 0.18)`; dark `0 0 0 1px line-strong, 0 16px 40px rgb(0 0 0 / 0.5)`): command palette, desktop dialogs, toasts, docked Add.
- **Sheet** (`0 -12px 40px rgb(23 20 15 / 0.2)`; dark `0 0 0 1px line-strong`): phone bottom sheets.
- Scrim is `rgb(23 20 15 / 0.45)` (dark `rgb(0 0 0 / 0.62)`).

### Named Rules
**The Flat Colour Rule.** Fills are flat. No gradients, glows, blurs or glass. The single exception is the mask-image fade on the scrolling tab strip, which reveals clipped tabs and paints nothing.

**The Soft Shadow Rule.** Shadows are low, diffuse and ink-tinted. Never hard offset, never coloured.

## Shapes

Soft and rounded, in a clear ladder: 24px cards and desktop dialogs, 28px sheet top corners, 18px popovers and the docked Add, 16px inner wells/rows/status strips/thumbnails, 14px controls (buttons, inputs, sidebar items), 6px plates and document thumbnails, and full pills for tabs, chips, the segmented control and icon buttons. Vehicle thumbnails without a photo are circles. Check boxes are 9px-radius squares. The paint disc is a true circle, partly clipped by the stage edge (54% wide, offset right and above; 62% on the hero). Borders are 1.5px on controls, 1px for dividers. Focus is a 3px ring with 2px offset on every interactive element.

## Components

### Buttons
- **Shape:** 14px radius, 48px tall (36px desktop), 24px side padding (16px desktop), weight 650, 1.5px border.
- **Primary:** saffron fill, ink text; hover to #f2b21f; press scales to 0.98. Disabled turns sunk with Ink 3 text.
- **Secondary:** white fill, strong seam border, ink text; hover border goes ink.
- **Dark:** ink fill, card-coloured text.
- **Ghost / link:** ink text with a 2 to 3px saffron underline; hover fills with saffron wash.
- **Danger:** overdue-coloured text on card; hover fills overdue wash.
- **Docked Add:** the single floating action on phones, 54px, 18px radius, saffron, bottom-right, pop shadow.

### Pit Panel (signature)
The ink panel (24px radius, 24px padding, 1px panel border) holds the Pit Board sentence in display type with a status mark in the panel-safe status colour, and at most one action. Links in it are white with a saffron underline. One panel per vehicle page; in the collapsed strip it shrinks to 18px radius and a 1rem sentence.

### Paint Stage (signature)
Vehicle imagery is the owner's photo (cover-fit, fades in) or, with none, a paint stage: pale oklch tint, flat disc, make over model in the Make-Light pairing. Thumbnails are a full paint circle with a two-letter model monogram in Barlow. 16:9 on garage cards, 2:1 hero on phones, 16:9 on desktop.

### Cards / Containers
- **Corner Style:** 24px. **Background:** white (dark #1d1a16). **Shadow:** Card. **Padding:** 24px, 16px between stacked cards. Rows inside use 1px seam dividers, minimum 56px tall (48px desktop).

### Tabs
Pill section tabs on the paper ground: 42px tall (38px desktop), 14px side padding, weight 650, Ink 2 text; hover fills sunk; the active pill is ink with card-coloured text. Count badges are saffron. The strip scrolls horizontally with snap and a mask fade at clipped edges.

### Inputs / Fields
- **Style:** white, 1.5px strong-seam border, 14px radius, 48px tall, label above in 0.8125rem weight 600 Ink 2.
- **Focus:** 3px focus ring and ink border. **Error:** overdue-coloured border and message. Figure inputs (odometer) use Barlow at 2.5rem; plate inputs use Barlow, uppercase, 0.08em tracking.
- **Choice chips:** full-pill, strong-seam border; checked is saffron with an ink border.

### Status
A line: 9px mark plus a sentence. Only soon and overdue colour the words. A strip variant fills the full width with the status wash, 16px radius, weight 600. Info uses saffron wash. Neutral is a hollow mark.

### Plate Chip
White with an ink 1.5px border, 6px radius, Barlow 600 with 0.08em tracking; always white and ink in both themes, like a real plate. Heights 22 (sidebar), 26, 34, 42px.

### Navigation
Sidebar items are 40px, 14px radius; current page is ink with card-coloured text; vehicles list a 10px paint swatch, name and plate with a status dot. Command palette: 640px, 24px radius; selected row is saffron. Theme control is a pill segmented control (Light, Dark, System); the active segment is ink.

### Theming
Light, Dark and System. Choosing Light or Dark sets `data-theme` on the root and persists it under `pitstop:theme`; System removes the attribute and follows the device. An inline script in the document head applies a stored choice before first paint so there is no flash. Motion uses one ease (`cubic-bezier(0.22, 1, 0.36, 1)`), 140ms on controls, 280ms sheets; reduced motion drops movement and keeps a short fade.

## Do's and Don'ts

### Do:
- **Do** give each colour one job: saffron acts, ink panel instructs, washes plus words report status, paint identifies.
- **Do** put the Pit Board sentence in the ink panel with at most one action.
- **Do** write status as words with a mark, and tint the wash behind it.
- **Do** give a vehicle with no photo its paint stage: pale oklch tint plus a flat disc, make light over model bold.
- **Do** use ink text on saffron, and set readings and plates in Barlow with tabular lining figures.
- **Do** design light and dark together; verify every new surface in both themes.
- **Do** keep cards at 24px, controls at 14px, tabs and chips as pills.
- **Do** use the owner's own photographs for imagery.
- **Do** allow the F1 influence only in naming, microcopy and motion, at most one wink per screen.

### Don't:
- **Don't** use gradients, glows or purple/blue AI gradient washes; the tab-strip scroll-fade mask is the only permitted gradient and it paints nothing.
- **Don't** use glassmorphism, backdrop blur or translucent panels.
- **Don't** build a racing-game or telemetry UI: no carbon fibre, no checkered flags, no speedometer dials.
- **Don't** use stock, rendered or silhouette vehicle imagery; a vehicle is a photo or its paint stage.
- **Don't** make an F1 reference inside a warning, overdue or error state.
- **Don't** let status rely on colour alone, or let vehicle paint colour buttons, text or status.
- **Don't** nest cards inside cards or stack KPI tiles.
- **Don't** use hard offset shadows or coloured shadows.
- **Don't** use small uppercase tracked labels as headings; headings are real words in sentence case.
