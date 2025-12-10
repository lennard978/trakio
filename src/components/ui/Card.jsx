// src/components/ui/Card.jsx
import React from "react";

export default function Card({ children, className = "" }) {
  return (
    <div
      className={`
        p-5 rounded-2xl
        bg-white/90 dark:bg-black/30
        border border-gray-300/60 dark:border-white/10
        backdrop-blur-xl
        shadow-[0_8px_25px_rgba(0,0,0,0.08)]
        dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]
        transition-all
        ${className}
      `}
    >
      {children}
    </div>
  );
}
