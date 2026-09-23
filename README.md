# Ates Parilti · Portfolio

Personal site of Ates Parilti, Industrial Engineering student at TU/e.

The page is drawn as a Lean value-stream map. The hero is a small discrete-event simulation: work flows from raw data through three stations (Industrial Engineering, Finance, Full-stack), Finance is the bottleneck, and running a kaizen on a station shows how lead time responds. Only improving the bottleneck helps, which is the point.

## Projects on the page

| Project | What the page shows |
| --- | --- |
| [Demand Forecaster](https://github.com/atesparilti1/demand-forecaster) | Interactive forecast and stockout demo with the model's real metrics, plus a screenshot of the Streamlit app |
| [SEC Filing Analyzer](https://github.com/atesparilti1/SEC-filer) | The app's real demo analyses for AAPL, AMD, META, MSFT and NVDA, each risk tied to its quote |
| [Supply Chain Analytics](https://github.com/atesparilti1/supplychain-dashboard) | KPI and recommendation demo on labeled synthetic orders, using the project's own rules |

## Stack

React 19, Vite, Tailwind CSS v4, Motion, Canvas 2D. Fonts: Archivo and JetBrains Mono, self-hosted.

## Run locally

```bash
npm install
npm run dev
```

`npm run build` writes the static site to `dist/`.

## Deploy

Any static host works. On Vercel, import the repo and keep the detected Vite settings. Set `SITE_URL` in `.env` to the live address (no trailing slash) so the social preview card links correctly.
