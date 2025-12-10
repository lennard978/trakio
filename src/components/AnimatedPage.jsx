import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

// Detect direction by comparing pathname length
function getDirection(path) {
  const depth = path.split("/").filter(Boolean).length;
  return depth;
}

export default function AnimatedPage({ children }) {
  const location = useLocation();

  const depth = getDirection(location.pathname);

  const variants = {
    initial: (depth) => ({
      x: depth > 1 ? 40 : 0,    // slide from right for deeper routes
      opacity: 0.4,
      filter: "blur(4px)"
    }),
    animate: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.22,
        ease: [0.24, 0.12, 0.12, 0.98]
      }
    },
    exit: (depth) => ({
      x: depth > 1 ? -40 : 0,   // slide left on back
      opacity: 0,
      filter: "blur(4px)",
      transition: {
        duration: 0.18,
        ease: [0.24, 0.12, 0.12, 0.98]
      }
    })
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        custom={depth}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-[70vh]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
