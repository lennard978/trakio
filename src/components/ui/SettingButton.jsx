// src/components/ui/SettingButton.jsx
import React from "react";

export default function SettingButton({
  children,
  variant = "primary",
  onClick,
  type = "button",
  className = "",
}) {
  const styles = {
    primary: `
      bg-blue-600 text-white
      hover:bg-blue-700
      border border-blue-400/40
      shadow-[0_4px_12px_rgba(0,0,0,0.15)]
    `,
    success: `
      bg-green-600 text-white
      hover:bg-green-700
      border border-green-400/40
      shadow-[0_4px_12px_rgba(0,0,0,0.15)]
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
      border border-red-400/50
      shadow-[0_4px_12px_rgba(0,0,0,0.25)]
    `,
    neutral: `
      bg-gray-200 dark:bg-gray-700
      text-gray-900 dark:text-white
      hover:bg-gray-300 dark:hover:bg-gray-600
      border border-gray-300 dark:border-gray-600
      shadow-[0_2px_8px_rgba(0,0,0,0.08)]
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        w-full py-2 rounded-xl font-medium transition active:scale-95
        backdrop-blur-md 
        ${styles[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
