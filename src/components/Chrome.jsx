import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { DownloadSimple, EnvelopeSimple } from "@phosphor-icons/react";
import { contact } from "../data/projects";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const border = useTransform(scrollY, [0, 40], [0, 1]);
  return (
    <header className="fixed inset-x-0 top-0 z-30 bg-ground">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <a href="#top" className="group flex items-center gap-2.5 text-[17px] font-extrabold wide" aria-label="Ates Parilti, back to top">
          <span aria-hidden="true" className="relative block h-5 w-5">
            <span className="absolute inset-0 border-2 border-ink transition-transform duration-300 ease-out group-hover:rotate-45" />
            <span className="absolute inset-[5px] bg-ink transition-colors duration-300 group-hover:bg-flow" />
          </span>
          Ates Parilti
        </a>
        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden items-center md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="relative px-3 py-2 text-[15px] font-semibold text-ink-2 transition-colors hover:text-ink after:absolute after:inset-x-3 after:bottom-1 after:h-[2px] after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={contact.cv}
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[15px] font-semibold text-ink-2 transition-colors hover:text-ink"
          >
            <DownloadSimple size={16} weight="bold" />
            CV
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="ml-2 inline-flex items-center gap-2 bg-ink px-3.5 py-2 text-sm font-bold text-ground transition-colors hover:bg-flow hover:text-flow-ink active:scale-[0.98]"
          >
            <EnvelopeSimple size={16} weight="bold" />
            Email me
          </a>
        </div>
      </nav>
      <motion.div style={{ opacity: border }} className="h-[2px] bg-ink" />
    </header>
  );
}

// The page as a timeline ladder: each section is a step, filled as you scroll.
const STEPS = [
  { href: "#top", label: "Flow" },
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Pull" },
];

export function Ladder() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const clip = useTransform(p, (v) => `inset(0 ${100 - v * 100}% 0 0)`);
  const { scrollY } = useScroll();
  const show = useTransform(scrollY, [380, 620], [0, 1]);
  const vis = useTransform(show, (v) => (v < 0.05 ? "hidden" : "visible"));
  const segW = 44;
  const w = segW * STEPS.length;
  const path = STEPS.map((_, i) => {
    const x = i * segW;
    return i % 2 === 0 ? `M${x},4 L${x + segW},4 L${x + segW},16` : `M${x},16 L${x + segW},16 L${x + segW},4`;
  }).join(" ");

  return (
    <motion.nav
      style={{ opacity: show, visibility: vis }}
      aria-label="Page sections"
      className="fixed bottom-5 left-6 z-20 hidden bg-ground/90 px-3 pb-1.5 pt-2 shadow-[0_6px_24px_-12px_rgb(var(--shadow)/0.45)] lg:block"
    >
      <div className="relative" style={{ width: w }}>
        <svg width={w} height="20" className="block overflow-visible" aria-hidden="true">
          <path d={path} fill="none" stroke="var(--ink)" strokeOpacity="0.25" strokeWidth="2" />
        </svg>
        <motion.svg width={w} height="20" className="absolute inset-0 block overflow-visible" style={{ clipPath: clip }} aria-hidden="true">
          <path d={path} fill="none" stroke="var(--flow)" strokeWidth="2.5" />
        </motion.svg>
        <ul className="mt-0.5 flex">
          {STEPS.map((s) => (
            <li key={s.href} style={{ width: segW }}>
              <a href={s.href} className="block text-[11px] font-semibold text-ink-2 transition-colors hover:text-flow">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
}
