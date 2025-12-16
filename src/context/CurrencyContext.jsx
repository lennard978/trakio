import React, { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("EUR");

  useEffect(() => {
    const saved = localStorage.getItem("selected_currency");
    if (saved) setCurrency(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("selected_currency", currency);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
