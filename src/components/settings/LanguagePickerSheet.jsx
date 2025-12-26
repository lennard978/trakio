import { XMarkIcon, CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import languages from "../../utils/languages";
import React, { useEffect, useMemo, useState } from "react";

export default function LanguagePickerSheet({ onClose }) {
  const { i18n, t } = useTranslation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return languages;
    const q = query.toLowerCase();
    return languages.filter(
      (l) =>
        l.label.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="
  relative w-full
  bg-white dark:bg-gray-900
  rounded-t-[28px]
  shadow-2xl
  flex flex-col
  animate-sheet-in
  mt-2
"
        style={{
          height: "calc(100dvh - env(safe-area-inset-bottom))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t("settings_language_select")}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("settings_language_select_subtitle")}
            </p>
          </div>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl
                          bg-gray-100 dark:bg-gray-800 border
                          border-gray-200 dark:border-gray-700">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search language…"
              className="bg-transparent w-full outline-none text-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {filtered.map((lang) => {
            const active = lang.code === i18n.language;

            return (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  onClose();
                }}
                className={`
                  w-full flex items-center justify-between
                  px-4 py-3 rounded-2xl mb-2 border transition
                  ${active
                    ? "bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }
                `}
              >
                <div className="flex gap-3 items-center">
                  <span className="text-lg">{lang.emoji}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium">{lang.label}</div>
                    <div className="text-xs text-gray-500">{lang.english}</div>
                  </div>
                </div>

                {active && (
                  <CheckIcon className="w-6 h-6 text-orange-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
