// src/components/LanguageSwitcher.jsx
import React, { useState, useRef, useEffect } from "react";
import i18n from "../i18n";
import regions from "../utils/languages";

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  const currentLang = i18n.language || "en";

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter regions by supported
  const supported = (i18n.options?.supportedLngs || []).filter(
    (lng) => lng !== "cimode"
  );

  const filteredRegions = regions.map((group) => ({
    ...group,
    items: group.items.filter((lang) => supported.includes(lang.code)),
  }));

  return (
    <div className="relative" ref={dropdownRef}>
      {/* -------- Toggle Button -------- */}
      <button
        onClick={toggleDropdown}
        className="
          px-3 h-10 min-w-[48px]
          rounded-xl
          bg-white/20 dark:bg-black/25
          backdrop-blur-xl
          border border-white/30 dark:border-white/10
          shadow-[0_8px_20px_rgba(0,0,0,0.25)]
          transition active:scale-95
          flex items-center justify-center gap-2
        "
      >
        <span className="text-sm font-medium uppercase">{currentLang}</span>
      </button>

      {/* -------- Dropdown Panel -------- */}
      {isOpen && (
        <div
          className="
            absolute top-14 right-0
            z-50
            w-[300px]
            p-4
            rounded-2xl

            bg-white/15 dark:bg-black/30
            backdrop-blur-2xl
            border border-white/25 dark:border-white/10
            shadow-[0_12px_40px_rgba(0,0,0,0.35)]

            grid grid-cols-2 gap-4
          "
        >
          {filteredRegions.map((group, gi) =>
            group.items.map((lang) => {
              const active = lang.code === currentLang;

              return (
                <button
                  key={lang.code + gi}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`
                    flex flex-col items-center justify-center
                    w-full h-20
                    rounded-xl
                    transition

                    ${active
                      ? "bg-white/30 dark:bg-white/10 border border-blue-400/40 shadow-[0_0_15px_rgba(37,99,235,0.45)]"
                      : "bg-white/10 dark:bg-white/5 border border-white/15 hover:bg-white/20 dark:hover:bg-white/10"
                    }
                  `}
                >
                  {/* Flag */}
                  <img
                    src={lang.flag}
                    onError={(e) => (e.target.src = "https://flagcdn.com/unknown.svg")}
                    className="w-8 h-8 rounded-md"
                    alt={lang.label}
                  />

                  {/* Label */}
                  <span
                    className={`
                      text-xs font-medium mt-1
                      ${active ? "text-blue-400" : "text-gray-200"}
                    `}
                  >
                    {lang.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
