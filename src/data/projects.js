// The projects the owner chose to show. The UI only renders a link when one is set.

export const featured = [
  {
    id: "asml-dcf-valuation",
    title: "ASML DCF Valuation",
    station: "Finance",
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
    line: "Forecasts daily demand for 500 store-item series, flags which products run out before the next delivery, and says how much to order.",
    stack: ["Python", "XGBoost", "SARIMA", "Streamlit"],
    facts: [
      { k: "Series modelled", v: "500" },
      { k: "At risk in 14 days", v: "178" },
      { k: "XGBoost MAPE", v: "13.6%" },
      { k: "MASE vs naive", v: "0.74" },
    ],
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
    line: "Finds where a retailer loses money on 51,290 order lines and lets you test a discount cap before anyone changes a price.",
    stack: ["Python", "pandas", "SQL", "JavaScript"],
    links: {
      github: "https://github.com/atesparilti1/supplychain-dashboard",
      demo: "https://atesparilti1.github.io/supplychain-dashboard/",
    },
    case: [
      ["Problem", "Discounts win orders, but which ones cost more than they earn, and what policy would stop it?"],
      ["Data", "Global Superstore: 51,290 order lines across 7 markets and 3 categories, 2011 to 2014."],
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

// Each skill points at the project that proves it.
export const toolbox = [
  {
    station: "Industrial Engineering",
    rows: [
      ["Demand forecasting", "Forecaster"],
      ["Stockout risk", "Forecaster"],
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
      ["Streamlit", "Forecaster"],
    ],
  },
];

export const contact = {
  email: "atesparilti@gmail.com",
  github: "https://github.com/atesparilti1",
  linkedin: "https://www.linkedin.com/in/atesparilti/",
  cv: "/Ates-Parilti-CV.pdf",
};
