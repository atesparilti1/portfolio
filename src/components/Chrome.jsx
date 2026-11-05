import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { track } from "@vercel/analytics";
import { DownloadSimple, EnvelopeSimple, GithubLogo, LinkedinLogo, List, X } from "@phosphor-icons/react";
import { contact } from "../data/projects";

const LINKS = [
  { href: "#experience", label: "Experience" },
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const border = useTransform(scrollY, [0, 40], [0, 1]);
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
            href={contact.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="hidden h-9 w-9 items-center justify-center text-ink-2 transition-colors hover:text-ink md:inline-flex"
          >
            <LinkedinLogo size={19} weight="bold" />
          </a>
          <a
            href={contact.cv}
            download
            onClick={() => track("cv_download", { from: "nav" })}
            className="hidden items-center gap-1.5 px-3 py-2 text-[15px] font-semibold text-ink-2 transition-colors hover:text-ink md:inline-flex"
          >
            <DownloadSimple size={16} weight="bold" />
            CV
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex h-11 items-center gap-2 bg-ink px-3.5 text-sm font-bold md:ml-2 md:h-auto md:py-2 text-ground transition-colors hover:bg-flow hover:text-flow-ink active:scale-[0.98]"
          >
            <EnvelopeSimple size={16} weight="bold" />
            Email me
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 grid h-11 w-11 place-items-center md:hidden"
          >
            {open ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-16 border-b-2 border-ink bg-ground px-4 pb-3 sm:px-6 md:hidden"
          >
            <ul>
              {LINKS.map((l) => (
                <li key={l.href} className="border-b border-ink/15">
                  <a href={l.href} onClick={() => setOpen(false)} className="flex h-12 items-center text-[17px] font-semibold">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-5 pt-3">
              <a
                href={contact.cv}
                download
                onClick={() => {
                  setOpen(false);
                  track("cv_download", { from: "menu" });
                }}
                className="inline-flex h-11 items-center gap-1.5 font-semibold"
              >
                <DownloadSimple size={18} weight="bold" />
                CV
              </a>
              <a href={contact.linkedin} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-1.5 font-semibold">
                <LinkedinLogo size={18} weight="bold" />
                LinkedIn
              </a>
              <a href={contact.github} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-1.5 font-semibold">
                <GithubLogo size={18} weight="bold" />
                GitHub
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div style={{ opacity: border }} className="h-[2px] bg-ink" />
    </header>
  );
}
