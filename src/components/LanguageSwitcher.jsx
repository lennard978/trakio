import React, { useState, useRef, useEffect } from "react";
import i18n from "../i18n";
import languages from "../utils/languages";

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentLang = i18n.language || "en";
  const active =
    languages.find((l) => l.code === currentLang) || languages[0];

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-10 h-10 rounded-2xl flex items-center justify-center
             bg-white/20 dark:bg-black/20 backdrop-blur-xl
             border border-white/30 dark:border-white/10
             shadow-[0_8px_20px_rgba(0,0,0,0.25)]
             transition-all active:scale-95"
        title={active.label}
      >
        <span className="text-xl">{active.emoji}</span>
      </button>


      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 w-64 max-h-72 overflow-auto
            p-3 rounded-2xl
            bg-white dark:bg-black
            border border-white/20 dark:border-white/10
            shadow-[0_12px_35px_rgba(0,0,0,0.35)]
            z-50
          "
        >
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lng) => (
              <button
                key={lng.code}
                onClick={() => {
                  i18n.changeLanguage(lng.code);
                  setOpen(false);
                }}
                className={`
                  w-full px-2 py-2 rounded-xl
                  flex flex-col items-center gap-1
                  text-xs transition-all
                  bg-white/40 dark:bg-white/10
                  hover:bg-white/60 dark:hover:bg-white/20
                  ${lng.code === currentLang
                    ? "ring-2 ring-blue-500/50"
                    : ""
                  }
                `}
              >
                <span className="text-xl">{lng.emoji}</span>
                <span className="text-[10px] text-gray-900 dark:text-gray-300 text-center">
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
