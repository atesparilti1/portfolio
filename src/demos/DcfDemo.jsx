import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import data from "../data/asml_dcf.json";

// Unlevered free cash flows per scenario, exported from the project's model.py. Changing
// WACC, terminal growth or the exit multiple does not change the cash flows, only how they
// are discounted and capitalised, so the price below is the same math as the Excel model.
const CASES = ["Bear", "Base", "Bull"];
const METHODS = ["Blend", "Gordon", "Exit"];
const AXIS_MAX = 2000;

function value(c, wacc, g, mult) {
  const sumPv = c.cf.reduce((s, cf, i) => s + cf / (1 + wacc) ** c.disc[i], 0);
  const disc = (1 + wacc) ** c.tn;
  const toPrice = (tv) => (sumPv + tv / disc + data.bridge) / data.shares;
  const gordon = toPrice((c.lastUfcf * (1 + g)) / (wacc - g));
  const exit = toPrice(c.lastEbitda * mult);
  // Reverse DCF: the terminal value today's price needs, as a multiple and as perpetual growth.
  const need = (data.price * data.shares - data.bridge - sumPv) * disc;
  return {
    gordon,
    exit,
    blend: 0.5 * gordon + 0.5 * exit,
    needMult: need / c.lastEbitda,
    needG: (need * wacc - c.lastUfcf) / (need + c.lastUfcf),
  };
}

const eur = (v) => `€${Math.round(v).toLocaleString("en-US")}`;
const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const at = (v) => `${Math.max(0, Math.min(100, (v / AXIS_MAX) * 100))}%`;

function Seg({ label, options, value: v, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink-2">{label}</legend>
      <div className="flex gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            aria-pressed={o === v}
            className={`border-2 px-3 py-1.5 text-sm font-semibold transition-colors active:translate-y-px ${
              o === v ? "border-flow bg-flow text-flow-ink" : "border-ink/30 hover:border-ink"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Slider({ id, label, display, ...rest }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 flex justify-between text-sm font-medium text-ink-2">
        <span>{label}</span>
        <span className="font-mono font-semibold text-ink">{display}</span>
      </span>
      <input id={id} type="range" className="range w-full" {...rest} />
    </label>
  );
}

export default function DcfDemo() {
  const reduce = useReducedMotion();
  const [scenario, setScenario] = useState("Base");
  const [method, setMethod] = useState("Blend");
  const c = data.cases[scenario];
  const [wacc, setWacc] = useState(c.wacc * 100);
  const [g, setG] = useState(c.g * 100);
  const [mult, setMult] = useState(c.exit);

  const pickScenario = (s) => {
    const n = data.cases[s];
    setScenario(s);
    setWacc(n.wacc * 100);
    setG(n.g * 100);
    setMult(n.exit);
  };

  const gSafe = Math.min(g, wacc - 0.5);
  const r = value(c, wacc / 100, gSafe / 100, mult);
  const price = r[method.toLowerCase()];
  const vsMarket = price / data.price - 1;
  const spring = reduce ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 28 };

  return (
    <div className="border-2 border-ink bg-sheet">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink px-4 py-3">
        <p className="font-mono text-xs text-ink-2">ASML Holding N.V. · {data.asOf}</p>
        <p className="font-mono text-xs text-ink-2">market {eur(data.price)}</p>
      </div>

      <div className="grid gap-6 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-5">
        <div className="space-y-5">
          <Seg label="Scenario" options={CASES} value={scenario} onChange={pickScenario} />
          <Seg label="Terminal value" options={METHODS} value={method} onChange={setMethod} />
          <Slider id="dcf-wacc" label="WACC" display={pct(wacc / 100, 2)} min="7" max="12" step="0.01" value={wacc} onChange={(e) => setWacc(+e.target.value)} />
          <Slider
            id="dcf-g"
            label="Terminal growth"
            display={pct(gSafe / 100)}
            min="1"
            max="4"
            step="0.1"
            value={g}
            onChange={(e) => setG(+e.target.value)}
            disabled={method === "Exit"}
          />
          <Slider
            id="dcf-mult"
            label="Exit EV/EBITDA on FY35"
            display={`${mult.toFixed(0)}x`}
            min="10"
            max="35"
            step="1"
            value={mult}
            onChange={(e) => setMult(+e.target.value)}
            disabled={method === "Gordon"}
          />
        </div>

        <div className="flex flex-col" aria-live="polite">
          <p className="text-sm font-medium text-ink-2">Implied value per share</p>
          <p className="mt-1 font-mono text-5xl font-semibold tnum">{eur(price)}</p>
          <p className={`mt-1 font-mono text-sm font-semibold tnum ${vsMarket >= 0 ? "text-flow" : "text-ink"}`}>
            {vsMarket >= 0 ? "+" : "−"}
            {pct(Math.abs(vsMarket))} vs market
          </p>

          <div className="mt-6 space-y-3 text-xs" aria-hidden="true">
            {[
              ["52-week range", data.low52, data.high52],
              ["Trading comps", data.comps.low, data.comps.high],
            ].map(([label, lo, hi]) => (
              <div key={label} className="grid grid-cols-[6.5rem_1fr] items-center gap-3">
                <span className="text-ink-2">{label}</span>
                <div className="relative h-3 bg-ink/10">
                  <div className="absolute inset-y-0 bg-ink/35" style={{ left: at(lo), width: `calc(${at(hi)} - ${at(lo)})` }} />
                  <div className="absolute -inset-y-1.5 w-0.5 bg-ink" style={{ left: at(data.price) }} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[6.5rem_1fr] items-center gap-3">
              <span className="font-semibold text-ink">This DCF</span>
              <div className="relative h-3 bg-ink/10">
                <motion.div className="absolute -top-1 h-5 w-2.5 -translate-x-1/2 bg-flow" animate={{ left: at(price) }} transition={spring} />
                <div className="absolute -inset-y-1.5 w-0.5 bg-ink" style={{ left: at(data.price) }} />
              </div>
            </div>
            <div className="grid grid-cols-[6.5rem_1fr] gap-3 font-mono text-[10px] text-ink-3">
              <span />
              <span className="flex justify-between">
                <span>€0</span>
                <span>€1,000</span>
                <span>€2,000</span>
              </span>
            </div>
          </div>

          <p className="mt-auto border-t-2 border-ink pt-3 text-sm leading-relaxed">
            <span className="font-bold">Reverse DCF:</span> today's price needs a{" "}
            <span className="font-mono font-semibold tnum">{r.needMult.toFixed(0)}x</span> exit multiple, or{" "}
            <span className="font-mono font-semibold tnum">{pct(r.needG)}</span> growth forever after 2035.
          </p>
        </div>
      </div>
      <p className="border-t border-ink/20 px-4 py-2 text-xs text-ink-3">
        Same cash flows as the Excel model: FY26 to FY35, mid-year discounting, net cash and investments added to reach equity. Black line: market price.
      </p>
    </div>
  );
}
