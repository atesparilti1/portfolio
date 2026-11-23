import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { featured } from "../data/projects";

// The WebGL scene lives outside React: it loads after the page is interactive and
// talks back through three callbacks. If WebGL is missing, the CSS sky stays.
export default function Space({ sceneRef, onChapter, onOpen, onReady }) {
  const canvasRef = useRef(null);
  const reduce = useReducedMotion();
  const cb = useRef({});
  cb.current = { onChapter, onOpen, onReady };

  useEffect(() => {
    let scene;
    let dead = false;
    const ready = () => cb.current.onReady?.();
    import("../space/Scene.js")
      .then(({ default: Scene }) => {
        if (dead) return;
        try {
          scene = new Scene(canvasRef.current, {
            projects: featured,
            reduce: !!reduce,
            onChapter: (c) => cb.current.onChapter?.(c),
            onOpen: (i) => cb.current.onOpen?.(i),
            onReady: ready,
          });
          sceneRef.current = scene;
        } catch {
          canvasRef.current.hidden = true;
          ready();
        }
      })
      .catch(ready);
    return () => {
      dead = true;
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [reduce, sceneRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 h-lvh w-full touch-pan-y select-none" />;
}
