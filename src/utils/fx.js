// src/utils/fx.js

export async function fetchRates(base = "EUR") {
  try {
    const res = await fetch(
      `https://api.exchangerate.host/latest?base=${base}`
    );
    const data = await res.json();
    return data?.rates || null;
  } catch (err) {
    console.error("FX fetch error:", err);
    return null;
  }
}

// Convert amount FROM → TO using EUR as normalization base
export function convert(amount, fromCurrency, toCurrency, rates) {
  if (!rates || fromCurrency === toCurrency) return amount;

  const eurValue =
    fromCurrency === "EUR"
      ? amount
      : amount / rates[fromCurrency];

  return toCurrency === "EUR"
    ? eurValue
    : eurValue * rates[toCurrency];
}
