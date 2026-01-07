// src/context/ThemeContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import PropTypes from "prop-types";

const ThemeContext = createContext(null);

const STORAGE_KEY = "theme";
const DEFAULT_THEME = "light";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPreferredTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      return stored;
    }
  } catch {
    /* ignore */
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getPreferredTheme);

  /* ---------- Apply theme to <html> ---------- */
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore storage failures */
    }
  }, [theme]);

  /* ---------- Toggle ---------- */
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/* ------------------------------------------------------------------ */
/* Consumer hook                                                       */
/* ------------------------------------------------------------------ */

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    // SAFE fallback instead of throwing (prevents white screens)
    return {
      theme: DEFAULT_THEME,
      toggleTheme: () => { },
    };
  }

  return ctx;
}
