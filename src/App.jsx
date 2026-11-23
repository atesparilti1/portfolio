import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, useReducedMotion } from "motion/react";
import { Analytics } from "@vercel/analytics/react";
import { track } from "@vercel/analytics";
import Lenis from "lenis";
import { Nav, Rail } from "./components/Chrome";
import { Arrival, Beyond, Contact, Hero, Story, Work } from "./components/Chapters";
import Space from "./components/Space";
import { featured } from "./data/projects";

// The project window carries the demos and their data; it loads when the scene is up.
const loadDetail = () => import("./components/ProjectDetail");
const ProjectDetail = lazy(loadDetail);

export default function App() {
  const reduce = useReducedMotion();
  const sceneRef = useRef(null);
  const lenisRef = useRef(null);
  const lastFocus = useRef(null);
  const [chapter, setChapter] = useState("hero");
  const [open, setOpen] = useState(null);
  const [ready, setReady] = useState(false);

  // Smooth, weighted scrolling; native scrolling when motion is reduced.
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.65, touchMultiplier: 1, anchors: true, autoRaf: true });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduce]);

  // A shared link to a section lands there once fonts and layout are ready.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const go = () => document.getElementById(id)?.scrollIntoView({ block: "start" });
    (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(go));
  }, []);

  const lock = (on) => {
    if (on) lenisRef.current?.stop();
    else lenisRef.current?.start();
    document.documentElement.style.overflow = on ? "hidden" : "";
  };

  const openProject = useCallback(
    (i) => {
      track("project_open", { project: featured[i].id, target: "screen" });
      lastFocus.current = document.activeElement;
      sceneRef.current?.focus(i);
      lock(true);
      // Let the camera start its flight into the screen before the window opens.
      setTimeout(() => setOpen(i), reduce || !sceneRef.current ? 0 : 450);
    },
    [reduce]
  );

  const close = useCallback(() => {
    setOpen(null);
    sceneRef.current?.unfocus();
    lock(false);
    lastFocus.current?.focus?.({ preventScroll: true });
  }, []);

  // Switching projects inside the window also moves the page under it,
  // so closing lands on the project last viewed.
  const goTo = useCallback((j) => {
    const el = document.getElementById(featured[j].id);
    if (el) {
      const top = el.getBoundingClientRect().top + scrollY + el.offsetHeight * 0.5 - innerHeight / 2;
      if (lenisRef.current) lenisRef.current.scrollTo(top, { immediate: true, force: true });
      else scrollTo(0, top);
    }
    sceneRef.current?.focus(j);
    setOpen(j);
  }, []);

  const jump = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY + el.offsetHeight * 0.5 - innerHeight / 2;
    if (lenisRef.current) lenisRef.current.scrollTo(top, { duration: 1.6 });
    else scrollTo({ top });
  };

  return (
    <MotionConfig reducedMotion="user">
      <Space sceneRef={sceneRef} onChapter={setChapter} onOpen={openProject} onReady={() => {
          setReady(true);
          loadDetail();
        }} />

      <div aria-hidden="true" data-done={ready ? "" : undefined} className="veil pointer-events-none fixed inset-0 z-[70] grid place-items-center bg-ground">
        <div className="w-56">
          <p className="wide text-center text-[17px] font-extrabold">Ates Parilti</p>
          <div className="mt-4 h-px w-full bg-line">
            <div className="veil-bar h-px origin-left bg-flow shadow-[0_0_10px_rgb(59_130_246/0.9)]" />
          </div>
        </div>
      </div>

      <a href="#work" className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-full bg-flow px-4 py-2 font-semibold text-flow-ink focus:translate-y-0">
        Skip to work
      </a>
      <Nav />
      <main className="pointer-events-none relative z-10">
        <Hero />
        <Story />
        <Arrival />
        <Work onOpen={openProject} />
        <Beyond />
        <Contact />
      </main>
      <Rail chapter={chapter} onJump={jump} />
      <Suspense fallback={null}>
        <AnimatePresence>{open !== null && <ProjectDetail key="detail" index={open} onClose={close} onGo={goTo} />}</AnimatePresence>
      </Suspense>
      <Analytics />
    </MotionConfig>
  );
}
