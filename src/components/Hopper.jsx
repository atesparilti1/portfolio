import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";

/*
  The work item from the hero sim, travelling down the page with the reader.
  Scroll progress picks a step on a zigzag staircase in the right gutter; every
  change of step is one hop (arc, squash on landing, a puff of dust).
*/

const STEPS = 14;
const SECTIONS = ["#top", "#work", "#about", "#contact"];

export default function Hopper() {
  const reduce = useReducedMotion();
  const trackRef = useRef(null);
  const [h, setH] = useState(0);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [poke, setPoke] = useState(0);
  const stepRef = useRef(0);
  const { scrollYProgress } = useScroll();
  // Scale with the free margin beside the 1400px content column.
  const [tier, setTier] = useState(0);
  useEffect(() => {
    const mqs = ["(min-width: 1400px)", "(min-width: 1600px)"].map((q) => window.matchMedia(q));
    const on = () => setTier(mqs.filter((m) => m.matches).length);
    on();
    mqs.forEach((m) => m.addEventListener("change", on));
    return () => mqs.forEach((m) => m.removeEventListener("change", on));
  }, []);
  const SIZE = [12, 14, 18][tier];
  const LEDGE = [13, 18, 26][tier];
  const W = LEDGE * 2 + 8;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = Math.min(STEPS - 1, Math.max(0, Math.round(v * (STEPS - 1))));
    if (s !== stepRef.current) {
      setDir(s > stepRef.current ? 1 : -1);
      stepRef.current = s;
      setStep(s);
    }
  });

  const gap = h / (STEPS - 1);
  const xAt = (i) => (i % 2 === 0 ? 0 : LEDGE + 2);
  const yAt = (i) => i * gap - SIZE;
  const done = step === STEPS - 1;

  const hopToNext = () => {
    setPoke((p) => p + 1);
    const y = window.scrollY + 80;
    const next = SECTIONS.map((id) => document.querySelector(id)).find((el) => el && el.getBoundingClientRect().top + window.scrollY > y);
    (next || document.querySelector("#top"))?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      style={{ width: W }}
      className="pointer-events-none fixed bottom-[14vh] right-1 top-[16vh] z-20 hidden min-[1280px]:block min-[1400px]:right-2 min-[1600px]:right-auto min-[1600px]:left-[calc(50%+700px+36px)]"
    >
      {h > 0 && (
        <>
          {/* Staircase: ledges already travelled turn flow blue. */}
          <svg width={W + 20} height={h + 4} className="absolute left-0 top-0 overflow-visible">
            {Array.from({ length: STEPS }, (_, i) => {
              const x = xAt(i);
              const y = i * gap + 1;
              const passed = i <= step;
              const riser = i < STEPS - 1;
              return (
                <g key={i}>
                  <line
                    x1={x - 3}
                    x2={x + LEDGE + 3}
                    y1={y}
                    y2={y}
                    stroke={passed ? "var(--flow)" : "var(--ink)"}
                    strokeOpacity={passed ? 1 : 0.28}
                    strokeWidth="2.5"
                    style={{ transition: "stroke 0.4s, stroke-opacity 0.4s" }}
                  />
                  {riser && (
                    <line
                      x1={i % 2 === 0 ? x + LEDGE + 3 : x - 3}
                      x2={i % 2 === 0 ? x + LEDGE + 3 : x - 3}
                      y1={y}
                      y2={y + gap}
                      stroke="var(--ink)"
                      strokeOpacity="0.12"
                      strokeWidth="1.5"
                      strokeDasharray="3 4"
                    />
                  )}
                </g>
              );
            })}
            {/* Goal: the customer at the bottom of the stream. */}
            <path
              d={`M${2} ${(STEPS - 1) * gap + 1} v-12 l5 -5 v5 l5 -5 v5 l5 -5 v17 z`}
              fill={done ? "var(--flow)" : "var(--sheet)"}
              stroke="var(--ink)"
              strokeWidth="1.5"
              style={{ transition: "fill 0.4s" }}
            />
          </svg>

          {/* The hopper */}
          <motion.button
            type="button"
            tabIndex={-1}
            onClick={hopToNext}
            className="pointer-events-auto absolute left-[2px] top-0 cursor-pointer"
            style={{ width: SIZE, height: SIZE }}
            initial={false}
            animate={
              reduce
                ? { x: xAt(step), y: yAt(step) }
                : {
                    x: xAt(step),
                    y: [null, Math.min(yAt(step), yAt(step - dir) ?? yAt(step)) - 26, yAt(step)],
                  }
            }
            transition={
              reduce
                ? { duration: 0 }
                : {
                    x: { duration: 0.42, ease: [0.3, 0, 0.3, 1] },
                    y: { duration: 0.46, times: [0, 0.38, 1], ease: ["easeOut", "easeIn"] },
                  }
            }
            whileHover={reduce ? undefined : { scale: 1.15 }}
          >
            <motion.span
              key={`${step}-${poke}`}
              className="relative block h-full w-full origin-bottom bg-flow"
              initial={false}
              animate={reduce ? {} : { scaleY: [1, 1.18, 0.66, 1.08, 1], scaleX: [1, 0.88, 1.28, 0.96, 1] }}
              transition={{ duration: 0.62, times: [0, 0.3, 0.62, 0.82, 1] }}
            >
              {/* eyes look the way the reader is scrolling; happy at the end */}
              <span
                className="hopper-eyes absolute left-1/2 flex -translate-x-1/2 gap-[2px] min-[1400px]:gap-[3px]"
                style={{ top: dir > 0 ? SIZE * 0.45 : SIZE * 0.2 }}
              >
                {done ? (
                  <>
                    <span className="block h-[3px] w-[5px] rounded-t-full border-x-[1.5px] border-t-[1.5px] border-ground" />
                    <span className="block h-[3px] w-[5px] rounded-t-full border-x-[1.5px] border-t-[1.5px] border-ground" />
                  </>
                ) : (
                  <>
                    <span className="block h-[4px] w-[3px] bg-ground" />
                    <span className="block h-[4px] w-[3px] bg-ground" />
                  </>
                )}
              </span>
            </motion.span>
          </motion.button>

          {/* Landing dust */}
          <AnimatePresence>
            {!reduce && (
              <motion.div
                key={`dust-${step}`}
                className="absolute"
                style={{ left: xAt(step) + 4, top: step * gap - 3, width: SIZE }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.55, delay: 0.4, times: [0, 0.2, 1] }}
              >
                {[-1, 1].map((s) => (
                  <motion.span
                    key={s}
                    className="absolute top-0 block h-[4px] w-[4px] bg-ink-3"
                    style={{ left: SIZE / 2 - 2 }}
                    initial={{ x: 0, y: 0 }}
                    animate={{ x: s * 16, y: -7 }}
                    transition={{ duration: 0.55, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
