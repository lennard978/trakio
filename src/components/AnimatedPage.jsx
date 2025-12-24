// src/components/AnimatedPage.jsx
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Define the main swipeable pages and their order.
 * This order determines the navigation direction.
 */
const swipeablePages = ["/dashboard", "/insights", "/add", "/settings"];

export default function AnimatedPage({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentIndex = swipeablePages.indexOf(location.pathname);
  const lastDirection = useRef(0); // store last swipe direction for animation

  // --- Handle swipe gestures ---
  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Swipe right → previous page
    if ((offset > 100 || velocity > 500) && currentIndex > 0) {
      lastDirection.current = -1;
      navigate(swipeablePages[currentIndex - 1]);
    }

    // Swipe left → next page
    else if ((offset < -100 || velocity < -500) && currentIndex < swipeablePages.length - 1) {
      lastDirection.current = 1;
      navigate(swipeablePages[currentIndex + 1]);
    }
  };

  // --- Direction-aware variants ---
  const variants = {
    initial: (direction) => ({
      x: direction > 0 ? 80 : direction < 0 ? -80 : 0,
      opacity: 0,
      filter: "blur(6px)",
    }),
    animate: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.35,
        ease: [0.24, 0.12, 0.12, 0.98],
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -80 : direction < 0 ? 80 : 0,
      opacity: 0,
      filter: "blur(6px)",
      transition: {
        duration: 0.25,
        ease: [0.24, 0.12, 0.12, 0.98],
      },
    }),
  };

  const isSwipeable = swipeablePages.includes(location.pathname);

  return (
    <motion.div
      key={location.pathname}
      custom={lastDirection.current}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      drag={isSwipeable ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={isSwipeable ? handleDragEnd : undefined}
      className="min-h-[70vh] w-full touch-pan-y"
    >
      {children}
    </motion.div>
  );
}
