import React, { useState, useEffect, useRef } from "react";
import i18n from "../i18n";
import regions from "../utils/languages";

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [recent, setRecent] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const dropdownRef = useRef();

  const currentLang = i18n.language || "en";
  const dir = i18n.dir ? i18n.dir(currentLang) : "ltr";
  const isRTL = dir === "rtl";

  const onImgError = (e) => {
    e.target.src = "https://flagcdn.com/unknown.svg";
  };

  // Supported languages from i18n
  const supported = (i18n.options?.supportedLngs || []).filter(
    (lng) => lng !== "cimode"
  );

  // Filter regions by supported languages
  const filteredRegionsBySupport =
    supported.length > 0
      ? regions.map((group) => ({
        ...group,
        items: group.items.filter((lang) => supported.includes(lang.code)),
      }))
      : regions;

  const allItems = filteredRegionsBySupport.flatMap((g) => g.items);

  const selected =
    allItems.find((l) => l.code === currentLang) || {
      code: "en",
      label: "English",
      flag: "https://flagcdn.com/gb.svg",
    };

  // Load recent
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentLangs") || "[]");
    setRecent(saved);
  }, []);

  const updateRecent = (langCode) => {
    const updated = [langCode, ...recent.filter((c) => c !== langCode)].slice(
      0,
      3
    );
    setRecent(updated);
    localStorage.setItem("recentLangs", JSON.stringify(updated));
  };

  // Browser recommendation
  const browserLang = navigator.language?.split("-")[0];
  const recommended = allItems.filter((lang) =>
    lang.code.toLowerCase().startsWith(browserLang?.toLowerCase() || "")
  );

  const toggleRegion = (region) => {
    setCollapsed((prev) => ({ ...prev, [region]: !prev[region] }));
  };

  // Outside click to close
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    updateRecent(lng);
    setIsOpen(false);
  };

  // Filter search groups
  const filteredGroups =
    search.trim().length > 0
      ? [
        {
          region: "Results",
          items: allItems.filter((lang) =>
            lang.label.toLowerCase().includes(search.toLowerCase())
          ),
        },
      ]
      : filteredRegionsBySupport;

  // Build visible list for keyboard navigation
  const visibleItems = [];

  if (search.trim() === "") {
    recent.forEach((code) => {
      const lang = allItems.find((l) => l.code === code);
      if (lang && !visibleItems.some((v) => v.code === lang.code)) {
        visibleItems.push(lang);
      }
    });

    recommended.forEach((lang) => {
      if (!visibleItems.some((v) => v.code === lang.code)) {
        visibleItems.push(lang);
      }
    });
  }

  filteredGroups.forEach((group) => {
    group.items.forEach((lang) => {
      if (!visibleItems.some((v) => v.code === lang.code)) {
        visibleItems.push(lang);
      }
    });
  });

  const codeToIndex = visibleItems.reduce((acc, lang, idx) => {
    acc[lang.code] = idx;
    return acc;
  }, {});

  // Highlight current language on open
  useEffect(() => {
    if (isOpen && visibleItems.length > 0) {
      const currentIndex = codeToIndex[currentLang];
      setHighlightIndex(
        typeof currentIndex === "number" ? currentIndex : 0
      );
    } else {
      setHighlightIndex(-1);
    }
  }, [isOpen, search, currentLang]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (
      !isOpen &&
      (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < 0 ? 0 : (prev + 1) % visibleItems.length
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev <= 0 ? visibleItems.length - 1 : prev - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && visibleItems[highlightIndex]) {
        changeLang(visibleItems[highlightIndex].code);
      }
    }
  };

  const isHighlighted = (code) =>
    highlightIndex >= 0 &&
    visibleItems[highlightIndex] &&
    visibleItems[highlightIndex].code === code;

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block text-left"
      dir={dir}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 px-3 py-1 border border-gray-300 dark:border-gray-700
          bg-white dark:bg-gray-900 rounded-md shadow text-sm
          ${isRTL ? "flex-row-reverse text-right" : "text-left"}
          text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800`}
      >
        <img
          src={selected.flag}
          onError={onImgError}
          className="w-5 h-4 rounded shadow-sm mx-2"
          alt={selected.label}
        />
        <span className="truncate max-w-[90px]">{selected.label}</span>
        <span className="form-arrow flex self-end">▾</span>

      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`
            absolute mt-2 w-full max-w-[90vw] sm:w-80 rounded-md bg-white dark:bg-gray-800 shadow-xl
            ring-1 ring-black ring-opacity-5 animate-scaleIn z-[9999]
            ${isRTL ? "left-0" : "right-0"}
          `}
          style={{
            maxHeight: "80vh",
            overflow: "hidden",
          }}
        >
          {/* Search */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit">
            <input
              type="text"
              placeholder="Search language…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 
                         text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
            />
          </div>

          {/* Scrollable Content */}
          <div
            className="overflow-y-auto p-2 space-y-4 custom-scrollbar dark:custom-scrollbar"
            style={{ maxHeight: "75vh" }}
          >


            {/* RECENT */}
            {recent.length > 0 && search.trim() === "" && (
              <div>
                <div className="text-xs font-bold text-gray-600 dark:text-gray-400 px-2 sticky top-0 bg-inherit py-1">
                  Recently Used
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 min-w-0">
                  {allItems
                    .filter((l) => recent.includes(l.code))
                    .map((lang) => (
                      <button
                        key={`recent-${lang.code}`}
                        onClick={() => changeLang(lang.code)}
                        className={`
                          flex items-center gap-2 px-2 py-1 rounded text-sm 
                          hover:bg-gray-100 dark:hover:bg-gray-700 truncate
                          ${currentLang === lang.code
                            ? "font-semibold text-blue-600 dark:text-blue-400"
                            : ""
                          }
                          ${isHighlighted(lang.code) ? "ring-1 ring-blue-500" : ""}
                        `}
                      >
                        <img
                          src={lang.flag}
                          onError={onImgError}
                          className="w-5 h-4 rounded shadow-sm"
                          alt={lang.label}
                        />
                        <span className="truncate block min-w-0">
                          {lang.label}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* RECOMMENDED */}
            {recommended.length > 0 && search.trim() === "" && (
              <div>
                <div className="text-xs font-bold text-gray-600 dark:text-gray-400 px-2 sticky top-0 bg-inherit py-1">
                  Recommended for You
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 min-w-0">
                  {recommended.map((lang) => (
                    <button
                      key={`rec-${lang.code}`}
                      onClick={() => changeLang(lang.code)}
                      className={`
                        flex items-center gap-2 px-2 py-1 rounded text-sm 
                        hover:bg-gray-100 dark:hover:bg-gray-700 truncate
                        ${currentLang === lang.code
                          ? "font-semibold text-blue-600 dark:text-blue-400"
                          : ""
                        }
                        ${isHighlighted(lang.code) ? "ring-1 ring-blue-500" : ""}
                      `}
                    >
                      <img
                        src={lang.flag}
                        onError={onImgError}
                        className="w-5 h-4 rounded shadow-sm"
                        alt={lang.label}
                      />
                      <span className="truncate block min-w-0">
                        {lang.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* REGIONS */}
            {filteredGroups.map((group) => (
              <div key={group.region}>
                <div
                  className={`
                    flex justify-between items-center text-xs font-bold 
                    text-gray-500 dark:text-gray-300 px-2 cursor-pointer 
                    sticky top-0 bg-inherit py-1
                    ${isRTL ? "flex-row-reverse" : ""}
                  `}
                  onClick={() =>
                    search.trim() === "" && toggleRegion(group.region)
                  }
                >
                  <span>{group.region}</span>
                  {search.trim() === "" && (
                    <span>{collapsed[group.region] ? "+" : "-"}</span>
                  )}
                </div>

                {!collapsed[group.region] && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 min-w-0">
                    {group.items.map((lang) => (
                      <button
                        key={`${group.region}-${lang.code}`}
                        onClick={() => changeLang(lang.code)}
                        className={`
                          flex items-center gap-2 px-2 py-1 rounded text-sm 
                          hover:bg-gray-100 dark:hover:bg-gray-700 truncate
                          ${currentLang === lang.code
                            ? "font-semibold text-blue-600 dark:text-blue-400"
                            : ""
                          }
                          ${isHighlighted(lang.code) ? "ring-1 ring-blue-500" : ""}
                        `}
                      >
                        <img
                          src={lang.flag}
                          onError={onImgError}
                          className="w-5 h-4 rounded shadow-sm"
                          alt={lang.label}
                        />
                        <span className="truncate block min-w-0">
                          {lang.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
