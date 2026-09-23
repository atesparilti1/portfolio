import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";

const REGIONS = ["All", "Central", "East", "South", "West"];
const CATS = ["All", "Furniture", "Office Supplies", "Technology"];
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

// Synthetic orders shaped like the Superstore set. Margins and delivery days differ per
// region and category so the recommendation rules have something real to react to.
const PROFILE = {
  Central: { rev: 1.0, margin: { Furniture: -0.04, "Office Supplies": 0.09, Technology: 0.13 }, days: 4.3 },
  East: { rev: 1.25, margin: { Furniture: 0.05, "Office Supplies": 0.14, Technology: 0.17 }, days: 3.8 },
  South: { rev: 0.8, margin: { Furniture: -0.07, "Office Supplies": 0.06, Technology: 0.11 }, days: 4.6 },
  West: { rev: 1.35, margin: { Furniture: 0.08, "Office Supplies": 0.16, Technology: 0.19 }, days: 3.6 },
};
const CAT_REV = { Furniture: 1.05, "Office Supplies": 0.85, Technology: 1.2 };
const SEASON = [0.62, 0.55, 0.9, 0.78, 0.84, 0.88, 0.8, 0.86, 1.22, 1.05, 1.34, 1.48];

function build(region, cat) {
  const regions = region === "All" ? Object.keys(PROFILE) : [region];
  const cats = cat === "All" ? Object.keys(CAT_REV) : [cat];
  const monthly = SEASON.map(() => 0);
  let revenue = 0;
  let profit = 0;
  let daysW = 0;
  const byCat = {};
  const byRegion = {};
  regions.forEach((r) => {
    cats.forEach((c) => {
      SEASON.forEach((s, m) => {
        const v = 18400 * PROFILE[r].rev * CAT_REV[c] * s * (1 + ((m * 7 + r.length + c.length) % 5) * 0.03);
        monthly[m] += v;
        revenue += v;
        profit += v * PROFILE[r].margin[c];
        daysW += v * PROFILE[r].days;
        byCat[c] = (byCat[c] || 0) + v;
        byRegion[r] = (byRegion[r] || 0) + v;
      });
    });
  });
  const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1])[0][0];
  return {
    monthly,
    revenue,
    profit,
    margin: profit / revenue,
    days: daysW / revenue,
    topCat: top(byCat),
    topRegion: top(byRegion),
  };
}

// Same rules as python/dashboard_analysis.py in the project.
function recommend(k) {
  const out = [];
  if (k.margin < 0) {
    out.push({
      priority: "High",
      title: "Review low-margin orders",
      detail: `Profitability is negative. Focus on improving margins in ${k.topCat} and ${k.topRegion}.`,
    });
  } else {
    out.push({
      priority: "Medium",
      title: "Scale high-performing categories",
      detail: `Revenue looks healthy. Put more focus on ${k.topCat} to keep profit growing.`,
    });
  }
  if (k.days > 4) {
    out.push({
      priority: "Medium",
      title: "Watch delivery speed",
      detail: `Average delivery is ${k.days.toFixed(1)} days, so shipping performance needs a review.`,
    });
  } else {
    out.push({
      priority: "Low",
      title: "Keep delivery consistent",
      detail: "Delivery timing looks stable. Keep monitoring service levels across regions.",
    });
  }
  return out;
}

const money = (v) => (Math.abs(v) >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : `$${(v / 1e3).toFixed(0)}k`);

function Seg({ label, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-band-ink-2">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            aria-pressed={o === value}
            className={`border-2 px-2.5 py-1.5 text-sm font-semibold transition-colors duration-200 active:translate-y-px ${
              o === value
                ? "border-flow bg-flow text-flow-ink"
                : "border-band-ink/30 text-band-ink hover:border-band-ink"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function OpsDemo() {
  const [region, setRegion] = useState("All");
  const [cat, setCat] = useState("All");
  const reduce = useReducedMotion();
  const k = useMemo(() => build(region, cat), [region, cat]);
  const recs = recommend(k);
  const max = Math.max(...k.monthly);

  const kpis = [
    { k: "Revenue", v: money(k.revenue) },
    { k: "Profit", v: money(k.profit), neg: k.profit < 0 },
    { k: "Margin", v: `${(k.margin * 100).toFixed(1)}%`, neg: k.margin < 0 },
    { k: "Avg delivery", v: `${k.days.toFixed(1)} d` },
  ];

  return (
    <div className="grid border-2 border-band-ink/80 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
      <div className="space-y-6 border-b-2 border-band-ink/80 p-5 lg:border-b-0 lg:border-r-2">
        <Seg label="Region" options={REGIONS} value={region} onChange={setRegion} />
        <Seg label="Category" options={CATS} value={cat} onChange={setCat} />
        <dl className="grid grid-cols-2 gap-px bg-band-ink/25">
          {kpis.map((x) => (
            <div key={x.k} className="bg-band p-3">
              <dt className="text-xs font-medium text-band-ink-2">{x.k}</dt>
              <dd className={`mt-1 font-mono text-2xl font-semibold tnum ${x.neg ? "text-kaizen" : "text-band-ink"}`}>{x.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col p-5">
        <p className="mb-3 text-sm font-medium text-band-ink-2">Monthly revenue</p>
        <div className="flex h-44 items-end gap-1.5 sm:gap-2" aria-hidden="true">
          {k.monthly.map((v, i) => (
            <div key={i} className="flex h-full flex-1 flex-col justify-end">
              <motion.div
                className="w-full origin-bottom bg-band-ink"
                style={{ height: "100%" }}
                initial={false}
                animate={{ scaleY: v / max }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 24, delay: i * 0.02 }}
              />
              <span className="mt-1.5 text-center font-mono text-[10px] text-band-ink-2">{MONTHS[i]}</span>
            </div>
          ))}
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2" aria-live="polite">
          {recs.map((r) => (
            <motion.li
              key={r.title + r.detail}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-band-ink/[0.06] p-3"
            >
              <p className="flex items-center gap-2 text-sm font-bold text-band-ink">
                <ArrowRight size={14} weight="bold" className={r.priority === "High" ? "text-kaizen" : "text-flow"} />
                {r.title}
              </p>
              <p className="mt-1 text-sm leading-snug text-band-ink-2">{r.detail}</p>
            </motion.li>
          ))}
        </ul>
        <p className="mt-auto pt-4 text-xs text-band-ink-2">
          Synthetic orders. The recommendation rules are the ones the project ships.
        </p>
      </div>
    </div>
  );
}
