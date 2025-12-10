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
    <div className="relative mb-6">
      {/* DELETE BUTTON */}
      <div className="absolute inset-y-0 right-3 flex items-center">
        <button
          onClick={onDelete}
          className="
            px-4 py-2 rounded-xl text-xs font-semibold text-white
            backdrop-blur-md active:scale-95 transition border uppercase

            bg-red-500/85 border-red-400/70
            shadow-[0_0_18px_rgba(255,70,70,0.55)]

            dark:bg-red-600/90 dark:border-red-400/40
            dark:shadow-[0_0_22px_rgba(255,50,50,0.65)]
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
