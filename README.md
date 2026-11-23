# Ates Parilti · Portfolio

Personal site of Ates Parilti, Industrial Engineering student at TU/e.

The page is a scroll-driven Three.js scene. The camera starts in space above an open ring of screens, descends through the story, enters the ring where each project has its own screen, and finally drops through the floor as the screens peel off into a tunnel. Clicking a screen flies the camera into it and opens the project: findings, live demo, source, stack, an in-page demo and the case study. The scene lives in `src/space/`, the copy in `src/components/Chapters.jsx`, and projects in `src/data/projects.js`.

## Projects on the page

| Project | Live demo | What the page shows |
| --- | --- | --- |
| [FabTwin](https://github.com/atesparilti1/fabtwin) | [open](https://atesparilti1.github.io/fabtwin/) | Scheduling, overhead transport and maintenance for a wafer fab, tested in a 3D digital twin: cycle time -16.1% and weighted tardiness -97% against critical-ratio dispatching |
| [EUV Supply Risk](https://github.com/atesparilti1/asml-euv-supply-risk) | [open](https://atesparilti1.github.io/asml-euv-supply-risk/) | The buffer policies from 20,000 Monte Carlo paths, priced through the ASML DCF, with their confidence intervals |
| [ASML DCF Valuation](https://github.com/atesparilti1/asml-dcf-valuation) | [open](https://atesparilti1.github.io/asml-dcf-valuation/) | The model's own cash flows re-valued live: change WACC, terminal growth or exit multiple, see the price against the market and what today's price requires |
| [Demand Forecaster](https://github.com/atesparilti1/demand-forecaster) | [open](https://atesparilti1.github.io/demand-forecaster/) | The real XGBoost backtest next to actual sales, turned into safety stock, a reorder point and an order quantity |
| [SEC Filing Analyzer](https://github.com/atesparilti1/SEC-filer) | [open](https://atesparilti1.github.io/SEC-filer/) | The app's real analyses for AAPL, AMD, META, MSFT and NVDA, each risk tied to its quote |
| [Discount Policy Simulator](https://github.com/atesparilti1/supplychain-dashboard) | [open](https://atesparilti1.github.io/supplychain-dashboard/) | 51,290 order lines from the public Global Superstore sample dataset: above 20% off every category loses money, and what a cap would change |

## Adding a project

Add an entry to `featured` in `src/data/projects.js`. It gets a screen on the ring (spread evenly, up to 12), a chapter of its own and a window with its findings. A `shot` puts its screenshot on the screen; without one the screen shows a drawn face from `src/space/screens.js`. To give it an in-page demo, add the component to `DEMOS` in `src/components/ProjectDetail.jsx`.

## Stack

React 19, Vite, Tailwind CSS v4, Three.js (WebGL, bloom post-processing), Lenis smooth scrolling, Motion. Fonts: Archivo and JetBrains Mono, self-hosted.

## Run locally

```bash
npm install
npm run dev
```

`npm run build` writes the static site to `dist/` and prerenders the page to HTML, so the content is readable without JavaScript.

## Deploy

Deployed on Vercel at https://atesparilti.com. `SITE_URL` in `.env` sets the canonical and social preview URLs. Web Analytics must be enabled once in the Vercel project settings.
