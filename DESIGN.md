---
name: Ates Parilti Portfolio
description: A scroll-driven descent through space into a ring of project screens, and out through the floor.
colors:
  ground: "#05060a"
  ground-2: "#10131b"
  sheet: "#0b0e15"
  ink: "#eceef2"
  ink-2: "#b2b9c6"
  ink-3: "#7a8291"
  flow: "#3b82f6"
  flow-text: "#6ea2ff"
  alarm: "#ff4d5e"
  line: "rgb(236 238 242 / 0.12)"
typography:
  display:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 122"
  body:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    lineHeight: 1.625
  value:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontWeight: 600
    fontFeature: "'tnum'"
rounded:
  panel: "16px"
  control: "999px"
---

# Design System: Ates Parilti Portfolio

## Overview

**Creative North Star: "The Ring"**

The page is one continuous camera move. It opens in deep space looking down on an open cylinder of screens around a lone figure on a glowing blue floor, descends past the story, drops into the ring where each project has a screen, and finally falls through the floor as the screens peel away into a tunnel. The last view looks back up at everything.

The WebGL scene (`src/space/Scene.js`) sits fixed behind the page. DOM chapters carry `data-cam`; the scene reads their positions and builds camera keyframes from them, so copy and camera stay in step at any viewport size.

## Colors

One dark theme, on purpose: the scene is a night sky.

- **Electric blue** (`flow`, `#3b82f6`): the only accent. Primary buttons, the floor glow, the active project's screen rim, one word per display heading (`flow-text` for text on dark), progress.
- **Red** (`alarm`): losses and alarms only (negative values in demos and screen faces), plus a faint red in the nebula and one planet.
- Neutrals are cool: near-black ground, off-white ink, grey-blue secondary text. No pure black or white.

## Typography

Archivo Variable carries everything: pushed to 122% width and weight 800 for display, normal width for prose. JetBrains Mono only for measured values (proof numbers, dates). At most one word per heading is blue, and it is the destination of the sentence ("software.", "systems.", "2027.").

## Shape

Two rules: text panels are 16px round; buttons and chips are full pills. Screens on the ring are rounded rectangles drawn by a signed-distance shader. The in-page demos keep their own square instrument look inside a 16px frame.

## Surfaces

Text floats over the scene on frosted glass (`.glass`): a dark translucent fill, a 1px light hairline, an inner top highlight and a 16px blur. It turns more opaque below 768px and solid under `prefers-reduced-transparency`.

## Scene vocabulary

- **Ring:** a tall tower of 12 columns by 7 rows of 16:10 screens at radius 14, between two hoops with a thin blue inner glow. Project screens sit in the second row from the bottom, spread evenly. The other screens share a small pool of faces, the project screenshots and faces drawn from the projects' real data (`src/space/screens.js`), scattered at random with no face next to or above itself.
- **Figure:** a jointed dark silhouette lit only by a blue rim from the floor. It breathes, shifts its weight, glances around and up at the camera, walks round in small steps to face what it attends to, and points at each project as it comes up. While the camera spirals down the shaft around it, it leans back in awe with its arms open, turning slowly to take in the tower.
- **Floor:** a blue glowing disc with a slow ripple and a pulse ring, over a faint grid that fades out past the ring.
- **Sky:** twinkling stars, an fbm nebula in navy with a trace of red, five shaded planets (one ringed), and a distant white star as the key light.
- **Tunnel:** in the last chapter the three rows peel off, staggered, into rings below the floor.

## Motion

- Lenis smooths the page scroll; the camera follows with exponential damping. Dragging spins the view around the ring with inertia, then it settles back.
- Chapters are long and the wheel is slowed, so each block of copy stays readable for most of its stretch. Chapter copy pins while the camera travels, fading and un-blurring in, and out as the chapter leaves.
- Screens boot with a short flicker on load, brighten when their project is active, and scale up slightly on hover.
- Opening a project flies the camera into its screen; the project window then grows out of the middle of the view.
- **Reduced motion:** no smoothing, no boot flicker, no drift or twinkle, no camera flight; the camera still follows scroll (user-driven) and all copy renders at its final state.

## Performance

The scene is a separate chunk loaded after first paint. Screenshots load lazily. Pixel ratio is capped (1.75, or 1.25 on small or slow devices) and bloom runs at half resolution, off entirely on small or slow devices. The project window and the demos are a lazy chunk prefetched once the scene is up. Without WebGL the CSS sky stays and the page reads normally.

## Don'ts

- Don't add a second accent color or use red for decoration.
- Don't set prose or buttons in mono.
- Don't mix in square buttons or sharp-cornered panels.
- Don't add em-dashes to the copy.
