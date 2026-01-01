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
  const [deleting, setDeleting] = useState(false);
  const openedRef = useRef(false);

  const MAX_SWIPE = -90;

  const resetSwipe = () => {
    setTranslateX(0);
    openedRef.current = false;
  };

  const toggleSwipe = () => {
    if (deleting) return;

    if (openedRef.current) {
      resetSwipe();
    } else {
      setTranslateX(MAX_SWIPE);
      openedRef.current = true;
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    if (typeof onDelete !== "function") {
      console.warn("SwipeToDeleteWrapper: onDelete is not a function.");
      return;
    }

    try {
      setDeleting(true);
      await onDelete();          // ✅ allow async delete
    } finally {
      setDeleting(false);
      resetSwipe();              // ✅ always reset UI
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
          pointerEvents:
            Math.abs(translateX) > 10 && !deleting ? "auto" : "none",
        }}
      >
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="
            px-4 py-2 rounded-xl text-xs font-semibold text-white
            uppercase transition border
            bg-red-500/80 border-red-400/70
            dark:bg-red-600/80 dark:border-red-400/50
            backdrop-blur-xl backdrop-saturate-150
            shadow-[0_0_10px_rgba(255,70,70,0.25)]
            dark:shadow-[0_0_14px_rgba(255,50,50,0.3)]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {deleting ? "Deleting…" : deleteLabel}
        </button>
      </motion.div>

      {/* Tap-to-toggle content */}
      <div
        style={{
          transform: `translateX(${translateX}px)`,
          transition: "transform 0.25s ease-out",
          cursor: deleting ? "default" : "pointer",
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
