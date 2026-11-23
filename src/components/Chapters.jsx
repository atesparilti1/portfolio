import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { track } from "@vercel/analytics";
import { ArrowUpRight, CornersOut, DownloadSimple, EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import { contact, experience, featured, toolbox } from "../data/projects";
import { Magnetic, ease } from "./bits";

// A chapter is a tall stretch of page. Its copy pins to the viewport while the
// camera travels, fading in as the chapter arrives and out as it leaves.
function Chapter({ cam, id, height, align = "left", place = "center", children, fadeOut = true }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Always bound to motion values: the prerendered HTML carries the start state,
  // and only a live motion value replaces it after hydration.
  const still = !!reduce;
  const out = fadeOut && !still;
  const stops = [0, 0.1, 0.9, 1];
  const opacity = useTransform(scrollYProgress, stops, still ? [1, 1, 1, 1] : [0, 1, 1, out ? 0 : 1]);
  const y = useTransform(scrollYProgress, stops, still ? [0, 0, 0, 0] : [70, 0, 0, out ? -70 : 0]);
  const filter = useTransform(scrollYProgress, stops, still ? Array(4).fill("blur(0px)") : ["blur(12px)", "blur(0px)", "blur(0px)", out ? "blur(12px)" : "blur(0px)"]);
  const side = align === "right" ? "lg:justify-end" : "lg:justify-start";
  const vertical = place === "bottom" ? "items-end pb-6 sm:pb-12" : "items-end pb-6 sm:items-center sm:pb-0";
  return (
    <section ref={ref} id={id} data-cam={cam} className="relative" style={{ height }}>
      <div className={`sticky top-0 flex min-h-[100dvh] ${vertical}`}>
        <div className={`mx-auto flex w-full max-w-[1400px] px-4 sm:px-6 lg:px-12 ${side}`}>
          <motion.div style={{ opacity, y, filter }} className="pointer-events-auto w-full max-w-[34rem]">
            {children}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const H2 = ({ children, className = "" }) => (
  <h2 className={`display text-[clamp(2rem,4.2vw,3.6rem)] ${className}`}>{children}</h2>
);

export function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.55], [0, -80]);
  const words = ["Industrial", "engineer", "who", "ships", "software."];
  const rise = (i) => ({
    initial: reduce ? false : { y: "110%" },
    animate: { y: "0%" },
    transition: { duration: 1.1, delay: 1.1 + i * 0.07, ease },
  });
  return (
    <section ref={ref} id="top" data-cam="hero" className="relative h-[100dvh]">
      <motion.div style={reduce ? undefined : { opacity, y }} className="mx-auto flex h-full max-w-[1400px] items-end px-4 pb-14 sm:px-6 lg:px-12 lg:pb-20">
        <div className="pointer-events-auto max-w-[46rem]">
          <h1 className="display text-[clamp(2.7rem,6.4vw,5.9rem)]">
            {words.map((w, i) => (
              <span key={w} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span className={`inline-block ${w === "software." ? "text-band-flow" : ""}`} {...rise(i)}>
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            className="mt-6 max-w-[36rem] text-lg leading-relaxed text-ink-2 sm:text-xl"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.6, ease }}
          >
            TU/e student building finance, data and supply-chain tools end to end. Open to jobs or internships from summer 2027.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.75, ease }}
          >
            <Magnetic href="#work" className="btn btn-primary">
              See the work
            </Magnetic>
            <Magnetic href={contact.cv} download onClick={() => track("cv_download", { from: "hero" })} className="btn btn-ghost">
              <DownloadSimple size={17} weight="bold" />
              Download CV
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export function Story() {
  return (
    <div id="story">
      <Chapter cam="story-0" height="200vh">
        <div className="glass p-6 sm:p-8">
          <H2>I study how operations run.</H2>
          <p className="mt-5 text-lg leading-relaxed text-ink-2">
            B.Sc. Industrial Engineering at Eindhoven University of Technology, 2025 to 2028. Alongside the degree I build the software that measures operations:
            simulations, forecasts and valuations, each shipped with a live demo.
          </p>
        </div>
      </Chapter>

      <Chapter cam="story-1" height="220vh" align="right">
        <div className="glass p-6 sm:p-8">
          <H2>Three disciplines, equal weight.</H2>
          <div className="mt-6 grid gap-5">
            {toolbox.map((group) => (
              <div key={group.station}>
                <h3 className="wide text-[15px] font-bold text-band-flow">{group.station}</h3>
                <ul className="mt-2 grid gap-1.5">
                  {group.rows.map(([skill, proof]) => (
                    <li key={skill} className="flex items-baseline justify-between gap-4 text-[15px]">
                      <span className="text-ink">{skill}</span>
                      <span className="shrink-0 text-right text-[13px] text-ink-3">{proof}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Chapter>

      <Chapter cam="story-2" height="200vh">
        <div className="glass p-6 sm:p-8">
          <H2>Two stints at Derin Bilgi.</H2>
          <ol className="relative mt-6 grid gap-6 border-l border-line pl-6">
            {experience.map((job) => (
              <li key={job.role} className="relative">
                <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full bg-flow shadow-[0_0_12px_2px_rgb(59_130_246/0.7)]" />
                <p className="font-mono text-[12px] text-ink-3">{job.when}</p>
                <h3 className="wide mt-1 text-lg font-bold">{job.role}</h3>
                <p className="text-[14px] text-ink-3">{job.where}</p>
                <ul className="mt-2 grid gap-1 text-[15px] leading-relaxed text-ink-2">
                  {job.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </Chapter>
    </div>
  );
}

export function Arrival() {
  return (
    <Chapter cam="arrive" id="work" height="340vh" align="right">
      <div className="glass p-6 sm:p-8">
        <H2>
          Six working <span className="text-band-flow">systems.</span>
        </H2>
        <p className="mt-5 text-lg leading-relaxed text-ink-2">
          Each panel on the ring is a project with a live demo. Click a panel to step inside it, or keep scrolling and they come to you one by one.
        </p>
      </div>
    </Chapter>
  );
}

export function ProjectChapter({ p, i, onOpen }) {
  return (
    <Chapter cam={`project-${i}`} id={p.id} height="180vh" place="bottom">
      <article className="glass p-4 sm:p-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="display text-[clamp(1.7rem,3vw,2.5rem)]">{p.title}</h3>
          <span className="rounded-full border border-line px-2.5 py-0.5 text-[12px] font-semibold text-ink-2">{p.station}</span>
        </div>
        <p className="mt-2.5 text-[16px] leading-snug text-ink sm:mt-3 sm:text-lg">{p.headline}</p>
        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3.5 sm:mt-5 sm:pt-4">
          {p.proof.map((x) => (
            <div key={x.k}>
              <dd className="font-mono text-[clamp(1rem,1.7vw,1.35rem)] font-semibold text-band-flow tnum">{x.v}</dd>
              <dt className="mt-1 text-[11px] leading-tight text-ink-3 sm:text-[12px]">{x.k}</dt>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-6">
          <button type="button" onClick={() => onOpen(i)} className="btn btn-primary">
            <CornersOut size={17} weight="bold" />
            Step inside
          </button>
          {p.links.demo && (
            <a
              href={p.links.demo}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("project_open", { project: p.id, target: "demo" })}
              className="btn btn-ghost"
            >
              Live demo
              <ArrowUpRight size={16} weight="bold" />
            </a>
          )}
        </div>
      </article>
    </Chapter>
  );
}

export function Work({ onOpen }) {
  return featured.map((p, i) => <ProjectChapter key={p.id} p={p} i={i} onOpen={onOpen} />);
}

const ROLES = ["Software", "Trading and quant", "Supply chain", "Operations", "Investment banking"];

export function Beyond() {
  return (
    <Chapter cam="below" id="about" height="260vh" align="right">
      <div className="glass p-6 sm:p-8">
        <H2>
          Looking for summer <span className="text-band-flow">2027.</span>
        </H2>
        <p className="mt-5 text-lg leading-relaxed text-ink-2">A job or internship in software, finance or operations, in any of these roles:</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <li key={r} className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[14px] font-semibold">
              {r}
            </li>
          ))}
        </ul>
        <dl className="mt-6 grid gap-4 border-t border-line pt-5 text-[15px] sm:grid-cols-2">
          <div>
            <dt className="wide font-bold">Coursework</dt>
            <dd className="mt-1 leading-relaxed text-ink-2">Statistics, Data Analytics, Algorithmic Programming, Business Information Systems, Financial and Managerial Accounting</dd>
          </div>
          <div>
            <dt className="wide font-bold">Languages</dt>
            <dd className="mt-1 leading-relaxed text-ink-2">Turkish (C2), English (C1), Dutch (A1)</dd>
          </div>
        </dl>
      </div>
    </Chapter>
  );
}

export function Contact() {
  const reduce = useReducedMotion();
  return (
    <section id="contact" data-cam="contact" className="relative flex min-h-[130vh] items-end">
      {/* On a phone the tunnel runs behind the copy; a low scrim keeps it readable. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[75vh] bg-gradient-to-t from-[rgb(5_6_10/0.94)] via-[rgb(5_6_10/0.65)] to-transparent md:hidden" />
      <div className="relative mx-auto w-full max-w-[1400px] px-4 pb-10 sm:px-6 lg:px-12">
        <motion.div
          className="pointer-events-auto max-w-[52rem]"
          initial={reduce ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.1, ease }}
        >
          <h2 className="display text-[clamp(2.6rem,7vw,6rem)]">
            Let&rsquo;s talk about <span className="text-band-flow">2027.</span>
          </h2>
          <a href={`mailto:${contact.email}`} className="mt-5 inline-block font-mono text-[clamp(1rem,2.2vw,1.5rem)] text-ink-2 underline decoration-line hover:text-ink">
            {contact.email}
          </a>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic href={`mailto:${contact.email}`} onClick={() => track("email_click", { from: "contact" })} className="btn btn-primary px-6 py-3.5 text-base">
              <EnvelopeSimple size={18} weight="bold" />
              Email me
            </Magnetic>
            <a href={contact.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <LinkedinLogo size={18} weight="bold" />
              LinkedIn
            </a>
            <a href={contact.github} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <GithubLogo size={18} weight="bold" />
              GitHub
            </a>
            <a href={contact.cv} download onClick={() => track("cv_download", { from: "contact" })} className="btn btn-ghost">
              <DownloadSimple size={18} weight="bold" />
              Download CV
            </a>
          </div>
          <p className="mt-16 text-[13px] text-ink-3">© 2026 Ates Parilti. Built with React and Three.js.</p>
        </motion.div>
      </div>
    </section>
  );
}
