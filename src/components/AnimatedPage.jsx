// src/components/AnimatedPage.jsx
import React, { useRef, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const SWIPEABLE_PAGES = ["/dashboard", "/insights", "/add", "/settings"];
const SWIPE_OFFSET_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;

export default function AnimatedPage({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const currentIndex = useMemo(
    () => SWIPEABLE_PAGES.indexOf(location.pathname),
    [location.pathname]
  );
  const lastDirection = useRef(0);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  const handleDragEnd = (event, info) => {
    if (currentIndex === -1) return;
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if ((offset > SWIPE_OFFSET_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) && currentIndex > 0) {
      lastDirection.current = -1;
      requestAnimationFrame(() => navigate(SWIPEABLE_PAGES[currentIndex - 1]));
    } else if ((offset < -100 || velocity < -500) && currentIndex < SWIPEABLE_PAGES.length - 1) {
      lastDirection.current = 1;
      requestAnimationFrame(() => navigate(SWIPEABLE_PAGES[currentIndex + 1]));
    }
  };

  const variants = useMemo(
    () => ({
      initial: (direction) => ({
        x: direction > 0 ? 80 : direction < 0 ? -80 : 0,
        opacity: 0,
        filter: "blur(6px)",
      }),
      animate: {
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
        transition: { duration: 0.35, ease: [0.43, 0.13, 0.23, 0.96] },
      },
      exit: (direction) => ({
        x: direction > 0 ? -80 : direction < 0 ? 80 : 0,
        opacity: 0,
        filter: "blur(6px)",
        transition: { duration: 0.25, ease: [0.24, 0.12, 0.12, 0.98] },
      }),
    }),
    []
  );

  const isSwipeable = SWIPEABLE_PAGES.includes(location.pathname);

  return (
    <motion.div
      key={location.pathname}
      custom={lastDirection.current}
      variants={shouldReduceMotion ? {} : variants}
      initial="initial"
      animate="animate"
      exit="exit"
      drag={isSwipeable ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      dragListener={isMobile}
      onDragEnd={isSwipeable ? handleDragEnd : undefined}
      className="min-h-[70vh] w-full touch-pan-y"
    >
      {children}
    </motion.div>
  );
}

AnimatedPage.propTypes = {
  children: PropTypes.node.isRequired,
};
