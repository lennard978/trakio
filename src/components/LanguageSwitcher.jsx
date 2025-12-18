import React, { useState, useRef, useEffect } from "react";
import i18n from "../i18n";
import regions from "../utils/languages";

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = i18n.language || "en";

  const toggle = () => setOpen(v => !v);

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={toggle}
        className="
          w-10 h-10 rounded-2xl flex items-center justify-center
          bg-white/20 dark:bg-black/20
          backdrop-blur-xl border border-white/30 dark:border-white/10
          shadow-[0_8px_20px_rgba(0,0,0,0.25)]
          transition-all active:scale-95
          text-xs font-semibold
        "
      >
        {currentLang.toUpperCase()}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 w-56 max-h-64 overflow-auto
            p-3 rounded-2xl
            bg-white dark:bg-black
            backdrop-blur-2xl
            border border-white/20 dark:border-white/10
            shadow-[0_12px_35px_rgba(0,0,0,0.35)]
          "
        >
          <div className="grid grid-cols-2 gap-2">
            {regions
              .flatMap(r => r.items)
              .filter(l => l.code !== "cimode")
              .map(lng => (
                <button
                  key={lng.code}
                  onClick={() => changeLang(lng.code)}
                  className={`
                    w-full px-2 py-2 rounded-xl flex flex-col items-center gap-1
                    text-xs font-medium transition-all
                    bg-white/40 dark:bg-white/10
                    border border-white/20 dark:border-white/5
                    hover:bg-white/60 dark:hover:bg-white/20
                    ${lng.code === currentLang ? "ring-2 ring-blue-500/50" : ""}
                  `}
                >
                  <img
                    src={lng.flag}
                    alt={lng.label}
                    className="w-6 h-4 rounded shadow"
                    loading="lazy"
                  />
                  <span className="text-[10px] truncate">
                    {lng.label}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
