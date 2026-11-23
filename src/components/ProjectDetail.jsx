import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { track } from "@vercel/analytics";
import { ArrowLeft, ArrowRight, ArrowUpRight, GithubLogo, X } from "@phosphor-icons/react";
import { featured } from "../data/projects";
import DcfDemo from "../demos/DcfDemo";
import EuvDemo from "../demos/EuvDemo";
import FilingDemo from "../demos/FilingDemo";
import ForecastDemo from "../demos/ForecastDemo";
import OpsDemo from "../demos/OpsDemo";
import { ease } from "./bits";

const DEMOS = { dcf: DcfDemo, euv: EuvDemo, filing: FilingDemo, forecast: ForecastDemo, ops: OpsDemo };

// Inside a screen: the whole project. It opens out of the panel the camera
// just flew into, as a window growing from the middle of the view.
export default function ProjectDetail({ index, onClose, onGo }) {
  const p = featured[index];
  const Demo = DEMOS[p.demo];
  const reduce = useReducedMotion();
  const closeRef = useRef(null);
  const scrollRef = useRef(null);
  const n = featured.length;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    scrollRef.current?.scrollTo(0, 0);
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && !e.target.closest?.("input")) onGo((index + 1) % n);
      if (e.key === "ArrowLeft" && !e.target.closest?.("input")) onGo((index - 1 + n) % n);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [index, n, onClose, onGo]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
      className="fixed inset-0 z-50 bg-[rgb(4_6_12/0.9)] backdrop-blur-xl"
      initial={reduce ? false : { opacity: 0, clipPath: "inset(30% 24% 30% 24% round 24px)" }}
      animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 0px)" }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(30% 24% 30% 24% round 24px)" }}
      transition={{ duration: 0.75, ease }}
    >
      <div ref={scrollRef} data-lenis-prevent className="h-full overflow-y-auto overscroll-contain">
        <header className="sticky top-0 z-10 border-b border-line bg-[rgb(5_6_10/0.75)] backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-3 px-4 sm:px-6">
            <span className="wide truncate text-[15px] font-bold">{p.title}</span>
            <span className="hidden rounded-full border border-line px-2.5 py-0.5 text-[12px] font-semibold text-ink-2 sm:inline">{p.station}</span>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => onGo((index - 1 + n) % n)} aria-label="Previous project" className="grid size-10 place-items-center rounded-full border border-line hover:bg-white/10">
                <ArrowLeft size={18} weight="bold" />
              </button>
              <button type="button" onClick={() => onGo((index + 1) % n)} aria-label="Next project" className="grid size-10 place-items-center rounded-full border border-line hover:bg-white/10">
                <ArrowRight size={18} weight="bold" />
              </button>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close project" className="ml-1 grid size-10 place-items-center rounded-full bg-ink text-ground hover:bg-white">
                <X size={18} weight="bold" />
              </button>
            </div>
          </div>
        </header>

        <motion.div
          key={p.id}
          className="mx-auto max-w-[1240px] px-4 pb-24 pt-10 sm:px-6 lg:pt-14"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: reduce ? 0 : 0.25, ease }}
        >
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <h2 id="project-title" className="display text-[clamp(2.2rem,4.4vw,3.8rem)]">
                {p.title}
              </h2>
              <p className="mt-5 text-xl leading-snug">{p.headline}</p>
              <p className="mt-4 text-[17px] leading-relaxed text-ink-2">{p.line}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {p.links.demo && (
                  <a href={p.links.demo} target="_blank" rel="noreferrer" onClick={() => track("project_open", { project: p.id, target: "demo" })} className="btn btn-primary">
                    Live demo
                    <ArrowUpRight size={16} weight="bold" />
                  </a>
                )}
                {p.links.github && (
                  <a href={p.links.github} target="_blank" rel="noreferrer" onClick={() => track("project_open", { project: p.id, target: "github" })} className="btn btn-ghost">
                    <GithubLogo size={17} weight="bold" />
                    Source
                  </a>
                )}
              </div>
              <h3 className="wide mt-9 text-[14px] font-bold text-ink-2">Built with</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li key={s} className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[14px] font-semibold">
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7">
              {p.shot ? (
                <figure>
                  <div className="overflow-hidden rounded-2xl border border-line shadow-[0_40px_120px_-40px_rgb(59_130_246/0.45)]">
                    <img src={p.shot.src} alt={p.shot.alt} width={p.shot.w} height={p.shot.h} className="block h-auto w-full" />
                  </div>
                  <figcaption className="mt-3 text-[14px] text-ink-3">{p.shot.caption}</figcaption>
                </figure>
              ) : (
                <dl className="grid h-full content-center gap-6 rounded-2xl border border-line bg-white/[0.02] p-8">
                  {p.proof.map((x) => (
                    <div key={x.k}>
                      <dd className="font-mono text-4xl font-semibold text-band-flow tnum">{x.v}</dd>
                      <dt className="mt-1 text-ink-2">{x.k}</dt>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>

          {p.shot && (
            <dl className="mt-12 grid grid-cols-1 gap-6 border-y border-line py-8 sm:grid-cols-3">
              {p.proof.map((x) => (
                <div key={x.k}>
                  <dd className="font-mono text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold text-band-flow tnum">{x.v}</dd>
                  <dt className="mt-1 text-ink-2">{x.k}</dt>
                </div>
              ))}
            </dl>
          )}

          {Demo && (
            <section className="mt-14">
              <h3 className="display text-[clamp(1.6rem,2.6vw,2.2rem)]">Try it here</h3>
              <div className="demo-frame mt-5 text-ink">
                <Demo />
              </div>
            </section>
          )}

          <section className="mt-16">
            <h3 className="display text-[clamp(1.6rem,2.6vw,2.2rem)]">How it was built</h3>
            <div className="mt-6 grid gap-x-12 gap-y-8 md:grid-cols-2">
              {p.case.map(([k, v]) => (
                <div key={k} className="border-t border-line pt-4">
                  <h4 className="wide font-bold text-band-flow">{k}</h4>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink-2">{v}</p>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>
    </motion.div>
  );
}
