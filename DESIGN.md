---
name: Ates Parilti Portfolio
description: A portfolio drawn as a live Lean value-stream map, from raw data to shipped systems.
colors:
  ground: "#e6e9e3"
  ground-2: "#d9ddd5"
  sheet: "#eef0eb"
  ink: "#111317"
  ink-2: "#3a4048"
  ink-3: "#5c636b"
  flow: "#2342e0"
  flow-ink: "#ffffff"
  kaizen: "#ff5a1f"
  kaizen-ink: "#111317"
  band: "#111317"
  band-ink: "#e6e9e3"
  band-ink-2: "#a9b0a6"
typography:
  display:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 4.9vw, 5.1rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 118"
  headline:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 4.4vw, 4rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 118"
  title:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.4
    fontVariation: "'wdth' 112"
  body:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "'ss01'"
  label:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  value:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    fontFeature: "'tnum'"
  value-sm:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  none: "0px"
spacing:
  gutter-sm: "16px"
  gutter-md: "24px"
  gutter-lg: "40px"
  box: "16px"
  section: "96px"
  section-lg: "128px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.flow}"
    textColor: "{colors.flow-ink}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "10px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  button-kaizen:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "6px 10px"
  button-kaizen-hover:
    backgroundColor: "{colors.kaizen}"
    textColor: "{colors.kaizen-ink}"
  process-title-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  data-box:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.value}"
    rounded: "{rounded.none}"
    padding: "12px"
  band-card-header:
    backgroundColor: "{colors.band-ink}"
    textColor: "{colors.band}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
---

# Design System: Ates Parilti Portfolio

## Overview

**Creative North Star: "The Value-Stream Map"**

The whole system is Lean value-stream-map notation drawn at poster scale. A pale grey-green process sheet carries 2px ink line-work; work moves left to right through process boxes, inventory triangles and striped push arrows; the information flow runs back in blue; and a kaizen burst in orange marks the one place something is improving right now. Every surface is read as a station on a line, not as a card on a grid.

Density is diagrammatic rather than decorative: square boxes, hard ink rules, measured values set in mono beside plain Archivo labels, and wide-set Archivo display type that reads like a poster title block. Depth is almost absent; the page is paper with ink on it. One deep ink band per page inverts the sheet to carry the densest material.

Motion follows the flow direction. Headings and demos come online like stations, wiping in from the left; supporting text settles in; buttons lean toward the pointer. Everything has a still, fully legible reduced-motion state.

**Key Characteristics:**
- Grey-green process-sheet ground with ink line-work at 2px.
- Zero corner radius anywhere.
- Archivo Variable pushed wide (112 to 118% stretch) for display and titles; JetBrains Mono only for measured values.
- VSM notation as the component vocabulary: process boxes, data boxes, inventory triangles, push arrows, kaizen burst, timeline ladder.
- Blue for information and interaction; orange only for live improvement or alarms.
- One ink band per page.

## Colors

A near-monochrome process sheet with one working blue and one rationed signal orange.

### Primary
- **Information-Flow Blue** (`flow`): The system's working color. Data, the demand-signal line, live readouts in the sim, the active tab fill, primary-button hover, the filled timeline ladder, text selection, focus rings, and at most one highlighted word per display heading ("shipped", "project."). Text on it is `flow-ink`.

### Secondary
- **Kaizen Orange** (`kaizen`): Reserved for something improving right now or something going wrong: the kaizen burst and boosted cycle time in the sim, the kaizen-trigger buttons, negative KPI values and High-priority recommendations in the ops demo. Text on it is `kaizen-ink`.

### Neutral
- **Process Sheet** (`ground`): Page background and the text color on ink fills.
- **Worn Sheet** (`ground-2`): Hover fill on quiet controls, scrollbar track.
- **Clean Sheet** (`sheet`): Interior of process boxes, data boxes and demo panels; slightly lighter than the ground so boxes read as paper laid on paper.
- **Drafting Ink** (`ink`): All line-work, primary text, title bars, primary buttons. The `--rule` token is an alias of ink.
- **Graphite** (`ink-2`): Body copy, secondary labels, stack lists.
- **Pencil** (`ink-3`): Push-arrow stripes in the sim, axis ticks, scrollbar thumb. Never body text.
- **Ink Band** (`band`), **Band Paper** (`band-ink`), **Band Graphite** (`band-ink-2`): The inverted palette for the one ink band section. Band Paper does the job ink does on the sheet; Band Graphite carries body text.

Dark mode (via `prefers-color-scheme`) remaps every token, not individual elements: ground #101216, ground-2 #181b20, sheet #15181d, ink #e4e7e1, ink-2 #b4bab2, ink-3 #8d948c, flow #7088ff, flow-ink #0b0d12, kaizen #ff6a33, kaizen-ink #101216, band #1c2026, band-ink #e4e7e1, band-ink-2 #9aa198. Components reference tokens only, so they invert for free.

### Named Rules
**The Kaizen Reservation Rule.** Orange means "improving now" or "alarm". If nothing is changing and nothing is wrong, it does not appear. Never use it for decoration, hover flair, or brand accent.

**The One Blue Word Rule.** A display heading may carry at most one word in Information-Flow Blue, and that word is the destination of the sentence.

## Typography

**Display Font:** Archivo Variable (with ui-sans-serif, system-ui)
**Body Font:** Archivo Variable at normal width, stylistic set `ss01`
**Label/Mono Font:** JetBrains Mono (400, 600), measured values only

**Character:** One grotesque family stretched across its width axis does all the talking: pushed wide and heavy it is a poster title block, at normal width it is plain engineering prose. Mono appears only where something is measured.

### Hierarchy
- **Display** (800, clamp(2.6rem, 4.9vw, 5.1rem), 0.95, stretch 118%, -0.035em, balanced wrap): The hero headline; the contact headline scales up to clamp(3rem, 8vw, 6rem). Hero words rise from a clipped line on load.
- **Headline** (800, clamp(2.2rem, 4.4vw, 4rem) to clamp(2.4rem, 5vw, 4.5rem), same display settings): Section headings. Project names use the same voice at clamp(2rem, 3.6vw, 3.25rem).
- **Title** (700, 15px, stretch 112%): Process-box title bars, band-card headers, the name mark (17px, 800).
- **Body** (400, 18px, 1.625): Lead paragraphs in Graphite, capped at 38 to 60ch. Secondary body is 15px or 14px at the same leading.
- **Label** (500, 12 to 13px): Data-box field names, stack lists, captions, ladder steps (11px, 600).
- **Value** (JetBrains Mono 600, 24px, tabular): Fact readouts in data boxes. **Value-sm** (JetBrains Mono 500 to 600, 10 to 12px) for C/T, queue, wait, lead-time, axis ticks and chart annotations.

### Named Rules
**The Measured-Only Mono Rule.** JetBrains Mono is for numbers with units and the labels bolted to them (C/T, WIP, lead time, dates, tickers). Prose, headings and buttons stay in Archivo.

**The Width-Not-Size Rule.** Hierarchy is set by font-stretch and weight first: display 118%, titles 112%, body normal. Don't add a second display face.

## Layout

Single column of stations on a 1400px max-width container with side gutters of 16px (mobile), 24px (sm, 640px) and 40px (lg, 1024px). Inside, a 12-column grid at lg with 40 to 48px gaps; text and demo alternate sides between projects (4/8 then 7/5) so the eye zig-zags like material along a line. Sections breathe at 64px to 128px vertical padding; the ink band and contact use the larger end.

Horizontal flow is literal: the hero sim is a full-width strip, push arrows separate stages, the about toolbox is three process boxes joined by push arrows on one row at lg. Below lg everything stacks top to bottom and inter-box arrows are hidden.

The fixed nav is 64px tall and gains a 2px ink bottom rule once scrolled. The timeline ladder is pinned bottom-left on lg only.

### Named Rules
**The One Band Rule.** Each page gets exactly one full-bleed ink band (`band` background) for its densest material. A second inverted section breaks the sheet.

## Elevation & Depth

The system is flat paper and ink. Depth comes from line weight, the sheet-versus-ground tone step, and the single ink band, not from shadows. Soft ambient shadows appear only as a response to state or to lift a floating instrument off the page; there are no hard offset shadows.

### Shadow Vocabulary
- **Pull lift** (`box-shadow: 0 8px 24px -10px rgb(var(--shadow) / 0.5)`): Primary button on hover only.
- **Floating instrument** (`box-shadow: 0 6px 24px -12px rgb(var(--shadow) / 0.45)`): The fixed timeline ladder.
- **Station glow** (canvas shadow, blur 16 to 26px, offset 6px, opacity 0.18 to 0.32 by boost): Sim process boxes while a kaizen is running.

### Named Rules
**The Flat-At-Rest Rule.** Nothing casts a shadow at rest except the fixed ladder. Shadows are a state, not a style.

## Shapes

Every corner is square (0px), including buttons, tabs, sliders and scrollbar thumbs. Form comes from 2px ink strokes: boxes are bordered at 2px, internal dividers are 2px, the nav rule is 2px, hovered sim stations go to 3px. Only row separators inside a list drop to a 1px ink hairline at 15% opacity.

The recurring silhouettes are VSM symbols: the factory sawtooth (source and customer), the triangle with an "I" (inventory), the striped bar with a solid arrowhead (push), the zig-zag lightning line (information flow), the spiked star (kaizen burst), and the square-wave ladder (timeline). The name mark is a 2px square frame around a solid square.

## Components

### Buttons
Blunt, square, and pulled toward the pointer.
- **Shape:** Square corners (0px).
- **Primary:** Ink fill, ground text, 15px bold, 12px by 20px, with a 16px bold icon at 8px gap. Contact scales it to 16px by 24px at 16px text.
- **Hover / Focus:** Fill switches to Information-Flow Blue with the pull-lift shadow over 200ms; press scales to 0.98. Focus is a 2px blue outline offset 3px, site-wide.
- **Secondary:** 2px ink border, transparent fill, ink text; hover fills ink with ground text.
- **Kaizen trigger:** 2px ink border, small (14px, 600, 6px by 10px), a filled orange lightning icon; hover fills kaizen with kaizen-ink text. Only for controls that run an improvement.
- **Magnetic behavior:** Hero and contact CTAs follow the mouse pointer (22% horizontal, 30% vertical offset, spring stiffness 260, damping 18) and spring back on leave. Disabled for touch and reduced motion.
- **Square icon buttons:** 44px, 2px border, invert on hover (track nudge controls in the band).

### Process Box
The core container. 2px ink border, Clean Sheet interior, and a solid ink title bar (15px bold, 112% stretch, 10px by 16px) naming the station. Rows below use 16px by 10px padding with 1px hairline separators; labels left in Archivo, proof right in Graphite. On the band, the bar inverts (band-ink fill, band text). Project titles pair the display name with a compact ink title-bar tag set beside it, not above it.

### Data Box
A 2px ink grid of cells on Clean Sheet, divided by 2px internal rules. Each cell has a 12px Label field name and a 24px mono Value in tabular figures. In the sim, data boxes hang under each station reading C/T, Queue and Wait.

### Demo Panel
Interactive demos sit in a 2px ink frame on Clean Sheet with a 2px ruled header strip carrying mono metadata and a status tag (ink fill for a warning state, blue fill for a healthy state). Tabs are equal-width cells divided by 2px rules; the active tab fills blue and the fill slides between tabs.

### Push Arrow
A striped ink bar (12px dash, 8px gap, 12px tall) ending in a solid 18px arrowhead; it draws itself left to right on scroll (scaleX over 1.1s). Used as the separator between stages and between process boxes.

### Kaizen Burst
An 11-spike orange star with an ink outline drawn over a station while its cycle time is being cut. It is the system's only animated alarm-colored element.

### Timeline Ladder
The VSM lead-time ladder as a square-wave line. In the hero it is live (wait above, cycle time below, lead and value-add totals in mono). Fixed at the bottom-left on desktop, it doubles as section navigation and fills blue with scroll progress.

### Navigation
64px fixed bar on the ground color. Name mark left (17px, 800, wide); links 15px semibold Graphite, hover to ink with a 2px ink underline that grows from the left; an ink "Email me" action at the right that turns blue on hover. Links hide below md; the email action stays.

### Motion Grammar
- **Wipe** (headings, demos, figures): enters from the flow direction, starting partly visible: clip inset 38% from the right, opacity 0.4, x -12px, resolving over 1.0s on ease-out-expo `cubic-bezier(0.16, 1, 0.3, 1)`, once, at 25% in view.
- **Settle** (supporting text): opacity 0 and y 14px to rest over 0.7s, same curve.
- **Hero load:** headline words rise from clipped lines (0.9s, 60ms stagger); the sim strip wipes open left to right (1.4s).
- **Reduced motion:** the MotionConfig honors the user setting, all reveals render at their final state, CSS transitions collapse to near zero, smooth scroll is off, and the sim draws a still frame that kaizen buttons re-run instantly.

## Do's and Don'ts

### Do:
- **Do** draw every edge as 2px ink with square (0px) corners.
- **Do** build new containers from VSM notation: process box with an ink title bar, data box with mono readouts, push arrows between stages.
- **Do** set measured values in JetBrains Mono with tabular figures, and everything else in Archivo.
- **Do** push display type wide (118% stretch, weight 800, -0.035em) and titles to 112%.
- **Do** reveal content from the flow direction (left to right) with the wipe, and give every motion a still reduced-motion state.
- **Do** use Information-Flow Blue for interaction, focus and live data.

### Don't:
- **Don't** use kaizen orange unless something is improving right now or something is wrong.
- **Don't** add a second ink band to a page.
- **Don't** round corners, even on inputs or scrollbar thumbs.
- **Don't** use hard offset shadows or shadows at rest; depth is line weight and tone.
- **Don't** set prose, headings or buttons in mono.
- **Don't** place a label above a heading; station tags sit beside the title as a title bar.
