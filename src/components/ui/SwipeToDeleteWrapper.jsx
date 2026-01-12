// src/components/ui/SwipeToDeleteWrapper.jsx
import React, { useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import PropTypes from "prop-types";

export default function SwipeToDeleteWrapper({
  children,
  onDelete,
  deleteLabel = "Delete",
  style = {},
}) {
  const x = useMotionValue(0);
  const [deleting, setDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [removed, setRemoved] = useState(false);
  const threshold = -80;
  const [ignoreClick, setIgnoreClick] = useState(false);


  // Motion-based UI states
  const opacity = useTransform(x, [0, threshold], [0, 1]);
  const scale = useTransform(x, [0, threshold], [0.9, 1]);
  const bgOpacity = useTransform(x, [0, threshold], [0, 0.15]);

  /** --- Handle drag gesture end --- */
  const handleDragEnd = (_, info) => {
    const { offset } = info;
    if (offset.x < threshold / 2) {
      animate(x, threshold, { type: "spring", stiffness: 300, damping: 30 });
      setIsOpen(true);
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      setIsOpen(false);
    }
  };

  /** --- Tap toggle (like original) --- */
  const toggleSwipe = () => {
    if (deleting) return;
    if (isOpen) {
      animate(x, 0, { duration: 0.25, ease: "easeOut" });
      setIsOpen(false);
    } else {
      animate(x, threshold, { duration: 0.25, ease: "easeOut" });
      setIsOpen(true);
    }
  };

  /** --- Delete with tactile feedback + animation --- */
  const handleDelete = async () => {
    if (deleting || !onDelete) return;
    setDeleting(true);

    // 🔸 Haptic feedback (if supported)
    if (window.navigator?.vibrate) {
      navigator.vibrate(25); // small tap vibration
    }

    // 🔸 Quick “bounce” animation to simulate tactile feel
    await animate(x, [-20, 300], {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    });

    setRemoved(true);

    try {
      await onDelete(); // your async delete logic
    } finally {
      setDeleting(false);
      setIsOpen(false);
    }
  };

  /** --- Fade out after deletion --- */
  if (removed) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="overflow-hidden"
      />
    );
  }

  const handlePointerDown = (e) => {
    // If pointer starts on interactive element, ignore the upcoming click
    if (e.target.closest("[data-no-swipe]")) {
      setIgnoreClick(true);
    } else {
      setIgnoreClick(false);
    }
  };


  return (
    <div className="relative mb-3 select-none" style={style}>
      {/* Background (delete state color) */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-red-500 dark:bg-red-700"
        style={{ opacity: bgOpacity }}
      />

      {/* Delete button */}
      <motion.div
        className="absolute right-3 top-0 bottom-0 flex items-center z-10"
        style={{ opacity, scale }}
      >
        <button
          type="button"
          aria-label={deleteLabel}
          disabled={deleting}
          onClick={handleDelete}
          className="
            px-4 py-2 rounded-xl text-xs font-semibold text-white uppercase
            bg-red-500 hover:bg-red-600 border border-red-400
            dark:bg-red-700 dark:border-red-500
            shadow-lg transition active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {deleting ? "Deleting…" : deleteLabel}
        </button>
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.2}
        onPointerDown={handlePointerDown}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (ignoreClick) {
            setIgnoreClick(false);
            return;
          }
          toggleSwipe();
        }}
        style={{ x }}
        className={`
          relative z-20 bg-white dark:bg-gray-900
          rounded-2xl shadow-md cursor-pointer
          transition-all duration-300
          ${deleting ? "pointer-events-none opacity-70" : ""}
        `}
      >
        {typeof children === "function"
          ? children({ isSwiping: isOpen })
          : children}
      </motion.div>
    </div>
  );
}

SwipeToDeleteWrapper.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  onDelete: PropTypes.func.isRequired,
  deleteLabel: PropTypes.string,
  style: PropTypes.object,
};
