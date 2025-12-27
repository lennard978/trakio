// src/components/ui/SwipeToDeleteWrapper.jsx
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function SwipeToDeleteWrapper({
  children,
  onDelete,
  deleteLabel = "Delete",
  style = {},
}) {
  const [translateX, setTranslateX] = useState(0);
  const openedRef = useRef(false);

  const MAX_SWIPE = -90;

  const toggleSwipe = () => {
    if (openedRef.current) {
      setTranslateX(0);
      openedRef.current = false;
    } else {
      setTranslateX(MAX_SWIPE);
      openedRef.current = true;
    }
  };

  return (
    <div className="relative mb-3" style={style}>
      {/* Delete button */}
      <motion.div
        className="absolute inset-y-0 right-3 flex items-center"
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{
          opacity: Math.abs(translateX) > 10 ? 1 : 0,
          scale: Math.abs(translateX) > 10 ? 1 : 0.8,
          x: Math.abs(translateX) > 10 ? 0 : 20,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          bounce: 0.4,
        }}
        style={{
          pointerEvents: Math.abs(translateX) > 10 ? "auto" : "none",
        }}
      >
        <button
          onClick={() => {
            if (typeof onDelete === "function") onDelete();
            else console.warn("SwipeToDeleteWrapper: onDelete is not a function.");
          }}
          className="
      px-4 py-2 rounded-xl text-xs font-semibold text-white
      uppercase active:scale-95 transition border
      bg-red-500/80 border-red-400/70
      dark:bg-red-600/80 dark:border-red-400/50
      backdrop-blur-xl backdrop-saturate-150
      shadow-[0_0_10px_rgba(255,70,70,0.25)]
      dark:shadow-[0_0_14px_rgba(255,50,50,0.3)]
    "
        >
          {deleteLabel}
        </button>
      </motion.div>


      {/* Tap-to-toggle content */}
      <div
        style={{
          transform: `translateX(${translateX}px)`,
          transition: "transform 0.25s ease-out",
          cursor: "pointer",
        }}
        onClick={toggleSwipe}
      >
        {typeof children === "function"
          ? children({ isSwiping: Math.abs(translateX) > 4 })
          : children}
      </div>
    </div>
  );
}
