import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import series from "../data/forecast_store9_item1.json";

// Real backtest for store 9, item 1: 56 days of sales before the forecast starts, then
// the XGBoost forecast next to what actually sold. Stock on hand is simulated by the
// project, because the dataset has no stock levels.
const HIST = series.h.length;
const AHEAD = 42;
const hist = series.h;
const actual = series.a.slice(0, AHEAD);
const fc = series.p.slice(0, AHEAD);
const LEVELS = [
  { label: "90%", z: 1.2816 },
  { label: "95%", z: 1.6449 },
  { label: "99%", z: 2.3263 },
];

const W = 760;
const H = 300;
const PAD = { l: 34, r: 12, t: 16, b: 26 };
const MAX = Math.max(...hist, ...actual, ...fc) * 1.12;
const X = (i) => PAD.l + (i / (HIST + AHEAD - 1)) * (W - PAD.l - PAD.r);
const Y = (v) => PAD.t + (1 - v / MAX) * (H - PAD.t - PAD.b);
const line = (arr, off) => arr.map((v, i) => `${i ? "L" : "M"}${X(i + off).toFixed(1)},${Y(v).toFixed(1)}`).join("");

let cum = 0;
let stockoutDay = null;
series.p.forEach((v, d) => {
  cum += v;
  if (stockoutDay === null && cum > series.inv) stockoutDay = d + 1;
});

export default function ForecastDemo() {
  const [restock, setRestock] = useState(14);
  const [level, setLevel] = useState(1);
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);
  const reduce = useReducedMotion();

  const z = LEVELS[level].z;
  const demand = fc.slice(0, restock).reduce((s, v) => s + v, 0);
  const safety = z * series.sd * Math.sqrt(restock);
  const reorderPoint = demand + safety;
  const order = Math.max(0, Math.ceil(reorderPoint - series.inv));
  const atRisk = stockoutDay !== null && stockoutDay <= restock;

  const band =
    fc.map((v, i) => `${i ? "L" : "M"}${X(HIST + i).toFixed(1)},${Y(v + z * series.sd).toFixed(1)}`).join("") +
    fc
      .map((v, i) => [v, i])
      .reverse()
      .map(([v, i]) => `L${X(HIST + i).toFixed(1)},${Y(Math.max(0, v - z * series.sd)).toFixed(1)}`)
      .join("") +
    "Z";

  const onMove = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((x - PAD.l) / (W - PAD.l - PAD.r)) * (HIST + AHEAD - 1));
    if (i >= 0 && i < HIST + AHEAD) setHover(i);
  };

  const restockX = X(HIST + restock - 1);
  const stockX = stockoutDay && stockoutDay <= AHEAD ? X(HIST + stockoutDay - 1) : null;
  const ticks = [0.25, 0.5, 0.75].map((f) => Math.round(MAX * f));
  const hoverFc = hover !== null && hover >= HIST ? fc[hover - HIST] : null;
  const hoverActual = hover === null ? null : hover < HIST ? hist[hover] : actual[hover - HIST];

  return (
    <div className="border-2 border-ink bg-sheet">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink px-4 py-3">
        <p className="font-mono text-xs text-ink-2">
          store {series.store} · item {series.item}
        </p>
        <p
          className={`px-2 py-1 font-mono text-xs font-semibold ${atRisk ? "bg-ink text-ground" : "bg-flow text-flow-ink"}`}
          aria-live="polite"
        >
          {atRisk ? `Runs out on day ${stockoutDay}, before delivery` : "Covered until delivery"}
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full touch-pan-y"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Store 9 item 1: ${HIST} days of sales, then ${AHEAD} days of forecast next to actual sales. With ${series.inv} units on hand the forecast runs out on day ${stockoutDay}.`}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={Y(v)} y2={Y(v)} stroke="var(--ink)" strokeOpacity="0.1" />
            <text x={PAD.l - 8} y={Y(v) + 4} textAnchor="end" className="fill-ink-3 font-mono text-[11px]">
              {v}
            </text>
          </g>
        ))}
        <line x1={X(HIST)} x2={X(HIST)} y1={PAD.t} y2={H - PAD.b} stroke="var(--ink)" strokeDasharray="3 4" />
        <text x={X(HIST) + 6} y={H - PAD.b + 18} className="fill-ink-2 font-mono text-[11px]">
          forecast starts {series.today}
        </text>

        <rect x={X(HIST)} y={PAD.t} width={restockX - X(HIST)} height={H - PAD.t - PAD.b} fill="var(--flow)" fillOpacity="0.07" />
        <path d={band} fill="var(--flow)" fillOpacity="0.14" />
        <motion.path
          d={line(hist, 0)}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.5"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <path d={line(actual, HIST)} fill="none" stroke="var(--ink)" strokeOpacity="0.45" strokeWidth="1.3" />
        <motion.path
          d={line(fc, HIST)}
          fill="none"
          stroke="var(--flow)"
          strokeWidth="2.4"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />

        <line x1={restockX} x2={restockX} y1={PAD.t} y2={H - PAD.b} stroke="var(--flow)" strokeWidth="2" />
        <text x={restockX - 6} y={PAD.t + 12} textAnchor="end" className="fill-flow font-mono text-[11px] font-semibold">
          delivery
        </text>
        {stockX && (
          <g>
            <line x1={stockX} x2={stockX} y1={PAD.t + 18} y2={H - PAD.b} stroke="var(--ink)" strokeWidth="2" />
            <rect x={stockX - 5} y={PAD.t + 18} width="10" height="10" fill="var(--ink)" />
            <text
              x={stockX + (stockX > restockX ? 8 : -8)}
              y={PAD.t + 42}
              textAnchor={stockX > restockX ? "start" : "end"}
              className="fill-ink font-mono text-[11px] font-semibold"
            >
              runs out
            </text>
          </g>
        )}

        {hover !== null && (
          <g pointerEvents="none">
            <line x1={X(hover)} x2={X(hover)} y1={PAD.t} y2={H - PAD.b} stroke="var(--ink)" strokeOpacity="0.5" />
            <circle cx={X(hover)} cy={Y(hoverActual)} r="4" fill="var(--ink)" />
            {hoverFc !== null && <circle cx={X(hover)} cy={Y(hoverFc)} r="4.5" fill="var(--flow)" />}
            <text
              x={X(hover) + (hover > (HIST + AHEAD) * 0.62 ? -10 : 10)}
              y={PAD.t + 12}
              textAnchor={hover > (HIST + AHEAD) * 0.62 ? "end" : "start"}
              className="fill-ink font-mono text-[12px] font-semibold"
            >
              {hover < HIST ? `day ${hover - HIST}: sold ${hoverActual}` : `day +${hover - HIST + 1}: sold ${hoverActual}, forecast ${hoverFc.toFixed(1)}`}
            </text>
          </g>
        )}
      </svg>

      <div className="grid gap-5 border-t-2 border-ink px-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 flex justify-between text-sm font-medium text-ink-2">
              <span>Days until next delivery</span>
              <span className="font-mono font-semibold text-ink">{restock}</span>
            </span>
            <input type="range" min="3" max="28" value={restock} onChange={(e) => setRestock(+e.target.value)} className="range w-full" />
          </label>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-2">Service level</legend>
            <div className="flex gap-1.5">
              {LEVELS.map((l, i) => (
                <button
                  key={l.label}
                  onClick={() => setLevel(i)}
                  aria-pressed={i === level}
                  className={`border-2 px-3 py-1.5 text-sm font-semibold transition-colors active:translate-y-px ${
                    i === level ? "border-flow bg-flow text-flow-ink" : "border-ink/30 hover:border-ink"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div>
          <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm" aria-live="polite">
            <dt className="text-ink-2">On hand (simulated)</dt>
            <dd className="text-right font-mono font-semibold tnum">{series.inv}</dd>
            <dt className="text-ink-2">Forecast demand until delivery</dt>
            <dd className="text-right font-mono font-semibold tnum">{Math.round(demand)}</dd>
            <dt className="text-ink-2">Safety stock</dt>
            <dd className="text-right font-mono font-semibold tnum">{Math.round(safety)}</dd>
            <dt className="text-ink-2">Reorder point</dt>
            <dd className="text-right font-mono font-semibold tnum">{Math.round(reorderPoint)}</dd>
          </dl>
          <p className="mt-3 flex items-baseline justify-between border-t-2 border-ink pt-2">
            <span className="text-sm font-bold">Order now</span>
            <span className="font-mono text-2xl font-semibold tnum">{order} units</span>
          </p>
        </div>
      </div>
      <p className="border-t border-ink/20 px-4 py-2 text-xs text-ink-3">
        Real backtest: grey is what sold, blue is the XGBoost forecast. Safety stock = z × σ × √days, with σ the daily forecast error.
      </p>
    </div>
  );
}
