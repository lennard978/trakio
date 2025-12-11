// src/components/ui/SwipeToDeleteWrapper.jsx
import React, { useRef, useState } from "react";

export default function SwipeToDeleteWrapper({
  children,
  onDelete,
  deleteLabel = "Delete",
}) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const openedRef = useRef(false);

  const MAX_SWIPE = -90;
  const THRESHOLD = -45;

  const handleTouchStart = (e) => {
    if (!e.touches?.length) return;
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches?.length) return;
    const dx = e.touches[0].clientX - startXRef.current;

    if (dx < 0) {
      const base = openedRef.current ? -Math.abs(dx) - 40 : dx;
      setTranslateX(Math.max(base, MAX_SWIPE));
    } else setTranslateX(0);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateX <= THRESHOLD) {
      setTranslateX(MAX_SWIPE);
      openedRef.current = true;
    } else {
      setTranslateX(0);
      openedRef.current = false;
    }
  };

  const resetSwipe = () => {
    if (openedRef.current) {
      setTranslateX(0);
      openedRef.current = false;
    }
  };

  return (
    <div className="relative mb-3">
      {/* DELETE BUTTON */}
      <div
        className={`
    absolute inset-y-0 right-3 flex items-center
    transition-all duration-300 ease-in-out
  `}
        style={{
          opacity: Math.abs(translateX) > 10 ? 1 : 0.2, // faint initially
          transform: "scale(0.95)",                     // slight size reduction
        }}
      >
        <button
          onClick={onDelete}
          className="
      px-4 py-2 rounded-xl text-xs font-semibold text-white
      uppercase active:scale-95 transition border
      bg-red-500/80 border-red-400/70
      dark:bg-red-600/80 dark:border-red-400/50
      transition: all 0.3s ease-in-out;
      backdrop-blur-xl backdrop-saturate-150
      shadow-[0_0_10px_rgba(255,70,70,0.25)]
      dark:shadow-[0_0_14px_rgba(255,50,50,0.3)]
    "
        >
          {deleteLabel}
        </button>
      </div>



      <div
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform .25s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={resetSwipe}
      >
        {children}
      </div>
    </div>
  );
}
