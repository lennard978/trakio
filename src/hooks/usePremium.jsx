// src/hooks/usePremium.js
import { usePremiumContext } from "../context/PremiumContext";

export function usePremium() {
  return usePremiumContext();
}
