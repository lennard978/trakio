import React from "react";
import { ChevronRightIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

/**
 * Reusable row for settings lists
 * - icon: JSX icon on the left
 * - title: main label
 * - description: secondary text
 * - onClick OR href (external)
 * - premium: shows crown badge
 */
export default function SettingsRow({
  icon,
  title,
  description,
  onClick,
  href,
  premium = false,
}) {
  const Wrapper = onClick ? "button" : "a";

  return (
    <Wrapper
      onClick={onClick}
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      className="
        w-full flex items-center gap-4 px-4 py-4
        hover:bg-gray-50 dark:hover:bg-gray-800/50
        transition rounded-xl
      "
    >
      {/* LEFT ICON */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800">
        {icon}
        {premium && (
          <span className="absolute -top-1 -left-1 text-xs">👑</span>
        )}
      </div>

      {/* TEXT */}
      <div className="flex-1 text-left">
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {title}
        </div>
        {description && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </div>
        )}
      </div>

      {/* RIGHT ICON */}
      {href ? (
        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
      )}
    </Wrapper>
  );
}
