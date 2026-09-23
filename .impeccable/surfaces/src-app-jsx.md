---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: []
---

# Surface brief: portfolio home (src/App.jsx)

Scope: single-page portfolio home. Mode: Experience (the work leads).
Audience: mixed (recruiters, collaborators, academic contacts), skimming on laptops by day.
Lead work: SEC Filing Analyzer, Demand Forecaster, Supply Chain Dashboard. Others listed compactly.
Avoid: generic dark/neon dev template, corporate stiffness, heavy loads (no WebGL, no big libraries).
Memorable moment: the hero is a live value-stream simulation the cursor improves.
Unresolved: owner's name spelling (inferred "Ateş Parıltı"), GitHub/LinkedIn/demo links, CV, photo.

## Direction contract

THESIS: The portfolio is a live value-stream map. Raw data enters on the left, flows through three process stations (Industrial Engineering, Finance, Full-stack), and leaves as shipped projects. It refuses the dev-portfolio default of "Hi, I'm X", a skills grid and a card grid.

OWN-WORLD: Lean VSM notation drawn at poster scale. Pale "process sheet" grey-green ground (#E7EAE4) with ink (#101216) line-work at 2px. Information-flow blue (#2447E6) for data, lightning arrows and live readouts. Kaizen-burst orange (#FF5A1F) used only where something is improving right now. Striped push arrows, inventory triangles, data boxes with mono readouts (C/T, WIP, lead time), and a timeline ladder. Deep ink-drenched sections for density. Archivo (width axis) for display and body; JetBrains Mono only for measured values.

STORY: The visitor sees an engineer who thinks in systems, then picks up the three identities, proves each through a flagship demo they can play with, scans the rest of the shipped work, and pulls a conversation (contact).

FIRST VIEWPORT: Top bar with a name mark, a pick list of stations, and an Email action. The headline sits upper-left at about 60% of the width. Below it, a full-width canvas VSM strip at about 42vh: supplier, push arrow, three stations with live data boxes, inventory triangles, and a customer. Particles flow along it continuously. Hovering a station fires a kaizen burst that cuts its cycle time, so the queue drains and the lead-time ladder re-computes. A primary "See the work" action sits under the headline.

FORM: Value-Stream Map, rank 1 of my ordered list (the pick card); seed key f429d00d.

Signature interaction: cursor kaizen on the live flow sim. Motion grammar: material flows, readouts tick, sections enter like stations coming online (clip reveal from the flow direction). The timeline ladder is fixed at the bottom and fills with scroll.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
