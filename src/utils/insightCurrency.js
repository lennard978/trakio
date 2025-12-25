// src/utils/currency.js
export function convert(amount, from, to, rates) {
  if (!rates || !rates[from] || !rates[to]) return amount;
  const base = amount / rates[from];
  return base * rates[to];
}
