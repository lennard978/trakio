// src/utils/fx.js

// Simple free API for mock rates (frontend-only)
export async function fetchRates(base = "EUR") {
  try {
    const res = await fetch(
      `https://api.exchangerate.host/latest?base=${base}`
    );

    const data = await res.json();

    if (data && data.rates) {
      return data.rates;
    }

    return null;
  } catch (err) {
    console.error("FX fetch error:", err);
    return null;
  }
}

// Convert between currencies
export function convert(amount, fromCurrency, toCurrency, rates) {
  if (!rates) return amount;
  if (fromCurrency === toCurrency) return amount;

  const rateFrom = rates[fromCurrency];
  const rateTo = rates[toCurrency];

  if (!rateFrom || !rateTo) return amount;

  // Convert using direct rate:
  // amount (FROM) → EUR → TO
  const eurValue = amount / rateFrom;
  return eurValue * rateTo;
}

