import { MotionConfig } from "motion/react";
import { Ladder, Nav } from "./components/Chrome";
import Hero from "./components/Hero";
import Hopper from "./components/Hopper";
import { About, Contact, Work } from "./components/Sections";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#work"
        className="fixed left-4 top-3 z-40 -translate-y-20 bg-flow px-3 py-2 font-semibold text-flow-ink focus:translate-y-0"
      >
        Skip to work
      </a>
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <Contact />
      </main>
      <Ladder />
      <Hopper />
    </MotionConfig>
  );
}
