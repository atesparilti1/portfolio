import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Quotes } from "@phosphor-icons/react";
import filings from "../data/filings.json";

const ease = [0.16, 1, 0.3, 1];

export default function FilingDemo() {
  const [ti, setTi] = useState(filings.findIndex((f) => f.ticker === "NVDA"));
  const [pick, setPick] = useState({ kind: "risk", i: 0 });
  const reduce = useReducedMotion();
  const f = filings[ti];
  const items = [
    ...f.risks.map((r, i) => ({ kind: "risk", i, title: r.title, tag: r.severity, evidence: r.evidence })),
    ...f.growth.map((g, i) => ({ kind: "growth", i, title: g.title, tag: "Growth", evidence: g.evidence })),
  ];
  const active = items.find((x) => x.kind === pick.kind && x.i === pick.i) || items[0];

  return (
    <div className="border-2 border-ink bg-sheet">
      <div role="tablist" aria-label="Demo filings" className="flex border-b-2 border-ink">
        {filings.map((x, i) => (
          <button
            key={x.ticker}
            role="tab"
            aria-selected={i === ti}
            onClick={() => {
              setTi(i);
              setPick({ kind: "risk", i: 0 });
            }}
            className={`relative flex-1 px-2 py-3 font-mono text-xs font-semibold transition-colors duration-200 sm:text-sm ${
              i === ti ? "text-flow-ink" : "text-ink hover:bg-ground-2"
            } ${i ? "border-l-2 border-ink" : ""}`}
          >
            {i === ti && (
              <motion.span
                layoutId="tab-fill"
                className="absolute inset-0 bg-flow"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative">{x.ticker}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 pb-2 pt-4">
        <p className="wide text-lg font-bold">{f.company}</p>
        <p className="font-mono text-xs text-ink-2">
          {f.form} filed {f.filed}
        </p>
      </div>

      <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <ul className="px-2 pb-3">
          {items.map((x) => {
            const on = x === active;
            return (
              <li key={`${x.kind}-${x.i}`}>
                <button
                  onClick={() => setPick({ kind: x.kind, i: x.i })}
                  onMouseEnter={() => setPick({ kind: x.kind, i: x.i })}
                  aria-pressed={on}
                  className={`flex w-full items-center justify-between gap-3 px-2 py-2.5 text-left transition-colors duration-200 ${
                    on ? "bg-ink text-ground" : "hover:bg-ground-2"
                  }`}
                >
                  <span className="text-[15px] font-semibold leading-snug">{x.title}</span>
                  <span
                    className={`shrink-0 px-1.5 py-0.5 text-xs font-semibold ${
                      x.kind === "growth"
                        ? "bg-flow text-flow-ink"
                        : on
                        ? "bg-ground text-ink"
                        : "border border-ink/40 text-ink-2"
                    }`}
                  >
                    {x.tag}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="relative min-h-[15rem] border-t-2 border-ink bg-ground p-5 md:border-l-2 md:border-t-0">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-ink-2">
            <Quotes size={16} weight="fill" className="text-flow" />
            Evidence from the filing
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.blockquote
              key={`${f.ticker}-${active.kind}-${active.i}`}
              initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease }}
              className="text-[15px] leading-relaxed text-ink"
            >
              “{active.evidence}”
            </motion.blockquote>
          </AnimatePresence>
        </div>
      </div>
      <p className="border-t border-ink/20 px-4 py-2 text-xs text-ink-3">
        Real output from the app's demo mode. Quotes come straight from each 10-K.
      </p>
    </div>
  );
}
