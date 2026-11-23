import { motion, useScroll, useSpring } from "motion/react";
import { track } from "@vercel/analytics";
import { contact, featured } from "../data/projects";

const LINKS = [
  ["Story", "#story"],
  ["Work", "#work"],
  ["Contact", "#contact"],
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* Keeps the bar readable over bright screens without a hard edge. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-[rgb(5_6_10/0.8)] to-transparent" />
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-8 px-4 sm:px-6 lg:px-12">
        <a href="#top" className="wide flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight">
          <span aria-hidden="true" className="relative grid size-5 place-items-center rounded-full border-[1.5px] border-ink">
            <span className="size-1.5 rounded-full bg-flow shadow-[0_0_10px_2px_rgb(59_130_246/0.9)]" />
          </span>
          Ates Parilti
        </a>
        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex gap-7 text-[15px] font-semibold text-ink-2">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <a href={href} className="transition-colors hover:text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a href={`mailto:${contact.email}`} onClick={() => track("email_click", { from: "nav" })} className="btn btn-ghost ml-auto px-4 py-2 text-[14px] backdrop-blur-md">
          Email me
        </a>
      </div>
    </header>
  );
}

// Where you are on the journey: a progress line, and the projects while inside the ring.
export function Rail({ chapter, onJump }) {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const active = chapter?.startsWith("project-") ? Number(chapter.slice(8)) : -1;
  const inWork = active >= 0 || chapter === "arrive";
  return (
    <aside aria-label="Projects" className="pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 items-center gap-5 xl:flex">
      <motion.ol
        className="pointer-events-auto grid gap-3"
        animate={{ opacity: inWork ? 1 : 0, x: inWork ? 0 : 16 }}
        transition={{ duration: 0.5 }}
        style={{ visibility: inWork ? "visible" : "hidden" }}
      >
        {featured.map((p, i) => (
          <li key={p.id} className="flex justify-end">
            <button type="button" onClick={() => onJump(p.id)} aria-label={p.title} aria-current={i === active ? "step" : undefined} className="group flex items-center gap-3 py-1">
              <span className="pointer-events-none whitespace-nowrap rounded-full bg-[rgb(8_10_16/0.75)] px-2.5 py-1 text-[13px] font-semibold text-ink opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                {p.title}
              </span>
              <span className={`h-[2px] rounded-full transition-all duration-500 ${i === active ? "w-8 bg-flow shadow-[0_0_8px_rgb(59_130_246/0.9)]" : "w-3.5 bg-ink-3 group-hover:bg-ink"}`} />
            </button>
          </li>
        ))}
      </motion.ol>
      <div className="relative h-48 w-px bg-line">
        <motion.div className="absolute inset-0 origin-top bg-flow shadow-[0_0_10px_rgb(59_130_246/0.9)]" style={{ scaleY }} />
      </div>
    </aside>
  );
}
