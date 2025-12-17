// utils/currency.js

/**
 * Converts an amount from one currency to another using provided rates.
 *
 * @param {number} amount - The amount to convert
 * @param {string} from - Source currency code (e.g., "USD")
 * @param {string} to - Target currency code (e.g., "EUR")
 * @param {object} rates - Object containing exchange rates (e.g., { USD: 1, EUR: 0.85 })
 * @returns {number} - Converted amount
 */
export function convert(amount, from, to, rates) {
  if (!rates || !rates[from] || !rates[to]) return amount;
  const baseToTarget = rates[to] / rates[from];
  return amount * baseToTarget;
}
