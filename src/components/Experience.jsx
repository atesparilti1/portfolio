import { Fragment } from "react";
import { experience } from "../data/projects";
import { PushArrow, Reveal } from "./bits";

// Work history as two process boxes joined by a push arrow: time flows left to right.
export default function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-[1400px] scroll-mt-16 px-4 pt-24 sm:px-6 lg:px-10 lg:pt-32">
      <Reveal>
        <h2 className="display max-w-[18ch] text-[clamp(2.2rem,4.4vw,4rem)]">Shipping for a real team.</h2>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-2">
          Two stints at Derin Bilgi in Istanbul: a summer internship, then a part-time developer role building a product I proposed.
        </p>
      </Reveal>

      <div className="mt-14 grid items-start gap-6 lg:grid-cols-[minmax(0,4fr)_auto_minmax(0,7fr)] lg:gap-0">
        {experience.map((job, i) => (
          <Fragment key={job.role}>
            {i > 0 && <PushArrow className="hidden w-16 self-center px-2 lg:flex" />}
            <Reveal delay={i * 0.12} className="border-2 border-ink bg-sheet">
              <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-ink px-4 py-2.5 text-ground">
                <h3 className="text-[15px] font-bold wide">
                  {job.company}
                  <span className="font-semibold"> · {job.role}</span>
                </h3>
                <span className="font-mono text-xs">{job.when}</span>
              </header>
              <div className="space-y-3 px-4 py-4">
                <p className="text-sm text-ink-3">{job.where}</p>
                <ul className="space-y-2.5">
                  {job.points.map((pt) => (
                    <li key={pt} className="flex items-baseline gap-3 text-[15px] leading-relaxed text-ink-2">
                      <span aria-hidden="true" className="inline-block h-2 w-2 shrink-0 translate-y-[-1px] bg-flow" />
                      <span>
                        {pt.startsWith("Proposed and built Son Lokma") ? (
                          <>
                            Proposed and built <strong className="font-bold text-ink">Son Lokma</strong>
                            {pt.slice("Proposed and built Son Lokma".length)}
                          </>
                        ) : (
                          pt
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {job.stack && (
                  <ul className="flex flex-wrap gap-x-3 gap-y-1 border-t border-ink/15 pt-3 text-[13px] font-medium text-ink-2">
                    {job.stack.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
