// src/context/CurrencyContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import PropTypes from "prop-types";

const CurrencyContext = createContext(null);

const STORAGE_KEY = "selected_currency";
const DEFAULT_CURRENCY = "EUR";

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  /* ---------- Load from localStorage ---------- */
  useEffect(() => {
    try {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;

      if (saved) {
        setCurrency(saved);
      }
    } catch {
      // fail silently (private mode, blocked storage, etc.)
    }
  }, []);

  /* ---------- Persist to localStorage ---------- */
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, currency);
      }
    } catch {
      // fail silently
    }
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

CurrencyProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/* ------------------------------------------------------------------ */
/* Consumer hook                                                       */
/* ------------------------------------------------------------------ */

export function useCurrency() {
  const ctx = useContext(CurrencyContext);

  if (!ctx) {
    // Safe fallback to prevent crashes
    return {
      currency: DEFAULT_CURRENCY,
      setCurrency: () => { },
    };
  }

  return ctx;
}
