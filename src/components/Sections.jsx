import { Fragment, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { track } from "@vercel/analytics";
import { ArrowUp, Check, Copy, DownloadSimple, EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import { toolbox, contact } from "../data/projects";
import { Magnetic, PushArrow, Reveal, btnPrimary, ease } from "./bits";

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
            <dt className="font-semibold text-ink">Coursework</dt>
            <dd>Statistics, Data Analytics, Algorithmic Programming, Business Information Systems, Financial and Managerial Accounting</dd>
            <dt className="font-semibold text-ink">Outside work</dt>
            <dd>Tennis, padel, fitness and following the markets</dd>
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
            I'm looking for a summer 2027 internship in software, trading/quant, supply chain, operations or investment banking. If you have one, a project or a question, send the signal.
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
          <a href="#top" className="inline-flex items-center gap-1.5 font-semibold text-ink transition-colors hover:text-flow">
            Back to top
            <ArrowUp size={14} weight="bold" />
          </a>
          <p>Built with React and a small discrete-event simulation.</p>
        </div>
      </footer>
    </section>
  );
}
