import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import data from "../data/discount_policy.json";

// Real aggregates from the supply chain project: 51,290 Global Superstore order lines,
// grouped by market, category and discount level. Same model as the project's simulator.
const CAPS = [0, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 1];
const CATS = ["All", "Furniture", "Office Supplies", "Technology"];
const BAND_MAX = { "0%": 0, "1-10%": 0.1, "11-20%": 0.2, "21-30%": 0.3, "31-50%": 0.5, "over 50%": 1 };

function simulate(rows, cap, retention) {
  let profit = 0;
  for (const r of rows) {
    if (r.discount <= cap) {
      profit += r.profit;
    } else {
      const capped = r.list_sales * (1 - cap);
      profit += retention * (capped - (r.sales - r.profit));
    }
  }
  return profit;
}

const money = (v) => {
  const a = Math.abs(v);
  const s = a >= 1e6 ? `$${(a / 1e6).toFixed(2)}M` : `$${(a / 1e3).toFixed(0)}k`;
  return v < 0 ? `−${s}` : s;
};

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
              o === value ? "border-flow bg-flow text-flow-ink" : "border-band-ink/30 text-band-ink hover:border-band-ink"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Slider({ id, label, value, display, min, max, onChange }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 flex justify-between text-sm font-medium text-band-ink-2">
        <span>{label}</span>
        <span className="font-mono font-semibold text-band-ink">{display}</span>
      </span>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)} className="range range-band w-full" />
    </label>
  );
}

export default function OpsDemo() {
  const [capIdx, setCapIdx] = useState(3);
  const [retention, setRetention] = useState(50);
  const [cat, setCat] = useState("All");
  const reduce = useReducedMotion();

  const cap = CAPS[capIdx];
  const rows = useMemo(() => (cat === "All" ? data.cube : data.cube.filter((r) => r.category === cat)), [cat]);
  const base = useMemo(() => rows.reduce((s, r) => s + r.profit, 0), [rows]);
  const r = retention / 100;
  const now = simulate(rows, cap, r);
  const low = simulate(rows, cap, 0);
  const high = simulate(rows, cap, 1);
  const delta = now - base;

  // Margin per discount band for the chosen category, from the same cube.
  const bands = useMemo(() => {
    const acc = data.bands.map((b) => ({ band: b.band, sales: 0, profit: 0 }));
    const idx = (d) => (d === 0 ? 0 : d <= 0.1 ? 1 : d <= 0.2 ? 2 : d <= 0.3 ? 3 : d <= 0.5 ? 4 : 5);
    for (const row of rows) {
      const a = acc[idx(row.discount)];
      a.sales += row.sales;
      a.profit += row.profit;
    }
    return acc.map((a) => ({ ...a, margin: a.sales ? a.profit / a.sales : 0 }));
  }, [rows]);
  const maxAbs = Math.max(...bands.map((b) => Math.abs(b.margin)), 0.3);

  const lo = Math.min(low, high, base);
  const hi = Math.max(low, high, base);
  const at = (v) => (hi === lo ? 50 : ((v - lo) / (hi - lo)) * 100);

  return (
    <div className="grid border-2 border-band-ink/80 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
      <div className="space-y-6 border-b-2 border-band-ink/80 p-5 lg:border-b-0 lg:border-r-2">
        <Seg label="Category" options={CATS} value={cat} onChange={setCat} />
        <Slider
          id="cap"
          label="Maximum discount"
          value={capIdx}
          min={0}
          max={CAPS.length - 1}
          display={cap >= 1 ? "No cap" : `${Math.round(cap * 100)}%`}
          onChange={setCapIdx}
        />
        <Slider
          id="retention"
          label="Customers who still buy at the capped discount"
          value={retention}
          min={0}
          max={100}
          display={`${retention}%`}
          onChange={setRetention}
        />
        <div aria-live="polite">
          <p className="text-sm font-medium text-band-ink-2">Profit on the same orders</p>
          <p className="mt-1 font-mono text-4xl font-semibold tnum text-band-ink">{money(now)}</p>
          <p className="mt-1 font-mono text-sm font-semibold tnum">
            <span className={delta >= 0 ? "text-flow" : "text-kaizen"}>
              {delta >= 0 ? "+" : "−"}
              {money(Math.abs(delta))}
            </span>
            <span className="text-band-ink-2"> vs {money(base)} today</span>
          </p>
          <div className="relative mt-5 h-2 bg-band-ink/15" aria-hidden="true">
            <div className="absolute inset-y-0 bg-flow/40" style={{ left: `${at(Math.min(low, high))}%`, width: `${Math.abs(at(high) - at(low))}%` }} />
            <motion.div
              className="absolute -top-1.5 h-5 w-2 -translate-x-1/2 bg-flow"
              animate={{ left: `${at(now)}%` }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px] text-band-ink-2">
            <span>nobody stays {money(low)}</span>
            <span>everyone stays {money(high)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col p-5">
        <p className="mb-4 text-sm font-medium text-band-ink-2">Margin by discount level</p>
        <ul className="space-y-2.5">
          {bands.map((b) => {
            const w = (Math.abs(b.margin) / maxAbs) * 50;
            const capped = BAND_MAX[b.band] > cap;
            return (
              <li key={b.band} className="grid grid-cols-[4.5rem_1fr_4.5rem] items-center gap-3 text-sm">
                <span className={capped ? "text-band-ink-2 line-through" : "text-band-ink"}>{b.band}</span>
                <div className="relative h-5">
                  <div className="absolute inset-y-[-3px] left-1/2 w-px bg-band-ink/40" />
                  <motion.div
                    className={`absolute inset-y-0 ${b.margin >= 0 ? "bg-band-ink" : "bg-kaizen"}`}
                    initial={false}
                    animate={{ left: b.margin >= 0 ? "50%" : `${50 - w}%`, width: `${w}%`, opacity: capped ? 0.35 : 1 }}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 26 }}
                  />
                </div>
                <span className={`text-right font-mono tnum ${b.margin >= 0 ? "text-band-ink" : "text-kaizen"}`}>
                  {b.margin > 0 ? "+" : b.margin < 0 ? "−" : ""}
                  {Math.abs(b.margin * 100).toFixed(1)}%
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-5 text-sm leading-relaxed text-band-ink-2">
          Crossed-out levels are above your cap. Their orders are re-priced at the cap: list price is sales / (1 − discount), cost is
          sales − profit, and only the share of customers you set is kept.
        </p>
        <p className="mt-auto pt-4 text-xs text-band-ink-2">Real data: {data.rows.toLocaleString("en-US")} Global Superstore order lines, 2011 to 2014.</p>
      </div>
    </div>
  );
}
