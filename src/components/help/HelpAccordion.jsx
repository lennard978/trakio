import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import React from "react";

export default function HelpAccordion({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="
        w-full text-left
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        rounded-2xl px-4 py-4
        transition
      "
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {question}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 transition ${open ? "rotate-180" : ""
            }`}
        />
      </div>

      {open && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {answer}
        </p>
      )}
    </button>
  );
}
