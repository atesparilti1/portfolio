import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

// Results from the project's full 20,000-path run, as published in its README. Equity value
// is measured against holding no buffer, with the 95% confidence interval of the mean.
const POLICIES = [
  { id: "none", label: "No buffer", detail: "Nothing held beyond normal stock", stock: 0, value: 0, ci: null, onTime: 57 },
  { id: "all", label: "2 sets of everything", detail: "Two spares of every module, optics included", stock: 338, value: -193, ci: [-197, -188], onTime: 69 },
  { id: "pick", label: "Recommended", detail: "2 NXE light sources, 5 NXE + 1 EXE drive lasers, no optics", stock: 82, value: 59, ci: [55, 62], onTime: 63 },
];

// What the recommended buffer is worth as supplier failures cluster more strongly.
const CLUSTERING = [
  ["Independent", "+€9m"],
  ["Central case", "+€59m"],
  ["Doubled", "+€131m"],
];

const SCALE = 200; // bars run to ±€200m
const eur = (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}€${Math.abs(v)}m`;

export default function EuvDemo() {
  const [id, setId] = useState("pick");
  const reduce = useReducedMotion();
  const p = POLICIES.find((x) => x.id === id);

  return (
    <div className="border-2 border-ink bg-sheet text-ink">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink px-4 py-3">
        <p className="font-mono text-xs text-ink-2">ASML EUV · 2027 to 2030</p>
        <p className="font-mono text-xs text-ink-2">20,000 paths</p>
      </div>

      <div className="grid md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div className="p-4 md:p-5">
          <p className="mb-3 text-sm font-medium text-ink-2">Buffer policy</p>
          <ul className="space-y-2">
            {POLICIES.map((x) => {
              const on = x.id === id;
              const w = (Math.abs(x.value) / SCALE) * 50;
              return (
                <li key={x.id}>
                  <button
                    onClick={() => setId(x.id)}
                    aria-pressed={on}
                    className={`block w-full border-2 px-3 py-2.5 text-left transition-colors duration-200 active:translate-y-px ${
                      on ? "border-ink bg-ink text-ground" : "border-ink/25 hover:border-ink"
                    }`}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-[15px] font-semibold">{x.label}</span>
                      <span className={`font-mono text-sm font-semibold tnum ${x.value < 0 && !on ? "text-kaizen-text" : ""}`}>{x.value ? eur(x.value) : "€0"}</span>
                    </span>
                    <span aria-hidden="true" className="relative mt-2 block h-2">
                      <span className={`absolute inset-y-[-2px] left-1/2 w-px ${on ? "bg-ground/50" : "bg-ink/40"}`} />
                      <motion.span
                        className={`absolute inset-y-0 ${x.value < 0 ? "bg-kaizen" : on ? "bg-ground" : "bg-flow"}`}
                        initial={false}
                        animate={{ left: x.value < 0 ? `${50 - w}%` : "50%", width: `${w}%` }}
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 26 }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col border-t-2 border-ink bg-ground p-4 md:border-l-2 md:border-t-0 md:p-5" aria-live="polite">
          <p className="text-sm font-medium text-ink-2">Equity value vs no buffer</p>
          <p className="mt-1 font-mono text-5xl font-semibold tnum">{p.value ? eur(p.value) : "€0"}</p>
          <p className="mt-1 min-h-5 font-mono text-xs text-ink-2 tnum">{p.ci ? `95% CI ${eur(p.ci[0])} to ${eur(p.ci[1])}` : "the baseline"}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">{p.detail}.</p>

          <dl className="mt-4 grid grid-cols-2 gap-3 border-t-2 border-ink pt-3">
            <div>
              <dt className="text-xs font-medium text-ink-2">Stock held</dt>
              <dd className="mt-0.5 font-mono text-xl font-semibold tnum">€{p.stock}m</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ink-2">On-time delivery</dt>
              <dd className="mt-0.5 font-mono text-xl font-semibold tnum">{p.onTime}%</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t-2 border-ink px-4 py-3">
        <p className="text-sm font-medium text-ink-2">Recommended buffer, as failures cluster more</p>
        <dl className="mt-2 grid grid-cols-3 gap-3">
          {CLUSTERING.map(([k, v]) => (
            <div key={k}>
              <dd className="font-mono text-base font-semibold tnum">{v}</dd>
              <dt className="text-xs text-ink-2">{k}</dt>
            </div>
          ))}
        </dl>
      </div>

      <p className="border-t border-ink/20 px-4 py-2 text-xs text-ink-2">
        Supplier reliability is not public, so those inputs are labelled illustrative priors with stated ranges. Simulated outcomes, not predictions.
      </p>
    </div>
  );
}
