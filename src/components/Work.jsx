import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { track } from "@vercel/analytics";
import { ArrowUpRight, CaretDown, Check, GithubLogo, LinkSimple } from "@phosphor-icons/react";
import DcfDemo from "../demos/DcfDemo";
import EuvDemo from "../demos/EuvDemo";
import FilingDemo from "../demos/FilingDemo";
import ForecastDemo from "../demos/ForecastDemo";
import OpsDemo from "../demos/OpsDemo";
import { LENSES, contact, featured } from "../data/projects";
import { Magnetic, Reveal } from "./bits";

const DEMOS = { dcf: DcfDemo, euv: EuvDemo, filing: FilingDemo, forecast: ForecastDemo, ops: OpsDemo };

// Copies a shareable link straight to one project, e.g. for a LinkedIn post.
function CopyLink({ id }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = `${location.origin}${location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      history.replaceState(null, "", `#${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      location.hash = id;
    }
  };
  return (
    <button
      onClick={copy}
      aria-label={copied ? "Link copied" : "Copy link to this project"}
      title="Copy link to this project"
      className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 px-2 text-xs font-semibold text-band-ink-2 transition-colors hover:text-band-ink"
    >
      {copied ? <Check size={15} weight="bold" className="text-band-flow" /> : <LinkSimple size={15} weight="bold" />}
      {copied && <span aria-live="polite">Copied</span>}
    </button>
  );
}

// One station on the line. The blue job from the hero travels to whichever is open.
function Row({ p, on, onPick, rowRef }) {
  const reduce = useReducedMotion();
  return (
    <li ref={rowRef} className="relative w-[13.5rem] shrink-0 snap-start lg:w-auto lg:pl-8">
      <span aria-hidden="true" className="absolute left-[3px] top-1/2 hidden h-3 w-3 -translate-y-1/2 border-2 border-band-ink/40 bg-band lg:block">
        {on && (
          <motion.span
            layoutId="work-job"
            className="absolute -inset-[3px] bg-band-flow"
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
          />
        )}
      </span>
      <button
        id={`tab-${p.id}`}
        role="tab"
        aria-selected={on}
        aria-controls={p.id}
        tabIndex={on ? 0 : -1}
        onClick={() => onPick(p.id)}
        className={`flex h-full w-full flex-col gap-1 border-2 px-3 py-2.5 text-left transition-colors duration-200 active:translate-y-px lg:flex-row lg:items-start lg:justify-between lg:gap-4 lg:px-4 lg:py-3.5 ${
          on ? "border-band-ink bg-band-ink text-band" : "border-band-ink/25 hover:border-band-ink/60"
        }`}
      >
        <span className="min-w-0">
          <span className="wide block text-sm font-bold leading-snug lg:text-[15px]">{p.title}</span>
          <span className={`mt-1 hidden text-sm leading-snug lg:block ${on ? "text-band/75" : "text-band-ink-2"}`}>{p.short}</span>
        </span>
        <span className={`shrink-0 font-mono text-sm font-semibold tnum lg:text-[15px] ${on ? "" : "text-band-ink-2"}`}>{p.metric}</span>
      </button>
    </li>
  );
}

function Proof({ items }) {
  return (
    <dl className="grid border-2 border-band-ink/50 sm:grid-cols-3">
      {items.map((f, i) => (
        <div
          key={f.k}
          className={`flex items-baseline justify-between gap-4 px-4 py-3 sm:block ${i ? "border-t-2 border-band-ink/50 sm:border-l-2 sm:border-t-0" : ""}`}
        >
          <dt className="text-[13px] font-medium text-band-ink-2">{f.k}</dt>
          <dd className="font-mono text-lg font-semibold tnum sm:mt-1 sm:text-xl">{f.v}</dd>
        </div>
      ))}
    </dl>
  );
}

// Problem, data, method, result: folded away so the stage stays about the finding.
function BuildNotes({ p }) {
  return (
    <details className="group border-t-2 border-band-ink/25">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[15px] font-bold transition-colors hover:text-band-flow [&::-webkit-details-marker]:hidden">
        How it was built
        <CaretDown size={16} weight="bold" className="transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="grid gap-x-8 pb-6 md:grid-cols-2">
        {p.case.map(([k, v]) => (
          <div key={k} className="border-t border-band-ink/20 py-3">
            <h4 className="text-sm font-bold">{k}</h4>
            <p className="mt-1 text-[15px] leading-relaxed text-band-ink-2">{v}</p>
          </div>
        ))}
      </div>
      {p.shot && (
        <figure className="mb-6 overflow-hidden border-2 border-band-ink/50">
          <img
            src={p.shot.src}
            alt={p.shot.alt}
            width={p.shot.w}
            height={p.shot.h}
            loading="lazy"
            className="block aspect-[16/9] w-full object-cover object-top"
          />
          <figcaption className="border-t-2 border-band-ink/50 px-3 py-2 text-xs text-band-ink-2">{p.shot.caption}</figcaption>
        </figure>
      )}
    </details>
  );
}

function Stage({ p, on }) {
  const Demo = DEMOS[p.demo];
  return (
    <article
      id={p.id}
      role="tabpanel"
      aria-labelledby={`tab-${p.id}`}
      data-panel
      data-off={on ? undefined : ""}
      className="stage-in scroll-mt-24 space-y-6 lg:scroll-mt-4"
    >
      <div>
        <div className="flex flex-wrap items-center gap-x-3">
          <p className="wide text-[15px] font-bold">{p.title}</p>
          <span className="bg-band-ink px-2 py-1 text-xs font-bold text-band wide">{p.station}</span>
          <CopyLink id={p.id} />
        </div>
        <h3 className="display mt-2 text-[clamp(1.9rem,3.3vw,3rem)]">{p.headline}</h3>
        <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-band-ink-2">{p.line}</p>
      </div>

      <Proof items={p.proof} />

      {/* Demos are paper laid on the band, except the one drawn for the band itself. */}
      {Demo && (
        <div className={p.demo === "ops" ? "" : "text-ink"}>
          <Demo />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {p.links.demo && (
            <a
              href={p.links.demo}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("project_open", { project: p.id, target: "demo" })}
              className="inline-flex items-center gap-1.5 bg-band-ink px-4 py-3 text-sm font-bold text-band transition-colors hover:bg-flow hover:text-flow-ink active:scale-[0.98]"
            >
              Open the full project
              <ArrowUpRight size={15} weight="bold" />
            </a>
          )}
          {p.links.github && (
            <a
              href={p.links.github}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("project_open", { project: p.id, target: "github" })}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold underline"
            >
              <GithubLogo size={16} weight="bold" />
              Source and README
            </a>
          )}
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] font-medium text-band-ink-2">
          {p.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <BuildNotes p={p} />
    </article>
  );
}

// The project board. The page stays the same length however many projects it holds:
// the rail lists them all, the stage runs one at a time. Every stage is in the HTML, so
// crawlers and no-JS readers still get all of them (see the noscript rule in index.html).
export default function Work() {
  const [lens, setLens] = useState("All");
  const [active, setActive] = useState(featured[0].id);
  const reduce = useReducedMotion();
  const stageRef = useRef(null);
  const railRef = useRef(null);
  const rows = useRef({});

  const shown = featured.filter((p) => lens === "All" || p.lenses.includes(lens));

  // After a switch, start the new project from its top, not halfway down the old one.
  const pick = (id) => {
    setActive(id);
    track("project_view", { project: id });
    requestAnimationFrame(() => {
      const el = stageRef.current;
      if (el && el.getBoundingClientRect().top < 72) el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    });
  };

  const pickLens = (l) => {
    setLens(l);
    track("lens", { lens: l });
    const next = featured.filter((p) => l === "All" || p.lenses.includes(l));
    if (!next.some((p) => p.id === active)) setActive(next[0].id);
  };

  // A shared #project link opens that project.
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!featured.some((p) => p.id === id)) return;
      setLens("All");
      setActive(id);
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);

  // On phones the rail is a strip: keep the open station in view.
  useEffect(() => {
    const rail = railRef.current;
    const row = rows.current[active];
    if (rail && row && rail.scrollWidth > rail.clientWidth) {
      rail.scrollTo({ left: row.offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
    }
  }, [active, reduce]);

  const onKey = (e) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = shown.findIndex((p) => p.id === active);
    const next = shown[(i + step + shown.length) % shown.length];
    pick(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <section id="work" className="bg-band text-band-ink">
      <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-20 sm:px-6 lg:px-10 lg:pb-28 lg:pt-28">
        <Reveal>
          <h2 className="display max-w-[16ch] text-[clamp(2.4rem,5vw,4.5rem)]">One line of work.</h2>
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-band-ink-2">
            Each project starts as an operations or money question and ends as software someone can use. Pick one and try it here.
          </p>
        </Reveal>

        <div data-rail className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2" role="group" aria-label="Filter projects by the role you are hiring for">
          <span className="text-sm font-medium text-band-ink-2">Hiring for</span>
          <div className="flex flex-wrap gap-1.5">
            {LENSES.map((l) => (
              <button
                key={l}
                onClick={() => pickLens(l)}
                aria-pressed={l === lens}
                className={`min-h-11 border-2 px-3 py-1.5 text-sm font-semibold transition-colors active:translate-y-px ${
                  l === lens ? "border-band-ink bg-band-ink text-band" : "border-band-ink/30 hover:border-band-ink"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-10">
          <div data-rail className="sticky top-[66px] z-10 -mx-4 min-w-0 bg-band px-4 py-2 sm:-mx-6 sm:px-6 lg:top-24 lg:col-span-4 lg:mx-0 lg:self-start lg:bg-transparent lg:p-0">
            <ul
              ref={railRef}
              role="tablist"
              aria-label="Projects"
              aria-orientation="vertical"
              onKeyDown={onKey}
              className="relative flex snap-x gap-2 overflow-x-auto [scrollbar-width:none] lg:max-h-[calc(100dvh-7.5rem)] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:py-1 lg:pr-1 lg:before:absolute lg:before:bottom-6 lg:before:left-[8px] lg:before:top-6 lg:before:border-l-2 lg:before:border-dashed lg:before:border-band-ink/25 [&::-webkit-scrollbar]:hidden"
            >
              {shown.map((p) => (
                <Row key={p.id} p={p} on={p.id === active} onPick={pick} rowRef={(el) => (rows.current[p.id] = el)} />
              ))}
            </ul>
          </div>

          <div ref={stageRef} className="scroll-mt-24 min-w-0 lg:col-span-8 lg:scroll-mt-4">
            {featured.map((p) => (
              <Stage key={p.id} p={p} on={p.id === active} />
            ))}
          </div>
        </div>

        <Reveal kind="settle" className="mt-16 flex flex-col gap-6 border-t-2 border-band-ink/25 pt-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[46ch] text-lg leading-relaxed text-band-ink-2">More projects and experiments live on GitHub.</p>
          <Magnetic
            href={contact.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 self-start whitespace-nowrap bg-band-ink px-5 py-3 text-[15px] font-bold text-band transition-colors duration-200 hover:bg-flow hover:text-flow-ink active:scale-[0.98] md:self-auto"
          >
            <GithubLogo size={18} weight="bold" />
            More on GitHub
            <ArrowUpRight size={16} weight="bold" />
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
