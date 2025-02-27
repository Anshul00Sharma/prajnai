"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "20%" : "-20%",
    opacity: 0,
    scale: 0.98,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
};

const pageTransition = {
  type: "spring",
  bounce: 0,
  duration: 0.5,
  stiffness: 100,
  damping: 20,
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine direction based on path
  const direction = pathname === "/topic" ? 1 : -1;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        custom={direction}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full relative"
        style={{
          overflow: "hidden",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
