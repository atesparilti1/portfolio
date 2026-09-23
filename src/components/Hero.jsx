import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, EnvelopeSimple, Lightning } from "@phosphor-icons/react";
import FlowSim, { STATIONS } from "./FlowSim";
import { Magnetic, btnPrimary, btnSecondary, ease } from "./bits";
import { contact } from "../data/projects";

const HEAD = ["From", "raw", "data", "to", "shipped", "systems."];

export default function Hero() {
  const simRef = useRef(null);
  const reduce = useReducedMotion();

  const [active, setActive] = useState(STATIONS.map(() => false));
  const leadRef = useRef(null);
  const deltaRef = useRef(null);
  const statusRef = useRef(null);

  const kaizen = (i) => simRef.current?.toggle(i);

  // Read the running model a few times a second and write straight to the DOM,
  // so the readout stays live without re-rendering React on every tick.
  useEffect(() => {
    let baseline = null;
    let sim = null;
    const tick = () => {
      if (simRef.current !== sim) {
        sim = simRef.current;
        if (sim) sim.onChange = () => setActive(sim.stations.map((st) => st.latched));
      }
      if (!sim) return;
      const on = sim.stations.map((st) => st.latched);
      const any = on.some(Boolean);
      const lead = sim.leadNow ?? 0;
      if (!any || baseline === null) baseline = lead;
      const delta = lead - baseline;
      if (leadRef.current) leadRef.current.textContent = `${lead.toFixed(1)} s`;
      if (deltaRef.current) {
        const show = any && Math.abs(delta) >= 0.3;
        deltaRef.current.textContent = show ? `${delta < 0 ? "−" : "+"}${Math.abs(delta).toFixed(1)} s` : "";
        deltaRef.current.style.opacity = show ? "1" : "0";
        deltaRef.current.style.color = delta < 0 ? "var(--flow)" : "var(--ink-2)";
      }
      const q = sim.stations[1].queue.length;
      let msg;
      if (on[1]) msg = q > 2 ? "Kaizen on the bottleneck. The queue is draining and lead time is falling." : "Bottleneck cleared. Work now flows straight through.";
      else if (on[0]) msg = "IE is faster, but that only piles more work in front of Finance. The bottleneck sets the pace.";
      else if (on[2]) msg = "Full-stack is faster, but lead time barely moves. Finance still sets the pace.";
      else msg = "Finance is the bottleneck, so work piles up in front of it.";
      if (statusRef.current && statusRef.current.textContent !== msg) statusRef.current.textContent = msg;
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="top" className="relative pt-24">
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-10">
        <h1 className="display text-[clamp(2.6rem,4.9vw,5.1rem)] lg:col-span-8">
          {HEAD.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span
                className={`inline-block ${w === "shipped" ? "text-flow" : ""}`}
                initial={reduce ? false : { y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.08 + i * 0.06, ease }}
              >
                {w}
              </motion.span>
              {i < HEAD.length - 1 && " "}
            </span>
          ))}
        </h1>
        <motion.div
          className="flex flex-col justify-end gap-6 lg:col-span-4 lg:pb-3"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
        >
          <p className="max-w-[38ch] text-lg leading-relaxed text-ink-2">
            I'm Ates, an Industrial Engineering student at TU/e. I build full-stack apps and finance tools that turn messy data into decisions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Magnetic href="#work" className={btnPrimary}>
              See the work
              <ArrowDown size={16} weight="bold" />
            </Magnetic>
            <Magnetic href={`mailto:${contact.email}`} className={btnSecondary}>
              <EnvelopeSimple size={16} weight="bold" />
              Email me
            </Magnetic>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="mx-auto mt-8 max-w-[1400px] px-2 sm:px-4 lg:mt-10 lg:px-8"
        initial={reduce ? false : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
        animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 1.4, delay: 0.35, ease }}
      >
        <FlowSim simRef={simRef} />
      </motion.div>

      <div className="mx-auto grid max-w-[1400px] gap-5 px-4 pb-12 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8 lg:px-10">
        <div className="order-2 md:order-1">
          <p ref={statusRef} aria-live="polite" className="text-base font-semibold leading-snug text-ink">
            Finance is the bottleneck, so work piles up in front of it.
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-2">
            Tap a station to run a kaizen, a small improvement to that step. Tap it again to undo.
          </p>
        </div>
        <div className="order-1 flex flex-wrap items-stretch gap-2 md:order-2">
          <div className="flex min-w-[8.5rem] flex-col justify-center border-2 border-ink bg-sheet px-3 py-1">
            <span className="text-xs font-medium text-ink-2">Lead time</span>
            <span className="flex items-baseline gap-2">
              <span ref={leadRef} className="font-mono text-xl font-semibold tnum">
                0.0 s
              </span>
              <span ref={deltaRef} className="font-mono text-sm font-semibold text-flow opacity-0 transition-opacity duration-300 tnum" />
            </span>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Run a kaizen">
            {STATIONS.map((s, i) => (
              <button
                key={s.name}
                onClick={() => kaizen(i)}
                aria-pressed={active[i]}
                className={`group inline-flex items-center gap-1.5 border-2 border-ink px-3 py-2 text-sm font-semibold transition-colors duration-200 active:scale-[0.97] ${
                  active[i] ? "bg-kaizen text-kaizen-ink" : "hover:bg-ground-2"
                }`}
              >
                <Lightning
                  size={15}
                  weight="fill"
                  className={active[i] ? "text-kaizen-ink" : "text-kaizen"}
                />
                {s.name}
                {active[i] && <span className="ml-0.5 bg-ink px-1 text-[11px] font-bold text-ground">ON</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
