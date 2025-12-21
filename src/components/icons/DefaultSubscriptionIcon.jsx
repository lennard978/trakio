// src/components/icons/DefaultSubscriptionIcon.jsx
import React from "react";

export default function DefaultSubscriptionIcon({ size = 28 }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
      style={{ width: size, height: size }}
      aria-label="Subscription"
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.6}
        height={size * 0.6}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="20" height="20" rx="2" />
        <path d="M3 10h18" />
      </svg>
    </div>
  );
}
