# Ates Parilti · Portfolio

Personal site of Ates Parilti, Industrial Engineering student at TU/e.

The page is drawn as a Lean value-stream map. The hero is a small discrete-event simulation: work flows from raw data through three steps (clean data, model, build), modelling is the bottleneck, and improving a step shows how the total time per job responds. Only improving the bottleneck helps, which is the point.

## Projects on the page

| Project | Live demo | What the page shows |
| --- | --- | --- |
| [Demand Forecaster](https://github.com/atesparilti1/demand-forecaster) | [open](https://atesparilti1.github.io/demand-forecaster/) | The real XGBoost backtest next to actual sales, turned into safety stock, a reorder point and an order quantity |
| [SEC Filing Analyzer](https://github.com/atesparilti1/SEC-filer) | [open](https://atesparilti1.github.io/SEC-filer/) | The app's real analyses for AAPL, AMD, META, MSFT and NVDA, each risk tied to its quote |
| [Discount Policy Simulator](https://github.com/atesparilti1/supplychain-dashboard) | [open](https://atesparilti1.github.io/supplychain-dashboard/) | 51,290 real Global Superstore order lines: above 20% off every category loses money, and what a cap would change |

## Stack

React 19, Vite, Tailwind CSS v4, Motion, Canvas 2D. Fonts: Archivo and JetBrains Mono, self-hosted.

## Run locally

```bash
npm install
npm run dev
```

`npm run build` writes the static site to `dist/` and prerenders the page to HTML, so the content is readable without JavaScript.

## Deploy

Deployed on Vercel at https://atesparilti.com. `SITE_URL` in `.env` sets the canonical and social preview URLs.
