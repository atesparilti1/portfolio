import { Fragment, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, Copy, DownloadSimple, EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import ForecastDemo from "../demos/ForecastDemo";
import FilingDemo from "../demos/FilingDemo";
import OpsDemo from "../demos/OpsDemo";
import { featured, toolbox, contact } from "../data/projects";
import { Magnetic, PushArrow, Reveal, btnPrimary, ease } from "./bits";

function Stack({ items, tone = "ink" }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] font-medium">
      {items.map((s) => (
        <li key={s} className={tone === "band" ? "text-band-ink-2" : "text-ink-2"}>
          {s}
        </li>
      ))}
    </ul>
  );
}

function Links({ links }) {
  const entries = Object.entries(links || {}).filter(([, v]) => v);
  if (!entries.length) return null;
  return (
    <div className="flex gap-4">
      {entries.map(([k, v]) => (
        <a key={k} href={v} className="inline-flex items-center gap-1.5 text-sm font-bold underline" target="_blank" rel="noreferrer">
          {k === "github" ? <GithubLogo size={16} weight="bold" /> : <ArrowUpRight size={16} weight="bold" />}
          {k === "github" ? "Source" : "Live demo"}
        </a>
      ))}
    </div>
  );
}

// Station name set as a process-box title bar beside the project name, not above it.
function Title({ p, tone = "ink" }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <h3 className="display text-[clamp(2rem,3.6vw,3.25rem)]">{p.title}</h3>
      <span
        className={`px-2 py-1 text-xs font-bold wide ${
          tone === "band" ? "bg-band-ink text-band" : "bg-ink text-ground"
        }`}
      >
        {p.station}
      </span>
    </div>
  );
}

export function Work() {
  const [fc, sec, ops] = featured;
  return (
    <>
      <section id="work" className="mx-auto max-w-[1400px] px-4 pt-16 sm:px-6 lg:px-10 lg:pt-16">
        <Reveal>
          <h2 className="display max-w-[16ch] text-[clamp(2.4rem,5vw,4.5rem)]">Three stations, one line of work.</h2>
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-2">
            Each project starts as an operations or money question and ends as software someone can use. Try them here.
          </p>
        </Reveal>

        <PushArrow className="mb-14 mt-14 lg:mb-20" />

        {/* Demand Forecaster: text left, demo right */}
        <article className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal kind="settle" className="space-y-6 lg:col-span-4">
            <Title p={fc} />
            <p className="max-w-[48ch] text-lg leading-relaxed text-ink-2">{fc.line}</p>
            <dl className="grid grid-cols-2 border-2 border-ink bg-sheet">
              {fc.facts.map((f, i) => (
                <div key={f.k} className={`p-3 ${i % 2 ? "border-l-2 border-ink" : ""} ${i > 1 ? "border-t-2 border-ink" : ""}`}>
                  <dt className="text-xs font-medium text-ink-2">{f.k}</dt>
                  <dd className="mt-1 font-mono text-2xl font-semibold tnum">{f.v}</dd>
                </div>
              ))}
            </dl>
            <Stack items={fc.stack} />
            <Links links={fc.links} />
          </Reveal>
          <Reveal className="lg:col-span-8" delay={0.1}>
            <ForecastDemo />
          </Reveal>
        </article>
        <Reveal className="mt-10 lg:mt-12">
          <figure className="group overflow-hidden border-2 border-ink">
            <img
              src="/work/demand-forecaster-dashboard.png"
              alt="The Demand Forecaster Streamlit dashboard: 500 products tracked, 178 at risk of stockout, a 14-day restock window, and a table of at-risk products."
              width="1600"
              height="1400"
              loading="lazy"
              className="block aspect-[16/9] w-full sm:aspect-[21/8] object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <figcaption className="border-t-2 border-ink bg-sheet px-3 py-2 text-xs text-ink-2">The shipped Streamlit dashboard.</figcaption>
          </figure>
        </Reveal>

        <PushArrow className="my-16 lg:my-24" />

        {/* SEC Filing Analyzer: demo left, text right */}
        <article className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="order-2 lg:order-1 lg:col-span-7">
            <FilingDemo />
          </Reveal>
          <Reveal kind="settle" className="order-1 space-y-6 lg:order-2 lg:col-span-5 lg:pt-6" delay={0.1}>
            <Title p={sec} />
            <p className="max-w-[48ch] text-lg leading-relaxed text-ink-2">{sec.line}</p>
            <p className="max-w-[48ch] leading-relaxed text-ink-2">
              Every number is computed in Python from SEC XBRL data, never by the model. It runs free on a local LLM through Ollama, and switching to OpenAI takes one line of config.
            </p>
            <Stack items={sec.stack} />
            <Links links={sec.links} />
          </Reveal>
        </article>
        <Reveal className="mt-10 lg:mt-12">
          <figure className="group overflow-hidden border-2 border-ink">
            <img
              src="/work/sec-filing-analyzer.png"
              alt="The SEC Filing Analyzer on NVIDIA's 10-K: revenue $215.94B, net income $120.07B, 65.5% revenue growth and 55.6% net margin, an executive summary, and three key risks each backed by a quote from the filing."
              width="1710"
              height="1395"
              loading="lazy"
              className="block aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03] sm:aspect-[1710/1395]"
            />
            <figcaption className="border-t-2 border-ink bg-sheet px-3 py-2 text-xs text-ink-2">The shipped app, analyzing NVIDIA's 2026 10-K.</figcaption>
          </figure>
        </Reveal>
      </section>

      {/* One deliberate color block: the ink band carries the ops project. */}
      <div className="mt-24 bg-band text-band-ink lg:mt-32">
        <section className="mx-auto max-w-[1400px] px-4 pb-24 pt-20 sm:px-6 lg:px-10 lg:pb-32 lg:pt-28">
          <Reveal className="max-w-[70ch] space-y-5">
            <Title p={ops} tone="band" />
            <p className="text-lg leading-relaxed text-band-ink-2">{ops.line}</p>
            <Stack items={ops.stack} tone="band" />
            <Links links={ops.links} />
          </Reveal>
          <Reveal className="mt-10" delay={0.1}>
            <OpsDemo />
          </Reveal>
          <Reveal kind="settle" className="mt-20 flex flex-col gap-6 border-t-2 border-band-ink/25 pt-10 md:flex-row md:items-center md:justify-between">
            <p className="max-w-[46ch] text-lg leading-relaxed text-band-ink-2">
              These three are the ones I'd show first. More projects and experiments live on GitHub.
            </p>
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
        </section>
      </div>
    </>
  );
}

export function About() {
  return (
    <section id="about" className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <h2 className="display text-[clamp(2.2rem,4.4vw,4rem)]">I study how work flows, then write the software that makes it flow better.</h2>
        </Reveal>
        <Reveal kind="settle" className="space-y-5 text-lg leading-relaxed text-ink-2 lg:col-span-5 lg:pt-3" delay={0.1}>
          <p>
            Industrial Engineering taught me to see queues, bottlenecks and wasted steps. Finance taught me to read what a company says about itself. Code lets me act on both.
          </p>
          <p>Most of my projects start with a spreadsheet or a filing and end as a tool someone can open in a browser.</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t-2 border-ink pt-5 text-[15px]">
            <dt className="font-semibold text-ink">Study</dt>
            <dd>B.Sc. Industrial Engineering, TU/e, 2025 to 2028</dd>
            <dt className="font-semibold text-ink">Languages</dt>
            <dd>Turkish (C2), English (C1), Dutch (A1)</dd>
            <dt className="font-semibold text-ink">Based in</dt>
            <dd>Eindhoven, Netherlands</dd>
          </dl>
        </Reveal>
      </div>

      <div className="mt-16 grid items-start gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-0">
        {toolbox.map((t, i) => (
          <Fragment key={t.station}>
            {i > 0 && <PushArrow className="hidden w-14 self-center px-2 lg:flex" />}
            <Reveal delay={i * 0.12} className="border-2 border-ink bg-sheet">
              <h3 className="bg-ink px-4 py-2.5 text-[15px] font-bold text-ground wide">{t.station}</h3>
              <dl>
                {t.rows.map(([skill, proof], r) => (
                  <div key={skill} className={`grid grid-cols-[1fr_auto] items-baseline gap-4 px-4 py-2.5 ${r ? "border-t border-ink/15" : ""}`}>
                    <dt className="text-[15px] font-medium">{skill}</dt>
                    <dd className="text-right text-[13px] text-ink-2">{proof}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </Fragment>
        ))}
      </div>
    </section>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <section id="contact" className="border-t-2 border-ink">
      <div className="mx-auto max-w-[1400px] px-4 pb-28 pt-20 sm:px-6 lg:px-10 lg:pb-36 lg:pt-28">
        <Reveal>
          <h2 className="display text-[clamp(3rem,8vw,6rem)]">
            Pull the next <span className="text-flow">project.</span>
          </h2>
        </Reveal>
        <Reveal kind="settle" delay={0.1} className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className="max-w-[46ch] text-lg leading-relaxed text-ink-2 lg:col-span-6">
            Good flow runs on pull, not push. If you have an internship, a project or a question, send the signal.
          </p>
          <div className="flex flex-wrap items-center gap-3 lg:col-span-6 lg:justify-end">
            <Magnetic href={`mailto:${contact.email}`} className={`${btnPrimary} px-6 py-4 text-base`}>
              <EnvelopeSimple size={18} weight="bold" />
              Email me
            </Magnetic>
            <button
              onClick={copy}
              className="inline-flex items-center gap-2 border-2 border-ink px-4 py-[14px] text-sm font-semibold transition-colors hover:bg-ground-2 active:scale-[0.98]"
              aria-live="polite"
            >
              <motion.span
                key={copied ? "c" : "n"}
                initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease }}
                className="inline-flex"
              >
                {copied ? <Check size={16} weight="bold" className="text-flow" /> : <Copy size={16} weight="bold" />}
              </motion.span>
              {copied ? "Copied" : contact.email}
            </button>
            <a
              href={contact.cv}
              download
              className="inline-flex items-center gap-2 border-2 border-ink px-4 py-[14px] text-sm font-semibold transition-colors hover:bg-ink hover:text-ground active:scale-[0.98]"
            >
              <DownloadSimple size={16} weight="bold" />
              CV
            </a>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="grid h-[52px] w-[52px] place-items-center border-2 border-ink transition-colors hover:bg-ink hover:text-ground active:scale-[0.96]"
            >
              <LinkedinLogo size={20} weight="bold" />
            </a>
            <a
              href={contact.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="grid h-[52px] w-[52px] place-items-center border-2 border-ink transition-colors hover:bg-ink hover:text-ground active:scale-[0.96]"
            >
              <GithubLogo size={20} weight="bold" />
            </a>
          </div>
        </Reveal>
      </div>
      <footer className="border-t-2 border-ink">
        <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-3 px-4 py-6 text-sm text-ink-2 sm:px-6 lg:px-10">
          <p>© 2026 Ates Parilti</p>
          <p>Built with React and a small discrete-event simulation.</p>
        </div>
      </footer>
    </section>
  );
}
