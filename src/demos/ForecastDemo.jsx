import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

// Seeded PRNG so the illustrative series is stable between renders.
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HIST = 70;
const AHEAD = 28;
const INVENTORY = 330; // real row from the model's stockout table (store 9, item 1)

function buildSeries() {
  const rnd = mulberry32(9);
  const weekly = [0.82, 0.95, 0.97, 1.0, 1.06, 1.14, 1.2];
  const level = (t) => 25.5 + t * 0.018;
  const hist = [];
  for (let t = 0; t < HIST; t++) {
    const noise = (rnd() - 0.5) * 9;
    hist.push(Math.max(6, level(t) * weekly[t % 7] + noise));
  }
  const fc = [];
  for (let h = 0; h < AHEAD; h++) {
    const t = HIST + h;
    const mean = level(t) * weekly[t % 7];
    const band = 3.2 + h * 0.16;
    fc.push({ mean, lo: mean - band, hi: mean + band });
  }
  return { hist, fc };
}

const W = 760;
const H = 300;
const PAD = { l: 34, r: 12, t: 16, b: 26 };
const X = (i) => PAD.l + (i / (HIST + AHEAD - 1)) * (W - PAD.l - PAD.r);
const Y = (v) => PAD.t + (1 - v / 48) * (H - PAD.t - PAD.b);

export default function ForecastDemo() {
  const { hist, fc } = useMemo(buildSeries, []);
  const [restock, setRestock] = useState(14);
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);
  const reduce = useReducedMotion();

  const histPath = hist.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join("");
  const fcPath = fc
    .map((p, h) => `${h ? "L" : "M"}${X(HIST + h).toFixed(1)},${Y(p.mean).toFixed(1)}`)
    .join("");
  const band =
    fc.map((p, h) => `${h ? "L" : "M"}${X(HIST + h).toFixed(1)},${Y(p.hi).toFixed(1)}`).join("") +
    fc
      .slice()
      .reverse()
      .map((p, k) => `L${X(HIST + AHEAD - 1 - k).toFixed(1)},${Y(p.lo).toFixed(1)}`)
      .join("") +
    "Z";

  let cum = 0;
  let stockoutDay = null;
  fc.forEach((p, h) => {
    cum += p.mean;
    if (stockoutDay === null && cum > INVENTORY) stockoutDay = h + 1;
  });
  const demandInWindow = fc.slice(0, restock).reduce((s, p) => s + p.mean, 0);
  const atRisk = stockoutDay !== null && stockoutDay < restock;

  const onMove = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((x - PAD.l) / (W - PAD.l - PAD.r)) * (HIST + AHEAD - 1));
    if (i >= 0 && i < HIST + AHEAD) setHover(i);
  };

  const hv = hover === null ? null : hover < HIST ? hist[hover] : fc[hover - HIST].mean;
  const restockX = X(HIST + restock - 1);
  const stockX = stockoutDay ? X(HIST + stockoutDay - 1) : null;

  return (
    <div className="border-2 border-ink bg-sheet">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink px-4 py-3">
        <p className="font-mono text-xs text-ink-2">store 9 · item 1</p>
        <p
          className={`px-2 py-1 font-mono text-xs font-semibold ${
            atRisk ? "bg-ink text-ground" : "bg-flow text-flow-ink"
          }`}
          aria-live="polite"
        >
          {atRisk ? `Stockout on day ${stockoutDay}` : "Covered until restock"}
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full touch-pan-y"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Daily demand for the last ${HIST} days and a ${AHEAD}-day forecast with an uncertainty band. With ${INVENTORY} units on hand, the forecast runs out on day ${stockoutDay}.`}
      >
        {[10, 20, 30, 40].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={Y(v)} y2={Y(v)} stroke="var(--ink)" strokeOpacity="0.1" />
            <text x={PAD.l - 8} y={Y(v) + 4} textAnchor="end" className="fill-ink-3 font-mono text-[11px]">
              {v}
            </text>
          </g>
        ))}
        <line x1={X(HIST)} x2={X(HIST)} y1={PAD.t} y2={H - PAD.b} stroke="var(--ink)" strokeDasharray="3 4" />
        <text x={X(HIST) + 6} y={H - PAD.b + 18} className="fill-ink-2 font-mono text-[11px]">
          today
        </text>

        <rect x={X(HIST)} y={PAD.t} width={restockX - X(HIST)} height={H - PAD.t - PAD.b} fill="var(--flow)" fillOpacity="0.07" />
        <path d={band} fill="var(--flow)" fillOpacity="0.16" />
        <motion.path
          d={histPath}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.6"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d={fcPath}
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
          restock
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
              stock out
            </text>
          </g>
        )}

        {hover !== null && (
          <g pointerEvents="none">
            <line x1={X(hover)} x2={X(hover)} y1={PAD.t} y2={H - PAD.b} stroke="var(--ink)" strokeOpacity="0.5" />
            <circle cx={X(hover)} cy={Y(hv)} r="4.5" fill={hover < HIST ? "var(--ink)" : "var(--flow)"} />
            <text
              x={X(hover) + (hover > (HIST + AHEAD) * 0.7 ? -10 : 10)}
              y={Math.max(PAD.t + 12, Y(hv) - 12)}
              textAnchor={hover > (HIST + AHEAD) * 0.7 ? "end" : "start"}
              className="fill-ink font-mono text-[12px] font-semibold"
            >
              {hover < HIST ? `day ${hover - HIST}` : `day +${hover - HIST + 1}`} · {hv.toFixed(1)} units
            </text>
          </g>
        )}
      </svg>

      <div className="grid gap-4 border-t-2 border-ink px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-2 flex justify-between text-sm font-medium text-ink-2">
            <span>Days until next restock</span>
            <span className="font-mono font-semibold text-ink">{restock}</span>
          </span>
          <input
            type="range"
            min="5"
            max="28"
            value={restock}
            onChange={(e) => setRestock(+e.target.value)}
            className="range w-full"
          />
        </label>
        <dl className="grid grid-cols-2 gap-x-6 font-mono text-xs">
          <dt className="text-ink-2">on hand</dt>
          <dd className="text-right font-semibold tnum">{INVENTORY}</dd>
          <dt className="text-ink-2">demand to restock</dt>
          <dd className="text-right font-semibold tnum">{demandInWindow.toFixed(0)}</dd>
        </dl>
      </div>
      <p className="border-t border-ink/20 px-4 py-2 text-xs text-ink-3">
        Illustrative series drawn in your browser. Inventory and metrics are from the real model.
      </p>
    </div>
  );
}
