// The three projects the owner chose to show. The UI only renders a link when one is set.

export const featured = [
  {
    id: "forecaster",
    title: "Demand Forecaster",
    station: "Industrial Eng.",
    line: "Forecasts daily demand for 500 store-item series and flags which products will run out before the next restock.",
    stack: ["Python", "XGBoost", "SARIMA", "Streamlit"],
    facts: [
      { k: "Series modelled", v: "500" },
      { k: "At risk in 14 days", v: "178" },
      { k: "XGBoost MAPE", v: "13.6%" },
      { k: "MASE vs naive", v: "0.74" },
    ],
    links: { github: "https://github.com/atesparilti1/demand-forecaster" },
  },
  {
    id: "sec",
    title: "SEC Filing Analyzer",
    station: "Finance",
    line: "Reads 10-K and 10-Q filings and returns risks, growth bets and priorities, each tied to a quote from the filing itself.",
    stack: ["FastAPI", "React 19", "TypeScript", "Ollama", "SEC XBRL"],
    links: { github: "https://github.com/atesparilti1/SEC-filer" },
  },
  {
    id: "ops",
    title: "Supply Chain Analytics",
    station: "Full-stack",
    line: "Turns raw Superstore order data into KPIs, SQL reporting views and a dashboard that writes its own recommendations.",
    stack: ["Python", "SQL", "Power BI", "JavaScript"],
    links: { github: "https://github.com/atesparilti1/supplychain-dashboard" },
  },
];

// Each skill points at the project that proves it.
export const toolbox = [
  {
    station: "Industrial Engineering",
    rows: [
      ["Demand forecasting", "Forecaster"],
      ["Stockout risk", "Forecaster"],
      ["KPI design", "Supply Chain"],
      ["Flow analysis", "this page"],
    ],
  },
  {
    station: "Finance",
    rows: [
      ["10-K / 10-Q analysis", "SEC Analyzer"],
      ["XBRL financial data", "SEC Analyzer"],
      ["Profit and margin", "Supply Chain"],
      ["Financial accounting", "TU/e coursework"],
    ],
  },
  {
    station: "Full-stack",
    rows: [
      ["React, TypeScript", "SEC Analyzer"],
      ["FastAPI", "SEC Analyzer"],
      ["Python, SQL", "Supply Chain"],
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
