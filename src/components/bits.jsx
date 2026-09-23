import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

export const ease = [0.16, 1, 0.3, 1];

// Striped VSM push arrow. It draws itself in the direction work flows.
export function PushArrow({ className = "", tone = "ink" }) {
  const reduce = useReducedMotion();
  const color = tone === "band" ? "var(--band-ink)" : "var(--ink)";
  return (
    <div className={`flex items-center ${className}`} aria-hidden="true">
      <motion.div
        className="h-3 flex-1 origin-left"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 12px, transparent 12px 20px)`,
        }}
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.1, ease }}
      />
      <div
        className="h-0 w-0 border-y-[12px] border-l-[18px] border-y-transparent"
        style={{ borderLeftColor: color }}
      />
    </div>
  );
}

// Stations come online in the direction work flows: a wipe from the left for headings
// and demos, a short settle for supporting text.
const VARIANTS = {
  wipe: {
    from: { clipPath: "inset(0% 38% 0% 0%)", opacity: 0.4, x: -12 },
    to: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, x: 0 },
    duration: 1.0,
  },
  settle: { from: { opacity: 0, y: 14 }, to: { opacity: 1, y: 0 }, duration: 0.7 },
};

export function Reveal({ children, className = "", delay = 0, as = "div", kind = "wipe" }) {
  const reduce = useReducedMotion();
  const M = motion[as];
  const v = VARIANTS[kind];
  return (
    <M
      className={className}
      initial={reduce ? false : v.from}
      whileInView={v.to}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: v.duration, delay, ease }}
    >
      {children}
    </M>
  );
}

// Button that leans toward the pointer a little. Motion values keep it off the render loop.
export function Magnetic({ children, className = "", href, onClick, ...rest }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });
  const move = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };
  const Tag = href ? motion.a : motion.button;
  return (
    <Tag
      ref={ref}
      href={href}
      onClick={onClick}
      onPointerMove={move}
      onPointerLeave={leave}
      style={{ x: sx, y: sy }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export const btnPrimary =
  "inline-flex items-center gap-2 whitespace-nowrap bg-ink px-5 py-3 text-[15px] font-bold text-ground transition-[background-color,box-shadow] duration-200 hover:bg-flow hover:text-flow-ink hover:shadow-[0_8px_24px_-10px_rgb(var(--shadow)/0.5)] active:scale-[0.98]";
export const btnSecondary =
  "inline-flex items-center gap-2 whitespace-nowrap border-2 border-ink px-5 py-[10px] text-[15px] font-bold text-ink transition-colors duration-200 hover:bg-ink hover:text-ground active:scale-[0.98]";
