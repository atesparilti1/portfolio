// The projects the owner chose to show, strongest first. To add one, add an entry here;
// the board in Work.jsx lays it out. `demo` names an in-page demo, `shot` is optional.
//   lenses   who it is for, drives the "Hiring for" filter
//   metric   the one number on its rail row
//   short    the question on its rail row
//   headline the finding, which leads the stage
//   proof    three numbers under the headline

export const LENSES = ["All", "Software", "Finance", "Operations"];

export const featured = [
  {
    id: "euv-supply-risk",
    title: "EUV Supply Risk",
    station: "Supply chain",
    lenses: ["Software", "Finance", "Operations"],
    demo: "euv",
    metric: "+€59m",
    short: "How much spare stock should ASML hold?",
    headline: "Hold €82m of cheap spares, no optics, and add €59m of equity value.",
    line: "Every EUV scanner depends on three single-source modules. I simulate 20,000 versions of 2027 to 2030 and price each buffer policy through my ASML DCF.",
    proof: [
      { k: "Simulated futures", v: "20,000" },
      { k: "Recommended buffer", v: "+€59m" },
      { k: "On-time delivery", v: "57% to 63%" },
    ],
    stack: ["Python", "SciPy", "TypeScript", "React", "Web Worker"],
    links: {
      github: "https://github.com/atesparilti1/asml-euv-supply-risk",
      demo: "https://atesparilti1.github.io/asml-euv-supply-risk/",
    },
    shot: {
      src: "/work/asml-euv-supply-risk.png",
      alt: "The EUV Supply Risk site: the answer is to buffer cheap, failure-prone modules and hold no spare optics, worth +€59m of equity value, while two spare sets of everything lose €193m.",
      w: 1280,
      h: 800,
      caption: "The published study, with an in-browser simulator.",
    },
    case: [
      ["Problem", "Projection optics from Zeiss, light sources from Cymer and drive lasers from Trumpf each come from one supplier. How much stock of each is worth holding?"],
      ["Data", "The Base case of my ASML DCF plus sourced inputs. Supplier reliability is not public, so those inputs are labelled illustrative priors with stated ranges."],
      [
        "Method",
        "48 months per path: industry stress, orders, outages, yields, assembly, late orders and cancellations, with shipments feeding the DCF. Common random numbers keep policy comparisons paired; buffers are optimised on one seed and evaluated on another. 22 tests, and the deterministic case reproduces the DCF price.",
      ],
      [
        "Result",
        "Two spare sets of everything destroys €193m, because a late machine is mostly a delayed sale. Supply-chain risk costs about €2.44 a share, so it cannot explain the gap between my €935 and the €1,611 price. The decision depends most on laser and light-source outage rates and on how strongly failures cluster.",
      ],
    ],
  },
  {
    id: "asml-dcf-valuation",
    title: "ASML DCF Valuation",
    station: "Finance",
    lenses: ["Finance"],
    demo: "dcf",
    metric: "€935",
    short: "What do ASML's own cash flows say it is worth?",
    headline: "My model says €935 a share. The market says €1,611.",
    proof: [
      { k: "Base case", v: "€935" },
      { k: "Below market", v: "42%" },
      { k: "Exit multiple the price needs", v: "33x" },
    ],
    shot: {
      src: "/work/asml-dcf.png",
      alt: "The ASML valuation site: a blended DCF of €935 a share against the €1,611 market price, with a football field comparing the 52-week range, trading comps, Gordon growth, exit multiple and scenario values.",
      w: 1440,
      h: 900,
      caption: "The published valuation site, with the Excel model one click away.",
    },
    line: "A ten-year discounted cash flow valuation of ASML, built bottom-up from its filings, checked against peers, and published as a model you can change.",
    stack: ["Python", "Excel", "openpyxl", "React", "TypeScript"],
    links: {
      github: "https://github.com/atesparilti1/asml-dcf-valuation",
      demo: "https://atesparilti1.github.io/asml-dcf-valuation/",
    },
    case: [
      ["Problem", "ASML trades as the monopoly behind every leading-edge chip. What do its own cash flows say it is worth, and what does today's price assume?"],
      [
        "Data",
        "ASML's 20-F and quarterly filings (US GAAP, FY2021 to Q2 2026), market data on 7 Oct 2026, Damodaran's equity risk premium and industry betas, and four peers: Applied Materials, Lam Research, KLA and Tokyo Electron.",
      ],
      [
        "Method",
        "Revenue built from systems shipped times selling price for low-NA EUV, High-NA EUV and DUV, capped by ASML's stated capacity; five forecast years plus a five-year fade; WACC of 9.4%; Gordon growth and exit-multiple terminal values; comps, scenarios and a reverse DCF. 27 automated checks tie the Excel model to an independent Python and TypeScript copy.",
      ],
      [
        "Result",
        "Base case €935 a share, 42% below the €1,611 price, while peers put it near fair value. Today's price needs a 33x exit multiple or 7.1% growth forever after 2035: the market is pricing the AI cycle as lasting well past a ten-year forecast.",
      ],
    ],
  },
  {
    id: "demand-forecaster",
    title: "Demand Forecaster",
    station: "Industrial Eng.",
    lenses: ["Software", "Operations"],
    demo: "forecast",
    metric: "178 / 500",
    short: "What runs out before the next delivery?",
    headline: "One global model beat the seasonal-naive benchmark by 26% across 500 products.",
    line: "Forecasts daily demand for 500 store-item series, flags which products run out before the next delivery, and says how much to order.",
    proof: [
      { k: "At risk in 14 days", v: "178 of 500" },
      { k: "XGBoost MAPE", v: "13.6%" },
      { k: "MASE vs naive", v: "0.74" },
    ],
    shot: {
      src: "/work/demand-forecaster-dashboard.png",
      alt: "The Demand Forecaster Streamlit dashboard: 500 products tracked, 178 at risk of stockout, a 14-day restock window, and a table of at-risk products.",
      w: 1600,
      h: 1400,
      caption: "The Streamlit dashboard.",
    },
    stack: ["Python", "XGBoost", "SARIMA", "Streamlit"],
    links: {
      github: "https://github.com/atesparilti1/demand-forecaster",
      demo: "https://atesparilti1.github.io/demand-forecaster/",
    },
    case: [
      ["Problem", "A store must reorder before it runs out. Which of 500 products will stock out before the next delivery, and how much should be ordered?"],
      ["Data", "Kaggle Store Item Demand Forecasting Challenge: 10 stores by 50 items, daily sales from 2013 to 2017."],
      [
        "Method",
        "A SARIMA baseline on one series, then one global XGBoost model with lag, rolling and calendar features across all 500. One global model learns the shared weekly pattern and scales; 500 separate SARIMA fits do not.",
      ],
      [
        "Result",
        "SARIMA on one series scored MAPE 33.4% and MASE 1.01, no better than repeating last week. XGBoost across all 500 scored MAPE 13.6% and MASE 0.74. 178 of 500 products run out within a 14-day delivery window; each gets a safety stock and reorder point at the chosen service level.",
      ],
    ],
  },
  {
    id: "sec-filing-analyzer",
    title: "SEC Filing Analyzer",
    station: "Finance",
    lenses: ["Software", "Finance"],
    demo: "filing",
    metric: "5 firms",
    short: "Can a model read a 10-K without inventing facts?",
    headline: "Every claim ties to a quote. Every number comes from XBRL, never from the model.",
    proof: [
      { k: "Companies in the demo", v: "5" },
      { k: "Figures written by the model", v: "0" },
      { k: "Revenue history recovered", v: "4 years" },
    ],
    shot: {
      src: "/work/sec-filing-analyzer.png",
      alt: "The SEC Filing Analyzer on NVIDIA's 10-K: revenue $215.94B, net income $120.07B, 65.5% revenue growth and 55.6% net margin, an executive summary, and three key risks each backed by a quote from the filing.",
      w: 1710,
      h: 1395,
      caption: "The app, analyzing NVIDIA's 2026 10-K.",
    },
    line: "Reads 10-K and 10-Q filings and returns risks, growth bets and priorities, each tied to a quote from the filing itself.",
    stack: ["FastAPI", "React 19", "TypeScript", "Ollama", "SEC XBRL"],
    links: {
      github: "https://github.com/atesparilti1/SEC-filer",
      demo: "https://atesparilti1.github.io/SEC-filer/",
    },
    case: [
      ["Problem", "A 10-K takes hours to read, and the change that matters is buried in legal boilerplate."],
      ["Data", "SEC EDGAR filings (Business, Risk Factors and MD&A sections) and SEC XBRL financial data."],
      [
        "Method",
        "The model reads only the extracted sections and must return strict JSON with a quote behind every claim. Every number is computed in Python from XBRL, never by the model, because language models invent figures.",
      ],
      [
        "Result",
        "Five companies open instantly in demo mode; any other filing runs on a free local model. Found and fixed a data bug: NVIDIA changed its XBRL revenue tag after FY2022, which had silently dropped four years of revenue.",
      ],
    ],
  },
  {
    id: "discount-policy-simulator",
    title: "Discount Policy Simulator",
    station: "Operations",
    lenses: ["Operations"],
    demo: "ops",
    metric: "−$815k",
    short: "Which discounts cost more than they earn?",
    headline: "Above 20% off, every category loses money.",
    line: "Finds where discounts lose money across 51,290 order lines of the public Global Superstore sample dataset, and tests a cap before anyone changes a price.",
    proof: [
      { k: "Order lines", v: "51,290" },
      { k: "Lost above 20% off", v: "−$815k" },
      { k: "Profit with a 20% cap", v: "$2.28–2.50M" },
    ],
    stack: ["Python", "pandas", "SQL", "JavaScript"],
    links: {
      github: "https://github.com/atesparilti1/supplychain-dashboard",
      demo: "https://atesparilti1.github.io/supplychain-dashboard/",
    },
    case: [
      ["Problem", "Discounts win orders, but which ones cost more than they earn, and what policy would stop it?"],
      ["Data", "Global Superstore, a public sample dataset: 51,290 order lines across 7 markets and 3 categories, 2011 to 2014."],
      [
        "Method",
        "Cleaned in pandas, margin by discount level in Python and SQL, then a what-if model that re-prices orders above a cap from their implied list price and cost, with customer retention as an explicit assumption.",
      ],
      [
        "Result",
        "Above 20% off, every category loses money: those orders lost $815k. A 20% cap lifts profit from $1.47M to between $2.28M, if those customers all leave, and $2.50M, if they all stay.",
      ],
    ],
  },
];

// Work experience, oldest first so the arrows run with time.
export const experience = [
  {
    company: "Derin Bilgi",
    role: "Summer Intern",
    where: "Istanbul, Türkiye (hybrid)",
    when: "Jun. 2025 – Aug. 2025",
    points: ["Contributed to application development and debugging alongside experienced developers, then returned in Mar. 2026 as a part-time developer."],
  },
  {
    company: "Derin Bilgi",
    role: "Software Developer, part-time",
    where: "Istanbul, Türkiye (remote)",
    when: "Mar. 2026 – Aug. 2026",
    points: [
      "Proposed and built Lup Diye end to end (confidential).",
      "Developed and debugged features in an Agile Scrum team, with weekly sprint planning and progress reviews.",
    ],
  },
];

// Each skill points at the project that proves it.
export const toolbox = [
  {
    station: "Industrial Engineering",
    rows: [
      ["Monte Carlo simulation", "EUV Supply Risk"],
      ["Demand forecasting, stockout risk", "Forecaster"],
      ["Pricing policy analysis", "Discount Simulator"],
      ["Flow analysis", "this page"],
    ],
  },
  {
    station: "Finance",
    rows: [
      ["DCF valuation, WACC", "ASML DCF"],
      ["Trading comps, scenarios", "ASML DCF"],
      ["10-K / 10-Q analysis", "SEC Analyzer"],
      ["Profit and margin", "Discount Simulator"],
    ],
  },
  {
    station: "Full-stack",
    rows: [
      ["React, TypeScript", "SEC Analyzer, ASML DCF"],
      ["FastAPI", "SEC Analyzer"],
      ["Python, pandas, SQL", "Discount Simulator"],
      ["Simulation in the browser", "EUV Supply Risk"],
    ],
  },
];

export const contact = {
  email: "atesparilti@gmail.com",
  github: "https://github.com/atesparilti1",
  linkedin: "https://www.linkedin.com/in/atesparilti/",
  cv: "/Ates-Parilti-CV.pdf",
};
