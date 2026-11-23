import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

export const ease = [0.16, 1, 0.3, 1];

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
