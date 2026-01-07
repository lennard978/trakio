/* eslint-disable react/prop-types */

import React from "react";
import { ThemeProvider } from "./ThemeContext";
import { ToastProvider } from "./ToastContext";
import { AuthProvider } from "../hooks/useAuth";
import { PremiumProvider } from "./PremiumContext";
import { CurrencyProvider } from "./CurrencyContext";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PremiumProvider>
            <CurrencyProvider>{children}</CurrencyProvider>
          </PremiumProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
